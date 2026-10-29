export type LexiconLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type WordlistSource = 'cefrj-octanove-nawl' | 'cefrj-octanove' | 'nawl'

export type LexiconConfig = {
  /**
   * 1. 词表来源 (Publicly verifiable open IELTS/CEFR graded wordlist source):
   * - 'cefrj-octanove-nawl': CEFR-J Vocabulary Profile v1.5 (A1-B2) + Octanove C1/C2 v1.0 + NAWL 1.0
   * - 'cefrj-octanove': CEFR-J v1.5 + Octanove C1/C2 v1.0 only
   * - 'nawl': New Academic Word List (NAWL 1.0) only
   */
  wordlistSource: WordlistSource
  /**
   * 2. 取哪些等级 (Included proficiency bands; stored strictly in data, never rendered in UI):
   * Default excludes basic A1 words and retains A2-C2 (Cambridge/IELTS Foundation to Band 8.5-9.0).
   */
  includedLevels: readonly LexiconLevel[]
  /**
   * 3. 是否按等级分组 (Whether to group cards by level before frequency ranking):
   * - false (default): global wordfreq Zipf descending order from common to rare across all included levels
   * - true: group by includedLevels order, sorting by wordfreq Zipf descending within each level
   */
  groupByLevel: boolean
}

export const LEXICON_CONFIG: LexiconConfig = {
  wordlistSource: 'cefrj-octanove-nawl',
  includedLevels: ['A2', 'B1', 'B2', 'C1', 'C2'],
  groupByLevel: false,
}
