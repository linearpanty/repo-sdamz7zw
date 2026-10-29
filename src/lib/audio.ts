/**
 * Exact set of word IDs that have bundled US MP3 files in `public/audio/us/{id}.mp3`.
 * Gating local requests with this set avoids firing 404 network requests on static hosts.
 */
export const LOCAL_US_AUDIO_IDS: ReadonlySet<string> = new Set([
  'abandon',
  'abstract',
  'accelerate',
  'access',
  'accurate',
  'achieve',
  'acquire',
  'adapt',
  'adequate',
  'adjacent',
  'advocate',
  'affect',
  'allocate',
  'ambiguous',
  'amend',
  'apparent',
  'approach',
  'appropriate',
  'arbitrary',
  'assess',
  'assume',
  'attach',
  'attain',
  'attribute',
  'authority',
  'available',
  'benefit',
  'bias',
  'brief',
  'capable',
  'capacity',
  'category',
  'challenge',
  'circumstance',
  'clarify',
  'coherent',
  'coincide',
  'collapse',
  'commit',
  'compatible',
  'compile',
  'comprehensive',
])

let activeAudio: HTMLAudioElement | null = null

function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof Audio === 'undefined') {
      reject(new Error('audio-unavailable'))
      return
    }
    if (activeAudio) {
      activeAudio.pause()
      activeAudio = null
    }
    const audio = new Audio(url)
    activeAudio = audio
    let settled = false
    const finish = (err?: unknown) => {
      if (settled) return
      settled = true
      if (err) reject(err)
      else resolve()
    }
    audio.addEventListener('error', () => finish(new Error('audio-error')), { once: true })
    audio.addEventListener('playing', () => finish(), { once: true })
    const pending = audio.play()
    if (pending !== undefined) pending.then(() => finish()).catch((err) => finish(err))
  })
}

function speakWithWebSpeech(text: string): void {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-US'
    const voices = window.speechSynthesis.getVoices?.() ?? []
    const enVoice =
      voices.find((v) => v.lang === 'en-US') ?? voices.find((v) => v.lang.startsWith('en'))
    if (enVoice) utter.voice = enVoice
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  } catch {
    // Speech synthesis is optional.
  }
}

/**
 * Tap pronunciation.
 * Request local Word Atlas Open mp3 only when bundled in `public/audio/us/`,
 * otherwise go straight to the hosted copy and fall back to speech synthesis.
 */
export function speakWord(text: string, id?: string): void {
  const cleanId = (id ?? text).trim().toLowerCase()
  const remoteUrl = `https://0xlei.tech/words/atlas/audio/us/${cleanId}.mp3`

  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  } catch {
    // ignore
  }

  const attempt = LOCAL_US_AUDIO_IDS.has(cleanId)
    ? playAudioUrl(import.meta.env.BASE_URL + 'audio/us/' + cleanId + '.mp3').catch(() =>
        playAudioUrl(remoteUrl),
      )
    : playAudioUrl(remoteUrl)

  attempt.catch(() => {
    speakWithWebSpeech(text)
  })
}
