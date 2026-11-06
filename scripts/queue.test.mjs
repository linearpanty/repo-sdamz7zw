import { rolldown } from 'rolldown'
import assert from 'node:assert/strict'
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outfile = join(mkdtempSync(join(tmpdir(), 'cw-queue-')), 'queue.mjs')
const bundle = await rolldown({ input: 'src/lib/queue.ts' })
await bundle.write({ file: outfile, format: 'esm' })
await bundle.close()

const queue = await import(pathToFileURL(outfile).href)
const { selectQueue, ensureToday, settleCard, sanitizeProgress, startBonusRound } = queue

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
  ['abandon', 'challenge', 'benefit', 'collapse', 'significant'],
)
assert.equal(first.finished, false)

const intro = selectQueue({}, 15, today).map((card) => card.id)
assert.deepEqual(intro, [
  'abandon',
  'challenge',
  'benefit',
  'collapse',
  'significant',
  'adequate',
  'environment',
  'factor',
  'approach',
  'evidence',
  'adjacent',
  'structure',
  'available',
  'impact',
  'strategy',
])
assert.notDeepEqual(intro, [...intro].sort())

const dueFirst = selectQueue(
  {
    collapse: { interval: 1, next: today, misses: 1 },
    abstract: { interval: 2, next: '2026-10-20', misses: 0 },
    arbitrary: { interval: 3, next: '2026-11-01', misses: 0 },
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
assert.deepEqual([dueFirst[2].id, dueFirst[2].mode], ['abandon', 'learn'])
assert.equal(dueFirst.filter((card) => card.id === 'arbitrary').length, 0)

let missed = settleCard(first, true, today)
assert.equal(missed.queue.at(-1)?.id, 'abandon')
assert.equal(missed.queue.at(-1)?.mode, 'recall')
assert.equal(missed.queue[0].id, 'challenge')
assert.equal(missed.replayed.includes('abandon'), true)
assert.equal(missed.doneIds.includes('abandon'), false, 're-queued word must not appear in doneIds yet')
assert.equal(missed.memory.abandon.next, '2026-10-28')

const again = settleCard(
  {
    ...missed,
    queue: [{ id: 'arbitrary', mode: 'recall' }, ...missed.queue.filter((card) => card.id !== 'arbitrary')],
    replayed: ['arbitrary'],
  },
  true,
  today,
)
assert.equal(again.queue.filter((card) => card.id === 'arbitrary').length, 0)

let clean = ensureToday(blank, today)
for (let i = 0; i < 5; i += 1) clean = settleCard(clean, false, today)
assert.equal(clean.finished, true)
assert.equal(clean.queue.length, 0)
assert.equal(clean.doneIds.length, 5)
assert.equal(clean.memory.abandon.next, '2026-10-28')

const bonus = startBonusRound(clean, today)
assert.equal(bonus.queue.length, 5)
assert.deepEqual(bonus.doneIds, [], 'bonus round resets doneIds so slip shows only the new 5 words')
assert.equal(bonus.doneCount, 0)
assert.deepEqual(bonus.replayed, [])

const nextDay = ensureToday(clean, '2026-10-28')
assert.equal(nextDay.finished, false)
assert.equal(nextDay.queue[0].mode, 'recall')
assert.equal(nextDay.queue.filter((card) => card.mode === 'recall').length, 5)

// System-judged mastery: honoured on learn cards only.
const { nextInterval } = queue
const masteredLearn = settleCard(ensureToday(blank, today), false, today, true)
assert.equal(masteredLearn.memory.abandon.interval, 21)
assert.equal(masteredLearn.memory.abandon.next, '2026-11-17')

const undone = settleCard(ensureToday(blank, today), false, today, false)
assert.equal(undone.memory.abandon.interval, 1, 'undo / no mastery falls back to the normal first rung')

const recallCard = {
  ...blank,
  memory: { abandon: { interval: 1, next: today, misses: 0 } },
  queue: [{ id: 'abandon', mode: 'recall' }],
}
const recallMastered = settleCard(recallCard, false, today, true)
assert.equal(recallMastered.memory.abandon.interval, 2, 'recall cards never jump to 21 via mastery')

// Recall ladder: 1 -> 2 -> 4 -> 8 -> 21 -> 21
let ladderProgress = settleCard(ensureToday(blank, today), false, today)
const ladder = [ladderProgress.memory.abandon.interval]
for (let i = 0; i < 5; i += 1) {
  const row = ladderProgress.memory.abandon
  ladderProgress = settleCard(
    { ...ladderProgress, todayKey: row.next, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
    false,
    row.next,
    true,
  )
  ladder.push(ladderProgress.memory.abandon.interval)
}
assert.deepEqual(ladder, [1, 2, 4, 8, 21, 21])
assert.equal(nextInterval(0), 1)
assert.equal(nextInterval(3), 4)
assert.equal(nextInterval(16), 21)

const kept = ensureToday(first, today)
assert.equal(kept.queue[0].id, 'abandon')

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

assert.equal(WORDS.length, 2185)
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

// Verify LOCAL_US_AUDIO_IDS matches bundled public/audio/us/*.mp3 files 1-for-1
const audioOut = join(mkdtempSync(join(tmpdir(), 'cw-audio-')), 'audio.mjs')
const audioBundle = await rolldown({ input: 'src/lib/audio.ts' })
await audioBundle.write({ file: audioOut, format: 'esm' })
await audioBundle.close()
const { LOCAL_US_AUDIO_IDS } = await import(pathToFileURL(audioOut).href)
const diskMp3Ids = readdirSync('public/audio/us')
  .filter((f) => f.endsWith('.mp3'))
  .map((f) => f.slice(0, -4))
  .sort()
assert.deepEqual([...LOCAL_US_AUDIO_IDS].sort(), diskMp3Ids)

// Verify splitWordSyllables preserves exact word spelling and character offsets for all active WORDS
const sylOut = join(mkdtempSync(join(tmpdir(), 'cw-syl-')), 'syllables.mjs')
const sylBundle = await rolldown({ input: 'src/lib/syllables.ts' })
await sylBundle.write({ file: sylOut, format: 'esm' })
await sylBundle.close()
const { splitWordSyllables } = await import(pathToFileURL(sylOut).href)
for (const w of WORDS) {
  const segs = splitWordSyllables(w.word)
  assert.equal(segs.map((s) => s.text).join(''), w.word)
  assert.equal(segs[0].start, 0)
  assert.equal(segs.at(-1).end, w.word.length)
}

writeFileSync(join(tmpdir(), 'cw-queue-ok'), 'ok')
console.log('queue tests ok')
