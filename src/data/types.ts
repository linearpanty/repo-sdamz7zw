import type { LexiconLevel } from '../config/lexicon'

export type Sense = { pos?: string; zh: string }

export type WordExample = {
  en: string
  zh: string
  source?: string
  zhSource?: string
  mt?: boolean
}

export type WordListTag = 'cefrj' | 'nawl' | 'atlas'

export type Word = {
  id: string
  word: string
  ipa: string
  senses: Sense[]
  examples: WordExample[]
  collocations: string[]
  variants?: string[]
  sceneHook: string
  /** Text-free poster under Vite `public/`, e.g. `illus/abandon.webp`. */
  illustration?: string
  color: string
  /** Proficiency band stored strictly in data (never displayed in UI). */
  level?: LexiconLevel
  /** English corpus Zipf score (wordfreq 3.1.1) stored strictly in data. */
  zipf?: number
  /** Open graded wordlist provenance tags stored strictly in data. */
  lists?: WordListTag[]
}

/** Public URL for a text-free poster, honoring the Vite base path. */
export function illustrationUrl(word: Word): string | null {
  if (!word.illustration) return null
  return import.meta.env.BASE_URL + word.illustration.replace(/^\//, '')
}
