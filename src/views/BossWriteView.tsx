import { useEffect, useRef, useState } from 'react'
import { primaryZh, type Word } from '../data/words'
import { gradeTranslation, type GradeResult } from '../lib/grader'
import { highlightLexeme } from './LexiconStageView'

type BossWriteProps = {
  words: Word[]
  onComplete: (results: { wordId: string; ok: boolean }[]) => void
}

function maskTargetInSentence(sentence: string, word: Word): string {
  const candidates = new Set<string>([word.word, ...(word.variants ?? [])])
  if (word.word.length >= 5) {
    if (word.word.endsWith('e') || word.word.endsWith('y')) {
      candidates.add(word.word.slice(0, -1))
    }
  }
  const stems = Array.from(candidates)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (!stems.length) return sentence
  const regex = new RegExp(`\\b(?:${stems.join('|')})\\w*`, 'gi')
  return sentence.replace(regex, '_______')
}

export function BossWriteView({ words, onComplete }: BossWriteProps) {
  const [cursor, setCursor] = useState(0)
  const [draft, setDraft] = useState('')
  const [verdict, setVerdict] = useState<GradeResult | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [log, setLog] = useState<{ wordId: string; ok: boolean }[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const currentWord = words[cursor]

  useEffect(() => {
    if (!verdict) inputRef.current?.focus()
  }, [cursor, verdict])

  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if (verdict && e.key === 'Enter') {
        e.preventDefault()
        advanceStep()
      }
    }
    window.addEventListener('keydown', onGlobalKey)
    return () => window.removeEventListener('keydown', onGlobalKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verdict, cursor, log, currentWord])

  function advanceStep() {
    if (!verdict) return
    const nextLog = [...log, { wordId: currentWord.id, ok: verdict.ok }]
    setLog(nextLog)
    setVerdict(null)
    setDraft('')
    setShowHint(false)
    if (cursor + 1 >= words.length) {
      onComplete(nextLog)
    } else {
      setCursor(cursor + 1)
    }
  }

  function handleSubmit() {
    if (verdict) {
      advanceStep()
      return
    }
    setVerdict(gradeTranslation(draft, currentWord.word, currentWord.variants ?? []))
  }

  const example = currentWord.examples[0]

  return (
    <section className="cw-card" aria-label="默写">
      <div className="cw-card-top">
        <span>默写</span>
        <span>
          {cursor + 1} / {words.length}
        </span>
      </div>

      <p className="cw-kicker">按中文写出英文</p>
      <h1 className="cw-prompt-zh">{primaryZh(currentWord)}</h1>

      {example && (
        <div className="cw-cloze">
          <p className="cw-example-en">
            {verdict
              ? highlightLexeme(example.en, currentWord)
              : maskTargetInSentence(example.en, currentWord)}
          </p>
          <p className="cw-example-zh">{example.zh}</p>
        </div>
      )}

      <p className="cw-label">
        {showHint || verdict ? (
          <>
            {currentWord.sceneHook} · 首字母 {currentWord.word[0]} · {currentWord.word.length} 个字母
          </>
        ) : (
          <button
            type="button"
            className="cw-text-btn"
            onClick={() => {
              setShowHint(true)
              inputRef.current?.focus()
            }}
          >
            提示
          </button>
        )}
      </p>

      <div className={`cw-field ${verdict ? (verdict.ok ? 'is-ok' : 'is-bad') : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="cw-input"
          value={draft}
          disabled={!!verdict}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="英文"
          aria-label="英文拼写"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              handleSubmit()
            }
          }}
        />
        <span className="cw-counter">
          {draft.trim().length}/{currentWord.word.length}
        </span>
      </div>

      {verdict && (
        <div className={`cw-feedback ${verdict.ok ? 'is-ok' : 'is-bad'}`}>
          <p>
            {verdict.feedback}
            {!verdict.ok && (
              <>
                {' '}
                <strong>{verdict.correct}</strong> {currentWord.ipa}
              </>
            )}
          </p>
        </div>
      )}

      <div className="cw-actions">
        <button type="button" className="cw-btn" onClick={handleSubmit}>
          <span>
            {verdict ? (cursor + 1 >= words.length ? '完成' : '下一题') : '提交'}
          </span>
          <kbd className="cw-kbd">Enter</kbd>
        </button>
      </div>
    </section>
  )
}
