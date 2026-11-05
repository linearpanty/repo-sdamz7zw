import { illustrationUrl, videoUrl, type Word } from '../data/types'

type WordMotionStageProps = {
  word: Word
  passed: boolean
}

export function WordMotionStage({ word, passed }: WordMotionStageProps) {
  const vidSrc = videoUrl(word)
  const illusSrc = illustrationUrl(word)

  if (!vidSrc && !illusSrc) return null

  return (
    <div
      className={`cw-motion-stage${passed ? ' is-passed' : ''}`}
      style={{ '--cw-word-color': word.color || '#243b55' } as React.CSSProperties}
      aria-hidden="true"
    >
      {vidSrc ? (
        <video
          key={vidSrc}
          className="cw-poster-video"
          src={vidSrc}
          poster={illusSrc ?? undefined}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        illusSrc && (
          <div className="cw-kenburns-wrap">
            <img
              className="cw-poster-photo cw-poster-kenburns"
              src={illusSrc}
              alt=""
              width={640}
              height={800}
              draggable={false}
            />
          </div>
        )
      )}
    </div>
  )
}
