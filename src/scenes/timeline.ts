import type { ReactElement } from 'react'
import type { SfxName } from '../lib/sfx'

/**
 * Scene timelines are authored on a normalised 0..1 axis and driven by the
 * Web Animations API: every track becomes one paused `Element.animate()` whose
 * `currentTime` is scrubbed by WordMotionStage (autoplay, typing, climax).
 *
 * Beat map shared by every scene:
 *   0.00–0.12  Before hold (suspense frame)
 *   0.12–0.70  build-up, advanced letter by letter while typing
 *   0.70–0.86  Action burst, only reached once the word is spelled
 *   0.86–1.00  After memory frame
 */
export const BEAT_ACTION = 0.35
export const BEAT_AFTER = 0.86
export const CRITICAL = 0.7

export type Track = { k: string; frames: Keyframe[] }

export type Scene = {
  id: string
  /** Chinese one-liner for screen readers; never contains the headword. */
  label: string
  sfx: SfxName
  /** Timeline offset where the peak sound lands. */
  hit: number
  render: () => ReactElement
  tracks: Track[]
}

type Pose = { x?: number; y?: number; r?: number; s?: number; sx?: number; sy?: number; o?: number }
export type Stop = [number, Pose, string?]

const REST: Required<Pose> = { x: 0, y: 0, r: 0, s: 1, sx: 1, sy: 1, o: 1 }

function pad(frames: Keyframe[]): Keyframe[] {
  if (frames.length === 0) return frames
  const first = frames[0]
  const last = frames[frames.length - 1]
  const out = [...frames]
  if ((first.offset ?? 0) > 0) out.unshift({ ...first, offset: 0 })
  if ((last.offset ?? 1) < 1) out.push({ ...last, offset: 1 })
  return out
}

/** Transform + opacity track. Unspecified fields carry over from the previous stop. */
export function tw(k: string, stops: Stop[]): Track {
  let cur = { ...REST }
  const frames = stops.map(([offset, pose, easing]) => {
    cur = { ...cur, ...pose }
    return {
      offset,
      transform: `translate(${cur.x}px, ${cur.y}px) rotate(${cur.r}deg) scale(${cur.s * cur.sx}, ${cur.s * cur.sy})`,
      opacity: cur.o,
      easing: easing ?? 'ease-in-out',
    }
  })
  return { k, frames: pad(frames) }
}

/** Instant opacity switches: [[offset, opacity], ...]. */
export function flip(k: string, stops: [number, number][]): Track {
  const frames: Keyframe[] = []
  let prev = stops[0]?.[1] ?? 0
  for (const [offset, value] of stops) {
    frames.push({ offset, opacity: prev }, { offset, opacity: value })
    prev = value
  }
  return { k, frames: pad(frames) }
}

/** Smooth opacity ramp: [[offset, opacity], ...]. */
export function fade(k: string, stops: [number, number][]): Track {
  return { k, frames: pad(stops.map(([offset, opacity]) => ({ offset, opacity }))) }
}

/** Arbitrary CSS keyframes (fill, stroke-dashoffset ...). */
export function css(k: string, stops: [number, Record<string, string | number>][], easing = 'ease-in-out'): Track {
  return { k, frames: pad(stops.map(([offset, props]) => ({ offset, easing, ...props }))) }
}

/**
 * Expression schedule for a character rendered with <Head id moods>.
 * Each mood layer is shown only while it is the active one.
 */
export function mood(id: string, schedule: [number, string][]): Track[] {
  const names = [...new Set(schedule.map(([, m]) => m))]
  return names.map((name) =>
    flip(
      `${id}-m-${name}`,
      schedule.map(([offset, m]) => [offset, m === name ? 1 : 0]),
    ),
  )
}

/** Small looping wiggle baked into a window of the timeline (tails, shivers). */
export function wiggle(
  k: string,
  from: number,
  to: number,
  times: number,
  a: Pose,
  b: Pose,
  rest: Pose = {},
): Track {
  const stops: Stop[] = [[0, { ...rest }], [from, { ...rest }]]
  const step = (to - from) / (times * 2)
  for (let i = 0; i < times * 2; i++) {
    stops.push([from + step * (i + 0.5), i % 2 === 0 ? a : b])
  }
  stops.push([to, { ...rest }])
  return tw(k, stops)
}

/**
 * Oscillation stops with amplitude ramping a0 -> a1 (tremors, wobbles),
 * meant to be spliced into a larger tw() stop list. Ends back on `base`.
 */
export function shakeStops(
  from: number,
  to: number,
  n: number,
  axis: 'x' | 'y' | 'r',
  a0: number,
  a1: number,
  base: Pose = {},
): Stop[] {
  const out: Stop[] = [[from, { ...base }]]
  for (let i = 1; i < n; i++) {
    const t = i / n
    const amp = a0 + (a1 - a0) * t
    const v = (base[axis] ?? 0) + (i % 2 ? amp : -amp)
    out.push([from + (to - from) * t, { ...base, [axis]: v }])
  }
  out.push([to, { ...base }])
  return out
}

/**
 * `times` round trips between poses a and b across (from, to] (pumping arms,
 * throbbing suns, aiming wobbles), meant to be spliced into a larger tw() stop list.
 */
export function wiggleStops(from: number, to: number, times: number, a: Pose, b: Pose): Stop[] {
  const out: Stop[] = []
  const step = (to - from) / (times * 2)
  for (let i = 0; i < times * 2; i++) out.push([from + step * (i + 1), i % 2 === 0 ? a : b])
  return out
}

export function beatOf(p: number): 0 | 1 | 2 {
  if (p >= BEAT_AFTER) return 2
  if (p >= BEAT_ACTION) return 1
  return 0
}
