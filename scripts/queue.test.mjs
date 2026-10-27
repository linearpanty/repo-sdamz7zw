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
assert.equal(first.queue[0].id, 'abandon')
assert.equal(first.finished, false)

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
    ['abstract', 'recall'],
    ['collapse', 'recall'],
  ],
)
assert.equal(dueFirst[2].mode, 'learn')
assert.equal(dueFirst.filter((card) => card.id === 'abandon').length, 0)

let missed = settleCard(first, true, today)
assert.equal(missed.queue.at(-1)?.id, 'abandon')
assert.equal(missed.queue.at(-1)?.mode, 'recall')
assert.equal(missed.queue[0].id, 'abstract')
assert.equal(missed.replayed.includes('abandon'), true)
assert.equal(missed.memory.abandon.next, '2026-10-28')

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
assert.equal(clean.memory.abandon.next, '2026-10-28')

const nextDay = ensureToday(clean, '2026-10-28')
assert.equal(nextDay.finished, false)
assert.equal(nextDay.queue[0].mode, 'recall')
assert.equal(nextDay.queue.filter((card) => card.mode === 'recall').length, 5)

const kept = ensureToday(first, today)
assert.equal(kept.queue[0].id, 'abandon')

const sanitized = sanitizeProgress(
  { ...first, queue: [{ id: 'nope', mode: 'learn' }, first.queue[0]] },
  today,
)
assert.deepEqual(sanitized.queue, [first.queue[0]])

writeFileSync(join(tmpdir(), 'cw-queue-ok'), 'ok')
console.log('queue tests ok')
