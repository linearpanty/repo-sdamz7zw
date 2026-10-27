type DoneViewProps = {
  onBack: () => void
}

export function DoneView({ onBack }: DoneViewProps) {
  return (
    <section className="cw-sheet" aria-label="好了">
      <h1 className="cw-done-line">今天好了</h1>
      <button type="button" className="cw-cta-primary" onClick={onBack}>
        回今天
      </button>
    </section>
  )
}
