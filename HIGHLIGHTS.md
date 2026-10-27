# ClawWords · 词卡 — 审计修复摘要 (Audit Fix Highlights)

本次更新对照现网审计清单完成以下改动：

1. **品牌与 PWA 清单统一（Must 1 & 6）**
   - 中文名统一为 **词卡**，全站标题与副标统一为 `ClawWords · 词卡`，移除旧品牌残留。
   - `public/manifest.webmanifest` 同步 `start_url` / `scope` 为 `/repo-sdamz7zw/`，主题与背景色统一为 `#f6f5f2`；`index.html` 图标指向 `/favicon.svg`。

2. **拼写门禁防泄题与判分收紧（Must 2 & 3）**
   - 新增 `gradeExact(input, expected)`：门禁仅接受忽略大小写与首尾空格的精确匹配。
   - 门禁输入框 `placeholder` 改为中性提示「手打这个词，Enter 确认」；答错仅提示首字母与词长（如 `a······（7）`），不泄露完整单词。
   - `gradeTranslation` 保留 `variants` 白名单，移除 `ing|ed|es|s` 后缀剥离模糊放行（`accesed` 判错）。

3. **温故主动回忆 + 真实掌握与待复习统计（Must 4 & 5）**
   - 温故模式（`isReview`）隐藏词头、音标与英文例句，仅展示中文释义、`sceneHook` 画面提示与「朗读」按钮，手打精确拼写过关后移出 `dueIds`。
   - 选义（MCQ）或 Boss 默写答错的词自动加入 `dueIds`；仅 Boss 默写通过的词计入 `learnedIds`。
   - 直接刷新 `#/flow` 且无内存会话时重定向回 `#/today`，避免在日签页刷新时误开加练。

4. **音频三级回退与视觉/文案去噪（Audio & Must 7–8 & Should）**
   - 「朗读」优先播放本地 `audio/us/{id}.mp3`，其次远程 Word Atlas Open 音频，最后回退 Web Speech API。
   - 移除 `.cw-poster-glow` 节点与模糊光斑样式，仅保留柔和径向背景；`.cw-viewport` 改为顶部对齐（`flex-start` + `padding-top`）消除切页跳动。
   - 收短今日便签与日签文案（单行 ≤25 字，仅陈述事实与下一步），清理 `FIG //`、色值与 `STORAGE KEY` 等开发残留标签。
