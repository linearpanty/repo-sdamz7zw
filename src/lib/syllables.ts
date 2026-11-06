/**
 * Splits an English headword into readable phonetic/orthographic syllable chunks
 * whose concatenation `.join('')` is strictly identical to `word`.
 */

const EXACT_SYLLABLES: Record<string, string[]> = {
  abandon: ['a', 'ban', 'don'],
  challenge: ['chal', 'lenge'],
  benefit: ['ben', 'e', 'fit'],
  collapse: ['col', 'lapse'],
  significant: ['sig', 'nif', 'i', 'cant'],
  adequate: ['ad', 'e', 'quate'],
  environment: ['en', 'vi', 'ron', 'ment'],
  factor: ['fac', 'tor'],
  approach: ['ap', 'proach'],
  evidence: ['ev', 'i', 'dence'],
  adjacent: ['ad', 'ja', 'cent'],
  structure: ['struc', 'ture'],
  available: ['a', 'vail', 'a', 'ble'],
  impact: ['im', 'pact'],
  strategy: ['strat', 'e', 'gy'],
  arbitrary: ['ar', 'bi', 'trar', 'y'],
  process: ['proc', 'ess'],
  authority: ['au', 'thor', 'i', 'ty'],
  feature: ['fea', 'ture'],
  capacity: ['ca', 'pac', 'i', 'ty'],
  resource: ['re', 'source'],
  access: ['ac', 'cess'],
  potential: ['po', 'ten', 'tial'],
  method: ['meth', 'od'],
  appropriate: ['ap', 'pro', 'pri', 'ate'],
  principle: ['prin', 'ci', 'ple'],
  capable: ['ca', 'pa', 'ble'],
  perspective: ['per', 'spec', 'tive'],
  affect: ['af', 'fect'],
  function: ['func', 'tion'],
  require: ['re', 'quire'],
  accurate: ['ac', 'cu', 'rate'],
  maintain: ['main', 'tain'],
  indicate: ['in', 'di', 'cate'],
  achieve: ['a', 'chieve'],
  establish: ['es', 'tab', 'lish'],
  assume: ['as', 'sume'],
  identify: ['i', 'den', 'ti', 'fy'],
  category: ['cat', 'e', 'go', 'ry'],
  generate: ['gen', 'er', 'ate'],
  involve: ['in', 'volve'],
  abstract: ['ab', 'stract'],
  contribute: ['con', 'trib', 'ute'],
  demonstrate: ['dem', 'on', 'strate'],
  aware: ['a', 'ware'],
  interpret: ['in', 'ter', 'pret'],
  consequence: ['con', 'se', 'quence'],
  proportion: ['pro', 'por', 'tion'],
  technique: ['tech', 'nique'],
  phenomenon: ['phe', 'nom', 'e', 'non'],
  support: ['sup', 'port'],
  issue: ['is', 'sue'],
  create: ['cre', 'ate'],
  recreate: ['rec', 're', 'ate'],
  community: ['com', 'mu', 'ni', 'ty'],
  source: ['source'],
  policy: ['pol', 'i', 'cy'],
  industry: ['in', 'dus', 'try'],
  produce: ['pro', 'duce'],
  energy: ['en', 'er', 'gy'],
  individual: ['in', 'di', 'vid', 'u', 'al'],
  range: ['range'],
  suggest: ['sug', 'gest'],
  material: ['ma', 'te', 'ri', 'al'],
  reduce: ['re', 'duce'],
  population: ['pop', 'u', 'la', 'tion'],
  theory: ['the', 'o', 'ry'],
  discover: ['dis', 'cov', 'er'],
  depend: ['de', 'pend'],
  behaviour: ['be', 'hav', 'iour'],
  economy: ['e', 'con', 'o', 'my'],
  species: ['spe', 'cies'],
  admit: ['ad', 'mit'],
  trouble: ['trou', 'ble'],
  traditional: ['tra', 'di', 'tion', 'al'],
  southern: ['south', 'ern'],
  expert: ['ex', 'pert'],
  strength: ['strength'],
  prison: ['pris', 'on'],
  totally: ['to', 'tal', 'ly'],
  relation: ['re', 'la', 'tion'],
  resident: ['res', 'i', 'dent'],
  limited: ['lim', 'it', 'ed'],
  previously: ['pre', 'vi', 'ous', 'ly'],
  critical: ['crit', 'i', 'cal'],
  edge: ['edge'],
  ensure: ['en', 'sure'],
  ban: ['ban'],
  hire: ['hire'],
  stress: ['stress'],
  tough: ['tough'],
  length: ['length'],
  escape: ['es', 'cape'],
  fresh: ['fresh'],
  journal: ['jour', 'nal'],
  mental: ['men', 'tal'],
  survive: ['sur', 'vive'],
  progress: ['prog', 'ress'],
  plane: ['plane'],
  encourage: ['en', 'cour', 'age'],
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y'])

const ONSET_CLUSTERS = new Set([
  'bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gh', 'gl', 'gr',
  'ph', 'pl', 'pr', 'qu', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp',
  'st', 'sw', 'th', 'tr', 'tw', 'wh', 'wr', 'sch', 'scr', 'shr',
  'spl', 'spr', 'squ', 'str', 'thr',
])

function isVowel(ch: string): boolean {
  return VOWELS.has(ch.toLowerCase())
}

function splitSingleToken(token: string): string[] {
  const lower = token.toLowerCase()
  if (EXACT_SYLLABLES[lower] && EXACT_SYLLABLES[lower].join('').toLowerCase() === lower) {
    const out: string[] = []
    let pos = 0
    for (const part of EXACT_SYLLABLES[lower]) {
      out.push(token.slice(pos, pos + part.length))
      pos += part.length
    }
    return out
  }

  if (token.length <= 4) return [token]

  const n = lower.length
  const nuclei: Array<[number, number]> = []
  let i = 0
  while (i < n) {
    const isQuVowel = i > 0 && lower[i - 1] === 'q' && lower[i] === 'u' && i + 1 < n && isVowel(lower[i + 1])
    if (isVowel(lower[i]) && !isQuVowel) {
      const start = i
      while (i + 1 < n && isVowel(lower[i + 1])) {
        const pair = lower.slice(i, i + 2)
        if (['ia', 'io', 'ua', 'uo', 'eo', 'iu'].includes(pair) && start === i) {
          const prev = i > 0 ? lower[i - 1] : ''
          if (!['c', 't', 's', 'g', 'x'].includes(prev)) {
            i += 1
            break
          }
        }
        i += 1
      }
      nuclei.push([start, i])
    }
    i += 1
  }

  if (nuclei.length > 1) {
    const last = nuclei[nuclei.length - 1]
    if (last[0] === n - 1 && lower[n - 1] === 'e') {
      const isConsonantLe = n >= 3 && lower[n - 2] === 'l' && !isVowel(lower[n - 3])
      if (!isConsonantLe) {
        nuclei.pop()
      }
    }
  }

  if (nuclei.length <= 1) return [token]

  const cuts: number[] = []
  for (let k = 0; k < nuclei.length - 1; k++) {
    const endLeft = nuclei[k][1]
    const startRight = nuclei[k + 1][0]
    const consonantCount = startRight - endLeft - 1

    let cut = endLeft + 1
    if (consonantCount <= 0) {
      cut = startRight
    } else if (consonantCount === 1) {
      cut = endLeft + 1
    } else {
      const lastTwo = lower.slice(startRight - 2, startRight)
      const lastThree = consonantCount >= 3 ? lower.slice(startRight - 3, startRight) : ''
      if (lastThree && ONSET_CLUSTERS.has(lastThree)) {
        cut = startRight - 3
      } else if (ONSET_CLUSTERS.has(lastTwo)) {
        cut = startRight - 2
      } else {
        cut = startRight - 1
      }
    }
    if (cut > (cuts.at(-1) ?? 0) && cut < n) {
      cuts.push(cut)
    }
  }

  if (cuts.length === 0) return [token]
  const chunks: string[] = []
  let prev = 0
  for (const c of cuts) {
    chunks.push(token.slice(prev, c))
    prev = c
  }
  chunks.push(token.slice(prev))
  return chunks
}

export type SyllableSegment = {
  text: string
  start: number
  end: number
  isSeparator?: boolean
}

export function splitWordSyllables(word: string): SyllableSegment[] {
  const lower = word.toLowerCase()
  if (EXACT_SYLLABLES[lower] && EXACT_SYLLABLES[lower].join('').toLowerCase() === lower) {
    const out: SyllableSegment[] = []
    let pos = 0
    for (const part of EXACT_SYLLABLES[lower]) {
      const len = part.length
      out.push({ text: word.slice(pos, pos + len), start: pos, end: pos + len })
      pos += len
    }
    return out
  }

  const parts = word.split(/([ -])/)
  const out: SyllableSegment[] = []
  let offset = 0
  for (const part of parts) {
    if (!part) continue
    if (part === ' ' || part === '-') {
      out.push({ text: part, start: offset, end: offset + part.length, isSeparator: true })
      offset += part.length
    } else {
      const subChunks = splitSingleToken(part)
      for (const sc of subChunks) {
        out.push({ text: sc, start: offset, end: offset + sc.length })
        offset += sc.length
      }
    }
  }
  return out
}
