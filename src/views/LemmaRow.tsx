import { useEffect } from 'react'
import { speakEnglish } from '../lib/speak'

type LemmaRowProps = {
  word: string
  ipa: string
}

export function LemmaRow({ word, ipa }: LemmaRowProps) {
  useEffect(() => {
    window.speechSynthesis?.getVoices()
  }, [])

  return (
    <div className="cw-lemma">
      <h1 className="cw-headword">{word}</h1>
      <span className="cw-ipa">{ipa}</span>
      <button
        type="button"
        className="cw-speak"
        aria-label="朗读"
        onClick={() => speakEnglish(word)}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 9.5v5h3.2L12 18.8V5.2L7.2 9.5H4zm10.1.6a3.2 3.2 0 0 1 0 3.8l.9.9a4.6 4.6 0 0 0 0-5.6l-.9.9zm2.2-2.2a6.4 6.4 0 0 1 0 8.2l.9.9a7.8 7.8 0 0 0 0-10l-.9.9z"
          />
        </svg>
      </button>
    </div>
  )
}
