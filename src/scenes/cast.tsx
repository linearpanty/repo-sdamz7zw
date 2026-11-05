import type { ReactNode } from 'react'

/**
 * Reusable vector cast for the scene theatre.
 *
 * Every animated part is wrapped by <K>: an outer static group places it, the
 * inner `data-k` group is what the timeline animates. Parts are drawn with
 * their pivot at local (0,0), so SVG's default `transform-origin: 0 0` makes
 * rotations hinge at shoulders, necks, hips and tails.
 */

export const INK = '#2b2a28'
export const SKIN = ['#f4d6bb', '#e8b98f', '#c98f62', '#8d5a3b'] as const
export const PAPER = '#fbfaf6'

export type Mood =
  | 'calm'
  | 'happy'
  | 'joy'
  | 'nervous'
  | 'shock'
  | 'awkward'
  | 'relief'
  | 'angry'
  | 'stern'
  | 'smug'
  | 'sad'
  | 'fear'
  | 'glare'
  | 'focus'
  | 'tired'
  | 'blind'
  | 'guilty'

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

export function Ln({ d, w = 1.7, c = INK }: { d: string; w?: number; c?: string }) {
  return (
    <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  )
}

/** Thick outlined stroke used for limbs, ropes, poles. */
export function Limb({ d, color, w = 7 }: { d: string; color: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 3} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  )
}

export function Backdrop({ sky, ground, groundY = 320 }: { sky: string; ground: string; groundY?: number }) {
  return (
    <g>
      <rect x={-400} y={-400} width={1120} height={1200} fill={sky} />
      <rect x={-400} y={groundY} width={1120} height={600} fill={ground} />
      <line x1={-400} x2={720} y1={groundY} y2={groundY} stroke={INK} strokeOpacity={0.35} strokeWidth={1.2} />
    </g>
  )
}

/** Deterministic slanted rain streaks across the stage. */
export function Rain({ k = 'rain', n = 46, color = '#aebed6' }: { k?: string; n?: number; color?: string }) {
  const streaks = []
  for (let i = 0; i < n; i++) {
    const x = ((i * 73) % 420) - 50
    const y = ((i * 137) % 460) - 70
    streaks.push(<line key={i} x1={x} y1={y} x2={x - 5} y2={y + 15} />)
  }
  return (
    <K k={k}>
      <g stroke={color} strokeWidth={1.3} strokeLinecap="round" opacity={0.75}>
        {streaks}
      </g>
    </K>
  )
}

const Blush = () => (
  <g fill="#e8877a" opacity={0.5}>
    <ellipse cx={-10.5} cy={5} rx={3.4} ry={2} />
    <ellipse cx={10.5} cy={5} rx={3.4} ry={2} />
  </g>
)

const Sweat = () => (
  <path d="M15 -13 q3.4 5.2 0 7.6 q-3.4 -2.4 0 -7.6z" fill="#8cc4ee" stroke={INK} strokeWidth={0.9} />
)

function Eyes({ dx = 0, dy = 0, r = 1.9 }: { dx?: number; dy?: number; r?: number }) {
  return (
    <g fill={INK}>
      <circle cx={-6 + dx} cy={-1 + dy} r={r} />
      <circle cx={6 + dx} cy={-1 + dy} r={r} />
    </g>
  )
}

function BigEyes({ dx = 0 }: { dx?: number }) {
  return (
    <g>
      <circle cx={-6} cy={-1} r={4.4} fill="#fff" stroke={INK} strokeWidth={1.3} />
      <circle cx={6} cy={-1} r={4.4} fill="#fff" stroke={INK} strokeWidth={1.3} />
      <circle cx={-6 + dx} cy={-1} r={1.6} fill={INK} />
      <circle cx={6 + dx} cy={-1} r={1.6} fill={INK} />
    </g>
  )
}

/** Eyes, brows and mouth for one expression, centred on a r=17 head. */
export function Face({ mood, look = 0 }: { mood: Mood; look?: number }) {
  const lx = look * 2.2
  switch (mood) {
    case 'calm':
      return (
        <g>
          <Eyes dx={lx} />
          <Ln d="M-9 -7.5 L-4 -8.2 M4 -8.2 L9 -7.5" />
          <Ln d="M-4.5 7 Q0 10 4.5 7" />
        </g>
      )
    case 'happy':
      return (
        <g>
          <Ln d="M-9 -0.5 Q-6 -4.5 -3 -0.5 M3 -0.5 Q6 -4.5 9 -0.5" w={1.9} />
          <path d="M-5.5 5.5 Q0 13 5.5 5.5 Z" fill={INK} />
          <Blush />
        </g>
      )
    case 'joy':
      return (
        <g>
          <Ln d="M-9.5 -9.5 Q-6 -12 -3 -10 M3 -10 Q6 -12 9.5 -9.5" />
          <Ln d="M-9 0 Q-6 -4.5 -3 0 M3 0 Q6 -4.5 9 0" w={2} />
          <path d="M-7 4.5 Q0 15.5 7 4.5 Z" fill={INK} />
          <path d="M-3.6 9.8 Q0 12.8 3.6 9.8 Z" fill="#e8877a" />
          <Blush />
        </g>
      )
    case 'nervous':
      return (
        <g>
          <Eyes dx={lx} />
          <Ln d="M-9.5 -7 L-3.5 -9.8 M3.5 -9.8 L9.5 -7" />
          <Ln d="M-5 8 q1.25 -1.6 2.5 0 t2.5 0 t2.5 0 t2.5 0" w={1.4} />
          <Sweat />
        </g>
      )
    case 'shock':
      return (
        <g>
          <Ln d="M-10.5 -11 Q-6.5 -14.5 -2.5 -11.5 M2.5 -11.5 Q6.5 -14.5 10.5 -11" />
          <BigEyes dx={lx * 0.6} />
          <ellipse cx={0} cy={9.5} rx={3} ry={4.2} fill={INK} />
        </g>
      )
    case 'fear':
      return (
        <g>
          <Ln d="M-9.5 -8 L-3.5 -11.5 M3.5 -11.5 L9.5 -8" />
          <BigEyes dx={lx * 0.6} />
          <Ln d="M-5 10 q1.25 -1.8 2.5 0 t2.5 0 t2.5 0 t2.5 0" w={1.4} />
          <Sweat />
        </g>
      )
    case 'awkward':
      return (
        <g>
          <Eyes dx={2.6} />
          <Ln d="M-9 -8 L-4 -8.6 M4 -10.4 L9 -8.6" />
          <Ln d="M-4 8.6 L4.6 7" />
          <Blush />
          <Sweat />
        </g>
      )
    case 'relief':
      return (
        <g>
          <Ln d="M-9 -1.5 Q-6 1.8 -3 -1.5 M3 -1.5 Q6 1.8 9 -1.5" w={1.9} />
          <Ln d="M-9 -8 L-4 -9.4 M4 -9.4 L9 -8" />
          <ellipse cx={1} cy={8.6} rx={2.2} ry={1.8} fill={INK} />
          <g fill="#fff" stroke={INK} strokeWidth={0.9}>
            <circle cx={10} cy={12} r={2} />
            <circle cx={14.5} cy={14} r={2.8} />
            <circle cx={20} cy={15} r={3.5} />
          </g>
        </g>
      )
    case 'angry':
      return (
        <g>
          <circle r={16.4} fill="#e2574c" opacity={0.18} />
          <Ln d="M-10.5 -10.5 L-3 -6.6 M3 -6.6 L10.5 -10.5" w={2.3} />
          <Eyes dx={lx} r={2.1} />
          <rect x={-5.5} y={5.5} width={11} height={5} rx={1.5} fill="#fff" stroke={INK} strokeWidth={1.4} />
          <Ln d="M-5.5 8 L5.5 8" w={0.9} />
        </g>
      )
    case 'stern':
      return (
        <g>
          <Ln d="M-10 -8 L-3 -7.4 M3 -7.4 L10 -8" w={2.5} />
          <Eyes dx={lx} />
          <Ln d="M-5 8.5 L5 8.5" />
        </g>
      )
    case 'smug':
      return (
        <g>
          <Ln d="M-10 -8.5 L-3.5 -7.5 M3.5 -10 Q7 -12.5 10 -9.6" />
          <Ln d="M-9 -1.2 L-3 -1.2 M3 -1.2 L9 -1.2" w={1.4} />
          <circle cx={-6 + lx} cy={0.6} r={1.5} fill={INK} />
          <circle cx={6 + lx} cy={0.6} r={1.5} fill={INK} />
          <Ln d="M-4 8 Q2 9.8 6.5 5" />
        </g>
      )
    case 'sad':
      return (
        <g>
          <Ln d="M-9.5 -7 L-3.5 -9.8 M3.5 -9.8 L9.5 -7" />
          <Eyes dx={lx} dy={1} />
          <Ln d="M-5 10.5 Q0 6.4 5 10.5" />
          <path d="M-7 3.4 q1.9 3.6 0 5.1 q-1.9 -1.5 0 -5.1z" fill="#8cc4ee" stroke={INK} strokeWidth={0.8} />
        </g>
      )
    case 'glare':
      return (
        <g>
          <Ln d="M-10.5 -9.5 L-3 -5.6 M3 -5.6 L10.5 -9.5" w={2.3} />
          <Ln d="M-9 -1.2 L-3 -1.2 M3 -1.2 L9 -1.2" w={1.2} />
          <circle cx={-6 + lx} cy={0.4} r={1.8} fill={INK} />
          <circle cx={6 + lx} cy={0.4} r={1.8} fill={INK} />
          <Ln d="M-4.5 9 L4.5 8" />
        </g>
      )
    case 'focus':
      return (
        <g>
          <Ln d="M-10 -9 L-3 -7 M3 -7 L10 -9" w={2.3} />
          <Eyes dx={lx} />
          <Ln d="M-4 8.6 Q0 7 4 8.6" />
        </g>
      )
    case 'tired':
      return (
        <g>
          <Ln d="M-9 -1 L-3 -1 M3 -1 L9 -1" />
          <Ln d="M-8.5 2.2 Q-6 3.7 -3.5 2.2 M3.5 2.2 Q6 3.7 8.5 2.2" w={1} />
          <Ln d="M-3.5 8.6 L3.5 8.6" />
        </g>
      )
    case 'blind':
      return (
        <g>
          <Ln d="M-9 -1 Q-6 1.6 -3 -1 M3 -1 Q6 1.6 9 -1" w={1.9} />
          <Ln d="M-10 -9 L-4 -8 M4 -8 Q7 -11 10 -9.6" />
          <Ln d="M-4 7.6 Q1.5 10 6 6" />
        </g>
      )
    case 'guilty':
      return (
        <g>
          <Ln d="M-9.5 -6.5 L-3.5 -9.2 M3.5 -9.2 L9.5 -6.5" />
          <Ln d="M-9 0 L-3 0 M3 0 L9 0" w={1.2} />
          <circle cx={-6} cy={2.8} r={1.6} fill={INK} />
          <circle cx={6} cy={2.8} r={1.6} fill={INK} />
          <Ln d="M-3.5 9.4 Q0 8.2 3.5 9.4" />
          <Sweat />
        </g>
      )
  }
}

export type HairStyle = 'messy' | 'short' | 'side' | 'bun' | 'long' | 'cap' | 'chef' | 'bald'

function Hair({ style, color }: { style: HairStyle; color: string }) {
  const sk = { fill: color, stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' as const }
  const short =
    'M-17 -3 C-18.5 -16 -9 -21.5 0 -21.5 C9.5 -21.5 18.5 -16 17 -3 C13 -9.5 6 -12.5 -1 -12 C-8 -11.5 -13.5 -8.5 -17 -3 Z'
  switch (style) {
    case 'messy':
      return (
        <path
          {...sk}
          d="M-17.5 -1 C-19 -12 -12 -20 -6 -20.5 L-8.5 -26.5 L-2 -21.6 L1 -27.6 L4 -21.4 L10.5 -24.6 L9 -19 C15 -16 19 -10 17.5 -2 L14.5 -8 L11 -4.4 L8.5 -11 L4 -6.6 L0.5 -12 L-3.5 -6.2 L-7.5 -11 L-10.5 -5 L-13.5 -9 Z"
        />
      )
    case 'short':
      return <path {...sk} d={short} />
    case 'side':
      return (
        <path
          {...sk}
          d="M-17 -2 C-18.5 -16 -9 -21.5 1 -21.5 C10 -21.5 18.5 -15 17.2 -2 C15 -8 12.6 -11 7 -12.6 C2 -13.6 -6 -13 -10 -10.6 C-13 -8.6 -15 -5.6 -17 -2 Z"
        />
      )
    case 'bun':
      return (
        <g>
          <circle cx={0} cy={-23} r={6.6} {...sk} />
          <path {...sk} d={short} />
        </g>
      )
    case 'long':
      return (
        <path
          {...sk}
          d="M-17 -1 C-18 -16 -9 -21.5 0 -21.5 C9 -21.5 18 -16 17 -1 C14 -9 8 -12 0 -12.6 C-8 -12 -14 -9 -17 -1 Z"
        />
      )
    case 'cap':
      return (
        <g>
          <path {...sk} d="M-16 -9 C-16 -24 16 -24 16 -9 Z" />
          <path d="M-19 -9 L21 -9" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
        </g>
      )
    case 'chef':
      return (
        <path
          {...sk}
          fill="#fff"
          d="M-12 -12 L-12 -23 C-20 -25 -18.5 -37 -9 -34.5 C-6 -42 6 -42 9 -34.5 C18.5 -37 20 -25 12 -23 L12 -12 Z"
        />
      )
    case 'bald':
      return <Ln d="M-17 -2 C-17 -7 -15 -9.5 -12.5 -10.6 M17 -2 C17 -7 15 -9.5 12.5 -10.6" w={3} c={color} />
  }
}

export type HeadProps = {
  id: string
  moods: Mood[]
  skin?: string
  hair?: HairStyle
  hairColor?: string
  glasses?: boolean
  look?: number
  extra?: ReactNode
}

/** Head centred on (0,0) with one stacked layer per expression. */
export function Head({ id, moods, skin = SKIN[0], hair = 'short', hairColor = '#2f2a26', glasses, look = 0, extra }: HeadProps) {
  return (
    <g>
      {hair === 'long' && (
        <path d="M-18.5 -6 C-21 -22 21 -22 18.5 -6 L20 18 L-20 18 Z" fill={hairColor} stroke={INK} strokeWidth={1.4} />
      )}
      <circle r={17} fill={skin} stroke={INK} strokeWidth={1.6} />
      {moods.map((m, i) => (
        <g key={m} data-k={`${id}-m-${m}`} opacity={i === 0 ? 1 : 0}>
          <Face mood={m} look={look} />
        </g>
      ))}
      <Hair style={hair} color={hairColor} />
      {glasses && (
        <g fill="none" stroke={INK} strokeWidth={1.4}>
          <circle cx={-6} cy={-1} r={5.6} />
          <circle cx={6} cy={-1} r={5.6} />
          <path d="M-0.4 -1.6 L0.4 -1.6 M-11.6 -2 L-16.6 -4 M11.6 -2 L16.6 -4" />
        </g>
      )}
      {extra}
    </g>
  )
}

function Arm({ color, skin, children }: { color: string; skin: string; children?: ReactNode }) {
  return (
    <g>
      <Limb d="M0 0 L0 27" color={color} w={6.5} />
      <circle cy={30} r={4.6} fill={skin} stroke={INK} strokeWidth={1.3} />
      {children && <g transform="translate(0 30)">{children}</g>}
    </g>
  )
}

export type PersonProps = Omit<HeadProps, 'extra'> & {
  shirt: string
  pants?: string
  tie?: string
  /** Static shoulder rotation [left, right]; positive swings the left arm outward. */
  arms?: [number, number]
  legs?: 'stand' | 'crouch' | 'none'
  headExtra?: ReactNode
  handL?: ReactNode
  handR?: ReactNode
}

/**
 * Standing figure with feet at (0,0), ~118 units tall.
 * Animatable parts: `${id}-body` (hip), `${id}-armL|armR` (shoulders), `${id}-head` (neck).
 */
export function Person({
  id,
  moods,
  shirt,
  pants = '#4a5261',
  skin = SKIN[0],
  hair,
  hairColor,
  glasses,
  look,
  tie,
  arms = [8, -8],
  legs = 'stand',
  headExtra,
  handL,
  handR,
}: PersonProps) {
  const hipY = legs === 'crouch' ? -22 : -40
  return (
    <g>
      {legs === 'stand' && (
        <g>
          <Limb d="M-6.5 -42 L-7.5 -4" color={pants} w={8} />
          <Limb d="M6.5 -42 L7.5 -4" color={pants} w={8} />
          <ellipse cx={-9.5} cy={-2} rx={6.6} ry={3.2} fill={INK} />
          <ellipse cx={9.5} cy={-2} rx={6.6} ry={3.2} fill={INK} />
        </g>
      )}
      {legs === 'crouch' && (
        <g>
          <Limb d="M-6 -24 L-16 -13 L-10 -4" color={pants} w={8} />
          <Limb d="M6 -24 L17 -13 L12 -4" color={pants} w={8} />
          <ellipse cx={-12} cy={-2} rx={6.6} ry={3.2} fill={INK} />
          <ellipse cx={14} cy={-2} rx={6.6} ry={3.2} fill={INK} />
        </g>
      )}
      <K k={`${id}-body`} y={hipY}>
        <rect x={-15.5} y={-46} width={31} height={50} rx={12} fill={shirt} stroke={INK} strokeWidth={1.6} />
        {tie && <path d="M0 -45 L-3.2 -39 L0 -24 L3.2 -39 Z" fill={tie} stroke={INK} strokeWidth={1} />}
        <K k={`${id}-head`} y={-46}>
          <g transform="translate(0 -15)">
            <Head id={id} moods={moods} skin={skin} hair={hair} hairColor={hairColor} glasses={glasses} look={look} extra={headExtra} />
          </g>
        </K>
        <K k={`${id}-armL`} x={-14} y={-38} r={arms[0]}>
          <Arm color={shirt} skin={skin}>
            {handL}
          </Arm>
        </K>
        <K k={`${id}-armR`} x={14} y={-38} r={arms[1]}>
          <Arm color={shirt} skin={skin}>
            {handR}
          </Arm>
        </K>
      </K>
    </g>
  )
}

export type DogMood = 'happy' | 'alert' | 'panic' | 'sad'

function DogFace({ mood }: { mood: DogMood }) {
  const ears = {
    up: 'M-3 -12 L-1 -22 L5 -13 Z',
    down: 'M-4 -11 C-10 -9 -10 2 -6 4 C-4 -2 -2 -7 2 -10 Z',
  }
  switch (mood) {
    case 'happy':
      return (
        <g>
          <path d={ears.up} fill="#b77c45" stroke={INK} strokeWidth={1.2} />
          <Ln d="M3 -6 Q5 -8.5 7 -6" w={1.6} />
          <path d="M10 3 Q14 9 18 4" fill="#e8877a" stroke={INK} strokeWidth={1.1} />
        </g>
      )
    case 'alert':
      return (
        <g>
          <path d="M-3 -12 L0 -24 L5 -13 Z" fill="#b77c45" stroke={INK} strokeWidth={1.2} />
          <circle cx={5} cy={-6} r={2.8} fill="#fff" stroke={INK} strokeWidth={1} />
          <circle cx={6} cy={-6} r={1.4} fill={INK} />
          <Ln d="M11 4 L17 4" w={1.3} />
        </g>
      )
    case 'panic':
      return (
        <g>
          <path d="M-4 -12 L-6 -24 L4 -14 Z" fill="#b77c45" stroke={INK} strokeWidth={1.2} />
          <circle cx={5} cy={-6} r={3.4} fill="#fff" stroke={INK} strokeWidth={1} />
          <circle cx={6.4} cy={-6} r={1.3} fill={INK} />
          <ellipse cx={14} cy={5} rx={3} ry={3.6} fill={INK} />
        </g>
      )
    case 'sad':
      return (
        <g>
          <path d={ears.down} fill="#b77c45" stroke={INK} strokeWidth={1.2} />
          <Ln d="M2.6 -7.4 L7 -5.6" w={1.4} />
          <circle cx={5} cy={-4.6} r={1.4} fill={INK} />
          <path d="M5 -2 q1.6 3 0 4.4 q-1.6 -1.4 0 -4.4z" fill="#8cc4ee" stroke={INK} strokeWidth={0.7} />
          <Ln d="M11 5.6 Q14 3.6 17 5.6" w={1.2} />
        </g>
      )
  }
}

/** Small dog facing right with feet at (0,0). Parts: `${id}-head`, `${id}-tail`. */
export function Dog({ id, moods, coat = '#d9a066' }: { id: string; moods: DogMood[]; coat?: string }) {
  return (
    <g>
      <Limb d="M-14 -12 L-15 -1 M-7 -12 L-7 -1 M8 -12 L8 -1 M15 -12 L16 -1" color={coat} w={3.6} />
      <K k={`${id}-tail`} x={-20} y={-21}>
        <Limb d="M0 0 Q-9 -4 -12 -15" color={coat} w={3.6} />
      </K>
      <ellipse cx={0} cy={-19} rx={22} ry={10.5} fill={coat} stroke={INK} strokeWidth={1.5} />
      <ellipse cx={-4} cy={-15} rx={9} ry={5} fill="#f2d7b0" opacity={0.7} />
      <K k={`${id}-head`} x={17} y={-25}>
        <circle cx={4} cy={-5} r={10.5} fill={coat} stroke={INK} strokeWidth={1.5} />
        <ellipse cx={13} cy={1} rx={7.5} ry={5.2} fill="#f2d7b0" stroke={INK} strokeWidth={1.3} />
        <circle cx={19.5} cy={-1} r={2.3} fill={INK} />
        <path d="M-3 2 Q4 8 10 6" fill="none" stroke="#c0392b" strokeWidth={3} strokeLinecap="round" />
        {moods.map((m, i) => (
          <g key={m} data-k={`${id}-m-${m}`} opacity={i === 0 ? 1 : 0}>
            <DogFace mood={m} />
          </g>
        ))}
      </K>
    </g>
  )
}

/** Plain table slab with two legs; drawn in front of seated figures. */
export function Desk({ x, y, w, color = '#b88b5c', h = 12, legs = 40 }: { x: number; y: number; w: number; color?: string; h?: number; legs?: number }) {
  return (
    <g>
      <rect x={x + 8} y={y + h} width={6} height={legs} fill="#8a6440" stroke={INK} strokeWidth={1.2} />
      <rect x={x + w - 14} y={y + h} width={6} height={legs} fill="#8a6440" stroke={INK} strokeWidth={1.2} />
      <rect x={x} y={y} width={w} height={h} rx={2} fill={color} stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

/** Comic burst lines for impact moments. */
export function Burst({ r0 = 10, r1 = 22, n = 10, color = INK, w = 2 }: { r0?: number; r1?: number; n?: number; color?: string; w?: number }) {
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
