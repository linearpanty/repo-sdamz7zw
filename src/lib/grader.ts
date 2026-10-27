export type GradeResult = {
  ok: boolean
  correct: string
  variants?: string[]
  feedback?: string
}

function normalizeWord(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
}

/** Format first letter + length mask, e.g. "abandon" -> "a······（7）" */
export function maskWordHint(word: string): string {
  const clean = word.trim()
  if (!clean) return ''
  return `${clean[0]}${'·'.repeat(Math.max(1, clean.length - 1))}（${clean.length}）`
}

/** Exact match for Spell Gate (ignore case/trim only, never leaks full word) */
export function gradeExact(input: string, expected: string): GradeResult {
  const got = normalizeWord(input)
  const target = normalizeWord(expected)
  const hint = maskWordHint(expected)

  if (!got) {
    return {
      ok: false,
      correct: expected,
      feedback: `提示：${hint}`,
    }
  }

  if (got === target) {
    return {
      ok: true,
      correct: expected,
      feedback: '拼写正确',
    }
  }

  return {
    ok: false,
    correct: expected,
    feedback: `再试一次 · ${hint}`,
  }
}

/** Boss grader for 中译英: exact headword or whitelisted variants only (no suffix-strip fuzzy) */
export function gradeTranslation(
  input: string,
  expected: string,
  variants: string[] = [],
): GradeResult {
  const got = normalizeWord(input)
  const all = [expected, ...variants].map(normalizeWord).filter(Boolean)

  if (!got) {
    return {
      ok: false,
      correct: expected,
      variants: variants.length ? variants : undefined,
      feedback: '请输入英文单词',
    }
  }

  if (all.includes(got)) {
    return {
      ok: true,
      correct: expected,
      variants: variants.length ? variants : undefined,
      feedback: got === normalizeWord(expected) ? '完全正确' : '可接受变体',
    }
  }

  return {
    ok: false,
    correct: expected,
    variants: variants.length ? variants : undefined,
    feedback: `答案是 ${expected}`,
  }
}
