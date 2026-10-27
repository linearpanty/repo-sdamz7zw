# ClawWords · 词光私教馆 (Light Illustrated Atlas Edition)

> **定位一句话**：**纸感双栏插画图鉴 × 手打拼写过关 × 中译英 Boss** —— 汲取 Readwise Reader Light、Apple Books 与纸质博物词典图谱质感的浅色双栏背词私教（打开直达 `#/today`，无序言墙、无积分连胜、无排行榜、无社交绑定）。

---

## 快速运行 (How to Run)

```bash
# 1. 启动本地开发服务器
npm run dev

# 2. 生产环境类型检查与构建验证
npm run build
```

- **Vite Base 路径**：`vite.config.ts` 锁定 `base: '/repo-sdamz7zw/'`
- **本机存储键**：`localStorage` 锁定 `clawwords.progress.v2`

---

## 路由与视图结构 (Hash Routes & Views)

已移除首屏序言墙（`ManifestoView` / `#/tip`），`tipSeen` 恒为 `true`，打开即直达 `#/today`：

- `#/today` — **今日一关 (`TutorDeskView`)**
  - 纸质私教备课便签，整合 **Step 01 温故 · 到期唤醒**（支持一键注入 2 个演示到期词体验温故流）与 **Step 02 知新 · 一词一画 & Boss 检定**。
  - 底部附带 50 词交互式馆藏矩阵（`Lexicon Atlas`），悬停即可预览任意词条的音标、释义与画面锚点。
- `#/flow` — **闯关主舞台**
  - **双栏图鉴舞台 (`LexiconStageView`，含温故与知新)**：
    - **左栏（移动端顶栏 ≥228–250px）**：基于 `word.color` 的浅色粉彩水洗海报框（`sceneHook` 视觉锚点、矢量标本刻度环、巨型衬线词首水印）。
    - **右栏语言学档案**：衬线词头 + 音标 `IPA` + **「朗读」按钮（Web Speech API `en-US`）**、核心词性释义、智能词干高亮例句（`highlightLexeme`）、高频搭配芯片。
    - **手打英文拼写门禁 (`Spell Gate`)**：无论温故还是新学，必须手打输入英文单词并通过 `gradeTranslation` 校验后才解锁「下一词」按钮与回车推进。
  - **Checkpoint I · 直觉选义 (`IntuitionQuizView`)**：每满 5 词触发，纸感键帽 `1`–`4` 盲选词义，支持词头语音朗读，作答后揭晓 `sceneHook` 画面锚点。
  - **Boss Stage · 中译英主动提取 (`BossWriteView`)**：给出中文词义与真实例句挖空（`_______`），按需展开「画面钩子 + 首字母与词长」线索，经 `gradeTranslation` 批改拼写。
  - **通关日签战报 (`DayStampView`)**：矢量藏书章签收单、综合检定命中率、本关收录词条清单，支持一键开启「再来一关（5 词）」或返回今日便签。
- `#/settings` — **案头设置 (`StudioSettingsView`)**
  - 支持 5 / 10 / 15 / 20 词四档每关容量切换，突出「导出进度 JSON 备份」与「复制 JSON 文本」，将清空本机进度降权为页脚低对比链接并内置二次确认。
