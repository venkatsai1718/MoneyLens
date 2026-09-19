// Centralized input validation. Every calculator form runs its raw inputs
// through these helpers before they reach the calculation engine, so NaN /
// Infinity / negative values can never flow into a calculation.

export interface FieldValidation {
  valid: boolean
  error?: string
}

const MAX_AMOUNT = 1_000_00_00_000 // 1000 Crore ceiling, sanity bound
const MAX_YEARS = 75
const MAX_RATE = 50

export function validateAmount(
  value: number | null,
  opts: { required?: boolean; label?: string; allowZero?: boolean; max?: number } = {},
): FieldValidation {
  const label = opts.label ?? 'Amount'
  if (value === null || value === undefined || isNaN(value)) {
    return opts.required ? { valid: false, error: `${label} is required` } : { valid: true }
  }
  if (!isFinite(value)) return { valid: false, error: `${label} is too large` }
  if (value < 0) return { valid: false, error: `${label} cannot be negative` }
  if (!opts.allowZero && value === 0 && opts.required) {
    return { valid: false, error: `${label} must be greater than zero` }
  }
  if (value > (opts.max ?? MAX_AMOUNT)) {
    return { valid: false, error: `${label} is unrealistically large` }
  }
  return { valid: true }
}

export function validateRate(value: number | null, opts: { required?: boolean; label?: string; max?: number; min?: number } = {}): FieldValidation {
  const label = opts.label ?? 'Rate'
  if (value === null || value === undefined || isNaN(value)) {
    return opts.required ? { valid: false, error: `${label} is required` } : { valid: true }
  }
  if (!isFinite(value)) return { valid: false, error: `${label} is invalid` }
  const min = opts.min ?? 0
  if (value < min) return { valid: false, error: min > 0 ? `${label} must be at least ${min}%` : `${label} cannot be negative` }
  if (value > (opts.max ?? MAX_RATE)) return { valid: false, error: `${label} must be ${opts.max ?? MAX_RATE}% or less` }
  return { valid: true }
}

export function validateYears(value: number | null, opts: { required?: boolean; label?: string; min?: number; max?: number } = {}): FieldValidation {
  const label = opts.label ?? 'Duration'
  if (value === null || value === undefined || isNaN(value)) {
    return opts.required !== false ? { valid: false, error: `${label} is required` } : { valid: true }
  }
  if (!isFinite(value)) return { valid: false, error: `${label} is invalid` }
  const min = opts.min ?? 1
  if (value < min) return { valid: false, error: `${label} must be at least ${min}` }
  if (value > (opts.max ?? MAX_YEARS)) return { valid: false, error: `${label} must be ${opts.max ?? MAX_YEARS} or fewer` }
  return { valid: true }
}

export function isFormValid(validations: FieldValidation[]): boolean {
  return validations.every((v) => v.valid)
}

/** Guards a numeric result so charts/tables never receive NaN/Infinity/negative-corpus. */
export function safeNumber(value: number, fallback = 0): number {
  if (isNaN(value) || !isFinite(value)) return fallback
  return value
}

export function clampNonNegative(value: number): number {
  return Math.max(0, safeNumber(value))
}
