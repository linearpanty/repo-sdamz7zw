type Props = {
  learnedCount: number
  correct: number
  total: number
  onMore: () => void
  onHome: () => void
}

export function Done({ learnedCount, correct, total, onMore, onHome }: Props) {
  const acc = total > 0 ? Math.round((correct / total) * 100) : 100

  return (
    <div className="screen">
      <div className="badge">今日结课</div>
      <h1>本关已完成</h1>

      <div className="summary-card">
        <div className="summary-metrics">
          <div>
            <div className="summary-acc">{acc}%</div>
            <div className="summary-acc-label">小节检定正确率</div>
          </div>
          <div className="summary-detail">
            <div>
              本关新词 <strong>{learnedCount}</strong> 词
            </div>
            <div>
              选义与默写 <strong>{correct}</strong> / {total} 题通过
            </div>
          </div>
        </div>
        <p className="tutor-greeting">
          主动跟打与中译英默写已记录在本机。记忆巩固发生在休息时，现在合上页面即可；若状态正稳，也可顺手加练一关。
        </p>
      </div>

      <button type="button" className="btn primary block" onClick={onMore}>
        再来一关（5 词）
      </button>
      <button type="button" className="btn ghost block" onClick={onHome}>
        返回今日
      </button>
    </div>
  )
}
