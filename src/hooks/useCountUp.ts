import { useEffect, useRef, useState } from 'react'

const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Animates a number from its previous value to `target` over `duration` ms.
 * Used for result figures so a recalculated total visibly counts to its new
 * value instead of just snapping — but snaps instantly for reduced-motion
 * users, and on the very first render (nothing to animate *from* yet).
 */
export function useCountUp(target: number, duration = 700): number {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      fromRef.current = target
      setDisplay(target)
      return
    }

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(target)
      fromRef.current = target
      return
    }

    const from = fromRef.current
    const delta = target - from
    if (delta === 0) return

    const start = performance.now()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      const eased = EASE_OUT(progress)
      setDisplay(from + delta * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return display
}
