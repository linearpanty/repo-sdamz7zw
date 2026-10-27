import { WORDS } from '../data/words'
import {
  addDays,
  blankProgress,
  dateKey,
  PROGRESS_KEY,
  type Memory,
  type Progress,
} from './model'
import { ensureToday, sanitizeProgress } from './queue'

const LEGACY_KEY = 'clawwords.progress.v2'

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

/** Map a previous save into today's queue without copying any of its labels. */
export function migrateLegacy(raw: unknown, today: string): Progress | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as {
    learnedIds?: unknown
    dueIds?: unknown
    todayKey?: unknown
    todayDone?: unknown
  }
  const learned = Array.isArray(row.learnedIds)
    ? row.learnedIds.filter((id): id is string => typeof id === 'string')
    : []
  const due = Array.isArray(row.dueIds)
    ? row.dueIds.filter((id): id is string => typeof id === 'string')
    : []
  if (learned.length === 0 && due.length === 0 && row.todayDone !== true) return null

  const known = new Set(WORDS.map((w) => w.id))
  const memory: Record<string, Memory> = {}
  const tomorrow = addDays(today, 1)
  for (const id of learned) {
    if (!known.has(id)) continue
    memory[id] = { interval: 3, next: tomorrow, misses: 0 }
  }
  for (const id of due) {
    if (!known.has(id)) continue
    memory[id] = { interval: 1, next: today, misses: 1 }
  }

  const base = blankProgress(today)
  base.memory = memory
  if (row.todayKey === today && row.todayDone === true) {
    return { ...base, finished: true }
  }
  return ensureToday(base, today)
}

export function loadProgress(today = dateKey()): Progress {
  const current = sanitizeProgress(readJson(PROGRESS_KEY), today)
  if (current) return ensureToday(current, today)
  const legacy = migrateLegacy(readJson(LEGACY_KEY), today)
  if (legacy) return legacy
  return ensureToday(blankProgress(today), today)
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}
