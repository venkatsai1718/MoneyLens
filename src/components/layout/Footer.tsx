import React from 'react'
import { Link } from 'react-router-dom'
import { CALCULATORS } from '../../data/calculators'
import { LogoMark } from '../ui/LogoMark'

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-gradient-to-b from-platinum/25 via-white to-white mt-20">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-carbon/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-10">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <LogoMark />
              <span className="text-lg font-bold tracking-tight text-ink">MoneyLens</span>
            </Link>
            <p className="text-xs text-ink-muted leading-relaxed">Understand your money. See the numbers. Plan with clarity</p>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-12 sm:ml-auto">
            <div>
              <ul className="space-y-1.5">
                {CALCULATORS.slice(0, 4).map((c) => (
                  <li key={c.key}>
                    <Link to={c.route} className="text-xs text-ink-soft hover:text-ink transition-colors">
                      {c.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ul className="space-y-1.5">
                {CALCULATORS.slice(4, 8).map((c) => (
                  <li key={c.key}>
                    <Link to={c.route} className="text-xs text-ink-soft hover:text-ink transition-colors">
                      {c.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <ul className="space-y-1.5">
                {CALCULATORS.slice(8).map((c) => (
                  <li key={c.key}>
                    <Link to={c.route} className="text-xs text-ink-soft hover:text-ink transition-colors">
                      {c.shortName}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/compare" className="text-xs text-ink-soft hover:text-ink transition-colors">
                    Compare Investments
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">© {new Date().getFullYear()} MoneyLens.</p>
          <p className="text-xs text-ink-muted">Currency INR (₹).</p>
        </div>
      </div>
    </footer>
  )
}
