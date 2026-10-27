# ClawWords prototype-v2 — Gemini 4 free redesign

You are redesigning ClawWords as a **new clickable Vite+React+TS prototype** in THIS directory (`~/clawwords-proto-v2`). Owner approved **full creative freedom** — do NOT reuse v1 CSS structure / class names / page layout. Old code is only reference for product loop + mock lexicon.

## Product lock (must keep)
ClawWords = **暗色私教图鉴 × 短关卡通关 × 中译英 Boss**
- Face: 词光画廊感 — 一词一画舞台、实体卡
- Rhythm: Duo 关卡骨架 but **no green bird skin** — 今日一关 / 再来一关; **NO XP, streaks, leaderboard, badge wall**
- Tone: Babbel adult private tutor (中文 UI 文案)
- Context: keep/strengthen examples + collocations; highlight target word in examples
- Discipline: due-review first (stub ok via `dueIds`)
- **Still no WeChat**

## Learning loop (keep working; reuse data/lib)
Already present (keep & wire):
- `src/data/words.ts` — mock lexicon (~50 words)
- `src/lib/storage.ts` — localStorage progress (use new key `clawwords.progress.v2` to avoid clobbering v1)
- `src/lib/session.ts` — pickNewWords / dueWords / mcqOptions / markLearned
- `src/lib/grader.ts` — 中译英 grader

Flow must be clickable:
1. Tip (first open, skippable) → Today「今日一关」私教便签 (温故/知新)
2. Start → optional review cards → learn cards (一词一画) → every 5 words: Quiz MCQ (选义) → Quiz Write (中译英 Boss)
3. Done → 通关战报/日签卡 +「再来一关（5 词）」
4. Settings → export JSON; dangerous clear de-emphasized

Hash routes ok: `#/tip` `#/today` `#/flow` `#/settings`

Reference only (do not copy CSS structure): `_ref/v1-src/` and `AUDIT_aesthetic.md`

## Visual freedom (Owner wants Gemini 4 taste)
Invent a fresh design system. Inspiration directions (pick boldly, not clone):
- Obsidian / ink black + electric blue OR amber gold (Linear / Raycast / Readwise Reader vibe)
- Desktop vertically centered stage; entity card with soft depth
- Typographic poster “illus” frame (≥220px) using sceneHook — not a broken skeleton bar
- Serif/display headword; keycap-style quiz options; flow progress
- Done page = ceremony / day-stamp report, not “不错收工了”
- Today = tutor sticky note, not CRM three-stat strip
- Settings: clear progress as ghost/danger text, not full-width peer of Export

Chinese copy throughout. Adult tutor voice.

## Deliverables
1. Replace stub `App.tsx` / `index.css`; create pages/components as you like (new names OK)
2. `npm run build` must pass
3. Write `README.md` — how to run (`npm run dev` → localhost:5173), positioning one-liner, highlight list
4. Write `HIGHLIGHTS.md` — 5–10 bullet visual/UX highlights for the owner
5. Do NOT touch WeChat; do NOT change anything outside this directory

## Done criteria
- Open → tip/today → complete a short round (or navigate all screens) without crash
- Build green
- Visually distinct from v1 (new layout language)

Start implementing now. Prefer complete working UI over half-finished polish.
