export function speakEnglish(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  synth.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'en-US'
  utter.rate = 0.92
  const voices = synth.getVoices()
  const voice =
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en'))
  if (voice) utter.voice = voice
  synth.speak(utter)
}
