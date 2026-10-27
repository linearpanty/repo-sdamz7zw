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
  const wrongCount = Math.max(0, totalChecks - correctCount)

  return (
    <section className="cw-stamp-shell" aria-label="通关日签">
      <article className="cw-daystamp-card">
        {/* Top Certificate Header */}
        <header className="cw-daystamp-top">
          <div>
            <span className="cw-stamp-badge is-gold">
              {mode === 'daily' ? '今日主线完成' : '加练短关完成'}
            </span>
            <h1 className="cw-daystamp-title">本关词卡已结算</h1>
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
            <span className="cw-metric-label">检定正确率</span>
          </div>
          <div className="cw-metric-cell">
            <span className="cw-metric-val">{sessionWords.length}</span>
            <span className="cw-metric-label">本关词数</span>
          </div>
          <div className="cw-metric-cell">
            <span className="cw-metric-val">
              {correctCount}
              <small>/{totalChecks}</small>
            </span>
            <span className="cw-metric-label">选义与默写通过</span>
          </div>
        </div>

        {/* Concise Fact + Next Step Note (<= 25 chars) */}
        <blockquote className="cw-tutor-voice cw-signoff-quote">
          {wrongCount === 0 ? (
            <>正确率 {accuracy}%，本关全部通过，可休息或加练 5 词。</>
          ) : (
            <>正确率 {accuracy}%，答错的 {wrongCount} 题已加入待温故。</>
          )}
        </blockquote>

        {/* Session Word Roster */}
        {sessionWords.length > 0 && (
          <div className="cw-roster-block">
            <div className="cw-section-header">
              <span className="cw-section-kicker">
                本关词条 ({sessionWords.length})
              </span>
              <span className="cw-section-hint">
                已掌握 {totalMastered}/{lexiconSize}
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
                <kbd className="cw-kbd-hint">+5</kbd>
              </button>
            )}
            <button type="button" className="cw-cta-secondary cw-cta-wide" onClick={onHome}>
              <span>返回今日一关</span>
            </button>
          </div>

          <div className="cw-daystamp-meta-strip">
            <span>{todayKey}</span>
            <span>ClawWords · 词卡</span>
          </div>
        </footer>
      </article>
    </section>
  )
}
