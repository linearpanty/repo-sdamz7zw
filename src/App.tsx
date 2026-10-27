import { useCallback, useEffect, useState } from 'react'
import { WORDS, type Word } from './data/words'
import {
  clearProgress,
  loadProgress,
  saveProgress,
  type Progress,
} from './lib/storage'
import {
  dueWords,
  markLearned,
  pickNewWords,
  type FlowStep,
} from './lib/session'
import { ManifestoView } from './views/ManifestoView'
import { TutorDeskView } from './views/TutorDeskView'
import { LexiconStageView } from './views/LexiconStageView'
import { IntuitionQuizView } from './views/IntuitionQuizView'
import { BossWriteView } from './views/BossWriteView'
import { DayStampView } from './views/DayStampView'
import { StudioSettingsView } from './views/StudioSettingsView'

type StudioRoute = 'tip' | 'today' | 'flow' | 'settings'

function parseHash(): StudioRoute {
  const raw = (window.location.hash.replace(/^#\/?/, '') || '').split('?')[0]
  if (raw === 'tip') return 'tip'
  if (raw === 'settings') return 'settings'
  if (raw === 'flow') return 'flow'
  return 'today'
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [route, setRouteState] = useState<StudioRoute>(() => parseHash())

  const [step, setStep] = useState<FlowStep>({ kind: 'home' })
  const [reviewQueue, setReviewQueue] = useState<Word[]>([])
  const [reviewTotal, setReviewTotal] = useState(0)
  const [batchQueue, setBatchQueue] = useState<Word[]>([])
  const [learnCursor, setLearnCursor] = useState(0)
  const [sessionWords, setSessionWords] = useState<Word[]>([])
  const [quizMetrics, setQuizMetrics] = useState({ correct: 0, total: 0 })

  const commitProgress = useCallback((next: Progress) => {
    saveProgress(next)
    setProgress(next)
  }, [])

  const navigate = useCallback((target: StudioRoute) => {
    const desiredHash = `#/${target}`
    if (window.location.hash !== desiredHash) {
      window.location.hash = `/${target}`
    }
    setRouteState(target)
  }, [])

  useEffect(() => {
    const raw = (window.location.hash.replace(/^#\/?/, '') || '').split('?')[0]
    if (raw !== 'tip' && raw !== 'today' && raw !== 'flow' && raw !== 'settings') {
      window.location.hash = '/today'
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      setRouteState(parseHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const beginRound = useCallback(
    (isExtra = false) => {
      const reviews = isExtra ? [] : dueWords(progress)
      const targetCount = isExtra ? 5 : progress.settings.dailyNewCount
      const freshWords = pickNewWords(progress, targetCount)

      setReviewQueue(reviews)
      setReviewTotal(reviews.length)
      setBatchQueue(freshWords)
      setLearnCursor(0)
      setSessionWords([...reviews, ...freshWords])
      setQuizMetrics({ correct: 0, total: 0 })
      navigate('flow')

      if (reviews.length > 0) {
        setStep({ kind: 'review', word: reviews[0] })
      } else if (freshWords.length > 0) {
        setStep({
          kind: 'learn',
          word: freshWords[0],
          index: 0,
          total: freshWords.length,
        })
      } else {
        setStep({ kind: 'done', mode: isExtra ? 'extra' : 'daily' })
      }
    },
    [navigate, progress],
  )

  // If user directly visits #/flow while step is 'home', auto-bootstrap the session
  useEffect(() => {
    if (route === 'flow' && step.kind === 'home') {
      beginRound(progress.todayDone)
    }
  }, [route, step.kind, beginRound, progress.todayDone])

  function handleSeedDueDemo() {
    const sampleIds = WORDS.slice(0, 2).map((w) => w.id)
    const nextDue = Array.from(new Set([...progress.dueIds, ...sampleIds]))
    commitProgress({ ...progress, dueIds: nextDue })
  }

  function advanceReview() {
    const remaining = reviewQueue.slice(1)
    setReviewQueue(remaining)
    if (remaining.length > 0) {
      setStep({ kind: 'review', word: remaining[0] })
      return
    }
    // Clear reviewed dueIds
    if (progress.dueIds.length > 0) {
      commitProgress({ ...progress, dueIds: [] })
    }
    if (batchQueue.length > 0) {
      setStep({
        kind: 'learn',
        word: batchQueue[0],
        index: 0,
        total: batchQueue.length,
      })
    } else {
      concludeSession(false)
    }
  }

  function advanceLearnCard() {
    const nextIndex = learnCursor + 1
    if (nextIndex % 5 === 0 || nextIndex >= batchQueue.length) {
      const checkpointStart = Math.floor((nextIndex - 1) / 5) * 5
      const slice = batchQueue.slice(checkpointStart, nextIndex)
      setStep({ kind: 'quiz-mcq', words: slice, batchIndex: nextIndex })
      return
    }
    setLearnCursor(nextIndex)
    setStep({
      kind: 'learn',
      word: batchQueue[nextIndex],
      index: nextIndex,
      total: batchQueue.length,
    })
  }

  function recordQuizAnswers(
    results: { wordId: string; ok: boolean }[],
    quizType: 'mcq' | 'write',
  ) {
    const timestamp = new Date().toISOString()
    setProgress((prev) => {
      const mergedAnswers = [
        ...prev.answers,
        ...results.map((r) => ({
          wordId: r.wordId,
          type: quizType,
          ok: r.ok,
          at: timestamp,
        })),
      ].slice(-500)
      const updated = { ...prev, answers: mergedAnswers }
      saveProgress(updated)
      return updated
    })
  }

  function completeMcqCheckpoint(results: { wordId: string; ok: boolean }[]) {
    const passed = results.filter((r) => r.ok).length
    setQuizMetrics((m) => ({
      correct: m.correct + passed,
      total: m.total + results.length,
    }))
    recordQuizAnswers(results, 'mcq')

    const checkpointWords = step.kind === 'quiz-mcq' ? step.words : []
    const batchIdx = step.kind === 'quiz-mcq' ? step.batchIndex : learnCursor + 1
    setStep({
      kind: 'quiz-write',
      words: checkpointWords,
      batchIndex: batchIdx,
    })
  }

  function completeWriteCheckpoint(results: { wordId: string; ok: boolean }[]) {
    const passed = results.filter((r) => r.ok).length
    setQuizMetrics((m) => ({
      correct: m.correct + passed,
      total: m.total + results.length,
    }))
    recordQuizAnswers(results, 'write')

    const batchIdx = step.kind === 'quiz-write' ? step.batchIndex : learnCursor + 1
    if (batchIdx >= batchQueue.length) {
      concludeSession(!progress.todayDone)
    } else {
      setLearnCursor(batchIdx)
      setStep({
        kind: 'learn',
        word: batchQueue[batchIdx],
        index: batchIdx,
        total: batchQueue.length,
      })
    }
  }

  function concludeSession(isDailyMain: boolean) {
    const newIds = batchQueue.map((w) => w.id)
    setProgress((prev) => {
      const clearedDue = { ...prev, dueIds: [] }
      const marked = markLearned(clearedDue, newIds)
      const next: Progress = {
        ...marked,
        todayNewIds: Array.from(new Set([...prev.todayNewIds, ...newIds])),
        todayDone: isDailyMain || prev.todayDone,
        extraRounds: prev.extraRounds + (isDailyMain ? 0 : 1),
      }
      saveProgress(next)
      return next
    })
    setStep({ kind: 'done', mode: isDailyMain ? 'daily' : 'extra' })
  }

  // Compute Flow progress percentage & active stage label
  const flowPercent = (() => {
    if (step.kind === 'review') {
      const doneRev = Math.max(0, reviewTotal - reviewQueue.length)
      return Math.round(((doneRev + 1) / Math.max(1, reviewTotal)) * 18)
    }
    if (step.kind === 'learn') {
      return 20 + Math.round(((step.index + 1) / Math.max(1, step.total)) * 45)
    }
    if (step.kind === 'quiz-mcq') return 76
    if (step.kind === 'quiz-write') return 90
    if (step.kind === 'done') return 100
    return 0
  })()

  const canDoMoreRounds =
    pickNewWords(progress, 5).length > 0 || dueWords(progress).length > 0

  return (
    <div className="cw-app">
      <header className="cw-top">
        <button
          type="button"
          className="cw-brand"
          onClick={() => {
            setStep({ kind: 'home' })
            navigate('today')
          }}
        >
          ClawWords
        </button>

        {route === 'flow' && step.kind !== 'home' ? (
          <div className="cw-hud">
            {reviewTotal > 0 && (
              <span className={`cw-hud-step ${step.kind === 'review' ? 'is-active' : 'is-done'}`}>
                复习
              </span>
            )}
            <span className={`cw-hud-step ${step.kind === 'learn' ? 'is-active' : ''}`}>词</span>
            <span className={`cw-hud-step ${step.kind === 'quiz-mcq' ? 'is-active' : ''}`}>选义</span>
            <span className={`cw-hud-step ${step.kind === 'quiz-write' ? 'is-active' : ''}`}>默写</span>
            <span className={`cw-hud-step ${step.kind === 'done' ? 'is-active' : ''}`}>完成</span>
            <button
              type="button"
              className="cw-leave"
              onClick={() => {
                setStep({ kind: 'home' })
                navigate('today')
              }}
            >
              离开
            </button>
          </div>
        ) : (
          <nav className="cw-nav" aria-label="导航">
            <button
              type="button"
              className={`cw-nav-btn ${route === 'today' ? 'is-active' : ''}`}
              onClick={() => navigate('today')}
            >
              今日
            </button>
            <button
              type="button"
              className={`cw-nav-btn ${route === 'settings' ? 'is-active' : ''}`}
              onClick={() => navigate('settings')}
            >
              设置
            </button>
          </nav>
        )}
      </header>

      {route === 'flow' && step.kind !== 'home' && (
        <div className="cw-track" role="progressbar" aria-valuenow={flowPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="cw-track-bar" style={{ width: `${flowPercent}%` }} />
        </div>
      )}

      <main className="cw-main">
          {route === 'tip' && (
            <ManifestoView
              onEnter={() => {
                if (!progress.tipSeen) {
                  commitProgress({ ...progress, tipSeen: true })
                }
                navigate('today')
              }}
            />
          )}

          {route === 'today' && (
            <TutorDeskView
              progress={progress}
              onStartStage={(extra) => beginRound(extra)}
              onSeedDueDemo={handleSeedDueDemo}
              onOpenSettings={() => navigate('settings')}
            />
          )}

          {route === 'settings' && (
            <StudioSettingsView
              progress={progress}
              onUpdateDailyCount={(n) => {
                const clamped = Math.min(20, Math.max(5, n))
                commitProgress({
                  ...progress,
                  settings: { ...progress.settings, dailyNewCount: clamped },
                })
              }}
              onResetAll={() => {
                const fresh = clearProgress()
                commitProgress(fresh)
                setStep({ kind: 'home' })
                navigate('today')
              }}
              onClose={() => navigate('today')}
            />
          )}

          {route === 'flow' && (
            <>
              {step.kind === 'review' && (
                <LexiconStageView
                  word={step.word}
                  isReview
                  modeLabel="复习"
                  subProgressLabel={`还剩 ${reviewQueue.length}`}
                  nextButtonText={
                    reviewQueue.length === 1 && batchQueue.length > 0 ? '去新词' : '下一个'
                  }
                  onAdvance={advanceReview}
                />
              )}

              {step.kind === 'learn' && (
                <LexiconStageView
                  word={step.word}
                  modeLabel="新词"
                  subProgressLabel={`${step.index + 1} / ${step.total}`}
                  nextButtonText={
                    (step.index + 1) % 5 === 0 || step.index + 1 === step.total
                      ? '去做题'
                      : '下一个'
                  }
                  onAdvance={advanceLearnCard}
                />
              )}

              {step.kind === 'quiz-mcq' && (
                <IntuitionQuizView
                  words={step.words}
                  onComplete={completeMcqCheckpoint}
                />
              )}

              {step.kind === 'quiz-write' && (
                <BossWriteView
                  words={step.words}
                  onComplete={completeWriteCheckpoint}
                />
              )}

              {step.kind === 'done' && (
                <DayStampView
                  todayKey={progress.todayKey}
                  mode={step.mode}
                  sessionWords={sessionWords}
                  correctCount={quizMetrics.correct}
                  totalChecks={quizMetrics.total}
                  totalMastered={progress.learnedIds.length}
                  lexiconSize={WORDS.length}
                  canMore={canDoMoreRounds}
                  onMore={() => beginRound(true)}
                  onHome={() => {
                    setStep({ kind: 'home' })
                    navigate('today')
                  }}
                />
              )}
            </>
          )}
        </main>
    </div>
  )
}
