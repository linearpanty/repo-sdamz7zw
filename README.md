# ClawWords · 词卡

打开，把今天的词打对，今天就过了。

三屏：`#/` 今天 · `#/word` 词 · `#/done` 好了。

```bash
npm run dev
npm test
npm run build
```

- Vite base：`/repo-sdamz7zw/`
- 本机进度：`localStorage` 键 `clawwords.progress.v3`（会读旧的 `clawwords.progress.v2`）
- 每天 5 个词。先排到期的，再补没见过的。打错的会悄悄再出现一次。
- 朗读：本地 `public/audio/us/{id}.mp3`，其次 `https://0xlei.tech/words/atlas/audio/us/{id}.mp3`，最后用浏览器语音。

音频来自 Word Atlas Open（CC BY 4.0）https://github.com/designfuchen/word-atlas
