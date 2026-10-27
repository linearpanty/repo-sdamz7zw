# ClawWords 现网审计（light-illustrated）

> 审计对象：https://linearpanty.github.io/repo-sdamz7zw/#/today ｜ 源码 `prototype-light-illustrated/` ｜ 2026-10-27
> 证据来源：源码通读、3 张截图、curl 现网（index.html / manifest / assets / 404 路由）、grader 本地实测。

## 总评
- **大方向：稳。** 双栏图鉴、浅色纸墨配色、手打拼写门禁、MCQ → Boss → 日签闭环都已落地，截图观感克制，没有走霓虹 AI 风。
- **评分：7/10**
- 主要扣分在这几处：拼写门禁“名为默写，实为抄写”，而且判分偏宽；本地源码和现网产物不一致；刷新后会悄悄开新关；文案里还有“私教腔”和中英双语装饰标签。这些都是局部修补，不需要改结构。

## 必须改（Must）

1. **本地源码/dist 与现网不一致，下次重新部署会把已修好的东西改坏**
   - 证据：现网 `manifest.webmanifest` 的 `start_url/scope` 是 `/repo-sdamz7zw/`、底色 `#f6f5f2`；本地 `public/manifest.webmanifest` 和 `dist/manifest.webmanifest` 却是 `start_url: "/"`、`background/theme_color: #0f1115`（旧的深色主题）。本地 `index.html:5` 引用 `/vite.svg`，这个文件不存在（现网 `vite.svg` 返回 404），现网用的是 `favicon.svg`。
   - 影响：从这份源码重新构建上线，PWA 的启动地址和配色都会退回旧版。
   - 修复：把现网的 manifest 和 favicon 改动同步回 `public/` 与 `index.html`，删掉过期的 `dist/`，部署统一走 CI 构建。

2. **拼写门禁在泄题：placeholder 直接写出答案**
   - 证据：`LexiconStageView.tsx:294` `placeholder={\`手打输入 ${word.word}…\`}`；截图 lexicon_stage 里输入框显示“手打输入 abandon…”。答错提示 `:323-324` 也会再给一次完整拼写。
   - 影响：学新词时词头本来就在上方，这一步本质是抄写；placeholder 再给答案，就成了“看着框里的字照打”，和 locked 方向 3（手打门禁）的本意相反。
   - 修复：placeholder 换成中性文案，比如“手打这个词，Enter 确认”。答错提示只给首字母和字母数，不给全词。

3. **门禁和 Boss 判分太宽，错拼也能过**
   - 证据：`grader.ts:43-50` 会剥掉 `ing|ed|es|s` 再比较。本地实测：`access` ← `accesed` / `accesing` 判对（属于拼错）。`LexiconStageView.tsx:88-93` 允许“形态接近，算对”的输入解锁；`variants` 精确匹配也会放行，学 `abandon` 时打 `abandoned` 能直接过。
   - 影响：门禁和 Boss 的正确率虚高，日签上的“命中率”不可信。
   - 修复：拼写门禁只接受 `word.word` 精确匹配（忽略大小写和首尾空格）。Boss 可以接受 `variants` 白名单，但去掉后缀剥离这条模糊规则，或者改成编辑距离 ≤1 时提示“接近，再试一次”，不判对。

4. **刷新 `#/flow` 会悄悄开新的一关（日签页刷新就进了加练）**
   - 证据：`App.tsx:104-109`，只要 `route==='flow' && step==='home'` 就自动 `beginRound(progress.todayDone)`。在日签页刷新时 `todayDone=true`，直接开始 5 词加练；做到一半刷新，这一关的进度全部丢失，从头再来。
   - 修复：刷新落在 `#/flow` 且没有内存中的会话时，`location.replace('#/today')`；要么把进行中的会话（step 和队列）写进 `progress.v2` 的 `session` 字段，刷新后从那里恢复。

5. **“温故”不是回忆，“已掌握”也被高估**
   - 证据：温故复用的是完整图鉴卡（`App.tsx:373-386`），词头、释义、例句全部可见，没有任何判分。`App.tsx:125-127` 一关结束就清空**全部** `dueIds`；`session.ts:24-31` 学过即进 `learnedIds`，到期词按 `i % 3` 随机挑。Boss 默写答错的词既不进 due，也照样算“已掌握”。
   - 影响：TutorDesk 上“记忆曲线到了临界点”的说法没有数据依据，`已掌握 N/50` 也不真实。
   - 修复（不必上真 FSRS）：温故模式隐藏词头和 IPA，只显示中文、sceneHook 和朗读按钮，让用户手打（复用门禁组件即可）。Boss 或 MCQ 答错的词写入 `dueIds`，答对的才移出。`learnedIds` 改成“Boss 通过”才计入。

6. **品牌副标“词光私教馆”要换**
   - 证据：`App.tsx:272` `cw-brand-sub` 写的是“词光私教馆”，而 `<title>` 和 manifest 用的是“词私教 Lab”。同一个产品有两个中文名，“词光”还和 Word Atlas 的“词光”品牌撞名。
   - 修复：副标统一为“词私教 Lab”。全仓 grep 一遍“词光”。

7. **`.cw-poster-glow` 删掉**
   - 证据：`index.css:790-801` 是一个 240px 的圆，填充 `var(--cw-word-accent)`，`opacity:.16; filter: blur(46px)`，放在海报左上。实际效果是一团柔和的色块，算不上霓虹，但用的正是“模糊彩色光斑”这套 AI 视觉语法；而且 `.cw-poster-frame` 的 `radial-gradient`（`:780-786`）已经做了同样的晕染，两者重复。遇到 `#7C5CFC`、`#9B59B6` 这类偏紫的词色时，会更像 AI 光晕。
   - 修复：删掉 `LexiconStageView.tsx:135` 的节点和对应 CSS，只保留 radial 背景，必要时把 22% 调低到 14%。顺手把 `--cw-amber-glow`、`--cw-cobalt-glow` 改名为 `-soft`，这两个变量名和实际颜色已经对不上。

8. **私教腔文案要收短**
   - 证据：`TutorDeskView.tsx:83/87/91`：“漂亮签收”“记忆曲线到了临界点”“清掉旧账”“一词一画舞台……打透即止”；`DayStampView.tsx:112/116`：“画面钩子已经稳稳扎进你的直觉里”“真正的记忆固化发生在休息时”“胜过走马观花刷百词”。每段 60–90 字，夸人、讲道理、做比较三样齐全。
   - 修复：每条控制在 25 字以内，只说事实和下一步。例如：“今天 10 个新词，每 5 个测一次。”“正确率 80%，错的 2 个明天先复习。”

## 建议改（Should）

1. **中英双语 kicker 太密，像宣言**：一个图鉴页就有 `FIG //`、`SCENE HOOK · 视觉锚点`、`LEXICON · 一词一画`、`CONTEXT SPOTLIGHT · 语境真句`、`COLLOCATIONS · 地道搭配`、`SPELL GATE · …` 六个英文等宽标签。日签页还有 `DAILY STAGE CLEAR`、`SESSION ARCHIVE`、`DATE STAMP //`、`SIGNED BY CLAWWORDS TUTOR`（`DayStampView.tsx:164`）。建议：节标题只用中文（例句 / 搭配 / 拼写），每屏最多保留 1 个英文等宽标签；删掉 `SIGNED BY…`。
2. **开发残留露在 UI 上**：海报上的 `FIG // {id.slice(0,6)}` 会把 abandon 显示成 “ABANDO”（截图可见，`LexiconStageView.tsx:160`）；`#5B8DEF` 色值直接展示（`:190`）；设置页有 `STORAGE KEY: clawwords.progress.v2`、`(Local UUID)`、`(Due Stubs)`（`StudioSettingsView.tsx:103/108/118`）。建议全部删除或改成中文说明。
3. **海报的信息量和排版**：sceneHook 只有 2–3 个英文词（`words.ts`，如 "walk away forever"），所以长文本可读性不成问题；问题在于 320px 宽的整栏只放了一行字，下半部大片留白。大号字形 “AB”（`.cw-poster-glyph` right:6 top:30）还压在右上角 `SCENE HOOK` 标签上（截图可见）。建议：在 `Word` 上加 `illustration?: string` 插画槽位，没有图时退回现在的样式；hook 下面补一行中文意象；字形下移或调淡，避开标签。
4. **移动端门禁太靠下**：≤720px 时海报 `min-height:228px` 放在最上面，下面依次是释义、例句、搭配，拼写框大约在第 2 屏才出现，每个词都要往下滑。建议：移动端海报压到 ~140px（hook 和词头放一行），或者把拼写框和 CTA 做成 sticky 底栏（`position: sticky; bottom: 0`）。另外全站只有 `@media (max-width:720px)` 一个断点，平板竖屏 721–900px 下的 320px 海报栏偏挤，建议加一个 ≤900px 断点把海报栏收到 260px。
5. **`.cw-viewport` 垂直居中导致顶栏跳动**：`index.css:88-98` 的 `justify-content:center` 让每个页面的顶栏高度随内容变化，三张截图里顶栏的 y 坐标分别是 186 / 204 / 217。内容超过一屏时不会被裁切（因为用的是 min-height），但切页时界面会上下跳。建议改为 `justify-content:flex-start` 加 `padding-top: clamp(16px, 6vh, 64px)`。
6. **TTS 很脆弱**：`speakWord`（`LexiconStageView.tsx:14-25`）没有调 `getVoices()` 来选 en-US 声音，失败时也不提示。部分安卓 WebView 和国产浏览器没有英文语音，会用中文音色念英文，或者直接没声音。建议：挑 `lang.startsWith('en')` 的 voice，找不到就把“朗读”按钮置灰并提示“此浏览器不支持朗读”；后续可以考虑预生成音频兜底。
7. **HUD 阶段标签看起来能点**：`App.tsx:277-295` 的 `.cw-hud-phases` 和 `今日一关/案头设置` 导航用的是同一种胶囊样式（截图里 “图鉴” 的胶囊和导航 tab 一模一样），但实际不能点。建议改成步骤条样式：去掉胶囊背景，用 “›” 分隔，设 `cursor:default`。
8. **图鉴矩阵能点但没反应，移动端也预览不了**：`TutorDeskView.tsx:245-255` 的 50 个方块是 `<button>`，带 `cursor:pointer` 和 hover 放大 1.3，但没有 onClick。移动端只能靠 `onFocus` 触发预览，而 iOS Safari 点按钮不会给焦点，所以手机上永远看不到。建议加 `onClick={() => setHoveredWord(w)}`，后续可以点开一张只读小卡。
9. **全局 Enter 抢键**：TutorDesk 在 window 上监听 Enter 直接开关（`TutorDeskView.tsx:26-41`），顶栏的“案头设置”导航按钮没有 `data-no-enter`，键盘用户在它上面按 Enter 会开始学习，而不是进设置。图鉴页焦点在“朗读”按钮上按 Enter，会跳到下一词。建议：焦点在任何 button、input 上时，全局 Enter 都不处理。
10. **设置页数字框没法输入两位数**：`StudioSettingsView.tsx:94` 每次 onChange 都立即 clamp，想输 “15” 时，先输入的 “1” 会被立刻改成 5。建议用本地 state 保存草稿值，blur 时再 clamp。
11. **只能导出不能导入**：下载和复制 JSON 都已接好（`StudioSettingsView.tsx:29-41`，可用），但没有导入入口。只靠 localStorage，用户换设备或清缓存就丢进度。建议加一个“导入 JSON”按钮，做 schema 校验后写回 `clawwords.progress.v2`。
12. **PWA 装不上**：现网 manifest 没有 `icons`（Chrome 要求 192/512 PNG 才给安装提示），也没有 Service Worker，离线打不开。建议补 `icons` 数组（192/512 + maskable），用 `vite-plugin-pwa` 做 SW 预缓存。

## 可延后（Nice）
- `.cw-ambient-grid`、`.cw-poster-grid-overlay` 和 `.cw-sheet-pin`、蜡封 SVG 这类装饰层可以再减一层，让纸面更素。
- 日签 `totalChecks=0` 时命中率显示 100%（`DayStampView.tsx` accuracy）；“本关精读词条”把温故词也算进去了。
- 当天只有温故、没有新词时，`concludeSession(false)` 会被记成“加练”（`App.tsx:136`）。
- `words.ts` 里的词色饱和度偏高（#7C5CFC / #E85D4C），建议统一降一档，和纸墨配色更协调。
- JS 单包 275KB（gzip 85KB），CSS 31KB，目前够用；词库扩到几千词时再按路由拆包，词库也改为懒加载。
- 50 个演示词跑完后的空状态，可以加“重置词库 / 导入新词表”的引导。

## 覆盖检查清单
- **视觉层次与配色**：✅ 基本到位，纸白、深墨、石板蓝克制统一。⚠ 要处理 poster-glow 和词色饱和度（Must 7 / Nice）。
- **双栏海报可读性**：✅ 桌面端清晰，hook 很短，可读性没问题。⚠ 海报大片留白；字形压住标签；`ABANDO` 和色值是开发残留（Should 2/3）。
- **学习闭环（拼写门禁 / TTS 朗读 / Boss）**：⚠ 流程完整，但门禁泄题、判分偏宽，温故不是回忆，刷新会误开新关，TTS 没有兜底（Must 2/3/4/5，Should 6）。
- **移动端**：⚠ 能单栏堆叠，顶栏会隐藏副标和阶段标签，不溢出。拼写框在第二屏；图鉴矩阵在手机上预览不了；只有一个断点（Should 4/5/8）。
- **性能**：✅ gzip 后约 85KB JS，没有图片和网络字体，主要开销是 blur 滤镜，可以忽略。
- **文案 AI 味残留**：❌ TutorDesk 和日签的长段私教腔、“词光私教馆”、六七个中英双语 kicker（Must 6/8，Should 1）。
- **GitHub Pages 部署风险**：⚠ base 路径正确，hash 路由刷新没问题，带 hash 的哈希资源缓存 600s 可以接受。但 `/repo-sdamz7zw/today`（无 hash）会 404，建议加 `404.html` 跳转到 `#/today`；本地源码比现网旧（Must 1），manifest 没有 icons、没有 SW（Should 12）。
