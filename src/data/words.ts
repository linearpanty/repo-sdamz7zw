import { LEXICON_CONFIG, type LexiconConfig, type LexiconLevel } from "../config/lexicon"
import { illustrationUrl, type Sense, type Word, type WordExample, type WordListTag } from "./types"
import { CHUNK_0 } from "./chunks/chunk0"
import { CHUNK_1 } from "./chunks/chunk1"
import { CHUNK_2 } from "./chunks/chunk2"
import { CHUNK_3 } from "./chunks/chunk3"
import { CHUNK_4 } from "./chunks/chunk4"
import { CHUNK_5 } from "./chunks/chunk5"
import { CHUNK_6 } from "./chunks/chunk6"
import { CHUNK_7 } from "./chunks/chunk7"

export { illustrationUrl, type Sense, type Word, type WordExample, type WordListTag }

const LEGACY_COUNT = 50

function fnv1a32(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

function matchesSource(word: Word, source: LexiconConfig["wordlistSource"]): boolean {
  const tags = word.lists ?? []
  if (source === "cefrj-octanove") return tags.includes("cefrj")
  if (source === "nawl") return tags.includes("nawl")
  return tags.includes("cefrj") || tags.includes("nawl")
}

export function buildActiveWords(pool: readonly Word[], config: LexiconConfig = LEXICON_CONFIG): Word[] {
  const legacy = pool.slice(0, LEGACY_COUNT)
  const levelRank = new Map<LexiconLevel, number>(
    config.includedLevels.map((lv, idx) => [lv, idx]),
  )
  const graded = pool.slice(LEGACY_COUNT).filter((w) => {
    if (!w.level || !levelRank.has(w.level)) return false
    return matchesSource(w, config.wordlistSource)
  })

  graded.sort((a, b) => {
    if (config.groupByLevel) {
      const la = levelRank.get(a.level!) ?? 99
      const lb = levelRank.get(b.level!) ?? 99
      if (la !== lb) return la - lb
    }
    const za = a.zipf ?? 0
    const zb = b.zipf ?? 0
    if (zb !== za) return zb - za
    return fnv1a32(a.id) - fnv1a32(b.id)
  })

  return [...legacy, ...graded]
}

export const RAW_WORD_POOL: Word[] = (CHUNK_0 as Word[]).concat(CHUNK_1, CHUNK_2, CHUNK_3, CHUNK_4, CHUNK_5, CHUNK_6, CHUNK_7)

export const WORDS: Word[] = buildActiveWords(RAW_WORD_POOL, LEXICON_CONFIG)

const WORD_MAP = new Map<string, Word>(WORDS.map((w) => [w.id, w]))

export function getWord(id: string): Word | undefined {
  return WORD_MAP.get(id)
}
