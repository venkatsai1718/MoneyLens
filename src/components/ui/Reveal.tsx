import React from 'react'
import { useInView } from '../../hooks/useInView'

export interface RevealProps {
  children: React.ReactNode
  delayMs?: number
  className?: string
  as?: 'div' | 'section'
}

/**
 * Fades + slides content up once it scrolls into view. One-shot (doesn't
 * re-trigger on scroll-back), and skips the animation entirely for
 * prefers-reduced-motion users (see useInView).
 */
export function Reveal({ children, delayMs = 0, className, as = 'div' }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const As = as as any

  return (
    <As
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
      }}
    >
      {children}
    </As>
  )
}
