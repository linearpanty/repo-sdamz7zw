import { primaryZh, type Word } from '../data/words'

type DayStampProps = {
  todayKey: string
  mode: 'daily' | 'extra'
  sessionWords: Word[]
  correctCount: number
  totalChecks: number
  totalMastered: number
  lexiconSize: number
  canMore: boolean
  onMore: () => void
  onHome: () => void
}

export function DayStampView({
  todayKey,
  mode,
  sessionWords,
  correctCount,
  totalChecks,
  totalMastered,
  lexiconSize,
  canMore,
  onMore,
  onHome,
}: DayStampProps) {
  const accuracy = totalChecks > 0 ? Math.round((correctCount / totalChecks) * 100) : 100

  return (
    <section className="cw-stamp-shell" aria-label="通关日签战报">
      <article className="cw-daystamp-card">
        {/* Top Perforated Certificate Header */}
        <header className="cw-daystamp-top">
          <div>
            <span className="cw-stamp-badge is-gold">
              {mode === 'daily' ? 'DAILY STAGE CLEAR · 今日主线签收' : 'EXTRA SPRINT CLEAR · 加练短关签收'}
            </span>
            <h1 className="cw-daystamp-title">本关词条已悉数入库</h1>
          </div>

          {/* Embossed Brass Seal SVG */}
          <div className="cw-wax-seal" aria-hidden="true">
            <svg viewBox="0 0 88 88" className="cw-seal-svg">
              <circle
                cx="44"
                cy="44"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle
                cx="44"
                cy="44"
                r="33"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text
                x="44"
                y="38"
                textAnchor="middle"
                fontSize="9"
                fontFamily="monospace"
                letterSpacing="1.5"
                fill="currentColor"
              >
                STAGE
              </text>
              <text
                x="44"
                y="52"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fontFamily="serif"
                letterSpacing="1"
                fill="currentColor"
              >
                CLEAR
              </text>
            </svg>
          </div>
        </header>

        {/* Three Ceremony Metrics */}
        <div className="cw-ceremony-metrics">
          <div className="cw-metric-cell is-highlight">
            <span className="cw-metric-val">{accuracy}%</span>
            <span className="cw-metric-label">综合检定命中率</span>
          </div>
          <div className="cw-metric-cell">
            <span className="cw-metric-val">{sessionWords.length}</span>
            <span className="cw-metric-label">本关精读词条</span>
          </div>
          <div className="cw-metric-cell">
            <span className="cw-metric-val">
              {correctCount}
              <small>/{totalChecks}</small>
            </span>
            <span className="cw-metric-label">选义与默写通过</span>
          </div>
        </div>

        {/* Tutor Sign-Off Note */}
        <blockquote className="cw-tutor-voice cw-signoff-quote">
          {accuracy >= 85 ? (
            <>
              “表现非常扎实。主动提取与拼写检定高分过关，这批词的画面钩子已经稳稳扎进你的直觉里。真正的记忆固化发生在休息时——现在可以安心合上页面；若手感正热，也可以顺手加练 5 词。”
            </>
          ) : (
            <>
              “辛苦了！中译英主动拼写本来就是最硬核的一步，能走完检定本身就已经胜过走马观花刷百词。错题印象往往最深，明天温故时我们再把它们彻底拿下。”
            </>
          )}
        </blockquote>

        {/* Session Conquered Word Roster */}
        {sessionWords.length > 0 && (
          <div className="cw-roster-block">
            <div className="cw-section-header">
              <span className="cw-section-kicker">
                SESSION ARCHIVE · 本关收录清单 ({sessionWords.length})
              </span>
              <span className="cw-section-hint">
                馆藏总进度 {totalMastered}/{lexiconSize}
              </span>
            </div>

            <div className="cw-roster-grid">
              {sessionWords.map((w) => (
                <div key={w.id} className="cw-roster-chip">
                  <div className="cw-roster-chip-top">
                    <strong className="cw-roster-word">{w.word}</strong>
                    <span className="cw-roster-ipa">{w.ipa}</span>
                  </div>
                  <div className="cw-roster-zh">{primaryZh(w)}</div>
                  <div className="cw-roster-hook">“{w.sceneHook}”</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stamp Footer Actions */}
        <footer className="cw-daystamp-footer">
          <div className="cw-daystamp-actions">
            {canMore && (
              <button type="button" className="cw-cta-primary cw-cta-wide" onClick={onMore}>
                <span>再来一关（5 词）</span>
                <kbd className="cw-kbd-hint">+5 Words</kbd>
              </button>
            )}
            <button type="button" className="cw-cta-secondary cw-cta-wide" onClick={onHome}>
              <span>合上书本 · 回今日便签</span>
            </button>
          </div>

          <div className="cw-daystamp-meta-strip">
            <span>DATE STAMP // {todayKey}</span>
            <span>SIGNED BY CLAWWORDS TUTOR</span>
          </div>
        </footer>
      </article>
    </section>
  )
}
