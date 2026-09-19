import React from 'react'
import clsx from 'clsx'

export interface ToggleOption {
  value: string
  label: string
}

export interface ToggleProps {
  label?: string
  options: ToggleOption[]
  value: string
  onChange: (value: string) => void
}

/** Segmented control with a sliding highlight — used for mode switches like Percentage / Fixed Amount step-up. */
export function Toggle({ label, options, value, onChange }: ToggleProps) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  const count = options.length

  return (
    <div className="w-full">
      {label && <span className="text-sm font-medium text-ink-soft mb-1.5 block">{label}</span>}
      <div role="tablist" aria-label={label} className="relative grid w-full rounded-xl border border-border bg-platinum/60 p-1" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
        <div
          aria-hidden
          className="absolute inset-y-1 rounded-lg bg-white shadow-card transition-transform duration-300 ease-out"
          style={{ width: `calc((100% - 0.5rem) / ${count})`, transform: `translateX(${activeIndex * 100}%)`, left: '0.25rem' }}
        />
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'relative z-10 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200',
              value === opt.value ? 'text-ink' : 'text-ink-muted hover:text-ink-soft',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
