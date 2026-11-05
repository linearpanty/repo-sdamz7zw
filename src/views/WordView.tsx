import { useEffect, useRef, useState, type ReactNode } from 'react'
import { illustrationUrl, type Word } from '../data/types'
import { speakWord } from '../lib/audio'
import { gradeExact, maskWordHint } from '../lib/grader'
import type { CardMode } from '../lib/model'

export type SessionCapsule = {
  id: string
  word: string
  status: 'done' | 'current' | 'upcoming'
  mode: CardMode
}

type WordViewProps = {
  word: Word
  mode: CardMode
  index: number
  total: number
  canReplay: boolean
  capsules?: SessionCapsule[]
  onAdvance: (hadMiss: boolean) => void
  onExit: () => void
}

function SpeakIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.5 9.5h3.2L12 6.2v11.6l-4.3-3.3H4.5v-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 9.2a3.6 3.6 0 0 1 0 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.6 7a6.4 6.4 0 0 1 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildLexemeRegex(word: Word): RegExp | null {
  const candidates = new Set<string>([word.word, ...(word.variants ?? [])])
  if (word.word.length >= 5 && (word.word.endsWith('e') || word.word.endsWith('y'))) {
    candidates.add(word.word.slice(0, -1))
  }
  const stems = [...candidates].filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRegExp)
  if (stems.length === 0) return null
  return new RegExp(`(\\b(?:${stems.join('|')})\\w*)`, 'gi')
}

function highlightLexeme(text: string, word: Word): ReactNode {
  const pattern = buildLexemeRegex(word)
  if (!pattern) return text
  return text.split(pattern).map((seg, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="cw-target-hl">
        {seg}
      </mark>
    ) : (
      seg
    ),
  )
}

function maskLexemeInSentence(text: string, word: Word): ReactNode {
  const pattern = buildLexemeRegex(word)
  if (!pattern) return text
  const maskLabel = `${word.word[0] ?? ''}${'_'.repeat(Math.max(3, word.word.length - 1))}`
  return text.split(pattern).map((seg, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="cw-target-hl cw-target-mask">
        {maskLabel}
      </mark>
    ) : (
      seg
    ),
  )
}

export function WordView({
  word,
  mode,
  index,
  total,
  canReplay,
  capsules = [],
  onAdvance,
  onExit,
}: WordViewProps) {
  const [spellInput, setSpellInput] = useState('')
  const [missed, setMissed] = useState(false)
  const [tried, setTried] = useState(false)
  const [missCount, setMissCount] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const advancedRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  const learn = mode === 'learn'
  const passed = gradeExact(spellInput, word.word).ok
  const revealed = missCount >= 2
  const showHead = learn || passed || revealed
  const showCaption = learn || revealed
  const illusSrc = illustrationUrl(word)
  const example = word.examples[0]
  const collocations = (word.collocations ?? []).slice(0, 3)
  const fraction = `${index}/${total}`
  const finishing = total - index === 0 && !(missed && canReplay)
  const nextLabel = finishing ? '完成今天' : '下一词'

  useEffect(() => {
    if (learn) {
      speakWord(word.word, word.id)
    }
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [learn, word.id, word.word])

  function triggerAdvance(hadMiss: boolean) {
    if (advancedRef.current) return
    advancedRef.current = true
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onAdvance(hadMiss)
  }

  function noteMiss() {
    if (spellInput.trim() || !learn) {
      const nextCount = missCount + 1
      setMissed(true)
      setTried(true)
      setMissCount(nextCount)
      if (nextCount === 2) {
        speakWord(word.word, word.id)
      }
    }
    inputRef.current?.focus()
  }

  function commit() {
    if (passed) triggerAdvance(missed)
    else noteMiss()
  }

  return (
    <div className="cw-folio-wrap">
      <div className="cw-word-bar">
        <button type="button" className="cw-word-brand" onClick={onExit}>
          ClawWords
        </button>
        {capsules.length > 0 && (
          <div className="cw-capsule-strip" aria-label="今日进度">
            {capsules.map((cap, idx) => {
              const display =
                cap.status === 'done'
                  ? `✓ ${cap.word}`
                  : cap.mode === 'learn'
                    ? cap.word
                    : `${cap.word[0] ?? ''}···`
              return (
                <button
                  key={`${cap.id}-${idx}`}
                  type="button"
                  className={`cw-capsule-pill is-${cap.status}`}
                  onClick={() => {
                    if (cap.status === 'done' || cap.mode === 'learn') {
                      speakWord(cap.word, cap.id)
                    }
                  }}
                >
                  {display}
                </button>
              )
            })}
          </div>
        )}
        <span className="cw-count" aria-label={fraction}>
          {fraction}
        </span>
      </div>
      <div
        className="cw-flow-rail"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={Math.max(1, total)}
        aria-valuenow={index}
        aria-valuetext={fraction}
      >
        <div
          className="cw-flow-beam"
          style={{ width: `${Math.min(100, (index / Math.max(1, total)) * 100)}%` }}
        />
      </div>

      <article className="cw-lexicon-folio" aria-label="词">
        <div className={`cw-poster-frame${illusSrc ? ' has-illus' : ''}`}>
          {illusSrc ? (
            <img
              className="cw-poster-photo"
              src={illusSrc}
              alt=""
              width={640}
              height={800}
              draggable={false}
            />
          ) : (
            <>
              <div className="cw-poster-grid-overlay" aria-hidden="true" />
              <svg className="cw-poster-art-svg" viewBox="0 0 260 260" fill="none" aria-hidden="true">
                <circle cx="130" cy="130" r="96" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
                <circle cx="130" cy="130" r="68" stroke="currentColor" strokeWidth="0.75" />
                <line x1="20" y1="130" x2="240" y2="130" stroke="currentColor" strokeWidth="0.6" />
                <line x1="130" y1="20" x2="130" y2="240" stroke="currentColor" strokeWidth="0.6" />
              </svg>
            </>
          )}
          {showCaption && (
            <div className="cw-poster-centerpiece">
              <p className="cw-poster-hook">{highlightLexeme(word.sceneHook, word)}</p>
            </div>
          )}
        </div>

        <div className="cw-dossier-pane">
          <header className="cw-headword-block">
            {showHead ? (
              <div className="cw-headword-row headword-row">
                <h1 className="cw-headword-serif headword">{word.word}</h1>
                <span className="cw-ipa-pill ipa">{word.ipa}</span>
                <button
                  type="button"
                  className="cw-btn-speak btn-speak"
                  onClick={() => speakWord(word.word, word.id)}
                  aria-label="听发音"
                >
                  <SpeakIcon />
                </button>
              </div>
            ) : (
              <div className="cw-headword-row headword-row">
                <h1 className="cw-sr">词</h1>
                <button
                  type="button"
                  className="cw-btn-speak btn-speak"
                  onClick={() => speakWord(word.word, word.id)}
                  aria-label="听发音"
                >
                  <SpeakIcon />
                </button>
              </div>
            )}
          </header>

          <section className={`cw-senses-box${learn ? '' : ' is-prompt'}`} aria-label="释义">
            {word.senses.map((sense, idx) => (
              <div key={idx} className="cw-sense-row">
                {sense.pos && <span className="cw-pos-tag">{sense.pos}</span>}
                <span className="cw-sense-zh">{sense.zh}</span>
              </div>
            ))}
          </section>

          {example && (
            <div className="cw-example-slate">
              <p className="cw-example-en">
                {showHead ? highlightLexeme(example.en, word) : maskLexemeInSentence(example.en, word)}
              </p>
              <p className="cw-example-zh">{example.zh}</p>
              {showHead && collocations.length > 0 && (
                <div className="cw-colloc-row" aria-label="常见搭配">
                  {collocations.map((col, idx) => (
                    <span key={idx} className="cw-colloc-chip">
                      {col}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <section className="cw-spell-gate spell-gate">
            <div
              className={`cw-spell-input-shell ${passed ? 'is-ok' : tried && !passed ? 'is-bad' : ''}`}
            >
              <input
                ref={inputRef}
                id="word-spell-input"
                type="text"
                className={`cw-spell-input input spell-input ${
                  passed ? 'is-ok' : tried && !passed ? 'is-bad' : ''
                }`}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                value={spellInput}
                placeholder={learn ? '输入这个词' : maskWordHint(word.word)}
                aria-label="输入这个词"
                onChange={(e) => {
                  const val = e.target.value
                  setSpellInput(val)
                  const isOk = gradeExact(val, word.word).ok
                  if (tried && isOk) setTried(false)
                  if (isOk && !advancedRef.current) {
                    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
                    timerRef.current = window.setTimeout(() => {
                      triggerAdvance(missed)
                    }, 180)
                  }
                }}
                onKeyDown={(e) => {
                  if (learn && e.key === 'Tab' && !spellInput.trim()) {
                    e.preventDefault()
                    triggerAdvance(false)
                    return
                  }
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  commit()
                }}
              />
            </div>
            {tried && !passed && (
              <div className="cw-spell-feedback feedback bad compact" role="status">
                {maskWordHint(word.word)}
              </div>
            )}
          </section>

          <footer className="cw-dossier-footer">
            <button
              type="button"
              className="cw-cta-primary cw-cta-wide"
              disabled={!passed}
              onClick={() => {
                if (passed) triggerAdvance(missed)
              }}
            >
              <span>{nextLabel}</span>
            </button>
            {learn && !passed && (
              <button
                type="button"
                className="cw-skip-known"
                onClick={() => triggerAdvance(false)}
              >
                太熟，直接过
              </button>
            )}
          </footer>
        </div>
      </article>
    </div>
  )
}
