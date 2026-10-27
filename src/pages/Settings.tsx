import type { Progress } from '../lib/storage'
import { exportProgress } from '../lib/storage'

type Props = {
  progress: Progress
  onChangeDaily: (n: number) => void
  onClear: () => void
  onBack: () => void
}

export function Settings({ progress, onChangeDaily, onClear, onBack }: Props) {
  function doExport() {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clawwords-backup-${progress.todayKey}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="stage-card">
      <div className="screen">
        <header className="topbar">
          <button type="button" className="btn ghost sm" onClick={onBack}>
            ← 返回
          </button>
        </header>
        <h1>设置</h1>
        <label className="field">
          <span>每日新词数（5–20）</span>
          <input
            type="number"
            min={5}
            max={20}
            value={progress.settings.dailyNewCount}
            onChange={(e) => onChangeDaily(Number(e.target.value) || 10)}
          />
        </label>
        <p className="fine">匿名 ID: {progress.userId.slice(0, 8)}…</p>
        <button type="button" className="btn block" onClick={doExport}>
          导出进度 JSON
        </button>

        <div className="danger-zone">
          <span className="fine">无微信入口 · 无云同步（原型）</span>
          <button
            type="button"
            className="btn danger-ghost"
            onClick={() => {
              if (confirm('确定清除本机进度？不可恢复。')) onClear()
            }}
          >
            清除进度
          </button>
        </div>
      </div>
    </div>
  )
}
