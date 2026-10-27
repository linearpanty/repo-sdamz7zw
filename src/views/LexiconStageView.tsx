import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { captionRevealsHeadword, illustrationUrl, type Word } from '../data/words'
import { gradeExact, maskWordHint } from '../lib/grader'

type LexiconStageProps = {
  word: Word
  modeLabel: string
  subProgressLabel: string
  isReview?: boolean
  nextButtonText: string
  onAdvance: () => void
}

let activeAudio: HTMLAudioElement | null = null

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof Audio === 'undefined') {
      reject(new Error('HTMLAudioElement unavailable'))
      return
    }
    if (activeAudio) {
      activeAudio.pause()
      activeAudio = null
    }
    const audio = new Audio(url)
    activeAudio = audio
    let settled = false
    const onOk = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const onErr = (err: unknown) => {
      if (settled) return
      settled = true
      reject(err)
    }
    audio.addEventListener('error', () => onErr(new Error(`Audio error: ${url}`)), {
      once: true,
    })
    audio.addEventListener('playing', onOk, { once: true })
    const p = audio.play()
    if (p !== undefined) {
      p.then(onOk).catch(onErr)
    }
  })
}

function speakWithWebSpeech(text: string): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    const voices = window.speechSynthesis.getVoices?.() ?? []
    const enVoice =
      voices.find((v) => v.lang === 'en-US') ??
      voices.find((v) => v.lang.startsWith('en'))
    if (enVoice) utter.voice = enVoice
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  } catch {
    // Web Speech API unavailable or blocked in environment
  }
}

export function speakWord(text: string, id?: string): void {
  const cleanId = (id ?? text).trim().toLowerCase()
  const localUrl = import.meta.env.BASE_URL + 'audio/us/' + cleanId + '.mp3'
  const remoteUrl = `https://0xlei.tech/words/atlas/audio/us/${cleanId}.mp3`

  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  } catch {
    // ignore
  }

  playAudioUrl(localUrl)
    .catch(() => playAudioUrl(remoteUrl))
    .catch(() => {
      speakWithWebSpeech(text)
    })
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
  const [spellInput, setSpellInput] = useState('')
  const [attempted, setAttempted] = useState(false)
  const spellInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setSpellInput('')
    setAttempted(false)
    spellInputRef.current?.focus()
  }, [word.id])

  const trimmed = spellInput.trim()

  const grade = useMemo(
    () => gradeExact(spellInput, word.word),
    [spellInput, word.word],
  )

  const isPassed = Boolean(trimmed) && grade.ok

  const showMismatch =
    !isPassed &&
    ((attempted && !grade.ok) ||
      (trimmed.length >= word.word.length && !grade.ok))

  function handleAdvance() {
    if (!isPassed) {
      setAttempted(true)
      spellInputRef.current?.focus()
      return
    }
    onAdvance()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      const active = document.activeElement
      if (active === spellInputRef.current) return
      if (active && (active.tagName === 'BUTTON' || active.tagName === 'INPUT')) {
        return
      }
      e.preventDefault()
      if (isPassed) {
        onAdvance()
      } else {
        setAttempted(true)
        spellInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPassed, onAdvance])

  const initialGlyph = word.word.slice(0, 2).toUpperCase()
  const hintMask = maskWordHint(word.word)
  const illusSrc = illustrationUrl(word)
  const showCaption = !isReview || !captionRevealsHeadword(word)

  return (
    <article
      className="cw-lexicon-folio"
      style={{ '--cw-word-accent': word.color } as CSSProperties}
      aria-label={isReview ? '温故默写' : `词条图鉴 ${word.word}`}
    >
      {/* Left / Top Illustrated Gallery Poster Frame (>= 240px height) */}
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

            {/* Engraved Botanical / Atlas Specimen Line Art */}
            <svg
              className="cw-poster-art-svg"
              viewBox="0 0 260 260"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="130"
                cy="130"
                r="96"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <circle cx="130" cy="130" r="68" stroke="currentColor" strokeWidth="0.75" />
              <line x1="20" y1="130" x2="240" y2="130" stroke="currentColor" strokeWidth="0.6" />
              <line x1="130" y1="20" x2="130" y2="240" stroke="currentColor" strokeWidth="0.6" />
            </svg>

            {!isReview && (
              <div className="cw-poster-glyph" aria-hidden="true">
                {initialGlyph}
              </div>
            )}
          </>
        )}

        <div className="cw-poster-top-rail">
          <span className="cw-poster-reg">视觉锚点</span>
        </div>

        {showCaption && (
          <div className="cw-poster-centerpiece">
            {!illusSrc && (
              <span className="cw-quote-mark" aria-hidden="true">
                “
              </span>
            )}
            <p className="cw-poster-hook">{highlightLexeme(word.sceneHook, word)}</p>
            {!illusSrc && (
              <div className="cw-poster-caption">
                <span
                  className="cw-poster-swatch"
                  style={{ backgroundColor: word.color }}
                  aria-hidden="true"
                />
                <span>先记画面，再记词义</span>
              </div>
            )}
          </div>
        )}

        {!illusSrc && (
          <div className="cw-poster-bottom-rail">
            {!isReview && (
              <span className="cw-poster-watermark" aria-hidden="true">
                {word.word}
              </span>
            )}
          </div>
        )}
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
            {isReview ? (
              <div className="cw-headword-row headword-row">
                <span className="cw-review-recall-title">请凭释义、画面与发音默写</span>
                <button
                  type="button"
                  className="cw-btn-speak btn-speak"
                  onClick={() => speakWord(word.word, word.id)}
                  aria-label="朗读发音"
                >
                  朗读
                </button>
              </div>
            ) : (
              <>
                <div className="cw-headword-row headword-row">
                  <h1 className="cw-headword-serif headword">{word.word}</h1>
                  <span className="cw-ipa-pill ipa">{word.ipa}</span>
                  <button
                    type="button"
                    className="cw-btn-speak btn-speak"
                    onClick={() => speakWord(word.word, word.id)}
                    aria-label={`朗读 ${word.word}`}
                  >
                    朗读
                  </button>
                </div>
                {word.variants && word.variants.length > 0 && (
                  <div className="cw-phonetic-row">
                    <span className="cw-variants-line" title="常见词形变化">
                      变形：{word.variants.slice(0, 3).join(' · ')}
                    </span>
                  </div>
                )}
              </>
            )}
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

        {isReview ? (
          <section className="cw-section-block" aria-label="画面提示">
            <div className="cw-section-header">
              <span className="cw-section-kicker">画面提示</span>
              <span className="cw-section-hint">听音或看画面回忆拼写</span>
            </div>
            <div className="cw-example-slate">
              {showCaption ? (
                <p className="cw-example-en">“{word.sceneHook}”</p>
              ) : (
                <p className="cw-example-en">看左侧画面回忆拼写</p>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Context Spotlight Examples */}
            <section className="cw-section-block" aria-label="语境例句">
              <div className="cw-section-header">
                <span className="cw-section-kicker">语境例句</span>
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
            <section className="cw-section-block" aria-label="常用搭配">
              <div className="cw-section-header">
                <span className="cw-section-kicker">常用搭配</span>
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
          </>
        )}

        {/* Hand-type English Spelling Gate (MUST pass before advancing) */}
        <section className="cw-spell-gate spell-gate" aria-label="手打英文拼写过关">
          <div className="cw-spell-gate-header spell-gate-header">
            <label className="cw-section-kicker sec-label" htmlFor="word-spell-input">
              手打拼写
            </label>
            <span className="cw-spell-hint spell-hint">拼对后解锁下一个</span>
          </div>
          <div
            className={`cw-spell-input-shell ${
              isPassed ? 'is-ok' : showMismatch ? 'is-bad' : ''
            }`}
          >
            <input
              ref={spellInputRef}
              id="word-spell-input"
              type="text"
              className={`cw-spell-input input spell-input ${
                isPassed ? 'is-ok' : showMismatch ? 'is-bad' : ''
              }`}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={spellInput}
              placeholder="手打这个词，Enter 确认"
              onChange={(e) => {
                setSpellInput(e.target.value)
                if (attempted) setAttempted(false)
              }}
              onBlur={() => {
                if (trimmed.length > 0 && !isPassed) {
                  setAttempted(true)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdvance()
                }
              }}
            />
            <span className="cw-spell-char-count" aria-hidden="true">
              {trimmed.length}/{word.word.length}
            </span>
          </div>
          {isPassed && (
            <div className="cw-spell-feedback feedback ok compact" role="status">
              ✓ 拼写正确，可进入下一词
            </div>
          )}
          {showMismatch && (
            <div className="cw-spell-feedback feedback bad compact" role="status">
              提示：{hintMask}
            </div>
          )}
        </section>

        {/* Action Bar */}
        <footer className="cw-dossier-footer">
          <button
            type="button"
            className="cw-cta-primary cw-cta-wide"
            disabled={!isPassed}
            onClick={handleAdvance}
          >
            <span>{nextButtonText}</span>
            <kbd className="cw-kbd-hint">Enter ↵</kbd>
          </button>
        </footer>
      </div>
    </article>
  )
}
