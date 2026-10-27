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
  const remainingUnlearned = WORDS.length - progress.learnedIds.length
  const canStart = due.length > 0 || upcomingNew.length > 0
  const [hoveredWord, setHoveredWord] = useState<Word | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canStart) {
        const active = document.activeElement
        if (active && (active.tagName === 'BUTTON' || active.tagName === 'INPUT')) {
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

  return (
    <section className="cw-desk-layout" aria-label="今日词卡便签">
      <article className="cw-tutor-sheet">
        <div className="cw-sheet-pin" aria-hidden="true">
          <span className="cw-pin-brass" />
        </div>

        <header className="cw-sheet-header">
          <div className="cw-sheet-meta">
            <span className="cw-stamp-badge">
              {progress.todayDone ? '今日已完赛' : '今日一关'}
            </span>
            <time className="cw-date-mono">{progress.todayKey}</time>
          </div>
          <button
            type="button"
            className="cw-ghost-chip"
            data-no-enter="true"
            onClick={onOpenSettings}
          >
            案头设置 · {progress.settings.dailyNewCount}词/关
          </button>
        </header>

        <div className="cw-sheet-body">
          <h1 className="cw-sheet-title">
            {progress.todayDone
              ? `今日主线已完成${progress.extraRounds > 0 ? `（已加练 ${progress.extraRounds} 关）` : ''}`
              : due.length > 0
                ? '先温故，再知新'
                : '今日一关'}
          </h1>

          <blockquote className="cw-tutor-voice">
            {progress.todayDone ? (
              <>今日主线已完成，可随时加练 <strong>5 个新词</strong>。</>
            ) : due.length > 0 ? (
              <>
                先复习 <strong>{due.length} 个到期词</strong>，再学 <strong>{upcomingNew.length} 个新词</strong>。
              </>
            ) : (
              <>
                今天 <strong>{upcomingNew.length} 个新词</strong>，每 5 个测一次。
              </>
            )}
          </blockquote>

          {/* Two-part Agenda: 温故 & 知新 */}
          <div className="cw-agenda-stack">
            {/* Step 1: Due Review */}
            <div className={`cw-agenda-card ${due.length > 0 ? 'is-priority' : 'is-clear'}`}>
              <div className="cw-agenda-left">
                <div className="cw-agenda-step-tag">
                  <span className="cw-step-index">01</span>
                  <span className="cw-step-name">温故 · 回忆默写</span>
                </div>
                <p className="cw-agenda-desc">
                  {due.length > 0
                    ? '看释义与画面提示，手打默写过关'
                    : '今日无到期词'}
                </p>

                {due.length > 0 ? (
                  <div className="cw-word-pill-row">
                    {due.slice(0, 6).map((w) => (
                      <span key={w.id} className="cw-mini-word-pill is-due">
                        {w.word}
                      </span>
                    ))}
                    {due.length > 6 && (
                      <span className="cw-mini-word-pill">+{due.length - 6}</span>
                    )}
                  </div>
                ) : (
                  <div className="cw-agenda-helper">
                    <button
                      type="button"
                      className="cw-inline-link"
                      data-no-enter="true"
                      onClick={onSeedDueDemo}
                    >
                      + 放入 2 个演示到期词
                    </button>
                  </div>
                )}
              </div>

              <div className="cw-agenda-right">
                <span className="cw-agenda-number">{due.length}</span>
                <span className="cw-agenda-unit">待温故</span>
              </div>
            </div>

            {/* Step 2: New Words + Boss Check */}
            <div
              className={`cw-agenda-card ${
                due.length === 0 && upcomingNew.length > 0 ? 'is-priority' : ''
              }`}
            >
              <div className="cw-agenda-left">
                <div className="cw-agenda-step-tag">
                  <span className="cw-step-index">02</span>
                  <span className="cw-step-name">
                    {progress.todayDone ? '加练 · 图鉴与默写' : '知新 · 图鉴与 Boss 检定'}
                  </span>
                </div>
                <p className="cw-agenda-desc">
                  {upcomingNew.length > 0
                    ? `共 ${upcomingNew.length} 词，每 5 词做选义与中译英默写`
                    : '全部 50 词已学完'}
                </p>

                {upcomingNew.length > 0 && (
                  <div className="cw-word-pill-row">
                    {upcomingNew.slice(0, 5).map((w) => (
                      <span key={w.id} className="cw-mini-word-pill">
                        {w.word}
                      </span>
                    ))}
                    {upcomingNew.length > 5 && (
                      <span className="cw-mini-word-pill is-muted">
                        …共 {upcomingNew.length} 词
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="cw-agenda-right">
                <span className="cw-agenda-number">{upcomingNew.length}</span>
                <span className="cw-agenda-unit">本关新词</span>
              </div>
            </div>
          </div>

          {/* Primary Action Bar */}
          <div className="cw-sheet-actions">
            <button
              type="button"
              className="cw-cta-primary cw-cta-wide"
              disabled={!canStart}
              onClick={() => onStartStage(progress.todayDone)}
            >
              <span>
                {!canStart
                  ? '词库已全部通关'
                  : progress.todayDone
                    ? '再来一关（5 词加练）'
                    : due.length > 0
                      ? `开始今日一关（温故 ${due.length} 词 + 知新 ${upcomingNew.length} 词）`
                      : `开始今日一关（${upcomingNew.length} 词）`}
              </span>
              {canStart && <kbd className="cw-kbd-hint">Enter ↵</kbd>}
            </button>

            {!canStart && (
              <p className="cw-footnote">
                内置 {WORDS.length} 词已全部掌握，可在「案头设置」重置进度。
              </p>
            )}
          </div>
        </div>

        {/* Bottom Perforated Ticket Stub: 50-Word Lexicon Cartography */}
        <footer className="cw-sheet-stub">
          <div className="cw-stub-header">
            <div className="cw-stub-title">
              <span>词库矩阵</span>
              <strong>
                已掌握 {progress.learnedIds.length} / {WORDS.length} 词
              </strong>
            </div>
            <div className="cw-stub-legend">
              <span>
                <i className="cw-dot is-learned" /> 已掌握 ({progress.learnedIds.length})
              </span>
              <span>
                <i className="cw-dot is-due" /> 待温故 ({due.length})
              </span>
              <span>
                <i className="cw-dot is-locked" /> 待解锁 ({remainingUnlearned})
              </span>
            </div>
          </div>

          <div
            className="cw-atlas-grid"
            onMouseLeave={() => setHoveredWord(null)}
            role="list"
            aria-label="50词掌握矩阵"
          >
            {WORDS.map((w, idx) => {
              const isDue = dueSet.has(w.id)
              const isLearned = learnedSet.has(w.id)
              const statusCls = isDue ? 'is-due' : isLearned ? 'is-learned' : 'is-locked'
              return (
                <button
                  key={w.id}
                  type="button"
                  role="listitem"
                  data-no-enter="true"
                  className={`cw-atlas-cell ${statusCls}`}
                  onMouseEnter={() => setHoveredWord(w)}
                  onFocus={() => setHoveredWord(w)}
                  onClick={() => setHoveredWord(w)}
                  title={`${idx + 1}. ${w.word} — ${primaryZh(w)}`}
                  aria-label={`${w.word} ${isDue ? '待温故' : isLearned ? '已掌握' : '待解锁'}`}
                />
              )
            })}
          </div>

          <div className="cw-atlas-inspector">
            {hoveredWord ? (
              <div className="cw-inspector-line">
                <span className="cw-inspector-word">{hoveredWord.word}</span>
                <span className="cw-inspector-ipa">{hoveredWord.ipa}</span>
                <span className="cw-inspector-zh">{primaryZh(hoveredWord)}</span>
                <span className="cw-inspector-hook">“{hoveredWord.sceneHook}”</span>
              </div>
            ) : (
              <div className="cw-inspector-placeholder">
                点击或悬停上方方格，预览词条与画面提示
              </div>
            )}
          </div>
        </footer>
      </article>
    </section>
  )
}
