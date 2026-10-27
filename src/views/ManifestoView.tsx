import { useEffect } from 'react'

type ManifestoProps = {
  onEnter: () => void
}

export function ManifestoView({ onEnter }: ManifestoProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onEnter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  return (
    <section className="cw-folio-shell cw-manifesto-shell" aria-label="词私教序言">
      <div className="cw-manifesto-card">
        <div className="cw-manifesto-top">
          <span className="cw-kicker-pill">
            <span className="cw-kicker-dot" />
            CLAWWORDS ATELIER · 暗色私教图鉴
          </span>
          <span className="cw-serial-tag">EDITION V2 // LOCAL-FIRST</span>
        </div>

        <div className="cw-manifesto-hero">
          <h1 className="cw-display-title">
            一词一画，短关打透。
          </h1>
          <p className="cw-tutor-lead">
            欢迎来到你的私人词汇画廊。这里没有连胜恐吓、没有积分排行榜，也不制造社交焦虑。每次坐下，我们只用 8 分钟打透一关。
          </p>
        </div>

        {/* Mini visual specimen preview */}
        <div className="cw-specimen-preview" aria-hidden="true">
          <div className="cw-specimen-poster">
            <span className="cw-specimen-fig">FIG. 01 // SCENE HOOK</span>
            <div className="cw-specimen-quote">“walk away forever”</div>
            <span className="cw-specimen-watermark">abandon</span>
          </div>
          <div className="cw-specimen-meta">
            <div className="cw-specimen-head">
              <strong>abandon</strong>
              <span>/əˈbændən/</span>
            </div>
            <p className="cw-specimen-zh">v. 放弃；抛弃</p>
            <p className="cw-specimen-ex">
              They had to <mark className="cw-target-hl">abandon</mark> the project.
            </p>
          </div>
        </div>

        <div className="cw-pillars-grid">
          <div className="cw-pillar-item">
            <div className="cw-pillar-num">01</div>
            <div className="cw-pillar-body">
              <h3>画面钩子先入为主</h3>
              <p>每个词配一张视觉短句海报与高亮真实例句，先建立英语直觉画面，再落入中文释义。</p>
            </div>
          </div>

          <div className="cw-pillar-item">
            <div className="cw-pillar-num">02</div>
            <div className="cw-pillar-body">
              <h3>五词一结 · 短关闭环</h3>
              <p>温故旧词优先；每精读 5 个新词立即进入「直觉选义」与「中译英 Boss 默写」双层检定。</p>
            </div>
          </div>

          <div className="cw-pillar-item">
            <div className="cw-pillar-num">03</div>
            <div className="cw-pillar-body">
              <h3>能拼出来才算通关</h3>
              <p>拒绝假装认识的「刷词感」。通过主动提取拼写检定后，签收今日战报即可安心合书。</p>
            </div>
          </div>
        </div>

        <div className="cw-manifesto-footer">
          <button type="button" className="cw-cta-primary cw-cta-wide" onClick={onEnter}>
            <span>推门进入 · 今日一关</span>
            <kbd className="cw-kbd-hint">Enter ↵</kbd>
          </button>
          <p className="cw-footnote">
            免登录即开即学 · 档案保存在本机浏览器 · 下次打开将直接进入今日便签
          </p>
        </div>
      </div>
    </section>
  )
}
