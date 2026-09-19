// Indian-locale number & currency formatting utilities.
// All calculation modules keep full precision internally; formatting
// (rounding, lakh/crore, ₹ symbol) happens only at the display boundary.

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const INR_FORMATTER_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const INR_NUMBER_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
})

/** ₹1,25,000 style formatting. */
export function formatINR(value: number, decimals = false): string {
  if (!isFinite(value) || isNaN(value)) return '₹0'
  const safe = Math.max(0, value)
  return decimals ? INR_FORMATTER_DECIMAL.format(safe) : INR_FORMATTER.format(safe)
}

/**
 * Compact Indian-unit currency: ₹50,000 / ₹1.25 Lakh / ₹25.00 Lakh / ₹1.20 Crore
 * Used in summary cards & chart labels where space is tight.
 */
export function formatINRCompact(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '₹0'
  const safe = Math.max(0, value)
  if (safe >= 1_00_00_000) {
    return `₹${(safe / 1_00_00_000).toFixed(2)} Cr`
  }
  if (safe >= 1_00_000) {
    return `₹${(safe / 1_00_000).toFixed(2)} L`
  }
  if (safe >= 1_000) {
    return `₹${INR_NUMBER_FORMATTER.format(Math.round(safe))}`
  }
  return `₹${INR_NUMBER_FORMATTER.format(Math.round(safe))}`
}

/** Short axis label for charts, e.g. ₹1.2L / ₹80K / ₹2.5Cr */
export function formatAxisINR(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '₹0'
  const safe = value
  const sign = safe < 0 ? '-' : ''
  const abs = Math.abs(safe)
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(0)}K`
  return `${sign}₹${Math.round(abs)}`
}

export function formatPercent(value: number, decimals = 2): string {
  if (!isFinite(value) || isNaN(value)) return '0%'
  return `${value.toFixed(decimals)}%`
}

export function todayFormatted(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
