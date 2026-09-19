import React from 'react'
import { SliderInput } from './SliderInput'
import { formatINRCompact } from '../../utils/format'

export interface CurrencyInputProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  max?: number
  step?: number
  error?: string
  hint?: string
  optional?: boolean
  showSlider?: boolean
}

/** Rupee amount field with ₹ prefix and a Lakh/Crore-aware slider. */
export function CurrencyInput({ label, value, onChange, max = 10_00_000, step = 500, error, hint, optional, showSlider = true }: CurrencyInputProps) {
  return (
    <SliderInput
      label={label}
      value={value}
      onChange={onChange}
      min={0}
      max={max}
      step={step}
      prefix="₹"
      error={error}
      hint={hint}
      optional={optional}
      showSlider={showSlider}
      formatDisplay={formatINRCompact}
    />
  )
}
