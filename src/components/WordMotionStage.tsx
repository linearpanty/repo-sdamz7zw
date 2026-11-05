import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { illustrationUrl, videoUrl, type Word } from '../data/types'
import type { CardMode } from '../lib/model'
import { playSfx } from '../lib/sfx'
import { sceneFor, type Scene } from '../scenes'
import { beatOf, CRITICAL } from '../scenes/timeline'

type WordMotionStageProps = {
  word: Word
  mode: CardMode
  /** Raw spell-gate input; its correct prefix drives the timeline. */
  typed: string
  passed: boolean
  /** Bumps when Enter is pressed on a wrong answer. */
  missCount: number
}

/** Learn-mode intro: the whole drama in the same 1800ms window as the blind-probe timer. */
const LEARN_MS = 1800
/** 0.7 -> 1.0 climax burst; fits inside WordView's 650ms hold. */
const CLIMAX_MS = 440
const STEP_MS = 260
const TIMELINE_MS = 1000
const BEAT_NAMES = ['起', '变', '定'] as const

export function hasScene(word: Word): boolean {
  return sceneFor(word.id) !== null
}

export function WordMotionStage(props: WordMotionStageProps) {
  const scene = sceneFor(props.word.id)
  if (scene) return <SceneTheater key={scene.id} scene={scene} {...props} />
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

function useReducedMotionRef() {
  const ref = useRef(prefersReducedMotion())
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => {
      ref.current = mq.matches
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return ref
}

const linear = (t: number) => t
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2

type TweenOpts = {
  ease?: (t: number) => number
  /** Fire `onHit` when progress crosses this offset. */
  hit?: number
  onHit?: () => void
  onDone?: () => void
}

function correctPrefixLength(typed: string, target: string): number {
  const a = typed.trim().toLowerCase()
  const b = target.trim().toLowerCase()
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

/**
 * Plays one Scene by scrubbing paused Web Animations.
 *
 * learn:  autoplay Before -> Action -> After within 1800ms.
 * typing: each correct prefix letter pushes the build-up toward 0.7 (never past it);
 *         a wrong letter dips back with a shake.
 * passed: burst 0.7 -> 1.0 with the scene's peak sound, then hold the After frame.
 */
function SceneTheater({ scene, word, mode, typed, passed, missCount }: WordMotionStageProps & { scene: Scene }) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const animsRef = useRef<Animation[]>([])
  const progressRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const climaxRef = useRef(false)
  const reducedRef = useReducedMotionRef()
  const [beat, setBeat] = useState<0 | 1 | 2>(0)

  const learn = mode === 'learn'
  const target = word.word
  const prefixLen = correctPrefixLength(typed, target)
  const clean = typed.trim().toLowerCase()
  const wrong = clean.length > 0 && prefixLen < clean.length
  const base = (Math.min(prefixLen, target.length) / Math.max(1, target.length)) * CRITICAL

  const seek = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(1, p))
    progressRef.current = clamped
    for (const anim of animsRef.current) anim.currentTime = clamped * TIMELINE_MS
    setBeat(beatOf(clamped))
  }, [])

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const tweenTo = useCallback(
    (to: number, ms: number, opts: TweenOpts = {}) => {
      stop()
      const from = progressRef.current
      const crosses = opts.hit !== undefined && from < opts.hit && to >= opts.hit
      if (reducedRef.current || ms <= 0 || from === to) {
        seek(to)
        if (crosses) opts.onHit?.()
        opts.onDone?.()
        return
      }
      const ease = opts.ease ?? easeOutCubic
      const t0 = performance.now()
      let hitFired = false
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms)
        const p = from + (to - from) * ease(t)
        seek(p)
        if (crosses && !hitFired && p >= (opts.hit ?? 1)) {
          hitFired = true
          opts.onHit?.()
        }
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          rafRef.current = null
          opts.onDone?.()
        }
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [reducedRef, seek, stop],
  )

  const shake = useCallback(() => {
    if (reducedRef.current) return
    try {
      shellRef.current?.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 300, easing: 'ease-out' },
      )
    } catch {
      // WAAPI missing: skip the shake, the dip still reads as feedback.
    }
  }, [reducedRef])

  // Build one paused Animation per track element.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg || typeof svg.animate !== 'function') return
    const anims: Animation[] = []
    for (const track of scene.tracks) {
      const nodes = svg.querySelectorAll<SVGElement>(`[data-k="${track.k}"]`)
      if (import.meta.env.DEV && nodes.length === 0) console.warn(`[scene:${scene.id}] no node for track "${track.k}"`)
      for (const node of nodes) {
        try {
          const anim = node.animate(track.frames, { duration: TIMELINE_MS, fill: 'both', easing: 'linear' })
          anim.pause()
          anims.push(anim)
        } catch (err) {
          if (import.meta.env.DEV) console.warn(`[scene:${scene.id}] bad keyframes for "${track.k}"`, err)
        }
      }
    }
    animsRef.current = anims
    if (learn && reducedRef.current) {
      seek(1)
    } else {
      seek(0)
      if (learn) tweenTo(1, LEARN_MS, { ease: linear })
    }
    return () => {
      stop()
      for (const anim of anims) anim.cancel()
      animsRef.current = []
    }
    // Mount-only per scene: learn/mode never changes within a card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  // Typing drives the timeline; passing triggers the climax.
  const lastRef = useRef({ clean, missCount })
  useEffect(() => {
    const last = lastRef.current
    const typedChanged = last.clean !== clean
    const missChanged = last.missCount !== missCount
    lastRef.current = { clean, missCount }

    if (passed) {
      if (climaxRef.current) return
      climaxRef.current = true
      if (progressRef.current > CRITICAL) seek(CRITICAL)
      tweenTo(1, CLIMAX_MS, { ease: easeOutCubic, hit: scene.hit, onHit: () => playSfx(scene.sfx) })
      return
    }
    climaxRef.current = false
    if (!typedChanged && !missChanged) return

    if ((typedChanged && wrong) || missChanged) {
      shake()
      const dip = Math.max(0, base - 0.06)
      tweenTo(dip, 90, {
        ease: easeOutCubic,
        onDone: () => tweenTo(base, 320, { ease: easeOutBack }),
      })
      return
    }
    tweenTo(base, STEP_MS, { ease: easeOutCubic })
  }, [clean, missCount, passed, wrong, base, scene, seek, tweenTo, shake])

  const replay = useCallback(() => {
    seek(0)
    tweenTo(1, LEARN_MS, { ease: linear, hit: scene.hit, onHit: () => playSfx(scene.sfx) })
  }, [scene, seek, tweenTo])

  return (
    <div
      ref={shellRef}
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
          ↺ 重播
        </button>
      </div>
    </div>
  )
}
