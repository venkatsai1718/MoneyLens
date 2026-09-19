import React, { useId, useState, useEffect } from 'react'
import clsx from 'clsx'

export interface SliderInputProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max: number
  step?: number
  prefix?: string
  suffix?: string
  placeholder?: string
  error?: string
  hint?: string
  showSlider?: boolean
  optional?: boolean
  formatDisplay?: (v: number) => string
}

/**
 * Shared numeric input + range slider, styled as a compact label-and-pill
 * row (label left, editable value pill right, slider directly beneath) —
 * the pattern used by every major Indian SIP calculator, rather than a
 * full bordered text box. Typing in the pill updates the slider; dragging
 * the slider updates the pill.
 */
export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
  error,
  hint,
  showSlider = true,
  optional,
  formatDisplay,
}: SliderInputProps) {
  const id = useId()
  const [rawText, setRawText] = useState<string>(value === null || value === undefined ? '' : String(value))

  useEffect(() => {
    setRawText(value === null || value === undefined ? '' : String(value))
  }, [value])

  const sliderValue = value === null || value === undefined ? min : Math.min(Math.max(value, min), max)
  const message = error ?? hint
  void formatDisplay

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-2">
        <label htmlFor={id} className="text-sm text-ink-soft">
          {label} {optional && <span className="text-ink-muted">(optional)</span>}
        </label>
        <div
          className={clsx(
            'flex items-center rounded-lg px-2.5 py-1.5 transition-colors',
            error ? 'bg-accent-withdraw/15' : 'bg-platinum focus-within:bg-alabaster',
          )}
        >
          {prefix && <span className="text-ink-muted mr-0.5 text-xs font-semibold select-none">{prefix}</span>}
          <input
            id={id}
            type="text"
            inputMode="decimal"
            className="w-16 sm:w-20 bg-transparent text-right text-sm font-bold text-ink outline-none focus-visible:outline-none focus-visible:shadow-none placeholder:text-ink-muted placeholder:font-normal"
            value={rawText}
            placeholder={placeholder ?? '0'}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9.]/g, '')
              setRawText(cleaned)
              if (cleaned === '') {
                onChange(null)
              } else {
                const num = parseFloat(cleaned)
                onChange(isNaN(num) ? null : num)
              }
            }}
            onBlur={() => {
              if (rawText === '') return
              const num = parseFloat(rawText)
              if (!isNaN(num)) setRawText(String(num))
            }}
          />
          {suffix && <span className="text-ink-muted ml-0.5 text-xs font-semibold select-none">{suffix}</span>}
        </div>
      </div>

      {showSlider && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer focus-visible:outline-none focus-visible:shadow-none"
          aria-label={`${label} slider`}
        />
      )}

      <div className="min-h-[1.125rem] mt-1">
        {message && (
          <p id={error ? `${id}-error` : `${id}-hint`} className={clsx('text-xs', error ? 'text-accent-withdraw' : 'text-ink-muted')}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
