import React from 'react'

/**
 * The MoneyLens icon mark: two parallel bars tilted 45° anticlockwise into
 * a diagonal "=" — a nod to calculation/results, the core of what every
 * tool on this site does. A real vector icon (no background box) instead
 * of a text-in-a-box badge, so it stays crisp at any size.
 */
export function LogoMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center text-carbon ${className}`}>
      <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden focusable="false">
        <g transform="rotate(-45 12 12)">
          <rect x="4" y="6" width="16" height="4" rx="2" fill="currentColor" />
          <rect x="4" y="14" width="16" height="4" rx="2" fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}
