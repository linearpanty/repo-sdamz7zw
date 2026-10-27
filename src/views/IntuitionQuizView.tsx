import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { mcqOptions } from '../lib/session'
import { highlightLexeme, speakWord } from './LexiconStageView'

type IntuitionQuizProps = {
  words: Word[]
  onComplete: (results: { wordId: string; ok: boolean }[]) => void
}

export function IntuitionQuizView({ words, onComplete }: IntuitionQuizProps) {
  const [cursor, setCursor] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [log, setLog] = useState<{ wordId: string; ok: boolean }[]>([])

  const currentWord = words[cursor]
  const choices = useMemo(() => mcqOptions(currentWord), [currentWord])

  function handleNext() {
    if (!selectedId) return
    const isOk = selectedId === currentWord.id
    const updated = [...log, { wordId: currentWord.id, ok: isOk }]
    setLog(updated)
    setSelectedId(null)
    if (cursor + 1 >= words.length) {
      onComplete(updated)
    } else {
      setCursor(cursor + 1)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedId) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleNext()
        }
        return
      }
      const keyNum = Number(e.key)
      if (keyNum >= 1 && keyNum <= 4 && choices[keyNum - 1]) {
        e.preventDefault()
        setSelectedId(choices[keyNum - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, choices, cursor, currentWord, log])

  const isCorrect = selectedId === currentWord.id

  return (
    <section
      className="cw-quiz-stage"
      style={{ '--cw-word-accent': currentWord.color } as React.CSSProperties}
      aria-label="前哨选义检定"
    >
      <header className="cw-quiz-header">
        <div className="cw-quiz-top-row">
          <span className="cw-phase-pill is-mcq">
            CHECKPOINT I · 直觉选义
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

        <div className="cw-quiz-prompt-box">
          <div className="cw-quiz-word-line">
            <h1 className="cw-headword-serif">{currentWord.word}</h1>
            <span className="cw-ipa-pill">{currentWord.ipa}</span>
            <button
              type="button"
              className="cw-btn-speak btn-speak"
              onClick={() => speakWord(currentWord.word)}
              aria-label={`朗读 ${currentWord.word}`}
            >
              朗读
            </button>
          </div>

          <div className={`cw-hook-reveal-bar ${selectedId ? 'is-revealed' : 'is-veiled'}`}>
            {selectedId ? (
              <>
                <span className="cw-hook-tag">画面锚点</span>
                <em className="cw-hook-text">“{currentWord.sceneHook}”</em>
              </>
            ) : (
              <span className="cw-hook-placeholder">
                凭第一直觉锁定词义 · 键盘按 <kbd>1</kbd>–<kbd>4</kbd> 选择
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="cw-keycap-grid" role="group" aria-label="词义选项">
        {choices.map((item, idx) => {
          let stateCls = ''
          if (selectedId) {
            if (item.id === currentWord.id) stateCls = 'is-correct'
            else if (item.id === selectedId) stateCls = 'is-wrong'
            else stateCls = 'is-dimmed'
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`cw-keycap-option ${stateCls}`}
              disabled={!!selectedId}
              onClick={() => setSelectedId(item.id)}
            >
              <kbd className="cw-keycap-badge">{idx + 1}</kbd>
              <span className="cw-option-text">{item.zh}</span>
              {selectedId && item.id === currentWord.id && (
                <span className="cw-option-verdict">✓ 命中</span>
              )}
              {selectedId && item.id === selectedId && item.id !== currentWord.id && (
                <span className="cw-option-verdict">✗ 误选</span>
              )}
            </button>
          )
        })}
      </div>

      {selectedId && (
        <footer className="cw-quiz-feedback-bar">
          <div className={`cw-tutor-verdict ${isCorrect ? 'is-ok' : 'is-bad'}`}>
            <div className="cw-verdict-headline">
              {isCorrect ? '✓ 直觉准确，画面已锁定' : `✗ 刚才选偏了 · 正确词义为「${currentWord.senses.map((s) => s.zh).join('；')}」`}
            </div>
            {currentWord.examples[0] && (
              <p className="cw-verdict-example">
                {highlightLexeme(currentWord.examples[0].en, currentWord)}
              </p>
            )}
          </div>

          <button type="button" className="cw-cta-primary cw-cta-wide" onClick={handleNext}>
            <span>
              {cursor + 1 >= words.length ? '进入中译英 Boss 默写检定' : '下一题'}
            </span>
            <kbd className="cw-kbd-hint">Enter ↵</kbd>
          </button>
        </footer>
      )}
    </section>
  )
}
