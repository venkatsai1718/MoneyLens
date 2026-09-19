import React from 'react'
import { SliderInput } from './SliderInput'

export interface PercentageInputProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  error?: string
  hint?: string
  optional?: boolean
  showSlider?: boolean
}

export function PercentageInput({ label, value, onChange, min = 0, max = 30, step = 0.1, error, hint, optional, showSlider = true }: PercentageInputProps) {
  return (
    <SliderInput
      label={label}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      suffix="%"
      error={error}
      hint={hint}
      optional={optional}
      showSlider={showSlider}
    />
  )
}
