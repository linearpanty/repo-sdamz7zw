/**
 * Tiny Web Audio synth for scene climaxes. Everything is generated on the fly
 * (no files) and every failure is swallowed: sound is decoration, never a gate.
 */
export type SfxName =
  | 'buzzer'
  | 'stamp'
  | 'slam'
  | 'crash'
  | 'thunk'
  | 'snap'
  | 'chime'
  | 'pop'
  | 'whoosh'
  | 'rumble'
  | 'splash'
  | 'click'
  | 'breath'

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

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
  const len = Math.floor(c.sampleRate * 1.2)
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
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.3, t0 + 0.008)
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
  g.gain.exponentialRampToValueAtTime(o.gain ?? 0.3, t0 + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur)
  src.connect(f).connect(g).connect(out)
  src.start(t0)
  src.stop(t0 + o.dur + 0.02)
}

export function playSfx(name: SfxName): void {
  try {
    const c = getCtx()
    if (!c) return
    const out = c.createGain()
    out.gain.value = 0.55
    out.connect(c.destination)
    switch (name) {
      case 'buzzer':
        tone(c, out, { type: 'square', f0: 196, dur: 0.16, gain: 0.16 })
        tone(c, out, { type: 'square', f0: 196, at: 0.2, dur: 0.16, gain: 0.16 })
        tone(c, out, { type: 'square', f0: 196, at: 0.4, dur: 0.22, gain: 0.16 })
        break
      case 'stamp':
        tone(c, out, { f0: 140, f1: 45, dur: 0.22, gain: 0.7 })
        noise(c, out, { dur: 0.08, freq: 1800, gain: 0.35 })
        break
      case 'slam':
        tone(c, out, { f0: 110, f1: 50, dur: 0.18, gain: 0.6 })
        noise(c, out, { dur: 0.14, freq: 2600, freq1: 400, gain: 0.45 })
        break
      case 'crash':
        noise(c, out, { dur: 0.5, freq: 5000, freq1: 900, gain: 0.4, filter: 'bandpass', q: 0.6 })
        tone(c, out, { f0: 90, f1: 40, dur: 0.25, gain: 0.4 })
        for (let i = 0; i < 4; i++) {
          tone(c, out, { type: 'triangle', f0: 1800 + i * 430, at: 0.03 + i * 0.05, dur: 0.12, gain: 0.07 })
        }
        break
      case 'thunk':
        tone(c, out, { type: 'triangle', f0: 320, f1: 120, dur: 0.12, gain: 0.45 })
        noise(c, out, { dur: 0.04, freq: 3000, gain: 0.2 })
        break
      case 'snap':
        noise(c, out, { dur: 0.05, freq: 4000, gain: 0.5, filter: 'highpass' })
        tone(c, out, { type: 'triangle', f0: 220, f1: 90, dur: 0.18, gain: 0.3 })
        tone(c, out, { type: 'sawtooth', f0: 90, f1: 60, at: 0.05, dur: 0.6, gain: 0.05 })
        break
      case 'chime':
        tone(c, out, { type: 'triangle', f0: 880, dur: 0.5, gain: 0.22 })
        tone(c, out, { type: 'triangle', f0: 1318.5, at: 0.09, dur: 0.6, gain: 0.18 })
        break
      case 'pop':
        tone(c, out, { f0: 420, f1: 1100, dur: 0.1, gain: 0.35 })
        tone(c, out, { type: 'triangle', f0: 1046.5, at: 0.08, dur: 0.3, gain: 0.12 })
        break
      case 'whoosh':
        noise(c, out, { dur: 0.45, freq: 400, freq1: 4200, gain: 0.25, filter: 'bandpass', q: 1.2 })
        tone(c, out, { type: 'triangle', f0: 330, f1: 990, at: 0.1, dur: 0.35, gain: 0.12 })
        break
      case 'rumble':
        noise(c, out, { dur: 0.7, freq: 160, gain: 0.6 })
        tone(c, out, { f0: 55, f1: 38, dur: 0.6, gain: 0.4 })
        break
      case 'splash':
        noise(c, out, { dur: 0.4, freq: 2400, freq1: 600, gain: 0.35, filter: 'bandpass', q: 0.9 })
        tone(c, out, { f0: 600, f1: 1400, at: 0.06, dur: 0.12, gain: 0.12 })
        break
      case 'click':
        tone(c, out, { type: 'square', f0: 1600, dur: 0.03, gain: 0.12 })
        tone(c, out, { type: 'triangle', f0: 988, at: 0.06, dur: 0.35, gain: 0.18 })
        tone(c, out, { type: 'triangle', f0: 1318.5, at: 0.14, dur: 0.4, gain: 0.14 })
        break
      case 'breath':
        noise(c, out, { dur: 0.55, freq: 1400, freq1: 300, gain: 0.22, filter: 'bandpass', q: 0.7 })
        tone(c, out, { type: 'triangle', f0: 660, at: 0.12, dur: 0.4, gain: 0.08 })
        break
    }
  } catch {
    // Audio is optional decoration; ignore autoplay or support failures.
  }
}
