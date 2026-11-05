import { Burst, Field, Gear, INK, K, Ln, WHITE } from './cast'
import { DrawPath, draw, quake } from './scenesA'
import { css, fade, flip, tw, wiggleStops, type Scene } from './timeline'

/* adjacent — knock on the left door; the shared wall shudders and the right door next to it pops open. */
const AJ = { wood: '#6f4e37', door: '#2a6f97', light: '#f4b942' }
export const adjacent: Scene = {
  id: 'adjacent',
  label: '两扇大门并排共用中间一道门框，敲响左边那扇，紧挨着的右门跟着震动，砰地弹开',
  sfx: 'cymbal',
  hit: 0.6,
  render: () => (
    <g>
      <Field color="#f2ebe0" />
      <rect x={26} y={44} width={268} height={336} rx={4} fill={AJ.wood} stroke={INK} strokeWidth={6} />
      <rect x={168} y={62} width={108} height={318} fill={AJ.light} />
      <K k="glow" x={222} y={220} o={0}>
        <Burst r0={40} r1={96} n={10} color={WHITE} w={8} />
      </K>
      <K k="doorL" x={44} y={62}>
        <rect x={0} y={0} width={108} height={318} fill={AJ.door} stroke={INK} strokeWidth={6} />
        <rect x={16} y={20} width={76} height={110} rx={3} fill="none" stroke={INK} strokeWidth={4} />
        <rect x={16} y={160} width={76} height={136} rx={3} fill="none" stroke={INK} strokeWidth={4} />
        <circle cx={92} cy={160} r={9} fill={AJ.light} stroke={INK} strokeWidth={4} />
      </K>
      <K k="post" x={160} y={62}>
        <rect x={-10} y={-18} width={20} height={336} fill={AJ.wood} stroke={INK} strokeWidth={5} />
      </K>
      <K k="doorR" x={276} y={62}>
        <rect x={-108} y={0} width={108} height={318} fill={AJ.door} stroke={INK} strokeWidth={6} />
        <rect x={-92} y={20} width={76} height={110} rx={3} fill="none" stroke={INK} strokeWidth={4} />
        <rect x={-92} y={160} width={76} height={136} rx={3} fill="none" stroke={INK} strokeWidth={4} />
        <circle cx={-92} cy={160} r={9} fill={AJ.light} stroke={INK} strokeWidth={4} />
      </K>
      <K k="waves" x={168} y={190} o={0}>
        <Ln d="M10 -40 Q30 0 10 40 M30 -56 Q58 0 30 56 M50 -70 Q86 0 50 70" w={6} c={WHITE} />
      </K>
      <K k="knockfx" x={86} y={190} o={0}>
        <Burst r0={34} r1={54} n={8} color={WHITE} w={6} />
      </K>
      <K k="fist" x={70} y={196}>
        <path d="M-40 10 L-120 60 L-120 110 L-30 40 Z" fill={INK} />
        <circle r={30} fill={WHITE} stroke={INK} strokeWidth={6} />
        <Ln d="M10 -18 L18 -8 M14 0 L22 8 M8 16 L16 22" w={4} />
      </K>
    </g>
  ),
  tracks: [
    // Setup: three knocks on the left door.
    tw('fist', [
      [0, { x: -40 }],
      [0.08, { x: -40 }],
      [0.14, { x: 0 }, 'ease-in'],
      [0.18, { x: -24 }],
      [0.24, { x: 0 }, 'ease-in'],
      [0.28, { x: -24 }],
      [0.34, { x: 0 }, 'ease-in'],
      [0.44, { x: -60, o: 1 }],
      [0.52, { x: -160, o: 0 }],
    ]),
    tw('knockfx', [[0, { o: 0 }], [0.14, { o: 0 }], [0.15, { o: 1 }], [0.19, { o: 0 }], [0.24, { o: 0 }], [0.25, { o: 1 }], [0.29, { o: 0 }], [0.34, { o: 0 }], [0.35, { o: 1, s: 1.2 }], [0.4, { o: 0, s: 1.2 }]]),
    tw('doorL', [[0, {}], [0.14, {}], [0.15, { x: 3 }], [0.17, {}], [0.24, {}], [0.25, { x: 3 }], [0.27, {}], [0.34, {}], [0.35, { x: 4 }], [0.38, {}]]),
    // Action: the shared post carries it straight into the right door, which pops open.
    tw('post', [[0, {}], [0.4, {}], ...wiggleStops(0.4, 0.56, 4, { x: -3 }, { x: 3 }), [0.58, { x: 0 }]]),
    tw('waves', [[0, { o: 0, x: -10 }], [0.42, { o: 0, x: -10 }], [0.48, { o: 1, x: 0 }], [0.58, { o: 0, x: 16 }]]),
    tw('doorR', [[0, {}], [0.46, {}], ...wiggleStops(0.46, 0.58, 4, { x: -3 }, { x: 3 }), [0.6, { x: 0, sx: 1 }], [0.65, { sx: 0.14 }, 'ease-out'], [0.7, { sx: 0.22 }], [0.74, { sx: 0.18 }]]),
    // Aftermath: light spills from the room next door.
    tw('glow', [[0, { o: 0, s: 0.5 }], [0.62, { o: 0, s: 0.5 }], [0.74, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.76, 1, 2, { s: 1.06 }, { s: 1 })]),
  ],
}

/* structure — a dome peels back its shell in X-ray view to reveal the load-bearing trusses. */
const ST = { shell: '#e9c46a', truss: '#f4845f', field: '#16324f' }
const DOME_C = { x: 160, y: 320 }
function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [DOME_C.x + Math.cos(a) * r, DOME_C.y - Math.sin(a) * r]
}
const ANGLES = [180, 150, 120, 90, 60, 30, 0]
function Truss() {
  const outer = ANGLES.map((a) => polar(134, a))
  const inner = ANGLES.map((a) => polar(80, a))
  const ribs = ANGLES.map((_, i) => `M${DOME_C.x} ${DOME_C.y} L${outer[i].join(' ')}`).join(' ')
  const ring = (pts: [number, number][]) => `M${pts.map((p) => p.join(' ')).join(' L')}`
  const diag = ANGLES.slice(0, -1)
    .map((_, i) => `M${inner[i].join(' ')} L${outer[i + 1].join(' ')} M${outer[i].join(' ')} L${inner[i + 1].join(' ')}`)
    .join(' ')
  return (
    <g>
      <Ln d={diag} w={5} c={ST.truss} />
      <Ln d={`${ribs} ${ring(outer)} ${ring(inner)}`} w={9} c={ST.truss} />
      {[...outer, ...inner].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={WHITE} />
      ))}
    </g>
  )
}
export const structure: Scene = {
  id: 'structure',
  label: '一座巨大的穹顶，外壳像X光一样向两边剥开，露出里面交错咬合、撑起整座穹顶的钢桁架骨架',
  sfx: 'rumble',
  hit: 0.56,
  render: () => (
    <K k="cam">
      <Field color={ST.field} />
      <K k="truss" x={160} y={320}>
        <g transform="translate(-160 -320)">
          <Truss />
        </g>
      </K>
      <K k="ghost" o={0}>
        <path d="M14 320 A146 146 0 0 1 306 320" fill="none" stroke={WHITE} strokeWidth={4} strokeDasharray="12 10" />
      </K>
      <K k="shellL" x={14} y={320}>
        <g transform="translate(-14 -320)">
          <path d="M160 320 L14 320 A146 146 0 0 1 160 174 Z" fill={ST.shell} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <Ln d="M54 320 A106 106 0 0 1 160 214 M94 320 A66 66 0 0 1 160 254 M38 254 L66 270 M88 196 L104 222" w={4} c="#b8963f" />
        </g>
      </K>
      <K k="shellR" x={306} y={320}>
        <g transform="translate(-306 -320)">
          <path d="M160 320 L160 174 A146 146 0 0 1 306 320 Z" fill={ST.shell} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <Ln d="M160 214 A106 106 0 0 1 266 320 M160 254 A66 66 0 0 1 226 320 M282 254 L254 270 M232 196 L216 222" w={4} c="#b8963f" />
        </g>
      </K>
      <K k="scan" x={0} y={0} o={0}>
        <rect x={-8} y={150} width={16} height={190} fill={WHITE} opacity={0.85} />
      </K>
      <rect x={-20} y={320} width={360} height={30} fill={ST.shell} stroke={INK} strokeWidth={6} />
      <K k="loads" o={0}>
        <path d="M160 70 L160 140 M144 124 L160 142 L176 124" fill="none" stroke={WHITE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 392 L24 360 M10 372 L24 358 L38 372 M296 392 L296 360 M282 372 L296 358 L310 372" fill="none" stroke={WHITE} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      </K>
    </K>
  ),
  tracks: [
    // Setup: a solid dome; an X-ray band scans across it.
    tw('scan', [[0, { x: 0, o: 0 }], [0.16, { x: 10, o: 0 }], [0.2, { x: 30, o: 1 }], [0.42, { x: 300, o: 1 }], [0.45, { x: 320, o: 0 }]]),
    // Action: the shell halves peel back and away.
    tw('shellL', [[0, {}], [0.46, {}], [0.5, { r: -6 }], [0.62, { r: -58, x: -40, o: 0 }, 'ease-in']]),
    tw('shellR', [[0, {}], [0.46, {}], [0.5, { r: 6 }], [0.62, { r: 58, x: 40, o: 0 }, 'ease-in']]),
    tw('truss', [[0, { s: 0.96 }], [0.56, { s: 0.96 }], [0.64, { s: 1.03 }, 'ease-out'], [0.7, { s: 1 }], ...wiggleStops(0.76, 1, 2, { s: 1.02 }, { s: 1 })]),
    fade('ghost', [[0, 0], [0.6, 0], [0.7, 1]]),
    tw('cam', quake(0.56, 0.66, 4)),
    // Aftermath: load arrows show what holds it up.
    tw('loads', [[0, { o: 0, y: -16 }], [0.72, { o: 0, y: -16 }], [0.82, { o: 1, y: 0 }, 'ease-out'], ...wiggleStops(0.84, 1, 2, { y: 5 }, { y: 0 })]),
  ],
}

/* available — three bays: two stay barred with red X; the centre one flips to a green OPEN and unlocks. */
const AV = { no: '#d62828', ok: '#2a9d4b', bay: '#e6e0d4' }
const BAYS = [14, 116, 218]
function Bay({ x }: { x: number }) {
  return <rect x={x} y={70} width={88} height={300} rx={8} fill={AV.bay} stroke={INK} strokeWidth={6} />
}
function Bars() {
  return (
    <g>
      <Ln d="M-34 -80 L34 80" w={20} />
      <Ln d="M34 -80 L-34 80" w={20} />
      <Ln d="M-34 -80 L34 80" w={13} c={AV.no} />
      <Ln d="M34 -80 L-34 80" w={13} c={AV.no} />
    </g>
  )
}
function Sign({ color, ok }: { color: string; ok?: boolean }) {
  return (
    <g>
      <rect x={-38} y={-24} width={76} height={48} rx={8} fill={color} stroke={INK} strokeWidth={5} />
      {ok ? (
        <text x={0} y={8} textAnchor="middle" fontSize={22} fontWeight={900} fill={WHITE} fontFamily="system-ui, sans-serif">
          OPEN
        </text>
      ) : (
        <Ln d="M-10 -10 L10 10 M10 -10 L-10 10" w={6} c={WHITE} />
      )}
    </g>
  )
}
export const available: Scene = {
  id: 'available',
  label: '三个大车位，左右两个被沉重的红色叉杠封死，中间那个的牌子一翻变成绿色的“开放”，彻底打开',
  sfx: 'click',
  hit: 0.56,
  render: () => (
    <g>
      <Field color="#efe9df" />
      <K k="sides">
        {[BAYS[0], BAYS[2]].map((x) => (
          <g key={x}>
            <Bay x={x} />
            <g transform={`translate(${x + 44} 250)`}>
              <Bars />
            </g>
            <g transform={`translate(${x + 44} 112)`}>
              <Sign color={AV.no} />
            </g>
          </g>
        ))}
      </K>
      <Bay x={BAYS[1]} />
      <K k="glowc" o={0}>
        <rect x={116} y={70} width={88} height={300} rx={8} fill={AV.ok} opacity={0.22} />
        <rect x={110} y={64} width={100} height={312} rx={12} fill="none" stroke={AV.ok} strokeWidth={8} />
      </K>
      <K x={160} y={250}>
        <K k="barsc">
          <Bars />
        </K>
      </K>
      <K k="okc" x={160} y={256} o={0}>
        <circle r={36} fill={AV.ok} stroke={INK} strokeWidth={6} />
        <Ln d="M-16 0 L-4 12 L18 -12" w={9} c={WHITE} />
      </K>
      <K k="signc" x={160} y={112}>
        <g data-k="sign-no">
          <Sign color={AV.no} />
        </g>
        <g data-k="sign-ok" opacity={0}>
          <Sign color={AV.ok} ok />
        </g>
      </K>
    </g>
  ),
  tracks: [
    // Setup: all three bays barred; the centre bars rattle.
    tw('barsc', [[0, {}], ...wiggleStops(0.2, 0.44, 3, { r: -3 }, { r: 3 }), [0.46, { r: 0 }], [0.54, { y: 30, r: 0, o: 1 }], [0.64, { y: 220, r: 40, o: 0 }, 'ease-in']]),
    // Action: the centre sign flips red -> green and the bay unlocks.
    tw('signc', [[0, {}], [0.48, {}], [0.53, { sx: 0 }, 'ease-in'], [0.58, { sx: 1.15 }, 'ease-out'], [0.62, { sx: 1 }]]),
    flip('sign-no', [[0, 1], [0.53, 0]]),
    flip('sign-ok', [[0, 0], [0.53, 1]]),
    tw('glowc', [[0, { o: 0 }], [0.56, { o: 0 }], [0.62, { o: 1 }], ...wiggleStops(0.72, 1, 3, { o: 0.6 }, { o: 1 })]),
    tw('okc', [[0, { o: 0, s: 0.2 }], [0.6, { o: 0, s: 0.2 }], [0.68, { o: 1, s: 1.15 }, 'ease-out'], [0.74, { s: 1 }]]),
    // Aftermath: the barred bays recede.
    fade('sides', [[0, 1], [0.66, 1], [0.8, 0.5]]),
  ],
}

/* impact — an iron ball slams into a glass pane: flash, radial cracks, shockwaves across the frame. */
const IM = { glass: '#bde0fe', ball: '#3d405b', wave: '#ffb703' }
const IMPACT = { x: 160, y: 210 }
const CRACKS = [
  'M160 210 L188 170 L206 120 L240 60',
  'M160 210 L214 196 L250 168 L284 150',
  'M160 210 L206 238 L240 280 L286 300',
  'M160 210 L176 262 L170 310 L196 364',
  'M160 210 L120 252 L104 300 L74 364',
  'M160 210 L110 214 L74 188 L36 196',
  'M160 210 L124 168 L110 116 L76 62',
  'M160 210 L162 150 L148 100 L156 56',
]
export const impact: Scene = {
  id: 'impact',
  label: '一颗沉重的铁球狠狠砸在一整块玻璃上，白光一闪，裂纹向四面炸开，冲击波一圈圈扩散到整个画面',
  sfx: 'shatter',
  hit: 0.5,
  render: () => (
    <K k="cam">
      <Field color="#263238" />
      <rect x={30} y={48} width={260} height={324} fill={IM.glass} stroke={WHITE} strokeWidth={10} />
      <Ln d="M60 120 L110 70 M60 160 L150 70" w={6} c={WHITE} />
      <DrawPath k="cracks" d={CRACKS.join(' ')} c={INK} w={5} />
      <DrawPath k="ring" d="M160 140 L214 160 L230 212 L206 262 L156 280 L104 258 L90 206 L112 156 Z" c={INK} w={4} />
      {[0, 1, 2].map((i) => (
        <K key={i} k={`wave${i}`} x={IMPACT.x} y={IMPACT.y} o={0}>
          <circle r={64} fill="none" stroke={IM.wave} strokeWidth={10 - i * 2} />
        </K>
      ))}
      <K k="ball" x={IMPACT.x} y={IMPACT.y}>
        <circle r={58} fill={IM.ball} stroke={WHITE} strokeWidth={5} />
        <ellipse cx={-20} cy={-22} rx={16} ry={11} fill={WHITE} opacity={0.6} />
      </K>
      <g data-k="flash" opacity={0}>
        <rect x={-400} y={-400} width={1120} height={1200} fill={WHITE} />
      </g>
    </K>
  ),
  tracks: [
    // Setup: the ball hurtles in from the dark, growing as it nears.
    tw('ball', [[0, { x: -300, y: -320, s: 0.35 }], [0.1, { x: -300, y: -320, s: 0.35 }], [0.5, { x: 0, y: 0, s: 1 }, 'ease-in'], [0.52, { sx: 1.1, sy: 0.9 }], [0.58, { sx: 1, sy: 1 }]]),
    // Action: flash, cracks, shockwaves, tremor.
    flip('flash', [[0, 0], [0.5, 0.75], [0.53, 0.3], [0.56, 0]]),
    draw('cracks', 0.5, 0.58),
    draw('ring', 0.54, 0.64),
    tw('wave0', [[0, { o: 0, s: 1 }], [0.5, { o: 0, s: 1 }], [0.51, { o: 1, s: 1 }], [0.7, { o: 0, s: 3.6 }, 'ease-out']]),
    tw('wave1', [[0, { o: 0, s: 1 }], [0.54, { o: 0, s: 1 }], [0.55, { o: 1, s: 1 }], [0.76, { o: 0, s: 3.6 }, 'ease-out']]),
    tw('wave2', [[0, { o: 0, s: 1 }], [0.58, { o: 0, s: 1 }], [0.59, { o: 1, s: 1 }], [0.84, { o: 0.25, s: 3 }, 'ease-out'], [1, { o: 0.25, s: 3 }]]),
    tw('cam', quake(0.5, 0.66, 9, 10)),
  ],
}

/* strategy — a red knight leaps in an L over the pawn wall and checks the king. */
const SG = { dark: '#b58863', knight: '#d62828', pawn: '#8d99ae' }
const SQ = 80
const BOARD_Y = 70
const sq = (c: number, r: number) => ({ x: c * SQ + SQ / 2, y: BOARD_Y + r * SQ + SQ / 2 })
function Knight() {
  return (
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round">
      <rect x={-30} y={-14} width={60} height={14} rx={4} fill={SG.knight} />
      <path d="M-22 -14 L-18 -46 C-30 -58 -26 -80 -8 -92 L-2 -104 L6 -90 C26 -84 34 -62 30 -44 L18 -50 L4 -44 C2 -34 14 -24 18 -14 Z" fill={SG.knight} />
      <circle cx={4} cy={-74} r={3.5} fill={INK} stroke="none" />
    </g>
  )
}
function Pawn() {
  return (
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round" fill={SG.pawn}>
      <path d="M-26 0 L26 0 L18 -12 L10 -40 L-10 -40 L-18 -12 Z" />
      <circle cy={-52} r={16} />
    </g>
  )
}
function King() {
  return (
    <g stroke={INK} strokeWidth={5} strokeLinejoin="round" fill={INK}>
      <rect x={-36} y={-16} width={72} height={16} rx={4} />
      <path d="M-26 -16 L-18 -96 L18 -96 L26 -16 Z" />
      <rect x={-28} y={-112} width={56} height={16} rx={4} />
      <path d="M0 -112 L0 -150 M-14 -136 L14 -136" fill="none" strokeWidth={9} strokeLinecap="round" />
    </g>
  )
}
const K_FROM = sq(1, 3)
const K_TO = sq(2, 1)
const KING = sq(0, 0)
export const strategy: Scene = {
  id: 'strategy',
  label: '巨大的棋盘特写：红色骑士走出一个L形，越过挡路的兵墙落定，直接将死黑色的国王',
  sfx: 'clack',
  hit: 0.58,
  render: () => (
    <g>
      <Field color="#f3e9d2" />
      {Array.from({ length: 16 }, (_, i) => {
        const c = i % 4
        const r = Math.floor(i / 4)
        return (c + r) % 2 === 1 ? <rect key={i} x={c * SQ} y={BOARD_Y + r * SQ} width={SQ} height={SQ} fill={SG.dark} /> : null
      })}
      <rect x={0} y={BOARD_Y} width={320} height={320} fill="none" stroke={INK} strokeWidth={6} />
      <DrawPath k="plan" d={`M${K_FROM.x} ${K_FROM.y} L${K_FROM.x} ${K_TO.y} L${K_TO.x} ${K_TO.y}`} c={SG.knight} w={8} />
      <K k="check" o={0}>
        <Ln d={`M${K_TO.x - 20} ${K_TO.y - 30} L${KING.x + 30} ${KING.y + 10}`} w={8} c={SG.knight} />
      </K>
      <K k="king" x={KING.x} y={KING.y + 32}>
        <g transform="scale(0.8)">
          <King />
        </g>
      </K>
      <K x={sq(1, 2).x} y={sq(1, 2).y + 30}>
        <Pawn />
      </K>
      <K x={sq(2, 2).x} y={sq(2, 2).y + 30}>
        <Pawn />
      </K>
      <K x={K_FROM.x} y={K_FROM.y + 32}>
        <K k="knight">
          <Knight />
        </K>
      </K>
      <K k="mate" x={KING.x + 40} y={KING.y - 20} o={0}>
        <Burst r0={18} r1={40} n={10} color={SG.knight} w={7} />
      </K>
    </g>
  ),
  tracks: [
    // Setup: the plan traces an L around the wall; the knight coils.
    draw('plan', 0.08, 0.36),
    // Action: the leap over the pawns, landing hard.
    tw('knight', [
      [0, {}],
      [0.36, {}],
      [0.44, { sy: 0.88 }],
      [0.47, { sy: 1 }],
      [0.52, { y: -150, s: 1.3, r: -10 }, 'ease-out'],
      [0.58, { x: K_TO.x - K_FROM.x, y: K_TO.y - K_FROM.y, s: 1, r: 0 }, 'ease-in'],
      [0.6, { sy: 0.9 }],
      [0.64, { sy: 1 }],
    ]),
    tw('check', [[0, { o: 0 }], [0.6, { o: 0 }], [0.64, { o: 1 }]]),
    // Aftermath: the king topples.
    tw('king', [[0, {}], [0.62, {}], ...wiggleStops(0.62, 0.68, 2, { r: -5 }, { r: 5 }), [0.8, { r: 80, x: 24 }, 'ease-in'], [0.84, { r: 74, x: 24 }], [0.88, { r: 80, x: 24 }]]),
    tw('mate', [[0, { o: 0, s: 0.3 }], [0.66, { o: 0, s: 0.3 }], [0.74, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.78, 1, 2, { s: 1.1 }, { s: 1 })]),
  ],
}

/* arbitrary — a blindfolded thrower hurls a dart without looking; it pins one of three identical targets. ?! */
const AR = { red: '#e63946', skin: '#f2c39a', dart: '#ffb703' }
const TARGETS = [58, 160, 262]
const TY = 120
// Tip of the dart (local 0,-46, drawn at 1.4×) must land on the right target's centre.
const DART_S = 1.4
const TIP = 46 * DART_S
const DART_R = (Math.atan2(TARGETS[2] - 160, 300 - TY) * 180) / Math.PI
const DART_DX = TARGETS[2] - 160 - TIP * Math.sin((DART_R * Math.PI) / 180)
const DART_DY = TY - 300 + TIP * Math.cos((DART_R * Math.PI) / 180)
export const arbitrary: Scene = {
  id: 'arbitrary',
  label: '一个蒙着眼的人对着三个一模一样的靶子乱晃，随手扔出一支大飞镖，扎中其中一个，盖上一个巨大的“？！”',
  sfx: 'thunk',
  hit: 0.55,
  render: () => (
    <g>
      <Field color="#f4efe6" />
      {TARGETS.map((x, i) => (
        <K key={x} k={`t${i}`} x={x} y={TY}>
          <circle r={48} fill={AR.red} stroke={INK} strokeWidth={5} />
          <circle r={34} fill={WHITE} />
          <circle r={21} fill={AR.red} />
          <circle r={8} fill={WHITE} />
        </K>
      ))}
      <K k="aim" x={160} y={300}>
        <Ln d="M0 -20 L0 -150" w={5} c={INK} />
        <text x={0} y={-160} textAnchor="middle" fontSize={34} fontWeight={900} fill={INK} fontFamily="system-ui, sans-serif">
          ?
        </text>
      </K>
      <K k="head" x={160} y={420}>
        <circle cx={0} cy={-60} r={96} fill={AR.skin} stroke={INK} strokeWidth={6} />
        <rect x={-100} y={-104} width={200} height={34} fill={INK} />
        <path d="M96 -96 L140 -120 L136 -80 Z" fill={INK} />
        <ellipse cx={0} cy={-34} rx={12} ry={9} fill={INK} />
      </K>
      <K k="dart" x={160} y={300}>
        <g transform={`scale(${DART_S})`}>
        <path d="M-12 30 L-22 50 L0 40 L22 50 L12 30 Z" fill={AR.red} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <rect x={-6} y={-26} width={12} height={58} rx={3} fill={AR.dart} stroke={INK} strokeWidth={4} />
        <path d="M-6 -26 L0 -46 L6 -26 Z" fill={INK} />
        </g>
      </K>
      <K k="stamp" x={160} y={262} r={-12} o={0}>
        <text x={0} y={0} textAnchor="middle" fontSize={124} fontWeight={900} fill={AR.red} stroke={INK} strokeWidth={5} fontFamily="system-ui, sans-serif">
          ?!
        </text>
      </K>
    </g>
  ),
  tracks: [
    // Setup: blind aim swings randomly between identical targets.
    tw('aim', [[0, { r: 0 }], [0.1, { r: -34 }], [0.2, { r: 22 }], [0.28, { r: -12 }], [0.38, { r: 36 }], [0.44, { r: DART_R, o: 1 }], [0.48, { o: 0 }]]),
    tw('head', [[0, {}], [0.1, { r: 8 }], [0.2, { r: -6 }], [0.3, { r: 5 }], [0.4, { r: -8 }], [0.46, { r: 0 }], [0.5, { y: -10 }], [0.56, { y: 0 }]]),
    // Action: the throw, the thunk.
    tw('dart', [
      [0, { o: 0 }],
      [0.44, { o: 0 }],
      [0.45, { o: 1, y: 14 }],
      [0.48, { y: 20, r: DART_R }],
      [0.55, { x: DART_DX, y: DART_DY, r: DART_R }, 'ease-in'],
      ...wiggleStops(0.55, 0.64, 3, { x: DART_DX, y: DART_DY, r: DART_R + 5 }, { x: DART_DX, y: DART_DY, r: DART_R - 5 }),
      [0.66, { x: DART_DX, y: DART_DY, r: DART_R }],
    ]),
    tw('t2', [[0, {}], [0.55, {}], [0.57, { y: -8 }], [0.62, { y: 0 }]]),
    // Aftermath: the arbitrary stamp.
    tw('stamp', [[0, { o: 0, s: 2 }], [0.64, { o: 0, s: 2 }], [0.72, { o: 1, s: 1 }, 'ease-in'], [0.75, { s: 1.06 }], [0.8, { s: 1 }]]),
  ],
}

/* process — raw ore drops in, is ground and fired between turning gears, and comes out a gleaming gold bar. */
const PR = { ore: '#6b5b4e', fire: '#e85d04', gold: '#ffb703' }
export const process: Scene = {
  id: 'process',
  label: '三个相连的大舱室：生矿石从顶上掉进去，经过中间转动的齿轮和火焰锻造，从底部变成一根闪亮的金条',
  sfx: 'ding',
  hit: 0.7,
  render: () => (
    <g>
      <Field color="#efe7da" />
      <g fill={WHITE} stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <rect x={138} y={112} width={44} height={44} />
        <rect x={138} y={262} width={44} height={44} />
        <path d="M54 22 L266 22 L196 116 L124 116 Z" />
        <rect x={24} y={150} width={272} height={116} rx={10} />
        <rect x={70} y={300} width={180} height={86} rx={10} />
      </g>
      <K k="gearL" x={78} y={208}>
        <Gear r={44} teeth={9} color={PR.fire} />
      </K>
      <K k="gearR" x={242} y={208}>
        <Gear r={44} teeth={9} color={PR.fire} />
      </K>
      <K k="flames" x={160} y={262}>
        <path d="M-60 0 Q-58 -40 -40 -30 Q-34 -66 -14 -44 Q0 -80 14 -44 Q34 -66 40 -30 Q58 -40 60 0 Z" fill={PR.fire} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M-30 0 Q-24 -24 -10 -18 Q0 -42 10 -18 Q24 -24 30 0 Z" fill={PR.gold} />
      </K>
      <K k="ore" x={160} y={-40}>
        <polygon data-k="ore-skin" points="-30,-10 -16,-30 12,-28 30,-8 22,22 -8,28 -28,14" fill={PR.ore} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </K>
      <K k="bar" x={160} y={354}>
        <path d="M-58 18 L58 18 L44 -18 L-44 -18 Z" fill={PR.gold} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <Ln d="M-30 -6 L6 -6" w={5} c={WHITE} />
      </K>
      <K k="shine" x={160} y={350} o={0}>
        <Burst r0={66} r1={92} n={12} color={PR.gold} w={7} />
      </K>
    </g>
  ),
  tracks: [
    // Setup: the raw ore drops in and rattles down to the furnace.
    tw('ore', [
      [0, { y: 0 }],
      [0.12, { y: 100 }, 'ease-in'],
      ...wiggleStops(0.12, 0.24, 2, { y: 96, r: -8 }, { y: 100, r: 8 }),
      [0.36, { y: 244, r: 0 }, 'ease-in'],
      // Action: ground and fired between the gears.
      [0.6, { y: 244, r: 200, s: 0.82 }],
      [0.64, { y: 330, s: 0.6, o: 1 }, 'ease-in'],
      [0.65, { o: 0 }],
    ]),
    css('ore-skin', [[0, { fill: PR.ore }], [0.38, { fill: PR.ore }], [0.58, { fill: PR.fire }]]),
    tw('gearL', [[0, {}], [0.3, {}], [0.66, { r: 300 }, 'linear'], [0.74, { r: 330 }, 'ease-out']]),
    tw('gearR', [[0, {}], [0.3, {}], [0.66, { r: -300 }, 'linear'], [0.74, { r: -330 }, 'ease-out']]),
    tw('flames', [[0, { sy: 0.2, o: 0.4 }], [0.34, { sy: 0.2, o: 0.4 }], [0.4, { sy: 1, o: 1 }], ...wiggleStops(0.4, 0.62, 4, { sy: 1.25, sx: 0.94 }, { sy: 0.9, sx: 1.04 }), [0.68, { sy: 0.3, o: 0.5 }]]),
    tw('bar', [[0, { o: 0, y: -40 }], [0.64, { o: 0, y: -40 }], [0.65, { o: 1, y: -40 }], [0.7, { y: 0 }, 'ease-in'], [0.72, { sy: 0.86 }], [0.76, { sy: 1 }]]),
    // Aftermath: the finished gold gleams.
    tw('shine', [[0, { o: 0, s: 0.5 }], [0.7, { o: 0, s: 0.5 }], [0.8, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.82, 1, 2, { s: 1.08 }, { s: 1 })]),
  ],
}

/* authority — a massive brass-and-vermilion seal slams onto a scroll and leaves a bold red impression. */
const AU = { brass: '#c9a227', seal: '#d62828', paper: '#fffaf0' }
export const authority: Scene = {
  id: 'authority',
  label: '一枚巨大的铜柄朱红官印压满画面中央，直直砸在卷轴上，画面一震，留下一个醒目的红色印记',
  sfx: 'stamp',
  hit: 0.54,
  render: () => (
    <K k="cam">
      <Field color="#efe4cf" />
      <rect x={22} y={214} width={276} height={172} fill={AU.paper} stroke={INK} strokeWidth={6} />
      <rect x={10} y={206} width={20} height={188} rx={6} fill={AU.brass} stroke={INK} strokeWidth={5} />
      <rect x={290} y={206} width={20} height={188} rx={6} fill={AU.brass} stroke={INK} strokeWidth={5} />
      <K k="imprint" x={160} y={300} o={0}>
        <K k="imprint-s">
        <rect x={-62} y={-62} width={124} height={124} rx={6} fill={AU.seal} />
        <rect x={-52} y={-52} width={104} height={104} rx={3} fill="none" stroke={AU.paper} strokeWidth={5} />
        <text x={0} y={30} textAnchor="middle" fontSize={84} fontWeight={900} fill={AU.paper} fontFamily="'Songti SC', 'Noto Serif SC', serif">
          准
        </text>
        </K>
      </K>
      <K k="slamfx" x={160} y={240} o={0}>
        <Burst r0={90} r1={124} n={12} w={7} />
      </K>
      <K k="seal" x={160} y={250}>
        <circle cx={0} cy={-150} r={42} fill={AU.brass} stroke={INK} strokeWidth={6} />
        <rect x={-24} y={-118} width={48} height={60} fill={AU.brass} stroke={INK} strokeWidth={6} />
        <rect x={-46} y={-66} width={92} height={14} rx={4} fill={AU.brass} stroke={INK} strokeWidth={5} />
        <rect x={-70} y={-54} width={140} height={54} rx={4} fill={AU.seal} stroke={INK} strokeWidth={6} />
        <ellipse cx={-14} cy={-160} rx={10} ry={14} fill={WHITE} opacity={0.5} />
      </K>
    </K>
  ),
  tracks: [
    // Setup: the seal hovers, then winds up high.
    tw('seal', [
      [0, { y: -60 }],
      [0.2, { y: -70 }],
      [0.44, { y: -120, r: -6 }, 'ease-out'],
      // Action: slam straight down.
      [0.54, { y: 0, r: 0 }, 'ease-in'],
      [0.56, { sy: 0.93 }],
      [0.6, { sy: 1 }],
      [0.64, { y: 0 }],
      [0.78, { y: -130 }, 'ease-out'],
    ]),
    flip('imprint', [[0, 0], [0.54, 1]]),
    // Aftermath: the impression throbs, unmistakable.
    tw('imprint-s', [[0, {}], [0.54, { s: 1 }], [0.66, { s: 1 }], [0.74, { s: 1.1 }, 'ease-out'], [0.82, { s: 1 }]]),
    tw('slamfx', [[0, { o: 0, s: 0.7 }], [0.54, { o: 0, s: 0.7 }], [0.56, { o: 1, s: 1 }], [0.66, { o: 0, s: 1.25 }]]),
    tw('cam', quake(0.54, 0.68, 8, 10)),
  ],
}

/* feature — a row of identical grey silhouettes; a spotlight sweeps and locks on the one with a huge red crest. */
const FE = { grey: '#6c7380', light: '#ffe8a3', crest: '#e63946' }
const BUSTS = [32, 96, 160, 224, 288]
const STAR = 3
function Bust({ fill }: { fill?: string }) {
  return (
    <g>
      <path d="M-30 170 L-30 64 Q-30 40 0 40 Q30 40 30 64 L30 170 Z" fill={fill ?? FE.grey} stroke={INK} strokeWidth={5} />
      <circle cy={10} r={26} fill={fill ?? FE.grey} stroke={INK} strokeWidth={5} />
    </g>
  )
}
export const feature: Scene = {
  id: 'feature',
  label: '一排一模一样的灰色人影，一束聚光灯扫过去，最后牢牢锁定头顶长着一个超大红色冠饰的那一个',
  sfx: 'tada',
  hit: 0.56,
  render: () => (
    <g>
      <Field color="#23262d" />
      <K k="others">
        {BUSTS.map((x, i) =>
          i === STAR ? null : (
            <K key={x} x={x} y={220}>
              <Bust />
            </K>
          ),
        )}
      </K>
      <K x={BUSTS[STAR]} y={390}>
        <K k="star">
          <g transform="translate(0 -170)">
            <K k="crest" y={-14}>
              <path d="M-26 0 L-38 -70 L-14 -40 L0 -96 L14 -40 L38 -70 L26 0 Z" fill={FE.crest} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            </K>
            <g data-k="star-lit" opacity={0}>
              <Bust fill={FE.light} />
            </g>
            <g data-k="star-dim">
              <Bust />
            </g>
          </g>
        </K>
      </K>
      <K k="spot" x={-60} y={0}>
        <path d="M-18 -20 L18 -20 L84 400 L-84 400 Z" fill={FE.light} opacity={0.22} />
      </K>
    </g>
  ),
  tracks: [
    // Setup: the spotlight sweeps across the identical row.
    tw('spot', [
      [0, { x: 0 }],
      [0.36, { x: 360 }, 'ease-in-out'],
      [0.46, { x: 300 }],
      // Action: swings back and locks onto the one.
      [0.56, { x: BUSTS[STAR] + 60 }, 'ease-out'],
      [0.6, { x: BUSTS[STAR] + 54, sx: 0.9 }],
      [0.64, { x: BUSTS[STAR] + 60, sx: 0.9 }],
    ]),
    flip('star-dim', [[0, 1], [0.56, 0]]),
    flip('star-lit', [[0, 0], [0.56, 1]]),
    tw('crest', [[0, { sy: 0.6 }], [0.56, { sy: 0.6 }], [0.62, { sy: 1.25 }, 'ease-out'], [0.68, { sy: 1 }], ...wiggleStops(0.76, 1, 2, { sy: 1.08 }, { sy: 1 })]),
    tw('star', [[0, {}], [0.56, {}], [0.64, { s: 1.12 }, 'ease-out']]),
    // Aftermath: everyone else fades back.
    fade('others', [[0, 1], [0.6, 1], [0.76, 0.4]]),
  ],
}

/* capacity — crimson liquid races up a giant vessel to the red MAX line, swells taut at the brim, MAX flashes. */
const CA = { glass: '#d9eef7', liquid: '#c1121f', max: '#ff5a1f' }
const BRIM = 82
const FLOOR = 372
const LEVEL = FLOOR - BRIM
const levelStops: [number, number, string?][] = [
  [0, 0.05],
  [0.08, 0.05],
  [0.45, 0.42, 'ease-in'],
  [0.62, 1, 'ease-out'],
]
export const capacity: Scene = {
  id: 'capacity',
  label: '一个巨大的透明量筒，顶端画着醒目的红色“MAX”线，深红液体迅速上涨直顶到线，在瓶口鼓起绷紧的液面，上限灯狂闪',
  sfx: 'overload',
  hit: 0.66,
  render: () => (
    <K k="cam">
      <Field color="#eef2f3" />
      <defs>
        <clipPath id="cw-vessel">
          <path d="M76 40 L244 40 L244 352 Q244 372 224 372 L96 372 Q76 372 76 352 Z" />
        </clipPath>
      </defs>
      <path d="M70 40 L250 40 L250 356 Q250 378 228 378 L92 378 Q70 378 70 356 Z" fill={CA.glass} />
      <g clipPath="url(#cw-vessel)">
        <K x={0} y={FLOOR}>
          <K k="liquid">
            <rect x={70} y={-LEVEL} width={180} height={LEVEL} fill={CA.liquid} />
          </K>
        </K>
        <K k="bubbles" o={0}>
          <g fill="none" stroke={WHITE} strokeWidth={4}>
            <circle cx={120} cy={300} r={8} />
            <circle cx={200} cy={250} r={6} />
            <circle cx={150} cy={200} r={5} />
          </g>
        </K>
      </g>
      <K x={160} y={BRIM}>
        <K k="men">
          <K k="dome">
            <path d="M-84 0 Q0 -46 84 0 Z" fill={CA.liquid} />
          </K>
        </K>
      </K>
      <Ln d="M70 40 L70 356 Q70 378 92 378 L228 378 Q250 378 250 356 L250 40" w={7} />
      <Ln d="M58 40 L262 40" w={9} />
      <Ln d="M250 140 L230 140 M250 200 L236 200 M250 260 L230 260 M250 320 L236 320" w={4} />
      <K k="alarm" x={160} y={BRIM} o={0}>
        <rect x={-98} y={-15} width={196} height={30} rx={15} fill="none" stroke={CA.max} strokeWidth={6} />
      </K>
      <K k="maxline">
        <Ln d={`M54 ${BRIM} L256 ${BRIM}`} w={7} c={CA.max} />
        <rect x={254} y={BRIM - 15} width={62} height={30} rx={6} fill={CA.max} />
        <text x={285} y={BRIM + 7} textAnchor="middle" fontSize={20} fontWeight={900} fill={WHITE} fontFamily="system-ui, sans-serif">
          MAX
        </text>
      </K>
    </K>
  ),
  tracks: [
    // Setup -> Action: the level climbs, then races to the brim.
    tw('liquid', levelStops.map(([o, sy, e]) => [o, { sy }, e])),
    tw('men', levelStops.map(([o, sy, e]) => [o, { y: LEVEL * (1 - sy) }, e])),
    tw('dome', [[0, { sy: 0.15 }], [0.62, { sy: 0.15 }], [0.68, { sy: 1.1 }, 'ease-out'], [0.72, { sy: 0.95 }], ...wiggleStops(0.72, 1, 4, { sy: 1.04 }, { sy: 0.96 })]),
    tw('bubbles', [[0, { o: 0, y: 40 }], [0.44, { o: 0, y: 40 }], [0.5, { o: 1, y: 0 }], [0.62, { o: 0, y: -80 }]]),
    // Action/aftermath: the limit flashes.
    tw('maxline', [[0, {}], [0.66, {}], ...wiggleStops(0.66, 0.84, 3, { o: 0.25 }, { o: 1 }), [1, { o: 1 }]]),
    tw('alarm', [[0, { o: 0, sx: 0.6 }], [0.66, { o: 0, sx: 0.6 }], [0.72, { o: 1, sx: 1 }, 'ease-out'], ...wiggleStops(0.74, 1, 3, { o: 0.4 }, { o: 1 })]),
    tw('cam', quake(0.64, 0.74, 3, 8)),
  ],
}
