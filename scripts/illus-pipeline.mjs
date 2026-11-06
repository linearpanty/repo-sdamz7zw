#!/usr/bin/env node
/**
 * ClawWords Illustration & Copy Production Pipeline
 *
 * Quota-Safe 3-Stage Workflow (5 words per batch):
 *   Stage 1 (Producer):  Craft 2-3 word sceneHook + 4-char sceneHookZh + i+1 example + visual brief,
 *                        then generate 640x800 editorial ink-and-watercolor WebP in public/illus/<id>.webp
 *   Stage 2 (Inspector): Independent Claude visual & semantic QA (1 compact batched prompt per 5 words:
 *                        1. Zero text/gibberish in art; 2. 1-second meaning recognition;
 *                        3. Warm #FAF6EE editorial ink/watercolor consistency; 4. Crisp collocation & i+1 sentence)
 *   Stage 3 (Release):   Verify via `node scripts/illus-pipeline.mjs verify`, run tests & build, deploy to gh-pages.
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CHUNK_PATHS = Array.from({ length: 8 }, (_, i) => `src/data/chunks/chunk${i}.ts`)
const LEDGER_DIR = 'pipeline'
const LEDGER_PATH = join(LEDGER_DIR, 'illus-ledger.json')
const MAX_BATCH_SIZE = 5
const INCLUDED_LEVELS = new Set(['A2', 'B1', 'B2', 'C1', 'C2'])

function fnv1a32(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

function parseActiveWords() {
  const pool = []
  for (const chunkPath of CHUNK_PATHS) {
    const raw = readFileSync(chunkPath, 'utf8')
    const lines = raw.split('\n')
    for (let i = 0; i < lines.length; i += 1) {
      const trimmed = lines[i].trim()
      if (!trimmed.startsWith('{"id":')) continue
      const jsonText = trimmed.replace(/,\s*$/, '')
      try {
        const obj = JSON.parse(jsonText)
        pool.push({ chunkPath, lineNumber: i + 1, ...obj })
      } catch {
        // skip malformed line
      }
    }
  }
  const legacy = pool.slice(0, 50)
  const graded = pool.slice(50).filter((w) => {
    if (!w.level || !INCLUDED_LEVELS.has(w.level)) return false
    const tags = w.lists ?? []
    return tags.includes('cefrj') || tags.includes('nawl')
  })
  graded.sort((a, b) => {
    const za = a.zipf ?? 0
    const zb = b.zipf ?? 0
    if (zb !== za) return zb - za
    return fnv1a32(a.id) - fnv1a32(b.id)
  })
  return [...legacy, ...graded].map((w, idx) => ({ index: idx + 1, ...w }))
}

function loadLedger() {
  if (!existsSync(LEDGER_PATH)) {
    return { updatedAt: new Date().toISOString(), batchSizeCap: MAX_BATCH_SIZE, items: {} }
  }
  try {
    return JSON.parse(readFileSync(LEDGER_PATH, 'utf8'))
  } catch {
    return { updatedAt: new Date().toISOString(), batchSizeCap: MAX_BATCH_SIZE, items: {} }
  }
}

function saveLedger(ledger) {
  if (!existsSync(LEDGER_DIR)) mkdirSync(LEDGER_DIR, { recursive: true })
  ledger.updatedAt = new Date().toISOString()
  writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf8')
}

function auditWord(w) {
  const issues = []
  if (!w.illustration) {
    issues.push('missing illustration field')
  } else {
    const diskPath = join('public', w.illustration)
    if (!existsSync(diskPath)) {
      issues.push(`missing file ${diskPath}`)
    } else {
      const size = statSync(diskPath).size
      if (size < 5000) issues.push(`suspiciously small webp (${size}B)`)
    }
  }
  if (!w.sceneHook || w.sceneHook.trim().split(/\s+/).length > 4) {
    issues.push(`sceneHook should be 2-3 words (got "${w.sceneHook ?? ''}")`)
  }
  if (!w.sceneHookZh || w.sceneHookZh.trim().length < 2 || w.sceneHookZh.trim().length > 6) {
    issues.push(`sceneHookZh should be 2-6 chars (got "${w.sceneHookZh ?? ''}")`)
  }
  if (!Array.isArray(w.examples) || w.examples.length < 2) {
    issues.push(`needs >= 2 examples (easy i+1 + IELTS), got ${w.examples?.length ?? 0}`)
  } else if (w.sceneHook && !w.examples[0].en.toLowerCase().includes(w.sceneHook.trim().toLowerCase())) {
    issues.push(`examples[0].en ("${w.examples[0].en}") must contain sceneHook ("${w.sceneHook}") verbatim`)
  }
  if (w.sceneHook && (!Array.isArray(w.collocations) || !w.collocations.some((c) => c.toLowerCase() === w.sceneHook.trim().toLowerCase()))) {
    issues.push(`collocations must include sceneHook ("${w.sceneHook}")`)
  }
  return issues
}

const cmd = process.argv[2] ?? 'status'
const words = parseActiveWords()
const ledger = loadLedger()

if (cmd === 'status') {
  const completed = words.filter((w) => Boolean(w.illustration))
  const pending = words.filter((w) => !w.illustration)
  console.log(`=== ClawWords Illustration Pipeline Status ===`)
  console.log(`Quota-safe batch size cap: ${MAX_BATCH_SIZE} words / batch`)
  console.log(`Active WORDS illustrated:  ${completed.length} / ${words.length}`)
  console.log(`\nNext ${MAX_BATCH_SIZE} pending words in active WORDS queue order:`)
  for (const w of pending.slice(0, MAX_BATCH_SIZE)) {
    console.log(
      `  #${w.index} ${w.id.padEnd(14)} (${w.senses?.[0]?.zh ?? ''}) | ${w.chunkPath}:${w.lineNumber} | hook: "${w.sceneHook ?? ''}"`,
    )
  }
  const completedWithIssues = completed
    .map((w) => ({ w, issues: auditWord(w) }))
    .filter((x) => x.issues.length > 0)
  if (completedWithIssues.length > 0) {
    console.log(`\nIllustrated words needing copy/example polish (${completedWithIssues.length}):`)
    for (const { w, issues } of completedWithIssues) {
      console.log(`  #${w.index} ${w.id}: ${issues.join('; ')}`)
    }
  }
} else if (cmd === 'verify') {
  const targetIds = process.argv.slice(3)
  const targets =
    targetIds.length > 0
      ? words.filter((w) => targetIds.includes(w.id))
      : words.filter((w) => Boolean(w.illustration))
  let failed = 0
  for (const w of targets) {
    const issues = auditWord(w)
    if (issues.length > 0) {
      console.error(`FAIL #${w.index} ${w.id}: ${issues.join('; ')}`)
      failed += 1
    } else {
      ledger.items[w.id] = {
        index: w.index,
        status: 'live',
        sceneHook: w.sceneHook,
        sceneHookZh: w.sceneHookZh,
        illustration: w.illustration,
        verifiedAt: new Date().toISOString(),
      }
      console.log(
        `PASS #${w.index} ${w.id.padEnd(12)} -> ${w.illustration} | "${w.sceneHook}" (${w.sceneHookZh})`,
      )
    }
  }
  saveLedger(ledger)
  if (failed > 0) process.exit(1)
}
