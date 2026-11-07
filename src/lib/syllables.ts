/**
 * Splits an English headword into readable phonetic/orthographic syllable chunks
 * whose concatenation `.join('')` is strictly identical to `word`.
 */

export const EXACT_SYLLABLES: Record<string, string[]> = {
  abandon: ['a', 'ban', 'don'],
  challenge: ['chal', 'lenge'],
  benefit: ['be', 'ne', 'fit'],
  collapse: ['col', 'lapse'],
  significant: ['sig', 'ni', 'fi', 'cant'],
  adequate: ['a', 'de', 'quate'],
  environment: ['en', 'vi', 'ron', 'ment'],
  factor: ['fac', 'tor'],
  approach: ['ap', 'proach'],
  evidence: ['e', 'vi', 'dence'],
  adjacent: ['ad', 'ja', 'cent'],
  structure: ['struc', 'ture'],
  available: ['a', 'vai', 'la', 'ble'],
  impact: ['im', 'pact'],
  strategy: ['stra', 'te', 'gy'],
  arbitrary: ['ar', 'bi', 'tra', 'ry'],
  process: ['pro', 'cess'],
  authority: ['au', 'tho', 'ri', 'ty'],
  feature: ['fea', 'ture'],
  capacity: ['ca', 'pa', 'ci', 'ty'],
  resource: ['re', 'source'],
  access: ['ac', 'cess'],
  potential: ['po', 'ten', 'tial'],
  method: ['me', 'thod'],
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
  category: ['ca', 'te', 'go', 'ry'],
  generate: ['ge', 'ne', 'rate'],
  involve: ['in', 'volve'],
  abstract: ['ab', 'stract'],
  contribute: ['con', 'tri', 'bute'],
  demonstrate: ['de', 'mon', 'strate'],
  aware: ['a', 'ware'],
  interpret: ['in', 'ter', 'pret'],
  consequence: ['con', 'se', 'quence'],
  proportion: ['pro', 'por', 'tion'],
  technique: ['tech', 'nique'],
  phenomenon: ['phe', 'no', 'me', 'non'],
  support: ['sup', 'port'],
  issue: ['is', 'sue'],
  create: ['cre', 'ate'],
  recreate: ['re', 'cre', 'ate'],
  community: ['com', 'mu', 'ni', 'ty'],
  source: ['source'],
  policy: ['po', 'li', 'cy'],
  industry: ['in', 'dus', 'try'],
  produce: ['pro', 'duce'],
  energy: ['e', 'ner', 'gy'],
  individual: ['in', 'di', 'vi', 'du', 'al'],
  range: ['range'],
  suggest: ['sug', 'gest'],
  material: ['ma', 'te', 'ri', 'al'],
  reduce: ['re', 'duce'],
  population: ['po', 'pu', 'la', 'tion'],
  theory: ['the', 'o', 'ry'],
  discover: ['dis', 'co', 'ver'],
  depend: ['de', 'pend'],
  behaviour: ['be', 'ha', 'viour'],
  economy: ['e', 'co', 'no', 'my'],
  species: ['spe', 'cies'],
  admit: ['ad', 'mit'],
  trouble: ['trou', 'ble'],
  traditional: ['tra', 'di', 'tio', 'nal'],
  southern: ['sou', 'thern'],
  expert: ['ex', 'pert'],
  strength: ['strength'],
  prison: ['pri', 'son'],
  totally: ['to', 'tal', 'ly'],
  relation: ['re', 'la', 'tion'],
  resident: ['re', 'si', 'dent'],
  limited: ['li', 'mi', 'ted'],
  previously: ['pre', 'vi', 'ous', 'ly'],
  critical: ['cri', 'ti', 'cal'],
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
  progress: ['pro', 'gress'],
  plane: ['plane'],
  encourage: ['en', 'cou', 'rage'],
  zone: ['zone'],
  wild: ['wild'],
  prefer: ['pre', 'fer'],
  obtain: ['ob', 'tain'],
  shift: ['shift'],
  accident: ['ac', 'ci', 'dent'],
  port: ['port'],
  theme: ['theme'],
  quote: ['quote'],
  fee: ['fee'],
  faith: ['faith'],
  desire: ['de', 'sire'],
  task: ['task'],
  theatre: ['the', 'a', 'tre'],
  prime: ['prime'],
  appeal: ['ap', 'peal'],
  variety: ['va', 'ri', 'e', 'ty'],
  net: ['net'],
  advance: ['ad', 'vance'],
  audience: ['au', 'di', 'ence'],
  combine: ['com', 'bine'],
  background: ['back', 'ground'],
  command: ['com', 'mand'],
  van: ['van'],
  balance: ['ba', 'lance'],
  fellow: ['fel', 'low'],
  silver: ['sil', 'ver'],
  tear: ['tear'],
  signal: ['sig', 'nal'],
  argument: ['ar', 'gu', 'ment'],
  temperature: ['tem', 'pe', 'ra', 'ture'],
  capture: ['cap', 'ture'],
  negative: ['ne', 'ga', 'tive'],
  intend: ['in', 'tend'],
  institution: ['in', 'sti', 'tu', 'tion'],
  obviously: ['ob', 'vi', 'ous', 'ly'],
  beginning: ['be', 'gin', 'ning'],
  reply: ['re', 'ply'],
  apparently: ['ap', 'pa', 'rent', 'ly'],
  ignore: ['ig', 'nore'],
  witness: ['wit', 'ness'],
  client: ['cli', 'ent'],
  surround: ['sur', 'round'],
  lock: ['lock'],
  platform: ['plat', 'form'],
  route: ['route'],
  description: ['de', 'scrip', 'tion'],
  failure: ['fai', 'lure'],
  shipbuilding: ['ship', 'buil', 'ding'],
  dangerous: ['dan', 'ge', 'rous'],
  hunt: ['hunt'],
  debate: ['de', 'bate'],
  graduate: ['gra', 'du', 'ate'],
  path: ['path'],
  pattern: ['pat', 'tern'],
  extremely: ['ex', 'treme', 'ly'],
  sample: ['sam', 'ple'],
  organise: ['or', 'ga', 'nise'],
  finger: ['fin', 'ger'],
  alternative: ['al', 'ter', 'na', 'tive'],
  spirit: ['spi', 'rit'],
  requirement: ['re', 'quire', 'ment'],
  giant: ['gi', 'ant'],
  fuel: ['fu', 'el'],
  crowd: ['crowd'],
  impossible: ['im', 'pos', 'si', 'ble'],
  youth: ['youth'],
  consumer: ['con', 'su', 'mer'],
  apart: ['a', 'part'],
  chain: ['chain'],
  engage: ['en', 'gage'],
  proud: ['proud'],
  rare: ['rare'],
  engineering: ['en', 'gi', 'nee', 'ring'],
  belong: ['be', 'long'],
  expand: ['ex', 'pand'],
  leadership: ['lea', 'der', 'ship'],
  invite: ['in', 'vite'],
  possibly: ['pos', 'si', 'bly'],
  beauty: ['beau', 'ty'],
  software: ['soft', 'ware'],
  housing: ['hou', 'sing'],
  reflect: ['re', 'flect'],
  threat: ['threat'],
  entry: ['en', 'try'],
  transport: ['trans', 'port'],
  marketing: ['mar', 'ke', 'ting'],
  trend: ['trend'],
  chapter: ['chap', 'ter'],
  ad: ['ad'],
  alive: ['a', 'live'],
  conflict: ['con', 'flict'],
  deny: ['de', 'ny'],
  aspect: ['as', 'pect'],
  joint: ['joint'],
  assistant: ['as', 'sis', 'tant'],
  draft: ['draft'],
  branch: ['branch'],
  tend: ['tend'],
  settle: ['set', 'tle'],
  core: ['core'],
  magic: ['ma', 'gic'],
  sector: ['sec', 'tor'],
  tank: ['tank'],
  slightly: ['slight', 'ly'],
  valley: ['val', 'ley'],
  mexico: ['me', 'xi', 'co'],
  unique: ['u', 'nique'],
  iron: ['i', 'ron'],
  violence: ['vi', 'o', 'lence'],
  stream: ['stream'],
  emergency: ['e', 'mer', 'gen', 'cy'],
  regulation: ['re', 'gu', 'la', 'tion'],
  technical: ['tech', 'ni', 'cal'],
  cultural: ['cul', 'tu', 'ral'],
  concerned: ['con', 'cerned'],
  lift: ['lift'],
  ruin: ['ru', 'in'],
  web: ['web'],
  pound: ['pound'],
  blame: ['blame'],
  mount: ['mount'],
  novel: ['no', 'vel'],
  apartment: ['a', 'part', 'ment'],
  suspect: ['sus', 'pect'],
  storm: ['storm'],
  adopt: ['a', 'dopt'],
  inch: ['inch'],
  root: ['root'],
  error: ['er', 'ror'],
  corporation: ['cor', 'po', 'ra', 'tion'],
  presence: ['pre', 'sence'],
  shock: ['shock'],
  solid: ['so', 'lid'],
  climate: ['cli', 'mate'],
  weak: ['weak'],
  massive: ['mas', 'sive'],
  upper: ['up', 'per'],
  'large-scale': ['large', '-', 'scale'],
  initial: ['i', 'ni', 'tial'],
  't-shirt': ['t', '-', 'shirt'],
  classic: ['clas', 'sic'],
  proper: ['pro', 'per'],
  delay: ['de', 'lay'],
  secure: ['se', 'cure'],
  willing: ['wil', 'ling'],
  talent: ['ta', 'lent'],
  proof: ['proof'],
  finance: ['fi', 'nance'],
  ill: ['ill'],
  consist: ['con', 'sist'],
  threaten: ['threa', 'ten'],
  regional: ['re', 'gio', 'nal'],
  plate: ['plate'],
  citizen: ['ci', 'ti', 'zen'],
  phase: ['phase'],
  electric: ['e', 'lec', 'tric'],
  entirely: ['en', 'tire', 'ly'],
  rent: ['rent'],
  chemical: ['che', 'mi', 'cal'],
  fantastic: ['fan', 'tas', 'tic'],
  steel: ['steel'],
  industrial: ['in', 'dus', 'tri', 'al'],
  declare: ['de', 'clare'],
  crack: ['crack'],
  possibility: ['pos', 'si', 'bi', 'li', 'ty'],
  knock: ['knock'],
  cycle: ['cy', 'cle'],
  advanced: ['ad', 'vanced'],
  decline: ['de', 'cline'],
  mode: ['mode'],
  soft: ['soft'],
  label: ['la', 'bel'],
  labour: ['la', 'bour'],
  instance: ['in', 'stance'],
  gate: ['gate'],
  prize: ['prize'],
  meaning: ['mea', 'ning'],
  licence: ['li', 'cence'],
  equal: ['e', 'qual'],
  intelligence: ['in', 'tel', 'li', 'gence'],
  neighbourhood: ['neigh', 'bour', 'hood'],
  environmental: ['en', 'vi', 'ron', 'men', 'tal'],
  crew: ['crew'],
  canadian: ['ca', 'na', 'di', 'an'],
  beer: ['beer'],
  procedure: ['pro', 'ce', 'dure'],
  enable: ['e', 'na', 'ble'],
  gather: ['ga', 'ther'],
  territory: ['ter', 'ri', 'to', 'ry'],
  improvement: ['im', 'prove', 'ment'],
  inspire: ['in', 'spire'],
  vision: ['vi', 'sion'],
  native: ['na', 'tive'],
  invest: ['in', 'vest'],
  producer: ['pro', 'du', 'cer'],
  setting: ['set', 'ting'],
  incident: ['in', 'ci', 'dent'],
  thinking: ['thin', 'king'],
  era: ['e', 'ra'],
  minimum: ['mi', 'ni', 'mum'],
  domestic: ['do', 'mes', 'tic'],
  historical: ['his', 'to', 'ri', 'cal'],
  originally: ['o', 'ri', 'gi', 'nal', 'ly'],
  suddenly: ['sud', 'den', 'ly'],
  journey: ['jour', 'ney'],
  appearance: ['ap', 'pea', 'rance'],
  politician: ['po', 'li', 'ti', 'cian'],
  highlight: ['high', 'light'],
  understanding: ['un', 'der', 'stan', 'ding'],
  scotland: ['scot', 'land'],
  chase: ['chase'],
  scheme: ['scheme'],
  component: ['com', 'po', 'nent'],
  ancient: ['an', 'cient'],
  speaker: ['spea', 'ker'],
  split: ['split'],
  attitude: ['at', 'ti', 'tude'],
  illegal: ['il', 'le', 'gal'],
  investigate: ['in', 'ves', 'ti', 'gate'],
  frame: ['frame'],
  height: ['height'],
  combination: ['com', 'bi', 'na', 'tion'],
  expose: ['ex', 'pose'],
  pilot: ['pi', 'lot'],
  danger: ['dan', 'ger'],
  repair: ['re', 'pair'],
  protein: ['pro', 'tein'],
  scientific: ['sci', 'en', 'ti', 'fic'],
  lane: ['lane'],
  publication: ['pub', 'li', 'ca', 'tion'],
  guarantee: ['gua', 'ran', 'tee'],
  rank: ['rank'],
  trick: ['trick'],
  belief: ['be', 'lief'],
  panel: ['pa', 'nel'],
  acquire: ['ac', 'quire'],
  inform: ['in', 'form'],
  origin: ['o', 'ri', 'gin'],
  minor: ['mi', 'nor'],
  kingdom: ['king', 'dom'],
  proposal: ['pro', 'po', 'sal'],
  attract: ['at', 'tract'],
  comfortable: ['com', 'for', 'ta', 'ble'],
  crisis: ['cri', 'sis'],
  remind: ['re', 'mind'],
  appoint: ['ap', 'point'],
  relatively: ['re', 'la', 'tive', 'ly'],
  warn: ['warn'],
  italy: ['i', 'ta', 'ly'],
  internal: ['in', 'ter', 'nal'],
  ton: ['ton'],
  wage: ['wage'],
  emotional: ['e', 'mo', 'tio', 'nal'],
  studio: ['stu', 'di', 'o'],
  plot: ['plot'],
  motor: ['mo', 'tor'],
  passenger: ['pas', 'sen', 'ger'],
  stadium: ['sta', 'di', 'um'],
  mate: ['mate'],
  photograph: ['pho', 'to', 'graph'],
  relative: ['re', 'la', 'tive'],
  ireland: ['ire', 'land'],
  asia: ['a', 'sia'],
  broad: ['broad'],
  compete: ['com', 'pete'],
  trap: ['trap'],
  essential: ['es', 'sen', 'tial'],
  divide: ['di', 'vide'],
  definition: ['de', 'fi', 'ni', 'tion'],
  assist: ['as', 'sist'],
  urban: ['ur', 'ban'],
  tradition: ['tra', 'di', 'tion'],
  experiment: ['ex', 'pe', 'ri', 'ment'],
  identity: ['i', 'den', 'ti', 'ty'],
  peak: ['peak'],
  explore: ['ex', 'plore'],
  volunteer: ['vo', 'lun', 'teer'],
  recover: ['re', 'co', 'ver'],
  confidence: ['con', 'fi', 'dence'],
  numerous: ['nu', 'me', 'rous'],
  specifically: ['spe', 'ci', 'fi', 'cal', 'ly'],
  battery: ['bat', 'te', 'ry'],
  personality: ['per', 'so', 'na', 'li', 'ty'],
  distribution: ['dis', 'tri', 'bu', 'tion'],
  crown: ['crown'],
  implement: ['im', 'ple', 'ment'],
  chart: ['chart'],
  circumstance: ['cir', 'cum', 'stance'],
  contribution: ['con', 'tri', 'bu', 'tion'],
  install: ['in', 'stall'],
  corporate: ['cor', 'po', 'rate'],
  portion: ['por', 'tion'],
  pure: ['pure'],
  approximately: ['ap', 'pro', 'xi', 'mate', 'ly'],
  friendly: ['friend', 'ly'],
  expression: ['ex', 'pres', 'sion'],
  properly: ['pro', 'per', 'ly'],
  academic: ['a', 'ca', 'de', 'mic'],
  aircraft: ['air', 'craft'],
  submit: ['sub', 'mit'],
  delivery: ['de', 'li', 've', 'ry'],
  crash: ['crash'],
  slowly: ['slow', 'ly'],
  extreme: ['ex', 'treme'],
  basically: ['ba', 'si', 'cal', 'ly'],
  incredible: ['in', 'cre', 'di', 'ble'],
  seed: ['seed'],
  household: ['house', 'hold'],
  tiny: ['ti', 'ny'],
  occasion: ['oc', 'ca', 'sion'],
  reject: ['re', 'ject'],
  observe: ['ob', 'serve'],
  package: ['pac', 'kage'],
  counter: ['coun', 'ter'],
  chat: ['chat'],
  motion: ['mo', 'tion'],
  adventure: ['ad', 'ven', 'ture'],
  obvious: ['ob', 'vi', 'ous'],
  funding: ['fun', 'ding'],
  coverage: ['co', 've', 'rage'],
  muscle: ['mus', 'cle'],
  emerge: ['e', 'merge'],
  learning: ['lear', 'ning'],
  medium: ['me', 'di', 'um'],
  typically: ['ty', 'pi', 'cal', 'ly'],
  attach: ['at', 'tach'],
  selection: ['se', 'lec', 'tion'],
  diet: ['di', 'et'],
  recall: ['re', 'call'],
  opposite: ['op', 'po', 'site'],
  planning: ['plan', 'ning'],
  usual: ['u', 'su', 'al'],
  stretch: ['stretch'],
  literature: ['li', 'te', 'ra', 'ture'],
  unfortunately: ['un', 'for', 'tu', 'nate', 'ly'],
  permit: ['per', 'mit'],
  depth: ['depth'],
  largely: ['large', 'ly'],
  succeed: ['suc', 'ceed'],
  convince: ['con', 'vince'],
  upset: ['up', 'set'],
  familiar: ['fa', 'mi', 'li', 'ar'],
  seal: ['seal'],
  unable: ['u', 'na', 'ble'],
  reward: ['re', 'ward'],
  alcohol: ['al', 'co', 'hol'],
  afford: ['af', 'ford'],
  pitch: ['pitch'],
  perfectly: ['per', 'fect', 'ly'],
  rescue: ['res', 'cue'],
  relevant: ['re', 'le', 'vant'],
  employ: ['em', 'ploy'],
  sheet: ['sheet'],
  entertainment: ['en', 'ter', 'tain', 'ment'],
  layer: ['lay', 'er'],
  province: ['pro', 'vince'],
  creation: ['cre', 'a', 'tion'],
  educational: ['e', 'du', 'ca', 'tio', 'nal'],
  defend: ['de', 'fend'],
  creative: ['cre', 'a', 'tive'],
  encounter: ['en', 'coun', 'ter'],
  maximum: ['ma', 'xi', 'mum'],
  trail: ['trail'],
  appointment: ['ap', 'point', 'ment'],
  complain: ['com', 'plain'],
  mainly: ['main', 'ly'],
  wales: ['wales'],
  arts: ['arts'],
  trading: ['tra', 'ding'],
  salt: ['salt'],
  statistics: ['sta', 'tis', 'tics'],
  goods: ['goods'],
  legend: ['le', 'gend'],
  string: ['string'],
  roof: ['roof'],
  rural: ['ru', 'ral'],
  typical: ['ty', 'pi', 'cal'],
  emotion: ['e', 'mo', 'tion'],
  spain: ['spain'],
  gender: ['gen', 'der'],
  disappear: ['di', 'sap', 'pear'],
  monitor: ['mo', 'ni', 'tor'],
  universe: ['u', 'ni', 'verse'],
  settlement: ['set', 'tle', 'ment'],
  highway: ['high', 'way'],
  pacific: ['pa', 'ci', 'fic'],
  instrument: ['in', 'stru', 'ment'],
  assistance: ['as', 'sis', 'tance'],
  comparison: ['com', 'pa', 'ri', 'son'],
  reasonable: ['rea', 'so', 'na', 'ble'],
  aside: ['a', 'side'],
  manufacturer: ['ma', 'nu', 'fac', 'tu', 'rer'],
  rely: ['re', 'ly'],
  difficulty: ['dif', 'fi', 'cul', 'ty'],
  random: ['ran', 'dom'],
  recovery: ['re', 'co', 've', 'ry'],
  gap: ['gap'],
  complaint: ['com', 'plaint'],
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
      const isSeparator = part === ' ' || part === '-'
      out.push({
        text: word.slice(pos, pos + len),
        start: pos,
        end: pos + len,
        ...(isSeparator ? { isSeparator: true } : {}),
      })
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

const IPA_VOWEL_RE = /[ɑæʌɔəɛɜɪiʊuɒeaouɐɚɝ]+/g

/**
 * Returns the 0-based syllable index (among non-separator segments of `splitWordSyllables(word)`)
 * that carries primary lexical stress (`ˈ`) according to `ipa`.
 */
export function getStressedSyllableIndex(word: string, ipa?: string): number {
  const syls = splitWordSyllables(word).filter((s) => !s.isSeparator)
  if (syls.length <= 1) return 0
  if (!ipa) return 0
  const stressPos = ipa.indexOf('ˈ')
  if (stressPos < 0) return 0
  const prefix = ipa.slice(0, stressPos)
  const matches = prefix.match(IPA_VOWEL_RE)
  const countBefore = matches ? matches.length : 0
  return Math.min(syls.length - 1, countBefore)
}
