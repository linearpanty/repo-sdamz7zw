# 词卡 · ClawWords — Gemini 4 audit fix (Owner lock)

Work ONLY in `/Users/zettareinger/clawwords-light-illustrated`.

Brand: Chinese **词卡**; English **ClawWords**. Remove all「词光」「词光私教馆」「词私教 Lab」product branding. Title/manifest/副标 → `ClawWords · 词卡` or `词卡`.

Read `AUDIT_clawwords_live.md` Must 1–8 (and easy Shoulds if quick). Implement all Musts.

## Must checklist
1. **manifest + index.html**: `public/manifest.webmanifest` → name/short_name 词卡/ClawWords, `start_url`+`scope` `/repo-sdamz7zw/`, theme/background `#f6f5f2`. `index.html`: favicon.svg (not vite.svg), title `ClawWords · 词卡`, theme-color `#f6f5f2`, description without 词光. Keep `base: '/repo-sdamz7zw/'`.
2. **Spell gate no leak**: placeholder neutral（如「手打这个词，Enter 确认」）；wrong feedback only first letter + length（如 `a·······（8）`），never full word.
3. **Grader tighten**: Add `gradeExact(input, expected)` for spell gate — exact match ignore case/trim only. Boss `gradeTranslation` may allow `variants` whitelist but **remove** suffix-strip fuzzy (`ing|ed|es|s`). `accesed` must fail for `access`.
4. **Refresh `#/flow`**: if no in-memory session, `location.replace('#/today')`. Do NOT auto-start extra round on Done refresh. Optional: persist session lightly; minimum is redirect.
5. **Review recall mode**: on review LexiconStage, hide headword+IPA; show Chinese + sceneHook + 朗读; require spell gate. Wrong MCQ/Boss → push word id to `dueIds`; only Boss pass adds to `learnedIds` (light change in App/session).
6. Brand **词卡** everywhere (grep 词光/私教馆/词私教 Lab).
7. Delete `.cw-poster-glow` node + CSS; keep soft radial only.
8. TutorDesk/DayStamp copy ≤ ~25 Chinese chars per line; facts + next step only. No long tutor pep talks.

## Audio (files already in `public/audio/us|uk/{id}.mp3`)
Replace Web-Speech-first TTS with:
1. Prefer local `import.meta.env.BASE_URL + 'audio/us/' + id + '.mp3'` (HTMLAudioElement)
2. Else remote `https://0xlei.tech/words/atlas/audio/us/{id}.mp3`
3. Else Web Speech fallback
IPA row keeps 「朗读」. Optional us/uk toggle is nice-to-have; us default OK.
README: one-line credit — 音频来自 Word Atlas Open（CC BY 4.0）https://github.com/designfuchen/word-atlas

## Keep
双栏带图、浅色纸墨、`clawwords.progress.v2`、默认 `#/today`、无微信、无 Tip。

## Should if easy
- Fewer EN kickers; remove FIG//ABANDO / hex color / STORAGE KEY UI leftovers
- `.cw-viewport` → flex-start + padding-top

## Deliver
1. Code complete; `npm run build` green
2. Rewrite `HIGHLIGHTS.md` short: what changed
3. Update README brand + audio credit + how to run

Start now.
