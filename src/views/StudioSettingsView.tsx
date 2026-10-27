import { useState } from 'react'
import { WORDS } from '../data/words'
import { exportProgress, type Progress } from '../lib/storage'

type StudioSettingsProps = {
  progress: Progress
  onUpdateDailyCount: (count: number) => void
  onResetAll: () => void
  onClose: () => void
}

const PRESETS = [
  { count: 5, label: '5 词', tag: '轻量半关' },
  { count: 10, label: '10 词', tag: '私教推荐' },
  { count: 15, label: '15 词', tag: '稳步进阶' },
  { count: 20, label: '20 词', tag: '深度精读' },
]

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
    anchor.download = `clawwords-v2-archive-${progress.todayKey}.json`
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
    <section className="cw-settings-shell" aria-label="私教案头设置">
      <article className="cw-settings-card">
        <header className="cw-settings-header">
          <div>
            <span className="cw-kicker-pill">STUDIO PREFERENCES · 案头偏好</span>
            <h1 className="cw-settings-title">私教节奏与本机档案</h1>
          </div>
          <button type="button" className="cw-ghost-chip" onClick={onClose}>
            ← 返回今日便签
          </button>
        </header>

        {/* Section 1: Stage Rhythm Capacity */}
        <section className="cw-settings-group">
          <div className="cw-section-header">
            <span className="cw-section-kicker">STAGE CAPACITY · 每关新词容量（5–20 词）</span>
            <span className="cw-section-hint">每 5 词触发一轮选义与 Boss 默写</span>
          </div>

          <div className="cw-preset-rack" role="group" aria-label="每关新词预设">
            {PRESETS.map((p) => {
              const active = progress.settings.dailyNewCount === p.count
              return (
                <button
                  key={p.count}
                  type="button"
                  className={`cw-preset-tile ${active ? 'is-active' : ''}`}
                  onClick={() => onUpdateDailyCount(p.count)}
                >
                  <strong className="cw-preset-num">{p.label}</strong>
                  <span className="cw-preset-tag">{p.tag}</span>
                </button>
              )
            })}
          </div>

          <label className="cw-custom-stepper">
            <span>自定义每关新词数量（5–20）</span>
            <input
              type="number"
              min={5}
              max={20}
              className="cw-stepper-input"
              value={progress.settings.dailyNewCount}
              onChange={(e) => onUpdateDailyCount(Number(e.target.value) || 10)}
            />
          </label>
        </section>

        {/* Section 2: Local Archive & Export */}
        <section className="cw-settings-group">
          <div className="cw-section-header">
            <span className="cw-section-kicker">LOCAL ARCHIVE · 本机学习档案</span>
            <span className="cw-section-hint">STORAGE KEY: clawwords.progress.v2</span>
          </div>

          <div className="cw-archive-ledger">
            <div className="cw-ledger-row">
              <span>档案标识 (Local UUID)</span>
              <code>{progress.userId.slice(0, 12)}…</code>
            </div>
            <div className="cw-ledger-row">
              <span>馆藏累计掌握</span>
              <strong>
                {progress.learnedIds.length} / {WORDS.length} 词
              </strong>
            </div>
            <div className="cw-ledger-row">
              <span>待温故队列 (Due Stubs)</span>
              <strong>{progress.dueIds.length} 词</strong>
            </div>
            <div className="cw-ledger-row">
              <span>历史检定作答记录</span>
              <strong>{progress.answers.length} 条</strong>
            </div>
          </div>

          <div className="cw-export-actions">
            <button type="button" className="cw-cta-primary" onClick={handleDownloadJson}>
              <span>导出进度 JSON 备份</span>
              <kbd className="cw-kbd-hint">.JSON</kbd>
            </button>
            <button type="button" className="cw-cta-secondary" onClick={handleCopyJson}>
              <span>{copied ? '✓ 已复制到剪贴板' : '复制 JSON 文本'}</span>
            </button>
          </div>
        </section>

        {/* De-emphasized Footer for Danger Reset */}
        <footer className="cw-settings-footer">
          <div className="cw-privacy-note">
            本机离线存储 · 无微信绑定、无云端打扰、无排行榜焦虑
          </div>

          {!confirmingClear ? (
            <button
              type="button"
              className="cw-danger-ghost-link"
              onClick={() => setConfirmingClear(true)}
            >
              清除本机学习进度…
            </button>
          ) : (
            <div className="cw-danger-confirm-inline">
              <span className="cw-danger-warn">确认清空本机所有进度？此操作不可撤销：</span>
              <button
                type="button"
                className="cw-danger-confirm-btn"
                onClick={() => {
                  setConfirmingClear(false)
                  onResetAll()
                }}
              >
                确认清空
              </button>
              <button
                type="button"
                className="cw-ghost-cancel-btn"
                onClick={() => setConfirmingClear(false)}
              >
                取消
              </button>
            </div>
          )}
        </footer>
      </article>
    </section>
  )
}
