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
    if (word.word.endsWith('e')) {
      candidates.add(word.word.slice(0, -1))
    } else if (word.word.endsWith('y')) {
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
      <mark key={i} className="cw-target-hl">
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
  isReview = false,
  nextButtonText,
  onAdvance,
}: LexiconStageProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onAdvance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAdvance])

  const initialGlyph = word.word.slice(0, 2).toUpperCase()

  return (
    <article
      className="cw-lexicon-folio"
      style={{ '--cw-word-accent': word.color } as React.CSSProperties}
      aria-label={`词条图鉴 ${word.word}`}
    >
      {/* Left / Top Gallery Poster Frame (>= 240px height) */}
      <div className="cw-poster-frame">
        <div className="cw-poster-glow" aria-hidden="true" />
        <div className="cw-poster-grid-overlay" aria-hidden="true" />

        <div className="cw-poster-top-rail">
          <span className="cw-poster-reg">
            FIG // {word.id.slice(0, 6).toUpperCase()}
          </span>
          <span className="cw-poster-reg">SCENE HOOK · 视觉锚点</span>
        </div>

        <div className="cw-poster-glyph" aria-hidden="true">
          {initialGlyph}
        </div>

        <div className="cw-poster-centerpiece">
          <span className="cw-quote-mark" aria-hidden="true">
            “
          </span>
          <p className="cw-poster-hook">{word.sceneHook}</p>
          <div className="cw-poster-caption">
            <span>直觉画面锚点</span>
            <span className="cw-caption-sep">·</span>
            <span>先记画面，再读释义</span>
          </div>
        </div>

        <div className="cw-poster-bottom-rail">
          <span className="cw-poster-watermark" aria-hidden="true">
            {word.word}
          </span>
          <span className="cw-poster-color-code">{word.color.toUpperCase()}</span>
        </div>
      </div>

      {/* Right / Bottom Linguistic Dossier */}
      <div className="cw-dossier-pane">
        <header className="cw-dossier-header">
          <div className="cw-dossier-badges">
            <span className={`cw-phase-pill ${isReview ? 'is-review' : 'is-learn'}`}>
              {modeLabel}
            </span>
            <span className="cw-subprogress-mono">{subProgressLabel}</span>
          </div>

          <div className="cw-headword-block">
            <h1 className="cw-headword-serif">{word.word}</h1>
            <div className="cw-phonetic-row">
              <span className="cw-ipa-pill">{word.ipa}</span>
              {word.variants && word.variants.length > 0 && (
                <span className="cw-variants-line" title="常见词形变化">
                  变形：{word.variants.slice(0, 3).join(' · ')}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Core Senses */}
        <section className="cw-senses-box" aria-label="核心释义">
          {word.senses.map((s, idx) => (
            <div key={idx} className="cw-sense-row">
              {s.pos && <span className="cw-pos-tag">{s.pos}</span>}
              <span className="cw-sense-zh">{s.zh}</span>
            </div>
          ))}
        </section>

        {/* Context Spotlight Examples */}
        <section className="cw-section-block" aria-label="语境例句">
          <div className="cw-section-header">
            <span className="cw-section-kicker">CONTEXT SPOTLIGHT · 语境真句</span>
            <span className="cw-section-hint">重点词已高亮</span>
          </div>
          <div className="cw-examples-stack">
            {word.examples.map((ex, idx) => (
              <div key={idx} className="cw-example-slate">
                <p className="cw-example-en">{highlightLexeme(ex.en, word)}</p>
                <p className="cw-example-zh">{ex.zh}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Collocations */}
        <section className="cw-section-block" aria-label="高频搭配">
          <div className="cw-section-header">
            <span className="cw-section-kicker">COLLOCATIONS · 地道搭配</span>
            <span className="cw-section-hint">连词成块记忆</span>
          </div>
          <div className="cw-colloc-rack">
            {word.collocations.map((col) => (
              <span key={col} className="cw-colloc-chip">
                {highlightLexeme(col, word)}
              </span>
            ))}
          </div>
        </section>

        {/* Action Bar */}
        <footer className="cw-dossier-footer">
          <button
            type="button"
            className="cw-cta-primary cw-cta-wide"
            onClick={onAdvance}
          >
            <span>{nextButtonText}</span>
            <kbd className="cw-kbd-hint">Space / Enter ↵</kbd>
          </button>
        </footer>
      </div>
    </article>
  )
}
