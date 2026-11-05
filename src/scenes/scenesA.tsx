import { Backdrop, Burst, Desk, Dog, INK, K, Limb, Ln, PAPER, Person, Rain, SKIN } from './cast'
import { css, fade, flip, mood, tw, wiggle, type Scene } from './timeline'

/* abandon — tied dog chases the departing car and is yanked back by the rope. */
export const abandon: Scene = {
  id: 'abandon',
  label: '雨夜，拴在电线杆上的小狗追着开走的车，被绳子猛地拽回，只能坐在雨里',
  sfx: 'snap',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#34405a" ground="#283040" groundY={312} />
      <g fill="#2a3448">
        <rect x={-60} y={150} width={92} height={170} />
        <rect x={196} y={118} width={58} height={200} />
        <rect x={250} y={168} width={110} height={150} />
      </g>
      <g fill="#f3d58a" opacity={0.5}>
        <rect x={6} y={176} width={8} height={10} />
        <rect x={210} y={140} width={8} height={10} />
        <rect x={232} y={170} width={8} height={10} />
        <rect x={276} y={190} width={8} height={10} />
      </g>
      <path d="M92 104 L40 312 L150 312 Z" fill="#ffe7a3" opacity={0.12} />
      <rect x={58} y={104} width={7} height={210} fill="#5a6574" stroke={INK} strokeWidth={1.2} />
      <path d="M61 106 Q61 94 80 94 L92 94" stroke="#5a6574" strokeWidth={5} fill="none" />
      <path d="M82 94 L102 94 L97 103 L87 103 Z" fill="#3c4553" stroke={INK} strokeWidth={1.2} />
      <circle cx={92} cy={105} r={4.5} fill="#ffe08a" />
      <ellipse cx={100} cy={330} rx={52} ry={5} fill="#ffe7a3" opacity={0.14} />

      <K k="car" x={196} y={312}>
        <K k="exhaust" x={-6} y={-14}>
          <g fill="#c7ccd6" opacity={0.85}>
            <circle cx={0} cy={0} r={6} />
            <circle cx={-10} cy={-4} r={8} />
            <circle cx={-22} cy={-2} r={6} />
          </g>
        </K>
        <path
          d="M0 -10 L0 -30 Q2 -36 12 -38 L30 -40 L44 -58 Q48 -62 56 -62 L88 -62 Q96 -62 100 -56 L112 -40 L120 -38 Q126 -36 126 -28 L126 -10 Z"
          fill="#a63f3f"
          stroke={INK}
          strokeWidth={1.6}
        />
        <path d="M48 -42 L58 -56 L72 -56 L72 -42 Z M78 -42 L78 -56 L94 -56 L104 -42 Z" fill="#9fb3c8" stroke={INK} strokeWidth={1.2} />
        <K k="taillight">
          <rect x={-1} y={-31} width={6} height={8} rx={1} fill="#ff4d4d" />
          <circle cx={2} cy={-27} r={9} fill="#ff4d4d" opacity={0.35} />
        </K>
        <circle cx={26} cy={-9} r={10} fill={INK} />
        <circle cx={26} cy={-9} r={4} fill="#8a8f98" />
        <circle cx={100} cy={-9} r={10} fill={INK} />
        <circle cx={100} cy={-9} r={4} fill="#8a8f98" />
      </K>

      <K k="owner-pos" x={268} y={314} s={1.2}>
        <Person id="owner" moods={['awkward']} shirt="#4c5b73" hair="side" hairColor="#3b2f2a" />
      </K>

      <K x={65} y={290}>
        <K k="rope-len">
          <K k="rope-slack">
            <Ln d="M0 0 Q38 22 76 -6" w={2.2} c="#d8cbb0" />
          </K>
          <K k="rope-taut" o={0}>
            <Ln d="M0 0 L76 -6" w={2.4} c="#e8dcc0" />
          </K>
        </K>
      </K>
      <K k="dog-pos" x={118} y={312} s={1.3}>
        <ellipse cx={0} cy={1} rx={26} ry={3} fill="#000" opacity={0.25} />
        <Dog id="dog" moods={['happy', 'alert', 'panic', 'sad']} />
      </K>
      <K k="yank" x={146} y={262} o={0}>
        <Burst r0={8} r1={18} n={8} color="#ffe08a" />
      </K>
      <Rain />
    </g>
  ),
  tracks: [
    tw('rain', [[0, { y: -12 }, 'linear'], [1, { y: 34 }]]),
    tw('owner-pos', [[0, {}], [0.2, {}], [0.36, { x: -16, o: 0 }]]),
    flip('taillight', [[0, 0.35], [0.34, 1]]),
    tw('exhaust', [[0, { o: 0, s: 0.4 }], [0.36, { o: 0, s: 0.4 }], [0.44, { o: 0.9, s: 0.8 }], [0.7, { o: 0.9, s: 1.2, x: -8 }], [0.82, { o: 0, s: 1.7, x: -24 }]]),
    tw('car', [[0, {}], [0.36, {}], [0.7, { x: 30 }, 'ease-in'], [0.82, { x: 250 }], [1, { x: 270 }]]),
    tw('dog-pos', [
      [0, {}],
      [0.3, {}],
      [0.7, { x: 22 }],
      [0.76, { x: 48 }, 'ease-out'],
      [0.8, { x: 6, r: -14 }, 'ease-out'],
      [0.88, { x: 0, r: 0 }],
    ]),
    tw('rope-len', [[0, {}], [0.3, {}], [0.7, { sx: 1.29 }], [0.76, { sx: 1.63 }, 'ease-out'], [0.8, { sx: 1.08 }, 'ease-out'], [0.88, { sx: 1 }]]),
    flip('rope-slack', [[0, 1], [0.6, 0], [0.82, 1]]),
    flip('rope-taut', [[0, 0], [0.6, 1], [0.82, 0]]),
    tw('yank', [[0, { o: 0, s: 0.4 }], [0.755, { o: 0, s: 0.4 }], [0.77, { o: 1, s: 1 }], [0.84, { o: 0, s: 1.5 }]]),
    tw('dog-tail', [
      [0, { r: -10 }],
      [0.05, { r: 25 }],
      [0.1, { r: -10 }],
      [0.15, { r: 25 }],
      [0.2, { r: -10 }],
      [0.25, { r: 25 }],
      [0.3, { r: 0 }],
      [0.82, { r: 0 }],
      [0.92, { r: -70 }],
    ]),
    tw('dog-head', [[0, {}], [0.3, { r: -8 }], [0.68, { r: -12 }], [0.84, { r: 0 }], [0.94, { r: 16 }]]),
    ...mood('dog', [[0, 'happy'], [0.3, 'alert'], [0.68, 'panic'], [0.84, 'sad']]),
  ],
}

/* challenge — the examiner slams a towering paper stack; the student rolls up and accepts it. */
export const challenge: Scene = {
  id: 'challenge',
  label: '刻薄考官把一摞比人还高的试卷砸在考生桌上，考生先是傻眼，随后绑上头带迎战',
  sfx: 'slam',
  hit: 0.75,
  render: () => (
    <g>
      <Backdrop sky="#ece6d8" ground="#cbbb9f" groundY={330} />
      <rect x={18} y={40} width={150} height={88} rx={3} fill="#2f4a3e" stroke={INK} strokeWidth={1.6} />
      <Ln d="M34 64 L98 64 M34 80 L132 80 M34 96 L80 96" w={2} c="#d9e4dc" />
      <rect x={210} y={30} width={70} height={130} fill="#d8cfbd" stroke={INK} strokeWidth={1.4} />
      <circle cx={268} cy={98} r={3} fill={INK} />

      <K k="stu-pos" x={92} y={318} s={1.3}>
        <Person
          id="stu"
          moods={['smug', 'calm', 'nervous', 'shock', 'focus']}
          shirt="#5d86b8"
          hair="messy"
          legs="none"
          arms={[6, -40]}
          headExtra={
            <K k="band" o={0}>
              <path d="M-17.5 -8 Q0 -14 17.5 -8 L17.5 -3.6 Q0 -9.6 -17.5 -3.6 Z" fill="#d64541" stroke={INK} strokeWidth={1} />
              <path d="M16 -6 L25 -12 M16 -5 L26 -3" stroke="#d64541" strokeWidth={3} strokeLinecap="round" />
            </K>
          }
          handR={<rect x={-1.5} y={-14} width={3} height={16} fill="#f2c94c" stroke={INK} strokeWidth={0.8} />}
        />
      </K>

      <K k="desk">
        <Desk x={22} y={262} w={190} color="#c79a62" legs={56} />
      </K>

      <K k="exa-pos" x={250} y={340} s={1.3}>
        <Person id="exa" moods={['smug', 'stern']} shirt="#3f3b4f" hair="bun" hairColor="#4a3226" glasses tie="#a33d3d" arms={[150, -150]} />
      </K>
      <K k="stack" x={250} y={190}>
        <g>
          <rect x={-30} y={-66} width={60} height={66} fill={PAPER} stroke={INK} strokeWidth={1.5} />
          <Ln d="M-30 -56 L30 -56 M-30 -46 L30 -46 M-30 -36 L30 -36 M-30 -26 L30 -26 M-30 -16 L30 -16 M-30 -6 L30 -6" w={0.8} c="#b9b2a2" />
          <rect x={22} y={-50} width={10} height={5} fill="#d64541" />
          <rect x={22} y={-28} width={10} height={5} fill="#3e8ed0" />
        </g>
      </K>
      <K k="dust" x={150} y={262} o={0}>
        <Burst r0={34} r1={52} n={12} color="#8f8676" w={2.4} />
      </K>
    </g>
  ),
  tracks: [
    tw('exa-pos', [[0, { x: 70 }], [0.12, { x: 70 }], [0.62, { x: 0 }], [0.72, { x: -18 }], [0.8, { x: -12 }]]),
    tw('stack', [
      [0, { x: 70, sy: 0.55 }],
      [0.12, { x: 70, sy: 0.55 }],
      [0.62, { x: 0, sy: 1.25 }],
      [0.7, { x: -20, y: -8, sy: 1.25 }, 'ease-in'],
      [0.75, { x: -100, y: 72, sy: 1.25 }, 'ease-out'],
      [0.79, { x: -100, y: 72, sy: 1.1 }],
      [0.84, { x: -100, y: 72, sy: 1.25 }],
    ]),
    tw('exa-armL', [[0, {}], [0.7, {}], [0.76, { r: -110 }], [0.86, { r: -150 }]]),
    tw('exa-armR', [[0, {}], [0.7, {}], [0.76, { r: 110 }], [0.86, { r: 150 }]]),
    ...mood('exa', [[0, 'smug'], [0.66, 'stern'], [0.86, 'smug']]),
    tw('desk', [[0, {}], [0.745, {}], [0.76, { y: 5 }], [0.8, { y: -2 }], [0.84, { y: 0 }]]),
    tw('dust', [[0, { o: 0, s: 0.6 }], [0.745, { o: 0, s: 0.6 }], [0.77, { o: 1, s: 1 }], [0.86, { o: 0, s: 1.3 }]]),
    ...mood('stu', [[0, 'smug'], [0.3, 'calm'], [0.5, 'nervous'], [0.75, 'shock'], [0.86, 'focus']]),
    tw('stu-body', [[0, {}], [0.75, {}], [0.79, { r: -10 }], [0.88, { r: 0 }]]),
    tw('stu-armR', [[0, {}], [0.82, {}], [0.9, { r: -110 }]]),
    tw('stu-armL', [[0, {}], [0.82, {}], [0.9, { r: 40 }]]),
    tw('band', [[0, { o: 0, sx: 0.2 }], [0.86, { o: 0, sx: 0.2 }], [0.92, { o: 1, sx: 1 }]]),
  ],
}

/* benefit — the tired gardener keeps watering; the sapling bursts with fruit into their hand. */
export const benefit: Scene = {
  id: 'benefit',
  label: '烈日下满头大汗地给小树苗浇水，树突然长大结满果子，一颗苹果正好落进手里',
  sfx: 'chime',
  hit: 0.78,
  render: () => (
    <g>
      <Backdrop sky="#e1f0f2" ground="#a9c98c" groundY={318} />
      <circle cx={46} cy={58} r={22} fill="#ffd66b" />
      <K x={46} y={58}>
        <Burst r0={28} r1={38} n={12} color="#ffd66b" w={2.4} />
      </K>
      <K x={226} y={318}>
        <K k="trunk">
          <path d="M-7 0 L-5 -118 L5 -118 L7 0 Z" fill="#8a5a36" stroke={INK} strokeWidth={1.5} />
          <Ln d="M-1 -70 L-18 -96 M1 -88 L20 -108" w={4} c="#8a5a36" />
        </K>
        <K k="sprout">
          <Ln d="M0 0 L0 -16" w={2.2} c="#3f8f4a" />
          <path d="M0 -12 Q-10 -20 -14 -12 Q-8 -8 0 -12 Z M0 -14 Q9 -24 14 -15 Q8 -10 0 -14 Z" fill="#6cbf5a" stroke={INK} strokeWidth={1} />
        </K>
        <K k="canopy" y={-128}>
          <g fill="#5fae5a" stroke={INK} strokeWidth={1.5}>
            <circle cx={-34} cy={8} r={30} />
            <circle cx={30} cy={6} r={32} />
            <circle cx={0} cy={-18} r={36} />
          </g>
          <K k="fruits">
            <g fill="#e2574c" stroke={INK} strokeWidth={1.2}>
              <circle cx={-40} cy={14} r={6} />
              <circle cx={-6} cy={-14} r={6} />
              <circle cx={36} cy={18} r={6} />
              <circle cx={18} cy={-26} r={6} />
            </g>
          </K>
        </K>
      </K>

      <K k="stu-pos" x={112} y={320} s={1.3}>
        <Person id="stu" moods={['tired', 'focus', 'shock', 'joy']} shirt="#e3a24a" hair="messy" arms={[8, -72]} />
      </K>
      <K k="can" x={166} y={230}>
        <g>
          <path d="M-12 -10 L10 -10 L8 10 L-10 10 Z" fill="#5d9cec" stroke={INK} strokeWidth={1.4} />
          <path d="M8 -4 L24 -14 L26 -10 L10 2 Z" fill="#5d9cec" stroke={INK} strokeWidth={1.2} />
          <Ln d="M-10 -10 Q-1 -22 8 -10" w={2} />
        </g>
        <K k="water" x={26} y={-10} o={0}>
          <K k="water-drip">
          <g fill="#8cc4ee">
            <circle cx={4} cy={10} r={2} />
            <circle cx={9} cy={22} r={2.2} />
            <circle cx={6} cy={34} r={2} />
            <circle cx={12} cy={46} r={2.2} />
          </g>
          </K>
        </K>
      </K>
      <K k="apple" x={200} y={170}>
        <circle r={8.5} fill="#e2574c" stroke={INK} strokeWidth={1.3} />
        <Ln d="M0 -7 L1 -11" w={1.4} />
        <path d="M1 -9 Q6 -13 8 -9 Q4 -7 1 -9 Z" fill="#6cbf5a" />
      </K>
      <K k="sparkle" x={226} y={150} o={0}>
        <Burst r0={70} r1={86} n={14} color="#f2b84b" w={2.4} />
      </K>
    </g>
  ),
  tracks: [
    tw('trunk', [[0, { sy: 0.06, o: 0 }], [0.18, { sy: 0.06, o: 0 }], [0.3, { sy: 0.3, o: 1 }], [0.7, { sy: 1 }]]),
    tw('sprout', [[0, {}], [0.22, {}], [0.32, { o: 0, s: 1.4 }]]),
    tw('canopy', [[0, { s: 0, o: 0 }], [0.36, { s: 0, o: 0 }], [0.42, { s: 0.3, o: 1 }], [0.7, { s: 1 }], [0.74, { s: 1.08 }], [0.8, { s: 1 }]]),
    tw('fruits', [[0, { s: 0, o: 0 }], [0.71, { s: 0, o: 0 }], [0.76, { s: 1.3, o: 1 }, 'ease-out'], [0.8, { s: 1 }]]),
    tw('apple', [[0, { o: 0, s: 0 }], [0.74, { o: 0, s: 0 }], [0.78, { o: 1, s: 1 }], [0.8, { o: 1 }], [0.84, { x: -20, y: -14 }, 'ease-out'], [0.88, { x: -40, y: 22 }, 'ease-in'], [0.92, { x: -40, y: 17 }], [0.95, { x: -40, y: 22 }]]),
    tw('sparkle', [[0, { o: 0, s: 0.6 }], [0.74, { o: 0, s: 0.6 }], [0.79, { o: 1, s: 1 }], [0.9, { o: 0, s: 1.25 }]]),
    tw('can', [[0, { r: 0 }], [0.14, { r: 0 }], [0.22, { r: 26 }], [0.7, { r: 30 }], [0.78, { r: 0, x: -4, y: 14, o: 0 }]]),
    flip('water', [[0, 0], [0.2, 1], [0.7, 0]]),
    tw('water-drip', [[0, {}], [0.2, { y: -6 }, 'linear'], [0.3, { y: 0 }, 'linear'], [0.4, { y: -6 }, 'linear'], [0.5, { y: 0 }, 'linear'], [0.6, { y: -6 }, 'linear'], [0.7, { y: 0 }]]),
    tw('stu-armR', [[0, {}], [0.76, {}], [0.86, { r: -58 }]]),
    tw('stu-armL', [[0, {}], [0.76, {}], [0.86, { r: 120 }]]),
    tw('stu-body', [[0, { r: 0 }], [0.3, { r: 6 }], [0.7, { r: 6 }], [0.78, { r: -4 }], [0.88, { r: 0 }]]),
    tw('stu-pos', [[0, {}], [0.84, {}], [0.88, { y: -10 }, 'ease-out'], [0.94, { y: 0 }]]),
    ...mood('stu', [[0, 'tired'], [0.26, 'focus'], [0.74, 'shock'], [0.84, 'joy']]),
  ],
}

const BLOCKS = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const BLOCK_FALL: Record<number, [number, number, number][]> = {
  4: [[16, 22, 20], [34, 40, 0]],
  5: [[-12, 26, -30], [-36, 50, -8]],
  6: [[26, 40, 60], [70, 116, 90]],
  7: [[34, 30, 40], [64, 72, 14]],
  8: [[-22, 40, -50], [-62, 130, -90]],
}

/* collapse — one block too many: the tower comes down and the whole room freezes. */
export const collapse: Scene = {
  id: 'collapse',
  label: '屏住呼吸抽出最后一块积木，高塔摇晃后轰然倒塌，抽积木的人和朋友都僵住了',
  sfx: 'crash',
  hit: 0.75,
  render: () => (
    <g>
      <Backdrop sky="#f1e6d6" ground="#c7b296" groundY={332} />
      <rect x={236} y={56} width={60} height={70} fill="#e7d9c4" stroke={INK} strokeWidth={1.3} />
      <path d="M242 118 L256 92 L268 108 L278 96 L290 118 Z" fill="#9fbf8f" />
      <Desk x={124} y={270} w={156} color="#b98a58" legs={50} />
      <K k="tower" x={208} y={270}>
        {BLOCKS.map((i) => (
          <K key={i} k={i === 3 ? 'pull' : `blk${i}`} x={0} y={-10 * i - 10}>
            <rect x={-18} y={0} width={36} height={10} rx={1.5} fill={i % 2 ? '#e6c48f' : '#d9b277'} stroke={INK} strokeWidth={1.1} />
            <Ln d={i % 2 ? 'M-6 0 L-6 10 M6 0 L6 10' : 'M-18 5 L18 5'} w={0.6} c="#9c7a4c" />
          </K>
        ))}
      </K>
      <K k="dust" x={208} y={262} o={0}>
        <Burst r0={26} r1={46} n={12} color="#8f8676" w={2.2} />
      </K>
      <K k="stu-pos" x={130} y={334} s={1.25}>
        <Person id="stu" moods={['focus', 'nervous', 'shock']} shirt="#7a9e7e" hair="messy" arms={[10, -84]} />
      </K>
      <K k="fri-pos" x={290} y={336} s={1.1}>
        <Person id="fri" moods={['calm', 'fear', 'shock']} shirt="#c46b8a" hair="long" hairColor="#6b3f2a" skin={SKIN[1]} arms={[150, -150]} look={-1} />
      </K>
    </g>
  ),
  tracks: [
    tw('tower', [
      [0, {}],
      [0.3, {}],
      [0.4, { r: 1.2 }],
      [0.5, { r: -1.8 }],
      [0.6, { r: 2.6 }],
      [0.7, { r: -3.4 }],
      [0.73, { r: 6 }],
      [0.8, { r: 0 }],
    ]),
    tw('pull', [[0, {}], [0.2, {}], [0.7, { x: -30 }], [0.73, { x: -44, y: 4, r: -10 }, 'ease-out']]),
    ...Object.entries(BLOCK_FALL).map(([i, [[x1, y1, r1], [x2, y2, r2]]]) =>
      tw(`blk${i}`, [[0, {}], [0.71, {}], [0.76, { x: x1, y: y1, r: r1 }, 'ease-in'], [0.84, { x: x2, y: y2, r: r2 }, 'ease-out']]),
    ),
    tw('dust', [[0, { o: 0, s: 0.6 }], [0.74, { o: 0, s: 0.6 }], [0.78, { o: 1, s: 1 }], [0.9, { o: 0, s: 1.3 }]]),
    tw('stu-armR', [[0, {}], [0.2, {}], [0.7, { r: 6 }], [0.73, { r: 16 }]]),
    tw('stu-armL', [[0, {}], [0.74, {}], [0.8, { r: 150 }]]),
    tw('stu-body', [[0, {}], [0.74, {}], [0.8, { r: -8 }]]),
    ...mood('stu', [[0, 'focus'], [0.4, 'nervous'], [0.74, 'shock']]),
    ...mood('fri', [[0, 'calm'], [0.45, 'fear'], [0.74, 'shock']]),
    tw('fri-pos', [[0, {}], [0.74, {}], [0.78, { y: -10 }, 'ease-out'], [0.84, { y: 0 }]]),
  ],
}

const CHART_FLAT = 'M46 148 L70 146 L92 150 L114 144 L136 147 L158 143 L180 145 L204 141'
const CHART_SPIKE = 'M204 141 L222 128 L240 96 L262 52'

/* significant — the flat line rockets up; the whole meeting room jumps to its feet. */
export const significant: Scene = {
  id: 'significant',
  label: '会议上平淡的折线突然暴涨，全会议室的人惊得站起，咖啡都被打翻了',
  sfx: 'whoosh',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#edf0f3" ground="#c4cad3" groundY={344} />
      <rect x={28} y={30} width={264} height={140} rx={4} fill="#fff" stroke={INK} strokeWidth={1.6} />
      <Ln d="M46 44 L46 156 L278 156" w={1.4} c="#8b8f96" />
      <Ln d="M46 128 L278 128 M46 100 L278 100 M46 72 L278 72" w={0.6} c="#d8dbe0" />
      <path d={CHART_FLAT} pathLength={1} data-k="flat" fill="none" stroke="#5b6b82" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" />
      <path d={CHART_SPIKE} pathLength={1} data-k="spike" fill="none" stroke="#1f9d62" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" />
      <K k="arrow" x={262} y={52}>
        <path d="M0 0 L-12 2 L-3 10 Z" fill="#1f9d62" />
        <text x={-46} y={-4} fontSize={14} fontWeight={700} fill="#1f9d62" fontFamily="Georgia, serif">
          +312%
        </text>
      </K>
      {[
        { id: 'pa', x: 66, shirt: '#c97b63', hair: 'long' as const, hc: '#5a3a28', skin: SKIN[1] },
        { id: 'pb', x: 160, shirt: '#2f3e55', hair: 'side' as const, hc: '#3a3a3a', skin: SKIN[0] },
        { id: 'pc', x: 254, shirt: '#7c8a5a', hair: 'bald' as const, hc: '#5a4a3a', skin: SKIN[2] },
      ].map((p) => (
        <K key={p.id} k={`${p.id}-pos`} x={p.x} y={344} s={1.12}>
          <Person
            id={p.id}
            moods={['tired', 'focus', 'shock', 'joy']}
            shirt={p.shirt}
            hair={p.hair}
            hairColor={p.hc}
            skin={p.skin}
            glasses={p.id === 'pb'}
            tie={p.id === 'pb' ? '#b33a3a' : undefined}
            legs="none"
          />
        </K>
      ))}
      <Desk x={14} y={276} w={292} color="#8d6e52" legs={60} />
      <K k="spill" x={226} y={276} o={0}>
        <ellipse cx={14} cy={0} rx={22} ry={3.2} fill="#6b4226" />
        <path d="M30 0 Q33 10 31 16 Q29 10 28 2 Z" fill="#6b4226" />
      </K>
      <K k="cup" x={222} y={276}>
        <path d="M-12 -16 L0 -16 L-1 0 L-11 0 Z" fill="#fff" stroke={INK} strokeWidth={1.3} />
        <Ln d="M0 -12 Q5 -10 0 -5" w={1.3} />
      </K>
    </g>
  ),
  tracks: [
    css('flat', [[0, { strokeDashoffset: 1 }], [0.12, { strokeDashoffset: 1 }], [0.7, { strokeDashoffset: 0 }]], 'linear'),
    css('spike', [[0, { strokeDashoffset: 1 }], [0.7, { strokeDashoffset: 1 }], [0.77, { strokeDashoffset: 0 }]], 'ease-in'),
    tw('arrow', [[0, { o: 0, s: 0.3 }], [0.76, { o: 0, s: 0.3 }], [0.8, { o: 1, s: 1.2 }, 'ease-out'], [0.84, { s: 1 }]]),
    ...['pa', 'pb', 'pc'].flatMap((id, i) => [
      ...mood(id, [[0, 'tired'], [0.36 + i * 0.06, 'focus'], [0.75, 'shock'], [0.86, id === 'pb' ? 'shock' : 'joy']]),
      tw(`${id}-pos`, [[0, {}], [0.75 + i * 0.01, {}], [0.8 + i * 0.01, { y: -30 }, 'ease-out'], [0.86, { y: -26 }]]),
      tw(`${id}-head`, [[0, {}], [0.36, { r: (i - 1) * -6 }], [0.7, { r: (i - 1) * -8 }], [0.8, { r: 0 }]]),
      tw(`${id}-armL`, [[0, {}], [0.76, {}], [0.84, { r: id === 'pb' ? 30 : 150 }]]),
      tw(`${id}-armR`, [[0, {}], [0.76, {}], [0.84, { r: id === 'pb' ? -30 : -150 }]]),
    ]),
    tw('cup', [[0, {}], [0.77, {}], [0.82, { r: 90, y: -2 }, 'ease-out']]),
    tw('spill', [[0, { o: 0, sx: 0.1 }], [0.8, { o: 0, sx: 0.1 }], [0.88, { o: 1, sx: 1 }]]),
  ],
}

/* adequate — the plank clears the gap by a hair on each side; one careful crossing, one huge exhale. */
export const adequate: Scene = {
  id: 'adequate',
  label: '悬崖裂缝上的木板两头各只搭住一点点，小心翼翼走过去，长舒一口气',
  sfx: 'breath',
  hit: 0.82,
  render: () => (
    <g>
      <rect x={-400} y={-400} width={1120} height={1200} fill="#e6edf1" />
      <path d="M-400 380 L-60 200 L20 250 L80 210 L140 260 L210 220 L300 260 L720 180 L720 800 L-400 800 Z" fill="#cfd8de" />
      <rect x={110} y={300} width={100} height={500} fill="#4a4038" />
      <path d="M118 300 L124 330 L114 360 L122 400 L118 800 L-400 800 L-400 300 Z" fill="#9b8a72" stroke={INK} strokeWidth={1.6} />
      <path d="M202 300 L196 334 L206 364 L198 400 L202 800 L720 800 L720 300 Z" fill="#9b8a72" stroke={INK} strokeWidth={1.6} />
      <rect x={-400} y={296} width={518} height={6} fill="#7d9b5a" />
      <rect x={202} y={296} width={518} height={6} fill="#7d9b5a" />
      <K k="pebble" x={158} y={300}>
        <circle r={3} fill="#6b5e4e" />
      </K>
      <K k="plank-dip">
        <K k="plank" x={117} y={298}>
          <rect x={0} y={-7} width={86} height={7} rx={1} fill="#c99a5b" stroke={INK} strokeWidth={1.3} />
          <Ln d="M10 -4 L30 -4 M48 -3 L70 -3" w={0.7} c="#8a6440" />
        </K>
      </K>
      <K k="marks" o={0}>
        <g stroke="#d64541" strokeWidth={1.6} fill="none" strokeLinecap="round">
          <path d="M117 284 L117 278 M123 284 L123 278 M117 281 L123 281" />
          <path d="M197 284 L197 278 M203 284 L203 278 M197 281 L203 281" />
        </g>
        <g fill="#d64541" fontSize={9} fontWeight={700} fontFamily="Menlo, monospace" textAnchor="middle">
          <text x={120} y={274}>1cm</text>
          <text x={200} y={274}>1cm</text>
        </g>
      </K>
      <K k="stu-pos" x={76} y={296} s={1.22}>
        <Person id="stu" moods={['fear', 'nervous', 'focus', 'relief']} shirt="#6c8fb3" hair="messy" arms={[10, -10]} />
      </K>
    </g>
  ),
  tracks: [
    tw('plank', [[0, { r: -84 }], [0.12, { r: -84 }], [0.3, { r: 0 }, 'ease-in'], [0.33, { r: -3 }], [0.36, { r: 0 }]]),
    tw('marks', [[0, { o: 0 }], [0.36, { o: 0 }], [0.42, { o: 1 }], [0.88, { o: 1 }], [0.96, { o: 0.75 }]]),
    tw('stu-pos', [
      [0, {}],
      [0.4, {}],
      [0.46, { x: 22, y: -3 }],
      [0.52, { x: 40, y: 2 }],
      [0.58, { x: 56, y: -1 }],
      [0.64, { x: 72, y: 3 }],
      [0.7, { x: 84, y: 3 }],
      [0.75, { x: 128, y: -6 }, 'ease-out'],
      [0.8, { x: 158, y: 0 }],
    ]),
    tw('plank-dip', [[0, {}], [0.5, {}], [0.6, { y: 3 }], [0.7, { y: 4 }], [0.76, { y: 0 }]]),
    tw('pebble', [[0, { o: 0 }], [0.5, { o: 0 }], [0.52, { o: 1 }], [0.7, { y: 150, o: 0 }, 'ease-in']]),
    tw('stu-armL', [[0, {}], [0.4, {}], [0.46, { r: 70 }], [0.76, { r: 70 }], [0.84, { r: 6 }]]),
    tw('stu-armR', [[0, {}], [0.4, {}], [0.46, { r: -70 }], [0.76, { r: -70 }], [0.84, { r: 40 }]]),
    tw('stu-body', [[0, {}], [0.82, {}], [0.88, { r: 6, sy: 0.96 }], [0.94, { r: 4, sy: 0.97 }]]),
    tw('stu-head', [[0, { r: 14 }], [0.3, { r: 6 }], [0.82, { r: 0 }], [0.9, { r: -10 }]]),
    ...mood('stu', [[0, 'fear'], [0.36, 'nervous'], [0.68, 'focus'], [0.82, 'relief']]),
  ],
}

function FishFace({ m }: { m: 'sad' | 'happy' }) {
  return m === 'sad' ? (
    <g>
      <Ln d="M10 -7 L16 -5" w={1.2} />
      <circle cx={13} cy={-3} r={1.8} fill={INK} />
      <ellipse cx={22} cy={4} rx={1.8} ry={2.4} fill={INK} />
    </g>
  ) : (
    <g>
      <Ln d="M10 -3 Q13 -7 16 -3" w={1.6} />
      <Ln d="M18 4 Q21 7 23 3" w={1.4} />
    </g>
  )
}

/* environment — a gasping fish in a filthy bowl; fresh water changes its whole world. */
export const environment: Scene = {
  id: 'environment',
  label: '脏水缸里的金鱼浮到水面喘气，换上清水和水草后，它立刻欢快地游起来',
  sfx: 'splash',
  hit: 0.74,
  render: () => (
    <g>
      <Backdrop sky="#e7eee8" ground="#cbbfa8" groundY={396} />
      <rect x={24} y={70} width={86} height={110} fill="#f6f2ea" stroke={INK} strokeWidth={1.3} />
      <path d="M34 170 L56 126 L74 150 L86 134 L100 170 Z" fill="#a8c99c" />
      <defs>
        <clipPath id="cw-env-bowl">
          <circle cx={130} cy={280} r={44} />
        </clipPath>
      </defs>
      <circle cx={130} cy={280} r={46} fill="#f4f8fa" stroke={INK} strokeWidth={1.6} />
      <g clipPath="url(#cw-env-bowl)">
        <rect x={80} y={250} width={100} height={80} fill="#9fd3ec" />
        <K k="murky">
          <rect x={80} y={250} width={100} height={80} fill="#7b7442" opacity={0.85} />
          <g fill="#5b552f" opacity={0.6}>
            <circle cx={104} cy={300} r={3.4} />
            <circle cx={156} cy={276} r={2.6} />
            <circle cx={130} cy={314} r={4} />
          </g>
        </K>
        <K k="trash">
          <rect x={146} y={300} width={11} height={17} rx={2} fill="#c0392b" stroke={INK} strokeWidth={1} transform="rotate(24 151 308)" />
          <path d="M96 260 Q108 254 116 262 Q110 272 98 268 Z" fill="#e8e8e8" opacity={0.9} stroke={INK} strokeWidth={0.8} />
        </K>
        <K k="weed" x={106} y={326}>
          <path d="M0 0 Q-6 -14 2 -28 Q8 -40 0 -48 M7 0 Q13 -16 7 -30" fill="none" stroke="#3f9a54" strokeWidth={3.4} strokeLinecap="round" />
        </K>
        <K k="bubbles" x={154} y={316}>
          <g fill="none" stroke="#fff" strokeWidth={1.3}>
            <circle cx={0} cy={0} r={2.6} />
            <circle cx={-5} cy={-14} r={2} />
            <circle cx={2} cy={-27} r={3} />
          </g>
        </K>
        <K x={128} y={292} s={0.8}>
          <K k="fish">
            <path d="M-16 0 L-28 -10 L-26 0 L-28 10 Z" fill="#f08a24" stroke={INK} strokeWidth={1.2} />
            <ellipse cx={4} cy={0} rx={22} ry={13} fill="#f5a033" stroke={INK} strokeWidth={1.4} />
            <path d="M0 -12 Q6 -20 12 -12" fill="#f08a24" stroke={INK} strokeWidth={1} />
            <g data-k="fish-m-sad">
              <FishFace m="sad" />
            </g>
            <g data-k="fish-m-happy" opacity={0}>
              <FishFace m="happy" />
            </g>
          </K>
        </K>
      </g>
      <path d="M96 244 Q130 238 164 244" fill="none" stroke={INK} strokeWidth={1.6} />
      <Desk x={30} y={326} w={220} color="#b98a58" legs={70} />
      <K k="stream" o={0}>
        <path d="M190 226 Q170 230 162 264 L168 264 Q176 236 192 232 Z" fill="#8cc4ee" />
      </K>
      <K k="stu-pos" x={278} y={398} s={1.4}>
        <Person id="stu" moods={['sad', 'focus', 'happy']} shirt="#4f8f7f" hair="short" hairColor="#3a2a20" skin={SKIN[2]} arms={[150, -10]} look={-1} />
      </K>
      <K k="jug" x={230} y={256}>
        <path d="M-10 -24 L18 -24 L20 12 L-12 12 Z" fill="#cfe7f6" stroke={INK} strokeWidth={1.4} />
        <path d="M-10 -24 L-22 -28 L-12 -16 Z" fill="#cfe7f6" stroke={INK} strokeWidth={1.2} />
        <rect x={-10} y={-12} width={30} height={24} fill="#8cc4ee" opacity={0.7} />
        <Ln d="M18 -16 Q30 -10 18 4" w={2.2} />
      </K>
    </g>
  ),
  tracks: [
    tw('fish', [
      [0, {}],
      [0.12, {}],
      [0.4, { y: -24, x: 4, r: -24 }],
      [0.5, { y: -28, r: -30 }],
      [0.6, { y: -24, r: -22 }],
      [0.7, { y: -28, r: -30 }],
      [0.8, { y: -4, x: -14, r: 0 }],
      [0.88, { y: 4, x: 16, r: 6 }],
      [0.96, { y: -2, x: 6, r: -4 }],
    ]),
    ...mood('fish', [[0, 'sad'], [0.78, 'happy']]),
    fade('murky', [[0, 1], [0.72, 1], [0.82, 0]]),
    tw('trash', [[0, {}], [0.72, {}], [0.8, { o: 0, y: -24 }]]),
    tw('weed', [[0, { s: 0, o: 0 }], [0.76, { s: 0, o: 0 }], [0.86, { s: 1, o: 1 }]]),
    tw('bubbles', [[0, { o: 0 }], [0.8, { o: 0, y: 10 }], [0.86, { o: 1, y: 0 }], [1, { o: 0.6, y: -14 }]]),
    tw('jug', [[0, {}], [0.12, {}], [0.62, { x: -18, y: -10 }], [0.7, { x: -22, y: -12, r: -40 }], [0.82, { r: -50 }], [0.92, { x: 0, y: 0, r: 0 }]]),
    flip('stream', [[0, 0], [0.71, 1], [0.84, 0]]),
    tw('stu-armL', [[0, {}], [0.12, {}], [0.62, { r: 8 }], [0.7, { r: 12 }], [0.92, { r: 0 }]]),
    tw('stu-body', [[0, {}], [0.6, { r: -6 }], [0.84, { r: -6 }], [0.92, { r: 0 }]]),
    ...mood('stu', [[0, 'sad'], [0.4, 'focus'], [0.82, 'happy']]),
  ],
}

/* factor — a deadlocked tug of war; one small dog joins and decides it. */
export const factor: Scene = {
  id: 'factor',
  label: '拔河僵持不下快要输了，一只小狗咬住绳尾往后一拽，局面瞬间逆转',
  sfx: 'pop',
  hit: 0.74,
  render: () => (
    <g>
      <Backdrop sky="#e3eef8" ground="#b5d39a" groundY={318} />
      <path d="M160 318 L160 400" stroke="#fff" strokeWidth={4} strokeDasharray="8 6" />
      <K k="rope" x={0} y={236}>
        <Ln d="M-30 0 L350 0" w={4} c="#c9a86a" />
        <path d="M156 -2 L164 -2 L162 16 L158 16 Z" fill="#d64541" stroke={INK} strokeWidth={1} />
      </K>
      <K k="lt">
        <K k="a-pos" x={58} y={318} s={1.18}>
          <Person id="a" moods={['focus', 'nervous', 'joy']} shirt="#5d86b8" hair="messy" arms={[-80, -84]} />
        </K>
        <K k="b-pos" x={108} y={318} s={1.12}>
          <Person id="b" moods={['focus', 'fear', 'joy']} shirt="#e3a24a" hair="long" hairColor="#5a3a28" skin={SKIN[1]} arms={[-80, -84]} />
        </K>
      </K>
      <K k="rt">
        <K k="c-pos" x={214} y={318} s={1.3}>
          <Person id="c" moods={['smug', 'shock']} shirt="#7a4f6d" hair="bald" hairColor="#3a3a3a" skin={SKIN[2]} arms={[84, 80]} />
        </K>
        <K k="d-pos" x={266} y={318} s={1.34}>
          <Person id="d" moods={['smug', 'shock']} shirt="#5a6b4a" hair="short" skin={SKIN[3]} arms={[84, 80]} />
        </K>
      </K>
      <K k="dog-pos" x={26} y={318} s={1.1}>
        <Dog id="dog" moods={['alert', 'happy']} coat="#e6c08a" />
      </K>
    </g>
  ),
  tracks: [
    ...['rope', 'lt', 'rt'].map((k) =>
      tw(k, [
        [0, {}],
        [0.12, { x: 2 }],
        [0.3, { x: 6 }],
        [0.5, { x: 12 }],
        [0.66, { x: 18 }],
        [0.7, { x: 18 }],
        [0.78, { x: -26 }, 'ease-out'],
        [0.84, { x: -22 }],
      ]),
    ),
    ...['a', 'b'].flatMap((id) => [
      tw(`${id}-body`, [[0, { r: -14 }], [0.66, { r: -6 }], [0.72, { r: -6 }], [0.8, { r: -24 }], [0.86, { r: -16 }]]),
      tw(`${id}-pos`, [[0, {}], [0.74, {}], [0.82, { y: 10 }]]),
    ]),
    ...['c', 'd'].flatMap((id) => [
      tw(`${id}-body`, [[0, { r: 14 }], [0.66, { r: 18 }], [0.72, { r: 18 }], [0.8, { r: -16 }], [0.88, { r: -24 }]]),
      tw(`${id}-pos`, [[0, {}], [0.74, {}], [0.86, { y: 10 }]]),
    ]),
    ...mood('a', [[0, 'focus'], [0.42, 'nervous'], [0.8, 'joy']]),
    ...mood('b', [[0, 'focus'], [0.46, 'fear'], [0.8, 'joy']]),
    ...mood('c', [[0, 'smug'], [0.78, 'shock']]),
    ...mood('d', [[0, 'smug'], [0.78, 'shock']]),
    tw('dog-pos', [
      [0, { x: -90 }],
      [0.36, { x: -90 }],
      [0.66, { x: 0 }],
      [0.7, { x: 4, y: -46, r: -26 }, 'ease-out'],
      [0.78, { x: -18, y: -40, r: -34 }],
      [0.86, { x: -12, y: 0, r: 0 }, 'ease-in'],
    ]),
    ...mood('dog', [[0, 'alert'], [0.84, 'happy']]),
    wiggle('dog-tail', 0.86, 1, 3, { r: 30 }, { r: -10 }),
  ],
}

/* approach — rushing in scares the cat away; crouching slowly with an open palm wins it over. */
export const approach: Scene = {
  id: 'approach',
  label: '莽撞冲过去，受惊的野猫立刻逃走；蹲下摊开手慢慢靠近，它反而主动蹭过来',
  sfx: 'pop',
  hit: 0.8,
  render: () => (
    <g>
      <Backdrop sky="#f0dcc6" ground="#b6a28a" groundY={330} />
      <g stroke="#d7c0a6" strokeWidth={1.2}>
        <path d="M-40 160 L360 160 M-40 190 L360 190 M-40 220 L360 220 M-40 250 L360 250 M-40 280 L360 280 M-40 310 L360 310" />
      </g>
      <K k="inset">
        <rect x={18} y={20} width={284} height={104} rx={8} fill="#fffdf8" stroke="#d64541" strokeWidth={1.6} />
        <Ln d="M28 112 L292 112" w={1} c="#c9bfae" />
        <K k="rusher" x={54} y={112} s={0.5}>
          <Person id="rush" moods={['angry']} shirt="#8a8f98" hair="short" arms={[-60, -100]} />
        </K>
        <K k="minicat" x={230} y={112} s={0.6}>
          <path d="M-18 -10 Q-12 -30 2 -30 Q16 -28 18 -10 Z" fill="#5b5753" />
          <circle cx={-18} cy={-22} r={8} fill="#5b5753" />
          <path d="M18 -14 Q28 -24 24 -40" stroke="#5b5753" strokeWidth={4} fill="none" />
          <Ln d="M-16 -10 L-18 0 M-6 -10 L-6 0 M8 -10 L8 0 M16 -10 L18 0" w={3} c="#5b5753" />
        </K>
        <K k="xmark" x={268} y={52} o={0}>
          <Ln d="M-12 -12 L12 12 M12 -12 L-12 12" w={4} c="#d64541" />
        </K>
      </K>
      <K k="cat-pos" x={250} y={330} s={1.3}>
        <K k="cat-scared">
          <Ln d="M-16 -14 L-18 0 M-8 -14 L-8 0 M10 -14 L10 0 M18 -14 L20 0" w={4} c="#5b5753" />
          <path d="M22 -16 Q36 -30 28 -52" fill="none" stroke="#5b5753" strokeWidth={6} strokeLinecap="round" />
          <path d="M22 -40 l6 -4 M24 -48 l6 2 M30 -30 l6 0" stroke="#5b5753" strokeWidth={2} />
          <path d="M-22 -12 Q-16 -42 2 -40 Q20 -38 24 -12 Z" fill="#5b5753" stroke={INK} strokeWidth={1.4} />
          <path d="M-12 -36 l2 -7 l3 5 l3 -8 l3 7 l3 -8 l3 7 l3 -6" fill="none" stroke="#5b5753" strokeWidth={2} />
          <K x={-24} y={-26}>
            <path d="M-8 -6 L-9 -18 L-1 -9 Z M4 -9 L10 -18 L9 -5 Z" fill="#5b5753" stroke={INK} strokeWidth={1} />
            <circle r={10} fill="#5b5753" stroke={INK} strokeWidth={1.4} />
            <circle cx={-4} cy={-2} r={3.2} fill="#f3e27a" />
            <circle cx={4} cy={-2} r={3.2} fill="#f3e27a" />
            <Ln d="M-4 -4.6 L-4 0.6 M4 -4.6 L4 0.6" w={1.2} />
            <path d="M-4 4 Q0 9 4 4 Z" fill="#c0392b" stroke={INK} strokeWidth={0.8} />
            <Ln d="M-2.6 4.6 L-2.2 6.6 M2.6 4.6 L2.2 6.6" w={0.9} c="#fff" />
          </K>
        </K>
        <K k="cat-calm" o={0}>
          <path d="M14 -4 Q34 -2 30 -20" fill="none" stroke="#5b5753" strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={4} cy={-14} rx={16} ry={14} fill="#5b5753" stroke={INK} strokeWidth={1.4} />
          <Ln d="M-6 -4 L-7 0 M2 -4 L2 0" w={4} c="#5b5753" />
          <K x={-10} y={-34}>
            <path d="M-8 -6 L-8 -17 L-1 -9 Z M4 -9 L10 -17 L9 -5 Z" fill="#5b5753" stroke={INK} strokeWidth={1} />
            <circle r={10} fill="#5b5753" stroke={INK} strokeWidth={1.4} />
            <Ln d="M-6 -1 Q-4 -3.5 -2 -1 M2 -1 Q4 -3.5 6 -1" w={1.4} c="#f3e27a" />
            <Ln d="M-3 4 Q-1.5 6 0 4 Q1.5 6 3 4" w={1} c="#f3e27a" />
          </K>
        </K>
      </K>
      <K k="heart" x={214} y={262} o={0}>
        <path d="M0 6 C-10 -2 -8 -12 0 -7 C8 -12 10 -2 0 6 Z" fill="#e2574c" stroke={INK} strokeWidth={1.2} />
      </K>
      <K k="stu-pos" x={66} y={332} s={1.3}>
        <Person id="stu" moods={['calm', 'focus', 'happy']} shirt="#7a9e7e" hair="messy" legs="crouch" arms={[14, -76]} look={1} />
      </K>
    </g>
  ),
  tracks: [
    tw('rusher', [[0, {}], [0.12, {}], [0.3, { x: 110 }, 'ease-in']]),
    tw('minicat', [[0, {}], [0.26, {}], [0.36, { x: 120, o: 0 }, 'ease-in']]),
    tw('xmark', [[0, { o: 0, s: 0.4 }], [0.32, { o: 0, s: 0.4 }], [0.36, { o: 1, s: 1.2 }], [0.4, { s: 1 }]]),
    fade('inset', [[0, 1], [0.42, 1], [0.5, 0.45]]),
    tw('stu-pos', [
      [0, {}],
      [0.44, {}],
      [0.5, { x: 16 }],
      [0.56, { x: 30 }],
      [0.62, { x: 46 }],
      [0.7, { x: 64 }],
      [0.84, { x: 68 }],
    ]),
    tw('stu-body', [[0, {}], [0.44, { r: 8 }], [0.7, { r: 10 }], [0.86, { r: 4 }]]),
    tw('cat-pos', [[0, {}], [0.5, {}], [0.6, { x: 4 }], [0.72, {}], [0.82, { x: -22 }], [0.9, { x: -26, r: -4 }], [0.96, { x: -24, r: 2 }]]),
    flip('cat-scared', [[0, 1], [0.74, 0]]),
    flip('cat-calm', [[0, 0], [0.74, 1]]),
    tw('heart', [[0, { o: 0, s: 0.2 }], [0.8, { o: 0, s: 0.2 }], [0.85, { o: 1, s: 1.3, y: -8 }, 'ease-out'], [0.92, { s: 1, y: -14 }]]),
    ...mood('stu', [[0, 'calm'], [0.44, 'focus'], [0.84, 'happy']]),
  ],
}

/* evidence — the detective slams down a photo of a muddy footprint; the suspect looks at their own shoe. */
export const evidence: Scene = {
  id: 'evidence',
  label: '审讯桌上拍下一张带泥脚印的照片，嫌疑人冒汗，低头看向自己沾泥的鞋',
  sfx: 'slam',
  hit: 0.75,
  render: () => (
    <g>
      <Backdrop sky="#4a4e57" ground="#363840" groundY={334} />
      <K k="lamp" x={160} y={-30}>
        <Ln d="M0 0 L0 74" w={1.6} c="#1e1f22" />
        <path d="M0 74 L-90 330 L90 330 Z" fill="#ffe9a8" opacity={0.14} />
        <path d="M-16 88 L16 88 L8 74 L-8 74 Z" fill="#2e3036" stroke={INK} strokeWidth={1.2} />
        <ellipse cx={0} cy={89} rx={8} ry={3} fill="#ffe08a" />
      </K>
      <K k="sus-pos" x={234} y={300} s={1.2}>
        <g>
          <Limb d="M-6 -36 L-8 25 M8 -36 L10 25" color="#55606f" w={8} />
          <ellipse cx={-10} cy={27} rx={7} ry={3.4} fill={INK} />
          <ellipse cx={12} cy={27} rx={7} ry={3.4} fill={INK} />
          <path d="M3 25 Q8 19 14 23 Q20 25 19 30 L5 30 Z" fill="#7a5530" />
        </g>
        <Person id="sus" moods={['smug', 'nervous', 'shock', 'guilty']} shirt="#8f9196" hair="short" hairColor="#2a2a2a" legs="none" arms={[-36, 36]} />
        <K k="ring" x={12} y={25} o={0}>
          <circle r={13} fill="none" stroke="#e2574c" strokeWidth={2} strokeDasharray="4 3" />
        </K>
      </K>
      <K k="table">
        <rect x={34} y={252} width={252} height={12} rx={2} fill="#6c625a" stroke={INK} strokeWidth={1.5} />
        <rect x={46} y={264} width={6} height={70} fill="#4c443d" />
        <rect x={268} y={264} width={6} height={70} fill="#4c443d" />
      </K>
      <K k="det-pos" x={82} y={336} s={1.3}>
        <Person id="det" moods={['stern', 'angry', 'smug']} shirt="#8a7356" hair="side" hairColor="#2f2a26" skin={SKIN[1]} tie="#3b3b3b" arms={[8, -96]} />
      </K>
      <K k="photo" x={138} y={232}>
        <rect x={-26} y={-20} width={52} height={40} fill="#fff" stroke={INK} strokeWidth={1.3} />
        <rect x={-22} y={-16} width={44} height={30} fill="#d9cfc0" />
        <path d="M-10 -12 Q-2 -14 0 -6 Q2 4 -2 10 Q-8 12 -10 4 Q-12 -4 -10 -12 Z" fill="#7a5530" />
        <g fill="#d9cfc0">
          <rect x={-8} y={-8} width={6} height={2} />
          <rect x={-8} y={-2} width={6} height={2} />
          <rect x={-7} y={4} width={5} height={2} />
        </g>
      </K>
      <K k="bang" x={150} y={250} o={0}>
        <Burst r0={30} r1={46} n={10} color="#ffe08a" w={2.4} />
      </K>
    </g>
  ),
  tracks: [
    tw('det-body', [[0, {}], [0.12, {}], [0.66, { r: 12 }], [0.74, { r: 22 }, 'ease-in'], [0.86, { r: 14 }]]),
    tw('det-armR', [[0, {}], [0.12, {}], [0.66, { r: -40 }], [0.74, { r: 30 }, 'ease-in'], [0.86, { r: 20 }]]),
    tw('photo', [
      [0, { r: -12 }],
      [0.12, { r: -12 }],
      [0.66, { x: -8, y: -28, r: -20 }],
      [0.745, { x: 12, y: 20, r: 4, sy: 0.7 }, 'ease-in'],
      [0.78, { x: 12, y: 18, r: 4, sy: 0.72, s: 1.08 }],
      [0.86, { s: 1.15 }],
    ]),
    tw('bang', [[0, { o: 0, s: 0.6 }], [0.74, { o: 0, s: 0.6 }], [0.77, { o: 1, s: 1 }], [0.86, { o: 0, s: 1.3 }]]),
    tw('table', [[0, {}], [0.745, {}], [0.76, { y: 4 }], [0.8, { y: -1 }], [0.84, { y: 0 }]]),
    tw('lamp', [[0, {}], [0.745, {}], [0.8, { r: 6 }], [0.86, { r: -4 }], [0.92, { r: 2 }], [1, { r: 0 }]]),
    ...mood('det', [[0, 'stern'], [0.7, 'angry'], [0.9, 'smug']]),
    ...mood('sus', [[0, 'smug'], [0.42, 'nervous'], [0.75, 'shock'], [0.85, 'guilty']]),
    tw('sus-head', [[0, {}], [0.75, { y: -4 }], [0.85, { y: 0 }], [0.92, { y: 4, r: 10 }]]),
    tw('sus-body', [[0, {}], [0.75, { r: 4 }], [0.92, { r: 8 }]]),
    tw('ring', [[0, { o: 0, s: 1.6 }], [0.86, { o: 0, s: 1.6 }], [0.94, { o: 1, s: 1 }]]),
  ],
}

