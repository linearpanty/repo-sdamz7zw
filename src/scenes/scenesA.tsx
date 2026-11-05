import { Burst, Field, INK, K, Ln, WHITE } from './cast'
import { css, fade, flip, shakeStops, tw, wiggleStops, type Scene, type Stop } from './timeline'

/** Stroke that draws itself on: pair with draw(k, from, to). */
export function DrawPath({ k, d, c = INK, w = 6 }: { k: string; d: string; c?: string; w?: number }) {
  return (
    <path
      data-k={k}
      d={d}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1}
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

export function draw(k: string, from: number, to: number) {
  return css(k, [
    [0, { strokeDashoffset: '1px' }],
    [from, { strokeDashoffset: '1px' }],
    [to, { strokeDashoffset: '0px' }],
  ])
}

/** Whole-frame tremor at the action moment. */
export function quake(from: number, to: number, amp = 7, n = 8): Stop[] {
  return [[0, {}], ...shakeStops(from, to, n, 'x', amp, 0)]
}

/* abandon — a hand lets go of the red leash; the footsteps walk off and fade; the dog is left alone. */
const AB = { coat: '#d99a5b', leash: '#e5383b', cream: '#f4ead5' }
export const abandon: Scene = {
  id: 'abandon',
  label: '一只大狗乖乖坐着，牵着红绳的手松开，绳子掉在地上，脚印一路走远消失，只剩它独自留在空荡里',
  sfx: 'snap',
  hit: 0.5,
  render: () => (
    <g>
      <Field k="bg" color="#34405a" />
      <ellipse cx={160} cy={388} rx={120} ry={12} fill={INK} opacity={0.35} />
      {/* body */}
      <ellipse cx={160} cy={306} rx={82} ry={82} fill={AB.coat} stroke={INK} strokeWidth={6} />
      <ellipse cx={160} cy={318} rx={42} ry={60} fill={AB.cream} />
      <ellipse cx={128} cy={380} rx={26} ry={13} fill={AB.coat} stroke={INK} strokeWidth={5} />
      <ellipse cx={192} cy={380} rx={26} ry={13} fill={AB.coat} stroke={INK} strokeWidth={5} />
      {/* head pivots at the neck */}
      <K k="head" x={160} y={236}>
        <K k="earL" x={-52} y={-108}>
          <path d="M0 0 C-30 -4 -46 40 -36 92 C-18 98 -2 64 8 22 Z" fill={AB.coat} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </K>
        <K k="earR" x={52} y={-108}>
          <path d="M0 0 C30 -4 46 40 36 92 C18 98 2 64 -8 22 Z" fill={AB.coat} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </K>
        <circle cx={0} cy={-66} r={68} fill={AB.coat} stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-30} rx={36} ry={27} fill={AB.cream} />
        <ellipse cx={0} cy={-46} rx={13} ry={9} fill={INK} />
        <Ln d="M0 -38 L0 -24 M-14 -20 Q0 -12 14 -20" w={4} />
        <g data-k="eyes-happy">
          <Ln d="M-38 -78 Q-27 -94 -16 -78 M16 -78 Q27 -94 38 -78" w={6} />
          <path d="M-9 -18 Q0 0 9 -18 Z" fill={AB.leash} stroke={INK} strokeWidth={3} />
        </g>
        <g data-k="eyes-sad" opacity={0}>
          <circle cx={-26} cy={-76} r={8} fill={INK} />
          <circle cx={26} cy={-76} r={8} fill={INK} />
          <circle cx={-23} cy={-79} r={2.6} fill={WHITE} />
          <circle cx={29} cy={-79} r={2.6} fill={WHITE} />
          <Ln d="M-42 -88 L-14 -100 M14 -100 L42 -88" w={5} />
          <path d="M-28 -64 q6 10 0 15 q-6 -5 0 -15z" fill={WHITE} stroke={INK} strokeWidth={2} />
        </g>
      </K>
      {/* collar + tag */}
      <path d="M110 238 Q160 262 210 238 L210 256 Q160 280 110 256 Z" fill={AB.leash} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={160} cy={274} r={10} fill={AB.cream} stroke={INK} strokeWidth={4} />
      {/* leash: taut -> falling -> lying, as a three-frame flipbook */}
      <g data-k="leash-up">
        <Ln d="M160 274 Q232 176 280 78" w={8} c={AB.leash} />
      </g>
      <g data-k="leash-mid" opacity={0}>
        <Ln d="M160 274 Q226 236 236 330" w={8} c={AB.leash} />
      </g>
      <g data-k="leash-down" opacity={0}>
        <Ln d="M160 274 C168 330 214 388 262 390 L312 390" w={8} c={AB.leash} />
      </g>
      {/* footprints walking away */}
      {[
        [246, 340, 1.6],
        [276, 294, 1.3],
        [298, 256, 1.05],
        [314, 224, 0.85],
      ].map(([x, y, s], i) => (
        <K key={i} k={`fp${i}`} x={x} y={y} s={s} r={28} o={0}>
          <ellipse cx={i % 2 ? 9 : -9} cy={-8} rx={8} ry={13} fill={AB.cream} />
          <ellipse cx={i % 2 ? 9 : -9} cy={13} rx={6} ry={6} fill={AB.cream} />
        </K>
      ))}
      {/* the hand that lets go */}
      <K k="hand" x={280} y={78}>
        <path d="M14 -20 L80 -86 L112 -54 L40 12 Z" fill={INK} />
        <g data-k="fist">
          <circle r={26} fill={AB.cream} stroke={INK} strokeWidth={5} />
          <Ln d="M-14 -8 L-4 -10 M-12 4 L-2 2 M-8 14 L2 12" w={4} />
        </g>
        <g data-k="palm" opacity={0}>
          <circle r={22} fill={AB.cream} stroke={INK} strokeWidth={5} />
          <Ln d="M-14 -16 L-30 -34 M-20 -2 L-44 -10 M-18 12 L-40 22 M-6 20 L-14 42" w={9} c={INK} />
          <Ln d="M-14 -16 L-30 -34 M-20 -2 L-44 -10 M-18 12 L-40 22 M-6 20 L-14 42" w={4} c={AB.cream} />
        </g>
      </K>
    </g>
  ),
  tracks: [
    // Setup: the dog waits happily, looking up at the hand.
    tw('head', [[0, {}], ...wiggleStops(0, 0.4, 3, { r: -4 }, { r: 4 }), [0.45, { r: 0 }], [0.72, { r: 0 }], [0.86, { y: 16, r: -7 }, 'ease-out']]),
    tw('earL', [[0, { r: 26 }], [0.72, { r: 26 }], [0.84, { r: -6 }, 'ease-out']]),
    tw('earR', [[0, { r: -26 }], [0.72, { r: -26 }], [0.84, { r: 6 }, 'ease-out']]),
    flip('eyes-happy', [[0, 1], [0.6, 0]]),
    flip('eyes-sad', [[0, 0], [0.6, 1]]),
    // Action: the fist opens, the leash drops, the hand leaves.
    flip('fist', [[0, 1], [0.47, 0]]),
    flip('palm', [[0, 0], [0.47, 1]]),
    flip('leash-up', [[0, 1], [0.5, 0]]),
    flip('leash-mid', [[0, 0], [0.5, 1], [0.55, 0]]),
    flip('leash-down', [[0, 0], [0.55, 1]]),
    tw('hand', [[0, {}], ...wiggleStops(0, 0.4, 2, { y: -5 }, { y: 0 }), [0.5, {}], [0.64, { x: 140, y: -150 }, 'ease-in']]),
    fade('fp0', [[0, 0], [0.54, 0], [0.56, 1], [0.8, 1], [0.9, 0]]),
    fade('fp1', [[0, 0], [0.59, 0], [0.61, 1], [0.83, 1], [0.92, 0]]),
    fade('fp2', [[0, 0], [0.64, 0], [0.66, 1], [0.86, 1], [0.94, 0]]),
    fade('fp3', [[0, 0], [0.69, 0], [0.71, 1], [0.88, 1], [0.96, 0]]),
    // Aftermath: the field darkens around the dog left alone.
    css('bg', [[0, { fill: '#34405a' }], [0.7, { fill: '#34405a' }], [0.95, { fill: '#1b2130' }]]),
  ],
}

/* challenge — a towering jagged peak; a tiny climber hauls up its face and plants a red flag on top. */
const CH = { rock: '#34495e', flag: '#e63946', glow: '#f4a261' }
export const challenge: Scene = {
  id: 'challenge',
  label: '一座锯齿状的巨峰压满画面，一个小小的登山者沿山脊攀到峰顶，猛地插下一面红旗',
  sfx: 'slam',
  hit: 0.58,
  render: () => (
    <K k="cam">
      <Field color="#f3ead8" />
      <K k="glow" x={168} y={110} o={0}>
        <circle r={70} fill={CH.glow} />
        <Burst r0={84} r1={150} n={14} color={CH.glow} w={10} />
      </K>
      <K k="mtn" x={160} y={400}>
        <g transform="translate(-160 -360)">
          <path
            d="M-30 400 L36 256 L70 284 L110 170 L136 196 L168 70 L200 150 L222 128 L264 232 L292 208 L350 400 Z"
            fill={CH.rock}
            stroke={INK}
            strokeWidth={6}
            strokeLinejoin="round"
          />
          <path d="M168 70 L146 152 L158 140 L168 158 L180 138 L192 130 Z" fill={WHITE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <Ln d="M110 170 L122 250 M222 128 L210 230 M168 158 L172 260" w={4} c="#22313f" />
        </g>
      </K>
      <K k="flag" x={170} y={112}>
        <Ln d="M0 0 L0 -86" w={6} />
        <K k="cloth" y={-86}>
          <path d="M0 0 L66 16 L0 34 Z" fill={CH.flag} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </K>
      </K>
      <K k="climber" x={44} y={302}>
        <g transform="scale(1.5)">
        <g data-k="pose-climb">
          <circle cx={8} cy={-36} r={7} fill={INK} />
          <Ln d="M6 -28 L0 -12 L-7 0 M0 -12 L9 -2 M5 -24 L16 -32 M5 -24 L-4 -18" w={5} />
        </g>
        <g data-k="pose-win" opacity={0}>
          <circle cx={0} cy={-38} r={7} fill={INK} />
          <Ln d="M0 -30 L0 -12 L-7 0 M0 -12 L7 0 M0 -26 L-13 -42 M0 -26 L13 -42" w={5} />
        </g>
        </g>
      </K>
    </K>
  ),
  tracks: [
    // Setup: the peak looms; the climber inches up the ridge.
    tw('mtn', [[0, { s: 0.9 }], [0.4, { s: 1 }, 'ease-out']]),
    tw('climber', [[0, {}], [0.16, { x: 52, y: -70 }], [0.3, { x: 66, y: -86 }], [0.44, { x: 100, y: -150 }], [0.54, { x: 118, y: -190 }, 'ease-out']]),
    // Action: summit, flag rammed into the peak.
    tw('flag', [[0, { y: -80, o: 0 }], [0.52, { y: -80, o: 0 }], [0.53, { y: -80, o: 1 }], [0.58, { y: 0 }, 'ease-in']]),
    tw('cloth', [[0, { sx: 0.05 }], [0.58, { sx: 0.05 }], [0.66, { sx: 1 }, 'ease-out'], ...wiggleStops(0.66, 1, 4, { sx: 0.82, sy: 1.05 }, { sx: 1, sy: 1 })]),
    flip('pose-climb', [[0, 1], [0.6, 0]]),
    flip('pose-win', [[0, 0], [0.6, 1]]),
    tw('glow', [[0, { o: 0, s: 0.4 }], [0.58, { o: 0, s: 0.4 }], [0.68, { o: 1, s: 1 }, 'ease-out'], [1, { o: 0.9, s: 1.04 }]]),
    tw('cam', quake(0.58, 0.68, 6)),
  ],
}

/* benefit — water drops on a seed; it shoots up into a branch and drops one huge glowing fruit into open hands. */
const BE = { soil: '#6d4c3d', leaf: '#3fa34d', fruit: '#f3722c' }
export const benefit: Scene = {
  id: 'benefit',
  label: '水滴落在一颗种子上，它猛地长成枝繁叶茂的树枝，结出一颗发光的大果子，正好落进张开的双手',
  sfx: 'chime',
  hit: 0.7,
  render: () => (
    <g>
      <Field color="#f7efdc" />
      <K k="glow" x={228} y={306} o={0}>
        <Burst r0={54} r1={90} n={12} color={BE.fruit} w={8} />
      </K>
      <K k="plant" x={116} y={322}>
        <g transform="translate(-116 -322)">
          <Ln d="M116 322 C110 250 124 180 116 86" w={18} />
          <Ln d="M116 322 C110 250 124 180 116 86" w={11} c={BE.leaf} />
          <Ln d="M117 150 C160 126 204 118 228 144" w={15} />
          <Ln d="M117 150 C160 126 204 118 228 144" w={8} c={BE.leaf} />
          <ellipse cx={78} cy={206} rx={40} ry={20} transform="rotate(-30 78 206)" fill={BE.leaf} stroke={INK} strokeWidth={5} />
          <ellipse cx={150} cy={238} rx={36} ry={17} transform="rotate(24 150 238)" fill={BE.leaf} stroke={INK} strokeWidth={5} />
          <ellipse cx={92} cy={102} rx={34} ry={17} transform="rotate(-40 92 102)" fill={BE.leaf} stroke={INK} strokeWidth={5} />
          <ellipse cx={176} cy={100} rx={32} ry={16} transform="rotate(-20 176 100)" fill={BE.leaf} stroke={INK} strokeWidth={5} />
        </g>
      </K>
      <path d="M-20 400 C40 330 100 318 160 318 C220 318 280 330 340 400 Z" fill={BE.soil} stroke={INK} strokeWidth={6} />
      <K k="seed" x={116} y={316}>
        <ellipse rx={20} ry={13} fill={BE.fruit} stroke={INK} strokeWidth={5} />
      </K>
      <K k="hands" x={228} y={350}>
        <path d="M-70 -14 Q-68 36 0 40 Q68 36 70 -14 Q36 6 0 6 Q-36 6 -70 -14 Z" fill={WHITE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <Ln d="M0 8 L0 38 M-42 4 L-48 -10 M42 4 L48 -10" w={4} />
      </K>
      <K k="fruit" x={228} y={182}>
        <circle r={40} fill={BE.fruit} stroke={INK} strokeWidth={6} />
        <ellipse cx={-14} cy={-14} rx={10} ry={13} fill={WHITE} opacity={0.75} />
        <Ln d="M0 -40 L2 -50" w={6} />
      </K>
      {[0, 1, 2].map((i) => (
        <K key={i} k={`drop${i}`} x={116 + (i - 1) * 18} y={292} s={2.4}>
          <path d="M0 -14 Q9 0 0 6 Q-9 0 0 -14 Z" fill={WHITE} stroke={INK} strokeWidth={2.5} />
        </K>
      ))}
    </g>
  ),
  tracks: [
    // Setup: three drops water the seed; it swells.
    tw('drop0', [[0, { y: -320, o: 1 }], [0.14, { y: 0, o: 1 }, 'ease-in'], [0.16, { o: 0 }]]),
    tw('drop1', [[0, { y: -320, o: 1 }], [0.12, { y: -320 }], [0.26, { y: 0, o: 1 }, 'ease-in'], [0.28, { o: 0 }]]),
    tw('drop2', [[0, { y: -320, o: 1 }], [0.24, { y: -320 }], [0.38, { y: 0, o: 1 }, 'ease-in'], [0.4, { o: 0 }]]),
    tw('seed', [[0, {}], [0.16, { s: 1.1 }], [0.28, { s: 1.22 }], [0.42, { s: 1.38 }], [0.48, { s: 1.38, o: 1 }], [0.52, { s: 0.4, o: 0 }]]),
    // Action: the shoot rockets up, the fruit swells and falls into the hands.
    tw('plant', [[0, { sy: 0, sx: 0.4 }], [0.46, { sy: 0, sx: 0.4 }], [0.58, { sy: 1.06, sx: 1 }, 'ease-out'], [0.62, { sy: 1 }]]),
    tw('fruit', [[0, { s: 0 }], [0.57, { s: 0 }], [0.62, { s: 1.15 }, 'ease-out'], [0.64, { s: 1 }], [0.65, { s: 1 }], [0.7, { y: 124 }, 'ease-in'], [0.74, { y: 116, sy: 0.92 }], [0.78, { y: 124, sy: 1 }]]),
    tw('hands', [[0, { y: 90 }], [0.5, { y: 90 }], [0.62, { y: 0 }, 'ease-out'], [0.7, { y: 0 }], [0.73, { y: 8 }], [0.78, { y: 0 }]]),
    // Aftermath: the gift glows.
    tw('glow', [[0, { o: 0, s: 0.5 }], [0.7, { o: 0, s: 0.5 }], [0.8, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.8, 1, 2, { s: 1.08 }, { s: 1 })]),
  ],
}

/* collapse — a monumental pillar splits down a vermilion crack and crashes into rubble and dust. */
const CO = { stone: '#9aa3ad', crack: '#e8452c', dust: '#c8b89c' }
const CRACK = [
  [160, 40],
  [148, 92],
  [172, 140],
  [146, 200],
  [174, 258],
  [150, 306],
  [164, 340],
]
const crackPts = CRACK.map(([x, y]) => `${x},${y}`).join(' ')
function Pillar() {
  return (
    <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
      <rect x={74} y={28} width={172} height={40} rx={4} fill={CO.stone} />
      <rect x={102} y={68} width={116} height={272} fill={CO.stone} />
      <path d="M132 76 L132 334 M160 76 L160 334 M188 76 L188 334" strokeWidth={4} stroke="#6f7781" fill="none" />
    </g>
  )
}
export const collapse: Scene = {
  id: 'collapse',
  label: '一根顶天立地的石柱，从中间裂开一道朱红的裂缝，轰然直落成一地碎石和扬起的尘土',
  sfx: 'clatter',
  hit: 0.62,
  render: () => (
    <K k="cam">
      <Field color="#ede4d3" />
      <defs>
        <clipPath id="cw-col-l">
          <polygon points={`60,20 ${crackPts} 60,344`} />
        </clipPath>
        <clipPath id="cw-col-r">
          <polygon points={`260,20 ${crackPts} 260,344`} />
        </clipPath>
      </defs>
      <K k="halfL" x={102} y={340}>
        <g transform="translate(-102 -340)" clipPath="url(#cw-col-l)">
          <Pillar />
        </g>
      </K>
      <K k="halfR" x={218} y={340}>
        <g transform="translate(-218 -340)" clipPath="url(#cw-col-r)">
          <Pillar />
        </g>
      </K>
      <DrawPath k="crack" d={`M${CRACK.map(([x, y]) => `${x} ${y}`).join(' L')}`} c={CO.crack} w={9} />
      <K k="dust" x={160} y={330} o={0}>
        <g fill={CO.dust} stroke={INK} strokeWidth={4}>
          <circle cx={-96} cy={-6} r={42} />
          <circle cx={96} cy={-8} r={44} />
          <circle cx={-44} cy={-40} r={50} />
          <circle cx={48} cy={-44} r={52} />
          <circle cx={0} cy={-70} r={46} />
        </g>
      </K>
      <K k="rubble" x={160} y={372}>
        <g stroke={INK} strokeWidth={5} strokeLinejoin="round" fill={CO.stone}>
          <polygon points="-120,0 -100,-46 -52,-58 -40,0" />
          <polygon points="40,0 56,-62 110,-44 124,0" />
          <polygon points="-56,0 -36,-84 16,-96 36,-40 20,0" />
          <polygon points="-6,-70 30,-118 74,-88 50,-40" />
          <polygon points="-96,-44 -70,-96 -34,-78 -48,-40" />
        </g>
        <Ln d="M-30 -80 L-10 -40 L-20 -6 M54 -54 L74 -20" w={5} c={CO.crack} />
      </K>
      <rect x={74} y={340} width={172} height={36} rx={4} fill={CO.stone} stroke={INK} strokeWidth={6} />
    </K>
  ),
  tracks: [
    // Setup: the crack races down the shaft as the pillar trembles.
    css('crack', [
      [0, { strokeDashoffset: '1px', opacity: 1 }],
      [0.12, { strokeDashoffset: '1px', opacity: 1 }],
      [0.44, { strokeDashoffset: '0px', opacity: 1 }],
      [0.47, { strokeDashoffset: '0px', opacity: 1 }],
      [0.5, { strokeDashoffset: '0px', opacity: 0 }],
    ]),
    tw('cam', [[0, {}], ...shakeStops(0.26, 0.46, 8, 'x', 1.5, 3), ...shakeStops(0.62, 0.76, 8, 'y', 9, 0)]),
    // Action: the halves split and drop straight down.
    tw('halfL', [[0, {}], [0.46, {}], [0.62, { y: 230, r: -16 }, 'ease-in'], [0.63, { o: 0 }]]),
    tw('halfR', [[0, {}], [0.46, {}], [0.62, { y: 230, r: 14 }, 'ease-in'], [0.63, { o: 0 }]]),
    tw('rubble', [[0, { sy: 0, o: 0 }], [0.6, { sy: 0, o: 0 }], [0.61, { sy: 0.3, o: 1 }], [0.66, { sy: 1.1 }, 'ease-out'], [0.7, { sy: 1 }]]),
    // Aftermath: a bold dust cloud billows and settles.
    tw('dust', [[0, { o: 0, s: 0.3 }], [0.61, { o: 0, s: 0.3 }], [0.7, { o: 0.95, s: 1.15 }, 'ease-out'], [1, { o: 0.55, s: 1.3 }]]),
  ],
}

/* significant — five bars; four stay tiny while the crimson one rockets up and shakes the frame. */
const SI = { gray: '#b8b2a7', red: '#d62839', gold: '#f4b400' }
const BAR_X = [36, 98, 160, 222, 284]
export const significant: Scene = {
  id: 'significant',
  label: '五根柱子，四根一直矮矮的，中间那根深红色的柱子猛地冲天而起，把画面都震动了',
  sfx: 'whoosh',
  hit: 0.56,
  render: () => (
    <K k="cam">
      <Field color="#f4f0e8" />
      <K k="burst" x={160} y={62} o={0}>
        <Burst r0={34} r1={70} n={12} color={SI.gold} w={9} />
      </K>
      <K k="streaks" o={0}>
        <Ln d="M112 120 L112 230 M208 120 L208 230 M96 180 L96 300 M224 180 L224 300" w={5} c={SI.gray} />
      </K>
      {BAR_X.map((x, i) =>
        i === 2 ? (
          <K key={i} k="hero" x={x} y={362}>
            <rect x={-32} y={-300} width={64} height={300} rx={6} fill={SI.red} stroke={INK} strokeWidth={6} />
          </K>
        ) : (
          <K key={i} k={`bar${i}`} x={x} y={362}>
            <rect x={-24} y={-62} width={48} height={62} rx={5} fill={SI.gray} stroke={INK} strokeWidth={6} />
          </K>
        ),
      )}
      <Ln d="M8 362 L312 362" w={8} />
    </K>
  ),
  tracks: [
    // Setup: all five rise to the same modest height.
    tw('bar0', [[0, { sy: 0 }], [0.12, { sy: 1 }, 'ease-out'], [0.56, { sy: 1 }], [0.62, { sy: 0.72, o: 0.55 }, 'ease-out']]),
    tw('bar1', [[0, { sy: 0 }], [0.04, { sy: 0 }], [0.16, { sy: 1 }, 'ease-out'], [0.56, { sy: 1 }], [0.62, { sy: 0.72, o: 0.55 }, 'ease-out']]),
    tw('bar3', [[0, { sy: 0 }], [0.12, { sy: 0 }], [0.24, { sy: 1 }, 'ease-out'], [0.56, { sy: 1 }], [0.62, { sy: 0.72, o: 0.55 }, 'ease-out']]),
    tw('bar4', [[0, { sy: 0 }], [0.16, { sy: 0 }], [0.28, { sy: 1 }, 'ease-out'], [0.56, { sy: 1 }], [0.62, { sy: 0.72, o: 0.55 }, 'ease-out']]),
    tw('hero', [
      [0, { sy: 0 }],
      [0.08, { sy: 0 }],
      [0.2, { sy: 0.21 }, 'ease-out'],
      [0.36, { sy: 0.2 }],
      [0.42, { sy: 0.23 }],
      [0.46, { sy: 0.2 }],
      // Action: rocket up with overshoot.
      [0.56, { sy: 1.07 }, 'ease-out'],
      [0.62, { sy: 0.98 }],
      [0.68, { sy: 1 }],
    ]),
    tw('streaks', [[0, { o: 0 }], [0.46, { o: 0, y: 60 }], [0.52, { o: 1, y: 0 }], [0.6, { o: 0, y: -60 }]]),
    tw('burst', [[0, { o: 0, s: 0.3 }], [0.56, { o: 0, s: 0.3 }], [0.66, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.72, 1, 2, { s: 1.1 }, { s: 1 })]),
    tw('cam', quake(0.56, 0.7, 7, 10)),
  ],
}

/* adequate — a plank drops into the chasm and fits flush between the ledges, then locks with a green pulse. */
const AD = { rock: '#5c4033', wood: '#d9a05b', ok: '#2a9d4b' }
export const adequate: Scene = {
  id: 'adequate',
  label: '一道深谷横在中间，一块厚木板落下，严丝合缝地卡进两边崖口，绿光一闪锁定',
  sfx: 'breath',
  hit: 0.56,
  render: () => (
    <K k="cam">
      <Field color="#e6f0f1" />
      <path d="M-30 210 L110 210 L110 262 L98 300 L112 340 L94 410 L-30 410 Z" fill={AD.rock} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M350 210 L210 210 L210 262 L222 300 L206 340 L226 410 L350 410 Z" fill={AD.rock} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <K k="ghost" o={0}>
        <rect x={110} y={210} width={100} height={40} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
        <Ln d="M110 186 L210 186 M110 176 L110 196 M210 176 L210 196" w={4} />
      </K>
      <K k="plank" x={160} y={230}>
        <rect x={-50} y={-20} width={100} height={40} rx={3} fill={AD.wood} stroke={INK} strokeWidth={5} />
        <Ln d="M-40 -6 L10 -6 M-20 8 L40 8" w={3} />
      </K>
      <K k="lock" x={160} y={230} o={0}>
        <rect x={-58} y={-28} width={116} height={56} rx={6} fill="none" stroke={AD.ok} strokeWidth={8} />
      </K>
      <K k="check" x={160} y={124} o={0}>
        <circle r={40} fill={AD.ok} stroke={INK} strokeWidth={6} />
        <Ln d="M-18 0 L-5 14 L20 -14" w={10} c={WHITE} />
      </K>
    </K>
  ),
  tracks: [
    // Setup: the plank dangles above; the exact gap is measured out.
    tw('plank', [
      [0, { y: -170, r: 10 }],
      ...wiggleStops(0, 0.42, 2, { r: -7, y: -162 }, { r: 7, y: -170 }),
      [0.46, { y: -170, r: 0 }],
      // Action: drop and seat flush.
      [0.56, { y: 0, r: 0 }, 'ease-in'],
      [0.58, { sy: 0.88 }],
      [0.62, { sy: 1 }],
    ]),
    fade('ghost', [[0, 0], [0.12, 0], [0.24, 1], [0.5, 1], [0.56, 0]]),
    tw('lock', [[0, { o: 0, s: 1.3 }], [0.57, { o: 0, s: 1.3 }], [0.63, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.72, 1, 2, { s: 1.06 }, { s: 1 })]),
    tw('check', [[0, { o: 0, s: 0.2 }], [0.62, { o: 0, s: 0.2 }], [0.7, { o: 1, s: 1.12 }, 'ease-out'], [0.76, { s: 1 }]]),
    tw('cam', quake(0.56, 0.64, 4, 6)),
  ],
}

/* environment — a goldfish in murky sludge; a wave of clear blue water flushes it out. */
const EN = { murk: '#7d7461', water: '#3aa6e0', fish: '#f77f00' }
export const environment: Scene = {
  id: 'environment',
  label: '巨大的玻璃鱼缸里，一条金鱼困在浑浊的灰泥水中，一股清澈的蓝水冲进来把脏水推走，四周顿时清亮',
  sfx: 'splash',
  hit: 0.55,
  render: () => (
    <g>
      <Field color="#f1ece2" />
      <defs>
        <clipPath id="cw-bowl">
          <path d="M28 150 L292 150 L292 400 L28 400 Z" />
        </clipPath>
        <clipPath id="cw-bowl-in">
          <circle cx={160} cy={226} r={128} />
        </clipPath>
      </defs>
      <circle cx={160} cy={226} r={132} fill={WHITE} />
      <g clipPath="url(#cw-bowl-in)">
        <g clipPath="url(#cw-bowl)">
          <K k="clear">
            <path d="M-310 150 L20 150 Q44 210 12 268 Q-18 326 20 392 L-310 392 Z" fill={EN.water} />
            <Ln d="M20 150 Q44 210 12 268 Q-18 326 20 392" w={8} c={WHITE} />
          </K>
          <K k="fish" x={168} y={262}>
            <path d="M-46 0 L-92 -34 L-82 0 L-92 34 Z" fill={EN.fish} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M-6 -30 Q14 -58 34 -30 Z" fill={EN.fish} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <ellipse rx={56} ry={36} fill={EN.fish} stroke={INK} strokeWidth={5} />
            <circle cx={28} cy={-8} r={11} fill={WHITE} stroke={INK} strokeWidth={4} />
            <g data-k="fish-sad">
              <circle cx={30} cy={-5} r={4.5} fill={INK} />
              <Ln d="M16 -14 L40 -18" w={5} />
              <Ln d="M38 18 Q46 12 52 16" w={4} />
            </g>
            <g data-k="fish-happy" opacity={0}>
              <circle cx={30} cy={-9} r={5.5} fill={INK} />
              <Ln d="M36 12 Q46 22 54 10" w={4} />
            </g>
          </K>
          <K k="murk">
            <path d="M20 150 Q44 210 12 268 Q-18 326 20 392 L330 392 L330 150 Z" fill={EN.murk} opacity={0.88} />
            <g fill={INK} opacity={0.35}>
              <circle cx={80} cy={190} r={6} />
              <circle cx={230} cy={180} r={5} />
              <circle cx={250} cy={300} r={7} />
              <circle cx={110} cy={330} r={5} />
              <circle cx={180} cy={350} r={6} />
            </g>
          </K>
          <K k="bubbles" o={0}>
            <g fill="none" stroke={WHITE} strokeWidth={4}>
              <circle cx={232} cy={210} r={9} />
              <circle cx={246} cy={180} r={6} />
              <circle cx={238} cy={160} r={4} />
            </g>
          </K>
        </g>
      </g>
      <circle cx={160} cy={226} r={132} fill="none" stroke={INK} strokeWidth={7} />
      <Ln d="M66 168 Q78 132 106 112" w={9} c={WHITE} />
      <ellipse cx={160} cy={100} rx={64} ry={12} fill={WHITE} stroke={INK} strokeWidth={6} />
      <Ln d="M54 150 L266 150" w={4} c={INK} />
    </g>
  ),
  tracks: [
    // Setup: the fish droops in the sludge.
    tw('fish', [[0, {}], [0.44, { y: 18, r: 10 }], [0.56, { y: 18, r: 10 }], [0.7, { y: -6, r: -8 }, 'ease-out'], ...wiggleStops(0.72, 1, 3, { x: 6, r: -4 }, { x: -2, r: -8 })]),
    flip('fish-sad', [[0, 1], [0.62, 0]]),
    flip('fish-happy', [[0, 0], [0.62, 1]]),
    // Action: the clear wave sweeps in and shoves the murk out.
    tw('clear', [[0, {}], [0.45, {}], [0.66, { x: 320 }, 'ease-in-out']]),
    tw('murk', [[0, {}], [0.45, {}], [0.66, { x: 320 }, 'ease-in-out']]),
    // Aftermath: fresh bubbles.
    tw('bubbles', [[0, { o: 0, y: 30 }], [0.7, { o: 0, y: 30 }], [0.78, { o: 1, y: 0 }], [1, { o: 1, y: -30 }]]),
  ],
}

/* factor — red and blue blocks level a giant scale; the gold block drops in and tips it decisively. */
const FA = { a: '#e63946', b: '#277da1', c: '#f9c74f' }
export const factor: Scene = {
  id: 'factor',
  label: '一架巨大的天平，红块、蓝块先后落上把它压平，最后一块金色方块砸下，整架天平决定性地倒向一边',
  sfx: 'boing',
  hit: 0.55,
  render: () => (
    <K k="cam">
      <Field color="#f3eee4" />
      <path d="M176 252 L120 362 L232 362 Z" fill={INK} />
      <rect x={86} y={358} width={180} height={18} rx={4} fill={INK} />
      <K k="beam" x={176} y={252} r={0}>
        <K k="weight" x={92} y={-10}>
          <rect x={-36} y={-72} width={72} height={72} rx={6} fill={INK} />
          <rect x={-12} y={-86} width={24} height={18} rx={4} fill="none" stroke={INK} strokeWidth={6} />
        </K>
        <rect x={-136} y={-10} width={272} height={20} rx={6} fill={INK} />
        <circle r={7} fill={WHITE} />
        <K k="b1" x={-84} y={-10}>
          <rect x={-34} y={-46} width={68} height={46} rx={5} fill={FA.a} stroke={INK} strokeWidth={5} />
        </K>
        <K k="b2" x={-84} y={-56}>
          <rect x={-34} y={-46} width={68} height={46} rx={5} fill={FA.b} stroke={INK} strokeWidth={5} />
        </K>
        <K k="b3" x={-84} y={-102}>
          <rect x={-40} y={-56} width={80} height={56} rx={6} fill={FA.c} stroke={INK} strokeWidth={5} />
        </K>
        <K k="thud" x={-84} y={-102} o={0}>
          <Burst r0={56} r1={84} n={10} w={6} />
        </K>
      </K>
    </K>
  ),
  tracks: [
    // Setup: two blocks land and nearly level the beam.
    tw('b1', [[0, { y: -420 }], [0.06, { y: -420 }], [0.16, { y: 0 }, 'ease-in'], [0.18, { sy: 0.9 }], [0.21, { sy: 1 }]]),
    tw('b2', [[0, { y: -420 }], [0.22, { y: -420 }], [0.32, { y: 0 }, 'ease-in'], [0.34, { sy: 0.9 }], [0.37, { sy: 1 }]]),
    tw('beam', [
      [0, { r: 15 }],
      [0.16, { r: 15 }],
      [0.2, { r: 8 }, 'ease-out'],
      [0.32, { r: 8 }],
      [0.36, { r: 2 }, 'ease-out'],
      [0.42, { r: 3 }],
      [0.46, { r: 1 }],
      // Action: the third block hits and slams the beam over.
      [0.55, { r: 1 }],
      [0.61, { r: -15 }, 'ease-in'],
      [0.65, { r: -11 }],
      [0.7, { r: -12 }],
    ]),
    tw('b3', [[0, { y: -440 }], [0.45, { y: -440 }], [0.55, { y: 0 }, 'ease-in'], [0.57, { sy: 0.86 }], [0.62, { sy: 1 }]]),
    tw('weight', [[0, {}], [0.6, {}], [0.64, { y: -26 }, 'ease-out'], [0.7, { y: 0 }, 'ease-in']]),
    tw('thud', [[0, { o: 0, s: 0.5 }], [0.55, { o: 0, s: 0.5 }], [0.6, { o: 1, s: 1 }], [0.72, { o: 0, s: 1.3 }]]),
    tw('cam', quake(0.6, 0.7, 5)),
  ],
}

/* approach — a jagged red jab bounces off the cat; a smooth curve glides a hand in until they meet warmly. */
const AP = { cat: '#f4a259', jab: '#e63946', soft: '#3a86ff' }
const AP_CURVE: [number, number][] = [
  [20, 380],
  [52, 260],
  [110, 246],
  [160, 240],
]
function bezier(t: number): [number, number] {
  const [p0, p1, p2, p3] = AP_CURVE
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}
const handPath: Stop[] = [0, 0.25, 0.5, 0.75, 1].map((t, i) => {
  const [x, y] = bezier(t)
  return [0.45 + t * 0.25, { x: x - AP_CURVE[3][0], y: y - AP_CURVE[3][1], r: -40 + t * 20, o: 1 }, i === 0 ? 'linear' : 'ease-out']
})
export const approach: Scene = {
  id: 'approach',
  label: '一支锯齿状的红箭冲向大猫被弹飞，另一条平缓的弧线让一只手慢慢靠近，最后温柔地贴上猫脸',
  sfx: 'purr',
  hit: 0.7,
  render: () => (
    <g>
      <Field color="#f6efe3" />
      <ellipse cx={226} cy={306} rx={84} ry={92} fill={AP.cat} stroke={INK} strokeWidth={6} />
      <K k="tail" x={290} y={350}>
        <Ln d="M0 0 C40 -30 34 -100 10 -114" w={24} />
        <Ln d="M0 0 C40 -30 34 -100 10 -114" w={15} c={AP.cat} />
      </K>
      <ellipse cx={226} cy={320} rx={44} ry={58} fill={WHITE} />
      <K k="cathead" x={222} y={196}>
        <path d="M-56 -26 L-46 -94 L-8 -58 Z M8 -58 L46 -94 L56 -26 Z" fill={AP.cat} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle r={64} fill={AP.cat} stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={22} rx={26} ry={18} fill={WHITE} />
        <path d="M-7 8 L7 8 L0 16 Z" fill={INK} />
        <Ln d="M-30 18 L-62 10 M-30 26 L-62 30 M30 18 L62 10 M30 26 L62 30" w={3} />
        <g data-k="cat-calm">
          <ellipse cx={-24} cy={-8} rx={7} ry={11} fill={INK} />
          <ellipse cx={24} cy={-8} rx={7} ry={11} fill={INK} />
          <Ln d="M-8 26 Q0 32 8 26" w={4} />
        </g>
        <g data-k="cat-angry" opacity={0}>
          <Ln d="M-38 -26 L-12 -14 M12 -14 L38 -26" w={6} />
          <ellipse cx={-24} cy={-4} rx={7} ry={6} fill={INK} />
          <ellipse cx={24} cy={-4} rx={7} ry={6} fill={INK} />
          <path d="M-12 24 Q0 44 12 24 Z" fill={INK} />
        </g>
        <g data-k="cat-happy" opacity={0}>
          <Ln d="M-34 -6 Q-24 -18 -14 -6 M14 -6 Q24 -18 34 -6" w={6} />
          <Ln d="M-10 26 Q0 36 10 26" w={4} />
          <ellipse cx={-38} cy={12} rx={9} ry={5} fill={AP.jab} opacity={0.5} />
          <ellipse cx={38} cy={12} rx={9} ry={5} fill={AP.jab} opacity={0.5} />
        </g>
      </K>
      <K k="clash" x={150} y={196} o={0}>
        <Burst r0={14} r1={34} n={8} color={AP.jab} w={6} />
      </K>
      <K k="jab" x={40} y={190}>
        <Ln d="M-60 0 L-30 -20 L0 14 L30 -16 L64 6" w={11} c={AP.jab} />
        <path d="M58 -14 L92 10 L58 26 Z" fill={AP.jab} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </K>
      <DrawPath k="path" d={`M${AP_CURVE[0].join(' ')} C${AP_CURVE.slice(1).map((p) => p.join(' ')).join(' ')}`} c={AP.soft} w={7} />
      <K x={AP_CURVE[3][0]} y={AP_CURVE[3][1]}>
        <K k="hand" o={0}>
          <rect x={-14} y={16} width={28} height={70} rx={8} fill={AP.soft} stroke={INK} strokeWidth={5} />
          <ellipse rx={20} ry={22} fill={WHITE} stroke={INK} strokeWidth={5} />
          <Ln d="M-12 -14 L-16 -34 M-3 -18 L-4 -40 M7 -16 L10 -36 M16 -8 L26 -22" w={10} />
          <Ln d="M-12 -14 L-16 -34 M-3 -18 L-4 -40 M7 -16 L10 -36 M16 -8 L26 -22" w={5} c={WHITE} />
        </K>
      </K>
      <K k="heart" x={204} y={96} o={0}>
        <path d="M0 18 C-30 -4 -24 -30 0 -16 C24 -30 30 -4 0 18 Z" fill={AP.jab} stroke={INK} strokeWidth={5} />
      </K>
    </g>
  ),
  tracks: [
    // Setup: the aggressive jab hits and bounces off; the cat bristles.
    tw('jab', [[0, { x: -220 }], [0.08, { x: -220 }], [0.18, { x: 18 }, 'ease-in'], [0.34, { x: -80, y: 150, r: -70 }, 'ease-out'], [0.4, { o: 0, x: -100, y: 180, r: -90 }]]),
    tw('clash', [[0, { o: 0, s: 0.4 }], [0.18, { o: 0, s: 0.4 }], [0.2, { o: 1, s: 1 }], [0.3, { o: 0, s: 1.4 }]]),
    flip('cat-calm', [[0, 1], [0.18, 0], [0.48, 1], [0.72, 0]]),
    flip('cat-angry', [[0, 0], [0.18, 1], [0.48, 0]]),
    flip('cat-happy', [[0, 0], [0.72, 1]]),
    tw('cathead', [[0, {}], [0.18, {}], [0.22, { x: 12, r: 8 }, 'ease-out'], [0.44, { x: 6, r: 4 }], [0.52, {}], [0.7, {}], [0.8, { r: -10, x: -4 }, 'ease-out']]),
    // Action: the gentle curve draws in and the hand glides along it.
    draw('path', 0.45, 0.62),
    tw('hand', [[0, { ...handPath[0][1], o: 0 }], [0.44, { ...handPath[0][1], o: 0 }], ...handPath]),
    // Aftermath: purring contentment.
    tw('heart', [[0, { o: 0, s: 0.3 }], [0.72, { o: 0, s: 0.3 }], [0.8, { o: 1, s: 1.2 }, 'ease-out'], [0.86, { s: 1 }], [1, { y: -14 }]]),
    tw('tail', [[0, {}], ...wiggleStops(0.72, 1, 3, { r: -10 }, { r: 6 })]),
  ],
}

/* evidence — on a dark table a spotlight snaps on, a giant magnifier slams over a muddy footprint: MATCH. */
const EV = { mud: '#8b5a2b', light: '#ffe8a3', red: '#ef233c' }
export const evidence: Scene = {
  id: 'evidence',
  label: '漆黑的桌面上聚光灯啪地亮起，一只巨大的放大镜猛地压在一个泥脚印上，红框锁定：吻合',
  sfx: 'sting',
  hit: 0.56,
  render: () => (
    <K k="cam">
      <Field color="#1e2126" />
      <g data-k="spot" opacity={0}>
        <path d="M128 -10 L192 -10 L304 240 L16 240 Z" fill={EV.light} opacity={0.18} />
        <ellipse cx={160} cy={240} rx={146} ry={136} fill={EV.light} />
      </g>
      <K k="print" x={160} y={236} r={-12}>
        <path d="M-34 -96 C-8 -118 34 -110 40 -70 C46 -30 30 10 0 14 C-30 14 -46 -30 -44 -60 C-43 -80 -40 -90 -34 -96 Z" fill={EV.mud} />
        <ellipse cx={0} cy={72} rx={30} ry={34} fill={EV.mud} />
        <Ln d="M-30 -70 L32 -78 M-36 -44 L38 -50 M-34 -18 L34 -22 M-22 62 L22 62 M-24 82 L24 82" w={5} c={EV.light} />
      </K>
      <K k="glass" x={150} y={226}>
        <circle r={96} fill={WHITE} opacity={0.14} />
        <Ln d="M70 70 L136 136" w={30} />
        <Ln d="M70 70 L136 136" w={20} c={EV.mud} />
        <circle r={96} fill="none" stroke={WHITE} strokeWidth={16} />
        <circle r={96} fill="none" stroke={INK} strokeWidth={4} />
      </K>
      <K k="match" x={160} y={236} o={0}>
        <Ln d="M-122 -96 L-122 -130 L-88 -130 M88 -130 L122 -130 L122 -96 M122 96 L122 130 L88 130 M-88 130 L-122 130 L-122 96" w={10} c={EV.red} />
        <rect x={-74} y={122} width={148} height={38} rx={6} fill={EV.red} />
        <text x={0} y={150} textAnchor="middle" fontSize={28} fontWeight={900} fill={WHITE} fontFamily="system-ui, sans-serif" letterSpacing={3}>
          MATCH
        </text>
      </K>
    </K>
  ),
  tracks: [
    // Setup: a faint print in the dark; the spotlight snaps on.
    flip('spot', [[0, 0], [0.26, 1]]),
    tw('print', [[0, { o: 0.35 }], [0.26, { o: 1 }], [0.56, {}], [0.58, { s: 1.18 }, 'ease-out']]),
    // Action: the magnifier slams down.
    tw('glass', [[0, { x: 300, y: -380, s: 1.5, r: 20 }], [0.42, { x: 300, y: -380, s: 1.5, r: 20 }], [0.56, { x: 0, y: 0, s: 1, r: 0 }, 'ease-in'], [0.59, { s: 0.95 }], [0.63, { s: 1 }]]),
    tw('cam', quake(0.56, 0.66, 6)),
    // Aftermath: MATCH locks on and pulses.
    tw('match', [[0, { o: 0, s: 1.4 }], [0.64, { o: 0, s: 1.4 }], [0.72, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.76, 1, 2, { s: 1.04 }, { s: 1 })]),
  ],
}
