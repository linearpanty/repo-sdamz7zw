export type Settings = {
  dailyNewCount: number
}

export type Progress = {
  userId: string
  tipSeen: boolean
  settings: Settings
  learnedIds: string[]
  dueIds: string[] // fake FSRS stubs
  answers: { wordId: string; type: string; ok: boolean; at: string }[]
  todayKey: string
  todayNewIds: string[]
  todayDone: boolean
  extraRounds: number
}

const KEY = 'clawwords.progress.v2'

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'u-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function defaultProgress(): Progress {
  return {
    userId: uuid(),
    tipSeen: true,
    settings: { dailyNewCount: 10 },
    learnedIds: [],
    dueIds: [],
    answers: [],
    todayKey: todayKey(),
    todayNewIds: [],
    todayDone: false,
    extraRounds: 0,
  }
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultProgress()
    const p = JSON.parse(raw) as Progress
    if (!p.userId) p.userId = uuid()
    p.tipSeen = true
    if (!p.settings) p.settings = { dailyNewCount: 10 }
    if (!Array.isArray(p.learnedIds)) p.learnedIds = []
    if (!Array.isArray(p.dueIds)) p.dueIds = []
    if (!Array.isArray(p.answers)) p.answers = []
    if (p.todayKey !== todayKey()) {
      p.todayKey = todayKey()
      p.todayNewIds = []
      p.todayDone = false
      p.extraRounds = 0
    }
    return p
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function exportProgress(p: Progress): string {
  return JSON.stringify(p, null, 2)
}

export function clearProgress(): Progress {
  localStorage.removeItem(KEY)
  return defaultProgress()
}
