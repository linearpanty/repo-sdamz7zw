export type GradeResult = {
  ok: boolean
  correct: string
  variants?: string[]
  feedback?: string
}

/** ClawBot-shaped mock grader for 中译英 */
export function gradeTranslation(
  input: string,
  expected: string,
  variants: string[] = [],
): GradeResult {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/\s+/g, ' ')

  const got = norm(input)
  const all = [expected, ...variants].map(norm).filter(Boolean)

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
      feedback: got === norm(expected) ? '完全正确' : '可接受变体',
    }
  }

  // tiny fuzzy: allow trailing 's' / 'ed' / 'ing' if expected base matches
  const strip = (s: string) => s.replace(/(ing|ed|es|s)$/i, '')
  if (all.some((a) => strip(a) === strip(got) && Math.abs(a.length - got.length) <= 3)) {
    return {
      ok: true,
      correct: expected,
      variants: variants.length ? variants : undefined,
      feedback: '形态接近，算对',
    }
  }

  return {
    ok: false,
    correct: expected,
    variants: variants.length ? variants : undefined,
    feedback: `答案是 ${expected}`,
  }
}
