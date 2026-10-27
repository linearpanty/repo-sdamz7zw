# ClawWords · 词卡

> **定位一句话**：**纸感双栏插画图鉴 × 手打拼写过关 × 中译英 Boss** —— 暖白纸墨质感的双栏背词应用（打开直达 `#/today`，无序言墙、无积分连胜、无排行榜、无社交绑定）。

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

## 音频致谢 (Audio Credit)

音频来自 Word Atlas Open（CC BY 4.0）https://github.com/designfuchen/word-atlas

- 朗读回退链路：优先播放本地 `public/audio/us/{id}.mp3`，缺失时回退远程 `https://0xlei.tech/words/atlas/audio/us/{id}.mp3`，最后回退浏览器 Web Speech API。

---

## 路由与视图结构 (Hash Routes & Views)

- `#/today` — **今日一关 (`TutorDeskView`)**
  - 简洁呈现今日待温故与新词任务，底部附带 50 词掌握矩阵，支持点击或悬停预览词条。
- `#/flow` — **闯关主舞台**
  - **温故模式 (`LexiconStageView`, `isReview`)**：隐藏英文词头与音标，仅显示中文释义、`sceneHook` 画面提示与「朗读」按钮，需手打精确拼写过关；通过后从 `dueIds` 移除。
  - **知新图鉴 (`LexiconStageView`)**：左栏浅色径向渐变画面海报框 + 右栏词条释义、词干高亮例句、常用搭配与 `gradeExact` 手打拼写门禁。
  - **直觉选义 (`IntuitionQuizView`) & Boss 默写 (`BossWriteView`)**：每满 5 词触发；选义或默写答错均进入 `dueIds`，仅 Boss 默写通过计入 `learnedIds`。
  - **通关日签 (`DayStampView`)**：展示本关正确率、错题去向与收录词条。刷新 `#/flow` 且无内存会话时自动回到 `#/today`。
- `#/settings` — **案头设置 (`StudioSettingsView`)**
  - 支持 5–20 词每关容量调整、进度 JSON 导出/复制与本机进度清空。
