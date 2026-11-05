import { Backdrop, Burst, Desk, Face, INK, K, Ln, PAPER, Person, Rain, SKIN, type Mood } from './cast'
import { css, fade, flip, mood, shakeStops, tw, type Scene } from './timeline'

/* adjacent — the drummer next door hits the cymbal; through the shared wall, the frame lands on your bed. */
export const adjacent: Scene = {
  id: 'adjacent',
  label: '深夜想睡觉，隔壁房间有人打鼓，一记重镲震得共用墙上的画框砸到床上',
  sfx: 'crash',
  hit: 0.75,
  render: () => (
    <g>
      <rect x={-400} y={-400} width={560} height={1200} fill="#3b4762" />
      <rect x={160} y={-400} width={560} height={1200} fill="#5d4670" />
      <rect x={-400} y={330} width={1120} height={500} fill="#2a3040" />
      <rect x={20} y={60} width={60} height={70} fill="#25304a" stroke="#1d2436" strokeWidth={3} />
      <circle cx={58} cy={84} r={11} fill="#f3e3a6" />
      <circle cx={63} cy={80} r={10} fill="#25304a" />
      <K k="frame" x={122} y={110}>
        <Ln d="M0 0 L-12 12 M0 0 L12 12" w={1} c="#c9bfae" />
        <rect x={-16} y={12} width={32} height={26} fill="#e7d9c4" stroke="#a58a5a" strokeWidth={2.4} />
        <path d="M-12 34 L-4 22 L2 28 L6 24 L12 34 Z" fill="#8fb38a" />
      </K>
      <rect x={4} y={236} width={12} height={56} fill="#7a5536" stroke={INK} strokeWidth={1.2} />
      <rect x={4} y={270} width={142} height={22} rx={4} fill="#8a6440" stroke={INK} strokeWidth={1.4} />
      <ellipse cx={46} cy={264} rx={26} ry={9} fill="#f3efe6" stroke={INK} strokeWidth={1.2} />
      <K k="stu-pos" x={48} y={248} s={1.3}>
        <Head3 id="stu" moods={['tired', 'nervous', 'shock', 'angry']} look={1} />
      </K>
      <path d="M26 270 Q40 258 80 260 L146 264 L146 292 L22 292 Z" fill="#6c8fb3" stroke={INK} strokeWidth={1.4} />
      <K k="frame-fallen" x={98} y={262} o={0}>
        <rect x={-16} y={-13} width={32} height={26} fill="#e7d9c4" stroke="#a58a5a" strokeWidth={2.4} transform="rotate(18)" />
      </K>
      <K k="waves" x={150} y={180} o={0}>
        <Ln d="M-6 -30 Q-22 0 -6 30 M-18 -46 Q-42 0 -18 46" w={2.4} c="#ffe08a" />
      </K>
      <K k="wall">
        <rect x={152} y={30} width={16} height={300} fill="#cfc6b8" stroke={INK} strokeWidth={1.4} />
      </K>
      {[
        ['n1', 214, 150, '♪'],
        ['n2', 252, 118, '♫'],
        ['n3', 280, 166, '♪'],
      ].map(([k, x, y, t]) => (
        <K key={k} k={k as string} x={x as number} y={y as number} o={0}>
          <text fontSize={22} fill="#ffe08a" fontFamily="Georgia, serif">
            {t}
          </text>
        </K>
      ))}
      <Ln d="M290 214 L290 330 M280 330 L300 330" w={2} c="#b9b2a2" />
      <K k="cymbal" x={290} y={214}>
        <ellipse rx={20} ry={3.4} fill="#e2b84a" stroke={INK} strokeWidth={1.2} />
      </K>
      <K k="nei-pos" x={238} y={330} s={1.2}>
        <Person
          id="nei"
          moods={['happy', 'joy']}
          shirt="#e07a5f"
          hair="short"
          hairColor="#7a4a2a"
          skin={SKIN[1]}
          arms={[40, -40]}
          headExtra={
            <g>
              <path d="M-18 -2 Q0 -32 18 -2" fill="none" stroke={INK} strokeWidth={2.6} />
              <rect x={-21} y={-6} width={7} height={12} rx={3} fill="#3a3a3a" />
              <rect x={14} y={-6} width={7} height={12} rx={3} fill="#3a3a3a" />
            </g>
          }
          handL={<Ln d="M0 0 L0 18" w={2.4} c="#e8d6a8" />}
          handR={<Ln d="M0 0 L0 18" w={2.4} c="#e8d6a8" />}
        />
      </K>
      <circle cx={236} cy={302} r={28} fill="#d64541" stroke={INK} strokeWidth={1.6} />
      <circle cx={236} cy={302} r={20} fill="none" stroke="#f3efe6" strokeWidth={2} />
      <ellipse cx={196} cy={282} rx={16} ry={5} fill="#e8e2d2" stroke={INK} strokeWidth={1.2} />
    </g>
  ),
  tracks: [
    tw('wall', [[0, {}], ...shakeStops(0.3, 0.7, 10, 'x', 0.4, 1.4), ...shakeStops(0.74, 0.86, 6, 'x', 3, 0.5)]),
    tw('frame', [
      [0, {}],
      ...shakeStops(0.3, 0.7, 8, 'r', 1, 6),
      [0.73, { r: -10 }],
      [0.8, { x: -24, y: 150, r: 40, o: 1 }, 'ease-in'],
      [0.81, { x: -24, y: 150, r: 40, o: 0 }],
    ]),
    tw('frame-fallen', [[0, { o: 0 }], [0.8, { o: 0 }], [0.801, { o: 1 }], [0.83, { y: -6 }], [0.86, { y: 0 }]]),
    tw('waves', [[0, { o: 0, s: 0.6 }], [0.74, { o: 0, s: 0.6 }], [0.77, { o: 1, s: 1 }], [0.88, { o: 0, s: 1.5 }]]),
    ...['n1', 'n2', 'n3'].map((k, i) =>
      tw(k, [
        [0, { o: 0 }],
        [0.18 + i * 0.1, { o: 0 }],
        [0.24 + i * 0.1, { o: 1, y: -6 }],
        [0.5 + i * 0.08, { o: 1, x: -90, y: 6 }],
        [0.6 + i * 0.08, { o: 0, x: -140, y: 0 }],
      ]),
    ),
    tw('nei-armL', [[0, {}], ...shakeStops(0.12, 0.7, 12, 'r', 8, 22), [0.73, { r: 100 }], [0.76, { r: -20 }, 'ease-in'], [0.86, { r: 0 }]]),
    tw('nei-armR', [[0, {}], ...shakeStops(0.16, 0.7, 12, 'r', 8, 22), [0.73, { r: -110 }], [0.76, { r: 10 }, 'ease-in'], [0.86, { r: 0 }]]),
    tw('cymbal', [[0, {}], [0.755, {}], [0.78, { r: 22 }], [0.82, { r: -16 }], [0.88, { r: 8 }], [0.94, { r: 0 }]]),
    ...mood('nei', [[0, 'happy'], [0.72, 'joy'], [0.9, 'happy']]),
    ...mood('stu', [[0, 'tired'], [0.36, 'nervous'], [0.76, 'shock'], [0.86, 'angry']]),
    tw('stu-pos', [[0, {}], [0.76, {}], [0.8, { y: -10 }], [0.9, { y: -8, r: 6 }]]),
  ],
}

/** Bare head (for figures half hidden under a blanket). */
function Head3({ id, moods, look }: { id: string; moods: Mood[]; look: number }) {
  return (
    <g>
      <circle r={17} fill={SKIN[0]} stroke={INK} strokeWidth={1.6} />
      {moods.map((m, i) => (
        <g key={m} data-k={`${id}-m-${m}`} opacity={i === 0 ? 1 : 0}>
          <Face mood={m} look={look} />
        </g>
      ))}
      <path
        d="M-17.5 -1 C-19 -12 -12 -20 -6 -20.5 L-8.5 -26.5 L-2 -21.6 L1 -27.6 L4 -21.4 L10.5 -24.6 L9 -19 C15 -16 19 -10 17.5 -2 L14.5 -8 L11 -4.4 L8.5 -11 L4 -6.6 L0.5 -12 L-3.5 -6.2 L-7.5 -11 L-10.5 -5 L-13.5 -9 Z"
        fill="#2f2a26"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </g>
  )
}

const FLOORS = [1, 2, 3, 4, 5]

/* structure — floor by floor the steel frame goes up; the quake flattens the shack, the frame stands. */
export const structure: Scene = {
  id: 'structure',
  label: '钢架一层层搭起来，地震来袭，旁边的草棚瞬间散架，钢架纹丝不动',
  sfx: 'rumble',
  hit: 0.73,
  render: () => (
    <g>
      <rect x={-400} y={-400} width={1120} height={1200} fill="#e6edf3" />
      <K k="quake">
        <rect x={-400} y={322} width={1120} height={600} fill="#c4b49a" />
        <line x1={-400} x2={720} y1={322} y2={322} stroke={INK} strokeOpacity={0.35} strokeWidth={1.2} />
        <K k="crack" o={0}>
          <Ln d="M112 322 L120 334 L114 346 L124 360 L118 380" w={2.4} />
        </K>
        <K k="frame" x={196} y={322}>
          {FLOORS.map((i) => (
            <K key={i} k={`fl${i}`} y={-40 * (i - 1)}>
              <g stroke="#4f5f78" strokeLinecap="round">
                <path d="M-48 0 L-48 -40 M0 0 L0 -40 M48 0 L48 -40" strokeWidth={5} />
                <path d="M-52 -40 L52 -40" strokeWidth={5} />
                <path d={i % 2 ? 'M-48 0 L0 -40 M0 0 L-48 -40' : 'M0 0 L48 -40 M48 0 L0 -40'} strokeWidth={2.2} />
              </g>
              <g fill="#2b2a28">
                <circle cx={-48} cy={-40} r={2} />
                <circle cx={0} cy={-40} r={2} />
                <circle cx={48} cy={-40} r={2} />
              </g>
            </K>
          ))}
          <K k="flag" x={40} y={-200}>
            <Ln d="M0 0 L0 -26" w={2} />
            <path d="M0 -26 L18 -21 L0 -15 Z" fill="#d64541" />
          </K>
        </K>
        <K x={60} y={322}>
          <K k="sw3">
            <rect x={-30} y={-46} width={60} height={46} fill="#e0c27a" stroke={INK} strokeWidth={1.2} />
            <Ln d="M-22 -46 L-22 0 M-10 -46 L-10 0 M2 -46 L2 0 M14 -46 L14 0" w={0.8} c="#b8974a" />
          </K>
          <K k="sw1" x={-33}>
            <rect x={-4} y={-52} width={8} height={52} fill="#c99a4a" stroke={INK} strokeWidth={1.2} />
          </K>
          <K k="sw2" x={33}>
            <rect x={-4} y={-52} width={8} height={52} fill="#c99a4a" stroke={INK} strokeWidth={1.2} />
          </K>
          <K k="sroof" y={-50}>
            <path d="M-46 4 L0 -32 L46 4 Z" fill="#d1a85a" stroke={INK} strokeWidth={1.4} />
            <Ln d="M-30 -4 L-8 -22 M-12 2 L14 -20 M10 2 L30 -12" w={0.8} c="#a07a3a" />
          </K>
        </K>
        <K k="dust" x={60} y={306} o={0}>
          <Burst r0={30} r1={48} n={12} color="#a8987e" w={2.4} />
        </K>
        <K k="wk-pos" x={284} y={322} s={1.15}>
          <Person id="wk" moods={['focus', 'fear', 'relief']} shirt="#f08a24" hair="cap" hairColor="#f3c623" skin={SKIN[2]} />
        </K>
      </K>
    </g>
  ),
  tracks: [
    ...FLOORS.map((i) => {
      const at = 0.14 + (i - 1) * 0.11
      return tw(`fl${i}`, [[0, { o: 0, sy: 0.3 }], [at, { o: 0, sy: 0.3 }], [at + 0.05, { o: 1, sy: 1.06 }, 'ease-out'], [at + 0.08, { sy: 1 }]])
    }),
    tw('flag', [[0, { o: 0, s: 0.4 }], [0.86, { o: 0, s: 0.4 }], [0.92, { o: 1, s: 1 }]]),
    tw('quake', [[0, {}], ...shakeStops(0.7, 0.86, 12, 'x', 6, 1.5)]),
    tw('frame', [[0, {}], ...shakeStops(0.7, 0.88, 8, 'r', 2.4, 0.4)]),
    flip('crack', [[0, 0], [0.73, 1]]),
    tw('sroof', [[0, {}], [0.71, {}], [0.76, { x: -8, y: 18, r: -14 }, 'ease-in'], [0.82, { x: -14, y: 36, r: -22 }]]),
    tw('sw1', [[0, {}], [0.72, {}], [0.8, { r: -80 }, 'ease-in']]),
    tw('sw2', [[0, {}], [0.72, {}], [0.8, { r: 80 }, 'ease-in']]),
    tw('sw3', [[0, {}], [0.73, {}], [0.8, { sy: 0.2 }, 'ease-in']]),
    tw('dust', [[0, { o: 0, s: 0.6 }], [0.76, { o: 0, s: 0.6 }], [0.8, { o: 1, s: 1 }], [0.92, { o: 0, s: 1.3 }]]),
    ...mood('wk', [[0, 'focus'], [0.71, 'fear'], [0.86, 'relief']]),
    tw('wk-armR', [[0, {}], [0.86, {}], [0.92, { r: -150 }]]),
    tw('wk-armL', [[0, {}], [0.71, {}], [0.74, { r: 60 }], [0.86, { r: 0 }]]),
  ],
}

function Taxi({ id, empty }: { id: string; empty?: boolean }) {
  return (
    <g>
      <path
        d="M0 -8 L0 -24 Q1 -28 8 -29 L18 -30 L26 -42 Q28 -45 33 -45 L52 -45 Q57 -45 59 -42 L66 -30 L72 -29 Q76 -28 76 -22 L76 -8 Z"
        fill="#e9b928"
        stroke={INK}
        strokeWidth={1.4}
      />
      <path d="M28 -31 L34 -41 L44 -41 L44 -31 Z M48 -31 L48 -41 L56 -41 L62 -31 Z" fill="#344055" stroke={INK} strokeWidth={1} />
      {!empty && <circle cx={39} cy={-35} r={4} fill="#151a26" />}
      <path d="M4 -18 L72 -18" stroke={INK} strokeWidth={1.2} strokeDasharray="4 4" />
      {empty ? (
        <rect data-k={`${id}-sign`} x={30} y={-52} width={16} height={7} rx={1.5} fill="#4a4f5a" stroke={INK} strokeWidth={1} />
      ) : (
        <rect x={30} y={-52} width={16} height={7} rx={1.5} fill="#4f3a3a" stroke={INK} strokeWidth={1} />
      )}
      <circle cx={16} cy={-8} r={7} fill={INK} />
      <circle cx={62} cy={-8} r={7} fill={INK} />
    </g>
  )
}

/* available — rain-soaked, waving at a row of taken cabs, until one roof light turns green. */
export const available: Scene = {
  id: 'available',
  label: '暴雨夜一排出租车都暗着灯载着客，淋成落汤鸡时，终于有一辆亮起空车绿灯',
  sfx: 'click',
  hit: 0.74,
  render: () => (
    <g>
      <Backdrop sky="#26314a" ground="#1f2533" groundY={296} />
      <g fill="#1d2638">
        <rect x={-40} y={120} width={80} height={180} />
        <rect x={50} y={90} width={60} height={210} />
        <rect x={120} y={140} width={90} height={160} />
        <rect x={220} y={100} width={120} height={200} />
      </g>
      <g fill="#f3d58a" opacity={0.45}>
        <rect x={62} y={110} width={8} height={10} />
        <rect x={86} y={140} width={8} height={10} />
        <rect x={140} y={160} width={8} height={10} />
        <rect x={240} y={120} width={8} height={10} />
        <rect x={290} y={150} width={8} height={10} />
      </g>
      <rect x={-400} y={330} width={1120} height={500} fill="#323a4c" />
      {[
        ['t1', -8],
        ['t2', 68],
        ['t3', 146],
        ['t4', 226],
      ].map(([id, x]) => (
        <K key={id} x={x as number} y={300}>
          <Taxi id={id as string} empty={id === 't3'} />
          {id === 't3' && (
            <g>
              <K k="t3-glow" o={0}>
                <circle cx={38} cy={-49} r={18} fill="#3ddc84" opacity={0.45} />
              </K>
              <K k="t3-hl" o={0}>
                <path d="M76 -22 L116 -32 L116 -6 Z" fill="#fff3b0" opacity={0.5} />
              </K>
            </g>
          )}
        </K>
      ))}
      <K k="stu-pos" x={42} y={384} s={1.35}>
        <Person id="stu" moods={['sad', 'nervous', 'shock', 'joy']} shirt="#6c8fb3" hair="messy" arms={[165, -30]} />
        <path d="M-26 -126 L22 -130 L24 -122 L-24 -118 Z" fill="#e8e2d2" stroke={INK} strokeWidth={1.2} />
        <Ln d="M-18 -124 L14 -127" w={0.8} c="#9a9282" />
      </K>
      <Rain n={60} />
    </g>
  ),
  tracks: [
    tw('rain', [[0, { y: -12, o: 0.7 }, 'linear'], [0.7, { y: 20, o: 1 }, 'linear'], [1, { y: 34, o: 0.8 }]]),
    css('t3-sign', [[0, { fill: '#4a4f5a' }], [0.73, { fill: '#4a4f5a' }], [0.735, { fill: '#3ddc84' }]], 'linear'),
    fade('t3-glow', [[0, 0], [0.73, 0], [0.75, 1], [0.79, 0.5], [0.83, 1]]),
    flip('t3-hl', [[0, 0], [0.75, 1], [0.78, 0], [0.8, 1]]),
    tw('stu-armR', [
      [0, {}],
      [0.14, {}],
      [0.22, { r: -100 }],
      [0.3, { r: -70 }],
      [0.38, { r: -115 }],
      [0.46, { r: -75 }],
      [0.54, { r: -120 }],
      [0.62, { r: -80 }],
      [0.7, { r: -125 }],
      [0.84, { r: -130 }],
    ]),
    tw('stu-pos', [[0, {}], [0.84, {}], [0.94, { x: 40, y: -8 }]]),
    tw('stu-body', [[0, {}], [0.84, {}], [0.92, { r: 10 }]]),
    ...mood('stu', [[0, 'sad'], [0.4, 'nervous'], [0.74, 'shock'], [0.84, 'joy']]),
  ],
}

/* impact — one hard kick, a shattered window, and the face that appears in the hole. */
export const impact: Scene = {
  id: 'impact',
  label: '一脚把球踢出去，砸碎了窗户玻璃，刻薄邻居从破洞里探出头怒视',
  sfx: 'crash',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#dfeaf3" ground="#9fc48a" groundY={330} />
      <rect x={176} y={60} width={300} height={270} fill="#ead7bd" stroke={INK} strokeWidth={1.6} />
      <defs>
        <clipPath id="cw-imp-win">
          <rect x={200} y={110} width={90} height={90} />
        </clipPath>
      </defs>
      <rect x={200} y={110} width={90} height={90} fill="#bfe0f0" />
      <g clipPath="url(#cw-imp-win)">
        <K k="hole" o={0}>
          <path d="M228 138 L240 132 L252 140 L264 134 L266 150 L272 162 L258 168 L250 180 L238 172 L224 174 L226 160 L218 150 Z" fill="#3b4658" />
        </K>
        <K k="own-pos" x={245} y={162} s={1.2}>
          <Head id="own" />
        </K>
        <K k="crack" o={0}>
          <Ln d="M245 155 L200 120 M245 155 L290 112 M245 155 L296 170 M245 155 L262 204 M245 155 L206 196 M245 155 L196 156" w={1.3} c="#f5fbff" />
        </K>
      </g>
      <rect x={200} y={110} width={90} height={90} fill="none" stroke="#fff" strokeWidth={5} />
      <rect x={200} y={110} width={90} height={90} fill="none" stroke={INK} strokeWidth={1.4} />
      <K k="shards" x={245} y={155} o={0}>
        <g fill="#d6eefa" stroke={INK} strokeWidth={0.8}>
          <path d="M0 0 L8 4 L2 10 Z" />
          <path d="M-10 4 L-4 2 L-6 12 Z" />
          <path d="M4 14 L12 14 L8 22 Z" />
          <path d="M-14 -6 L-8 -4 L-12 2 Z" />
        </g>
      </K>
      <K k="bang" x={245} y={155} o={0}>
        <Burst r0={18} r1={34} n={12} color="#f2b84b" w={2.6} />
      </K>
      <K k="stu-pos" x={78} y={330} s={1.3}>
        <Person id="stu" moods={['focus', 'happy', 'shock', 'awkward']} shirt="#d9534f" hair="messy" />
      </K>
      <K k="ball" x={118} y={318}>
        <circle r={11} fill="#fff" stroke={INK} strokeWidth={1.4} />
        <path d="M0 -4 L4 -1 L2.5 4 L-2.5 4 L-4 -1 Z" fill={INK} />
        <Ln d="M0 -4 L0 -11 M4 -1 L10 -4 M2.5 4 L6 9 M-2.5 4 L-6 9 M-4 -1 L-10 -4" w={1} />
      </K>
    </g>
  ),
  tracks: [
    tw('stu-body', [[0, {}], [0.12, {}], [0.68, { r: -14 }], [0.72, { r: 12 }, 'ease-in'], [0.8, { r: 4 }], [0.88, { r: 0 }]]),
    tw('stu-armL', [[0, {}], [0.12, {}], [0.68, { r: 40 }], [0.74, { r: 20 }], [0.84, { r: 20 }], [0.9, { r: 0 }]]),
    tw('stu-armR', [[0, {}], [0.12, {}], [0.68, { r: -40 }], [0.74, { r: -20 }], [0.84, { r: -20 }], [0.9, { r: -158 }]]),
    tw('stu-head', [[0, {}], [0.86, {}], [0.92, { r: -10 }]]),
    tw('ball', [
      [0, {}],
      [0.7, {}],
      [0.73, { x: 60, y: -110, r: 180, s: 0.85 }, 'linear'],
      [0.76, { x: 127, y: -163, r: 360, s: 0.7 }],
      [0.77, { x: 127, y: -163, r: 360, s: 0.7, o: 0 }],
    ]),
    flip('hole', [[0, 0], [0.76, 1]]),
    flip('crack', [[0, 0], [0.76, 1]]),
    tw('shards', [[0, { o: 0 }], [0.76, { o: 0 }], [0.77, { o: 1 }], [0.9, { x: -50, y: 160, r: 140, o: 0 }, 'ease-in']]),
    tw('bang', [[0, { o: 0, s: 0.5 }], [0.755, { o: 0, s: 0.5 }], [0.78, { o: 1, s: 1 }], [0.88, { o: 0, s: 1.4 }]]),
    tw('own-pos', [[0, { y: 50, o: 0 }], [0.82, { y: 50, o: 0 }], [0.86, { y: 0, o: 1 }, 'ease-out']]),
    ...mood('stu', [[0, 'focus'], [0.7, 'happy'], [0.77, 'shock'], [0.88, 'awkward']]),
  ],
}

function Head({ id }: { id: string }) {
  return (
    <g>
      <circle cx={0} cy={-23} r={6.6} fill="#4a3226" stroke={INK} strokeWidth={1.4} />
      <circle r={17} fill={SKIN[0]} stroke={INK} strokeWidth={1.6} />
      <g data-k={`${id}-m-angry`}>
        <Face mood="angry" look={-1} />
      </g>
      <path
        d="M-17 -3 C-18.5 -16 -9 -21.5 0 -21.5 C9.5 -21.5 18.5 -16 17 -3 C13 -9.5 6 -12.5 -1 -12 C-8 -11.5 -13.5 -8.5 -17 -3 Z"
        fill="#4a3226"
        stroke={INK}
        strokeWidth={1.4}
      />
      <g fill="none" stroke={INK} strokeWidth={1.4}>
        <circle cx={-6} cy={-1} r={5.6} />
        <circle cx={6} cy={-1} r={5.6} />
      </g>
    </g>
  )
}

/* strategy — the smug opponent leans back; one quiet knight move topples the king. */
export const strategy: Scene = {
  id: 'strategy',
  label: '对面刻薄考官抱着胳膊等着赢，你不动声色地走出一步马，对方的王应声倒下',
  sfx: 'thunk',
  hit: 0.77,
  render: () => (
    <g>
      <Backdrop sky="#efe9dd" ground="#c2ae8f" groundY={344} />
      <rect x={110} y={40} width={100} height={70} fill="#e3d6bf" stroke={INK} strokeWidth={1.3} />
      <circle cx={160} cy={75} r={22} fill="#fff" stroke={INK} strokeWidth={1.3} />
      <Ln d="M160 75 L160 60 M160 75 L171 80" w={1.8} />
      <K k="exa-pos" x={54} y={344} s={1.3}>
        <Person id="exa" moods={['smug', 'stern', 'nervous', 'shock']} shirt="#3f3b4f" hair="bun" hairColor="#4a3226" glasses tie="#a33d3d" legs="none" arms={[-36, 36]} look={1} />
      </K>
      <K k="stu-pos" x={268} y={344} s={1.3}>
        <Person id="stu" moods={['focus', 'smug']} shirt="#5d86b8" hair="messy" legs="none" arms={[80, -150]} look={-1} />
      </K>
      <Desk x={70} y={266} w={180} color="#a77b4f" legs={78} />
      <path d="M104 266 L216 266 L206 252 L114 252 Z" fill="#efe2c6" stroke={INK} strokeWidth={1.2} />
      <path d="M118 266 L124 252 M132 266 L136 252 M146 266 L148 252 M174 266 L172 252 M188 266 L184 252 M202 266 L196 252" stroke="#bfa979" strokeWidth={1} />
      <g fill="#2b2a28">
        <path d="M122 260 Q128 248 134 260 Z M120 260 L136 260 L136 263 L120 263 Z" />
        <circle cx={128} cy={248} r={4} />
        <path d="M164 260 Q170 248 176 260 Z M162 260 L178 260 L178 263 L162 263 Z" />
        <circle cx={170} cy={248} r={4} />
      </g>
      <K k="king" x={148} y={262}>
        <path d="M-9 0 L9 0 L6 -4 L4 -20 L7 -24 L-7 -24 L-4 -20 L-6 -4 Z" fill="#2b2a28" stroke={INK} strokeWidth={1} />
        <Ln d="M0 -24 L0 -34 M-4 -30 L4 -30" w={2.4} c="#2b2a28" />
      </K>
      <K k="knight" x={200} y={262}>
        <path d="M-9 0 L9 0 L7 -6 L6 -14 Q8 -22 2 -28 L-6 -26 L-9 -20 L-4 -18 L-6 -6 Z" fill="#f6f1e6" stroke={INK} strokeWidth={1.3} />
        <circle cx={0} cy={-22} r={1.2} fill={INK} />
      </K>
      <K k="check" x={148} y={246} o={0}>
        <Burst r0={16} r1={28} n={10} color="#d64541" w={2.2} />
      </K>
    </g>
  ),
  tracks: [
    tw('knight', [
      [0, {}],
      [0.4, {}],
      [0.55, { y: -32, r: -8 }],
      [0.7, { x: -18, y: -36, r: -8 }],
      [0.76, { x: -24, y: 0, r: 0 }, 'ease-in'],
    ]),
    tw('stu-armL', [[0, {}], [0.4, {}], [0.55, { r: 12 }], [0.7, { r: 16 }], [0.76, { r: 4 }], [0.9, { r: -40 }]]),
    tw('king', [[0, {}], [0.76, {}], [0.79, { r: -14 }], [0.85, { r: -92, x: -4 }, 'ease-in'], [0.88, { r: -86, x: -4 }], [0.91, { r: -90, x: -4 }]]),
    tw('check', [[0, { o: 0, s: 0.5 }], [0.77, { o: 0, s: 0.5 }], [0.8, { o: 1, s: 1 }], [0.9, { o: 0, s: 1.3 }]]),
    tw('exa-body', [[0, { r: -6 }], [0.5, { r: -6 }], [0.66, { r: 4 }], [0.8, { r: 4 }], [0.86, { r: -12 }]]),
    tw('exa-armL', [[0, {}], [0.8, {}], [0.86, { r: 150 }]]),
    tw('exa-armR', [[0, {}], [0.8, {}], [0.86, { r: -150 }]]),
    ...mood('exa', [[0, 'smug'], [0.45, 'stern'], [0.62, 'nervous'], [0.8, 'shock']]),
    ...mood('stu', [[0, 'focus'], [0.84, 'smug']]),
  ],
}

const RESUMES = [44, 101, 158, 215, 272]

/* arbitrary — the interviewer, eyes shut, flings a dart over the shoulder and picks the scribbled CV. */
export const arbitrary: Scene = {
  id: 'arbitrary',
  label: '面试官背对简历墙闭眼盲扔飞镖，扎中一份潦草简历就定了，精心准备的你当场愣住',
  sfx: 'thunk',
  hit: 0.78,
  render: () => (
    <g>
      <Backdrop sky="#efeae2" ground="#c9bca7" groundY={342} />
      <rect x={14} y={40} width={292} height={98} rx={3} fill="#c9a77a" stroke={INK} strokeWidth={1.5} />
      {RESUMES.map((cx, i) => (
        <K key={cx} k={i === 1 ? 'r2' : undefined} x={cx} y={52}>
          <g transform={i === 1 ? 'rotate(6)' : undefined}>
            <rect x={-23} y={0} width={46} height={72} fill={PAPER} stroke={INK} strokeWidth={1.2} />
            <circle cx={-11} cy={14} r={6.5} fill={i === 3 ? '#f4d6bb' : '#d8d2c4'} stroke={INK} strokeWidth={0.8} />
            {i === 1 ? (
              <g>
                <Ln d="M-18 30 L-6 34 L4 28 L16 33 M-18 42 L-2 46 L12 40 M-16 54 L10 58" w={1} c="#6b6b6b" />
                <circle cx={10} cy={18} r={7} fill="none" stroke="#9a6b3a" strokeWidth={1.4} opacity={0.7} />
              </g>
            ) : (
              <Ln d="M2 10 L18 10 M2 18 L14 18 M-18 32 L18 32 M-18 40 L18 40 M-18 48 L12 48 M-18 56 L16 56" w={0.9} c="#9a958a" />
            )}
            {i === 3 && <path d="M14 58 l2.4 5 l5.4 0.6 l-4 3.6 l1.2 5.4 l-5 -2.8 l-5 2.8 l1.2 -5.4 l-4 -3.6 l5.4 -0.6 Z" fill="#f2c94c" stroke={INK} strokeWidth={0.7} />}
            <circle cx={0} cy={0} r={2.6} fill="#d64541" />
          </g>
        </K>
      ))}
      <K k="pick" x={101} y={88} o={0}>
        <circle r={34} fill="none" stroke="#d64541" strokeWidth={2.6} />
      </K>
      <K k="exa-pos" x={160} y={344} s={1.3}>
        <Person id="exa" moods={['blind', 'smug']} shirt="#3f3b4f" hair="bun" hairColor="#4a3226" glasses tie="#a33d3d" arms={[6, -10]} />
      </K>
      <K k="dart" x={192} y={200}>
        <Ln d="M0 0 L16 4" w={2} c="#5a5a5a" />
        <path d="M14 3.5 L22 0 L20 5 L24 9 Z" fill="#d64541" />
        <path d="M0 0 L4 -1 L4 2 Z" fill={INK} />
      </K>
      <K k="stu-pos" x={282} y={344} s={1.2}>
        <Person
          id="stu"
          moods={['calm', 'nervous', 'shock', 'angry']}
          shirt="#5d86b8"
          hair="messy"
          arms={[10, -36]}
          look={-1}
          handR={<rect x={-10} y={-4} width={20} height={26} rx={1.5} fill="#2f6f8f" stroke={INK} strokeWidth={1} />}
        />
      </K>
    </g>
  ),
  tracks: [
    tw('exa-armR', [[0, {}], [0.12, {}], [0.62, { r: -150 }], [0.72, { r: -165 }], [0.76, { r: -120 }, 'ease-out'], [0.9, { r: -20 }]]),
    tw('exa-armL', [[0, {}], [0.84, {}], [0.92, { r: 150 }]]),
    tw('exa-body', [[0, {}], [0.62, { r: 4 }], [0.72, { r: 6 }], [0.76, { r: -6 }], [0.9, { r: 0 }]]),
    tw('dart', [
      [0, { o: 0 }],
      [0.6, { o: 0 }],
      [0.62, { o: 1 }],
      [0.72, { o: 1 }],
      [0.75, { x: -46, y: -124, r: 22 }, 'linear'],
      [0.78, { x: -91, y: -110, r: -18 }],
    ]),
    tw('r2', [[0, {}], [0.775, {}], [0.8, { r: 6 }], [0.83, { r: -4 }], [0.86, { r: 2 }], [0.9, { r: 0 }]]),
    tw('pick', [[0, { o: 0, s: 1.5 }], [0.8, { o: 0, s: 1.5 }], [0.86, { o: 1, s: 1 }]]),
    ...mood('exa', [[0, 'blind'], [0.86, 'smug']]),
    ...mood('stu', [[0, 'calm'], [0.42, 'nervous'], [0.79, 'shock'], [0.9, 'angry']]),
    tw('stu-body', [[0, {}], [0.79, {}], [0.83, { r: -8 }], [0.9, { r: 0 }]]),
  ],
}

/* process — wheat in, flour, oven, bread out: three numbered stations lighting up in order. */
export const process: Scene = {
  id: 'process',
  label: '传送带上麦子进磨坊、面粉进烤箱，一步一步地亮灯，最后一声叮，面包出炉',
  sfx: 'pop',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#e7e3da" ground="#b9b2a4" groundY={344} />
      <Ln d="M88 48 L144 48 M184 48 L238 48" w={1.6} c="#9a958a" />
      <path d="M144 48 L138 44 L138 52 Z M238 48 L232 44 L232 52 Z" fill="#9a958a" />
      {[70, 164, 256].map((x, i) => (
        <g key={x}>
          <circle data-k={`st${i + 1}`} cx={x} cy={48} r={14} fill="#d9d5cc" stroke={INK} strokeWidth={1.3} />
          <text x={x} y={53} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily="Georgia, serif">
            {i + 1}
          </text>
        </g>
      ))}
      <K k="bk-pos" x={290} y={344} s={1.15}>
        <Person id="bk" moods={['focus', 'nervous', 'joy']} shirt="#f3efe6" hair="chef" look={-1} />
      </K>
      <path d="M44 196 L96 196 L84 234 L56 234 Z" fill="#a9b1ba" stroke={INK} strokeWidth={1.4} />
      <rect x={46} y={234} width={48} height={52} fill="#8e9aa6" stroke={INK} strokeWidth={1.4} />
      <K k="gear" x={70} y={260}>
        <circle r={11} fill="#6b7682" stroke={INK} strokeWidth={1.2} />
        <Ln d="M-14 0 L14 0 M0 -14 L0 14 M-10 -10 L10 10 M10 -10 L-10 10" w={3} c="#6b7682" />
        <circle r={4} fill="#d9d5cc" />
      </K>
      <rect x={130} y={196} width={70} height={90} rx={4} fill="#8e9aa6" stroke={INK} strokeWidth={1.4} />
      <rect x={142} y={212} width={46} height={36} rx={3} fill="#3a3f47" stroke={INK} strokeWidth={1.2} />
      <rect data-k="glow" x={142} y={212} width={46} height={36} rx={3} fill="#ff9a3c" opacity={0} />
      <rect x={152} y={180} width={10} height={16} fill="#8e9aa6" stroke={INK} strokeWidth={1.2} />
      <K k="ding" x={165} y={170} o={0}>
        <Burst r0={14} r1={26} n={10} color="#f2b84b" w={2.4} />
      </K>
      <rect x={-40} y={284} width={400} height={12} fill="#3a3f47" />
      <K k="belt">
        <path d="M-40 290 L360 290" stroke="#6b717a" strokeWidth={2} strokeDasharray="6 14" />
      </K>
      <g fill="#8a9099" stroke={INK} strokeWidth={1}>
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
          <circle key={x} cx={x} cy={302} r={6} />
        ))}
      </g>
      <K k="wheat" x={14} y={284}>
        <Ln d="M-6 0 L-2 -26 M0 0 L0 -28 M6 0 L2 -26" w={1.6} c="#b8943a" />
        <g fill="#e2b84a" stroke={INK} strokeWidth={0.6}>
          <ellipse cx={-3} cy={-28} rx={2.6} ry={5} />
          <ellipse cx={0} cy={-31} rx={2.6} ry={5} />
          <ellipse cx={3} cy={-28} rx={2.6} ry={5} />
        </g>
      </K>
      <K k="flour" x={106} y={284} o={0}>
        <path d="M-10 0 L-12 -18 Q0 -24 12 -18 L10 0 Z" fill="#f6f2ea" stroke={INK} strokeWidth={1.2} />
        <Ln d="M-6 -18 L6 -18" w={1} />
      </K>
      <K k="bread" x={214} y={284} o={0}>
        <path d="M-16 0 Q-18 -16 0 -18 Q18 -16 16 0 Z" fill="#d79a4e" stroke={INK} strokeWidth={1.3} />
        <Ln d="M-8 -12 L-4 -6 M0 -14 L4 -8 M8 -12 L11 -7" w={1.2} c="#a8692c" />
        <K k="steam" o={0}>
          <Ln d="M-6 -24 q-4 -6 0 -12 t0 -12 M6 -24 q-4 -6 0 -12 t0 -12" w={1.6} c="#c9c4ba" />
        </K>
      </K>
    </g>
  ),
  tracks: [
    tw('belt', [[0, { x: 0 }, 'linear'], [1, { x: 60 }]]),
    tw('gear', [[0, {}], [0.12, {}], [0.36, { r: 360 }], [0.7, { r: 400 }]]),
    tw('wheat', [[0, {}], [0.12, {}], [0.3, { x: 40 }], [0.34, { x: 46, o: 0 }]]),
    tw('flour', [[0, { o: 0 }], [0.33, { o: 0 }], [0.36, { o: 1 }], [0.52, { x: 30 }], [0.55, { x: 34, o: 0 }]]),
    fade('glow', [[0, 0], [0.52, 0], [0.7, 0.85], [0.74, 0.3], [0.8, 0]]),
    tw('bread', [[0, { o: 0 }], [0.72, { o: 0, s: 0.6 }], [0.76, { o: 1, s: 1.15, y: -26 }, 'ease-out'], [0.8, { y: 0, s: 1, x: 18 }, 'ease-in'], [0.86, { x: 36 }]]),
    tw('steam', [[0, { o: 0 }], [0.82, { o: 0 }], [0.88, { o: 1 }], [1, { o: 0.7, y: -8 }]]),
    tw('ding', [[0, { o: 0, s: 0.5 }], [0.74, { o: 0, s: 0.5 }], [0.77, { o: 1, s: 1 }], [0.88, { o: 0, s: 1.3 }]]),
    css('st1', [[0, { fill: '#d9d5cc' }], [0.3, { fill: '#d9d5cc' }], [0.32, { fill: '#2f7d5b' }]], 'linear'),
    css('st2', [[0, { fill: '#d9d5cc' }], [0.52, { fill: '#d9d5cc' }], [0.54, { fill: '#2f7d5b' }]], 'linear'),
    css('st3', [[0, { fill: '#d9d5cc' }], [0.76, { fill: '#d9d5cc' }], [0.78, { fill: '#2f7d5b' }]], 'linear'),
    ...mood('bk', [[0, 'focus'], [0.56, 'nervous'], [0.8, 'joy']]),
    tw('bk-armL', [[0, {}], [0.8, {}], [0.88, { r: 140 }]]),
    tw('bk-armR', [[0, {}], [0.8, {}], [0.88, { r: -140 }]]),
  ],
}

const CROWD: { id: string; x: number; shirt: string; hair: 'short' | 'long' | 'bald' | 'side'; skin: string }[] = [
  { id: 'q1', x: 42, shirt: '#c97b63', hair: 'long', skin: SKIN[1] },
  { id: 'q2', x: 114, shirt: '#6c8fb3', hair: 'short', skin: SKIN[0] },
  { id: 'q3', x: 206, shirt: '#7c8a5a', hair: 'bald', skin: SKIN[2] },
  { id: 'q4', x: 278, shirt: '#9a6fae', hair: 'side', skin: SKIN[3] },
]

/* authority — a shouting hall goes silent: one red seal slams down and every head bows. */
export const authority: Scene = {
  id: 'authority',
  label: '大厅里众人争吵不休，高台上的人举起红章重重盖下，所有人立刻低头照办',
  sfx: 'stamp',
  hit: 0.75,
  render: () => (
    <g>
      <Backdrop sky="#efe7d8" ground="#c8b48f" groundY={340} />
      <circle cx={160} cy={52} r={24} fill="#e2b84a" stroke={INK} strokeWidth={1.5} />
      <path d="M160 36 l4.4 9 l10 1.4 l-7.2 7 l1.7 10 l-8.9 -4.7 l-8.9 4.7 l1.7 -10 l-7.2 -7 l10 -1.4 Z" fill="#c0392b" />
      <K x={160} y={254} s={1.2}>
        <Person id="off" moods={['stern']} shirt="#2f3a4a" hair="side" hairColor="#3a3a3a" glasses tie="#b33a3a" legs="none" arms={[8, -30]} />
      </K>
      <rect x={86} y={188} width={148} height={10} fill="#8f6644" stroke={INK} strokeWidth={1.4} />
      <rect x={92} y={198} width={136} height={68} fill="#7a5536" stroke={INK} strokeWidth={1.4} />
      <path d="M160 214 l3 6 l6.6 1 l-4.8 4.6 l1.2 6.6 l-6 -3.2 l-6 3.2 l1.2 -6.6 l-4.8 -4.6 l6.6 -1 Z" fill="#e2b84a" />
      <path d="M160 188 L196 188 L192 182 L164 182 Z" fill={PAPER} stroke={INK} strokeWidth={1} />
      <K k="seal" x={178} y={185} o={0}>
        <rect x={-8} y={-4} width={16} height={8} rx={1.5} fill="#d23b2f" opacity={0.9} />
      </K>
      <K k="ring" x={178} y={188} o={0}>
        <ellipse rx={26} ry={7} fill="none" stroke="#d23b2f" strokeWidth={2} />
      </K>
      <K k="stamp" x={196} y={186}>
        <circle cx={0} cy={-24} r={6} fill="#5a3a26" stroke={INK} strokeWidth={1.2} />
        <rect x={-3} y={-19} width={6} height={11} fill="#5a3a26" stroke={INK} strokeWidth={1} />
        <rect x={-10} y={-8} width={20} height={8} rx={1.5} fill="#7a5536" stroke={INK} strokeWidth={1.2} />
        <rect x={-10} y={-2} width={20} height={2.4} fill="#d23b2f" />
      </K>
      {CROWD.map((p) => (
        <K key={p.id} k={`${p.id}-pos`} x={p.x} y={382}>
          <Person id={p.id} moods={['angry', 'shock', 'guilty']} shirt={p.shirt} hair={p.hair} hairColor="#3a2a20" skin={p.skin} arms={[30, -30]} />
          <K k={`${p.id}-noise`} y={-140}>
            <Ln d="M-14 0 l5 -6 l5 6 l5 -6 l5 6 l5 -6" w={1.8} c="#d64541" />
          </K>
        </K>
      ))}
    </g>
  ),
  tracks: [
    tw('off-armR', [[0, {}], [0.12, {}], [0.66, { r: -130 }], [0.7, { r: -138 }], [0.75, { r: -10 }, 'ease-in'], [0.8, { r: -10 }], [0.88, { r: -50 }]]),
    tw('stamp', [[0, {}], [0.12, {}], [0.66, { x: -6, y: -60 }], [0.7, { x: -8, y: -68 }], [0.75, { x: -18, y: 0 }, 'ease-in'], [0.8, { x: -18, y: 0 }], [0.88, { x: 0, y: -34 }]]),
    tw('seal', [[0, { o: 0, s: 0.6 }], [0.75, { o: 0, s: 0.6 }], [0.76, { o: 1, s: 1.15 }], [0.8, { s: 1 }]]),
    tw('ring', [[0, { o: 0, s: 0.4 }], [0.75, { o: 0, s: 0.4 }], [0.76, { o: 1, s: 0.6 }], [0.9, { o: 0, s: 2.6 }]]),
    ...CROWD.flatMap((p, i) => [
      ...mood(p.id, [[0, 'angry'], [0.72, 'shock'], [0.8, 'guilty']]),
      tw(`${p.id}-armL`, [[0, {}], ...shakeStops(0.12 + i * 0.02, 0.7, 8, 'r', 20, 40, { r: 40 }), [0.74, { r: 0 }], [0.82, { r: -24 }]]),
      tw(`${p.id}-armR`, [[0, {}], ...shakeStops(0.14 + i * 0.02, 0.7, 8, 'r', 20, 40, { r: -40 }), [0.74, { r: 0 }], [0.82, { r: 24 }]]),
      tw(`${p.id}-noise`, [[0, { o: 0 }], [0.12, { o: 0.4 }], [0.6, { o: 1, s: 1.3 }], [0.72, { o: 1, s: 1.3 }], [0.75, { o: 0, s: 0.4 }]]),
      tw(`${p.id}-head`, [[0, {}], [0.72, { y: -3 }], [0.8, { y: 5 }], [0.86, { y: 6 }]]),
      tw(`${p.id}-body`, [[0, {}], [0.78, {}], [0.86, { sy: 0.94 }]]),
    ]),
  ],
}

const PENGUINS = [40, 100, 160, 220, 280]

function Penguin({ id, moods, look, special }: { id: string; moods: Mood[]; look: number; special?: boolean }) {
  return (
    <g>
      <ellipse cx={-8} cy={-2} rx={7} ry={3} fill="#f2a33a" stroke={INK} strokeWidth={0.8} />
      <ellipse cx={8} cy={-2} rx={7} ry={3} fill="#f2a33a" stroke={INK} strokeWidth={0.8} />
      <Ln d="M-19 -42 Q-30 -24 -22 -12 M19 -42 Q30 -24 22 -12" w={6} c="#26262e" />
      <ellipse cx={0} cy={-34} rx={21} ry={33} fill="#26262e" stroke={INK} strokeWidth={1.4} />
      <ellipse cx={0} cy={-26} rx={14} ry={22} fill="#f7f5ef" />
      <circle cy={-52} r={12} fill="#f7f5ef" />
      <g transform="translate(0 -53) scale(0.62)">
        {moods.map((m, i) => (
          <g key={m} data-k={`${id}-m-${m}`} opacity={i === 0 ? 1 : 0}>
            <Face mood={m} look={look} />
          </g>
        ))}
      </g>
      <path d="M-2.6 -51.6 L2.6 -51.6 L0 -48.6 Z" fill="#f2a33a" />
      {special && (
        <g>
          <K k="crest" y={-64}>
            <path d="M0 0 L-8 -14 L-2 -6 L0 -18 L2 -6 L8 -14 Z" fill="#f2c94c" stroke={INK} strokeWidth={0.9} />
          </K>
          <K k="bow" y={-38}>
            <path d="M0 0 L-11 -6 L-11 6 Z M0 0 L11 -6 L11 6 Z" fill="#d23b2f" stroke={INK} strokeWidth={1} />
            <circle r={2.6} fill="#a52a20" />
          </K>
        </g>
      )}
    </g>
  )
}

/* feature — five identical penguins; the spotlight stops on the one with the red bow tie. */
export const feature: Scene = {
  id: 'feature',
  label: '舞台上一排一模一样的企鹅，追光扫来扫去，停在第四只身上，它亮出红领结和金冠羽',
  sfx: 'pop',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#2b2838" ground="#463f55" groundY={330} />
      <path d="M-400 -400 L24 -400 Q4 120 30 330 L-400 330 Z" fill="#8e2b3a" />
      <path d="M720 -400 L296 -400 Q316 120 290 330 L720 330 Z" fill="#8e2b3a" />
      <Ln d="M10 -20 Q14 140 18 320 M310 -20 Q306 140 302 320" w={1.2} c="#6e1f2b" />
      <K k="spot" x={160} y={-40}>
        <path d="M0 0 L-40 380 L40 380 Z" fill="#fff6c8" opacity={0.22} />
        <ellipse cx={0} cy={374} rx={42} ry={8} fill="#fff6c8" opacity={0.3} />
      </K>
      {PENGUINS.map((x, i) => {
        const id = `p${i + 1}`
        const special = i === 3
        return (
          <K key={id} k={`${id}-pos`} x={x} y={330} s={1.1}>
            <Penguin
              id={id}
              moods={special ? ['calm', 'nervous', 'smug'] : ['calm', 'nervous', 'shock']}
              look={special ? 0 : i < 3 ? 1 : -1}
              special={special}
            />
          </K>
        )
      })}
      <K k="spark" x={220} y={262} o={0}>
        <Burst r0={36} r1={50} n={12} color="#f2c94c" w={2.2} />
      </K>
    </g>
  ),
  tracks: [
    tw('spot', [[0, { r: 0, o: 0.8 }], [0.12, { r: 0 }], [0.26, { r: 18 }], [0.42, { r: -18 }], [0.56, { r: 9 }], [0.7, { r: -9 }], [0.78, { r: -9, o: 1 }]]),
    ...PENGUINS.flatMap((_, i) => {
      const id = `p${i + 1}`
      if (i === 3) {
        return [
          ...mood(id, [[0, 'calm'], [0.5, 'nervous'], [0.8, 'smug']]),
          tw(`${id}-pos`, [[0, {}], [0.76, {}], [0.8, { y: -16 }, 'ease-out'], [0.85, { y: 0 }, 'ease-in']]),
        ]
      }
      const lean = i < 3 ? 6 : -6
      return [
        ...mood(id, [[0, 'calm'], [0.3 + i * 0.04, 'nervous'], [0.79, 'shock']]),
        tw(`${id}-pos`, [[0, {}], [0.78, {}], [0.84, { r: lean }]]),
      ]
    }),
    tw('crest', [[0, { s: 0, o: 0 }], [0.72, { s: 0, o: 0 }], [0.77, { s: 1.35, o: 1 }, 'ease-out'], [0.82, { s: 1 }]]),
    tw('bow', [[0, { s: 0, o: 0 }], [0.73, { s: 0, o: 0 }], [0.78, { s: 1.35, o: 1 }, 'ease-out'], [0.83, { s: 1 }]]),
    tw('spark', [[0, { o: 0, s: 0.6 }], [0.76, { o: 0, s: 0.6 }], [0.8, { o: 1, s: 1 }], [0.92, { o: 0, s: 1.3 }]]),
  ],
}

const RIDERS: { id: string; x: number; shirt: string; hair: 'short' | 'long' | 'bald' | 'side' | 'bun'; skin: string; look: number }[] = [
  { id: 'e1', x: 92, shirt: '#c97b63', hair: 'long', skin: SKIN[1], look: 1 },
  { id: 'e2', x: 134, shirt: '#2f3e55', hair: 'side', skin: SKIN[0], look: 1 },
  { id: 'e3', x: 188, shirt: '#7c8a5a', hair: 'bald', skin: SKIN[2], look: -1 },
  { id: 'e4', x: 230, shirt: '#9a6fae', hair: 'bun', skin: SKIN[3], look: -1 },
]

/* capacity — one person too many: the overload light flares red and every head turns. */
export const capacity: Scene = {
  id: 'capacity',
  label: '挤满人的电梯，最后一个人硬挤进去，超载红灯亮起蜂鸣，全电梯的人转头瞪着他',
  sfx: 'buzzer',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#e9e5dc" ground="#cfc6b5" groundY={352} />
      <rect x={48} y={52} width={224} height={300} fill="#9aa3ad" stroke={INK} strokeWidth={1.6} />
      <rect x={64} y={94} width={192} height={258} fill="#ddd6c6" stroke={INK} strokeWidth={1.2} />
      <Ln d="M70 252 L250 252" w={3} c="#b8b0a0" />
      <rect x={64} y={94} width={12} height={258} fill="#b8c0c8" stroke={INK} strokeWidth={1} />
      <rect x={244} y={94} width={12} height={258} fill="#b8c0c8" stroke={INK} strokeWidth={1} />
      <rect x={116} y={60} width={88} height={26} rx={4} fill="#2b2a28" />
      <K k="glow" x={134} y={73} o={0}>
        <circle r={16} fill="#e53935" opacity={0.45} />
      </K>
      <circle data-k="light" cx={134} cy={73} r={7} fill="#6b6f75" />
      <K k="floor-no">
        <text x={172} y={78} textAnchor="middle" fontSize={12} fill="#9aa3ad" fontFamily="Menlo, monospace">
          ▲ 1
        </text>
      </K>
      <K k="overtext" o={0}>
        <text x={172} y={78} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ff5a4f">
          超载
        </text>
      </K>
      <K k="crowdL">
        {RIDERS.slice(0, 2).map((p) => (
          <K key={p.id} x={p.x} y={340} s={0.98}>
            <Person id={p.id} moods={['calm', 'nervous', 'glare']} shirt={p.shirt} hair={p.hair} hairColor="#3a2a20" skin={p.skin} look={p.look} />
          </K>
        ))}
      </K>
      <K k="crowdR">
        {RIDERS.slice(2).map((p) => (
          <K key={p.id} x={p.x} y={340} s={0.98}>
            <Person id={p.id} moods={['calm', 'nervous', 'glare']} shirt={p.shirt} hair={p.hair} hairColor="#3a2a20" skin={p.skin} look={p.look} />
          </K>
        ))}
      </K>
      <K k="bangs" o={0}>
        <g fill="#d64541" fontSize={20} fontWeight={800} fontFamily="Georgia, serif" textAnchor="middle">
          {RIDERS.map((p) => (
            <text key={p.id} x={p.x + 14} y={214}>
              !
            </text>
          ))}
        </g>
      </K>
      <K k="stu-pos" x={160} y={394} s={1.12}>
        <Person id="stu" moods={['calm', 'nervous', 'shock', 'awkward']} shirt="#e3a24a" hair="messy" />
      </K>
      <K k="wash" o={0}>
        <rect x={-400} y={-400} width={1120} height={1200} fill="#e53935" />
      </K>
    </g>
  ),
  tracks: [
    tw('stu-pos', [[0, { x: 150 }], [0.12, { x: 150 }], [0.4, { x: 60 }], [0.56, { x: 22 }], [0.66, { x: 4 }], [0.7, { x: 0 }]]),
    tw('stu-body', [[0, {}], [0.4, { sx: 0.94 }], [0.7, { sx: 0.9 }], [0.78, { sx: 1 }]]),
    tw('crowdL', [[0, {}], [0.4, {}], [0.7, { x: -8 }]]),
    tw('crowdR', [[0, {}], [0.3, {}], [0.6, { x: 8 }], [0.7, { x: 10 }]]),
    css('light', [[0, { fill: '#6b6f75' }], [0.75, { fill: '#6b6f75' }], [0.755, { fill: '#e53935' }], [0.8, { fill: '#ff8a80' }], [0.85, { fill: '#e53935' }], [0.9, { fill: '#ff8a80' }], [0.95, { fill: '#e53935' }]], 'linear'),
    fade('glow', [[0, 0], [0.75, 0], [0.77, 1], [0.82, 0.4], [0.87, 1], [0.92, 0.4], [0.97, 1]]),
    flip('overtext', [[0, 0], [0.755, 1]]),
    flip('floor-no', [[0, 1], [0.755, 0]]),
    fade('wash', [[0, 0], [0.75, 0], [0.77, 0.16], [0.84, 0.04], [0.9, 0.1], [1, 0.06]]),
    tw('bangs', [[0, { o: 0, y: 6 }], [0.78, { o: 0, y: 6 }], [0.82, { o: 1, y: 0 }]]),
    ...RIDERS.flatMap((p, i) => [
      ...mood(p.id, [[0, 'calm'], [0.44 + i * 0.03, 'nervous'], [0.77, 'glare']]),
      tw(`${p.id}-head`, [[0, {}], [0.76, {}], [0.8, { r: p.look * 10 }]]),
    ]),
    ...mood('stu', [[0, 'calm'], [0.46, 'nervous'], [0.76, 'shock'], [0.86, 'awkward']]),
    tw('stu-head', [[0, {}], [0.86, {}], [0.92, { r: 8, y: 2 }]]),
  ],
}
