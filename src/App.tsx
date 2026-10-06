import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import RainReel from './components/RainReel'
import ScreenCanvas from './components/ScreenCanvas'
import ScreenOne from './components/ScreenOne'
import ScreenTwo from './components/ScreenTwo'
import backgroundMusic from './assets/sounds/bgmusic.m4a'
import { gsap } from './lib/gsap'

type ScreenNumber = 1 | 2 | 3 | 4

function App() {
  const [screen, setScreen] = useState<ScreenNumber>(1)
  const [screenVisit, setScreenVisit] = useState<Record<ScreenNumber, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  })
  const trackRef = useRef<HTMLDivElement>(null)
  const shownScreen = useRef<ScreenNumber>(1)

  useEffect(() => {
    const music = new Audio(backgroundMusic)
    music.loop = true
    music.volume = 0.45

    const removeResumeListeners = () => {
      document.removeEventListener('pointerdown', startMusic)
      document.removeEventListener('keydown', startMusic)
    }
    const startMusic = () => {
      void music.play().then(removeResumeListeners).catch(() => {
        // Autoplay can be blocked until the visitor interacts with the page.
      })
    }

    document.addEventListener('pointerdown', startMusic)
    document.addEventListener('keydown', startMusic)
    startMusic()

    return () => {
      removeResumeListeners()
      music.pause()
      music.currentTime = 0
    }
  }, [])

  const openScreen = (next: ScreenNumber) => {
    setScreen(next)
    setScreenVisit((current) => ({
      ...current,
      [next]: current[next] + 1,
    }))
  }

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const destination = -(screen - 1) * 25

    if (shownScreen.current === screen) {
      gsap.set(track, { yPercent: destination })
      return
    }

    shownScreen.current = screen
    gsap.to(track, {
      yPercent: destination,
      duration: reduceMotion ? 0 : 0.95,
      ease: 'power3.inOut',
      overwrite: true,
    })
  }, [screen])

  return (
    <>
      <RainReel />
      <div className="h-svh overflow-hidden">
        <div ref={trackRef} className="h-[400svh]">
          <ScreenOne key={`screen-1-${screenVisit[1]}`} onNext={() => openScreen(2)} />
          <ScreenTwo
            key={`screen-2-${screenVisit[2]}`}
            onBack={() => openScreen(1)}
            onNext={() => openScreen(3)}
          />
          <ScreenCanvas
            key={`screen-3-${screenVisit[3]}`}
            screen={3}
            active={screen === 3}
            onBack={() => openScreen(2)}
            onNext={() => openScreen(4)}
          />
          <ScreenCanvas
            key={`screen-4-${screenVisit[4]}`}
            screen={4}
            active={screen === 4}
            onBack={() => openScreen(3)}
          />
        </div>
      </div>
    </>
  )
}

export default App
