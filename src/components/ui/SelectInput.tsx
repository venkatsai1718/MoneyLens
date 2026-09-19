import React, { useId } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  hint?: string
}

export function SelectInput({ label, value, onChange, options, hint }: SelectInputProps) {
  const id = useId()
  return (
    <div className="w-full">
      <label htmlFor={id} className="text-sm font-medium text-ink-soft mb-1.5 block">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-white px-3.5 py-2.5 text-[15px] font-semibold text-ink outline-none transition-colors focus:border-gunmetal focus:shadow-focus focus-visible:shadow-focus cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {hint && <p className="text-xs text-ink-muted mt-1.5">{hint}</p>}
    </div>
  )
}
