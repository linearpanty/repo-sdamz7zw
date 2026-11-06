import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { hasScene, WordMotionStage } from '../components/WordMotionStage'
import { illustrationUrl, videoUrl, type Sense, type Word } from '../data/types'
import { autoSpeakWord, speakWord, subscribeSpeaking, type SpeakingEvent } from '../lib/audio'
import { gradeExact, maskWordHint } from '../lib/grader'
import type { CardMode } from '../lib/model'
import { isSoundMuted, setSoundMuted, subscribeMute } from '../lib/sfx'
import { getStressedSyllableIndex, splitWordSyllables } from '../lib/syllables'

export type SessionCapsule = {
  id: string
  word: string
  status: 'done' | 'current' | 'upcoming'
  mode: CardMode
}

type WordViewProps = {
  word: Word
  mode: CardMode
  index: number
  total: number
  canReplay: boolean
  capsules?: SessionCapsule[]
  onAdvance: (hadMiss: boolean, mastered?: boolean) => void
  onExit: () => void
}

function SpeakIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.5 9.5h3.2L12 6.2v11.6l-4.3-3.3H4.5v-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 9.2a3.6 3.6 0 0 1 0 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17.6 7a6.4 6.4 0 0 1 0 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.5 9.5h3.2L12 6.2v11.6l-4.3-3.3H4.5v-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 9.5l5 5m0-5l-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Top-bar switch: silences scene SFX + auto-played pronunciation, persisted in localStorage. */
function MuteToggle() {
  const [muted, setMuted] = useState(() => isSoundMuted())
  useEffect(() => subscribeMute(setMuted), [])
  return (
    <button
      type="button"
      className={`cw-mute-toggle${muted ? ' is-muted' : ''}`}
      aria-pressed={muted}
      aria-label={muted ? '打开声音' : '静音'}
      title={muted ? '打开声音' : '静音'}
      onPointerDown={(e) => e.preventDefault()}
      onClick={() => setSoundMuted(!muted)}
    >
      {muted ? <MutedIcon /> : <SpeakIcon />}
    </button>
  )
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildLexemeRegex(word: Word): RegExp | null {
  const candidates = new Set<string>([word.word, ...(word.variants ?? [])])
  if (word.word.length >= 5 && (word.word.endsWith('e') || word.word.endsWith('y'))) {
    candidates.add(word.word.slice(0, -1))
  }
  const stems = [...candidates].filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRegExp)
  if (stems.length === 0) return null
  return new RegExp(`(\\b(?:${stems.join('|')})\\w*)`, 'gi')
}

function highlightLexeme(text: string, word: Word): ReactNode {
  const pattern = buildLexemeRegex(word)
  if (!pattern) return text
  return text.split(pattern).map((seg, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="cw-target-hl">
        {seg}
      </mark>
    ) : (
      seg
    ),
  )
}

function maskLexemeInSentence(text: string, word: Word): ReactNode {
  const pattern = buildLexemeRegex(word)
  if (!pattern) return text
  const maskLabel = `${word.word[0] ?? ''}${'_'.repeat(Math.max(3, word.word.length - 1))}`
  return text.split(pattern).map((seg, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="cw-target-hl cw-target-mask">
        {maskLabel}
      </mark>
    ) : (
      seg
    ),
  )
}

/** Consecutive senses sharing a POS render under one tag (no more "adj. … adj. …"). */
function groupSenses(senses: Sense[]): Sense[] {
  const out: Sense[] = []
  for (const sense of senses) {
    const prev = out.at(-1)
    if (prev && sense.pos && prev.pos === sense.pos) {
      out[out.length - 1] = { pos: prev.pos, zh: `${prev.zh}；${sense.zh}` }
    } else {
      out.push({ ...sense })
    }
  }
  return out
}

/**
 * Two layers stacked in one grid cell: the cell is always as tall as the taller
 * layer, so flipping between masked and revealed never moves anything below it.
 */
function Swap({ show, before, after, className = '' }: { show: boolean; before: ReactNode; after: ReactNode; className?: string }) {
  return (
    <div className={`cw-swap ${className}`}>
      <div className={`cw-swap-layer${show ? ' is-off' : ''}`} aria-hidden={show}>
        {before}
      </div>
      <div className={`cw-swap-layer${show ? '' : ' is-off'}`} aria-hidden={!show}>
        {after}
      </div>
    </div>
  )
}

/** Success hold before auto-advance. Enter (after PASS_ENTER_GUARD_MS) skips it. */
const HOLD_SCENE_MS = 1350
const HOLD_POSTER_MS = 1250
const HOLD_TEXT_MS = 1100
const HOLD_RECALL_MS = 1400
/** Long enough to read and hit 撤回 on the auto-graduated badge. */
const HOLD_MASTERED_MS = 2400
/** Learn cards: …or if the learner starts typing and then stalls. */
const PAUSE_REVEAL_MS = 1200
/** Ignore Enter this soon after a card mounts (late Enter from the previous card). */
const MOUNT_ENTER_GUARD_MS = 300
/** Ignore Enter this soon after the word is completed (type-and-slam-Enter habit). */
const PASS_ENTER_GUARD_MS = 250

type Completion = { at: number; typingMs: number; revealedBefore: boolean }

function computeMatchedPrefixLen(input: string, target: string): number {
  const cleanIn = input.trimStart().toLowerCase()
  const cleanTarget = target.toLowerCase()
  let i = 0
  const max = Math.min(cleanIn.length, cleanTarget.length)
  while (i < max && cleanIn[i] === cleanTarget[i]) {
    i += 1
  }
  return i
}

export function WordView({
  word,
  mode,
  index,
  total,
  onAdvance,
  onExit,
}: WordViewProps) {
  const [spellInput, setSpellInput] = useState('')
  const [tried, setTried] = useState(false)
  const [missCount, setMissCount] = useState(0)
  // Learn cards reveal headword + IPA + example + collocations immediately (0ms delay).
  // Recall cards stay masked until typed or missed twice.
  const [probeRevealed, setProbeRevealed] = useState(() => mode === 'learn')
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [autoMastered, setAutoMastered] = useState(false)
  const [masteryUndone, setMasteryUndone] = useState(false)
  const [speaking, setSpeaking] = useState<SpeakingEvent>({ id: null, durationMs: 0, seq: 0 })
  // examples[0] is the simple i+1 sentence; examples[1] (if any) is the authentic IELTS one.
  // Every new word opens on the simple sentence.
  const [exampleIdx, setExampleIdx] = useState(0)
  const [exampleWordId, setExampleWordId] = useState(word.id)
  if (exampleWordId !== word.id) {
    setExampleWordId(word.id)
    setExampleIdx(0)
  }
  const inputRef = useRef<HTMLInputElement | null>(null)
  const advancedRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const probeTimerRef = useRef<number | null>(null)
  const firstKeyAtRef = useRef<number | null>(null)
  const typoCountRef = useRef(0)
  const mountedAtRef = useRef(0)
  const lastSpokenAtRef = useRef(0)
  const missedRef = useRef(false)
  const masteredRef = useRef(false)

  const learn = mode === 'learn'
  const passed = gradeExact(spellInput, word.word).ok
  const revealed = missCount >= 2
  const showHead = learn || probeRevealed || passed || revealed
  const illusSrc = illustrationUrl(word)
  const vidSrc = videoUrl(word)
  const withScene = hasScene(word)
  const hasMedia = Boolean(withScene || illusSrc || vidSrc)
  const hasExampleToggle = word.examples.length > 1
  const example = word.examples[hasExampleToggle ? Math.min(exampleIdx, 1) : 0]
  const collocations = (word.collocations ?? []).slice(0, 3)
  const senses = groupSenses(word.senses)
  const syllables = splitWordSyllables(word.word)
  const nonSepSyllables = syllables.filter((s) => !s.isSeparator)
  const isMultiSyllable = nonSepSyllables.length > 1
  const stressedSylIdx = isMultiSyllable ? getStressedSyllableIndex(word.word, word.ipa) : -1
  const matchedLen = passed ? word.word.length : computeMatchedPrefixLen(spellInput, word.word)
  const trimmedLen = spellInput.trim().length
  const hasTypo = !passed && trimmedLen > matchedLen
  const isWordSpeaking = speaking.id === word.id.trim().toLowerCase()
  const fraction = `${index}/${total}`
  const showMasteryBadge = passed && autoMastered

  function holdMsFor(mastered: boolean): number {
    if (mastered) return HOLD_MASTERED_MS
    if (!learn) return HOLD_RECALL_MS
    if (withScene) return HOLD_SCENE_MS
    if (hasMedia) return HOLD_POSTER_MS
    return HOLD_TEXT_MS
  }

  function clearProbeTimer() {
    if (probeTimerRef.current !== null) {
      window.clearTimeout(probeTimerRef.current)
      probeTimerRef.current = null
    }
  }

  function armProbeTimer(ms: number) {
    clearProbeTimer()
    probeTimerRef.current = window.setTimeout(() => {
      probeTimerRef.current = null
      setProbeRevealed(true)
    }, ms)
  }

  useEffect(() => subscribeSpeaking(setSpeaking), [])

  useEffect(() => {
    mountedAtRef.current = performance.now()
    if (learn) {
      lastSpokenAtRef.current = performance.now()
      autoSpeakWord(word.word, word.id)
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      if (probeTimerRef.current !== null) window.clearTimeout(probeTimerRef.current)
      timerRef.current = null
      probeTimerRef.current = null
    }
  }, [learn, word.id, word.word])

  // Mobile keyboards shrink the visual viewport: expose its height to CSS so the
  // scene compacts, and keep the input above the keyboard.
  useEffect(() => {
    const vv = window.visualViewport
    const root = document.documentElement
    const apply = () => {
      const h = vv?.height ?? window.innerHeight
      root.style.setProperty('--cw-vvh', `${Math.round(h)}px`)
      // Short visual viewport (phone keyboard up): drop secondary rows so scene + input fit.
      root.classList.toggle('cw-compact', h < 640 && window.innerWidth <= 720)
      if (vv && vv.height < window.innerHeight - 80 && document.activeElement === inputRef.current) {
        inputRef.current?.scrollIntoView({ block: 'nearest' })
      }
    }
    apply()
    vv?.addEventListener('resize', apply)
    window.addEventListener('resize', apply)
    return () => {
      vv?.removeEventListener('resize', apply)
      window.removeEventListener('resize', apply)
      root.classList.remove('cw-compact')
    }
  }, [])

  function triggerAdvance() {
    if (advancedRef.current) return
    advancedRef.current = true
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    clearProbeTimer()
    const hadMiss = missedRef.current
    onAdvance(hadMiss, !hadMiss && masteredRef.current)
  }

  /**
   * System-judged mastery, decided at the moment of completion:
   * a brand-new (learn) word, typed blind before the headword surfaced, with no typo or miss.
   * Copy-typing a visible word — however fast — never counts, and recall cards never qualify.
   */
  function computeSystemMastered(): boolean {
    if (!learn) return false
    if (probeRevealed) return false
    if (missedRef.current) return false
    return typoCountRef.current === 0
  }

  function noteMiss() {
    if (spellInput.trim() || !learn) {
      const nextCount = missCount + 1
      missedRef.current = true
      setTried(true)
      setMissCount(nextCount)
      if (nextCount === 2) {
        autoSpeakWord(word.word, word.id)
      }
    }
    inputRef.current?.focus()
  }

  function onComplete() {
    const now = performance.now()
    clearProbeTimer()
    const mastered = computeSystemMastered()
    masteredRef.current = mastered
    setAutoMastered(mastered)
    setCompletion({
      at: now,
      typingMs: firstKeyAtRef.current === null ? 0 : Math.round(now - firstKeyAtRef.current),
      revealedBefore: probeRevealed,
    })
    // Hand-eye-ear closure: replay the full word pronunciation as soon as the final letter locks in.
    lastSpokenAtRef.current = now
    autoSpeakWord(word.word, word.id)
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(triggerAdvance, holdMsFor(mastered))
  }

  function undoMastery() {
    masteredRef.current = false
    setMasteryUndone(true)
    inputRef.current?.focus()
  }

  return (
    <div className="cw-folio-wrap">
      <div className="cw-word-bar">
        <button type="button" className="cw-word-brand" onClick={onExit}>
          ClawWords
        </button>
        <div className="cw-word-bar-end">
          <MuteToggle />
          <span className="cw-count" aria-label={fraction}>
            {fraction}
          </span>
        </div>
      </div>
      <div
        className="cw-flow-rail"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={Math.max(1, total)}
        aria-valuenow={index}
        aria-valuetext={fraction}
      >
        <div
          className="cw-flow-beam"
          style={{ width: `${Math.min(100, (index / Math.max(1, total)) * 100)}%` }}
        />
      </div>

      <article
        className={`cw-lexicon-folio${hasMedia ? '' : ' is-text-only'}${passed ? ' is-passed' : ''}${isWordSpeaking ? ' is-speaking' : ''}`}
        aria-label="词"
        data-typing-ms={completion?.typingMs}
        data-mastered={passed ? String(autoMastered && !masteryUndone) : undefined}
      >
        {hasMedia ? (
          <div className={`cw-poster-frame has-illus${withScene ? ' has-scene' : ''}`}>
            <div className="cw-poster-centerpiece">
              <Swap
                show={showHead}
                before={<p className="cw-poster-hook">{maskLexemeInSentence(word.sceneHook, word)}</p>}
                after={<p className="cw-poster-hook">{highlightLexeme(word.sceneHook, word)}</p>}
              />
              {word.sceneHookZh && <p className="cw-poster-hook-zh">{word.sceneHookZh}</p>}
            </div>
            <WordMotionStage word={word} passed={passed} />
          </div>
        ) : (
          <div className={`cw-text-spotlight${passed ? ' is-passed' : ''}`} style={{ '--cw-word-color': word.color || '#243b55' } as React.CSSProperties}>
            <Swap
              className="cw-spotlight-swap"
              show={showHead}
              before={<p className="cw-spotlight-hook">{maskLexemeInSentence(word.sceneHook, word)}</p>}
              after={<p className="cw-spotlight-hook">{highlightLexeme(word.sceneHook, word)}</p>}
            />
            <span className="cw-spotlight-seal" aria-hidden="true">
              ✓
            </span>
          </div>
        )}

        <div className="cw-dossier-pane">
          <header className="cw-headword-block">
            <Swap
              show={showHead}
              before={
                <div className="cw-headword-row headword-row is-masked">
                  <h1 className="cw-sr">词</h1>
                  <button
                    type="button"
                    className={`cw-btn-speak btn-speak${isWordSpeaking ? ' is-speaking' : ''}`}
                    tabIndex={showHead ? -1 : 0}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      lastSpokenAtRef.current = performance.now()
                      speakWord(word.word, word.id)
                    }}
                    aria-label="听发音"
                  >
                    <SpeakIcon />
                  </button>
                  {learn && <span className="cw-probe-hint">认识可直接盲打 · 停顿自动浮现</span>}
                </div>
              }
              after={
                <div className="cw-headword-row headword-row">
                  <h1
                    className={`cw-headword-serif headword${isWordSpeaking ? ' is-speaking' : ''}${passed ? ' is-complete' : ''}`}
                    data-speak-seq={isWordSpeaking ? speaking.seq : undefined}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      lastSpokenAtRef.current = performance.now()
                      speakWord(word.word, word.id)
                    }}
                  >
                    {(() => {
                      let nonSepOrd = -1
                      const weights = syllables.map((s) => {
                        if (s.isSeparator) return 0
                        nonSepOrd += 1
                        const base = Math.max(1, s.end - s.start)
                        return nonSepOrd === stressedSylIdx ? base * 1.3 : base
                      })
                      const totalWeight = Math.max(1, weights.reduce((a, b) => a + b, 0))
                      let cumWeight = 0
                      nonSepOrd = -1
                      return syllables.map((syl, sylIdx) => {
                        if (syl.isSeparator) {
                          return (
                            <span key={sylIdx} className="cw-syl-sep">
                              {syl.text}
                            </span>
                          )
                        }
                        nonSepOrd += 1
                        const isStressed = isMultiSyllable && nonSepOrd === stressedSylIdx
                        const w = weights[sylIdx]
                        const durMs = Math.max(420, speaking.durationMs || 720)
                        const delayMs = Math.round((cumWeight / totalWeight) * durMs * 0.78)
                        const spanMs = Math.max(
                          180,
                          Math.round((w / totalWeight) * durMs * 0.98),
                        )
                        cumWeight += w
                        const isSylDone = matchedLen >= syl.end
                        const isSylCurrent =
                          !passed &&
                          (matchedLen > 0 || hasTypo) &&
                          matchedLen >= syl.start &&
                          matchedLen < syl.end
                        const isSylError = hasTypo && matchedLen >= syl.start && matchedLen < syl.end
                        const hasNextSyllable =
                          sylIdx < syllables.length - 1 && !syllables[sylIdx + 1]?.isSeparator
                        const sylStyle = {
                          '--cw-syl-delay': `${delayMs}ms`,
                          '--cw-syl-dur': `${spanMs}ms`,
                        } as CSSProperties
                        return (
                          <span
                            key={`${sylIdx}:${isWordSpeaking ? speaking.seq : 0}`}
                            className={`cw-syl${hasNextSyllable ? ' has-dot' : ''}${isStressed ? ' is-syl-stressed' : ''}${isSylDone ? ' is-syl-done' : ''}${isSylCurrent ? ' is-syl-active' : ''}${isSylError ? ' is-syl-error' : ''}${isWordSpeaking ? ' is-syl-speaking' : ''}`}
                            style={sylStyle}
                          >
                            {Array.from(syl.text).map((ch, cIdx) => {
                              const charPos = syl.start + cIdx
                              const isTyped = charPos < matchedLen
                              const isErrorChar = hasTypo && charPos === matchedLen
                              return (
                                <span
                                  key={cIdx}
                                  className={`cw-char${isTyped ? ' is-typed' : ''}${isErrorChar ? ' is-char-error' : ''}`}
                                >
                                  {ch}
                                </span>
                              )
                            })}
                          </span>
                        )
                      })
                    })()}
                  </h1>
                  <span
                    className="cw-ipa-pill ipa"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      lastSpokenAtRef.current = performance.now()
                      speakWord(word.word, word.id)
                    }}
                  >
                    {word.ipa}
                  </span>
                  <button
                    type="button"
                    className={`cw-btn-speak btn-speak${isWordSpeaking ? ' is-speaking' : ''}`}
                    tabIndex={showHead ? 0 : -1}
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                      lastSpokenAtRef.current = performance.now()
                      speakWord(word.word, word.id)
                    }}
                    aria-label="听发音"
                  >
                    <SpeakIcon />
                  </button>
                </div>
              }
            />
          </header>

          <section className={`cw-senses-box${learn ? '' : ' is-prompt'}`} aria-label="释义">
            {senses.map((sense, idx) => (
              <div key={idx} className="cw-sense-row">
                {sense.pos && <span className="cw-pos-tag">{sense.pos}</span>}
                <span className="cw-sense-zh">{sense.zh}</span>
              </div>
            ))}
          </section>

          {example && (
            <div className={`cw-example-slate${hasExampleToggle ? ' has-toggle' : ''}`}>
              {hasExampleToggle && (
                <div className="cw-example-toggle" role="group" aria-label="例句难度">
                  {(['易懂', '真题'] as const).map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      className={`cw-example-toggle-btn${exampleIdx === idx ? ' is-active' : ''}`}
                      aria-pressed={exampleIdx === idx}
                      title={idx === 0 ? '易懂例句' : '真题原句'}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => setExampleIdx(idx)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <Swap
                show={showHead}
                before={<p className="cw-example-en">{maskLexemeInSentence(example.en, word)}</p>}
                after={<p className="cw-example-en">{highlightLexeme(example.en, word)}</p>}
              />
              <p className="cw-example-zh">{example.zh}</p>
              {collocations.length > 0 && (
                <div
                  className={`cw-colloc-row${showHead ? '' : ' is-off'}`}
                  aria-label="常见搭配"
                  aria-hidden={!showHead}
                >
                  {collocations.map((col, idx) => (
                    <span key={idx} className="cw-colloc-chip">
                      {col}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <section className="cw-spell-gate spell-gate">
            <div
              className={`cw-spell-input-shell ${passed ? 'is-ok' : tried && !passed ? 'is-bad' : ''}`}
            >
              <input
                ref={inputRef}
                id="word-spell-input"
                type="text"
                className={`cw-spell-input input spell-input ${
                  passed ? 'is-ok' : tried && !passed ? 'is-bad' : ''
                }`}
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                readOnly={passed}
                value={spellInput}
                placeholder={showHead ? '输入这个词' : maskWordHint(word.word)}
                aria-label="输入这个词"
                onChange={(e) => {
                  if (advancedRef.current || passed) return
                  const val = e.target.value
                  setSpellInput(val)
                  const cleanVal = val.trim().toLowerCase()
                  const cleanTarget = word.word.trim().toLowerCase()
                  if (cleanVal.length > 0 && firstKeyAtRef.current === null) {
                    firstKeyAtRef.current = performance.now()
                  }
                  const isOk = gradeExact(val, word.word).ok
                  const isPrefix = cleanTarget.startsWith(cleanVal)
                  if (!isPrefix) {
                    typoCountRef.current += 1
                    if (learn && !probeRevealed) {
                      clearProbeTimer()
                      setProbeRevealed(true)
                    }
                    const now = performance.now()
                    if (now - lastSpokenAtRef.current > 900) {
                      lastSpokenAtRef.current = now
                      autoSpeakWord(word.word, word.id)
                    }
                  } else if (learn && !probeRevealed && !isOk) {
                    // Typing blind: hold the headword back while keys keep coming,
                    // but surface it if the learner stalls mid-word.
                    armProbeTimer(PAUSE_REVEAL_MS)
                  }
                  if (tried && isOk) setTried(false)
                  if (isOk) onComplete()
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  const now = performance.now()
                  if (e.repeat || now - mountedAtRef.current < MOUNT_ENTER_GUARD_MS) return
                  if (passed) {
                    if (completion && now - completion.at < PASS_ENTER_GUARD_MS) return
                    triggerAdvance()
                    return
                  }
                  if (learn && !probeRevealed) {
                    clearProbeTimer()
                    setProbeRevealed(true)
                    return
                  }
                  noteMiss()
                }}
              />
              {showMasteryBadge && (
                <div className={`cw-mastery-badge${masteryUndone ? ' is-undone' : ''}`} role="status">
                  {masteryUndone ? (
                    <span>已撤回 · 照常安排</span>
                  ) : (
                    <>
                      <span>已标为熟词</span>
                      <button
                        type="button"
                        className="cw-mastery-undo"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={undoMastery}
                      >
                        撤回
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {tried && !passed && (
              <div className="cw-spell-feedback feedback bad compact" role="status">
                {maskWordHint(word.word)}
              </div>
            )}
          </section>
        </div>
      </article>
    </div>
  )
}
