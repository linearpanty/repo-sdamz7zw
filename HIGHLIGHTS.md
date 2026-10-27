# HIGHLIGHTS — ClawWords Light (Gemini 4 Redesign)

- **浅色纸感高定主题（告别暗色海报与霓虹）**：全站切换为纸白/暖灰底（`--bg: #f6f5f2`、内嵌纸卡 `#faf9f7`、主卡 `#ffffff`）、深墨字（`--ink: #1a1a1a`）、`1px` 细线边框（`--hairline: #e6e4df`）与克制钢笔墨蓝强调色（`--accent: #243b55`），扁平素雅，对齐 Apple Notes / Notion Light / 纸质教材质感。
- **回归 v1 手机友好单栏卡片栈**：采用 `440px` 窄栏纵向堆叠舞台，保留 `Today` / `WordCard` / `QuizMCQ` / `QuizWrite` / `Done` / `Settings` 六大经典页面结构，对齐 `audit-shots/{today,card,quiz,settings}.png` 骨架，摒弃双栏画册与冗余包装。
- **零门槛直达 `#/today`（移除 Tip 拦截墙）**：`defaultProgress` 与 `loadProgress` 默认 `tipSeen: true`，路由层移除 Tip 强制跳转，空 hash 或旧 `#/tip` 自动归一至 `#/today`，打开即见今日看板。
- **词卡强制「手打英文拼对过关」**：在 `WordCard`（同时覆盖 `learn` 新词卡与 `review` 复习卡）底部加入手打英文拼写区，接入 `gradeTranslation`（`src/lib/grader.ts`）校验；拼对前禁用「下一个」按钮，拼错或失焦时提供温和私教反馈，拼对后支持一键或回车放行。
- **词头旁 IPA + 原生「朗读」按钮**：在词头与音标旁并排提供「朗读」轻量文字按钮，基于浏览器 Web Speech API（`window.speechSynthesis`，`en-US`）朗读 `word.word`，并对无语音环境做安全容错。
- **轻柔水彩感画面锚点（`.illus`）**：将原有的暗黑渐变海报块改为基于 `word.color` 的低透明度浅色纸面晕染（`color-mix` 柔和粉彩底 + 圆点色标 + 衬线斜体 `sceneHook`），轻盈不抢词头视觉中心。
- **完整保留小节检定与中译英 Boss 闭环**：每学完 5 词进入选义 `QuizMCQ`（支持键盘 `1–4` 与 `Enter`）与主动默写 `QuizWrite`（中译英 Boss），通关后呈现素雅日结卡（`Done`），支持「再来一关（5 词）」加练。
- **本地存储与设置页降权设计**：完整保留 `clawwords.progress.v2` 本地进度结构；`Settings` 页支持调整每日新词数（5–20）与导出 JSON 备份，「清除进度」置于底部细线分割区并以弱化描边按钮降权展示。
- **GitHub Pages 子路径就绪**：`vite.config.ts` 已锁定 `base: '/repo-sdamz7zw/'`，静态资源与相对 manifest/icon 引用均适配子路径，Hash 路由（`#/today`、`#/flow`、`#/settings`）在 GitHub Pages 下开箱可用。
