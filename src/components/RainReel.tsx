import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import './RainReel.css'

const motifModules = import.meta.glob('../assets/rain_reel/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const motifs = Object.entries(motifModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const COLUMN_WIDTH = 128

type Motif = {
  src: string
  rx: number
  ry: number
  rz: number
  tx: number
  scale: number
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[next[index], next[swap]] = [next[swap], next[index]]
  }
  return next
}

function useColumnCount() {
  const [count, setCount] = useState(() =>
    Math.max(1, Math.ceil(window.innerWidth / COLUMN_WIDTH)),
  )

  useEffect(() => {
    const update = () => {
      setCount(Math.max(1, Math.ceil(window.innerWidth / COLUMN_WIDTH)))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

function columnMotifs(columnIndex: number, seed: number): Motif[] {
  const random = mulberry32(seed + columnIndex * 9973)
  return shuffle(motifs, random).map((src) => ({
    src,
    rx: (random() - 0.5) * 14,
    ry: (random() - 0.5) * 24,
    rz: (random() - 0.5) * 12,
    tx: (random() - 0.5) * 28,
    scale: 0.88 + random() * 0.2,
  }))
}

function MotifSet({ items, hidden }: { items: Motif[]; hidden?: boolean }) {
  return (
    <div className="rain-set" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <img
          key={`${item.src}-${index}`}
          src={item.src}
          alt=""
          draggable={false}
          style={
            {
              '--rx': `${item.rx}deg`,
              '--ry': `${item.ry}deg`,
              '--rz': `${item.rz}deg`,
              '--tx': `${item.tx}px`,
              '--scale': item.scale,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export default function RainReel() {
  const columnCount = useColumnCount()
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000_000))
  const columns = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, index) => ({
        items: columnMotifs(index, seed),
        direction: index % 2 === 0 ? 'up' : 'down',
        duration: 48 + (index % 5) * 7,
        delay: -index * 4.2,
      })),
    [columnCount, seed],
  )

  return (
    <div className="rain-reel" aria-hidden="true">
      {columns.map((column, index) => (
        <div className="rain-column" key={index}>
          <div
            className={`rain-track rain-track--${column.direction}`}
            style={{
              animationDuration: `${column.duration}s`,
              animationDelay: `${column.delay}s`,
            }}
          >
            <MotifSet items={column.items} />
            <MotifSet items={column.items} hidden />
          </div>
        </div>
      ))}
    </div>
  )
}
