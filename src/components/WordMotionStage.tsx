import { illustrationUrl, videoUrl, type Word } from '../data/types'

export type MotionArchetype =
  | 'collapse'
  | 'ascend'
  | 'converge'
  | 'diverge'
  | 'oscillate'
  | 'focus'
  | 'barrier'
  | 'orbit'

function hashWord(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

export function pickArchetype(word: Word): MotionArchetype {
  const hay = `${word.id} ${word.sceneHook} ${word.senses.map((s) => s.zh).join(' ')}`.toLowerCase()
  if (/(collapse|fall|drop|declin|reduc|shrink|sink|crash|down|倒塌|下降|减少|缩|跌|沉)/.test(hay)) {
    return 'collapse'
  }
  if (/(increas|rise|grow|expand|acceler|boost|emerg|achiev|peak|high|上升|增长|加速|扩大|提高|达到)/.test(hay)) {
    return 'ascend'
  }
  if (/(merg|combin|connect|attach|link|integrat|gather|accumul|compil|coincid|结合|连接|汇集|积累|合并)/.test(hay)) {
    return 'converge'
  }
  if (/(divid|separat|allocat|spread|distribut|divers|categor|branch|分配|分离|传播|分类|散)/.test(hay)) {
    return 'diverge'
  }
  if (/(fluctuat|cycl|shift|chang|adapt|adjust|transform|alternat|balanc|affect|变化|调整|适应|波动|影响|转换)/.test(hay)) {
    return 'oscillate'
  }
  if (/(focus|accurat|core|specif|identif|select|target|point|defin|assess|准确|核心|特定|识别|评估|聚焦)/.test(hay)) {
    return 'focus'
  }
  if (/(challeng|block|limit|restrict|ban|conflict|obstacl|resist|defend|挑战|限制|阻止|冲突|抵御)/.test(hay)) {
    return 'barrier'
  }
  const all: MotionArchetype[] = [
    'orbit',
    'ascend',
    'converge',
    'oscillate',
    'focus',
    'diverge',
    'barrier',
    'collapse',
  ]
  return all[hashWord(word.id) % all.length]
}

export function computeTypingProgress(input: string, target: string, passed: boolean): number {
  if (passed) return 1
  const cleanIn = input.trim().toLowerCase()
  const cleanTarget = target.trim().toLowerCase()
  if (!cleanIn || !cleanTarget) return 0
  let matched = 0
  const len = Math.min(cleanIn.length, cleanTarget.length)
  for (let i = 0; i < len; i++) {
    if (cleanIn[i] === cleanTarget[i]) matched++
    else break
  }
  return Math.min(0.95, matched / cleanTarget.length)
}

type WordMotionStageProps = {
  word: Word
  spellInput: string
  passed: boolean
}

export function WordMotionStage({ word, spellInput, passed }: WordMotionStageProps) {
  const vidSrc = videoUrl(word)
  const illusSrc = illustrationUrl(word)
  const archetype = pickArchetype(word)
  const progress = computeTypingProgress(spellInput, word.word, passed)
  const circumference = 2 * Math.PI * 104
  const dashOffset = circumference * (1 - progress)
  const accent = word.color || '#243b55'

  return (
    <div
      className={`cw-motion-stage is-${archetype}${passed ? ' is-passed' : ''}${
        spellInput.length > 0 ? ' is-typing' : ''
      }`}
      style={
        {
          '--cw-word-color': accent,
          '--cw-type-progress': String(progress),
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      {vidSrc ? (
        <video
          key={vidSrc}
          className="cw-poster-video"
          src={vidSrc}
          poster={illusSrc ?? undefined}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : illusSrc ? (
        <div className="cw-kenburns-wrap">
          <img
            className="cw-poster-photo cw-poster-kenburns"
            src={illusSrc}
            alt=""
            width={640}
            height={800}
            draggable={false}
          />
          <svg className="cw-illus-aura-svg" viewBox="0 0 260 260" fill="none">
            <circle
              className="cw-progress-ring"
              cx="130"
              cy="130"
              r="104"
              stroke={accent}
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : (
        <>
          <div className="cw-poster-grid-overlay" />
          <div className="cw-motion-glow" />
          <svg className="cw-motion-svg" viewBox="0 0 260 260" fill="none">
            {/* Ambient base guide */}
            <circle
              cx="130"
              cy="130"
              r="104"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1"
            />
            {/* Real-time typing progress halo */}
            <circle
              className="cw-progress-ring"
              cx="130"
              cy="130"
              r="104"
              stroke={accent}
              strokeWidth="2.6"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />

            {archetype === 'orbit' && (
              <g className="cw-arch-orbit">
                <ellipse
                  className="cw-orbit-ring-1"
                  cx="130"
                  cy="130"
                  rx="82"
                  ry="38"
                  stroke={accent}
                  strokeWidth="1.4"
                  strokeOpacity="0.65"
                />
                <ellipse
                  className="cw-orbit-ring-2"
                  cx="130"
                  cy="130"
                  rx="38"
                  ry="82"
                  stroke={accent}
                  strokeWidth="1.4"
                  strokeOpacity="0.45"
                />
                <circle className="cw-core-pulse" cx="130" cy="130" r="14" fill={accent} fillOpacity="0.85" />
                <circle className="cw-sat-1" cx="212" cy="130" r="5" fill={accent} />
                <circle className="cw-sat-2" cx="130" cy="48" r="4" fill={accent} />
              </g>
            )}

            {archetype === 'ascend' && (
              <g className="cw-arch-ascend">
                <path
                  className="cw-ascend-arc-1"
                  d="M74 166 L130 110 L186 166"
                  stroke={accent}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="cw-ascend-arc-2"
                  d="M90 134 L130 94 L170 134"
                  stroke={accent}
                  strokeWidth="1.8"
                  strokeOpacity="0.65"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle className="cw-ascend-orb" cx="130" cy="84" r="9" fill={accent} />
                <line
                  className="cw-ascend-stem"
                  x1="130"
                  y1="100"
                  x2="130"
                  y2="188"
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </g>
            )}

            {archetype === 'collapse' && (
              <g className="cw-arch-collapse">
                <rect
                  className="cw-fall-block-1"
                  x="92"
                  y="74"
                  width="76"
                  height="18"
                  rx="4"
                  stroke={accent}
                  strokeWidth="1.8"
                  fill={accent}
                  fillOpacity="0.16"
                />
                <rect
                  className="cw-fall-block-2"
                  x="84"
                  y="112"
                  width="92"
                  height="18"
                  rx="4"
                  stroke={accent}
                  strokeWidth="1.8"
                  fill={accent}
                  fillOpacity="0.24"
                />
                <ellipse
                  className="cw-ripple-ring"
                  cx="130"
                  cy="176"
                  rx="58"
                  ry="14"
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
              </g>
            )}

            {archetype === 'converge' && (
              <g className="cw-arch-converge">
                <circle
                  className="cw-merge-left"
                  cx="98"
                  cy="130"
                  r="36"
                  stroke={accent}
                  strokeWidth="1.8"
                  fill={accent}
                  fillOpacity="0.18"
                />
                <circle
                  className="cw-merge-right"
                  cx="162"
                  cy="130"
                  r="36"
                  stroke={accent}
                  strokeWidth="1.8"
                  fill={accent}
                  fillOpacity="0.18"
                />
                <circle className="cw-core-pulse" cx="130" cy="130" r="8" fill={accent} />
              </g>
            )}

            {archetype === 'diverge' && (
              <g className="cw-arch-diverge">
                <line x1="130" y1="130" x2="82" y2="82" stroke={accent} strokeWidth="1.5" strokeOpacity="0.5" />
                <line x1="130" y1="130" x2="178" y2="82" stroke={accent} strokeWidth="1.5" strokeOpacity="0.5" />
                <line x1="130" y1="130" x2="82" y2="178" stroke={accent} strokeWidth="1.5" strokeOpacity="0.5" />
                <line x1="130" y1="130" x2="178" y2="178" stroke={accent} strokeWidth="1.5" strokeOpacity="0.5" />
                <circle className="cw-div-node-1" cx="82" cy="82" r="9" fill={accent} fillOpacity="0.75" />
                <circle className="cw-div-node-2" cx="178" cy="82" r="9" fill={accent} fillOpacity="0.75" />
                <circle className="cw-div-node-3" cx="82" cy="178" r="9" fill={accent} fillOpacity="0.75" />
                <circle className="cw-div-node-4" cx="178" cy="178" r="9" fill={accent} fillOpacity="0.75" />
                <circle className="cw-core-pulse" cx="130" cy="130" r="12" stroke={accent} strokeWidth="2" />
              </g>
            )}

            {archetype === 'oscillate' && (
              <g className="cw-arch-oscillate">
                <path
                  className="cw-wave-1"
                  d="M 52 130 Q 91 78, 130 130 T 208 130"
                  stroke={accent}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  className="cw-wave-2"
                  d="M 52 130 Q 91 182, 130 130 T 208 130"
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle className="cw-core-pulse" cx="130" cy="130" r="7" fill={accent} />
              </g>
            )}

            {archetype === 'focus' && (
              <g className="cw-arch-focus">
                <circle
                  className="cw-aperture-outer"
                  cx="130"
                  cy="130"
                  r="68"
                  stroke={accent}
                  strokeWidth="1.5"
                  strokeDasharray="14 8"
                />
                <circle
                  className="cw-aperture-inner"
                  cx="130"
                  cy="130"
                  r="40"
                  stroke={accent}
                  strokeWidth="1.8"
                  strokeDasharray="8 6"
                />
                <circle className="cw-core-pulse" cx="130" cy="130" r="11" fill={accent} />
              </g>
            )}

            {archetype === 'barrier' && (
              <g className="cw-arch-barrier">
                <path
                  className="cw-shield-arc"
                  d="M 152 72 A 64 64 0 0 1 152 188"
                  stroke={accent}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle className="cw-impact-orb" cx="104" cy="130" r="12" fill={accent} fillOpacity="0.85" />
                <circle
                  className="cw-impact-wave"
                  cx="134"
                  cy="130"
                  r="28"
                  stroke={accent}
                  strokeWidth="1.4"
                  strokeOpacity="0.5"
                />
              </g>
            )}
          </svg>
        </>
      )}
    </div>
  )
}
