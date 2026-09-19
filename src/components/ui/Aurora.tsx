import React from 'react'

/**
 * A single restrained accent glow for near-black sections — modeled on the
 * ".glow-radial" treatment on minimal dark reference sites (one soft light
 * source, not a multi-color aurora). Purely decorative (aria-hidden),
 * heavily blurred and low-opacity so it never competes with foreground text
 * contrast, and stands still for prefers-reduced-motion users.
 */
export function Aurora({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[36rem] w-[42rem] rounded-full opacity-[0.14] blur-3xl motion-safe:animate-auroraA motion-reduce:animate-none"
        style={{ background: 'radial-gradient(ellipse, #20d49a 0%, transparent 65%)' }}
      />
      <div
        className="absolute bottom-[-10rem] right-[10%] h-[20rem] w-[20rem] rounded-full opacity-[0.08] blur-3xl motion-safe:animate-auroraB motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, #20d49a 0%, transparent 70%)', animationDelay: '3s' }}
      />
    </div>
  )
}
