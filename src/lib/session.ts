import { WORDS, type Word } from '../data/words'
import type { Progress } from './storage'

export type FlowStep =
  | { kind: 'home' }
  | { kind: 'review'; word: Word }
  | { kind: 'learn'; word: Word; index: number; total: number }
  | { kind: 'quiz-mcq'; words: Word[]; batchIndex: number }
  | { kind: 'quiz-write'; words: Word[]; batchIndex: number }
  | { kind: 'done'; mode: 'daily' | 'extra' }

export function pickNewWords(p: Progress, count: number): Word[] {
  const learned = new Set(p.learnedIds)
  const today = new Set(p.todayNewIds)
  return WORDS.filter((w) => !learned.has(w.id) && !today.has(w.id)).slice(0, count)
}

export function dueWords(p: Progress): Word[] {
  return p.dueIds
    .map((id) => WORDS.find((w) => w.id === id))
    .filter((w): w is Word => !!w)
}

/** Only Boss-passed words are added to learnedIds */
export function markLearned(p: Progress, ids: string[]): Progress {
  if (ids.length === 0) return p
  const set = new Set([...p.learnedIds, ...ids])
  return { ...p, learnedIds: [...set] }
}

/** Push wrong MCQ/Boss word ids to dueIds */
export function enqueueDue(p: Progress, ids: string[]): Progress {
  if (ids.length === 0) return p
  const due = new Set([...p.dueIds, ...ids])
  return { ...p, dueIds: [...due] }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function mcqOptions(correct: Word, pool: Word[] = WORDS): { zh: string; id: string }[] {
  const others = shuffle(pool.filter((w) => w.id !== correct.id)).slice(0, 3)
  return shuffle([correct, ...others]).map((w) => ({
    id: w.id,
    zh: w.senses.map((s) => s.zh).join('；'),
  }))
}
