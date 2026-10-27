# ClawWords Light — Gemini 4 redesign (Owner lock)

Work ONLY in `/Users/zettareinger/clawwords-light`. This is a Vite+React+TS clickable prototype for GitHub Pages.

## Absolute locks
1. **浅色主题**：纸白 / 浅灰底、深墨字、细线边框；扁平、素雅、高端。**禁止**暗色黑曜石、铜光、霓虹电光蓝、深色渐变海报。参考：Apple Notes / Notion light / Linear light / 纸质教材。
2. **第一版排版（手机友好卡片栈）**：保持/回归 pages：`Today` / `WordCard` / `QuizMCQ` / `QuizWrite` / `Done` / `Settings`。窄栏卡片纵向堆叠（~420–460px），**不要**双栏 atelier、不要 Manifesto/StudioSettings/LexiconStage 那套 v2 命名与宽屏画册。
3. 参照 `audit-shots/{today,card,quiz,settings}.png` 的信息结构与页面分镜，但**换成浅色精致排版**（那些截图是暗色旧稿，只当布局骨架）。
4. **默认进 `#/today`**：去掉 Tip / 序言 / AI 卖点开场；`tipSeen` 可直接 true，或删除 Tip 路由强制。打开即 Today。
5. **每个词必须手打英文拼对才能进下一个**：在 `WordCard`（learn + review）加入拼写输入；用 `gradeTranslation`（`src/lib/grader.ts`）校验；拼对前禁用「下一个」；拼错给温和反馈。可保留显示词头（这是学习卡，不是默写 Boss）——但 Owner 要求「手打英文拼对才能进下一个」，所以仍要打对才放行。
6. **词头旁 IPA +「朗读」按钮**：`speechSynthesis` Web Speech，读 `word.word`（en-US）；按钮文案「朗读」。
7. 保留：**中译英 Boss**（QuizWrite）、选义 MCQ、今日一关→通关→再来一关、hash 路由、`clawwords.progress.v2`、无微信、无 XP/连胜/排行榜。
8. **GitHub Pages**：`vite.config.ts` 设 `base: '/repo-sdamz7zw/'`；确认 hash 路由在子路径下可用。
9. 中文 UI 文案，成人私教语气，克制。

## Loop (keep)
- Today → startDaily → review cards → learn cards (每 5 词 quiz-mcq → quiz-write) → Done（再来一关 5 词）
- data/words.ts、lib/session.ts、lib/storage.ts、lib/grader.ts 保留逻辑；可微调 UI 接线。
- Settings：导出 JSON；清除进度降权。

## Visual direction (invent lightly)
- `--bg: #f6f5f2` or paper `#faf9f7`; `--ink: #1a1a1a`; hairline `#e6e4df`; accent one restrained ink-blue or soft charcoal (not neon).
- Soft white card with 1px border, subtle shadow optional but flat-first.
- Headword clear serif or system display; IPA muted; 朗读 as small text button.
- Illus: light pastel wash / soft color chip from word.color at low opacity — not dark poster.
- Quiz options: clean rows with thin borders (key numbers ok, not 3D neon keycaps).
- Done: calm day-complete card, not game stamp chrome.

## Deliverables
1. Implement all UI/CSS/pages; build green: `npm run build`
2. Self-smoke: ensure routes work with base path conceptually; no Tip wall
3. `README.md` — how to run locally + note Pages base
4. `HIGHLIGHTS.md` — 6–10 bullets for Owner/Hoppi (浅色、v1 栈、拼写过关、朗读、Pages base…)
5. Do not push GitHub yourself; Hoppi pushes gh-pages

Start now. Prefer complete working light UI over half polish.
