import { rolldown } from 'rolldown'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outfile = join(mkdtempSync(join(tmpdir(), 'cw-queue-')), 'queue.mjs')
const bundle = await rolldown({ input: 'src/lib/queue.ts' })
await bundle.write({ file: outfile, format: 'esm' })
await bundle.close()

const queue = await import(pathToFileURL(outfile).href)
const { selectQueue, ensureToday, settleCard, sanitizeProgress } = queue

const today = '2026-10-27'
const blank = {
  dailyCount: 5,
  memory: {},
  todayKey: today,
  queue: [],
  doneCount: 0,
  started: false,
  finished: false,
  replayed: [],
}

const first = ensureToday(blank, today)
assert.equal(first.queue.length, 5)
assert.deepEqual(
  first.queue.map((card) => card.mode),
  ['learn', 'learn', 'learn', 'learn', 'learn'],
)
assert.deepEqual(
  first.queue.map((card) => card.id),
  ['available', 'access', 'approach', 'challenge', 'benefit'],
)
assert.equal(first.finished, false)

const intro = selectQueue({}, 15, today).map((card) => card.id)
assert.deepEqual(intro, [
  'available',
  'access',
  'approach',
  'challenge',
  'benefit',
  'authority',
  'aware',
  'capacity',
  'appropriate',
  'capable',
  'affect',
  'accurate',
  'achieve',
  'assume',
  'category',
])
assert.notDeepEqual(intro, [...intro].sort())

const dueFirst = selectQueue(
  {
    collapse: { interval: 1, next: today, misses: 1 },
    abstract: { interval: 2, next: '2026-10-20', misses: 0 },
    abandon: { interval: 3, next: '2026-11-01', misses: 0 },
  },
  5,
  today,
)
assert.deepEqual(
  dueFirst.slice(0, 2).map((card) => [card.id, card.mode]),
  [
    ['collapse', 'recall'],
    ['abstract', 'recall'],
  ],
)
assert.deepEqual([dueFirst[2].id, dueFirst[2].mode], ['available', 'learn'])
assert.equal(dueFirst.filter((card) => card.id === 'abandon').length, 0)

let missed = settleCard(first, true, today)
assert.equal(missed.queue.at(-1)?.id, 'available')
assert.equal(missed.queue.at(-1)?.mode, 'recall')
assert.equal(missed.queue[0].id, 'access')
assert.equal(missed.replayed.includes('available'), true)
assert.equal(missed.memory.available.next, '2026-10-28')

const again = settleCard(
  {
    ...missed,
    queue: [{ id: 'abandon', mode: 'recall' }, ...missed.queue.filter((card) => card.id !== 'abandon')],
    replayed: ['abandon'],
  },
  true,
  today,
)
assert.equal(again.queue.filter((card) => card.id === 'abandon').length, 0)

let clean = ensureToday(blank, today)
for (let i = 0; i < 5; i += 1) clean = settleCard(clean, false, today)
assert.equal(clean.finished, true)
assert.equal(clean.queue.length, 0)
assert.equal(clean.memory.available.next, '2026-10-28')

const nextDay = ensureToday(clean, '2026-10-28')
assert.equal(nextDay.finished, false)
assert.equal(nextDay.queue[0].mode, 'recall')
assert.equal(nextDay.queue.filter((card) => card.mode === 'recall').length, 5)

const kept = ensureToday(first, today)
assert.equal(kept.queue[0].id, 'available')

const sanitized = sanitizeProgress(
  { ...first, queue: [{ id: 'nope', mode: 'learn' }, first.queue[0]] },
  today,
)
assert.deepEqual(sanitized.queue, [first.queue[0]])

// Verify centralized IELTS/CEFR lexicon configuration & ordering
const wordsOut = join(mkdtempSync(join(tmpdir(), 'cw-words-')), 'words.mjs')
const wordsBundle = await rolldown({ input: 'src/data/words.ts' })
await wordsBundle.write({ file: wordsOut, format: 'esm' })
await wordsBundle.close()
const { WORDS, RAW_WORD_POOL, buildActiveWords } = await import(pathToFileURL(wordsOut).href)

assert.equal(WORDS.length, 5162)
assert.deepEqual(
  WORDS.slice(0, 15).map((w) => w.id),
  intro,
)
for (let i = 51; i < WORDS.length; i += 1) {
  assert.ok((WORDS[i - 1].zipf ?? 0) >= (WORDS[i].zipf ?? 0), `Expected descending zipf at ${i}`)
  assert.notEqual(WORDS[i].level, 'A1', 'Default config should exclude A1')
}

const withBasic = buildActiveWords(RAW_WORD_POOL, {
  wordlistSource: 'cefrj-octanove-nawl',
  includedLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  groupByLevel: false,
})
assert.ok(withBasic.length > WORDS.length)

const grouped = buildActiveWords(RAW_WORD_POOL, {
  wordlistSource: 'cefrj-octanove',
  includedLevels: ['B2', 'C1'],
  groupByLevel: true,
})
const firstC1Idx = grouped.findIndex((w, idx) => idx >= 50 && w.level === 'C1')
assert.ok(firstC1Idx > 50)
for (let i = 50; i < firstC1Idx; i += 1) {
  assert.equal(grouped[i].level, 'B2')
  if (i > 50) assert.ok((grouped[i - 1].zipf ?? 0) >= (grouped[i].zipf ?? 0))
}
for (let i = firstC1Idx; i < grouped.length; i += 1) {
  assert.equal(grouped[i].level, 'C1')
  if (i > firstC1Idx) assert.ok((grouped[i - 1].zipf ?? 0) >= (grouped[i].zipf ?? 0))
}

writeFileSync(join(tmpdir(), 'cw-queue-ok'), 'ok')
console.log('queue tests ok')
