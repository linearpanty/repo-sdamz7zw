import { useState } from 'react'
import { WORDS } from '../data/words'
import { exportProgress, type Progress } from '../lib/storage'

type StudioSettingsProps = {
  progress: Progress
  onUpdateDailyCount: (count: number) => void
  onResetAll: () => void
  onClose: () => void
}

export function StudioSettingsView({
  progress,
  onUpdateDailyCount,
  onResetAll,
  onClose,
}: StudioSettingsProps) {
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleDownloadJson() {
    const payload = exportProgress(progress)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `clawwords-${progress.todayKey}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(exportProgress(progress))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      handleDownloadJson()
    }
  }

  return (
    <section className="cw-sheet" aria-label="设置">
      <button type="button" className="cw-pill" onClick={onClose}>
        ← 返回
      </button>
      <h1 className="cw-title">设置</h1>

      <label className="cw-field-label" htmlFor="daily-count">
        每日新词数
      </label>
      <input
        id="daily-count"
        className="cw-num"
        type="number"
        min={5}
        max={20}
        value={progress.settings.dailyNewCount}
        onChange={(e) => onUpdateDailyCount(Number(e.target.value) || 10)}
      />

      <p className="cw-id">匿名 ID：{progress.userId.slice(0, 8)}…</p>

      <button type="button" className="cw-ink" onClick={handleDownloadJson}>
        导出进度 JSON
      </button>

      {!confirmingClear ? (
        <button type="button" className="cw-danger-btn" onClick={() => setConfirmingClear(true)}>
          清除进度
        </button>
      ) : (
        <>
          <button
            type="button"
            className="cw-danger-btn"
            onClick={() => {
              setConfirmingClear(false)
              onResetAll()
            }}
          >
            确认清除
          </button>
          <button type="button" className="cw-cancel" onClick={() => setConfirmingClear(false)}>
            取消
          </button>
        </>
      )}

      <p className="cw-foot">
        无微信入口 · 无云同步（原型） · 已学 {progress.learnedIds.length}/{WORDS.length}
      </p>
      <button type="button" className="cw-text-btn" onClick={handleCopyJson}>
        {copied ? '已复制' : '复制 JSON'}
      </button>
    </section>
  )
}
