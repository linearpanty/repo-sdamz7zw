import { rolldown } from 'rolldown'
import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
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
const SFX = new Set(['buzzer', 'stamp', 'slam', 'crash', 'thunk', 'snap', 'chime', 'pop', 'whoosh', 'rumble', 'splash', 'click', 'breath'])

assert.deepEqual(Object.keys(SCENES).sort(), [...FIRST_20].sort(), 'one scene per first-20 word')

for (const id of FIRST_20) {
  const scene = SCENES[id]
  assert.equal(scene.id, id)
  assert.ok(scene.label && !scene.label.toLowerCase().includes(id), `${id}: label must not leak the word`)
  assert.ok(SFX.has(scene.sfx), `${id}: unknown sfx ${scene.sfx}`)
  assert.ok(scene.hit >= 0.7 && scene.hit <= 0.9, `${id}: hit ${scene.hit} must land in the Action beat`)

  const markup = renderToStaticMarkup(createElement('svg', null, scene.render()))
  const keys = new Set([...markup.matchAll(/data-k="([^"]+)"/g)].map((m) => m[1]))
  assert.ok(scene.tracks.length >= 6, `${id}: too few tracks for a three-beat scene`)

  const opacityOwners = new Map()
  let actionTracks = 0
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
    // Does this track still change once the build-up is over (offset >= 0.7)?
    const late = track.frames.filter((f) => f.offset >= 0.7)
    const lastBuild = track.frames.filter((f) => f.offset <= 0.7).at(-1)
    const states = new Set([lastBuild, ...late].map(({ offset: _o, easing: _e, ...rest }) => JSON.stringify(rest)))
    if (states.size > 1) actionTracks++
  }
  assert.ok(actionTracks >= 3, `${id}: the Action/After beats need real movement (${actionTracks} tracks change after 0.7)`)

  const moodLayers = [...keys].filter((k) => k.includes('-m-'))
  assert.ok(moodLayers.length >= 2, `${id}: needs visible facial expressions`)
}

console.log(`scene tests ok (${FIRST_20.length} scenes)`)
