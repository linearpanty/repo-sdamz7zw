import { useEffect, type ReactNode } from 'react'
import type { Word } from '../data/words'

type LexiconStageProps = {
  word: Word
  modeLabel: string
  subProgressLabel: string
  isReview?: boolean
  nextButtonText: string
  onAdvance: () => void
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightLexeme(text: string, word: Word): ReactNode {
  const candidates = new Set<string>([word.word, ...(word.variants ?? [])])
  if (word.word.length >= 5) {
    if (word.word.endsWith('e') || word.word.endsWith('y')) {
      candidates.add(word.word.slice(0, -1))
    }
  }

  const stems = Array.from(candidates)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)

  if (stems.length === 0) return text

  const pattern = new RegExp(`(\\b(?:${stems.join('|')})\\w*)`, 'gi')
  const segments = text.split(pattern)

  return segments.map((seg, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="cw-mark">
        {seg}
      </mark>
    ) : (
      seg
    ),
  )
}

export function LexiconStageView({
  word,
  modeLabel,
  subProgressLabel,
  nextButtonText,
  onAdvance,
}: LexiconStageProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAdvance])

  return (
    <article className="cw-card" aria-label={word.word}>
      <div className="cw-card-top">
        <span>{modeLabel}</span>
        <span>{subProgressLabel}</span>
      </div>

      <h1 className="cw-headword">{word.word}</h1>
      <p className="cw-ipa">
        {word.ipa}
        {word.variants && word.variants.length > 0 ? `  ${word.variants.slice(0, 3).join(' · ')}` : ''}
      </p>

      <div className="cw-senses">
        {word.senses.map((s, idx) => (
          <p key={idx} className="cw-sense">
            {s.pos && <span className="cw-pos">{s.pos}</span>}
            {s.zh}
          </p>
        ))}
      </div>

      <p className="cw-label">画面</p>
      <p className="cw-hook">{word.sceneHook}</p>

      <p className="cw-label">例句</p>
      {word.examples.map((ex, idx) => (
        <div key={idx} className="cw-example">
          <p className="cw-example-en">{highlightLexeme(ex.en, word)}</p>
          <p className="cw-example-zh">{ex.zh}</p>
        </div>
      ))}

      <p className="cw-label">搭配</p>
      <div className="cw-chips">
        {word.collocations.map((col) => (
          <span key={col} className="cw-chip">
            {highlightLexeme(col, word)}
          </span>
        ))}
      </div>

      <div className="cw-actions">
        <button type="button" className="cw-btn" onClick={onAdvance}>
          <span>{nextButtonText}</span>
          <kbd className="cw-kbd">Enter</kbd>
        </button>
      </div>
    </article>
  )
}
