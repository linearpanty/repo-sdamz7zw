# ClawWords 审美审计

> 审计模型：Gemini 4 Argon High（Antigravity）· 含截图对照

## 1. 总体观感
从 `audit-shots/today.png`、`audit-shots/card.png`、`audit-shots/quiz.png`、`audit-shots/settings.png` 四张 1280×800 实机截图来看，当前界面**更像「套了暗色主题的移动端后台表单 / 开发者调试壳」，而非有呼吸感与陪伴感的「词私教 Lab」**。`420px` 窄栏死贴在视口顶部中央，下方与两侧超过 70% 的面积是空旷死黑，核心词卡没有实体边界，「一词一画」退化成了像未加载出来的渐变占位块。

## 2. 做得好的（留）
- **信息克制、零噪音闭环**：`audit-shots/today.png` 与 `audit-shots/quiz.png` 没有任何多余导航栏、积分弹窗或社交干扰，单屏只做一件事，忠实还原了「零摩擦即开即学」的克制感。
- **背景顶光方向正确**：`index.css` 中 `body` 的 `radial-gradient(1200px 600px at 50% -10%, #1a2740 0%, var(--bg) 55%)` 在四张截图顶部形成了柔和的冷蓝微光，为暗色「私教书房」提供了良好的环境光基底。
- **词条呼吸感与音标衬线区分**：`audit-shots/card.png` 中主词 `abandon`（`.headword` `2rem`）与衬线体音标 `/əˈbændən/`（`.ipa` `Georgia, serif`）拉开了基本的主次对比；胶囊态进度标（`新词 1/10`、`选义 1/5`）视觉轻量不抢戏。
- **键盘优先的桌面端直觉**：`audit-shots/quiz.png` 明确给出 `1`–`4` 数字键标与 `Enter` 提示，符合网页端高频刷词的肌肉记忆。

## 3. 拖累「爱不释手」的点
- **视口构图与间距（看起来像「桌面浏览器里硬跑的手机 H5 草稿」）**：
  在 1280×800 截图中，`index.css` 的 `.app` 仅设了 `max-width: 420px; padding: 16px 16px 32px`，既无垂直居中，也无外层舞台容器。所有内容挤在屏幕正上方一小撮，下半屏全是死黑。同时 `.screen` 全局一刀切 `gap: 12px`（`index.css`），导致标题、色块、释义、按钮之间全是一个节奏，毫无视觉分组与停顿。
- **「词卡」没有卡（看起来像「散落在黑底上的表单字段」）**：
  `audit-shots/card.png` 对应的 `pages/WordCard.tsx` 没有外层卡片容器，插画位、词头、例句框、`搭配` 标签全部直接裸露在 `body` 上；`例句` 和 `搭配` 两个 `h3` 小标题活像后台管理系统的表单 Label，例句 `They had to abandon the project.` 中的目标词 `abandon` 也没有任何高亮，视线无法第一时间锚定。
- **插画位 `.illus`（看起来像「图片裂了的 Skeleton 占位条」）**：
  `audit-shots/card.png` 顶部的 `140px` 色块仅靠 `linear-gradient(135deg, ${word.color}, #1a1a1a)` 撑着，左下角生硬贴着白字 `walk away forever`。没有噪点肌理、没有微光内边框、没有引号或排版张力，完全起不到「一词一画」的视觉钩子作用。
- **字阶与色板（看起来像「SaaS 监控仪表盘 + 默认 Bootstrap 蓝」）**：
  - `audit-shots/today.png` 的三格 `.stat`（`到期复习 0`、`计划新词 10`、`已学 / 词库 0/50`）等宽均分、字号 `1.25rem` 偏小且粗细平庸，像服务器监控指标，看不出今天的核心任务是「学 10 个新词」。
  - 主按钮 `--primary: #5b8def`（`index.css`）是毫无质感的扁平矢车菊蓝，纯平填充铺满 `420px` 宽，在暗色背景下既刺眼又廉价，缺少「私教 Lab」应有的精致微渐变或高光描边。
- **测验页与完成页毫无仪式感（看起来像「驾考题库」和「报错提示页」）**：
  - `audit-shots/quiz.png` 中 `abandon` 下方直接跟四个深灰长条 `.option`，左侧数字标 `.num` 只是扁平灰块（`#2a3140`），没有实体键帽（Keycap）的立体边框与等宽字体质感；顶部也没有整轮流（Flow）的连贯进度条。
  - `pages/Done.tsx` 仅靠 `.tip { padding-top: 48px }` 放三行字加两个通栏按钮，连一张战报小结卡或微光徽章都没有，辛苦学完 10 词+两轮测验后的多巴胺奖励几乎为零。
- **设置页危险操作失衡（看起来像「工程测试面板」）**：
  `audit-shots/settings.png` 中，`清除进度`（`.btn.danger.block`）与 `导出进度 JSON` 一样做成了 `100%` 宽度的巨型通栏按钮，且两者仅隔 `12px`，视觉权重严重倒挂。

## 4. 相对词光：该抄什么视觉、别抄什么

### 该抄（提炼核心审美心智）
- **「实体卡片舞台感」**：词光让人爱不释手的核心是「每一屏都是一张精心排印的实体卡片」。应把词头、画面钩子、释义、例句收拢进一个带微光顶边（`border-top: 1px solid rgba(255,255,255,0.12)`）与柔和深邃阴影的统一大卡面中。
- **「一词一画的记忆锚点化」**：在未接真实插画前，把 `.illus` 升级为「海报级排版画框（Typographic Poster）」——加入径向双色氛围光、细微网格/噪点肌理、大号衬线体或斜体视觉呈现 `sceneHook`，让英文短句本身长成一幅画。
- **「整轮心流进度条与收工战报」**：抄词光顶部极细的全局流进度条（2px 渐变线）和完成页的「今日签收单 / 记忆战报卡」仪式感。

### 别抄（守住暗色「私教 Lab」差异化）
- **别抄高饱和糖果色与卡通贴纸风**：词光偏移动端大众清新/明亮插画；ClawWords 是桌面+移动兼顾的「暗色私教 Lab」，色板应走 **Linear / Raycast / Readwise Reader 式的深邃黑曜石 + 琥珀暖金或冷萃电光蓝**，克制、专业、耐看。
- **别抄重度游戏化外壳（3D 星图、虚拟书房、宠物打卡）**：私教感来自「排版精度、秒级键盘反馈、例句重点高亮」，而不是花哨的装饰周边。

## 5. 可执行改动优先级

1. **[P0] 重构桌面视口舞台与卡片容器（消除「顶头死黑 H5 感」）**
   - **定位**：`index.css`、`pages/WordCard.tsx`
   - **动作**：将 `.app` 改为桌面端垂直居中舞台（`max-width: 460px; min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; padding: 32px 20px;`）。新增 `.stage-card` 容器包裹词卡与测验主体：`background: linear-gradient(180deg, #181c24 0%, #12151c 100%); border: 1px solid rgba(255,255,255,0.08); border-top-color: rgba(255,255,255,0.15); border-radius: 20px; padding: 24px; box-shadow: 0 24px 48px rgba(0,0,0,0.45);`。
2. **[P0] 重塑色板、字阶对比与主按钮质感（换掉廉价扁平蓝）**
   - **定位**：`index.css` 及 `.btn.primary`、`.headword`
   - **动作**：
     - 调整 `:root` 变量：`--bg: #0b0d11; --card: #151821; --border: rgba(255,255,255,0.08); --primary: #4f7cff;`。
     - `.headword` 放大至 `2.5rem`，`font-weight: 700`，`letter-spacing: -0.02em`；引入等宽字体变量 `--font-mono: "JetBrains Mono", "SFMono-Regular", monospace` 用于数字、快捷键与 ID。
     - `.btn.primary` 改为微立体高光按钮：`background: linear-gradient(180deg, #5e8bff 0%, #436ef2 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(67,110,242,0.35);`。
3. **[P0] 将 `.illus` 从「裸渐变条」升级为「氛围海报画框」**
   - **定位**：`index.css`、`pages/WordCard.tsx`
   - **动作**：高度提至 `168px`，增加暗角与细点阵背景（`background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)`，`background-size: 16px 16px` 叠加在词色径向渐变上），内嵌微光描边 `box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1)`；`.hook` 居中或左中排布，字号提至 `1.35rem`，使用 `Georgia, serif` 斜体并配半透明引号装饰，让短语真正具备画面记忆感。
4. **[P0] 词卡内部分组降噪 + 例句目标词高亮**
   - **定位**：`pages/WordCard.tsx`、`index.css`
   - **动作**：去掉生硬的 `<h3>例句</h3>` 和 `<h3>搭配</h3>` 文字标题（或改为 `0.72rem` 大写字母间距 `letter-spacing: 0.08em` 的弱化分割标）；在 `pages/WordCard.tsx` 渲染 `ex.en` 时用正则匹配当前 `word.word`（忽略大小写）包裹 `<mark className="hl">`，赋予 `color: #8ab4ff; font-weight: 600; background: transparent;`。
5. **[P1] 测验页 `.option` 实体键帽化 + 顶部流进度条**
   - **定位**：`pages/QuizMCQ.tsx`、`pages/QuizWrite.tsx`、`index.css`
   - **动作**：
     - 在 `#/flow` 顶部加一条 `3px` 高的 `.flow-progress` 进度槽，实时反映当前小节进度。
     - `.option` 增加 `:hover` 态（`border-color: rgba(255,255,255,0.2); background: #1f2430; transform: translateY(-1px)`）；`.option .num` 改为真实键盘键帽样式（`font-family: var(--font-mono); border: 1px solid rgba(255,255,255,0.14); box-shadow: 0 2px 0 rgba(0,0,0,0.4);`）。
6. **[P1] 今日首页 `.stat` 看板主次重构**
   - **定位**：`pages/Today.tsx`、`index.css`
   - **动作**：将三个 `.stat` 的数字 `strong` 放大至 `1.75rem`（`font-family: var(--font-mono); font-weight: 700`），间距 `gap` 扩至 `12px`，给核心待办项（有复习时高亮 `到期复习`，无复习时高亮 `计划新词`）加上主色微光底与左/顶强调边，告别平庸的等权表格感。
7. **[P1] 重做 `pages/Done.tsx` 收工战报卡与 `pages/Settings.tsx` 危险按钮降权**
   - **定位**：`pages/Done.tsx`、`pages/Settings.tsx`
   - **动作**：
     - 在 `pages/Done.tsx` 中加入 `.summary-card`，大字号展示正确率百分比（如 `90%` 翠绿高亮 `--ok`）与本轮词数对比，赋予「私教签字下课」的成就感。
     - 在 `pages/Settings.tsx` 中，为 `清除进度` 移除红底填充，改为顶部带分割线的弱化幽灵红字按钮（`.btn.ghost.danger-text { background: transparent; border-color: rgba(255,107,107,0.25); color: var(--bad); margin-top: 24px; }`），与常规操作彻底拉开距离。
