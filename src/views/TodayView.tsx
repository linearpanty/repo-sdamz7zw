import type { Progress } from '../lib/model'

type TodayViewProps = {
  progress: Progress
  onStart: () => void
}

export function TodayView({ progress, onStart }: TodayViewProps) {
  const remaining = progress.queue.length
  const quiet = progress.finished || remaining === 0
  const label = progress.started ? '继续' : '开始'

  return (
    <section className="cw-sheet" aria-label="今天">
      <p className="cw-brand-en">ClawWords</p>
      <h1 className="cw-brand-zh">词卡</h1>
      <p className="cw-status">{quiet ? '今天好了' : `还有 ${remaining} 个词`}</p>
      {!quiet && (
        <button type="button" className="cw-cta-primary" onClick={onStart}>
          {label}
        </button>
      )}
    </section>
  )
}
