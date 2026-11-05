import { illustrationUrl, videoUrl, type Word } from '../data/types'

export type SceneType =
  | 'cliff_climb'
  | 'harvest_basket'
  | 'tall_pillar'
  | 'river_valley'
  | 'winding_path'
  | 'collapsing_bridge'
  | 'balance_scale'
  | 'open_book'
  | 'sprouting_seed'
  | 'clockwork_system'
  | 'funnel_filter'
  | 'keystone_arch'

function hashWord(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

export function pickConcreteScene(word: Word): SceneType {
  const id = word.id.toLowerCase()
  const hay = `${id} ${word.sceneHook} ${word.senses.map((s) => s.zh).join(' ')}`.toLowerCase()

  if (/(challeng|climb|overcom|effort|struggl|risk|difficult|obstacle|barrier|挑战|攀|克服|困难|阻碍)/.test(hay)) {
    return 'cliff_climb'
  }
  if (/(benefit|reward|gain|profit|yield|resourc|supply|wealth|advantage|益处|好处|收获|资源|供应|利)/.test(hay)) {
    return 'harvest_basket'
  }
  if (/(significant|major|primar|dominant|crucial|essential|peak|outstanding|extreme|显著|重要|主要|突出|极)/.test(hay)) {
    return 'tall_pillar'
  }
  if (/(environment|natur|ecosystem|habitat|landscap|climat|species|forest|river|环境|自然|生态|气候|物种)/.test(hay)) {
    return 'river_valley'
  }
  if (/(approach|method|way|path|route|direction|access|strateg|step|proceed|方法|途径|通道|接近|策略|步)/.test(hay)) {
    return 'winding_path'
  }
  if (/(collapse|fall|declin|drop|damag|destroy|crisis|fail|break|shrink|倒塌|崩溃|下降|跌|毁|减)/.test(hay)) {
    return 'collapsing_bridge'
  }
  if (/(assess|evaluat|compar|balanc|polic|law|authorit|principl|rule|judg|propor|评估|权衡|法律|权威|原则|比例)/.test(hay)) {
    return 'balance_scale'
  }
  if (/(study|research|theor|evidenc|knowledg|interpret|analy|concept|abstract|inform|研究|理论|证据|概念|抽象|解释)/.test(hay)) {
    return 'open_book'
  }
  if (/(grow|develop|emerg|generat|creat|produc|evolv|adapt|maintain|potent|生长|发展|产生|创造|适应|潜)/.test(hay)) {
    return 'sprouting_seed'
  }
  if (/(function|system|structur|mechan|factor|techniqu|operat|involv|requir|process|系统|结构|功能|机制|因素|过程)/.test(hay)) {
    return 'clockwork_system'
  }
  if (/(select|identif|specif|accurat|categor|limit|focus|featur|distinguish|defin|识别|准确|类别|特征|筛选|特定)/.test(hay)) {
    return 'funnel_filter'
  }
  if (/(contribut|support|communit|communicat|cooperat|connect|combin|establish|relat|支持|贡献|社区|连接|建立|合作)/.test(hay)) {
    return 'keystone_arch'
  }

  const all: SceneType[] = [
    'winding_path',
    'open_book',
    'sprouting_seed',
    'clockwork_system',
    'balance_scale',
    'river_valley',
    'harvest_basket',
    'tall_pillar',
    'funnel_filter',
    'keystone_arch',
    'cliff_climb',
    'collapsing_bridge',
  ]
  return all[hashWord(id) % all.length]
}

type WordMotionStageProps = {
  word: Word
  spellInput: string
  passed: boolean
}

export function WordMotionStage({ word, passed }: WordMotionStageProps) {
  const vidSrc = videoUrl(word)
  const illusSrc = illustrationUrl(word)
  const scene = pickConcreteScene(word)
  const accent = word.color || '#243b55'

  return (
    <div
      className={`cw-motion-stage is-scene-${scene}${passed ? ' is-passed' : ''}`}
      style={{ '--cw-word-color': accent } as React.CSSProperties}
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
        </div>
      ) : (
        <svg className="cw-scene-svg" viewBox="0 0 320 400" fill="none">
          {/* Warm editorial paper wash */}
          <rect width="320" height="400" fill="#f3efe6" />
          <ellipse cx="160" cy="210" rx="118" ry="118" fill={accent} fillOpacity="0.06" />

          {scene === 'cliff_climb' && (
            <g className="cw-scene-group">
              {/* Drifting clouds */}
              <g className="cw-scene-cloud">
                <path
                  d="M62 108 H128 C134 108 138 102 132 97 C127 92 118 95 114 89 C108 81 92 82 86 91 C78 90 68 95 62 108 Z"
                  fill="#ffffff"
                  fillOpacity="0.7"
                  stroke="#3a3832"
                  strokeWidth="1.3"
                />
              </g>
              {/* Steep cliff face */}
              <path
                d="M178 64 L268 64 L284 326 L124 326 L146 218 L164 148 Z"
                fill="#d8d2c5"
                stroke="#2c2a25"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M196 64 L182 152 L162 224 L152 326 M228 110 L204 190 L216 280"
                stroke="#2c2a25"
                strokeWidth="1.1"
                strokeOpacity="0.55"
              />
              {/* Ground line */}
              <path d="M36 326 H288" stroke="#2c2a25" strokeWidth="1.8" strokeLinecap="round" />
              {/* Rope */}
              <line
                x1="178"
                y1="68"
                x2="138"
                y2="246"
                stroke="#2c2a25"
                strokeWidth="1.3"
                strokeDasharray="3 3"
              />
              {/* Animated climber ascending */}
              <g className="cw-scene-climber">
                <circle cx="142" cy="214" r="8" fill="#f3efe6" stroke="#2c2a25" strokeWidth="1.8" />
                <path
                  d="M134 224 L150 224 L154 252 L130 252 Z"
                  fill={accent}
                  stroke="#2c2a25"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M148 228 L162 208 M136 252 L130 274 M148 252 L156 270" stroke="#2c2a25" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>
          )}

          {scene === 'harvest_basket' && (
            <g className="cw-scene-group">
              {/* Warm sun rays */}
              <circle className="cw-scene-sun" cx="160" cy="116" r="34" fill="#eab308" fillOpacity="0.22" />
              <circle cx="160" cy="116" r="22" fill="#eab308" fillOpacity="0.35" stroke="#2c2a25" strokeWidth="1.4" />
              {/* Floating harvest fruits */}
              <g className="cw-scene-bob">
                <circle cx="128" cy="204" r="18" fill="#e07a5f" stroke="#2c2a25" strokeWidth="1.6" />
                <circle cx="162" cy="194" r="21" fill="#f2cc8f" stroke="#2c2a25" strokeWidth="1.6" />
                <circle cx="194" cy="206" r="17" fill="#81b29a" stroke="#2c2a25" strokeWidth="1.6" />
                <path d="M162 173 C168 162 180 162 184 170 C174 174 166 174 162 173 Z" fill="#52796f" stroke="#2c2a25" strokeWidth="1.3" />
              </g>
              {/* Woven basket */}
              <path
                d="M86 214 H234 L212 296 C209 306 200 312 190 312 H130 C120 312 111 306 108 296 Z"
                fill="#d4a373"
                fillOpacity="0.55"
                stroke="#2c2a25"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M96 242 H224 M102 270 H218 M134 214 L142 312 M160 214 V312 M186 214 L178 312" stroke="#2c2a25" strokeWidth="1.1" strokeOpacity="0.55" />
              <path d="M52 314 H268" stroke="#2c2a25" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          )}

          {scene === 'tall_pillar' && (
            <g className="cw-scene-group">
              <path d="M44 316 H276" stroke="#2c2a25" strokeWidth="1.8" strokeLinecap="round" />
              <rect x="62" y="252" width="28" height="64" fill="#d6d1c4" stroke="#2c2a25" strokeWidth="1.6" />
              <rect x="104" y="236" width="28" height="80" fill="#d6d1c4" stroke="#2c2a25" strokeWidth="1.6" />
              {/* Towering center pillar */}
              <g className="cw-scene-rise">
                <rect x="146" y="108" width="30" height="208" fill={accent} fillOpacity="0.82" stroke="#2c2a25" strokeWidth="1.8" />
                <circle cx="161" cy="86" r="7" fill={accent} stroke="#2c2a25" strokeWidth="1.5" />
              </g>
              <rect x="190" y="244" width="28" height="72" fill="#d6d1c4" stroke="#2c2a25" strokeWidth="1.6" />
              <rect x="232" y="260" width="28" height="56" fill="#d6d1c4" stroke="#2c2a25" strokeWidth="1.6" />
            </g>
          )}

          {scene === 'river_valley' && (
            <g className="cw-scene-group">
              <circle className="cw-scene-sun" cx="232" cy="102" r="24" fill="#f4a261" fillOpacity="0.45" stroke="#2c2a25" strokeWidth="1.4" />
              {/* Distant hills */}
              <path
                d="M36 248 Q98 168 168 228 T284 218 L284 316 L36 316 Z"
                fill="#cad2c5"
                stroke="#2c2a25"
                strokeWidth="1.6"
              />
              {/* Pine trees */}
              <path d="M82 172 L66 216 H98 Z M82 192 L62 238 H102 Z" fill="#52796f" stroke="#2c2a25" strokeWidth="1.4" />
              <path d="M238 164 L224 204 H252 Z M238 182 L220 224 H256 Z" fill="#52796f" stroke="#2c2a25" strokeWidth="1.4" />
              {/* Winding river */}
              <path
                className="cw-scene-river"
                d="M152 222 C132 246 188 268 142 316 H198 C228 270 168 246 176 222 Z"
                fill="#74b9ff"
                fillOpacity="0.55"
                stroke="#2c2a25"
                strokeWidth="1.5"
              />
              <path d="M36 316 H284" stroke="#2c2a25" strokeWidth="1.8" />
            </g>
          )}

          {scene === 'winding_path' && (
            <g className="cw-scene-group">
              {/* Distant doorway / arch */}
              <path
                d="M134 156 V104 C134 88 186 88 186 104 V156 Z"
                fill="#f6bd60"
                fillOpacity="0.65"
                stroke="#2c2a25"
                strokeWidth="1.8"
              />
              <path d="M44 156 H276" stroke="#2c2a25" strokeWidth="1.5" />
              {/* Winding perspective path */}
              <path
                d="M144 156 C122 204 188 242 104 324 H216 C234 242 162 204 176 156 Z"
                fill="#e6ccb2"
                stroke="#2c2a25"
                strokeWidth="1.8"
              />
              {/* Animated footsteps / lantern */}
              <circle className="cw-scene-step-1" cx="160" cy="282" r="5" fill={accent} />
              <circle className="cw-scene-step-2" cx="166" cy="238" r="4.5" fill={accent} />
              <circle className="cw-scene-step-3" cx="156" cy="196" r="4" fill={accent} />
            </g>
          )}

          {scene === 'collapsing_bridge' && (
            <g className="cw-scene-group">
              {/* Left & right bridge piers */}
              <path d="M36 186 H122 L134 206 L112 218 H82 V296 H44 V186 Z" fill="#cbbfa9" stroke="#2c2a25" strokeWidth="1.8" />
              <path d="M284 186 H198 L186 206 L208 218 H238 V296 H276 V186 Z" fill="#cbbfa9" stroke="#2c2a25" strokeWidth="1.8" />
              {/* Falling masonry stones */}
              <g className="cw-scene-debris">
                <rect x="138" y="192" width="18" height="12" transform="rotate(24 138 192)" fill="#d63031" stroke="#2c2a25" strokeWidth="1.5" />
                <rect x="166" y="210" width="16" height="11" transform="rotate(-18 166 210)" fill="#cbbfa9" stroke="#2c2a25" strokeWidth="1.5" />
                <rect x="148" y="236" width="14" height="10" transform="rotate(35 148 236)" fill="#d63031" stroke="#2c2a25" strokeWidth="1.5" />
              </g>
              {/* Water surface */}
              <path d="M32 296 H288" stroke="#2c2a25" strokeWidth="1.8" />
              <path className="cw-scene-bob" d="M84 312 H236 M112 326 H208" stroke="#2c2a25" strokeWidth="1.3" strokeOpacity="0.6" strokeLinecap="round" />
            </g>
          )}

          {scene === 'balance_scale' && (
            <g className="cw-scene-group">
              <path d="M64 316 H256" stroke="#2c2a25" strokeWidth="1.8" />
              <path d="M136 316 L160 292 L184 316 Z" fill="#b5a895" stroke="#2c2a25" strokeWidth="1.8" />
              <line x1="160" y1="112" x2="160" y2="292" stroke="#2c2a25" strokeWidth="2.4" />
              <g className="cw-scene-scale-beam">
                <line x1="84" y1="146" x2="236" y2="146" stroke="#2c2a25" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M84 146 L68 216 H100 Z" fill="none" stroke="#2c2a25" strokeWidth="1.3" />
                <path d="M62 216 C62 228 106 228 106 216 Z" fill={accent} fillOpacity="0.65" stroke="#2c2a25" strokeWidth="1.6" />
                <path d="M236 146 L220 216 H252 Z" fill="none" stroke="#2c2a25" strokeWidth="1.3" />
                <path d="M214 216 C214 228 258 228 258 216 Z" fill="#e9c46a" fillOpacity="0.75" stroke="#2c2a25" strokeWidth="1.6" />
              </g>
              <circle cx="160" cy="146" r="6" fill="#f3efe6" stroke="#2c2a25" strokeWidth="1.8" />
            </g>
          )}

          {scene === 'open_book' && (
            <g className="cw-scene-group">
              {/* Warm study lamp glow */}
              <path d="M160 78 L82 260 H238 Z" fill="#f6bd60" fillOpacity="0.16" />
              <path d="M136 78 H184 L172 58 H148 Z" fill={accent} stroke="#2c2a25" strokeWidth="1.6" />
              {/* Open hardcover book */}
              <g className="cw-scene-bob">
                <path
                  d="M68 216 C98 206 134 210 160 224 C186 210 222 206 252 216 V296 C222 286 186 290 160 304 C134 290 98 286 68 296 Z"
                  fill="#faf7f0"
                  stroke="#2c2a25"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <line x1="160" y1="224" x2="160" y2="304" stroke="#2c2a25" strokeWidth="1.6" />
                <path d="M88 240 H142 M88 258 H138 M88 276 H132 M178 240 H232 M178 258 H228 M178 276 H222" stroke="#2c2a25" strokeWidth="1.3" strokeOpacity="0.6" strokeLinecap="round" />
              </g>
            </g>
          )}

          {scene === 'sprouting_seed' && (
            <g className="cw-scene-group">
              <path d="M64 316 H256" stroke="#2c2a25" strokeWidth="1.8" />
              {/* Terracotta pot */}
              <path d="M114 232 H206 L192 316 H128 Z" fill="#e07a5f" fillOpacity="0.72" stroke="#2c2a25" strokeWidth="1.8" strokeLinejoin="round" />
              <rect x="106" y="218" width="108" height="16" rx="3" fill="#e07a5f" stroke="#2c2a25" strokeWidth="1.8" />
              {/* Growing stem & leaves */}
              <g className="cw-scene-grow">
                <path d="M160 218 V122" stroke="#2d6a4f" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M160 176 C126 172 114 146 136 136 C154 142 160 162 160 176 Z" fill="#52b788" stroke="#2c2a25" strokeWidth="1.6" />
                <path d="M160 152 C194 148 206 122 184 112 C166 118 160 138 160 152 Z" fill="#74c69d" stroke="#2c2a25" strokeWidth="1.6" />
              </g>
            </g>
          )}

          {scene === 'clockwork_system' && (
            <g className="cw-scene-group">
              <g className="cw-scene-gear-1">
                <circle cx="132" cy="184" r="42" fill="#d4a373" fillOpacity="0.45" stroke="#2c2a25" strokeWidth="1.8" strokeDasharray="12 6" />
                <circle cx="132" cy="184" r="28" fill="#f3efe6" stroke="#2c2a25" strokeWidth="1.6" />
                <circle cx="132" cy="184" r="10" fill={accent} stroke="#2c2a25" strokeWidth="1.5" />
              </g>
              <g className="cw-scene-gear-2">
                <circle cx="198" cy="236" r="32" fill={accent} fillOpacity="0.35" stroke="#2c2a25" strokeWidth="1.8" strokeDasharray="10 5" />
                <circle cx="198" cy="236" r="20" fill="#f3efe6" stroke="#2c2a25" strokeWidth="1.6" />
                <circle cx="198" cy="236" r="7" fill="#d4a373" stroke="#2c2a25" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {scene === 'funnel_filter' && (
            <g className="cw-scene-group">
              {/* Unsorted top particles */}
              <g className="cw-scene-debris">
                <circle cx="122" cy="104" r="6" fill="#a8a29e" stroke="#2c2a25" strokeWidth="1.4" />
                <circle cx="160" cy="96" r="7" fill={accent} stroke="#2c2a25" strokeWidth="1.4" />
                <circle cx="196" cy="108" r="6" fill="#a8a29e" stroke="#2c2a25" strokeWidth="1.4" />
              </g>
              {/* Glass funnel */}
              <path
                d="M92 132 H228 L172 214 V268 H148 V214 Z"
                fill="#e0fbfc"
                fillOpacity="0.55"
                stroke="#2c2a25"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Filtered pure drop */}
              <circle className="cw-scene-drop" cx="160" cy="296" r="8" fill={accent} stroke="#2c2a25" strokeWidth="1.6" />
              <path d="M112 324 H208" stroke="#2c2a25" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )}

          {scene === 'keystone_arch' && (
            <g className="cw-scene-group">
              <path d="M48 316 H272" stroke="#2c2a25" strokeWidth="1.8" />
              {/* Left & right stone arch pillars */}
              <path d="M72 316 V196 C72 152 104 126 138 120 L144 154 C120 160 104 176 104 198 V316 Z" fill="#d6d1c4" stroke="#2c2a25" strokeWidth="1.8" />
              <path d="M248 316 V196 C248 152 216 126 182 120 L176 154 C200 160 216 176 216 198 V316 Z" fill="#d6d1c4" stroke="#2c2a25" strokeWidth="1.8" />
              {/* Keystone lowering into place */}
              <g className="cw-scene-keystone">
                <path d="M140 112 H180 L172 154 H148 Z" fill={accent} stroke="#2c2a25" strokeWidth="1.8" strokeLinejoin="round" />
              </g>
            </g>
          )}
        </svg>
      )}
    </div>
  )
}
