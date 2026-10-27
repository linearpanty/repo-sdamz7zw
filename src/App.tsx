import { useCallback, useEffect, useState } from 'react'
import { Today } from './pages/Today'
import { WordCardView } from './pages/WordCard'
import { QuizMCQ } from './pages/QuizMCQ'
import { QuizWrite } from './pages/QuizWrite'
import { Done } from './pages/Done'
import { Settings } from './pages/Settings'
import {
  clearProgress,
  loadProgress,
  saveProgress,
  type Progress,
} from './lib/storage'
import { dueWords, markLearned, pickNewWords, type FlowStep } from './lib/session'
import type { Word } from './data/words'

type Route = 'today' | 'flow' | 'settings'

function parseHashRoute(): Route {
  const h = (location.hash.replace(/^#\/?/, '') || '').split('?')[0]
  if (h === 'settings') return 'settings'
  if (h === 'flow') return 'flow'
  return 'today'
}

function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRouteState] = useState<Route>(() => parseHashRoute())

  useEffect(() => {
    const raw = (location.hash.replace(/^#\/?/, '') || '').split('?')[0]
    if (!raw || raw === 'tip') {
      location.hash = '/today'
    }
    const onHashChange = () => {
      setRouteState(parseHashRoute())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const setRoute = useCallback((r: Route) => {
    location.hash = '/' + r
    setRouteState(r)
  }, [])

  return [route, setRoute]
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [route, setRoute] = useHashRoute()
  const [step, setStep] = useState<FlowStep>({ kind: 'home' })
  const [sessionLearned, setSessionLearned] = useState<string[]>([])
  const [quizStats, setQuizStats] = useState({ correct: 0, total: 0 })
  const [batchQueue, setBatchQueue] = useState<Word[]>([])
  const [reviewQueue, setReviewQueue] = useState<Word[]>([])
  const [learnIndex, setLearnIndex] = useState(0)

  const persist = useCallback((p: Progress) => {
    saveProgress(p)
    setProgress(p)
  }, [])

  useEffect(() => {
    if (route === 'flow' && step.kind === 'home') {
      startDaily(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, step.kind])

  function startDaily(extra = false) {
    const reviews = extra ? [] : dueWords(progress)
    const count = extra ? 5 : progress.settings.dailyNewCount
    const news = pickNewWords(progress, count)
    setReviewQueue(reviews)
    setBatchQueue(news)
    setLearnIndex(0)
    setSessionLearned([])
    setQuizStats({ correct: 0, total: 0 })
    setRoute('flow')
    if (reviews.length > 0) {
      setStep({ kind: 'review', word: reviews[0] })
    } else if (news.length > 0) {
      setStep({ kind: 'learn', word: news[0], index: 0, total: news.length })
    } else {
      setStep({ kind: 'done', mode: extra ? 'extra' : 'daily' })
    }
  }

  function afterReview() {
    const rest = reviewQueue.slice(1)
    setReviewQueue(rest)
    if (rest.length > 0) {
      setStep({ kind: 'review', word: rest[0] })
      return
    }
    if (batchQueue.length > 0) {
      setStep({ kind: 'learn', word: batchQueue[0], index: 0, total: batchQueue.length })
    } else {
      finishSession(false)
    }
  }

  function afterLearnCard() {
    const nextIdx = learnIndex + 1
    setSessionLearned((prev) => [...prev, batchQueue[learnIndex].id])

    // quiz every 5 words, or at end of batch
    if (nextIdx % 5 === 0 || nextIdx >= batchQueue.length) {
      const start = Math.floor((nextIdx - 1) / 5) * 5
      const words = batchQueue.slice(start, nextIdx)
      setStep({ kind: 'quiz-mcq', words, batchIndex: nextIdx })
      return
    }
    setLearnIndex(nextIdx)
    setStep({ kind: 'learn', word: batchQueue[nextIdx], index: nextIdx, total: batchQueue.length })
  }

  function afterMcq(results: { wordId: string; ok: boolean }[]) {
    const ok = results.filter((r) => r.ok).length
    setQuizStats((s) => ({ correct: s.correct + ok, total: s.total + results.length }))
    const words = (step.kind === 'quiz-mcq' ? step.words : []) as Word[]
    setStep({ kind: 'quiz-write', words, batchIndex: step.kind === 'quiz-mcq' ? step.batchIndex : 0 })
    recordAnswers(results, 'mcq')
  }

  function afterWrite(results: { wordId: string; ok: boolean }[]) {
    const ok = results.filter((r) => r.ok).length
    setQuizStats((s) => ({ correct: s.correct + ok, total: s.total + results.length }))
    recordAnswers(results, 'write')
    const batchIndex = step.kind === 'quiz-write' ? step.batchIndex : learnIndex + 1
    if (batchIndex >= batchQueue.length) {
      finishSession(true)
    } else {
      setLearnIndex(batchIndex)
      setStep({
        kind: 'learn',
        word: batchQueue[batchIndex],
        index: batchIndex,
        total: batchQueue.length,
      })
    }
  }

  function recordAnswers(results: { wordId: string; ok: boolean }[], type: string) {
    const now = new Date().toISOString()
    setProgress((prev) => {
      const answers = [
        ...prev.answers,
        ...results.map((r) => ({ wordId: r.wordId, type, ok: r.ok, at: now })),
      ].slice(-500)
      const next = { ...prev, answers }
      saveProgress(next)
      return next
    })
  }

  function finishSession(markToday: boolean) {
    const ids = batchQueue.map((w) => w.id)
    setProgress((prev) => {
      let p = markLearned(prev, ids)
      p = {
        ...p,
        todayNewIds: [...new Set([...p.todayNewIds, ...ids])],
        todayDone: markToday || p.todayDone,
        extraRounds: p.extraRounds + (markToday ? 0 : 1),
      }
      saveProgress(p)
      return p
    })
    setSessionLearned(ids)
    setStep({ kind: 'done', mode: markToday ? 'daily' : 'extra' })
  }

  if (route === 'settings') {
    return (
      <div className="app">
        <Settings
          progress={progress}
          onChangeDaily={(n) => {
            const dailyNewCount = Math.min(20, Math.max(5, n))
            persist({ ...progress, settings: { ...progress.settings, dailyNewCount } })
          }}
          onClear={() => {
            const p = clearProgress()
            persist(p)
            setStep({ kind: 'home' })
            setRoute('today')
          }}
          onBack={() => setRoute('today')}
        />
      </div>
    )
  }

  if (route === 'flow' && step.kind !== 'home') {
    const flowPct =
      step.kind === 'review'
        ? 15
        : step.kind === 'learn'
          ? 20 + Math.round(((step.index + 1) / Math.max(1, step.total)) * 45)
          : step.kind === 'quiz-mcq'
            ? 75
            : step.kind === 'quiz-write'
              ? 90
              : 100

    return (
      <div className="app">
        <div className="flow-progress" aria-label="本关进度">
          <div className="flow-progress-bar" style={{ width: `${flowPct}%` }} />
        </div>
        <div className="stage-card">
          {step.kind === 'review' && (
            <WordCardView
              key={`review-${step.word.id}-${reviewQueue.length}`}
              word={step.word}
              badge={`复习 · 剩余 ${reviewQueue.length}`}
              onNext={afterReview}
              onBackHome={() => {
                setStep({ kind: 'home' })
                setRoute('today')
              }}
              nextLabel="下一个"
            />
          )}
          {step.kind === 'learn' && (
            <WordCardView
              key={`learn-${step.word.id}-${step.index}`}
              word={step.word}
              badge={`新词 ${step.index + 1}/${step.total}`}
              onNext={afterLearnCard}
              onBackHome={() => {
                setStep({ kind: 'home' })
                setRoute('today')
              }}
              nextLabel="下一个"
            />
          )}
          {step.kind === 'quiz-mcq' && <QuizMCQ words={step.words} onDone={afterMcq} />}
          {step.kind === 'quiz-write' && <QuizWrite words={step.words} onDone={afterWrite} />}
          {step.kind === 'done' && (
            <Done
              learnedCount={sessionLearned.length || batchQueue.length}
              correct={quizStats.correct}
              total={quizStats.total}
              onMore={() => startDaily(true)}
              onHome={() => {
                setStep({ kind: 'home' })
                setRoute('today')
              }}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Today
        progress={progress}
        onStart={() => startDaily(false)}
        onSettings={() => setRoute('settings')}
      />
    </div>
  )
}
