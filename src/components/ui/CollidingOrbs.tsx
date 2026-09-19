import React, { useEffect, useRef } from 'react'

interface Ring {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
}

interface Dot {
  // position relative to its ring's own center
  x: number
  y: number
  vx: number
  vy: number
}

// Keeping each color's original size from the earlier 4-ring version — the
// yellow ring in particular is unchanged.
const RING_COLORS = ['#fbbf24', '#20d49a']
const RADII = [55, 70]

/**
 * Two ring-shaped "diagram" markers that drift around the hero and repel
 * each other (equal-mass elastic collision along the contact normal)
 * whenever they touch, instead of overlapping. Inside each ring, a small dot
 * runs its own independent bounce simulation against the ring's inner wall
 * — free-roaming, not tracing the border — so it never visually "touches"
 * the ring outline. Both simulations write straight to element transforms
 * from a single requestAnimationFrame loop (no React re-renders per frame).
 * Purely decorative (aria-hidden). Under prefers-reduced-motion neither
 * simulation starts — rings and dots sit static wherever they first land.
 */
export function CollidingOrbs({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ringRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([])
  const ringsData = useRef<Ring[]>([])
  const dotsData = useRef<Dot[]>([])
  const rafRef = useRef<number | undefined>(undefined)
  const lastTsRef = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const dotRadius = (r: number) => Math.max(r * 0.16, 9) / 2
    const dotMaxDist = (r: number) => r - dotRadius(r) - 4

    const applyTransforms = () => {
      ringsData.current.forEach((ring, i) => {
        const el = ringRefs.current[i]
        if (el) el.style.transform = `translate(${ring.x - ring.r}px, ${ring.y - ring.r}px)`

        const dot = dotsData.current[i]
        const dotEl = dotRefs.current[i]
        if (dot && dotEl) {
          const dr = dotRadius(ring.r)
          dotEl.style.transform = `translate(${ring.r + dot.x - dr}px, ${ring.r + dot.y - dr}px)`
        }
      })
    }

    const init = () => {
      const { width, height } = container.getBoundingClientRect()
      // First ring starts on the left heading rightward, second starts on
      // the right heading leftward — but each also gets its own random
      // vertical drift and random starting height, so they wander freely
      // around the section (bouncing off all four edges) instead of tracing
      // one fixed horizontal line.
      ringsData.current = RADII.map((r, i) => {
        const goingRight = i % 2 === 0
        return {
          x: goingRight ? r : width - r,
          y: Math.random() * Math.max(height - r * 2, 1) + r,
          vx: (goingRight ? 1 : -1) * (0.14 + Math.random() * 0.1),
          vy: (Math.random() - 0.5) * 0.22,
          r,
          color: RING_COLORS[i % RING_COLORS.length],
        }
      })
      dotsData.current = RADII.map((r) => {
        const max = dotMaxDist(r)
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * max * 0.6
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.07,
          vy: (Math.random() - 0.5) * 0.07,
        }
      })
      lastTsRef.current = 0
      applyTransforms()
    }

    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts
      const dt = Math.min(ts - lastTsRef.current, 48)
      lastTsRef.current = ts

      const { width, height } = container.getBoundingClientRect()
      const rings = ringsData.current
      const dots = dotsData.current

      for (const ring of rings) {
        ring.x += ring.vx * dt
        ring.y += ring.vy * dt
        if (ring.x - ring.r < 0) {
          ring.x = ring.r
          ring.vx = Math.abs(ring.vx)
        }
        if (ring.x + ring.r > width) {
          ring.x = width - ring.r
          ring.vx = -Math.abs(ring.vx)
        }
        if (ring.y - ring.r < 0) {
          ring.y = ring.r
          ring.vy = Math.abs(ring.vy)
        }
        if (ring.y + ring.r > height) {
          ring.y = height - ring.r
          ring.vy = -Math.abs(ring.vy)
        }
      }

      for (let i = 0; i < rings.length; i++) {
        for (let j = i + 1; j < rings.length; j++) {
          const a = rings[i]
          const b = rings[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 0.001
          const minDist = a.r + b.r
          if (dist < minDist) {
            const nx = dx / dist
            const ny = dy / dist
            const overlap = (minDist - dist) / 2
            a.x -= nx * overlap
            a.y -= ny * overlap
            b.x += nx * overlap
            b.y += ny * overlap
            const avn = a.vx * nx + a.vy * ny
            const bvn = b.vx * nx + b.vy * ny
            const diff = bvn - avn
            a.vx += diff * nx
            a.vy += diff * ny
            b.vx -= diff * nx
            b.vy -= diff * ny
          }
        }
      }

      // Each dot bounces freely inside its own ring's inner wall.
      rings.forEach((ring, i) => {
        const dot = dots[i]
        dot.x += dot.vx * dt
        dot.y += dot.vy * dt
        const max = dotMaxDist(ring.r)
        const dist = Math.hypot(dot.x, dot.y)
        if (dist > max) {
          const nx = dot.x / dist
          const ny = dot.y / dist
          dot.x = nx * max
          dot.y = ny * max
          const vn = dot.vx * nx + dot.vy * ny
          dot.vx -= 2 * vn * nx
          dot.vy -= 2 * vn * ny
        }
      })

      applyTransforms()
      rafRef.current = requestAnimationFrame(step)
    }

    init()
    if (!reducedMotion) rafRef.current = requestAnimationFrame(step)

    window.addEventListener('resize', init)
    return () => {
      window.removeEventListener('resize', init)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div aria-hidden ref={containerRef} className={`pointer-events-none absolute inset-x-0 top-0 h-[92vh] overflow-hidden ${className}`}>
      {RADII.map((r, i) => (
        <div
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el
          }}
          className="absolute"
          style={{ width: r * 2, height: r * 2 }}
        >
          <div className="relative h-full w-full">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${RING_COLORS[i]}80`,
                background: `${RING_COLORS[i]}0f`,
                boxShadow: `0 0 44px 8px ${RING_COLORS[i]}29, inset 0 0 24px ${RING_COLORS[i]}1f`,
              }}
            />
            <span
              ref={(el) => {
                dotRefs.current[i] = el
              }}
              className="absolute rounded-full"
              style={{
                width: Math.max(r * 0.16, 9),
                height: Math.max(r * 0.16, 9),
                backgroundColor: RING_COLORS[i],
                boxShadow: `0 0 12px 4px ${RING_COLORS[i]}99`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
