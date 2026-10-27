import { useEffect } from 'react'
import { WORDS } from '../data/words'
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !canStart) return
      const active = document.activeElement
      if (active instanceof HTMLElement && active.dataset.noEnter === 'true') return
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
      e.preventDefault()
      onStartStage(progress.todayDone)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canStart, onStartStage, progress.todayDone])

  return (
    <section className="cw-today" aria-label="今日">
      <header className="cw-top">
        <div className="cw-brand">
          <span className="cw-brand-name">ClawWords</span>
          <span className="cw-brand-sub">词私教 Lab</span>
        </div>
        <button type="button" className="cw-pill" data-no-enter="true" onClick={onOpenSettings}>
          设置
        </button>
      </header>

      <h1 className="cw-h1">{progress.todayDone ? '今日已完成' : '今日'}</h1>

      <div className="cw-stats">
        <div className="cw-stat">
          <span>到期复习</span>
          <strong>{due.length}</strong>
        </div>
        <div className="cw-stat">
          <span>计划新词</span>
          <strong>{upcomingNew.length}</strong>
        </div>
        <div className="cw-stat">
          <span>已学 / 词库</span>
          <strong>
            {progress.learnedIds.length}/{WORDS.length}
          </strong>
        </div>
      </div>

      <p className="cw-flowline">
        {progress.todayDone
          ? '今天的计划做完了。还可以再学 5 个。'
          : !canStart
            ? `${WORDS.length} 个词都学完了。`
            : due.length > 0
              ? `先复习 ${due.length} 个，再学 ${upcomingNew.length} 个新词。每 5 词后测验。`
              : '流程：复习 → 新词 → 每 5 词测验。约 8–12 分钟。'}
      </p>

      <button
        type="button"
        className="cw-btn cw-btn-block"
        disabled={!canStart}
        onClick={() => onStartStage(progress.todayDone)}
      >
        {progress.todayDone ? '再来 5 词' : '开始'}
      </button>

      {!progress.todayDone && due.length === 0 && (
        <button type="button" className="cw-quiet" data-no-enter="true" onClick={onSeedDueDemo}>
          加入 2 个复习词
        </button>
      )}
    </section>
  )
}
