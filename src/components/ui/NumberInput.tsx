import React from 'react'
import { SliderInput } from './SliderInput'

export interface NumberInputProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  max?: number
  min?: number
  step?: number
  error?: string
  hint?: string
  showSlider?: boolean
  suffix?: string
}

export function NumberInput({ label, value, onChange, max = 100, min = 0, step = 1, error, hint, showSlider = false, suffix }: NumberInputProps) {
  return (
    <SliderInput
      label={label}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      suffix={suffix}
      error={error}
      hint={hint}
      showSlider={showSlider}
    />
  )
}
