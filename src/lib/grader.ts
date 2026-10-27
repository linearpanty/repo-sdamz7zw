export type GradeResult = {
  ok: boolean
  correct: string
}

function normalizeWord(s: string): string {
  return s.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ')
}

/** First letter plus a length mask, e.g. "abandon" -> "a······（7）". */
export function maskWordHint(word: string): string {
  const clean = word.trim()
  if (!clean) return ''
  return `${clean[0]}${'·'.repeat(Math.max(1, clean.length - 1))}（${clean.length}）`
}

/** Exact headword match. Ignores case and surrounding space. */
export function gradeExact(input: string, expected: string): GradeResult {
  const got = normalizeWord(input)
  const target = normalizeWord(expected)
  return { ok: got.length > 0 && got === target, correct: expected }
}
