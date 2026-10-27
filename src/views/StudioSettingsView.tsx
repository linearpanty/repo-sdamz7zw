import { useState } from 'react'
import { WORDS } from '../data/words'
import { exportProgress, type Progress } from '../lib/storage'

type StudioSettingsProps = {
  progress: Progress
  onUpdateDailyCount: (count: number) => void
  onResetAll: () => void
  onClose: () => void
}

const PRESETS = [5, 10, 15, 20]

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
    <section aria-label="设置">
      <div className="cw-row-head">
        <h1 className="cw-title">设置</h1>
        <button type="button" className="cw-text-btn" onClick={onClose}>
          返回
        </button>
      </div>

      <div className="cw-block">
        <div className="cw-row-head">
          <h2>每关新词</h2>
          <span className="cw-count">每 5 个词后做一次选择和默写</span>
        </div>
        <div className="cw-presets" role="group" aria-label="每关新词">
          {PRESETS.map((count) => (
            <button
              key={count}
              type="button"
              className={`cw-preset ${progress.settings.dailyNewCount === count ? 'is-active' : ''}`}
              onClick={() => onUpdateDailyCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
        <label className="cw-stepper">
          <span>数量（5–20）</span>
          <input
            type="number"
            min={5}
            max={20}
            value={progress.settings.dailyNewCount}
            onChange={(e) => onUpdateDailyCount(Number(e.target.value) || 10)}
          />
        </label>
      </div>

      <div className="cw-block">
        <div className="cw-row-head">
          <h2>进度</h2>
        </div>
        <div className="cw-rows">
          <div className="cw-line">
            <span>已学</span>
            <strong>
              {progress.learnedIds.length} / {WORDS.length}
            </strong>
          </div>
          <div className="cw-line">
            <span>待复习</span>
            <strong>{progress.dueIds.length}</strong>
          </div>
          <div className="cw-line">
            <span>作答</span>
            <strong>{progress.answers.length}</strong>
          </div>
        </div>
        <div className="cw-actions">
          <button type="button" className="cw-btn" onClick={handleDownloadJson}>
            导出 JSON
          </button>
          <button type="button" className="cw-btn-ghost" onClick={handleCopyJson}>
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <p className="cw-note">进度存在本机浏览器（clawwords.progress.v2）。</p>
      </div>

      <div className="cw-danger">
        {!confirmingClear ? (
          <button type="button" className="cw-danger-link" onClick={() => setConfirmingClear(true)}>
            清除进度
          </button>
        ) : (
          <>
            <span>清空本机进度？</span>{' '}
            <button
              type="button"
              className="cw-danger-yes"
              onClick={() => {
                setConfirmingClear(false)
                onResetAll()
              }}
            >
              确认
            </button>
            <button type="button" className="cw-danger-link" onClick={() => setConfirmingClear(false)}>
              取消
            </button>
          </>
        )}
      </div>
    </section>
  )
}
