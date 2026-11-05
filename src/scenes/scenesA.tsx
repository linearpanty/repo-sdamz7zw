import { Backdrop, Burst, Desk, Dog, INK, K, Limb, Ln, PAPER, Person, Rain, SKIN } from './cast'
import { css, fade, flip, mood, tw, wiggle, wiggleStops, type Scene } from './timeline'

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

/** Full-height paper column for `challenge`, drawn upward from its base at (0,0). */
function PaperColumn({ h, w = 76 }: { h: number; w?: number }) {
  const rows = []
  for (let y = -8; y > -h; y -= 8) rows.push(`M${-w / 2} ${y} L${w / 2} ${y}`)
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={PAPER} stroke={INK} strokeWidth={1.8} />
      <Ln d={rows.join(' ')} w={0.9} c="#b9b2a2" />
      <rect x={w / 2 - 6} y={-h * 0.3} width={12} height={6} fill="#d64541" stroke={INK} strokeWidth={0.8} />
      <rect x={-w / 2 - 6} y={-h * 0.62} width={12} height={6} fill="#3e8ed0" stroke={INK} strokeWidth={0.8} />
      <rect x={w / 2 - 6} y={-h * 0.85} width={12} height={6} fill="#f2c94c" stroke={INK} strokeWidth={0.8} />
    </g>
  )
}

/* challenge — pile after pile lands on the desk; the last one makes a paper mountain. The student ties a headband anyway. */
export const challenge: Scene = {
  id: 'challenge',
  label: '考官一摞接一摞往考生桌上堆试卷，最后一大摞砸下去堆成比人还高的纸山，考生先傻眼，随后绑上头带举笔迎战',
  sfx: 'slam',
  hit: 0.75,
  render: () => (
    <g>
      <Backdrop sky="#ece6d8" ground="#cbbb9f" groundY={330} />
      <rect x={10} y={34} width={96} height={62} rx={3} fill="#2f4a3e" stroke={INK} strokeWidth={1.6} />
      <Ln d="M22 52 L70 52 M22 66 L92 66 M22 80 L58 80" w={2} c="#d9e4dc" />

      <K k="fire" x={64} y={196} o={0}>
        <path d="M0 -70 Q22 -40 38 -52 Q40 -18 56 -22 Q50 20 0 30 Q-50 20 -56 -22 Q-40 -18 -38 -52 Q-22 -40 0 -70 Z" fill="#f6a23c" opacity={0.85} />
        <path d="M0 -40 Q12 -22 22 -30 Q24 -6 30 -8 Q26 18 0 22 Q-26 18 -30 -8 Q-24 -6 -22 -30 Q-12 -22 0 -40 Z" fill="#f9d65c" />
      </K>
      <K k="stu-pos" x={64} y={318} s={1.3}>
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
              <path d="M-16 -6 L-26 -13 M-16 -5 L-27 -2" stroke="#d64541" strokeWidth={3.4} strokeLinecap="round" />
            </K>
          }
          handR={
            <g transform="rotate(180)">
              <rect x={-3} y={-30} width={6} height={30} fill="#f2c94c" stroke={INK} strokeWidth={1} />
              <path d="M-3 -30 L0 -38 L3 -30 Z" fill="#f4d6bb" stroke={INK} strokeWidth={0.9} />
            </g>
          }
        />
      </K>

      <K k="desk">
        <Desk x={6} y={262} w={210} color="#c79a62" legs={56} />
        <K k="tower" x={150} y={262}>
          <K k="stack">
            <PaperColumn h={150} />
          </K>
          <K k="top" y={-105}>
            <PaperColumn h={92} w={84} />
            <K y={-92}>
              <Ln d="M0 0 L0 -26" w={2} />
              <path d="M0 -26 L20 -20 L0 -14 Z" fill="#d64541" stroke={INK} strokeWidth={1} />
            </K>
          </K>
        </K>
      </K>
      <K k="dust" x={150} y={262} o={0}>
        <Burst r0={48} r1={70} n={14} color="#8f8676" w={2.6} />
      </K>

      <K k="exa-pos" x={262} y={340} s={1.3}>
        <Person id="exa" moods={['smug', 'stern']} shirt="#3f3b4f" hair="bun" hairColor="#4a3226" glasses tie="#a33d3d" arms={[0, 0]} look={-1} />
      </K>
    </g>
  ),
  tracks: [
    // Build-up: every couple of letters another pile lands and the column grows.
    tw('stack', [
      [0, { sy: 0.16 }],
      [0.12, { sy: 0.16 }],
      [0.22, { sy: 0.34 }, 'ease-out'],
      [0.36, { sy: 0.34 }],
      [0.44, { sy: 0.52 }, 'ease-out'],
      [0.54, { sy: 0.52 }],
      [0.62, { sy: 0.7 }, 'ease-out'],
    ]),
    tw('exa-armL', [[0, { r: 95 }], [0.12, { r: 95 }], ...wiggleStops(0.12, 0.6, 3, { r: 55 }, { r: 100 }), [0.66, { r: 160 }], [0.7, { r: 172 }], [0.75, { r: 70 }, 'ease-in'], [0.86, { r: 14 }]]),
    tw('exa-armR', [[0, { r: 95 }], [0.12, { r: 95 }], ...wiggleStops(0.12, 0.6, 3, { r: 55 }, { r: 100 }), [0.66, { r: 190 }], [0.7, { r: 180 }], [0.75, { r: 70 }, 'ease-in'], [0.86, { r: -14 }]]),
    // The final giant pile is hoisted overhead, then slammed on top of the column.
    tw('top', [
      [0, { x: 108, y: 70, o: 0 }],
      [0.6, { x: 108, y: 70, o: 0 }],
      [0.64, { x: 108, y: 58, o: 1 }],
      [0.7, { x: 104, y: 40 }],
      [0.75, { x: 0, y: 0 }, 'ease-in'],
    ]),
    tw('tower', [[0, {}], [0.75, {}], [0.78, { r: 4 }], [0.83, { r: -3 }], [0.88, { r: 1.5 }], [0.94, { r: 0 }]]),
    ...mood('exa', [[0, 'smug'], [0.62, 'stern'], [0.8, 'smug']]),
    tw('exa-pos', [[0, {}], [0.62, {}], [0.7, { x: -6 }], [0.76, { x: -16 }], [0.86, { x: -4 }]]),
    tw('desk', [[0, {}], [0.745, {}], [0.76, { y: 6 }], [0.8, { y: -2 }], [0.84, { y: 0 }]]),
    tw('dust', [[0, { o: 0, s: 0.6 }], [0.745, { o: 0, s: 0.6 }], [0.77, { o: 1, s: 1 }], [0.86, { o: 0, s: 1.3 }]]),
    ...mood('stu', [[0, 'smug'], [0.24, 'calm'], [0.46, 'nervous'], [0.75, 'shock'], [0.86, 'focus']]),
    tw('stu-pos', [[0, {}], [0.12, {}], [0.62, { s: 0.94 }], [0.75, { s: 0.9 }], [0.86, { s: 1.04, y: -8 }, 'ease-out'], [0.92, { s: 1, y: 0 }]]),
    tw('stu-body', [[0, {}], [0.75, {}], [0.79, { r: -12 }], [0.88, { r: 0 }]]),
    tw('stu-armR', [[0, {}], [0.82, {}], [0.9, { r: -140 }, 'ease-out']]),
    tw('stu-armL', [[0, {}], [0.82, {}], [0.9, { r: 30 }]]),
    tw('band', [[0, { o: 0, sx: 0.2 }], [0.84, { o: 0, sx: 0.2 }], [0.9, { o: 1, sx: 1 }]]),
    tw('fire', [[0, { o: 0, s: 0.3 }], [0.86, { o: 0, s: 0.3 }], [0.92, { o: 1, s: 1.1 }, 'ease-out'], [0.96, { s: 1 }]]),
  ],
}

/* benefit — the tired gardener keeps watering; the sapling bursts with fruit into their hand. */
export const benefit: Scene = {
  id: 'benefit',
  label: '烈日下满头大汗地给小树苗浇水，树猛地长大结满果子，苹果哗哗落进脚边的篮子，一颗正好落进手里',
  sfx: 'chime',
  hit: 0.78,
  render: () => (
    <g>
      <Backdrop sky="#e1f0f2" ground="#a9c98c" groundY={318} />
      <K x={46} y={58}>
        <K k="sun">
          <circle r={22} fill="#ffd66b" />
          <Burst r0={28} r1={40} n={12} color="#ffc23d" w={2.8} />
        </K>
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
            <g fill="#e2574c" stroke={INK} strokeWidth={1.3}>
              <circle cx={-40} cy={14} r={8} />
              <circle cx={-6} cy={-14} r={8} />
              <circle cx={36} cy={18} r={8} />
              <circle cx={18} cy={-26} r={8} />
              <circle cx={-22} cy={-30} r={8} />
              <circle cx={6} cy={16} r={8} />
            </g>
          </K>
        </K>
      </K>

      <K k="stu-pos" x={112} y={320} s={1.3}>
        <Person id="stu" moods={['tired', 'focus', 'shock', 'joy']} shirt="#e3a24a" hair="messy" arms={[8, -72]} />
        <K k="sweat" x={16} y={-112}>
          <path d="M0 0 q3.4 5.2 0 7.6 q-3.4 -2.4 0 -7.6z M8 6 q3 4.6 0 6.8 q-3 -2.2 0 -6.8z" fill="#8cc4ee" stroke={INK} strokeWidth={0.9} />
        </K>
      </K>
      {[
        ['a1', 198, 206],
        ['a2', 236, 214],
        ['a3', 258, 198],
      ].map(([k, x, y]) => (
        <K key={k as string} k={k as string} x={x as number} y={y as number} o={0}>
          <circle r={9} fill="#e2574c" stroke={INK} strokeWidth={1.3} />
          <Ln d="M0 -8 L1 -12" w={1.4} />
        </K>
      ))}
      <K k="basket" x={180} y={318}>
        <path d="M-28 -24 L28 -24 L22 0 L-22 0 Z" fill="#c99a5b" stroke={INK} strokeWidth={1.5} />
        <Ln d="M-26 -16 L26 -16 M-24 -8 L24 -8 M-12 -24 L-10 0 M2 -24 L2 0 M14 -24 L12 0" w={0.9} c="#8a6440" />
        <Ln d="M-24 -24 Q0 -50 24 -24" w={2.4} c="#8a6440" />
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
        <circle r={12} fill="#e2574c" stroke={INK} strokeWidth={1.5} />
        <circle cx={-4} cy={-4} r={3} fill="#fff" opacity={0.6} />
        <Ln d="M0 -10 L1.5 -16" w={1.8} />
        <path d="M1.5 -13 Q8 -19 11 -13 Q6 -10 1.5 -13 Z" fill="#6cbf5a" stroke={INK} strokeWidth={0.8} />
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
    // Effort during the build-up: the sun throbs and sweat keeps dripping.
    tw('sun', [[0, {}], ...wiggleStops(0.08, 0.7, 4, { s: 1.18 }, { s: 1 }), [0.8, { s: 0.9 }]]),
    tw('sweat', [
      [0, { o: 0 }],
      [0.1, { o: 0, y: 0 }],
      [0.14, { o: 1, y: 0 }],
      [0.3, { o: 0, y: 16 }, 'ease-in'],
      [0.31, { o: 0, y: 0 }],
      [0.36, { o: 1, y: 0 }],
      [0.52, { o: 0, y: 16 }, 'ease-in'],
      [0.53, { o: 0, y: 0 }],
      [0.58, { o: 1, y: 0 }],
      [0.72, { o: 0, y: 16 }, 'ease-in'],
    ]),
    // Payoff: the harvest pours into the basket.
    ...(
      [
        ['a1', -26, 92, 0.76],
        ['a2', -54, 82, 0.79],
        ['a3', -66, 100, 0.82],
      ] as const
    ).map(([k, x, y, at]) =>
      tw(k, [[0, { o: 0, s: 0 }], [at, { o: 0, s: 0 }], [at + 0.02, { o: 1, s: 1 }, 'ease-out'], [at + 0.08, { x, y }, 'ease-in'], [at + 0.1, { x, y: y - 6 }], [at + 0.12, { x, y }]]),
    ),
    tw('basket', [[0, {}], [0.84, {}], [0.86, { sy: 0.9 }], [0.9, { sy: 1.04 }], [0.94, { sy: 1 }]]),
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
  sfx: 'clatter',
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

const CHART_FLAT = 'M40 160 L62 157 L84 162 L106 156 L128 160 L150 155 L172 159 L194 154 L212 157'
const CHART_SPIKE = 'M212 157 L230 132 L248 80 L268 6'

/* significant — a dull flat line puts the room to sleep, then the line smashes out through the top of the board. */
export const significant: Scene = {
  id: 'significant',
  label: '会议上折线平得让全场打瞌睡，突然一飞冲天冲破白板顶端，所有人惊得跳起来，咖啡都打翻了',
  sfx: 'whoosh',
  hit: 0.76,
  render: () => (
    <g>
      <Backdrop sky="#edf0f3" ground="#c4cad3" groundY={344} />
      <K k="board">
        <rect x={20} y={36} width={280} height={148} rx={4} fill="#fff" stroke={INK} strokeWidth={2} />
        <Ln d="M36 48 L36 172 L288 172" w={2} c="#8b8f96" />
        <Ln d="M36 142 L288 142 M36 112 L288 112 M36 82 L288 82" w={0.8} c="#d8dbe0" />
      </K>
      <path d={CHART_FLAT} pathLength={1} data-k="flat" fill="none" stroke="#5b6b82" strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" />
      <path d={CHART_SPIKE} pathLength={1} data-k="spike" fill="none" stroke="#1f9d62" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" />
      <K k="breach" x={256} y={36} o={0}>
        <path d="M-22 0 L-12 -8 L-6 4 L2 -10 L8 2 L18 -6 L24 0" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <Burst r0={16} r1={32} n={12} color="#f2b84b" w={3} />
      </K>
      <K k="arrow" x={268} y={6}>
        <path d="M1 -6 L9 20 L-16 14 Z" fill="#1f9d62" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      </K>
      {['z1', 'z2', 'z3'].map((k, i) => (
        <K key={k} k={k} x={78 + i * 94} y={214} o={0}>
          <text fontSize={28} fontWeight={800} fill="#4f5d78" stroke="#fff" strokeWidth={0.8} fontFamily="Georgia, serif">
            Z<tspan dx={2} dy={-10} fontSize={20}>z</tspan>
          </text>
        </K>
      ))}
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
    css('flat', [[0, { strokeDashoffset: 1 }], [0.08, { strokeDashoffset: 1 }], [0.7, { strokeDashoffset: 0 }]], 'linear'),
    css('spike', [[0, { strokeDashoffset: 1 }], [0.7, { strokeDashoffset: 1 }], [0.76, { strokeDashoffset: 0 }]], 'ease-in'),
    tw('arrow', [[0, { o: 0, s: 0.3 }], [0.755, { o: 0, s: 0.3 }], [0.77, { o: 1, s: 1.5 }, 'ease-out'], [0.84, { s: 1.1 }]]),
    tw('breach', [[0, { o: 0, s: 0.4 }], [0.74, { o: 0, s: 0.4 }], [0.76, { o: 1, s: 1.2 }, 'ease-out'], [0.86, { s: 1 }], [1, { o: 0.85 }]]),
    tw('board', [[0, {}], [0.745, {}], [0.76, { y: -4 }], [0.8, { y: 2 }], [0.86, { y: 0 }]]),
    // Build-up: the room nods off one by one as the line drones on.
    ...['z1', 'z2', 'z3'].map((k, i) =>
      tw(k, [
        [0, { o: 0 }],
        [0.18 + i * 0.08, { o: 0, y: 0, s: 0.6 }],
        [0.26 + i * 0.08, { o: 1, y: -14, s: 1 }],
        [0.44 + i * 0.06, { o: 0.4, y: -34, x: 8, s: 1.2 }],
        [0.46 + i * 0.06, { o: 0, y: 0, x: 0, s: 0.6 }],
        [0.54 + i * 0.05, { o: 1, y: -14, s: 1 }],
        [0.7, { o: 0.9, y: -26, x: 6, s: 1.1 }],
        [0.74, { o: 0, y: -60, s: 1.6 }, 'ease-out'],
      ]),
    ),
    ...['pa', 'pb', 'pc'].flatMap((id, i) => [
      ...mood(id, [[0, 'focus'], [0.2 + i * 0.08, 'tired'], [0.75, 'shock'], [0.86, id === 'pb' ? 'shock' : 'joy']]),
      tw(`${id}-pos`, [[0, {}], [0.75 + i * 0.01, {}], [0.8 + i * 0.01, { y: -34 }, 'ease-out'], [0.86, { y: -28 }]]),
      tw(`${id}-head`, [[0, {}], [0.2 + i * 0.08, {}], [0.4 + i * 0.08, { r: (i - 1 || 1) * 14, y: 6 }], [0.7, { r: (i - 1 || 1) * 22, y: 9 }], [0.77, { r: 0, y: -6 }, 'ease-out'], [0.84, { y: 0 }]]),
      tw(`${id}-body`, [[0, {}], [0.3, {}], [0.7, { r: (i - 1 || 1) * 6, sy: 0.93 }], [0.76, { r: 0, sy: 1.04 }], [0.84, { sy: 1 }]]),
      tw(`${id}-armL`, [[0, {}], [0.76, {}], [0.84, { r: id === 'pb' ? 30 : 150 }]]),
      tw(`${id}-armR`, [[0, {}], [0.76, {}], [0.84, { r: id === 'pb' ? -30 : -150 }]]),
    ]),
    tw('cup', [[0, {}], [0.77, {}], [0.82, { r: 90, y: -2 }, 'ease-out']]),
    tw('spill', [[0, { o: 0, sx: 0.1 }], [0.8, { o: 0, sx: 0.1 }], [0.88, { o: 1, sx: 1 }]]),
  ],
}

/** Yellow contact ring marking where the plank only just rests on a cliff lip. */
function ContactRing() {
  return (
    <g>
      <circle r={15} fill="#ffe08a" opacity={0.35} />
      <circle r={15} fill="none" stroke="#f2a33a" strokeWidth={3.4} />
      <circle r={15} fill="none" stroke={INK} strokeWidth={0.8} />
    </g>
  )
}

/* adequate — the plank spans the chasm by a hair; one careful crossing, a leap, and the plank slips away behind. */
export const adequate: Scene = {
  id: 'adequate',
  label: '木板放下去刚好搭住深渊两边的崖沿，小心翼翼走过去一跃上岸，身后木板滑落深渊，长舒一口气',
  sfx: 'breath',
  hit: 0.84,
  render: () => (
    <g>
      <rect x={-400} y={-400} width={1120} height={1200} fill="#e6edf1" />
      <path d="M-400 380 L-60 200 L20 250 L80 210 L140 260 L210 220 L300 260 L720 180 L720 800 L-400 800 Z" fill="#cfd8de" />
      <rect x={96} y={300} width={128} height={500} fill="#2d2621" />
      <path d="M100 300 L112 340 L104 372 L118 420 L-400 420 L-400 300 Z" fill="#9b8a72" stroke={INK} strokeWidth={1.8} />
      <path d="M220 300 L208 336 L216 370 L204 420 L720 420 L720 300 Z" fill="#9b8a72" stroke={INK} strokeWidth={1.8} />
      <rect x={-400} y={295} width={500} height={7} fill="#7d9b5a" stroke={INK} strokeWidth={1} />
      <rect x={220} y={295} width={500} height={7} fill="#7d9b5a" stroke={INK} strokeWidth={1} />
      <K k="pebble" x={214} y={300} o={0}>
        <circle r={4} fill="#6b5e4e" stroke={INK} strokeWidth={0.8} />
      </K>
      <K k="plank-dip">
        <K k="plank" x={96} y={300}>
          <rect x={0} y={-10} width={128} height={10} rx={1.5} fill="#c99a5b" stroke={INK} strokeWidth={1.6} />
          <Ln d="M12 -5 L40 -5 M62 -4 L100 -4" w={0.9} c="#8a6440" />
        </K>
      </K>
      <K k="ringL" x={98} y={298} o={0}>
        <ContactRing />
      </K>
      <K k="ringR" x={222} y={298} o={0}>
        <ContactRing />
      </K>
      <K k="slip" x={222} y={298} o={0}>
        <Burst r0={12} r1={26} n={10} color="#8f8676" w={2.4} />
      </K>
      <K k="stu-pos" x={50} y={300} s={1.22}>
        <Person id="stu" moods={['fear', 'nervous', 'focus', 'shock', 'relief']} shirt="#6c8fb3" hair="messy" arms={[10, -10]} />
      </K>
    </g>
  ),
  tracks: [
    // Build-up: the plank is lowered across, lands on both lips, then the slow crossing.
    tw('plank', [
      [0, { r: -90 }],
      [0.08, { r: -90 }],
      [0.32, { r: 0 }, 'ease-in'],
      [0.35, { r: -3 }],
      [0.38, { r: 0 }],
      [0.8, { r: 0 }],
      [0.83, { r: 10, x: 2 }, 'ease-in'],
      [0.88, { r: 74, x: 4, y: 10 }, 'ease-in'],
      [0.96, { r: 86, x: 6, y: 220, o: 0 }, 'ease-in'],
    ]),
    tw('ringL', [[0, { o: 0, s: 1.8 }], [0.36, { o: 0, s: 1.8 }], [0.42, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.42, 0.7, 3, { s: 1.15 }, { s: 1 }), [0.8, { o: 1 }], [0.84, { o: 0 }]]),
    tw('ringR', [[0, { o: 0, s: 1.8 }], [0.38, { o: 0, s: 1.8 }], [0.44, { o: 1, s: 1 }, 'ease-out'], ...wiggleStops(0.44, 0.7, 3, { s: 1.15 }, { s: 1 }), [0.8, { o: 1, s: 1.3 }], [0.83, { o: 0, s: 1.6 }]]),
    tw('slip', [[0, { o: 0, s: 0.5 }], [0.81, { o: 0, s: 0.5 }], [0.84, { o: 1, s: 1 }], [0.92, { o: 0, s: 1.4 }]]),
    tw('stu-pos', [
      [0, {}],
      [0.38, {}],
      [0.44, { x: 30, y: -10 }],
      [0.5, { x: 46, y: -8 }],
      [0.56, { x: 62, y: -11 }],
      [0.62, { x: 78, y: -8 }],
      [0.7, { x: 100, y: -11 }],
      [0.75, { x: 150, y: -46 }, 'ease-out'],
      [0.8, { x: 198, y: 0 }, 'ease-in'],
      [0.84, { x: 198, y: 3, sy: 0.95 }],
      [0.88, { x: 198, y: 0, sy: 1 }],
    ]),
    tw('plank-dip', [[0, {}], [0.44, {}], [0.56, { y: 3 }], [0.7, { y: 5 }], [0.74, { y: -2 }], [0.78, { y: 0 }]]),
    tw('pebble', [[0, { o: 0 }], [0.5, { o: 0 }], [0.52, { o: 1 }], [0.7, { x: -4, y: 110, o: 0 }, 'ease-in']]),
    tw('stu-armL', [[0, {}], [0.38, {}], [0.44, { r: 70 }], [0.5, { r: 56 }], [0.56, { r: 78 }], [0.62, { r: 60 }], [0.7, { r: 74 }], [0.75, { r: 150 }], [0.84, { r: 6 }]]),
    tw('stu-armR', [[0, {}], [0.38, {}], [0.44, { r: -70 }], [0.5, { r: -82 }], [0.56, { r: -60 }], [0.62, { r: -78 }], [0.7, { r: -64 }], [0.75, { r: -150 }], [0.84, { r: 40 }]]),
    tw('stu-body', [[0, {}], [0.44, {}], [0.5, { r: -5 }], [0.56, { r: 5 }], [0.62, { r: -4 }], [0.7, { r: 3 }], [0.76, { r: 0 }], [0.86, {}], [0.9, { r: 6, sy: 0.95 }], [0.96, { r: 4, sy: 0.97 }]]),
    tw('stu-head', [[0, { r: 14 }], [0.3, { r: 10 }], [0.7, { r: 12 }], [0.76, { r: 0 }], [0.84, { r: -14 }], [0.92, { r: -6 }]]),
    ...mood('stu', [[0, 'fear'], [0.36, 'nervous'], [0.56, 'focus'], [0.8, 'shock'], [0.86, 'relief']]),
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

function Fish({ id, body = '#f5a033', fin = '#f08a24', moods }: { id: string; body?: string; fin?: string; moods: ('sad' | 'happy')[] }) {
  return (
    <g>
      <path d="M-16 0 L-30 -12 L-27 0 L-30 12 Z" fill={fin} stroke={INK} strokeWidth={1.3} />
      <ellipse cx={4} cy={0} rx={22} ry={13} fill={body} stroke={INK} strokeWidth={1.5} />
      <path d="M0 -12 Q6 -21 13 -12" fill={fin} stroke={INK} strokeWidth={1.1} />
      {moods.map((m, i) => (
        <g key={m} data-k={`${id}-m-${m}`} opacity={i === 0 ? 1 : 0}>
          <FishFace m={m} />
        </g>
      ))}
    </g>
  )
}

const BOWL = { cx: 140, cy: 252, r: 80, water: 196 }

/* environment — a gasping fish in a stinking bowl; fresh water rebuilds its whole little world. */
export const environment: Scene = {
  id: 'environment',
  label: '发臭的脏鱼缸里金鱼浮到水面喘气，一壶清水倒进去，污泥垃圾冲走，水草、城堡、小石子和新伙伴一起出现，金鱼欢快地游起来',
  sfx: 'splash',
  hit: 0.74,
  render: () => (
    <g>
      <Backdrop sky="#e7eee8" ground="#cbbfa8" groundY={396} />
      <defs>
        <clipPath id="cw-env-bowl">
          <circle cx={BOWL.cx} cy={BOWL.cy} r={BOWL.r - 2} />
        </clipPath>
      </defs>
      <g transform="translate(-8 6)">
      <circle cx={BOWL.cx} cy={BOWL.cy} r={BOWL.r} fill="#f4f8fa" stroke={INK} strokeWidth={2} />
      <g clipPath="url(#cw-env-bowl)">
        <rect x={50} y={BOWL.water} width={180} height={150} fill="#8fd0ee" />
        <K k="rays" o={0}>
          <path d="M96 196 L80 340 L104 340 Z M150 196 L146 340 L168 340 Z" fill="#fff" opacity={0.35} />
        </K>
        <K k="pebbles" o={0}>
          <g stroke={INK} strokeWidth={1}>
            {[
              [80, 318, '#e2574c'],
              [98, 324, '#f2c94c'],
              [118, 326, '#5d9cec'],
              [168, 326, '#e2574c'],
              [186, 322, '#f2c94c'],
              [202, 316, '#7d9b5a'],
            ].map(([x, y, c]) => (
              <ellipse key={`${x}`} cx={x as number} cy={y as number} rx={8} ry={5} fill={c as string} />
            ))}
          </g>
        </K>
        <K k="castle" x={182} y={318} o={0}>
          <path d="M-16 0 L-16 -30 L-11 -30 L-11 -24 L-5 -24 L-5 -30 L5 -30 L5 -24 L11 -24 L11 -30 L16 -30 L16 0 Z" fill="#e7d9c4" stroke={INK} strokeWidth={1.3} />
          <path d="M-5 0 L-5 -10 Q0 -16 5 -10 L5 0 Z" fill="#5a4a3a" />
          <Ln d="M0 -30 L0 -44" w={1.4} />
          <path d="M0 -44 L12 -40 L0 -36 Z" fill="#e2574c" />
        </K>
        {[
          ['weedA', 92, 326, 1],
          ['weedB', 128, 330, -1],
        ].map(([k, x, y, d]) => (
          <K key={k as string} k={k as string} x={x as number} y={y as number} o={0}>
            <path
              d={`M0 0 Q${-8 * (d as number)} -18 ${2 * (d as number)} -36 Q${10 * (d as number)} -52 0 -64 M10 0 Q${18 * (d as number)} -18 10 -40`}
              fill="none"
              stroke="#3f9a54"
              strokeWidth={5}
              strokeLinecap="round"
            />
          </K>
        ))}
        <K x={196} y={262} s={1}>
          <K k="pal" o={0}>
            <g transform="scale(-0.85 0.85)">
              <Fish id="pal" body="#f5d033" fin="#e2a722" moods={['happy']} />
            </g>
          </K>
        </K>
        <K k="murky">
          <rect x={50} y={BOWL.water} width={180} height={150} fill="#6f6a3a" opacity={0.92} />
          <g fill="#4a4628" opacity={0.75}>
            <circle cx={84} cy={250} r={5} />
            <circle cx={176} cy={226} r={4} />
            <circle cx={140} cy={300} r={6} />
            <circle cx={110} cy={216} r={3} />
            <circle cx={196} cy={280} r={5} />
          </g>
          <path d="M60 330 Q100 304 140 318 Q180 300 224 326 L224 340 L60 340 Z" fill="#4a4024" />
        </K>
        <K k="trash">
          <g transform="rotate(24 186 300)">
            <rect x={176} y={284} width={20} height={32} rx={3} fill="#c0392b" stroke={INK} strokeWidth={1.3} />
            <rect x={176} y={292} width={20} height={8} fill="#f3efe6" />
          </g>
          <path d="M70 226 Q92 214 108 228 Q98 246 76 240 Z" fill="#e8e8e8" opacity={0.95} stroke={INK} strokeWidth={1.1} />
          <path d="M96 320 L96 296 L110 296 L112 312 L128 314 L128 322 Z" fill="#5a4a3a" stroke={INK} strokeWidth={1.3} />
        </K>
        <K k="bubbles" x={176} y={300} o={0}>
          <g fill="none" stroke="#fff" strokeWidth={2}>
            <circle cx={0} cy={0} r={4} />
            <circle cx={-8} cy={-20} r={3} />
            <circle cx={3} cy={-40} r={5} />
          </g>
        </K>
        <K x={140} y={262} s={1.35}>
          <K k="fish">
            <Fish id="fish" moods={['sad', 'happy']} />
          </K>
        </K>
      </g>
      <path d={`M${BOWL.cx - 56} ${BOWL.cy - 58} Q${BOWL.cx} ${BOWL.cy - 66} ${BOWL.cx + 56} ${BOWL.cy - 58}`} fill="none" stroke={INK} strokeWidth={2} />
      <K k="stink" x={140} y={168}>
        <Ln d="M-30 0 q-6 -8 0 -16 t0 -16 M0 -4 q-6 -8 0 -16 t0 -16 M30 0 q-6 -8 0 -16 t0 -16" w={3.2} c="#8a9a3a" />
      </K>
      <K k="sparkle" x={140} y={252} o={0}>
        <Burst r0={88} r1={104} n={16} color="#5dbbe8" w={3} />
      </K>
      </g>
      <Desk x={28} y={336} w={210} color="#b98a58" legs={60} />
      <K k="stream" o={0}>
        <path d="M200 192 Q186 200 178 244 L188 244 Q194 206 206 198 Z" fill="#5dbbe8" stroke={INK} strokeWidth={0.8} />
      </K>
      <K k="stu-pos" x={290} y={398} s={1.8}>
        <Person id="stu" moods={['sad', 'focus', 'happy']} shirt="#4f8f7f" hair="short" hairColor="#3a2a20" skin={SKIN[2]} arms={[150, -10]} look={-1} />
      </K>
      <K k="jug" x={240} y={196}>
        <path d="M-12 -28 L20 -28 L22 14 L-14 14 Z" fill="#cfe7f6" stroke={INK} strokeWidth={1.6} />
        <path d="M-12 -28 L-26 -33 L-14 -18 Z" fill="#cfe7f6" stroke={INK} strokeWidth={1.3} />
        <rect x={-12} y={-14} width={33} height={28} fill="#5dbbe8" opacity={0.75} />
        <Ln d="M20 -18 Q34 -10 20 6" w={2.6} />
      </K>
    </g>
  ),
  tracks: [
    // Build-up: the fish gasps at the surface, the stink rises, the keeper walks over with fresh water.
    tw('fish', [
      [0, { y: -18, r: -20 }],
      [0.1, { y: -18, r: -20 }],
      ...wiggleStops(0.1, 0.7, 4, { y: -36, r: -34 }, { y: -26, r: -24 }),
      [0.78, { y: 0, x: -24, r: 0 }],
      [0.86, { y: 8, x: 18, r: 6 }],
      [0.94, { y: -4, x: 8, r: -6 }],
      [1, { y: 0, x: 0, r: 0 }],
    ]),
    ...mood('fish', [[0, 'sad'], [0.78, 'happy']]),
    tw('stink', [[0, { o: 0.5 }], ...wiggleStops(0.08, 0.7, 3, { y: -10, o: 1, s: 1.15 }, { y: 0, o: 0.6, s: 1 }), [0.76, { o: 0, y: -20 }]]),
    fade('murky', [[0, 0.75], [0.7, 1], [0.73, 1], [0.82, 0]]),
    tw('trash', [[0, {}], [0.72, {}], [0.82, { o: 0, y: -90, x: -10 }, 'ease-in']]),
    tw('pebbles', [[0, { o: 0 }], [0.76, { o: 0 }], [0.82, { o: 1 }]]),
    tw('castle', [[0, { o: 0, s: 0 }], [0.78, { o: 0, s: 0 }], [0.83, { o: 1, s: 1.2 }, 'ease-out'], [0.87, { s: 1 }]]),
    tw('weedA', [[0, { o: 0, sy: 0 }], [0.77, { o: 0, sy: 0 }], [0.86, { o: 1, sy: 1 }, 'ease-out'], [0.92, { r: 4 }], [1, { r: -3 }]]),
    tw('weedB', [[0, { o: 0, sy: 0 }], [0.79, { o: 0, sy: 0 }], [0.88, { o: 1, sy: 1 }, 'ease-out'], [0.94, { r: -4 }], [1, { r: 3 }]]),
    fade('rays', [[0, 0], [0.8, 0], [0.88, 1]]),
    tw('pal', [[0, { o: 0, x: 60 }], [0.82, { o: 0, x: 60 }], [0.9, { o: 1, x: 0 }, 'ease-out'], [1, { y: -6 }]]),
    tw('bubbles', [[0, { o: 0 }], [0.8, { o: 0, y: 10 }], [0.86, { o: 1, y: 0 }], [1, { o: 0.6, y: -14 }]]),
    tw('sparkle', [[0, { o: 0, s: 0.9 }], [0.8, { o: 0, s: 0.9 }], [0.84, { o: 1, s: 1 }], [0.94, { o: 0, s: 1.12 }]]),
    tw('jug', [[0, { x: 56, y: 52 }], [0.12, { x: 56, y: 52 }], [0.5, { x: -6, y: 21 }], [0.66, { x: 0, y: 0 }], [0.7, { r: -24 }], [0.73, { r: -50 }], [0.84, { r: -54 }], [0.92, { r: 0 }]]),
    flip('stream', [[0, 0], [0.72, 1], [0.84, 0]]),
    tw('stu-pos', [[0, { x: 34 }], [0.12, { x: 34 }], [0.5, { x: 10 }], [0.66, { x: 0 }]]),
    tw('stu-armL', [[0, { r: -60 }], [0.12, { r: -60 }], [0.5, { r: -30 }], [0.66, { r: 0 }], [0.72, { r: 4 }], [0.92, { r: 0 }]]),
    tw('stu-body', [[0, {}], [0.6, { r: -6 }], [0.84, { r: -6 }], [0.92, { r: 0 }]]),
    ...mood('stu', [[0, 'sad'], [0.4, 'focus'], [0.84, 'happy']]),
  ],
}

/* factor — a deadlocked tug of war; one small dog joins and decides it. */
export const factor: Scene = {
  id: 'factor',
  label: '拔河僵持不下快要输了，一只小狗咬住绳尾往后一拽，局面瞬间逆转',
  sfx: 'boing',
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

/* approach — rushing at the cat sends it hissing; crouching low and inching closer with an open palm wins it over. */
export const approach: Scene = {
  id: 'approach',
  label: '兴冲冲扑向野猫，猫炸毛哈气往后跳；改成蹲低摊开手一点点挪近，猫慢慢平静，主动走过来蹭手',
  sfx: 'purr',
  hit: 0.8,
  render: () => (
    <g>
      <Backdrop sky="#f0dcc6" ground="#b6a28a" groundY={330} />
      <g stroke="#d7c0a6" strokeWidth={1.2}>
        <path d="M-40 160 L360 160 M-40 190 L360 190 M-40 220 L360 220 M-40 250 L360 250 M-40 280 L360 280 M-40 310 L360 310" />
      </g>
      <K k="cat-pos" x={228} y={330} s={1.6}>
        <K k="cat-scared" o={0}>
          <K k="cat-arch">
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
        </K>
        <K k="cat-calm">
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
      <K k="hiss" x={186} y={252} o={0}>
        <Ln d="M0 -14 L-12 -18 M-2 0 L-16 0 M0 14 L-12 18" w={3} c="#d64541" />
        <text x={18} y={-40} fontSize={34} fontWeight={800} fill="#d64541" fontFamily="Georgia, serif">
          !
        </text>
      </K>
      <K k="heart" x={204} y={232} o={0}>
        <path d="M0 9 C-15 -3 -12 -18 0 -10 C12 -18 15 -3 0 9 Z" fill="#e2574c" stroke={INK} strokeWidth={1.5} />
      </K>
      <K k="dust" x={66} y={330} o={0}>
        <Ln d="M-10 -4 L-30 -10 M-12 -12 L-28 -24 M-8 2 L-32 2" w={2.4} c="#8f8676" />
      </K>
      <K k="run-pos" x={48} y={332} s={1.3}>
        <Person id="run" moods={['joy', 'shock']} shirt="#7a9e7e" hair="messy" arms={[-80, -100]} />
      </K>
      <K k="stu-pos" x={92} y={332} s={1.3} o={0}>
        <Person id="stu" moods={['nervous', 'focus', 'happy']} shirt="#7a9e7e" hair="messy" legs="crouch" arms={[14, -76]} look={1} />
      </K>
    </g>
  ),
  tracks: [
    // Wrong way: rush in, the cat explodes, back off.
    tw('run-pos', [[0, {}], [0.1, {}], [0.22, { x: 66 }, 'ease-in'], [0.26, { x: 60, r: -6 }], [0.32, { x: 34, r: 0 }], [0.35, { x: 34, o: 1 }], [0.37, { x: 34, o: 0 }]]),
    tw('run-body', [[0, {}], [0.1, {}], [0.2, { r: 10 }], [0.26, { r: -12 }], [0.32, { r: 0 }]]),
    ...mood('run', [[0, 'joy'], [0.24, 'shock']]),
    tw('dust', [[0, { o: 0 }], [0.12, { o: 0 }], [0.14, { o: 1 }], [0.22, { o: 1, x: 80 }], [0.24, { o: 0, x: 80 }]]),
    flip('cat-calm', [[0, 1], [0.22, 0], [0.74, 1]]),
    flip('cat-scared', [[0, 0], [0.22, 1], [0.74, 0]]),
    tw('cat-arch', [[0, {}], [0.22, { sy: 1.15 }], [0.3, { sy: 1 }], [0.44, {}], [0.7, { sy: 0.86, sx: 0.96 }]]),
    tw('hiss', [[0, { o: 0, s: 0.5 }], [0.22, { o: 0, s: 0.5 }], [0.25, { o: 1, s: 1.2 }, 'ease-out'], [0.32, { o: 1, s: 1 }], [0.44, { o: 0.7 }], [0.6, { o: 0, s: 0.8 }]]),
    // Right way: crouch, open palm, inch closer while the cat settles.
    tw('stu-pos', [
      [0, { o: 0 }],
      [0.35, { o: 0 }],
      [0.37, { o: 1 }],
      [0.44, { x: 10 }],
      [0.48, { x: 10 }],
      [0.54, { x: 22 }],
      [0.58, { x: 22 }],
      [0.64, { x: 34 }],
      [0.7, { x: 40 }],
      [0.84, { x: 42 }],
    ]),
    tw('stu-body', [[0, {}], [0.37, { r: 6 }], [0.7, { r: 10 }], [0.86, { r: 4 }]]),
    tw('cat-pos', [
      [0, {}],
      [0.22, {}],
      [0.26, { x: 14, y: -18 }, 'ease-out'],
      [0.3, { x: 16, y: 0 }, 'ease-in'],
      [0.74, { x: 16 }],
      [0.82, { x: 6 }],
      [0.88, { x: 2, r: -5 }],
      [0.94, { x: 4, r: 4 }],
      [1, { x: 2, r: 0 }],
    ]),
    tw('heart', [[0, { o: 0, s: 0.2 }], [0.8, { o: 0, s: 0.2 }], [0.85, { o: 1, s: 1.5, y: -10 }, 'ease-out'], [0.92, { s: 1.2, y: -18 }]]),
    ...mood('stu', [[0, 'nervous'], [0.5, 'focus'], [0.84, 'happy']]),
  ],
}

/** Muddy shoe-sole print, toe up, ~14×34 at scale 1. */
function Sole({ c = '#7a4a22', tread = '#c9a27a' }: { c?: string; tread?: string }) {
  return (
    <g>
      <path d="M0 -17 C7 -17 8 -8 7 -2 C6 3 4 5 4 8 L4 14 C4 18 -4 18 -4 14 L-4 8 C-4 5 -7 3 -7 -2 C-8 -8 -7 -17 0 -17 Z" fill={c} stroke={INK} strokeWidth={0.9} />
      <Ln d="M-5 -11 L5 -11 M-6 -6 L6 -6 M-5.5 -1 L5.5 -1 M-2.6 10 L2.6 10 M-2.6 14 L2.6 14" w={1.4} c={tread} />
    </g>
  )
}

const PRINTS: [string, number, number, number][] = [
  ['fp1', 150, 362, 78],
  ['fp2', 182, 348, 96],
  ['fp3', 214, 364, 80],
  ['fp4', 244, 350, 98],
]

/* evidence — the detective slaps down a photo of a muddy print; matching prints lead straight to the suspect's shoe. */
export const evidence: Scene = {
  id: 'evidence',
  label: '审讯室里侦探高举一张泥脚印照片拍在桌上，一串同样的泥脚印一路通向嫌疑人沾泥的鞋，嫌疑人冒汗低头',
  sfx: 'sting',
  hit: 0.75,
  render: () => (
    <g>
      <Backdrop sky="#5c6272" ground="#9a9ca3" groundY={330} />
      <K k="lamp" x={150} y={-30}>
        <Ln d="M0 0 L0 64" w={1.8} c="#1e1f22" />
        <path d="M0 64 L-110 330 L110 330 Z" fill="#fff1bf" opacity={0.22} />
        <path d="M-18 78 L18 78 L9 64 L-9 64 Z" fill="#2e3036" stroke={INK} strokeWidth={1.2} />
        <ellipse cx={0} cy={79} rx={9} ry={3.4} fill="#ffe08a" />
      </K>
      {PRINTS.map(([k, x, y, r]) => (
        <K key={k} k={k} x={x} y={y} r={r} o={0}>
          <Sole />
        </K>
      ))}
      <K k="sus-pos" x={262} y={332} s={1.25}>
        <Person id="sus" moods={['smug', 'nervous', 'shock', 'guilty']} shirt="#8f9196" hair="short" hairColor="#2a2a2a" arms={[8, -8]} look={-1} />
        <g fill="#7a4a22" stroke={INK} strokeWidth={0.8}>
          <path d="M3 -2 Q6 -7 12 -6 Q17 -5 17 -1 L16 2 L4 2 Z" />
          <circle cx={6} cy={3} r={1.6} />
          <circle cx={13} cy={4} r={1.3} />
        </g>
        <K k="sweat" x={-20} y={-108} o={0}>
          <path d="M0 0 q3.4 5.2 0 7.6 q-3.4 -2.4 0 -7.6z M-6 8 q3 4.6 0 6.8 q-3 -2.2 0 -6.8z" fill="#8cc4ee" stroke={INK} strokeWidth={0.9} />
        </K>
      </K>
      <K k="lens" x={274} y={332} o={0}>
        <circle r={22} fill="#e8f4fb" opacity={0.25} />
        <circle r={22} fill="none" stroke="#f2b84b" strokeWidth={4.5} />
        <circle r={22} fill="none" stroke={INK} strokeWidth={1.2} />
        <Limb d="M15 15 L32 32" color="#5a3a26" w={6} />
      </K>
      <K k="table">
        <rect x={70} y={246} width={144} height={12} rx={2} fill="#6c625a" stroke={INK} strokeWidth={1.5} />
        <rect x={82} y={258} width={7} height={72} fill="#4c443d" stroke={INK} strokeWidth={1} />
        <rect x={196} y={258} width={7} height={72} fill="#4c443d" stroke={INK} strokeWidth={1} />
      </K>
      <K k="det-pos" x={52} y={334} s={1.3}>
        <Person id="det" moods={['stern', 'angry', 'smug']} shirt="#8a7356" hair="side" hairColor="#2f2a26" skin={SKIN[1]} tie="#3b3b3b" arms={[8, -96]} look={1} />
      </K>
      <K k="photo" x={142} y={212}>
        <rect x={-44} y={-36} width={88} height={72} rx={2} fill="#fff" stroke={INK} strokeWidth={1.8} />
        <rect x={-38} y={-30} width={76} height={52} fill="#d9cfc0" />
        <g transform="translate(0 -4) rotate(14) scale(1.35)">
          <Sole />
        </g>
        <Ln d="M-36 29 L10 29" w={1.4} c="#9a958a" />
      </K>
      <K k="bang" x={142} y={240} o={0}>
        <Burst r0={50} r1={70} n={12} color="#ffe08a" w={3} />
      </K>
    </g>
  ),
  tracks: [
    // Build-up: the photo is raised higher and higher while the suspect starts to sweat.
    tw('det-armR', [[0, {}], [0.12, {}], [0.66, { r: -60 }], [0.7, { r: -66 }], [0.745, { r: 32 }, 'ease-in'], [0.86, { r: 20 }]]),
    tw('det-body', [[0, {}], [0.12, {}], [0.66, { r: -4 }], [0.745, { r: 16 }, 'ease-in'], [0.86, { r: 8 }]]),
    tw('photo', [
      [0, { x: -4, y: 6, r: -10, s: 0.75 }],
      [0.12, { x: -4, y: 6, r: -10, s: 0.75 }],
      [0.4, { x: -18, y: -22, r: -14, s: 0.9 }],
      [0.66, { x: -30, y: -52, r: -18, s: 1 }],
      [0.7, { x: -32, y: -56, r: -20, s: 1 }],
      [0.745, { x: 0, y: 0, r: 3, s: 1 }, 'ease-in'],
      [0.77, { r: 3, s: 1.08 }],
      [0.86, { r: 0, s: 1.12 }],
    ]),
    tw('bang', [[0, { o: 0, s: 0.6 }], [0.74, { o: 0, s: 0.6 }], [0.765, { o: 1, s: 1 }], [0.86, { o: 0, s: 1.3 }]]),
    tw('table', [[0, {}], [0.745, {}], [0.76, { y: 5 }], [0.8, { y: -1 }], [0.84, { y: 0 }]]),
    tw('lamp', [[0, {}], [0.745, {}], [0.8, { r: 6 }], [0.86, { r: -4 }], [0.92, { r: 2 }], [1, { r: 0 }]]),
    // Action: the matching prints light up one by one, straight to the suspect's shoe.
    ...PRINTS.map(([k], i) => tw(k, [[0, { o: 0, s: 0.4 }], [0.77 + i * 0.025, { o: 0, s: 0.4 }], [0.79 + i * 0.025, { o: 1, s: 1.25 }, 'ease-out'], [0.82 + i * 0.025, { s: 1 }]])),
    tw('lens', [[0, { o: 0, s: 2.2 }], [0.86, { o: 0, s: 2.2 }], [0.91, { o: 1, s: 1 }, 'ease-out'], [0.95, { s: 1.08 }], [1, { s: 1 }]]),
    tw('sweat', [[0, { o: 0 }], [0.3, { o: 0, y: 0 }], [0.36, { o: 1 }], [0.5, { o: 0.4, y: 10 }], [0.52, { o: 0, y: 0 }], [0.56, { o: 1, y: 0 }], [0.7, { o: 0.6, y: 10 }], [0.75, { o: 1, y: 0 }], [1, { o: 1, y: 6 }]]),
    ...mood('det', [[0, 'stern'], [0.66, 'angry'], [0.9, 'smug']]),
    ...mood('sus', [[0, 'smug'], [0.36, 'nervous'], [0.75, 'shock'], [0.86, 'guilty']]),
    tw('sus-body', [[0, {}], [0.36, {}], [0.7, { r: 3 }], [0.76, { r: 6, y: -4 }], [0.86, { r: 8, y: 0 }]]),
    tw('sus-head', [[0, {}], [0.75, { y: -4 }], [0.85, { y: 0 }], [0.92, { y: 4, r: 18 }]]),
  ],
}
