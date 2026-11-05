import type { ReactNode } from 'react'

/**
 * Poster kit for the scene theatre: "one giant object, one change, one beat".
 *
 * Every scene is a flat single-tone field, one or two giant focal objects
 * (65–80% of the 320×400 frame) and at most four bold colours plus ink and
 * white. No rooms, no crowds, no set dressing.
 *
 * Every animated part is wrapped by <K>: an outer static group places it, the
 * inner `data-k` group is what the timeline animates. Parts are drawn with
 * their pivot at local (0,0), so SVG's default `transform-origin: 0 0` makes
 * rotations hinge where the part is placed.
 */

export const INK = '#1f1d1b'
export const WHITE = '#ffffff'

type KProps = {
  k?: string
  x?: number
  y?: number
  s?: number
  r?: number
  o?: number
  children?: ReactNode
}

export function K({ k, x = 0, y = 0, s = 1, r = 0, o, children }: KProps) {
  const t = `translate(${x} ${y})${r ? ` rotate(${r})` : ''}${s !== 1 ? ` scale(${s})` : ''}`
  return (
    <g transform={t}>
      {k ? (
        <g data-k={k} opacity={o}>
          {children}
        </g>
      ) : (
        <g opacity={o}>{children}</g>
      )}
    </g>
  )
}

export function Ln({ d, w = 4, c = INK }: { d: string; w?: number; c?: string }) {
  return <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
}

/** Flat full-bleed field; oversized so `meet` letterboxing never shows an edge. */
export function Field({ color, k }: { color: string; k?: string }) {
  return <rect data-k={k} x={-400} y={-400} width={1120} height={1200} fill={color} />
}

/** Bold radial strokes for the action moment, centred on (0,0). */
export function Burst({ r0 = 10, r1 = 22, n = 10, color = INK, w = 5 }: { r0?: number; r1?: number; n?: number; color?: string; w?: number }) {
  const lines = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    lines.push(<line key={i} x1={c * r0} y1={s * r0} x2={c * r1} y2={s * r1} />)
  }
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round">
      {lines}
    </g>
  )
}

/** Toothed gear centred on (0,0). */
export function Gear({ r, teeth = 10, color, hole = 0.3 }: { r: number; teeth?: number; color: string; hole?: number }) {
  const pts: string[] = []
  const n = teeth * 4
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = i % 4 < 2 ? r : r * 0.8
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`)
  }
  return (
    <g>
      <polygon points={pts.join(' ')} fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle r={r * hole} fill={WHITE} stroke={INK} strokeWidth={4} />
    </g>
  )
}
