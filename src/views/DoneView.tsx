import { useEffect } from 'react'

type DoneViewProps = {
  onMore: () => void
  onBack: () => void
}

export function DoneView({ onMore, onBack }: DoneViewProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onMore()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onMore])

  return (
    <section className="cw-sheet" aria-label="好了">
      <h1 className="cw-done-line">今天好了</h1>
      <div className="cw-done-actions">
        <button type="button" className="cw-cta-primary" onClick={onMore}>
          再来 5 个词
        </button>
        <button type="button" className="cw-cta-quiet" onClick={onBack}>
          回今天
        </button>
      </div>
    </section>
  )
}
