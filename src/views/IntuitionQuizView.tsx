import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { mcqOptions } from '../lib/session'
import { highlightLexeme } from './LexiconStageView'
import { LemmaRow } from './LemmaRow'

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
  const answer = currentWord.senses.map((s) => s.zh).join('；')

  return (
    <section className="cw-card" aria-label="选义">
      <span className="cw-badge">
        选义 {cursor + 1}/{words.length}
      </span>

      <LemmaRow word={currentWord.word} ipa={currentWord.ipa} />
      <p className="cw-hint">
        {selectedId ? currentWord.sceneHook : '选择中文意思 · 键盘 1–4，Enter 确认'}
      </p>

      <div className="cw-options" role="group" aria-label="词义选项">
        {choices.map((item, idx) => {
          let stateCls = ''
          if (selectedId) {
            if (item.id === currentWord.id) stateCls = 'is-ok'
            else if (item.id === selectedId) stateCls = 'is-bad'
            else stateCls = 'is-dim'
          }
          return (
            <button
              key={item.id}
              type="button"
              className={`cw-option ${stateCls}`}
              disabled={!!selectedId}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="cw-opt-num">{idx + 1}</span>
              <span>{item.zh}</span>
            </button>
          )
        })}
      </div>

      {selectedId && (
        <div className={`cw-feedback ${isCorrect ? 'is-ok' : 'is-bad'}`}>
          <p>{isCorrect ? '对。' : `答案：${answer}`}</p>
          {currentWord.examples[0] && (
            <p className="cw-example-en">{highlightLexeme(currentWord.examples[0].en, currentWord)}</p>
          )}
          <div className="cw-actions">
            <button type="button" className="cw-btn cw-btn-block" onClick={handleNext}>
              {cursor + 1 >= words.length ? '去默写' : '下一题'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
