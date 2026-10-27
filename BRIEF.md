# ClawWords Light Illustrated — Gemini 4 (Owner correction)

Work ONLY in `/Users/zettareinger/clawwords-light-illustrated`.

Owner correction: keep the **illustrated dual-column Gemini 4 atelier layout** from prototype-v2 (NOT the narrow 440px no-image Omarchy stack). Only change palette to **light**.

## Structure (KEEP / restore from current v2 code)
- Views: `TutorDeskView` (今日桌), `LexiconStageView` (双栏：左画面/sceneHook 海报 ≥220–250px + 右档案), `IntuitionQuizView`, `BossWriteView`, `DayStampView`, `StudioSettingsView`
- **REMOVE Manifesto / Tip / AI 卖点序言** — default route `#/today` only; tipSeen always true; no tip wall
- Desktop-friendly dual-column word stage with visual illus / typographic sceneHook poster (带图视觉层次)
- Do NOT collapse back to phone-only 440px stack without image panel

## Theme (CHANGE to light)
- Paper white / warm gray bg, deep ink text, hairline borders, flat elegant
- Remove obsidian black, brass lamp glow, neon electric blue chrome
- Keep visual hierarchy of the poster frame, soft pastel washes from word.color, serif headword — just on light paper
- Inspiration: Readwise Reader light / Apple Books / printed lexicon atlas on cream paper

## Behavior locks (MUST)
1. Default `#/today`
2. On LexiconStage (learn + review): **hand-type English spelling must pass** (`gradeTranslation`) before advancing — see `_ref/WordCard-spell-speech.tsx` for pattern; adapt into LexiconStageView
3. Headword row: IPA + 「朗读」 button via `speechSynthesis` en-US
4. Keep 中译英 Boss (`BossWriteView`), MCQ intuition quiz, day stamp + 再来一关
5. Storage key `clawwords.progress.v2`
6. `vite.config.ts` `base: '/repo-sdamz7zw/'`
7. No WeChat, no XP/streaks/leaderboard

## Deliverables
1. Full light restyle of CSS + any view tweaks; spell gate + 朗读 wired
2. `npm run build` green
3. Rewrite `README.md` + `HIGHLIGHTS.md` for this light-illustrated edition
4. Do not push GitHub (Hoppi will)

Start implementing now.
