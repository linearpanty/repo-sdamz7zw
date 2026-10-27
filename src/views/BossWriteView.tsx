import { useEffect, useRef, useState } from 'react'
import { primaryZh, type Word } from '../data/words'
import { gradeTranslation, type GradeResult } from '../lib/grader'
import { highlightLexeme } from './LexiconStageView'
import { LemmaRow } from './LemmaRow'

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
  const nextRef = useRef<HTMLButtonElement | null>(null)

  const currentWord = words[cursor]

  useEffect(() => {
    if (verdict?.ok) nextRef.current?.focus()
    else inputRef.current?.focus()
  }, [cursor, verdict])

  function advanceStep() {
    if (!verdict?.ok) return
    const nextLog = [...log, { wordId: currentWord.id, ok: true }]
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
    if (verdict?.ok) {
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
                {verdict?.ok
                  ? highlightLexeme(example.en, currentWord)
                  : maskTargetInSentence(example.en, currentWord)}
              </p>
          <p className="cw-example-zh">{example.zh}</p>
        </div>
      )}

      <p className="cw-label">
        {showHint ? (
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
          disabled={!!verdict?.ok}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="英文"
          aria-label="英文拼写"
          onChange={(e) => {
            setDraft(e.target.value)
            if (verdict && !verdict.ok) setVerdict(null)
          }}
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

      {verdict?.ok && (
        <div className="cw-feedback is-ok">
          <LemmaRow word={currentWord.word} ipa={currentWord.ipa} />
          <p>对。</p>
        </div>
      )}
      {verdict && !verdict.ok && <p className="cw-spell-error">不对，再写一次</p>}

      <div className="cw-actions">
        <button ref={nextRef} type="button" className="cw-btn cw-btn-block" onClick={handleSubmit}>
          <span>
            {verdict?.ok ? (cursor + 1 >= words.length ? '完成' : '下一个') : '提交'}
          </span>
          <kbd className="cw-kbd">Enter</kbd>
        </button>
      </div>
    </section>
  )
}
