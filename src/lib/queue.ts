import { WORDS } from '../data/words'
import {
  addDays,
  DAILY_COUNT,
  type Memory,
  type Progress,
  type QueueCard,
} from './model'

const wordIds = new Set(WORDS.map((w) => w.id))

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return DAILY_COUNT
  return Math.min(20, Math.max(1, Math.round(n)))
}

function cleanMemory(raw: unknown): Record<string, Memory> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, Memory> = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!wordIds.has(id) || !value || typeof value !== 'object') continue
    const row = value as Partial<Memory>
    if (typeof row.next !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.next)) continue
    const interval = typeof row.interval === 'number' && row.interval >= 0 ? row.interval : 1
    const misses = typeof row.misses === 'number' && row.misses >= 0 ? row.misses : 0
    out[id] = { interval, next: row.next, misses }
  }
  return out
}

function cleanQueue(raw: unknown): QueueCard[] {
  if (!Array.isArray(raw)) return []
  const cards: QueueCard[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const card = item as Partial<QueueCard>
    if (typeof card.id !== 'string' || !wordIds.has(card.id)) continue
    if (card.mode !== 'learn' && card.mode !== 'recall') continue
    cards.push({ id: card.id, mode: card.mode })
  }
  return cards
}

export function sanitizeProgress(raw: unknown, today: string): Progress | null {
  if (!raw || typeof raw !== 'object') return null
  const row = raw as Partial<Progress>
  if (typeof row.todayKey !== 'string' || !Array.isArray(row.queue)) return null
  return {
    dailyCount: clampCount(typeof row.dailyCount === 'number' ? row.dailyCount : DAILY_COUNT),
    memory: cleanMemory(row.memory),
    todayKey: row.todayKey || today,
    queue: cleanQueue(row.queue),
    doneCount: typeof row.doneCount === 'number' && row.doneCount >= 0 ? row.doneCount : 0,
    started: Boolean(row.started),
    finished: Boolean(row.finished),
    replayed: Array.isArray(row.replayed)
      ? row.replayed.filter((id): id is string => typeof id === 'string' && wordIds.has(id))
      : [],
  }
}

/**
 * Due cards first (caption hidden), then unseen cards, capped at the daily count.
 * Each group follows the lexicon, which is frequency order (common first).
 * See WORD_ORDER.md. The order is fixed; it is not reshuffled per day.
 */
export function selectQueue(
  memory: Record<string, Memory>,
  count: number,
  today: string,
): QueueCard[] {
  const due = WORDS.filter((w) => {
    const row = memory[w.id]
    return !!row && row.next <= today
  })
  const fresh = WORDS.filter((w) => !memory[w.id])
  const cards: QueueCard[] = []
  for (const w of due) {
    if (cards.length >= count) break
    cards.push({ id: w.id, mode: 'recall' })
  }
  for (const w of fresh) {
    if (cards.length >= count) break
    cards.push({ id: w.id, mode: 'learn' })
  }
  return cards
}

export function ensureToday(progress: Progress, today: string): Progress {
  const sameDay = progress.todayKey === today
  if (sameDay && progress.finished) return progress

  if (sameDay && progress.queue.length === 0 && progress.doneCount > 0) {
    return { ...progress, finished: true }
  }

  if (sameDay && progress.queue.length > 0) return progress

  const rolled: Progress = sameDay
    ? progress
    : {
        ...progress,
        todayKey: today,
        queue: [],
        doneCount: 0,
        started: false,
        finished: false,
        replayed: [],
      }

  const queue = selectQueue(rolled.memory, rolled.dailyCount, today)
  if (queue.length === 0) {
    return { ...rolled, queue, finished: true, started: false, doneCount: 0 }
  }
  return { ...rolled, queue, finished: false }
}

/**
 * The current card was spelled correctly.
 * A miss schedules one quiet replay later in today's queue, then waits until a later day.
 */
export function settleCard(progress: Progress, hadMiss: boolean, today = progress.todayKey): Progress {
  const current = progress.queue[0]
  if (!current) return progress

  const rest = progress.queue.slice(1)
  const prev = progress.memory[current.id] ?? { interval: 0, next: today, misses: 0 }
  const memory = { ...progress.memory }
  const replayed = [...progress.replayed]
  let queue = rest

  if (hadMiss) {
    memory[current.id] = {
      interval: 1,
      next: addDays(today, 1),
      misses: prev.misses + 1,
    }
    const alreadyQueued = queue.some((card) => card.id === current.id)
    if (!alreadyQueued && !replayed.includes(current.id)) {
      queue = [...queue, { id: current.id, mode: 'recall' }]
      replayed.push(current.id)
    }
  } else {
    const interval = prev.interval <= 0 ? 1 : Math.min(21, prev.interval * 2)
    memory[current.id] = {
      interval,
      next: addDays(today, interval),
      misses: prev.misses,
    }
  }

  return {
    ...progress,
    memory,
    queue,
    replayed,
    doneCount: progress.doneCount + 1,
    started: true,
    finished: queue.length === 0,
  }
}
