import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { illustrationUrl, videoUrl, type Word } from '../data/types'
import { playSfx } from '../lib/sfx'
import { sceneFor, type Scene } from '../scenes'
import { BEAT_ACTION, BEAT_AFTER, beatOf } from '../scenes/timeline'

type WordMotionStageProps = {
  word: Word
  passed: boolean
}

/** One straight 0 -> 1 run of the scene; never tied to typing. */
const DURATION_MS = 2400
/** Hold on the final frame before the single automatic encore. */
const HOLD_MS = 1600
/** Automatic runs per card (first play + one encore); ↻ replays any time. */
const AUTO_RUNS = 2
const BEAT_NAMES = ['起', '变', '定'] as const

export function hasScene(word: Word): boolean {
  return sceneFor(word.id) !== null
}

export function WordMotionStage(props: WordMotionStageProps) {
  const scene = sceneFor(props.word.id)
  if (scene) return <SceneTheater key={scene.id} scene={scene} passed={props.passed} />
  return <PosterStage word={props.word} passed={props.passed} />
}

function PosterStage({ word, passed }: { word: Word; passed: boolean }) {
  const vidSrc = videoUrl(word)
  const illusSrc = illustrationUrl(word)
  if (!vidSrc && !illusSrc) return null
  return (
    <div
      className={`cw-motion-stage${passed ? ' is-passed' : ''}`}
      style={{ '--cw-word-color': word.color || '#243b55' } as React.CSSProperties}
      aria-hidden="true"
    >
      {vidSrc ? (
        <video
          key={vidSrc}
          className="cw-poster-video"
          src={vidSrc}
          poster={illusSrc ?? undefined}
          autoPlay
          muted
          playsInline
        />
      ) : (
        illusSrc && (
          <div className="cw-kenburns-wrap">
            <img
              className="cw-poster-photo cw-poster-kenburns"
              src={illusSrc}
              alt=""
              width={640}
              height={800}
              draggable={false}
            />
          </div>
        )
      )}
    </div>
  )
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

/**
 * Plays one Scene on its own, as soon as the card opens:
 * 0 -> 1 over DURATION_MS (setup, action with the scene sound, aftermath),
 * holds the final frame for HOLD_MS, plays once more, then rests on the final
 * frame. ↻ (or a click on the stage) replays with sound. Reduced motion shows
 * the final frame statically. Pointer-down is swallowed so the spell input
 * never loses focus.
 */
function SceneTheater({ scene, passed }: { scene: Scene; passed: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const animsRef = useRef<Animation[]>([])
  const timersRef = useRef<number[]>([])
  const runsRef = useRef(0)
  const [beat, setBeat] = useState<0 | 1 | 2>(0)

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current = []
  }, [])

  const later = useCallback((ms: number, fn: () => void) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }, [])

  const showFinal = useCallback(() => {
    for (const anim of animsRef.current) {
      anim.pause()
      anim.currentTime = DURATION_MS
    }
    setBeat(beatOf(1))
  }, [])

  const run = useCallback(
    (withSound: boolean) => {
      clearTimers()
      if (prefersReducedMotion() || animsRef.current.length === 0) {
        showFinal()
        if (withSound) playSfx(scene.sfx)
        return
      }
      runsRef.current += 1
      for (const anim of animsRef.current) {
        anim.currentTime = 0
        anim.play()
      }
      setBeat(0)
      later(BEAT_ACTION * DURATION_MS, () => setBeat(1))
      later(BEAT_AFTER * DURATION_MS, () => setBeat(2))
      if (withSound) later(scene.hit * DURATION_MS, () => playSfx(scene.sfx))
      // The encore is silent: one sound per card open is enough while typing.
      if (runsRef.current < AUTO_RUNS) later(DURATION_MS + HOLD_MS, () => run(false))
    },
    [clearTimers, later, scene, showFinal],
  )

  // Build one Animation per track element, then play straight away.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg || typeof svg.animate !== 'function') return
    const anims: Animation[] = []
    for (const track of scene.tracks) {
      const nodes = svg.querySelectorAll<SVGElement>(`[data-k="${track.k}"]`)
      if (import.meta.env.DEV && nodes.length === 0) console.warn(`[scene:${scene.id}] no node for track "${track.k}"`)
      for (const node of nodes) {
        try {
          const anim = node.animate(track.frames, { duration: DURATION_MS, fill: 'both', easing: 'linear' })
          anim.pause()
          anims.push(anim)
        } catch (err) {
          if (import.meta.env.DEV) console.warn(`[scene:${scene.id}] bad keyframes for "${track.k}"`, err)
        }
      }
    }
    animsRef.current = anims
    runsRef.current = 0
    // Reduced motion: final frame, silent until the learner asks for a replay.
    run(!prefersReducedMotion())
    return () => {
      clearTimers()
      for (const anim of anims) anim.cancel()
      animsRef.current = []
    }
  }, [scene, run, clearTimers])

  const replay = useCallback(() => {
    // A manual replay stands alone: no extra encore queued behind it.
    runsRef.current = AUTO_RUNS
    run(true)
  }, [run])

  return (
    <div
      className={`cw-motion-stage cw-scene-stage is-beat-${beat}${passed ? ' is-passed' : ''}`}
      onPointerDown={(e) => e.preventDefault()}
      onClick={replay}
    >
      <svg
        ref={svgRef}
        className="cw-scene-svg"
        viewBox="0 0 320 400"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={scene.label}
      >
        {scene.render()}
      </svg>
      <div className="cw-scene-hud">
        <ol className="cw-scene-beats" aria-hidden="true">
          {BEAT_NAMES.map((name, i) => (
            <li key={name} className={i === beat ? 'is-on' : i < beat ? 'is-past' : ''}>
              {name}
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="cw-scene-replay"
          aria-label="重播场景"
          onPointerDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation()
            replay()
          }}
        >
          ↻ 重播
        </button>
      </div>
    </div>
  )
}
