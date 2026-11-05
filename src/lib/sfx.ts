/**
 * Tiny Web Audio synth for scene climaxes. Everything is generated on the fly
 * (no files) and every failure is swallowed: sound is decoration, never a gate.
 *
 * Each of the first 20 scenes owns one distinct sound, and every sound is hard
 * capped at MAX_S so no tail bleeds into the next card's pronunciation.
 */
export type SfxName =
  | 'snap'
  | 'slam'
  | 'chime'
  | 'clatter'
  | 'whoosh'
  | 'breath'
  | 'splash'
  | 'boing'
  | 'purr'
  | 'sting'
  | 'cymbal'
  | 'rumble'
  | 'click'
  | 'shatter'
  | 'clack'
  | 'thunk'
  | 'ding'
  | 'stamp'
  | 'tada'
  | 'overload'

/** Hard ceiling for any sound, in seconds (master gain is faded to silence by then). */
export const MAX_S = 0.42

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

/* ---- Persistent mute switch (shared by scene SFX and auto-played pronunciation) ---- */

export const MUTE_KEY = 'clawwords.muted.v1'

let mutedCache: boolean | null = null
const muteListeners = new Set<(muted: boolean) => void>()

export function isSoundMuted(): boolean {
  if (mutedCache !== null) return mutedCache
  try {
    mutedCache = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    mutedCache = false
  }
  return mutedCache
}

export function setSoundMuted(muted: boolean): void {
  mutedCache = muted
  try {
    if (muted) localStorage.setItem(MUTE_KEY, '1')
    else localStorage.removeItem(MUTE_KEY)
  } catch {
    // Private mode etc.: the switch still works for this session.
  }
  for (const fn of muteListeners) fn(muted)
}

export function subscribeMute(fn: (muted: boolean) => void): () => void {
  muteListeners.add(fn)
  return () => {
    muteListeners.delete(fn)
  }
}

let ctx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined)
  return ctx
}

function getNoise(c: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === c.sampleRate) return noiseBuffer
  const len = Math.floor(c.sampleRate * MAX_S)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buf
  return buf
}

type ToneOpts = {
  type?: OscillatorType
  f0: number
  f1?: number
  at?: number
  dur: number
  gain?: number
}

function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.f0, t0)
  if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t0 + o.dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.3, t0 + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
  osc.connect(g).connect(out)
  osc.start(t0)
  osc.stop(t0 + o.dur + 0.02)
}

type NoiseOpts = {
  at?: number
  dur: number
  gain?: number
  freq: number
  freq1?: number
  q?: number
  filter?: BiquadFilterType
}

function noise(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0)
  const src = c.createBufferSource()
  src.buffer = getNoise(c)
  const f = c.createBiquadFilter()
  f.type = o.filter ?? 'lowpass'
  f.frequency.setValueAtTime(o.freq, t0)
  if (o.freq1) f.frequency.exponentialRampToValueAtTime(o.freq1, t0 + o.dur)
  f.Q.value = o.q ?? 0.8
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.3, t0 + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
  src.connect(f).connect(g).connect(out)
  src.start(t0)
  src.stop(t0 + o.dur + 0.02)
}

/** Small struck bell: fundamental plus the inharmonic partials that make it ring like metal. */
function bell(c: AudioContext, out: AudioNode, f: number, at: number, dur: number, gain: number) {
  tone(c, out, { f0: f, at, dur, gain })
  tone(c, out, { f0: f * 2.76, at, dur: dur * 0.45, gain: gain * 0.3 })
  tone(c, out, { f0: f * 5.4, at, dur: dur * 0.2, gain: gain * 0.12 })
}

export function playSfx(name: SfxName): void {
  if (isSoundMuted()) return
  try {
    const c = getCtx()
    if (!c) return
    const out = c.createGain()
    const now = c.currentTime
    out.gain.setValueAtTime(0.55, now)
    out.gain.setValueAtTime(0.55, now + MAX_S - 0.05)
    out.gain.linearRampToValueAtTime(0, now + MAX_S)
    out.connect(c.destination)
    switch (name) {
      case 'snap': // rope pulled taut: crack + low twang
        noise(c, out, { dur: 0.045, freq: 4000, gain: 0.5, filter: 'highpass' })
        tone(c, out, { type: 'triangle', f0: 240, f1: 90, dur: 0.16, gain: 0.3 })
        tone(c, out, { type: 'sawtooth', f0: 110, f1: 70, at: 0.04, dur: 0.3, gain: 0.05 })
        break
      case 'slam': // paper stack hits the desk: thud + paper flutter
        tone(c, out, { f0: 110, f1: 48, dur: 0.18, gain: 0.6 })
        noise(c, out, { dur: 0.12, freq: 2600, freq1: 400, gain: 0.45 })
        noise(c, out, { at: 0.08, dur: 0.18, freq: 3000, gain: 0.12, filter: 'highpass' })
        break
      case 'chime': // ripening sparkle: quick rising triad
        tone(c, out, { type: 'triangle', f0: 1046.5, dur: 0.16, gain: 0.16 })
        tone(c, out, { type: 'triangle', f0: 1318.5, at: 0.07, dur: 0.18, gain: 0.15 })
        tone(c, out, { type: 'triangle', f0: 1568, at: 0.14, dur: 0.26, gain: 0.14 })
        break
      case 'clatter': // wooden blocks tumbling: low thump then a scatter of knocks
        tone(c, out, { f0: 120, f1: 60, dur: 0.18, gain: 0.45 })
        ;[
          [0.02, 640],
          [0.07, 520],
          [0.13, 720],
          [0.2, 470],
          [0.28, 590],
        ].forEach(([at, f]) => {
          tone(c, out, { type: 'triangle', f0: f, f1: f * 0.8, at, dur: 0.06, gain: 0.22 })
          noise(c, out, { at, dur: 0.03, freq: 2200, gain: 0.12, filter: 'bandpass', q: 2 })
        })
        break
      case 'whoosh': // chart line rockets off the board
        noise(c, out, { dur: 0.34, freq: 400, freq1: 4200, gain: 0.25, filter: 'bandpass', q: 1.2 })
        tone(c, out, { type: 'triangle', f0: 330, f1: 1320, at: 0.05, dur: 0.3, gain: 0.12 })
        break
      case 'breath': // long relieved exhale
        noise(c, out, { dur: 0.4, freq: 1400, freq1: 300, gain: 0.22, filter: 'bandpass', q: 0.7 })
        tone(c, out, { type: 'triangle', f0: 660, f1: 520, at: 0.1, dur: 0.28, gain: 0.07 })
        break
      case 'splash': // fresh water poured in, two bubbles pop
        noise(c, out, { dur: 0.3, freq: 2400, freq1: 600, gain: 0.32, filter: 'bandpass', q: 0.9 })
        tone(c, out, { f0: 320, f1: 900, at: 0.05, dur: 0.1, gain: 0.14 })
        tone(c, out, { f0: 420, f1: 1150, at: 0.18, dur: 0.09, gain: 0.11 })
        break
      case 'boing': // tug of war rope springs back
        tone(c, out, { f0: 170, f1: 520, dur: 0.12, gain: 0.3 })
        tone(c, out, { type: 'triangle', f0: 520, f1: 240, at: 0.11, dur: 0.22, gain: 0.18 })
        tone(c, out, { f0: 90, f1: 50, dur: 0.12, gain: 0.35 })
        break
      case 'purr': // little "mrrp" then a soft purr
        tone(c, out, { f0: 420, f1: 720, dur: 0.1, gain: 0.1 })
        tone(c, out, { f0: 720, f1: 520, at: 0.09, dur: 0.12, gain: 0.08 })
        for (let i = 0; i < 6; i++) {
          noise(c, out, { at: 0.12 + i * 0.045, dur: 0.035, freq: 260, gain: 0.28 })
        }
        break
      case 'sting': // detective "dun-dun": two low brass stabs after the photo slap
        noise(c, out, { dur: 0.05, freq: 3000, gain: 0.3 })
        tone(c, out, { type: 'sawtooth', f0: 147, dur: 0.13, gain: 0.08 })
        tone(c, out, { type: 'sawtooth', f0: 220, dur: 0.13, gain: 0.05 })
        tone(c, out, { type: 'sawtooth', f0: 139, at: 0.16, dur: 0.24, gain: 0.09 })
        tone(c, out, { type: 'sawtooth', f0: 208, at: 0.16, dur: 0.24, gain: 0.05 })
        break
      case 'cymbal': // bright metal crash with a kick under it
        noise(c, out, { dur: 0.38, freq: 6500, gain: 0.3, filter: 'highpass' })
        noise(c, out, { dur: 0.18, freq: 3200, freq1: 1600, gain: 0.2, filter: 'bandpass', q: 1.5 })
        tone(c, out, { f0: 72, f1: 40, dur: 0.16, gain: 0.45 })
        break
      case 'rumble': // earthquake
        noise(c, out, { dur: 0.4, freq: 160, gain: 0.6 })
        tone(c, out, { f0: 55, f1: 38, dur: 0.38, gain: 0.4 })
        break
      case 'click': // roof light switches on: click + two-note blip
        tone(c, out, { type: 'square', f0: 1600, dur: 0.025, gain: 0.12 })
        tone(c, out, { type: 'triangle', f0: 988, at: 0.05, dur: 0.15, gain: 0.18 })
        tone(c, out, { type: 'triangle', f0: 1318.5, at: 0.12, dur: 0.26, gain: 0.14 })
        break
      case 'shatter': // ball through glass: knock + falling shards
        tone(c, out, { f0: 120, f1: 50, dur: 0.12, gain: 0.4 })
        noise(c, out, { dur: 0.3, freq: 5000, freq1: 1800, gain: 0.35, filter: 'bandpass', q: 0.6 })
        for (let i = 0; i < 6; i++) {
          tone(c, out, { type: 'triangle', f0: 2300 + ((i * 670) % 2100), at: 0.03 + i * 0.045, dur: 0.07, gain: 0.07 })
        }
        break
      case 'clack': // knight lands, king topples on the board
        tone(c, out, { type: 'triangle', f0: 900, f1: 620, dur: 0.05, gain: 0.3 })
        noise(c, out, { dur: 0.03, freq: 2500, gain: 0.18, filter: 'bandpass', q: 2 })
        tone(c, out, { type: 'triangle', f0: 700, f1: 520, at: 0.14, dur: 0.06, gain: 0.25 })
        tone(c, out, { type: 'triangle', f0: 560, f1: 420, at: 0.22, dur: 0.07, gain: 0.2 })
        tone(c, out, { f0: 180, f1: 110, at: 0.14, dur: 0.18, gain: 0.25 })
        break
      case 'thunk': // dart whizz, thunk into cork, little quiver
        noise(c, out, { dur: 0.07, freq: 2000, freq1: 5000, gain: 0.15, filter: 'bandpass', q: 1.5 })
        tone(c, out, { type: 'triangle', f0: 320, f1: 120, at: 0.07, dur: 0.12, gain: 0.45 })
        noise(c, out, { at: 0.07, dur: 0.04, freq: 3000, gain: 0.2 })
        ;[260, 228, 250, 236].forEach((f, i) => tone(c, out, { type: 'triangle', f0: f, at: 0.13 + i * 0.045, dur: 0.05, gain: 0.05 }))
        break
      case 'ding': // oven timer bell
        bell(c, out, 1568, 0, 0.38, 0.2)
        break
      case 'stamp': // heavy seal pressed down
        tone(c, out, { f0: 140, f1: 45, dur: 0.22, gain: 0.7 })
        noise(c, out, { dur: 0.08, freq: 1800, gain: 0.35 })
        break
      case 'tada': // spotlight reveal: little major fanfare
        tone(c, out, { type: 'triangle', f0: 523.3, dur: 0.1, gain: 0.18 })
        tone(c, out, { type: 'triangle', f0: 659.3, at: 0.08, dur: 0.1, gain: 0.18 })
        tone(c, out, { type: 'triangle', f0: 784, at: 0.16, dur: 0.24, gain: 0.18 })
        tone(c, out, { type: 'square', f0: 1046.5, at: 0.16, dur: 0.24, gain: 0.04 })
        break
      case 'overload': // elevator alert bell rings twice while the car clunks and bounces on its cables
        bell(c, out, 1175, 0, 0.12, 0.16)
        bell(c, out, 1175, 0.14, 0.14, 0.16)
        tone(c, out, { f0: 88, f1: 52, at: 0.04, dur: 0.16, gain: 0.5 })
        noise(c, out, { at: 0.04, dur: 0.07, freq: 320, gain: 0.4 })
        tone(c, out, { f0: 72, f1: 50, at: 0.22, dur: 0.12, gain: 0.25 })
        tone(c, out, { type: 'triangle', f0: 210, f1: 150, at: 0.2, dur: 0.16, gain: 0.05 })
        break
    }
  } catch {
    // Audio is optional decoration; ignore autoplay or support failures.
  }
}
