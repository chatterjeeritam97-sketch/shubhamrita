import { useLayoutEffect, useRef, useState } from 'react'
import pinwheelOne from '../assets/pinwheel_vectors/pinwheelone.svg'
import pinwheelTwo from '../assets/pinwheel_vectors/pinwheeltwo.svg'
import stickOne from '../assets/pinwheel_vectors/stickone.svg'
import stickTwo from '../assets/pinwheel_vectors/sticktwo.svg'
import brideArt from '../assets/screen_comp/ammy_bride.png'
import beeOneArt from '../assets/screen_comp/bee1.png'
import beeTwoArt from '../assets/screen_comp/bee2.png'
import groomArt from '../assets/screen_comp/schrute_groom.png'
import { gsap } from '../lib/gsap'
import FrostPanel, { frostFrameClass } from './FrostPanel'
import './ScreenTwo.css'

function stageX(stage: HTMLElement, wheel: HTMLImageElement) {
  const parent = wheel.offsetParent
  const origin =
    parent instanceof HTMLElement && parent !== stage ? parent.offsetLeft : 0
  return origin + wheel.offsetLeft
}

function containedImageBounds(image: HTMLImageElement) {
  const imageBounds = image.getBoundingClientRect()
  const imageRatio = image.naturalWidth / image.naturalHeight
  const boxRatio = imageBounds.width / imageBounds.height
  const width = imageRatio > boxRatio ? imageBounds.width : imageBounds.height * imageRatio
  const height = imageRatio > boxRatio ? imageBounds.width / imageRatio : imageBounds.height

  return {
    left: imageBounds.left + (imageBounds.width - width) / 2,
    top: imageBounds.bottom - height,
    width,
    height,
  }
}

function phonePoint(
  image: HTMLImageElement,
  stage: HTMLElement,
  xRatio: number,
  yRatio: number,
) {
  const contentBounds = containedImageBounds(image)
  const stageBounds = stage.getBoundingClientRect()

  return {
    x:
      ((contentBounds.left - stageBounds.left + contentBounds.width * xRatio) /
        stageBounds.width) *
      1000,
    y:
      ((contentBounds.top - stageBounds.top + contentBounds.height * yRatio) /
        stageBounds.height) *
      1000,
  }
}

function imageMaskBounds(image: HTMLImageElement, stage: HTMLElement) {
  const imageBounds = containedImageBounds(image)
  const stageBounds = stage.getBoundingClientRect()
  const padding = 10

  return {
    x: ((imageBounds.left - stageBounds.left - padding) / stageBounds.width) * 1000,
    y: ((imageBounds.top - stageBounds.top - padding) / stageBounds.height) * 1000,
    width: ((imageBounds.width + padding * 2) / stageBounds.width) * 1000,
    height: ((imageBounds.height + padding * 2) / stageBounds.height) * 1000,
  }
}

function flightPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  below: boolean,
) {
  const curveY = below
    ? Math.min(930, Math.max(start.y, end.y) + 230)
    : Math.max(65, Math.min(start.y, end.y) - 210)
  const controlOneX = start.x + (end.x - start.x) * 0.32
  const controlTwoX = start.x + (end.x - start.x) * 0.68

  return `M ${start.x} ${start.y} C ${controlOneX} ${curveY}, ${controlTwoX} ${curveY}, ${end.x} ${end.y}`
}

function travelledPath(route: SVGPathElement, distance: number) {
  const totalLength = route.getTotalLength()
  const travelledLength = Math.min(distance, totalLength)
  const start = route.getPointAtLength(0)
  const steps = Math.max(1, Math.ceil(travelledLength / 8))
  let path = `M ${start.x} ${start.y}`

  for (let index = 1; index <= steps; index += 1) {
    const point = route.getPointAtLength((travelledLength * index) / steps)
    path += ` L ${point.x} ${point.y}`
  }

  return path
}

function fireCanvasConfetti(
  layer: HTMLElement | null,
  canvas: HTMLElement,
  origin: { x: number; y: number },
) {
  if (!layer) return

  const colors = ['#ffd447', '#f47f70', '#79d8b5', '#ae91e5', '#fff0a6']
  const burst = document.createElement('div')
  burst.className = 'confetti-burst'
  burst.style.left = `${origin.x}px`
  burst.style.top = `${origin.y}px`

  const particles = Array.from({ length: 72 }, (_, index) => {
    const particle = document.createElement('span')
    particle.className = 'confetti-piece'
    particle.style.backgroundColor = colors[index % colors.length]
    burst.appendChild(particle)

    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * Math.hypot(canvas.clientWidth, canvas.clientHeight) * 0.62
    return {
      element: particle,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotation: (index % 2 === 0 ? 1 : -1) * (180 + Math.random() * 360),
    }
  })

  layer.appendChild(burst)
  gsap.set(particles.map(({ element }) => element), {
    x: 0,
    y: 0,
    scale: 0.4,
    autoAlpha: 0,
    rotation: 0,
  })

  const timeline = gsap.timeline({ onComplete: () => burst.remove() })
  const pieces = particles.map(({ element }) => element)
  timeline.to(
    pieces,
    { scale: 1, autoAlpha: 1, duration: 0.12, ease: 'back.out(2)' },
    0,
  )
  timeline.to(
    pieces,
    {
      x: (index) => particles[index].x,
      y: (index) => particles[index].y,
      rotation: (index) => particles[index].rotation,
      scale: 0.55,
      autoAlpha: 0,
      duration: 2.88,
      ease: 'power2.out',
    },
    0.12,
  )
}

function animateBeeFlight(
  stage: HTMLElement,
  bee: HTMLImageElement,
  trail: SVGPathElement,
  pathData: string,
  delay = 0,
  onComplete?: () => void,
) {
  const context = gsap.context(() => {
    const route = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    route.setAttribute('d', pathData)
    const length = route.getTotalLength()
    const stageBounds = stage.getBoundingClientRect()
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    trail.setAttribute('d', travelledPath(route, 0))
    gsap.set(trail, { visibility: 'hidden' })

    const moveBee = (progress: number) => {
      const distance = progress * length
      const point = route.getPointAtLength(distance)
      gsap.set(bee, {
        x: (point.x / 1000) * stageBounds.width - bee.offsetWidth / 2,
        y: (point.y / 1000) * stageBounds.height - bee.offsetHeight / 2,
        rotation: 0,
      })
    }

    if (reduceMotion) {
      moveBee(1)
      gsap.set(bee, { autoAlpha: 0 })
      trail.setAttribute('d', pathData)
      gsap.set(trail, { visibility: 'visible' })
      return
    }

    moveBee(0)
    gsap.set(bee, { autoAlpha: 1, scale: 0, transformOrigin: '50% 50%' })
    const progress = { value: 0 }
    const timeline = gsap.timeline({
      delay,
      onComplete: () => {
        gsap.to(bee, { autoAlpha: 0, duration: 0.2 })
        onComplete?.()
      },
    })
    timeline.to(bee, { scale: 1, duration: 0.28, ease: 'back.out(2)' })
    timeline.to(
      progress,
      {
        value: 1,
        duration: 1.9,
        ease: 'power1.inOut',
        onUpdate: () => {
          moveBee(progress.value)
          trail.setAttribute('d', travelledPath(route, progress.value * length))
          if (progress.value > 0) {
            gsap.set(trail, { visibility: 'visible' })
          }
        },
      },
      '<0.08',
    )
  }, stage)

  return () => context.revert()
}

export default function ScreenTwo({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: () => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const crackleLayerRef = useRef<HTMLDivElement>(null)
  const leftStickRef = useRef<HTMLImageElement>(null)
  const rightStickRef = useRef<HTMLImageElement>(null)
  const leftWheelRef = useRef<HTMLImageElement>(null)
  const rightWheelRef = useRef<HTMLImageElement>(null)
  const brideRef = useRef<HTMLImageElement>(null)
  const groomRef = useRef<HTMLImageElement>(null)
  const matchButtonRef = useRef<HTMLButtonElement>(null)
  const beeOneRef = useRef<HTMLImageElement>(null)
  const beeTwoRef = useRef<HTMLImageElement>(null)
  const beeOneTrailRef = useRef<SVGPathElement>(null)
  const beeTwoTrailRef = useRef<SVGPathElement>(null)
  const [ready, setReady] = useState(false)
  const [hasClickedMatch, setHasClickedMatch] = useState(false)
  const [beeOneFlight, setBeeOneFlight] = useState({ path: '', id: 0 })
  const [beeTwoFlight, setBeeTwoFlight] = useState({ path: '', id: 0 })
  const [trailMask, setTrailMask] = useState<{
    bride: ReturnType<typeof imageMaskBounds>
    groom: ReturnType<typeof imageMaskBounds>
    bridePhone: ReturnType<typeof phonePoint>
    groomPhone: ReturnType<typeof phonePoint>
  } | null>(null)
  const loaded = useRef(0)

  const markLoaded = () => {
    loaded.current += 1
    if (loaded.current >= 4) setReady(true)
  }

  useLayoutEffect(() => {
    const images = [
      leftStickRef.current,
      rightStickRef.current,
      leftWheelRef.current,
      rightWheelRef.current,
    ]
    if (images.every((image) => image?.complete && image.naturalWidth > 0)) {
      setReady(true)
    }
  }, [])

  useLayoutEffect(() => {
    if (!ready) return

    const stage = stageRef.current
    const leftStick = leftStickRef.current
    const rightStick = rightStickRef.current
    const leftWheel = leftWheelRef.current
    const rightWheel = rightWheelRef.current
    const bride = brideRef.current
    const groom = groomRef.current
    const matchButton = matchButtonRef.current
    if (!stage || !leftStick || !rightStick || !leftWheel || !rightWheel) return
    if (!bride || !groom || !matchButton) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const context = gsap.context(() => {
      gsap.set(leftStick, {
        autoAlpha: 1,
        scale: 0,
        transformOrigin: '3.2% 98.3%',
      })
      gsap.set(rightStick, {
        autoAlpha: 1,
        scale: 0,
        transformOrigin: '95.5% 98.4%',
      })
      gsap.set(leftWheel, {
        autoAlpha: 1,
        xPercent: -50.273,
        yPercent: -50.82,
        x: -(stageX(stage, leftWheel) + leftWheel.offsetWidth + 24),
        y: -14,
        rotation: -30,
        transformOrigin: '50.3% 50.8%',
      })
      gsap.set(rightWheel, {
        autoAlpha: 1,
        xPercent: -50.698,
        yPercent: -49.861,
        x: stage.clientWidth - stageX(stage, rightWheel) + 24,
        y: -14,
        rotation: 30,
        transformOrigin: '50.7% 49.9%',
      })

      if (reduceMotion) {
        gsap.set([leftStick, rightStick], { scale: 1 })
        gsap.set([leftWheel, rightWheel], { x: 0, y: 0, rotation: 0 })
        gsap.set([bride, groom, matchButton], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        })
        return
      }

      gsap.set([bride, groom], {
        autoAlpha: 0,
        y: 110,
        scale: 0.94,
        transformOrigin: '50% 100%',
      })
      gsap.set(matchButton, {
        autoAlpha: 0,
        scale: 0.5,
        transformOrigin: '50% 50%',
      })

      const timeline = gsap.timeline()
      timeline.to(
        [leftStick, rightStick],
        { scale: 1, duration: 0.62, ease: 'back.out(1.7)', stagger: 0.08 },
      )
      timeline.to(
        leftWheel,
        { x: 0, y: 0, rotation: 0, duration: 1.2, ease: 'power2.out' },
        0.32,
      )
      timeline.to(
        rightWheel,
        { x: 0, y: 0, rotation: 0, duration: 1.28, ease: 'power2.out' },
        0.4,
      )
      timeline.to(
        bride,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'back.out(1.35)',
        },
        1.68,
      )
      timeline.to(
        groom,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'back.out(1.35)',
        },
        1.84,
      )
      timeline.to(
        matchButton,
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' },
        2.5,
      )
      timeline.to(
        leftWheel,
        { rotation: '+=360', duration: 5.4, repeat: -1, ease: 'none' },
        1.68,
      )
      timeline.to(
        rightWheel,
        { rotation: '-=360', duration: 6.2, repeat: -1, ease: 'none' },
        1.68,
      )
      gsap.to(bride, {
        y: '-=7',
        duration: 2.2,
        delay: 2.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(groom, {
        y: '-=7',
        duration: 2.4,
        delay: 2.85,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, stage)

    return () => context.revert()
  }, [ready])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const bee = beeOneRef.current
    const trail = beeOneTrailRef.current
    if (!stage || !bee || !trail || !beeOneFlight.path) return
    return animateBeeFlight(stage, bee, trail, beeOneFlight.path)
  }, [beeOneFlight.id])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const bee = beeTwoRef.current
    const trail = beeTwoTrailRef.current
    if (!stage || !bee || !trail || !beeTwoFlight.path) return
    return animateBeeFlight(stage, bee, trail, beeTwoFlight.path, 2.25, () => {
      const layer = crackleLayerRef.current
      if (!layer) return

      const upperY = stage.clientHeight * 0.14
      fireCanvasConfetti(layer, stage, {
        x: stage.clientWidth * 0.12,
        y: upperY,
      })
      fireCanvasConfetti(layer, stage, {
        x: stage.clientWidth / 2,
        y: stage.clientHeight / 2,
      })
      fireCanvasConfetti(layer, stage, {
        x: stage.clientWidth * 0.88,
        y: upperY,
      })
    })
  }, [beeTwoFlight.id])

  const launchMatch = () => {
    setHasClickedMatch(true)
    const stage = stageRef.current
    const bride = brideRef.current
    const groom = groomRef.current
    if (!stage || !bride || !groom) return

    const bridePhone = phonePoint(bride, stage, 0.14, 0.46)
    const groomPhone = phonePoint(groom, stage, 0.86, 0.51)
    setTrailMask({
      bride: imageMaskBounds(bride, stage),
      groom: imageMaskBounds(groom, stage),
      bridePhone,
      groomPhone,
    })
    setBeeOneFlight((current) => ({
      path: flightPath(groomPhone, bridePhone, true),
      id: current.id + 1,
    }))
    setBeeTwoFlight((current) => ({
      path: flightPath(bridePhone, groomPhone, false),
      id: current.id + 1,
    }))
  }

  return (
    <div id="screen-two" className={frostFrameClass}>
      <FrostPanel className="h-[min(74svh,760px)]">
        <div ref={stageRef} className="pin-stage">
          <div className="pin-rig pin-rig--left">
            <img
              ref={leftStickRef}
              className="pin-stick"
              src={stickTwo}
              alt=""
              onLoad={markLoaded}
            />
            <img
              ref={leftWheelRef}
              className="pin-wheel"
              src={pinwheelTwo}
              alt=""
              onLoad={markLoaded}
            />
          </div>
          <div className="pin-rig pin-rig--right">
            <img
              ref={rightStickRef}
              className="pin-stick"
              src={stickOne}
              alt=""
              onLoad={markLoaded}
            />
            <img
              ref={rightWheelRef}
              className="pin-wheel"
              src={pinwheelOne}
              alt=""
              onLoad={markLoaded}
            />
          </div>
        </div>
        <div className="character-scene">
          <img
            ref={brideRef}
            className="character-art character-art--bride"
            src={brideArt}
            alt="Ammy looking at her phone"
          />
          <img
            ref={groomRef}
            className="character-art character-art--groom"
            src={groomArt}
            alt="Schrute looking at his phone"
          />
          <svg
            className="bee-trail-layer"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <mask
                id="bee-trail-mask"
                x="0"
                y="0"
                width="1000"
                height="1000"
                maskUnits="userSpaceOnUse"
              >
                <rect width="1000" height="1000" fill="white" />
                {trailMask?.bridePhone && trailMask.groomPhone ? (
                  <>
                    <rect {...trailMask.bride} fill="black" />
                    <rect {...trailMask.groom} fill="black" />
                    <circle
                      cx={trailMask.bridePhone.x}
                      cy={trailMask.bridePhone.y}
                      r="58"
                      fill="white"
                    />
                    <circle
                      cx={trailMask.groomPhone.x}
                      cy={trailMask.groomPhone.y}
                      r="58"
                      fill="white"
                    />
                  </>
                ) : null}
              </mask>
            </defs>
            <g mask="url(#bee-trail-mask)">
              <path
                ref={beeOneTrailRef}
                className="bee-trail bee-trail--one"
                d={beeOneFlight.path}
              />
              <path
                ref={beeTwoTrailRef}
                className="bee-trail bee-trail--two"
                d={beeTwoFlight.path}
              />
            </g>
          </svg>
          <img ref={beeOneRef} className="bee-flight" src={beeOneArt} alt="" />
          <img ref={beeTwoRef} className="bee-flight" src={beeTwoArt} alt="" />
          <div ref={crackleLayerRef} className="confetti-layer" aria-hidden="true" />
          <button
            ref={matchButtonRef}
            type="button"
            className={`match-button${hasClickedMatch ? '' : ' match-button--vibrate'}`}
            aria-label="Match Ammy and Schrute"
            onClick={launchMatch}
          >
            মৌমাছি
          </button>
        </div>
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between py-4 sm:py-6">
          <button
            type="button"
            aria-label="আগের পর্দায় যান"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center text-[#4e121c]"
            onClick={onBack}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 14.5 12 8.5 18 14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="পরের পর্দায় যান"
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center text-[#4e121c]"
            onClick={onNext}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9.5 12 15.5 18 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </FrostPanel>
    </div>
  )
}
