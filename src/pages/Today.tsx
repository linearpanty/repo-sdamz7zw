import type { Progress } from '../lib/storage'
import { dueWords, pickNewWords } from '../lib/session'
import { WORDS } from '../data/words'

type Props = {
  progress: Progress
  onStart: () => void
  onSettings: () => void
}

export function Today({ progress, onStart, onSettings }: Props) {
  const due = dueWords(progress)
  const remaining = WORDS.length - progress.learnedIds.length
  const newCount = Math.min(progress.settings.dailyNewCount, pickNewWords(progress, 99).length)

  return (
    <div className="stage-card">
      <div className="screen">
        <header className="topbar">
          <div>
            <div className="brand">ClawWords</div>
            <div className="fine">词私教 Lab</div>
          </div>
          <button type="button" className="btn ghost sm" onClick={onSettings}>
            设置
          </button>
        </header>

        <div className="today-header">
          <div className="badge">{progress.todayDone ? '今日已结课' : '今日一关'}</div>
          <h1>今日</h1>
        </div>

        <div className="cards" role="region" aria-label="今日学习概览">
          <div className={due.length > 0 ? 'stat active' : 'stat'}>
            <span className="label">到期复习</span>
            <strong>{due.length}</strong>
          </div>
          <div className={due.length === 0 && newCount > 0 ? 'stat active' : 'stat'}>
            <span className="label">计划新词</span>
            <strong>{newCount}</strong>
          </div>
          <div className="stat">
            <span className="label">已学 / 词库</span>
            <strong>
              {progress.learnedIds.length}/{WORDS.length}
            </strong>
          </div>
        </div>

        <p className="tutor-greeting">
          {progress.todayDone
            ? '今日主线已安静收官。现在合上页面休息即可；若想顺手巩固，可再加练一关（5 词）。'
            : '流程：复习 → 新词跟打 → 每 5 词选义与中译英检定。约 8–12 分钟。'}
        </p>

        <button
          type="button"
          className="btn primary block"
          onClick={onStart}
          disabled={remaining === 0 && due.length === 0}
        >
          {progress.todayDone ? '再来一关（5 词）' : '开始'}
        </button>

        {remaining === 0 && due.length === 0 && (
          <p className="fine">词库已全部掌握（共 {WORDS.length} 词）。可在设置中清除进度重新开始。</p>
        )}
      </div>
    </div>
  )
}
