import { useEffect } from 'react'
import type { Progress } from '../lib/model'

type TodayViewProps = {
  progress: Progress
  onStart: () => void
}

export function TodayView({ progress, onStart }: TodayViewProps) {
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

  return (
    <section className="cw-sheet" aria-label="今天">
      <h1 className="cw-brand-zh">ClawWords</h1>
      <p className="cw-status">{quiet ? '今天好了' : `还有 ${remaining} 个词`}</p>
      <button type="button" className="cw-cta-primary" onClick={onStart}>
        {label}
      </button>
    </section>
  )
}
