import { useEffect } from 'react'
import type { Word } from '../data/types'
import { speakWord } from '../lib/audio'
import { maskWordHint } from '../lib/grader'
import type { CardMode, Progress } from '../lib/model'

type TodayViewProps = {
  progress: Progress
  doneWords?: Word[]
  queueWords?: Array<{ word: Word; mode: CardMode }>
  onStart: () => void
}

export function TodayView({
  progress,
  doneWords = [],
  queueWords = [],
  onStart,
}: TodayViewProps) {
  const remaining = progress.queue.length
  const quiet = progress.finished || remaining === 0
  const label = quiet ? '再来 5 个词' : progress.started ? '继续' : '开始'

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onStart])

  const hasSlip = doneWords.length > 0 || queueWords.length > 0

  return (
    <section className="cw-sheet cw-sheet-slip" aria-label="今天">
      <div className="cw-slip-head">
        <h1 className="cw-brand-zh">ClawWords</h1>
        <p className="cw-status">{quiet ? '今天好了' : `还有 ${remaining} 个词`}</p>
      </div>

      {hasSlip && (
        <ul className="cw-done-list" aria-label="今日词笺">
          {doneWords.slice(-progress.dailyCount).map((w) => (
            <li key={`done-${w.id}`} className="cw-done-item">
              <button
                type="button"
                className="cw-done-word-btn is-done"
                onClick={() => speakWord(w.word, w.id)}
              >
                <span className="cw-slip-check" aria-hidden="true">
                  ✓
                </span>
                <span className="cw-done-en">{w.word}</span>
                <span className="cw-done-ipa">{w.ipa}</span>
                <span className="cw-done-zh">{w.senses[0]?.zh ?? ''}</span>
              </button>
            </li>
          ))}
          {queueWords.map(({ word: w, mode }) => (
            <li key={`queue-${w.id}`} className="cw-done-item">
              <button
                type="button"
                className="cw-done-word-btn"
                onClick={() => speakWord(w.word, w.id)}
              >
                <span className="cw-slip-dot" aria-hidden="true">
                  ·
                </span>
                <span className="cw-done-en">
                  {mode === 'learn' ? w.word : maskWordHint(w.word)}
                </span>
                {mode === 'learn' && <span className="cw-done-ipa">{w.ipa}</span>}
                <span className="cw-done-zh">{w.senses[0]?.zh ?? ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="cw-cta-primary cw-cta-wide" onClick={onStart}>
        {label}
      </button>
    </section>
  )
}
