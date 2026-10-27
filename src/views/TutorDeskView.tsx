import { useEffect, useState } from 'react'
import { WORDS, primaryZh, type Word } from '../data/words'
import type { Progress } from '../lib/storage'
import { dueWords, pickNewWords } from '../lib/session'

type TutorDeskProps = {
  progress: Progress
  onStartStage: (isExtraRound?: boolean) => void
  onSeedDueDemo: () => void
  onOpenSettings: () => void
}

export function TutorDeskView({
  progress,
  onStartStage,
  onSeedDueDemo,
  onOpenSettings,
}: TutorDeskProps) {
  const due = dueWords(progress)
  const plannedCount = progress.todayDone ? 5 : progress.settings.dailyNewCount
  const upcomingNew = pickNewWords(progress, plannedCount)
  const canStart = due.length > 0 || upcomingNew.length > 0
  const [hoveredWord, setHoveredWord] = useState<Word | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canStart) {
        if (
          document.activeElement?.tagName === 'BUTTON' &&
          document.activeElement.getAttribute('data-no-enter') === 'true'
        ) {
          return
        }
        e.preventDefault()
        onStartStage(progress.todayDone)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canStart, onStartStage, progress.todayDone])

  const learnedSet = new Set(progress.learnedIds)
  const dueSet = new Set(progress.dueIds)

  const lead = !canStart
    ? `${WORDS.length} 个词都学完了。`
    : progress.todayDone
      ? '今天的计划做完了。还可以再学 5 个。'
      : due.length > 0
        ? `先复习 ${due.length} 个，再学 ${upcomingNew.length} 个新词。`
        : `今天学 ${upcomingNew.length} 个新词。每 5 个词后做一次选择和默写。`

  return (
    <section className="cw-sheet" aria-label="今日">
      <header className="cw-sheet-head">
        <div className="cw-sheet-meta">
          <span className="cw-badge">{progress.todayDone ? '已完成' : '今日'}</span>
          <time>{progress.todayKey}</time>
        </div>
        <button type="button" className="cw-text-btn" data-no-enter="true" onClick={onOpenSettings}>
          设置 · {progress.settings.dailyNewCount} 词
        </button>
      </header>

      <div className="cw-sheet-body">
        <h1 className="cw-title">{progress.todayDone ? '今日已完成' : '今日'}</h1>
        <p className="cw-lead">{lead}</p>

        <div className="cw-split">
          <article className={`cw-panel ${due.length > 0 ? 'is-hot' : ''}`}>
            <div className="cw-panel-main">
              <h2>复习</h2>
              {due.length > 0 ? (
                <div className="cw-pills">
                  {due.slice(0, 6).map((w) => (
                    <span key={w.id} className="cw-pill is-due" title={w.ipa}>
                      {w.word}
                      <i>{w.ipa}</i>
                    </span>
                  ))}
                  {due.length > 6 && <span className="cw-pill">+{due.length - 6}</span>}
                </div>
              ) : (
                <button
                  type="button"
                  className="cw-text-btn"
                  data-no-enter="true"
                  onClick={onSeedDueDemo}
                >
                  加入 2 个复习词
                </button>
              )}
            </div>
            <div className="cw-panel-count">
              <strong>{due.length}</strong>
              <span>个</span>
            </div>
          </article>

          <article className={`cw-panel ${due.length === 0 && upcomingNew.length > 0 ? 'is-hot' : ''}`}>
            <div className="cw-panel-main">
              <h2>{progress.todayDone ? '再来' : '新词'}</h2>
              {upcomingNew.length > 0 && (
                <div className="cw-pills">
                  {upcomingNew.slice(0, 5).map((w) => (
                    <span key={w.id} className="cw-pill" title={w.ipa}>
                      {w.word}
                      <i>{w.ipa}</i>
                    </span>
                  ))}
                  {upcomingNew.length > 5 && (
                    <span className="cw-pill is-muted">共 {upcomingNew.length}</span>
                  )}
                </div>
              )}
            </div>
            <div className="cw-panel-count">
              <strong>{upcomingNew.length}</strong>
              <span>个</span>
            </div>
          </article>
        </div>

        <button
          type="button"
          className="cw-btn cw-btn-block"
          disabled={!canStart}
          onClick={() => onStartStage(progress.todayDone)}
        >
          <span>{!canStart ? '没有新词' : progress.todayDone ? '再来 5 词' : '开始'}</span>
          {canStart && <kbd className="cw-kbd">Enter</kbd>}
        </button>
      </div>

      <footer className="cw-atlas">
        <div className="cw-atlas-head">
          <strong>
            已学 {progress.learnedIds.length} / {WORDS.length}
          </strong>
          <div className="cw-legend">
            <span>
              <i className="is-learned" /> 已学
            </span>
            <span>
              <i className="is-due" /> 待复习
            </span>
            <span>
              <i /> 未学
            </span>
          </div>
        </div>
        <div
          className="cw-matrix"
          onMouseLeave={() => setHoveredWord(null)}
          role="list"
          aria-label="词表"
        >
          {WORDS.map((w) => {
            const isDue = dueSet.has(w.id)
            const isLearned = learnedSet.has(w.id)
            const statusCls = isDue ? 'is-due' : isLearned ? 'is-learned' : ''
            return (
              <button
                key={w.id}
                type="button"
                role="listitem"
                data-no-enter="true"
                className={`cw-cell ${statusCls}`}
                onMouseEnter={() => setHoveredWord(w)}
                onFocus={() => setHoveredWord(w)}
                title={`${w.word} ${w.ipa} — ${primaryZh(w)}`}
                aria-label={`${w.word} ${isDue ? '待复习' : isLearned ? '已学' : '未学'}`}
              />
            )
          })}
        </div>
        <div className="cw-peek">
          {hoveredWord ? (
            <>
              <strong>{hoveredWord.word}</strong>
              <span className="cw-peek-ipa">{hoveredWord.ipa}</span>
              <span>{primaryZh(hoveredWord)}</span>
            </>
          ) : (
            '悬停查看'
          )}
        </div>
      </footer>
    </section>
  )
}
