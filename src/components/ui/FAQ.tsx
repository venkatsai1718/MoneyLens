import React, { useState } from 'react'
import clsx from 'clsx'

export interface FAQItem {
  question: string
  answer: string
}

export function FAQ({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-border-soft rounded-2xl border border-border bg-white">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
            >
              <span className="text-sm sm:text-[15px] font-semibold text-ink">{item.question}</span>
              <svg
                className={clsx('h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-200', isOpen && 'rotate-180')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && <div className="px-5 sm:px-6 pb-4 -mt-1 text-sm leading-relaxed text-ink-soft animate-fadeIn">{item.answer}</div>}
          </div>
        )
      })}
    </div>
  )
}
