import { useEffect } from 'react'

type ManifestoProps = {
  onEnter: () => void
}

export function ManifestoView({ onEnter }: ManifestoProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onEnter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  return (
    <section className="cw-sheet cw-sheet-pad" aria-label="说明">
      <h1 className="cw-title">说明</h1>
      <p className="cw-lead">每 5 个新词后选一次词义，再按中文默写。进度存在本机。</p>
      <button type="button" className="cw-btn" onClick={onEnter}>
        去今日
        <kbd className="cw-kbd">Enter</kbd>
      </button>
    </section>
  )
}
