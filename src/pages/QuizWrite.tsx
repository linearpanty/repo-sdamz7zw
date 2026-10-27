import { useState } from 'react'
import type { Word } from '../data/words'
import { primaryZh } from '../data/words'
import { gradeTranslation, type GradeResult } from '../lib/grader'

type Props = {
  words: Word[]
  onDone: (results: { wordId: string; ok: boolean }[]) => void
}

export function QuizWrite({ words, onDone }: Props) {
  const [i, setI] = useState(0)
  const [input, setInput] = useState('')
  const [grade, setGrade] = useState<GradeResult | null>(null)
  const [results, setResults] = useState<{ wordId: string; ok: boolean }[]>([])
  const word = words[i]

  function submit() {
    if (grade) {
      const next = [...results, { wordId: word.id, ok: grade.ok }]
      setResults(next)
      setGrade(null)
      setInput('')
      if (i + 1 >= words.length) onDone(next)
      else setI(i + 1)
      return
    }
    const g = gradeTranslation(input, word.word, word.variants ?? [])
    setGrade(g)
  }

  return (
    <div className="screen">
      <div className="badge">
        中译英 Boss {i + 1}/{words.length}
      </div>
      <div className="word-header">
        <h2>中译英 · 主动默写</h2>
        <p className="muted">根据中文释义拼写对应英文单词 · Enter 提交</p>
      </div>
      <p className="prompt-zh">{primaryZh(word)}</p>
      <input
        className="input"
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        value={input}
        disabled={!!grade}
        placeholder="输入对应的英文单词…"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
      />
      {grade && (
        <div className={grade.ok ? 'feedback ok' : 'feedback bad'}>
          {grade.ok ? '✓ ' : '✗ '}
          {grade.feedback}
          {!grade.ok && (
            <div>
              正确拼写：<strong>{grade.correct}</strong>
            </div>
          )}
        </div>
      )}
      <button type="button" className="btn primary block" onClick={submit}>
        {grade ? (i + 1 >= words.length ? '完成本关' : '下一题') : '提交'} (Enter)
      </button>
    </div>
  )
}
