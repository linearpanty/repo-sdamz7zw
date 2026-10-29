import { useCallback, useEffect, useState } from 'react'
import {
  blankProgress,
  DAILY_COUNT,
  dateKey,
  PROGRESS_KEY,
  type Progress,
  type QueueCard,
} from './lib/model'
import { TodayView } from './views/TodayView'
import { WordView } from './views/WordView'
import { DoneView } from './views/DoneView'

type Route = 'today' | 'word' | 'done'
type RuntimeModule = typeof import('./lib/runtime')

let cachedRuntimePromise: Promise<RuntimeModule> | null = null
function loadRuntime(): Promise<RuntimeModule> {
  if (!cachedRuntimePromise) {
    cachedRuntimePromise = import('./lib/runtime')
  }
  return cachedRuntimePromise
}

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

/**
 * Lightweight synchronous preview from localStorage so `#/` renders immediately
 * without pulling the lexicon chunks into the main JS entry bundle.
 */
function readInitialPreview(): Progress {
  const today = dateKey()
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Progress>
      const count =
        typeof parsed.dailyCount === 'number' && Number.isFinite(parsed.dailyCount)
          ? Math.max(1, Math.min(20, Math.round(parsed.dailyCount)))
          : DAILY_COUNT
      if (parsed.todayKey === today && Array.isArray(parsed.queue)) {
        const queue: QueueCard[] = parsed.queue.filter(
          (c): c is QueueCard =>
            Boolean(c) &&
            typeof c.id === 'string' &&
            (c.mode === 'learn' || c.mode === 'recall'),
        )
        return {
          dailyCount: count,
          memory: parsed.memory && typeof parsed.memory === 'object' ? parsed.memory : {},
          todayKey: today,
          queue,
          doneCount: typeof parsed.doneCount === 'number' ? Math.max(0, parsed.doneCount) : 0,
          started: Boolean(parsed.started),
          finished: Boolean(parsed.finished),
          replayed: Array.isArray(parsed.replayed) ? parsed.replayed : [],
        }
      }
      const preview = blankProgress(today)
      preview.dailyCount = count
      preview.queue = Array.from({ length: count }, (_, idx) => ({
        id: String(idx),
        mode: 'learn',
      }))
      return preview
    }
  } catch {
    // Fall back to default preview below.
  }
  const preview = blankProgress(today)
  preview.queue = Array.from({ length: DAILY_COUNT }, (_, idx) => ({
    id: String(idx),
    mode: 'learn',
  }))
  return preview
}

export default function App() {
  const [runtime, setRuntime] = useState<RuntimeModule | null>(null)
  const [progress, setProgress] = useState<Progress>(() => readInitialPreview())
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
    let active = true
    void loadRuntime().then((rt) => {
      if (!active) return
      setRuntime(rt)
      setProgress(rt.loadProgress())
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!runtime) return
    if (route === 'word' && (progress.finished || progress.queue.length === 0)) {
      go('today', 'replace')
    } else if (route === 'done' && !progress.finished) {
      go('today', 'replace')
    }
  }, [go, progress.finished, progress.queue.length, route, runtime])

  function commit(rt: RuntimeModule, next: Progress) {
    rt.saveProgress(next)
    setProgress(next)
  }

  function handleStart() {
    if (runtime) {
      if (progress.finished || progress.queue.length === 0) return
      commit(runtime, { ...progress, started: true })
      go('word')
      return
    }
    void loadRuntime().then((rt) => {
      setRuntime(rt)
      const fresh = rt.loadProgress()
      if (fresh.finished || fresh.queue.length === 0) {
        setProgress(fresh)
        return
      }
      const started = { ...fresh, started: true }
      rt.saveProgress(started)
      setProgress(started)
      go('word')
    })
  }

  function handleAdvance(hadMiss: boolean) {
    if (!runtime) return
    const next = runtime.settleCard(progress, hadMiss)
    commit(runtime, next)
    if (next.finished) go('done')
  }

  const card = progress.queue[0]
  const word = runtime && card ? runtime.getWord(card.id) : undefined
  const showWord = route === 'word' && !progress.finished && Boolean(word && card)

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
          {showWord && word && card && (
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
