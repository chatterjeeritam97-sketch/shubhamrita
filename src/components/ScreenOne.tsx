import { useEffect, useLayoutEffect, useState } from 'react'
import { motion } from 'motion/react'
import bridgeArt from '../assets/screen_comp/bridge_line_art_vector.svg'
import titleArt from '../assets/screen_comp/front_title_bride_groom.svg'
import { gsap } from '../lib/gsap'
import FrostPanel, { frostFrameClass } from './FrostPanel'

const START_LINE = 'চলুন শুরু করা যাক...'
const START_GLYPHS = Array.from(
  new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(START_LINE),
  (part) => part.segment,
)

async function titleWithoutBlackField(src: string) {
  const response = await fetch(src)
  const bitmap = await createImageBitmap(
    new Blob([await response.arrayBuffer()], { type: 'image/png' }),
  )
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) return src

  context.drawImage(bitmap, 0, 0)
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = image.data

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const ink = Math.max(red, green, blue)

    if (ink < 22) {
      pixels[index + 3] = 0
      continue
    }

    const cover = ink < 48 ? (ink - 22) / 26 : 1
    pixels[index] = 78
    pixels[index + 1] = 18
    pixels[index + 2] = 28
    pixels[index + 3] = Math.round(255 * cover)
  }

  context.putImageData(image, 0, 0)
  bitmap.close()
  return canvas.toDataURL('image/png')
}

export default function ScreenOne({ onNext }: { onNext: () => void }) {
  const [titleSrc, setTitleSrc] = useState<string | null>(null)
  const [bridgeReady, setBridgeReady] = useState(false)
  const [titleReady, setTitleReady] = useState(false)
  const [lineReady, setLineReady] = useState(false)
  const [typedCount, setTypedCount] = useState(0)
  const [lineDone, setLineDone] = useState(false)
  const artworkReady = bridgeReady && titleReady && titleSrc !== null
  const typedLine = START_GLYPHS.slice(0, typedCount).join('')

  useLayoutEffect(() => {
    let cancelled = false
    titleWithoutBlackField(titleArt).then((src) => {
      if (!cancelled) setTitleSrc(src)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useLayoutEffect(() => {
    if (!artworkReady) return

    const canvas = document.getElementById('screen-one-canvas')
    const bridge = document.getElementById('screen-one-bridge')
    const title = document.getElementById('screen-one-title')
    if (!canvas || !bridge || !title) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let cancelled = false

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set([bridge, title], { y: 0 })
        setLineReady(true)
        return
      }

      const frame = canvas.getBoundingClientRect()
      const bridgeBox = bridge.getBoundingClientRect()
      const titleBox = title.getBoundingClientRect()

      gsap.set(bridge, { y: frame.top - bridgeBox.bottom - 16 })
      gsap.set(title, { y: frame.bottom - titleBox.top + 16 })

      gsap
        .timeline({
          onComplete: () => {
            if (!cancelled) setLineReady(true)
          },
        })
        .to(bridge, { y: 0, duration: 1.55, ease: 'power3.out' })
        .to(title, { y: 0, duration: 1.4, ease: 'power3.out' })
    }, canvas)

    return () => {
      cancelled = true
      context.revert()
    }
  }, [artworkReady])

  useEffect(() => {
    if (!lineReady) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reduceMotion) {
      setTypedCount(START_GLYPHS.length)
      setLineDone(true)
      return
    }

    const progress = { value: 0 }
    const tween = gsap.to(progress, {
      value: START_GLYPHS.length,
      duration: START_GLYPHS.length * 0.11,
      ease: 'none',
      onUpdate: () => setTypedCount(Math.round(progress.value)),
      onComplete: () => setLineDone(true),
    })

    return () => {
      tween.kill()
    }
  }, [lineReady])

  return (
    <main className={frostFrameClass}>
      <FrostPanel
        id="screen-one-canvas"
        className="max-h-[calc(100svh-clamp(3rem,14vh,7rem))]"
      >
        <div className="flex w-full flex-col items-center px-[clamp(1rem,5vw,3rem)] py-[clamp(1rem,4vh,2.5rem)]">
          <img
            id="screen-one-bridge"
            src={bridgeArt}
            alt=""
            onLoad={() => setBridgeReady(true)}
            className="h-auto max-h-[min(18svh,9.5rem)] w-[min(100%,54rem)] object-contain"
          />
          {titleSrc ? (
            <img
              id="screen-one-title"
              src={titleSrc}
              alt="শুভম · অমৃতা"
              onLoad={() => setTitleReady(true)}
              className="mt-6 h-auto max-h-[min(26svh,15rem)] w-[min(88%,36rem)] object-contain sm:mt-8"
            />
          ) : null}
          <p
            lang="bn"
            className="start-line mt-8 min-h-[1.6em] text-center text-[clamp(1.15rem,2.2vw,1.55rem)] sm:mt-10"
            style={{ fontFamily: '"ShubhamritaBengali", "Nirmala UI", serif' }}
          >
            {typedLine}
            {lineReady ? <span className="type-caret" aria-hidden="true" /> : null}
          </p>
          <motion.button
            type="button"
            aria-label="পরের পর্দায় যান"
            className="mt-5 inline-flex h-11 w-11 items-center justify-center text-[#4e121c]"
            initial={false}
            animate={lineDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ pointerEvents: lineDone ? 'auto' : 'none' }}
            onClick={onNext}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 9.5 12 15.5 18 9.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>
      </FrostPanel>
    </main>
  )
}
