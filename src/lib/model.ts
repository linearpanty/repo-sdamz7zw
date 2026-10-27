export type CardMode = 'learn' | 'recall'

export type QueueCard = {
  id: string
  mode: CardMode
}

/** Internal spacing record. Never rendered. */
export type Memory = {
  interval: number
  next: string
  misses: number
}

export type Progress = {
  dailyCount: number
  memory: Record<string, Memory>
  todayKey: string
  queue: QueueCard[]
  doneCount: number
  started: boolean
  finished: boolean
  replayed: string[]
}

export const PROGRESS_KEY = 'clawwords.progress.v3'
export const DAILY_COUNT = 5

export function dateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  dt.setDate(dt.getDate() + days)
  return dateKey(dt)
}

export function blankProgress(today = dateKey()): Progress {
  return {
    dailyCount: DAILY_COUNT,
    memory: {},
    todayKey: today,
    queue: [],
    doneCount: 0,
    started: false,
    finished: false,
    replayed: [],
  }
}
