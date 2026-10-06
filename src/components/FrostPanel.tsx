import type { ReactNode } from 'react'

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")"

export const frostFrameClass =
  'relative z-10 grid h-svh place-items-center px-[max(clamp(.75rem,5vw,3.75rem),env(safe-area-inset-left))] py-[max(clamp(1rem,7vh,4.25rem),env(safe-area-inset-top))]'

export const frostCanvasClass =
  'relative w-[min(92vw,980px)] md:w-[min(80vw,980px)] overflow-hidden rounded-[clamp(1rem,3vw,1.75rem)] border border-white/55 bg-[#f6f0e6]/25 shadow-[0_24px_70px_rgba(70,46,20,0.14),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl'

export default function FrostPanel({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <section id={id} className={`${frostCanvasClass} ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </section>
  )
}
