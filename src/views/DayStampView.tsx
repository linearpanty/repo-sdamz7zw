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
    <section className="cw-sheet cw-sheet-pad" aria-label="完成">
      <p className="cw-kicker">
        {todayKey}
        {mode === 'extra' ? ' · 加练' : ''}
      </p>
      <h1 className="cw-title">完成</h1>
      <p className="cw-lead">记在本机了。已学 {totalMastered} / {lexiconSize}。</p>

      <div className="cw-stats">
        <div className="cw-stat">
          <span>命中率</span>
          <strong>{accuracy}%</strong>
        </div>
        <div className="cw-stat">
          <span>本关</span>
          <strong>{sessionWords.length}</strong>
        </div>
        <div className="cw-stat">
          <span>做对</span>
          <strong>
            {correctCount}/{totalChecks}
          </strong>
        </div>
      </div>

      {sessionWords.length > 0 && (
        <>
          <p className="cw-label">本关的词</p>
          <div className="cw-roster">
            {sessionWords.map((w) => (
              <div key={w.id} className="cw-roster-item">
                <strong>{w.word}</strong>
                <span>{w.ipa}</span>
                <p className="cw-roster-zh">{primaryZh(w)}</p>
                <p className="cw-roster-hook">{w.sceneHook}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="cw-actions">
        {canMore && (
          <button type="button" className="cw-btn" onClick={onMore}>
            再来 5 词
          </button>
        )}
        <button type="button" className="cw-btn-ghost" onClick={onHome}>
          回今日
        </button>
      </div>
    </section>
  )
}
