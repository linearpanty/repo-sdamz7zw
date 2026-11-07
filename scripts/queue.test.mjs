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
// Phase 1: 5 learn cards -> each transitions to a same-round blind recall card at the end of the queue
for (let i = 0; i < 5; i += 1) clean = settleCard(clean, false, today)
assert.equal(clean.finished, false, 'round continues into blind recall verification after learn pass')
assert.equal(clean.queue.length, 5)
assert.deepEqual(
  clean.queue.map((card) => card.mode),
  ['recall', 'recall', 'recall', 'recall', 'recall'],
)
assert.equal(clean.doneIds.length, 0, 'words are not marked done until blind recall passes')
assert.equal(clean.memory.abandon.reps, 0)

// Phase 2: 5 blind recall cards -> completes the 5-word round
for (let i = 0; i < 5; i += 1) clean = settleCard(clean, false, today)
assert.equal(clean.finished, true)
assert.equal(clean.queue.length, 0)
assert.equal(clean.doneIds.length, 5)
assert.equal(clean.memory.abandon.reps, 1)
assert.equal(clean.memory.abandon.next, '2026-10-28')

const bonus = startBonusRound(clean, today)
assert.equal(bonus.queue.length, 5)
assert.deepEqual(bonus.doneIds, [], 'bonus round resets doneIds so slip shows only the new 5 words')
assert.equal(bonus.doneCount, 0)
assert.deepEqual(bonus.replayed, [])

// Bonus round prioritizes any remaining due recall words before pulling unseen learn words
const bonusWithDue = startBonusRound(
  {
    ...clean,
    memory: {
      ...clean.memory,
      arbitrary: { interval: 2, next: today, misses: 0, stability: 2, difficulty: 5, reps: 1 },
    },
  },
  today,
)
assert.deepEqual([bonusWithDue.queue[0].id, bonusWithDue.queue[0].mode], ['arbitrary', 'recall'])
assert.equal(bonusWithDue.queue[1].mode, 'learn')

const nextDay = ensureToday(clean, '2026-10-28')
assert.equal(nextDay.finished, false)
assert.equal(nextDay.queue[0].mode, 'recall')
assert.equal(nextDay.queue.filter((card) => card.mode === 'recall').length, 5)

// System-judged mastery on learn: exempt from same-round blind recall, jumps straight to 21d.
const { nextInterval } = queue
const masteredLearn = settleCard(ensureToday(blank, today), false, today, true)
assert.equal(masteredLearn.memory.abandon.interval, 21)
assert.equal(masteredLearn.memory.abandon.next, '2026-11-17')
assert.equal(masteredLearn.queue.some((c) => c.id === 'abandon'), false, 'mastered learn card skips same-round recall')
assert.equal(masteredLearn.doneIds.includes('abandon'), true)

const undone = settleCard(ensureToday(blank, today), false, today, false)
assert.equal(undone.memory.abandon.interval, 1, 'undo / no mastery falls back to normal 1d')
assert.equal(undone.queue.at(-1)?.id, 'abandon', 'non-mastered learn card queues same-round blind recall')
assert.equal(undone.queue.at(-1)?.mode, 'recall')

const recallCard = {
  ...blank,
  memory: { abandon: { interval: 1, next: today, misses: 0, reps: 1 } },
  queue: [{ id: 'abandon', mode: 'recall' }],
}
const recallMastered = settleCard(recallCard, false, today, true)
assert.equal(recallMastered.memory.abandon.interval, 4, 'recall cards use DSR stability growth rather than learn mastery jump')

// DSR Recall progression (Good = 3): Day 0 (learn + same-round recall -> 1d) -> 4d -> 14d -> 43d -> 122d -> 320d
let dsrProgress = settleCard(ensureToday(blank, today), false, today)
dsrProgress = settleCard(
  { ...dsrProgress, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  false,
  today,
  false,
  3,
)
const dsrIntervals = [dsrProgress.memory.abandon.interval]
for (let i = 0; i < 5; i += 1) {
  const row = dsrProgress.memory.abandon
  dsrProgress = settleCard(
    { ...dsrProgress, todayKey: row.next, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
    false,
    row.next,
    false,
    3,
  )
  dsrIntervals.push(dsrProgress.memory.abandon.interval)
}
assert.deepEqual(dsrIntervals, [1, 4, 14, 43, 122, 320])

// DSR Grade differentiation: Hard (2) < Good (3) < Easy (4)
let baseLearn = settleCard(ensureToday(blank, today), false, today)
baseLearn = settleCard(
  { ...baseLearn, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  false,
  today,
  false,
  3,
)
const dueDay = baseLearn.memory.abandon.next
const hardRecall = settleCard(
  { ...baseLearn, todayKey: dueDay, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  false,
  dueDay,
  false,
  2,
)
const goodRecall = settleCard(
  { ...baseLearn, todayKey: dueDay, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  false,
  dueDay,
  false,
  3,
)
const easyRecall = settleCard(
  { ...baseLearn, todayKey: dueDay, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  false,
  dueDay,
  false,
  4,
)
assert.ok(hardRecall.memory.abandon.interval < goodRecall.memory.abandon.interval)
assert.ok(goodRecall.memory.abandon.interval < easyRecall.memory.abandon.interval)
assert.ok(hardRecall.memory.abandon.difficulty > goodRecall.memory.abandon.difficulty)
assert.ok(easyRecall.memory.abandon.difficulty < goodRecall.memory.abandon.difficulty)

// Overdue bonus: recalling a card late yields higher stability than recalling on time
const overdueRecall = settleCard(
  { ...baseLearn, todayKey: '2026-11-05', queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  false,
  '2026-11-05',
  false,
  3,
)
assert.ok(overdueRecall.memory.abandon.stability > goodRecall.memory.abandon.stability)

// Post-lapse stability: a mature card that lapses retains higher stability than a fresh card that lapses
const matureLapse = settleCard(
  { ...dsrProgress, todayKey: dsrProgress.memory.abandon.next, queue: [{ id: 'abandon', mode: 'recall' }], finished: false },
  true,
  dsrProgress.memory.abandon.next,
)
assert.equal(matureLapse.memory.abandon.interval, 1)
assert.ok(matureLapse.memory.abandon.stability > 2, 'mature card post-lapse stability stays above 2d')
assert.equal( nextInterval(0), 1)

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

const CORE_GRADED_LEN = 2185
assert.ok(WORDS.length > CORE_GRADED_LEN, 'Expected Green Book expansion tier after core 2,185 words')
assert.deepEqual(
  WORDS.slice(0, 15).map((w) => w.id),
  intro,
)
for (let i = 51; i < CORE_GRADED_LEN; i += 1) {
  assert.ok((WORDS[i - 1].zipf ?? 0) >= (WORDS[i].zipf ?? 0), `Expected descending zipf at ${i}`)
  assert.notEqual(WORDS[i].level, 'A1', 'Default core tier should exclude A1')
}
for (let i = CORE_GRADED_LEN; i < WORDS.length; i += 1) {
  assert.ok((WORDS[i].lists ?? []).includes('green'), `Expected green list tag at ${i}`)
  if (i > CORE_GRADED_LEN) {
    assert.ok((WORDS[i - 1].zipf ?? 0) >= (WORDS[i].zipf ?? 0), `Expected descending zipf in green tier at ${i}`)
  }
}

const withBasic = buildActiveWords(RAW_WORD_POOL, {
  wordlistSource: 'cefrj-octanove-nawl',
  includedLevels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  groupByLevel: false,
  includeGreenBook: true,
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
