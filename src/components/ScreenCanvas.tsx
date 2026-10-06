import { useLayoutEffect, useRef } from 'react'
import dogArt from '../assets/travelcollage/image_7_dog.svg'
import glenaryPostcard from '../assets/travelcollage/glenarypostal.png'
import femaleInvite from '../assets/screen_comp/female_invite.png'
import maleInvite from '../assets/screen_comp/male_invite.png'
import marketArt from '../assets/travelcollage/image_7_market.svg'
import pathArt from '../assets/travelcollage/image_7_path.svg'
import puppetArt from '../assets/travelcollage/image_7_puppet.svg'
import shrineArt from '../assets/travelcollage/image_7_shrine.svg'
import treeArt from '../assets/travelcollage/image_7_tree.svg'
import travelBride from '../assets/travelcollage/travel_bride.png'
import travelGroom from '../assets/travelcollage/travel_groom.png'
import { gsap } from '../lib/gsap'
import FrostPanel, { frostFrameClass } from './FrostPanel'
import './ScreenCanvas.css'

const PROMPT_GLYPHS = Array.from(
  new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(
    'আয় মন বেড়াতে যাবি',
  ),
  (part) => part.segment,
)

const butterflyFrames = Object.entries(
  import.meta.glob('../assets/projapoti/butterfly_*.svg', {
    eager: true,
    import: 'default',
  }) as Record<string, string>,
)
  .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
  .map(([, source]) => source)

const MAP_LINK =
  'https://www.google.com/maps?vet=10CAAQoqAOahcKEwiYnI6QwaWXAxUAAAAAHQAAAAAQDA..i&udm&fvr=1&pvq=Cg0vZy8xMXM2NTlwdmJjIhsKFWJob290ZXIgcmFqYSBkaWxvIGJvchACGAM&lqi=ChViaG9vdGVyIHJhamEgZGlsbyBib3JIy9Lr1Ji4gIAIWicQABABEAIQAxgAGAEYAhgDIhViaG9vdGVyIHJhamEgZGlsbyBib3KSARJiZW5nYWxpX3Jlc3RhdXJhbnQ&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=Kdd_gyIfnfg5Mfk_DJroVJwz&daddr=424,+Barasat+Rd,+Ashok+Sen+Nagar,+Sodepur,+Panihati,+West+Bengal+700110'

const travelPhotos = [
  { src: dogArt, alt: 'A friendly dog from the couple’s travels', placement: 'travel-card--dog', enter: 'left' },
  { src: marketArt, alt: 'A lively market visited on the trip', placement: 'travel-card--market', enter: 'top' },
  { src: pathArt, alt: 'A quiet path through the landscape', placement: 'travel-card--path', enter: 'bottom' },
  { src: shrineArt, alt: 'A shrine along the journey', placement: 'travel-card--shrine', enter: 'right' },
  { src: puppetArt, alt: 'A colorful puppet from the trip', placement: 'travel-card--puppet', enter: 'left' },
  { src: treeArt, alt: 'A tree from one of their stops', placement: 'travel-card--tree', enter: 'bottom' },
]

function InvitationScene({ active }: { active: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const maleRef = useRef<HTMLImageElement>(null)
  const femaleRef = useRef<HTMLImageElement>(null)
  const butterflyLayerRef = useRef<HTMLDivElement>(null)
  const inviteFrameRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!active) return

    const stage = stageRef.current
    const male = maleRef.current
    const female = femaleRef.current
    const butterflyLayer = butterflyLayerRef.current
    const inviteFrame = inviteFrameRef.current
    if (!stage || !male || !female || !butterflyLayer || !inviteFrame) return

    const butterflies = Array.from(
      butterflyLayer.querySelectorAll<HTMLImageElement>(
        '.invitation-butterfly-frame',
      ),
    )
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(male, { autoAlpha: 1, x: 0, y: 0, rotation: 0 })
        gsap.set(female, {
          autoAlpha: 1,
          x: -stage.clientWidth * 0.12,
          y: 0,
          rotation: -1.5,
        })
        gsap.set(inviteFrame, { autoAlpha: 1, scale: 1, x: 0 })
        return
      }

      gsap.set(male, { autoAlpha: 1, x: 0, y: 0, rotation: 0 })
      gsap.set(female, { autoAlpha: 0, x: stage.clientWidth * 0.68, y: 16 })
      gsap.set(butterflies, { autoAlpha: 0 })
      gsap.set(inviteFrame, {
        autoAlpha: 0,
        scale: 0.72,
        x: 0,
        transformOrigin: '50% 50%',
      })

      const timeline = gsap.timeline()
      const walking = { progress: 0 }
      timeline.to(
        walking,
        {
          progress: 1,
          duration: 2.5,
          ease: 'power1.out',
          onUpdate: () => {
            const progress = walking.progress
            const step = Math.sin(progress * Math.PI * 12)
            const hugOverlap = stage.clientWidth * 0.12
            gsap.set(female, {
              autoAlpha: Math.min(1, progress * 5),
              x: stage.clientWidth * 0.68 * (1 - progress) - hugOverlap * progress,
              y: Math.abs(step) * (1 - progress) * 4,
              rotation: step * (1 - progress) * 0.8 - progress * 1.5,
            })
          },
        },
        0.35,
      )

      const butterflyStartsAt = 3.15
      const flight = { progress: 0 }
      let visibleFrame = -1
      timeline.to(
        flight,
        {
          progress: 1,
          duration: 4.2,
          ease: 'none',
          onUpdate: () => {
            const progress = flight.progress
            const frame = Math.floor(progress * 4.2 * 18) % butterflies.length
            const x = -48 + progress * (stage.clientWidth + 96)
            const y = stage.clientHeight * 0.08 + Math.sin(progress * Math.PI * 6) * 18

            if (frame !== visibleFrame) {
              gsap.set(butterflies, { autoAlpha: 0 })
              gsap.set(butterflies[frame], { autoAlpha: 1, x, y })
              visibleFrame = frame
            } else {
              gsap.set(butterflies[frame], { x, y })
            }
          },
        },
        butterflyStartsAt,
      )
      timeline.to(
        butterflies,
        { autoAlpha: 0, duration: 0.45, ease: 'power1.out' },
        butterflyStartsAt + 4.2,
      )
      timeline.fromTo(
        inviteFrame,
        { autoAlpha: 0, scale: 0.72, x: 0 },
        {
          autoAlpha: 1,
          scale: 1,
          x: 0,
          duration: 0.8,
          ease: 'back.out(1.55)',
        },
        butterflyStartsAt + 4.65,
      )
    }, stage)

    return () => context.revert()
  }, [active])

  return (
    <div ref={stageRef} className="invitation-stage">
      <img
        ref={maleRef}
        className="invitation-person invitation-person--male"
        src={maleInvite}
        alt="The groom standing on the left"
        draggable={false}
      />
      <img
        ref={femaleRef}
        className="invitation-person invitation-person--female"
        src={femaleInvite}
        alt="The bride walking in from the right"
        draggable={false}
      />
      <div
        ref={butterflyLayerRef}
        className="invitation-butterfly-layer"
        aria-hidden="true"
      >
        {butterflyFrames.map((source) => (
          <img
            key={source}
            className="invitation-butterfly-frame"
            src={source}
            alt=""
            draggable={false}
          />
        ))}
      </div>
      <section
        ref={inviteFrameRef}
        className="invitation-detail-frame"
        aria-label="Invitation details"
      >
        <p>স্থান: ভূতের রাজা দিলো বোর</p>
        <p>সময়ঃ দুপুর ১২টা</p>
        <p>সাজসজ্জা: সবেকি</p>
        <p className="invitation-welcome">নতুন দম্পতি আমন্ত্রিত</p>
        <a href={MAP_LINK} target="_blank" rel="noreferrer">
          মানচিত্র <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  )
}
function TravelCollage({ active }: { active: boolean }) {
  const collageRef = useRef<HTMLDivElement>(null)
  const postcardRef = useRef<HTMLImageElement>(null)
  const bridePortraitRef = useRef<HTMLImageElement>(null)
  const groomPortraitRef = useRef<HTMLImageElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const promptTextRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!active) return

    const collage = collageRef.current
    const postcard = postcardRef.current
    const bridePortrait = bridePortraitRef.current
    const groomPortrait = groomPortraitRef.current
    const intro = introRef.current
    const promptText = promptTextRef.current
    if (
      !collage ||
      !postcard ||
      !bridePortrait ||
      !groomPortrait ||
      !intro ||
      !promptText
    ) return

    const cards = Array.from(
      collage.querySelectorAll<HTMLElement>('.travel-card'),
    )
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(cards, { autoAlpha: 1, scale: 1, x: 0, y: 0 })
        gsap.set(postcard, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: -7 })
        gsap.set([bridePortrait, groomPortrait], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
        })
        gsap.set(intro, { autoAlpha: 0 })
        promptText.textContent = PROMPT_GLYPHS.join('')
        return
      }

      gsap.set(cards, { autoAlpha: 0 })
      gsap.set(postcard, {
        autoAlpha: 0,
        scale: 2.2,
        x: -12,
        y: -18,
        rotation: 13,
        transformOrigin: '50% 50%',
      })
      gsap.set([bridePortrait, groomPortrait], {
        autoAlpha: 0,
        x: 0,
        y: 22,
        rotation: 0,
        scale: 0.94,
        transformOrigin: '50% 100%',
      })
      gsap.set(intro, { autoAlpha: 0, y: 8 })
      const timeline = gsap.timeline()

      timeline.to(intro, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      })
      const typing = { value: 0 }
      timeline.to(
        typing,
        {
          value: PROMPT_GLYPHS.length,
          duration: 2.1,
          ease: 'none',
          onUpdate: () => {
            promptText.textContent = PROMPT_GLYPHS
              .slice(0, Math.floor(typing.value))
              .join('')
          },
        },
        0,
      )
      timeline.to(
        intro,
        {
          autoAlpha: 0,
          y: -6,
          duration: 0.9,
          ease: 'power2.in',
        },
        '+=1.6',
      )
      const collageStartsAt = timeline.duration() + 1

      cards.forEach((card, index) => {
        const enter = card.dataset.enter
        const horizontalOffset = window.innerWidth * 0.55
        const verticalOffset = window.innerHeight * 0.55
        const x = enter === 'left' ? -horizontalOffset : enter === 'right' ? horizontalOffset : 0
        const y = enter === 'top' ? -verticalOffset : enter === 'bottom' ? verticalOffset : 0

        timeline.fromTo(
          card,
          { autoAlpha: 0, scale: 0.88, x, y },
          {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            y: 0,
            duration: 1.05,
            ease: 'power3.out',
          },
          collageStartsAt + index * 0.11,
        )
      })

      const collageFormedAt = collageStartsAt + (cards.length - 1) * 0.11 + 1.05
      timeline.to(
        postcard,
        {
          autoAlpha: 1,
          scale: 1,
          x: 0,
          y: 0,
          rotation: -7,
          duration: 0.58,
          ease: 'back.out(2.2)',
        },
        collageFormedAt + 0.5,
      )

      const portraitsEnterAt = collageFormedAt + 1.2
      timeline.fromTo(
        bridePortrait,
        {
          autoAlpha: 0,
          x: -window.innerWidth * 0.35,
          y: 22,
          rotation: -8,
          scale: 0.94,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 1.05,
          ease: 'back.out(1.25)',
        },
        portraitsEnterAt,
      )
      timeline.fromTo(
        groomPortrait,
        {
          autoAlpha: 0,
          x: window.innerWidth * 0.35,
          y: 22,
          rotation: 8,
          scale: 0.94,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 1.05,
          ease: 'back.out(1.25)',
        },
        portraitsEnterAt,
      )
      timeline.to(
        bridePortrait,
        {
          y: -5,
          rotation: -2.5,
          duration: 0.9,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        },
        portraitsEnterAt + 1.05,
      )
      timeline.to(
        groomPortrait,
        {
          y: -5,
          rotation: 2.5,
          duration: 1,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        },
        portraitsEnterAt + 1.3,
      )
    }, collage)

    return () => context.revert()
  }, [active])

  return (
    <div ref={collageRef} className="travel-collage" aria-label="Couple’s travel scrapbook">
      <p ref={introRef} className="travel-collage-prompt" lang="bn">
        <span ref={promptTextRef} />{' '}
        <span className="travel-question-mark" aria-hidden="true">?</span>
      </p>
      <div className="travel-collage-stage">
        {travelPhotos.map((photo) => (
          <figure
            key={photo.placement}
            className={`travel-card ${photo.placement}`}
            data-enter={photo.enter}
          >
            <img src={photo.src} alt={photo.alt} draggable={false} />
          </figure>
        ))}
        <img
          ref={postcardRef}
          className="travel-postcard-stamp"
          src={glenaryPostcard}
          alt="Glenary’s Darjeeling postcard stamp"
          draggable={false}
        />
        <img
          ref={bridePortraitRef}
          className="travel-portrait travel-portrait--bride"
          src={travelBride}
          alt="The bride joining the travel scrapbook"
          draggable={false}
        />
        <img
          ref={groomPortraitRef}
          className="travel-portrait travel-portrait--groom"
          src={travelGroom}
          alt="The groom joining the travel scrapbook"
          draggable={false}
        />
      </div>
    </div>
  )
}

type ScreenCanvasProps = {
  screen: 3 | 4
  active?: boolean
  onBack: () => void
  onNext?: () => void
}

export default function ScreenCanvas({
  screen,
  active = false,
  onBack,
  onNext,
}: ScreenCanvasProps) {
  return (
    <main className={frostFrameClass} aria-label={`Screen ${screen}`}>
      <FrostPanel className="h-[min(74svh,760px)]">
        {screen === 3 ? <TravelCollage active={active} /> : null}
        {screen === 4 ? <InvitationScene active={active} /> : null}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-between py-4 sm:py-6">
          <button
            type="button"
            aria-label="আগের পর্দায় যান"
            className="screen-canvas-arrow pointer-events-auto inline-flex h-11 w-11 items-center justify-center text-[#4e121c]"
            onClick={onBack}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 14.5 12 8.5 18 14.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {onNext ? (
            <button
              type="button"
              aria-label="পরের পর্দায় যান"
              className="screen-canvas-arrow pointer-events-auto inline-flex h-11 w-11 items-center justify-center text-[#4e121c]"
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
            </button>
          ) : null}
        </div>
      </FrostPanel>
    </main>
  )
}
