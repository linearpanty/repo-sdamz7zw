import { useEffect } from 'react'
import type { Word } from '../data/types'
import { speakWord } from '../lib/audio'

type DoneViewProps = {
  words?: Word[]
  onMore: () => void
  onBack: () => void
}

export function DoneView({ words = [], onMore, onBack }: DoneViewProps) {
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
      {words.length > 0 && (
        <ul className="cw-done-list" aria-label="今日词单">
          {words.map((w) => (
            <li key={w.id} className="cw-done-item">
              <button
                type="button"
                className="cw-done-word-btn"
                onClick={() => speakWord(w.word, w.id)}
              >
                <span className="cw-done-en">{w.word}</span>
                <span className="cw-done-ipa">{w.ipa}</span>
                <span className="cw-done-zh">{w.senses[0]?.zh ?? ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
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
