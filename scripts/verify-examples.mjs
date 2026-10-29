import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { rolldown } from 'rolldown'

const dir = mkdtempSync(join(tmpdir(), 'clawwords-verify-ex-'))
const outfile = join(dir, 'words.mjs')

try {
  const bundle = await rolldown({
    input: resolve('src/data/words.ts'),
  })
  await bundle.write({ file: outfile, format: 'esm' })
  await bundle.close()

  const { WORDS } = await import(pathToFileURL(outfile).href)
  assert.ok(Array.isArray(WORDS) && WORDS.length > 50, 'WORDS must contain > 50 entries')

  const seenEn = new Map()
  let withExample = 0
  let withoutExample = 0
  let humanZh = 0
  let mtZh = 0

  for (let i = 50; i < WORDS.length; i++) {
    const w = WORDS[i]
    const exs = w.examples ?? []
    if (exs.length === 0) {
      withoutExample++
      continue
    }
    withExample++
    const ex = exs[0]
    assert.ok(typeof ex.en === 'string' && ex.en.trim().length > 0, `Empty en for ${w.id}`)
    assert.ok(typeof ex.zh === 'string' && ex.zh.trim().length > 0, `Empty zh for ${w.id}`)
    assert.match(
      ex.source ?? '',
      /^(tatoeba:\d+|gutenberg:pg\d+|wikinews:\d+)$/,
      `Missing or invalid corpus source ID for ${w.id}: ${ex.source}`,
    )

    const hasTatZh = typeof ex.zhSource === 'string' && /^tatoeba:\d+$/.test(ex.zhSource)
    const isMt = ex.mt === true
    assert.ok(
      (hasTatZh && !isMt) || (!hasTatZh && isMt),
      `Example for ${w.id} must have either tatoeba zhSource or mt:true`,
    )
    if (hasTatZh) humanZh++
    if (isMt) mtZh++

    assert.ok(!ex.en.includes('This concept of '), `Template sentence found for ${w.id}`)
    assert.ok(!ex.en.includes('/'), `Slash sentence found for ${w.id}: ${ex.en}`)
    assert.ok(
      !/\b(THREE|TWO|FOUR|FIVE|SIX|TRUE|FALSE|NOT GIVEN|writer of the text|following things)\b/.test(ex.en),
      `Exam question sentence found for ${w.id}: ${ex.en}`,
    )

    const gloss0 = (w.senses?.[0]?.zh ?? '').trim()
    assert.notEqual(ex.zh.trim(), gloss0, `Example zh equals gloss for ${w.id}`)

    const base = w.word.toLowerCase()
    const stem = base.replace(/(e|y)$/, '')
    const cands = [base, stem, ...(w.variants ?? []).map((v) => v.toLowerCase())]
    const low = ex.en.toLowerCase()
    assert.ok(
      cands.some((c) => c && low.includes(c)),
      `Example en missing headword for ${w.id}: ${ex.en}`,
    )

    assert.ok(!seenEn.has(ex.en), `Duplicate English sentence between ${seenEn.get(ex.en)} and ${w.id}`)
    seenEn.set(ex.en, w.id)
  }

  console.log(
    `verify-examples ok: post-legacy=${WORDS.length - 50}, with_example=${withExample} (tatoeba_zh=${humanZh}, mt=${mtZh}), empty=${withoutExample}`,
  )
} finally {
  rmSync(dir, { recursive: true, force: true })
}
