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
    if (!verdict) {
      inputRef.current?.focus()
    }
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
    const res = gradeTranslation(draft, currentWord.word, currentWord.variants ?? [])
    setVerdict(res)
  }

  const example = currentWord.examples[0]
  const posList = currentWord.senses
    .map((s) => s.pos)
    .filter(Boolean)
    .join(' / ')

  return (
    <section
      className="cw-quiz-stage cw-boss-stage"
      style={{ '--cw-word-accent': currentWord.color } as React.CSSProperties}
      aria-label="中译英 Boss 检定"
    >
      <header className="cw-quiz-header">
        <div className="cw-quiz-top-row">
          <span className="cw-phase-pill is-boss">
            BOSS STAGE · 中译英主动提取
          </span>
          <div className="cw-step-dots" aria-label={`第 ${cursor + 1} 题，共 ${words.length} 题`}>
            {words.map((w, idx) => {
              let dotState = 'is-upcoming'
              if (idx < cursor) {
                dotState = log[idx]?.ok ? 'is-done-ok' : 'is-done-err'
              } else if (idx === cursor) {
                dotState = 'is-current'
              }
              return <span key={w.id} className={`cw-mini-node ${dotState}`} />
            })}
            <span className="cw-subprogress-mono">
              {cursor + 1} / {words.length}
            </span>
          </div>
        </div>

        <div className="cw-boss-prompt-card">
          <div className="cw-boss-kicker">
            <span>请根据中文词义与语境，拼写对应英文单词</span>
            {posList && <span className="cw-pos-tag">{posList}</span>}
          </div>

          <h1 className="cw-boss-zh-prompt">{primaryZh(currentWord)}</h1>

          {example && (
            <div className="cw-cloze-box">
              <p className="cw-cloze-en">
                {verdict
                  ? highlightLexeme(example.en, currentWord)
                  : maskTargetInSentence(example.en, currentWord)}
              </p>
              <p className="cw-cloze-zh">{example.zh}</p>
            </div>
          )}

          <div className="cw-boss-hint-row">
            {showHint || verdict ? (
              <div className="cw-hint-revealed">
                <span>画面钩子：“{currentWord.sceneHook}”</span>
                <span>·</span>
                <span>
                  首字母 <strong>{currentWord.word[0]}</strong>（{currentWord.word.length} 个字母）
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="cw-inline-link"
                onClick={() => {
                  setShowHint(true)
                  inputRef.current?.focus()
                }}
              >
                需要一点线索？查看画面钩子与首字母
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="cw-boss-input-zone">
        <div className={`cw-spelling-shell ${verdict ? (verdict.ok ? 'is-ok' : 'is-bad') : ''}`}>
          <span className="cw-input-prefix">EN &gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="cw-spelling-input"
            value={draft}
            disabled={!!verdict}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="输入英文单词，按 Enter 交卷…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.stopPropagation()
                handleSubmit()
              }
            }}
          />
          <span className="cw-char-counter">
            {draft.trim().length}/{currentWord.word.length}
          </span>
        </div>

        {verdict && (
          <div className={`cw-tutor-verdict ${verdict.ok ? 'is-ok' : 'is-bad'}`}>
            <div className="cw-verdict-headline">
              <span>{verdict.ok ? '✓ ' : '✗ '}</span>
              <span>{verdict.feedback}</span>
              {!verdict.ok && (
                <span className="cw-verdict-expected">
                  标准拼写：<strong>{verdict.correct}</strong>{' '}
                  <span className="cw-ipa-inline">{currentWord.ipa}</span>
                </span>
              )}
            </div>
            {verdict.ok && (
              <p className="cw-verdict-sub">
                标准词形：<strong>{currentWord.word}</strong> {currentWord.ipa} — 主动提取通过！
              </p>
            )}
          </div>
        )}

        <button type="button" className="cw-cta-primary cw-cta-wide" onClick={handleSubmit}>
          <span>
            {verdict
              ? cursor + 1 >= words.length
                ? '签收本关战报'
                : '下一题'
              : '提交拼写检定'}
          </span>
          <kbd className="cw-kbd-hint">Enter ↵</kbd>
        </button>
      </div>
    </section>
  )
}
