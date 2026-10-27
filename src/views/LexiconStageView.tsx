import { useEffect, useState, type ReactNode } from 'react'
import type { Word } from '../data/words'
import { gradeTranslation } from '../lib/grader'
import { LemmaRow } from './LemmaRow'

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
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setDraft('')
    setError('')
  }, [word.id])

  function commitTyping() {
    const res = gradeTranslation(draft, word.word, word.variants ?? [])
    if (!res.ok) {
      setError(draft.trim() ? '不对，再写一次' : '先输入这个词')
      return
    }
    onAdvance()
  }

  return (
    <article className="cw-folio" aria-label={word.word}>
      <aside className="cw-scene">
        <span className="cw-scene-label">画面</span>
        <p className="cw-scene-hook">{word.sceneHook}</p>
      </aside>

      <div className="cw-dossier">
        <div className="cw-dossier-top">
          <span className="cw-badge">{modeLabel}</span>
          <span className="cw-progress">{subProgressLabel}</span>
        </div>

        <LemmaRow word={word.word} ipa={word.ipa} />
        {word.variants && word.variants.length > 0 && (
          <p className="cw-variants">{word.variants.slice(0, 3).join(' · ')}</p>
        )}

        <div className="cw-senses">
          {word.senses.map((s, idx) => (
            <p key={idx} className="cw-sense">
              {s.pos && <span className="cw-pos">{s.pos}</span>}
              <span>{s.zh}</span>
            </p>
          ))}
        </div>

        <section>
          <h2 className="cw-label">例句</h2>
          <div className="cw-examples">
            {word.examples.map((ex, idx) => (
              <div key={idx} className="cw-example">
                <p className="cw-example-en">{highlightLexeme(ex.en, word)}</p>
                <p className="cw-example-zh">{ex.zh}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="cw-label">搭配</h2>
          <div className="cw-chips">
            {word.collocations.map((col) => (
              <span key={col} className="cw-chip">
                {highlightLexeme(col, word)}
              </span>
            ))}
          </div>
        </section>

        <label className="cw-spell">
          <span className="cw-label">再写一遍</span>
          <input
            type="text"
            className="cw-input"
            value={draft}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="输入这个词"
            aria-label="输入这个词"
            onChange={(e) => {
              setDraft(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitTyping()
              }
            }}
          />
        </label>
        {error && <p className="cw-spell-error">{error}</p>}
        <button type="button" className="cw-btn cw-btn-block" onClick={commitTyping}>
          <span>{nextButtonText}</span>
          <kbd className="cw-kbd">Enter</kbd>
        </button>
      </div>
    </article>
  )
}
