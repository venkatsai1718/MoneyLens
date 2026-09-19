import React from 'react'

export const DISCLAIMER_TEXT =
  'Calculations shown are estimates based on the assumptions entered by the user. Actual investment returns may differ. Expected returns are not guaranteed. This calculator is intended for educational and informational purposes and should not be treated as investment advice.'

export function Disclaimer({ text = DISCLAIMER_TEXT }: { text?: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border-soft bg-platinum/40 px-4 py-3.5 text-xs leading-relaxed text-ink-muted">
      <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p>{text}</p>
    </div>
  )
}
