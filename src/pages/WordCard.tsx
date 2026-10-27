import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type { Word } from '../data/words'
import { gradeTranslation } from '../lib/grader'

type Props = {
  word: Word
  badge?: string
  onNext: () => void
  onBackHome?: () => void
  nextLabel?: string
}

export function speakWord(text: string): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  } catch {
    // Web Speech API unavailable or blocked in environment
  }
}

function highlightTarget(sentence: string, target: string): ReactNode {
  const escaped = target.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (!escaped) return sentence
  const regex = new RegExp(`(\\b${escaped}\\w*)`, 'gi')
  const parts = sentence.split(regex)
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark className="hl" key={idx}>
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function WordCardView({ word, badge, onNext, onBackHome, nextLabel = '下一个' }: Props) {
  const [spellInput, setSpellInput] = useState('')
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    setSpellInput('')
    setAttempted(false)
  }, [word.id])

  const trimmed = spellInput.trim()

  const grade = useMemo(
    () => gradeTranslation(spellInput, word.word, word.variants ?? []),
    [spellInput, word.word, word.variants],
  )

  // Exact/variant match or full-length fuzzy match unlocks immediately; shorter fuzzy match unlocks when submitted
  const isPassed =
    Boolean(trimmed) &&
    grade.ok &&
    (grade.feedback !== '形态接近，算对' ||
      trimmed.length >= word.word.length ||
      attempted)

  const showMismatch =
    !isPassed &&
    ((attempted && !grade.ok) ||
      (trimmed.length >= word.word.length && !grade.ok))

  function handleAdvance() {
    if (!isPassed) {
      setAttempted(true)
      return
    }
    onNext()
  }

  return (
    <div className="screen">
      <div className="card-topbar">
        {badge ? <div className="badge">{badge}</div> : <span />}
        {onBackHome && (
          <button type="button" className="btn-link" onClick={onBackHome}>
            返回今日
          </button>
        )}
      </div>

      <div
        className="illus"
        style={{ '--word-color': word.color } as CSSProperties}
      >
        <div className="illus-meta">
          <span className="illus-dot" style={{ backgroundColor: word.color }} />
          <span className="illus-caption">画面锚点</span>
        </div>
        <p className="hook">{word.sceneHook}</p>
        <span className="illus-watermark" aria-hidden="true">
          {word.word}
        </span>
      </div>

      <div className="word-header">
        <div className="headword-row">
          <h1 className="headword">{word.word}</h1>
          <span className="ipa">{word.ipa}</span>
          <button
            type="button"
            className="btn-speak"
            onClick={() => speakWord(word.word)}
            aria-label={`朗读 ${word.word}`}
          >
            朗读
          </button>
        </div>
      </div>

      <ul className="senses">
        {word.senses.map((s, i) => (
          <li key={i}>
            {s.pos && <em>{s.pos}</em>}
            <span>{s.zh}</span>
          </li>
        ))}
      </ul>

      <section className="card-section">
        <h3 className="sec-label">例句</h3>
        {word.examples.map((ex, i) => (
          <div className="ex" key={i}>
            <div className="ex-en">{highlightTarget(ex.en, word.word)}</div>
            <div className="ex-zh">{ex.zh}</div>
          </div>
        ))}
      </section>

      <section className="card-section">
        <h3 className="sec-label">搭配</h3>
        <div className="tags">
          {word.collocations.map((c) => (
            <span className="tag" key={c}>
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="spell-gate">
        <div className="spell-gate-header">
          <label className="sec-label" htmlFor="word-spell-input">
            手打英文拼写过关
          </label>
          <span className="spell-hint">拼对后解锁下一个</span>
        </div>
        <input
          id="word-spell-input"
          type="text"
          className={`input spell-input ${isPassed ? 'is-ok' : showMismatch ? 'is-bad' : ''}`}
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          value={spellInput}
          placeholder={`手打输入 ${word.word}…`}
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
        {isPassed && (
          <div className="feedback ok compact" role="status">
            ✓ 拼写正确（{grade.feedback}），可进入下一个
          </div>
        )}
        {showMismatch && (
          <div className="feedback bad compact" role="status">
            {trimmed
              ? `还差一点，请对照词头重新拼写：${word.word}`
              : `请先手打输入英文单词：${word.word}`}
          </div>
        )}
      </section>

      <button
        type="button"
        className="btn primary block"
        disabled={!isPassed}
        onClick={handleAdvance}
      >
        {nextLabel}
      </button>
    </div>
  )
}
