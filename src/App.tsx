import { useCallback, useEffect, useState } from 'react'
import { getWord } from './data/words'
import { loadProgress, saveProgress } from './lib/storage'
import { settleCard } from './lib/queue'
import type { Progress } from './lib/model'
import { TodayView } from './views/TodayView'
import { WordView } from './views/WordView'
import { DoneView } from './views/DoneView'

type Route = 'today' | 'word' | 'done'

function readRoute(): Route {
  const raw = window.location.hash.replace(/^#/, '').replace(/^\//, '').split('?')[0]
  if (raw === 'word') return 'word'
  if (raw === 'done') return 'done'
  return 'today'
}

function hashFor(route: Route): string {
  if (route === 'word') return '#/word'
  if (route === 'done') return '#/done'
  return '#/'
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [route, setRoute] = useState<Route>(() => readRoute())

  const go = useCallback((next: Route, mode: 'push' | 'replace' = 'push') => {
    const hash = hashFor(next)
    const current = window.location.hash
    if (current !== hash && !(current === '' && next === 'today')) {
      if (mode === 'replace') window.location.replace(hash)
      else window.location.hash = hash
    }
    setRoute(next)
  }, [])

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (route === 'word' && (progress.finished || progress.queue.length === 0)) {
      go('today', 'replace')
    } else if (route === 'done' && !progress.finished) {
      go('today', 'replace')
    }
  }, [go, progress.finished, progress.queue.length, route])

  function commit(next: Progress) {
    saveProgress(next)
    setProgress(next)
  }

  function handleStart() {
    if (progress.finished || progress.queue.length === 0) return
    commit({ ...progress, started: true })
    go('word')
  }

  function handleAdvance(hadMiss: boolean) {
    const next = settleCard(progress, hadMiss)
    commit(next)
    if (next.finished) go('done')
  }

  const card = progress.queue[0]
  const word = card ? getWord(card.id) : undefined
  const showWord = route === 'word' && !progress.finished && word && card

  return (
    <div className="cw-viewport">
      <div className="cw-ambient-grid" aria-hidden="true" />
      <div className="cw-studio-container">
        <main className="cw-stage-main">
          {route === 'today' && <TodayView progress={progress} onStart={handleStart} />}
          {route === 'done' && progress.finished && (
            <DoneView
              onBack={() => {
                go('today')
              }}
            />
          )}
          {showWord && (
            <WordView
              key={`${card.id}:${card.mode}:${progress.doneCount}`}
              word={word}
              mode={card.mode}
              index={progress.doneCount + 1}
              total={progress.doneCount + progress.queue.length}
              canReplay={!progress.replayed.includes(card.id)}
              onAdvance={handleAdvance}
              onExit={() => go('today')}
            />
          )}
        </main>
      </div>
    </div>
  )
}
