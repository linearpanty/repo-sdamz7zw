import { useCallback, useEffect, useState } from 'react'
import { illustrationUrl } from './data/types'
import { preloadWordAudio } from './lib/audio'
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
          doneIds: Array.isArray(parsed.doneIds) ? parsed.doneIds : [],
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
  // A bare `/` with unfinished work auto-jumps to `#/word` once the runtime loads:
  // render nothing until then instead of flashing TodayView for a frame.
  const [awaitingAutoJump] = useState(() => window.location.hash === '' && !progress.finished)

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
      const loaded = rt.loadProgress()
      setRuntime(rt)
      setProgress(loaded)
      if (window.location.hash === '' && !loaded.finished && loaded.queue.length > 0) {
        const started = { ...loaded, started: true }
        rt.saveProgress(started)
        setProgress(started)
        go('word', 'replace')
      }
    })
    return () => {
      active = false
    }
  }, [go])

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
      if (progress.finished || progress.queue.length === 0) {
        const next = runtime.startBonusRound(progress)
        if (next.queue.length === 0) return
        commit(runtime, next)
        go('word')
        return
      }
      commit(runtime, { ...progress, started: true })
      go('word')
      return
    }
    void loadRuntime().then((rt) => {
      setRuntime(rt)
      const fresh = rt.loadProgress()
      if (fresh.finished || fresh.queue.length === 0) {
        const bonus = rt.startBonusRound(fresh)
        if (bonus.queue.length === 0) {
          setProgress(fresh)
          return
        }
        rt.saveProgress(bonus)
        setProgress(bonus)
        go('word')
        return
      }
      const started = { ...fresh, started: true }
      rt.saveProgress(started)
      setProgress(started)
      go('word')
    })
  }

  function handleAdvance(hadMiss: boolean, mastered = false) {
    if (!runtime) return
    const next = runtime.settleCard(progress, hadMiss, undefined, mastered)
    commit(runtime, next)
    if (next.finished) go('done')
  }

  const card = progress.queue[0]
  const word = runtime && card ? runtime.getWord(card.id) : undefined
  const showWord = route === 'word' && !progress.finished && Boolean(word && card)
  const doneWords =
    runtime && progress.doneIds
      ? progress.doneIds
          .map((id) => runtime.getWord(id))
          .filter((w): w is NonNullable<typeof w> => Boolean(w))
      : []
  const queueWords = runtime
    ? progress.queue
        .map((c) => {
          const w = runtime.getWord(c.id)
          return w ? { word: w, mode: c.mode } : null
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : []

  const queuedIdSet = new Set(progress.queue.map((c) => c.id))
  const doneSlots = Math.max(0, progress.dailyCount - progress.queue.length)
  const roundDoneWords =
    doneSlots > 0 ? doneWords.filter((w) => !queuedIdSet.has(w.id)).slice(-doneSlots) : []

  const sessionCapsules = runtime
    ? [
        ...roundDoneWords.map((w) => ({
          id: w.id,
          word: w.word,
          status: 'done' as const,
          mode: 'learn' as const,
        })),
        ...queueWords.map((item, idx) => ({
          id: item.word.id,
          word: item.word.word,
          status: idx === 0 ? ('current' as const) : ('upcoming' as const),
          mode: item.mode,
        })),
      ]
    : []

  // Preload illustrations (.webp) and pronunciation (.mp3) for the entire current round
  // so advancing to the next word renders and speaks with zero network wait.
  const queueIdsKey = progress.queue.map((c) => c.id).join(',')
  useEffect(() => {
    if (!runtime || progress.queue.length === 0) return
    for (const cardItem of progress.queue) {
      const w = runtime.getWord(cardItem.id)
      if (!w) continue
      const imgUrl = illustrationUrl(w)
      if (imgUrl && typeof Image !== 'undefined') {
        const img = new Image()
        img.decoding = 'async'
        img.src = imgUrl
      }
      preloadWordAudio(w.word, w.id)
    }
  }, [queueIdsKey, progress.queue, runtime])

  return (
    <div className="cw-viewport">
      <div className="cw-ambient-grid" aria-hidden="true" />
      <div className="cw-studio-container">
        <main className="cw-stage-main">
          {route === 'today' && !(awaitingAutoJump && !runtime) && (
            <TodayView
              progress={progress}
              doneWords={roundDoneWords}
              queueWords={queueWords}
              onStart={handleStart}
            />
          )}
          {route === 'done' && progress.finished && (
            <DoneView
              words={doneWords.slice(-progress.dailyCount)}
              onMore={handleStart}
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
              index={roundDoneWords.length + 1}
              total={roundDoneWords.length + progress.queue.length}
              canReplay={!progress.replayed.includes(card.id)}
              capsules={sessionCapsules}
              onAdvance={handleAdvance}
              onExit={() => go('today')}
            />
          )}
        </main>
      </div>
    </div>
  )
}
