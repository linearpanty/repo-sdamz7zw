import { rolldown } from 'rolldown'
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Bundle inside node_modules so bare `react` imports resolve from the project.
const outDir = resolve('node_modules/.tmp/cw-scenes-test')
mkdirSync(outDir, { recursive: true })
const outfile = join(outDir, 'scenes.mjs')
const bundle = await rolldown({
  input: 'src/scenes/index.ts',
  external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/],
  transform: { jsx: { runtime: 'automatic' } },
})
await bundle.write({ file: outfile, format: 'esm' })
await bundle.close()

const { SCENES } = await import(pathToFileURL(outfile).href)
const { createElement } = await import('react')
const { renderToStaticMarkup } = await import('react-dom/server')

const FIRST_20 = [
  'abandon', 'challenge', 'benefit', 'collapse', 'significant',
  'adequate', 'environment', 'factor', 'approach', 'evidence',
  'adjacent', 'structure', 'available', 'impact', 'strategy',
  'arbitrary', 'process', 'authority', 'feature', 'capacity',
]
const SFX = new Set([
  'snap', 'slam', 'chime', 'clatter', 'whoosh', 'breath', 'splash', 'boing', 'purr', 'sting',
  'cymbal', 'rumble', 'click', 'shatter', 'clack', 'thunk', 'ding', 'stamp', 'tada', 'overload',
])
const strip = ({ offset: _o, easing: _e, ...rest }) => JSON.stringify(rest)

assert.deepEqual(Object.keys(SCENES).sort(), [...FIRST_20].sort(), 'one scene per first-20 word')

// Back-to-back cards must not sound alike: every first-20 word owns its climax sound.
const sfxOwners = new Map()
for (const id of FIRST_20) {
  const sfx = SCENES[id].sfx
  assert.ok(!sfxOwners.has(sfx), `${id}: sfx "${sfx}" already used by ${sfxOwners.get(sfx)}`)
  sfxOwners.set(sfx, id)
}

// Shared beat map (src/scenes/timeline.ts): setup 0–0.45, action 0.45–0.72, aftermath 0.72–1.
const ACTION = 0.45
const AFTER = 0.72
const INK = '#1f1d1b'
const WHITE = '#ffffff'
/** Poster rule: one flat field + at most four bold colours (ink and white are free). */
const MAX_ACCENTS = 4
/** Zero set-dressing: a whole scene stays under this many drawn shapes. */
const MAX_SHAPES = 45

/** Last keyframe at or before `t` (the state a track holds at that moment). */
const at = (frames, t) => strip(frames.filter((f) => f.offset <= t).at(-1))

for (const id of FIRST_20) {
  const scene = SCENES[id]
  assert.equal(scene.id, id)
  assert.ok(scene.label && !scene.label.toLowerCase().includes(id), `${id}: label must not leak the word`)
  assert.ok(SFX.has(scene.sfx), `${id}: unknown sfx ${scene.sfx}`)
  assert.ok(scene.hit >= ACTION && scene.hit <= 0.75, `${id}: hit ${scene.hit} must land in the action beat`)

  const markup = renderToStaticMarkup(createElement('svg', null, scene.render()))
  const keys = new Set([...markup.matchAll(/data-k="([^"]+)"/g)].map((m) => m[1]))
  assert.ok(scene.tracks.length >= 4, `${id}: too few tracks for setup / action / aftermath`)

  // Poster rules: flat full-bleed field first, few colours, no clutter, no old comic cast.
  const field = markup.match(/^<svg><g[^>]*>(?:<g[^>]*>)*<rect[^>]*width="1120"[^>]*fill="(#[0-9a-f]{6})"/i)?.[1]
  assert.ok(field, `${id}: must open with one flat full-bleed <Field>`)
  const accents = new Set(
    [...markup.matchAll(/(?:fill|stroke)="(#[0-9a-f]{3,6})"/gi)]
      .map((m) => m[1].toLowerCase())
      .filter((c) => c !== INK && c !== WHITE && c !== field.toLowerCase()),
  )
  assert.ok(accents.size <= MAX_ACCENTS, `${id}: ${accents.size} accent colours (${[...accents].join(' ')}), max ${MAX_ACCENTS}`)
  const shapes = (markup.match(/<(path|rect|circle|ellipse|line|polygon|text)\b/g) ?? []).length
  assert.ok(shapes <= MAX_SHAPES, `${id}: ${shapes} shapes is clutter (max ${MAX_SHAPES})`)
  assert.ok(![...keys].some((k) => k.includes('-m-')), `${id}: no comic-cast face layers`)

  const opacityOwners = new Map()
  let setupTracks = 0
  let actionTracks = 0
  let changedTracks = 0
  for (const track of scene.tracks) {
    assert.ok(keys.has(track.k), `${id}: track "${track.k}" has no matching data-k node`)
    const offsets = track.frames.map((f) => f.offset)
    assert.equal(offsets[0], 0, `${id}/${track.k}: first offset must be 0`)
    assert.equal(offsets.at(-1), 1, `${id}/${track.k}: last offset must be 1`)
    for (let i = 1; i < offsets.length; i++) {
      assert.ok(offsets[i] >= offsets[i - 1], `${id}/${track.k}: offsets must be sorted`)
    }
    if (track.frames.some((f) => 'opacity' in f)) {
      assert.ok(!opacityOwners.has(track.k), `${id}/${track.k}: two tracks fight over opacity`)
      opacityOwners.set(track.k, true)
    }
    // A beat "moves" a track when some keyframe segment overlapping it changes state.
    const movesIn = (from, to) =>
      track.frames.some((f, i) => i > 0 && track.frames[i - 1].offset < to && f.offset > from && strip(f) !== strip(track.frames[i - 1]))
    if (movesIn(0, ACTION)) setupTracks++
    if (movesIn(ACTION, AFTER)) actionTracks++
    if (at(track.frames, 1) !== at(track.frames, ACTION)) changedTracks++
  }
  assert.ok(setupTracks >= 1, `${id}: the setup beat needs some motion`)
  assert.ok(actionTracks >= 2, `${id}: the action beat needs a real physical change (${actionTracks} tracks move in 0.45–0.72)`)
  assert.ok(changedTracks >= 2, `${id}: the final frame must differ from the setup (${changedTracks} tracks changed)`)
}

// The stage plays on its own: nothing about typing may reach it.
const stage = readFileSync('src/components/WordMotionStage.tsx', 'utf8')
assert.match(stage, /const DURATION_MS = 2400\b/, 'stage: one straight 2.4s run')
assert.match(stage, /const HOLD_MS = 1600\b/, 'stage: hold the final frame ~1.6s before the encore')
for (const banned of ['typed', 'missCount', 'correctPrefixLength', 'shake(']) {
  assert.ok(!stage.includes(banned), `stage: must not depend on typing (${banned})`)
}
const view = readFileSync('src/views/WordView.tsx', 'utf8')
assert.match(view, /<WordMotionStage word=\{word\} passed=\{passed\} \/>/, 'WordView: stage gets no typing props')

console.log(`scene tests ok (${FIRST_20.length} scenes)`)
