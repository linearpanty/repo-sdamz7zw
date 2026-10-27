import { useEffect, useMemo, useState } from 'react'
import type { Word } from '../data/words'
import { mcqOptions } from '../lib/session'
import { speakWord } from './WordCard'

type Props = {
  words: Word[]
  onDone: (results: { wordId: string; ok: boolean }[]) => void
}

export function QuizMCQ({ words, onDone }: Props) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [results, setResults] = useState<{ wordId: string; ok: boolean }[]>([])
  const word = words[i]
  const options = useMemo(() => mcqOptions(word), [word])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (picked) {
        if (e.key === 'Enter') advance(picked === word.id)
        return
      }
      const n = Number(e.key)
      if (n >= 1 && n <= 4 && options[n - 1]) {
        setPicked(options[n - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, word, options, i, results])

  function advance(ok: boolean) {
    const next = [...results, { wordId: word.id, ok }]
    setResults(next)
    setPicked(null)
    if (i + 1 >= words.length) onDone(next)
    else setI(i + 1)
  }

  return (
    <div className="screen">
      <div className="badge">
        选义 {i + 1}/{words.length}
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
        <p className="muted">选择中文意思 · 键盘 1–4，Enter 确认</p>
      </div>
      <div className="options">
        {options.map((o, idx) => {
          let cls = 'option'
          if (picked) {
            if (o.id === word.id) cls += ' correct'
            else if (o.id === picked) cls += ' wrong'
          }
          return (
            <button
              type="button"
              key={o.id}
              className={cls}
              disabled={!!picked}
              onClick={() => setPicked(o.id)}
            >
              <span className="num">{idx + 1}</span>
              <span>{o.zh}</span>
            </button>
          )
        })}
      </div>
      {picked && (
        <button
          type="button"
          className="btn primary block"
          onClick={() => advance(picked === word.id)}
        >
          {i + 1 >= words.length ? '进入中译英 Boss 默写' : '下一题'} (Enter)
        </button>
      )}
    </div>
  )
}
