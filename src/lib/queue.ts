import { WORDS } from '../data/words'
import {
  addDays,
  DAILY_COUNT,
  type Grade,
  type Memory,
  type Progress,
  type QueueCard,
} from './model'

const wordIds = new Set(WORDS.map((w) => w.id))
const wordOrder = new Map(WORDS.map((w, idx) => [w.id, idx]))

/**
 * DSR (Difficulty-Stability-Retrievability) Spaced Repetition Parameters.
 * Power-law forgetting curve: R(t, S) = (1 + FACTOR * t / S) ^ DECAY,
 * calibrated so R(S, S) = REQUEST_RETENTION = 0.90.
 */
export const REQUEST_RETENTION = 0.9
export const MAX_INTERVAL = 365
export const MASTERED_INTERVAL = 21
const DECAY = -0.5
const FACTOR = 19 / 81

const W = [
  0.40255, // w0: initial S (Again)
  1.18385, // w1: initial S (Hard)
  3.173, // w2: initial S (Good)
  15.69105, // w3: initial S (Easy)
  7.1949, // w4: initial D base
  0.5345, // w5: initial D grade exponent
  1.4604, // w6: D delta per grade
  0.0046, // w7: D mean reversion weight
  1.54575, // w8: recall S growth exponent
  0.1192, // w9: recall S saturation power
  1.01925, // w10: recall R gain exponent
  1.9395, // w11: lapse S base
  0.11, // w12: lapse D power
  0.29605, // w13: lapse S power
  2.2698, // w14: lapse R exponent
  0.2315, // w15: Hard penalty on recall S growth
  2.9898, // w16: Easy bonus on recall S growth
] as const

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

function round2(val: number): number {
  return Math.round(val * 100) / 100
}

export function daysBetween(fromKey: string, toKey: string): number {
  const [y1, m1, d1] = fromKey.split('-').map(Number)
  const [y2, m2, d2] = toKey.split('-').map(Number)
  const utc1 = Date.UTC(y1 || 1970, (m1 || 1) - 1, d1 || 1)
  const utc2 = Date.UTC(y2 || 1970, (m2 || 1) - 1, d2 || 1)
  return Math.round((utc2 - utc1) / 86_400_000)
}

export function retrievability(elapsedDays: number, stability: number): number {
  const t = Math.max(0, elapsedDays)
  const s = Math.max(0.1, stability)
  return Math.pow(1 + (FACTOR * t) / s, DECAY)
}

export function initDifficulty(grade: Grade): number {
  return round2(clamp(W[4] - Math.exp(W[5] * (grade - 1)) + 1, 1, 10))
}

export function nextDifficulty(d: number, grade: Grade): number {
  const delta = -W[6] * (grade - 3)
  const damped = d + (delta * (10 - d)) / 9
  const d0Good = W[4] - Math.exp(W[5] * 2) + 1
  const reverted = W[7] * d0Good + (1 - W[7]) * damped
  return round2(clamp(reverted, 1, 10))
}

export function nextRecallStability(
  d: number,
  s: number,
  r: number,
  grade: 2 | 3 | 4,
): number {
  const hardPenalty = grade === 2 ? W[15] : 1
  const easyBonus = grade === 4 ? W[16] : 1
  const inc =
    Math.exp(W[8]) *
    (11 - d) *
    Math.pow(Math.max(0.1, s), -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus
  return round2(clamp(s * (1 + inc), 0.4, MAX_INTERVAL))
}

export function nextForgetStability(d: number, s: number, r: number): number {
  const raw =
    W[11] *
    Math.pow(clamp(d, 1, 10), -W[12]) *
    (Math.pow(Math.max(0.1, s) + 1, W[13]) - 1) *
    Math.exp(W[14] * (1 - r))
  return round2(clamp(raw, 0.4, Math.max(0.4, s)))
}

export function intervalFromStability(s: number): number {
  const raw = (s / FACTOR) * (Math.pow(REQUEST_RETENTION, 1 / DECAY) - 1)
  return clamp(Math.round(raw), 1, MAX_INTERVAL)
}

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
    const entry: Memory = { interval, next: row.next, misses }
    if (typeof row.stability === 'number' && row.stability > 0) {
      entry.stability = round2(clamp(row.stability, 0.1, MAX_INTERVAL))
    }
    if (typeof row.difficulty === 'number' && row.difficulty >= 1 && row.difficulty <= 10) {
      entry.difficulty = round2(row.difficulty)
    }
    if (typeof row.lastReview === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(row.lastReview)) {
      entry.lastReview = row.lastReview
    }
    if (typeof row.reps === 'number' && row.reps >= 0) {
      entry.reps = Math.round(row.reps)
    }
    out[id] = entry
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
    doneIds: Array.isArray(row.doneIds)
      ? row.doneIds.filter((id): id is string => typeof id === 'string' && wordIds.has(id))
      : [],
  }
}

function cardRetrievability(row: Memory, today: string): number {
  const s = row.stability ?? Math.max(1, row.interval || 1)
  const last = row.lastReview ?? addDays(row.next, -Math.max(1, row.interval || 1))
  const elapsed = Math.max(0, daysBetween(last, today))
  return retrievability(elapsed, s)
}

/**
 * Due cards first (caption hidden), then unseen cards, capped at the daily count.
 * When due backlog exceeds `count`, prioritizes the most fragile memories (lowest retrievability R)
 * and presents selected due cards in lexicon frequency order.
 */
export function selectQueue(
  memory: Record<string, Memory>,
  count: number,
  today: string,
): QueueCard[] {
  let due = WORDS.filter((w) => {
    const row = memory[w.id]
    return !!row && row.next <= today
  })
  if (due.length > count) {
    due = [...due]
      .sort((a, b) => {
        const ra = cardRetrievability(memory[a.id], today)
        const rb = cardRetrievability(memory[b.id], today)
        if (Math.abs(ra - rb) > 1e-6) return ra - rb
        return (wordOrder.get(a.id) ?? 0) - (wordOrder.get(b.id) ?? 0)
      })
      .slice(0, count)
      .sort((a, b) => (wordOrder.get(a.id) ?? 0) - (wordOrder.get(b.id) ?? 0))
  }
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
        doneIds: [],
      }

  const queue = selectQueue(rolled.memory, rolled.dailyCount, today)
  if (queue.length === 0) {
    return { ...rolled, queue, finished: true, started: false, doneCount: 0 }
  }
  return { ...rolled, queue, finished: false }
}

/** Next interval for a clean Good(3) recall from a baseline stability `prev`. */
export function nextInterval(prev: number, d = initDifficulty(3)): number {
  if (!(prev > 0)) return 1
  const s = nextRecallStability(d, prev, REQUEST_RETENTION, 3)
  return clamp(Math.max(prev + 1, intervalFromStability(s)), 1, MAX_INTERVAL)
}

/**
 * Settle the current card using the DSR (Difficulty-Stability-Retrievability) memory model.
 * - `hadMiss` (Grade 1 = Again): schedules one quiet replay at the end of today's queue,
 *   updates difficulty D upward and stability S via post-lapse formula, and checks again tomorrow.
 * - `grade` (2 = Hard, 3 = Good, 4 = Easy): dynamically updates D and S from real elapsed days
 *   and retrievability R(t, S).
 * - `mastered` on a `learn` card jumps initial stability to `MASTERED_INTERVAL` (21d).
 */
export function settleCard(
  progress: Progress,
  hadMiss: boolean,
  today = progress.todayKey,
  mastered = false,
  grade?: Grade,
): Progress {
  const current = progress.queue[0]
  if (!current) return progress

  const rest = progress.queue.slice(1)
  const existing = progress.memory[current.id]
  const memory = { ...progress.memory }
  const replayed = [...progress.replayed]
  let queue = rest

  const isFirstLearn = !existing && current.mode === 'learn'
  const effectiveGrade: Grade = hadMiss
    ? 1
    : grade !== undefined
      ? grade
      : mastered && current.mode === 'learn'
        ? 4
        : 3

  if (hadMiss || effectiveGrade === 1) {
    const prevMisses = existing?.misses ?? 0
    const prevReps = existing?.reps ?? 0
    let d: number
    let s: number
    if (!existing) {
      d = initDifficulty(1)
      s = round2(W[0])
    } else {
      const prevS = existing.stability ?? Math.max(1, existing.interval || 1)
      const prevD =
        existing.difficulty ?? clamp(initDifficulty(3) + prevMisses * 1.2, 1, 10)
      const last = existing.lastReview ?? addDays(existing.next, -Math.max(1, existing.interval || 1))
      const elapsed = Math.max(1, daysBetween(last, today))
      const r = retrievability(elapsed, prevS)
      d = nextDifficulty(prevD, 1)
      s = nextForgetStability(prevD, prevS, r)
    }
    memory[current.id] = {
      interval: 1,
      next: addDays(today, 1),
      misses: prevMisses + 1,
      stability: s,
      difficulty: d,
      lastReview: today,
      reps: prevReps + 1,
    }
    const alreadyQueued = queue.some((card) => card.id === current.id)
    if (!alreadyQueued && !replayed.includes(current.id)) {
      queue = [...queue, { id: current.id, mode: 'recall' }]
      replayed.push(current.id)
    }
  } else if (isFirstLearn) {
    const isMasteredLearn = mastered || effectiveGrade === 4
    const d = initDifficulty(isMasteredLearn ? 4 : effectiveGrade)
    const s = isMasteredLearn ? MASTERED_INTERVAL : 1
    const interval = isMasteredLearn ? MASTERED_INTERVAL : 1
    memory[current.id] = {
      interval,
      next: addDays(today, interval),
      misses: 0,
      stability: s,
      difficulty: d,
      lastReview: today,
      reps: 1,
    }
  } else {
    const prevInterval = existing?.interval ?? 1
    const prevMisses = existing?.misses ?? 0
    const prevReps = existing?.reps ?? 1
    const prevS = existing?.stability ?? Math.max(1, prevInterval)
    const prevD =
      existing?.difficulty ?? clamp(initDifficulty(3) + prevMisses * 1.2, 1, 10)
    const last =
      existing?.lastReview ??
      (existing ? addDays(existing.next, -Math.max(1, prevInterval)) : addDays(today, -1))
    const elapsed = Math.max(1, daysBetween(last, today))
    const r = retrievability(elapsed, prevS)
    const recallGrade: 2 | 3 | 4 =
      effectiveGrade === 2 ? 2 : effectiveGrade === 4 && current.mode === 'recall' && grade === 4 ? 4 : 3
    const d = nextDifficulty(prevD, recallGrade)
    const s = nextRecallStability(prevD, prevS, r, recallGrade)
    const minNext = recallGrade === 2 ? Math.max(1, prevInterval) : prevInterval + 1
    const interval = clamp(Math.max(minNext, intervalFromStability(s)), 1, MAX_INTERVAL)
    memory[current.id] = {
      interval,
      next: addDays(today, interval),
      misses: prevMisses,
      stability: s,
      difficulty: d,
      lastReview: today,
      reps: prevReps + 1,
    }
  }

  const prevDoneIds = progress.doneIds ?? []
  const stillQueued = queue.some((card) => card.id === current.id)
  const doneIds =
    stillQueued || prevDoneIds.includes(current.id)
      ? prevDoneIds
      : [...prevDoneIds, current.id]

  return {
    ...progress,
    memory,
    queue,
    replayed,
    doneIds,
    doneCount: progress.doneCount + 1,
    started: true,
    finished: queue.length === 0,
  }
}

export function startBonusRound(progress: Progress, today = progress.todayKey): Progress {
  const fresh = WORDS.filter((w) => !progress.memory[w.id])
  const bonus: QueueCard[] = []
  for (const w of fresh) {
    if (bonus.length >= progress.dailyCount) break
    bonus.push({ id: w.id, mode: 'learn' })
  }
  if (bonus.length === 0) return progress
  return {
    ...progress,
    todayKey: today,
    queue: bonus,
    doneCount: 0,
    doneIds: [],
    replayed: [],
    started: true,
    finished: false,
  }
}
