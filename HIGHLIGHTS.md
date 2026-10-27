# ClawWords Light Illustrated — 视觉与交互重构亮点

本版本完整保留了 **Gemini 4 双栏画廊图鉴架构（`cw-*` 宽幅双栏舞台 + `sceneHook` 视觉海报框）**，彻底摒弃 440px 无图窄条堆叠，同时将全站视觉语言切换为 **Readwise Reader Light / Apple Books / 暖白纸质词典图谱（Printed Lexicon Atlas on Cream Paper）**，并合入词卡手打拼写过关与美音朗读闭环：

1. **桌面友好的双栏插画图鉴构图（拒绝退回 440px 手机窄条）**
   - 舞台容器保持宽幅居中画册比例（`max-width: 860px`），词卡舞台 `LexiconStageView` 采用 **`320px 1fr` 左画框 + 右档案** 双栏布局（移动端自适应为 ≥228px 顶部海报 + 下方档案）。
   - 左侧海报框（`.cw-poster-frame`）以 `word.color` 混合暖白纸张生成柔和粉彩水洗渐变（Pastel Wash），叠加 28px 细线基准网格、矢量几何标本环（`.cw-poster-art-svg`）、衬线词首水印与斜体大号 `sceneHook`，在浅色纸面上依然层次分明。

2. **暖白纸张 × 深墨印刷色板（Flat Elegant Light Theme）**
   - 移除黑曜石底色、黄铜台灯发光与霓虹电光蓝，全面换用暖灰纸底（`#f6f5f2` / `#faf9f6`）、纯白内页卡（`#ffffff`）、深炭书墨正文（`#1a1a1a` / `#43413c`）、1px 细线边框（`#e6e4df`）与典雅石板藏青主色（`#243b55`）。
   - 例句与搭配中的目标词通过 `highlightLexeme` 自动识别原形及词形变化，并以柔和纸质荧光笔下划线高亮。

3. **去除序言墙，默认直达 `#/today`（`TutorDeskView`）**
   - 移除 `ManifestoView` / `#/tip` 卖点序言页与顶部导航冗余入口，`tipSeen` 始终为 `true`，首次及后续打开均直达 `#/today` 今日备课便签。

4. **词卡手打英文拼写门禁（`Spell Gate`）+ 原生美音「朗读」**
   - **词头行朗读**：在 `LexiconStageView`（及 `IntuitionQuizView`）词头音标旁内置 **「朗读」按钮**，调用浏览器原生 `speechSynthesis`（`en-US`，`rate: 0.95`）即时发音。
   - **手打拼写解锁**：在 `LexiconStageView`（含温故与知新）底部接入 `gradeTranslation` 手打拼写检定框（`#word-spell-input`）。未拼对前主按钮保持禁用，拼写通过后实时呈现绿色反馈并解锁 `Enter` / 按钮进入下一词。

5. **完整保留短关检定闭环与本机数据主权**
   - 完整保留每 5 词触发的「直觉选义（`IntuitionQuizView`）」+「中译英主动默写 Boss（`BossWriteView`）」+「通关日签战报与再来一关（`DayStampView`）」。
   - 存储键锁定 `clawwords.progress.v2`，`vite.config.ts` 锁定 `base: '/repo-sdamz7zw/'`。
