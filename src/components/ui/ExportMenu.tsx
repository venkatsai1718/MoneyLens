import React, { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from './Button'

export function ExportMenu({ onCSV, onPDF }: { onCSV: () => void; onPDF: () => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<'csv' | 'pdf' | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handle(type: 'csv' | 'pdf') {
    setBusy(type)
    setOpen(false)
    // Let the spinner actually paint before the (synchronous, occasionally
    // slow — PDF drawing + autotable) export work blocks the main thread.
    await new Promise((resolve) => setTimeout(resolve, 30))
    try {
      if (type === 'csv') onCSV()
      else onPDF()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <Button variant="outline" size="md" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M7 10l5 5 5-5M12 15V3" />
        </svg>
        Export
      </Button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-white shadow-elevated animate-fadeIn">
          <button
            role="menuitem"
            disabled={busy !== null}
            onClick={() => handle('csv')}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-platinum/60 disabled:opacity-50"
          >
            {busy === 'csv' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy === 'csv' ? 'Preparing…' : 'Download CSV'}
          </button>
          <button
            role="menuitem"
            disabled={busy !== null}
            onClick={() => handle('pdf')}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-platinum/60 disabled:opacity-50 border-t border-border-soft"
          >
            {busy === 'pdf' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
