# ClawWords Light · 词私教 Lab（浅色卡片栈版）

基于 Vite + React + TypeScript 的轻量背词可点原型（GitHub Pages 部署版）。采用**浅色纸感排版 × 手机友好单栏卡片栈 × 词卡手打拼写过关 × 中译英 Boss 检定**，打开即进 `#/today`，无注册墙、无微信入口、无 XP/连胜/排行榜噪音。

## 本地运行与构建

```bash
cd /Users/zettareinger/clawwords-light
npm install
npm run dev      # 本地开发：http://localhost:5173/repo-sdamz7zw/#/today
npm run build    # TypeScript 类型检查 + 生产构建（输出至 dist/）
npm run preview  # 本地预览生产构建
```

## GitHub Pages 子路径与路由说明

- `vite.config.ts` 已配置 `base: '/repo-sdamz7zw/'`，构建产物静态资源路径自动挂载在该子路径下。
- 使用前端 Hash 路由，在 `/repo-sdamz7zw/` 子路径下可直接刷新或跳转：
  - `#/today`：默认首页（直接进入，无 Tip 引导拦截；展示到期复习、计划新词、已学/词库与开始按钮）
  - `#/flow`：学习与检定主循环（复习卡 → 新词卡 → 每 5 词选义 MCQ → 中译英 Boss 默写 → 本关完成 / 再来一关 5 词）
  - `#/settings`：设置页（每日新词数 5–20、导出进度 JSON、降权「清除进度」）

## 核心特性

- **浅色纸感主题**：暖白纸底（`#f6f5f2` / `#faf9f7`）、纯白卡片（`#ffffff`）、深墨字（`#1a1a1a`）、`1px` 细线边框（`#e6e4df`）与克制墨蓝强调色（`#243b55`），参考 Apple Notes / Notion Light / 纸质教材。
- **第一版手机友好卡片栈**：窄栏（`440px`）纵向卡片堆叠，保留 `Today` / `WordCard` / `QuizMCQ` / `QuizWrite` / `Done` / `Settings` 清晰分镜。
- **手打英文拼对过关**：每张 `WordCard`（含新词学习与到期复习）均内置英文拼写输入框，调用 `gradeTranslation`（`src/lib/grader.ts`）实时/回车校验；未拼对前禁用「下一个」按钮，拼写有误时给出温和反馈。
- **词头旁 IPA +「朗读」按钮**：调用浏览器原生 Web Speech API（`speechSynthesis`，`en-US`）朗读当前词头 `word.word`。
- **完整闭环保留**：保留 `src/data/words.ts`、`src/lib/session.ts`、`src/lib/storage.ts`（`clawwords.progress.v2`）、`src/lib/grader.ts` 核心逻辑与「再来一关（5 词）」加练闭环。
