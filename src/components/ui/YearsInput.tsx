import React from 'react'
import { SliderInput } from './SliderInput'

export interface YearsInputProps {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  max?: number
  min?: number
  error?: string
  hint?: string
  suffix?: string
}

export function YearsInput({ label, value, onChange, max = 40, min = 1, error, hint, suffix = 'Yrs' }: YearsInputProps) {
  return <SliderInput label={label} value={value} onChange={onChange} min={min} max={max} step={1} suffix={suffix} error={error} hint={hint} />
}
