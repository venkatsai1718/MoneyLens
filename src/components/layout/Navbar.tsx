import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { CALCULATORS } from '../../data/calculators'
import { LogoMark } from '../ui/LogoMark'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [calcMenuOpen, setCalcMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMobileOpen(false)
    setCalcMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setCalcMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  const isCalculatorActive = CALCULATORS.some((c) => c.route === location.pathname)

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setCalcMenuOpen(true)
  }
  function closeMenuSoon() {
    // Small delay so moving the cursor from the trigger down into the panel
    // (there's a gap between them) doesn't close it before you get there.
    closeTimer.current = setTimeout(() => setCalcMenuOpen(false), 120)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-snow/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_24px_-6px_rgba(32,212,154,0.18)]">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-carbon/50 to-transparent" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="MoneyLens home">
          <LogoMark />
          <span className="text-lg font-bold tracking-tight text-ink">MoneyLens</span>
        </Link>

        <div className="hidden lg:flex flex-1 items-center justify-center gap-1">
          <div className="relative" ref={menuRef} onMouseEnter={openMenu} onMouseLeave={closeMenuSoon}>
            <button
              onClick={() => setCalcMenuOpen((v) => !v)}
              aria-expanded={calcMenuOpen}
              aria-haspopup="menu"
              className={clsx(
                'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isCalculatorActive ? 'text-ink' : 'text-ink-soft hover:text-ink',
              )}
            >
              Calculators
              <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', calcMenuOpen && 'rotate-180')} />
            </button>
            {calcMenuOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-2 w-[560px] rounded-2xl border border-border bg-white p-3 shadow-elevated animate-fadeIn grid grid-cols-2 gap-1"
              >
                {CALCULATORS.map((c) => (
                  <Link
                    key={c.key}
                    to={c.route}
                    role="menuitem"
                    className={clsx(
                      'flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-platinum/60 transition-colors',
                      location.pathname === c.route && 'bg-platinum/60',
                    )}
                  >
                    <c.icon className="h-4 w-4 mt-0.5 text-ink-soft shrink-0" />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{c.shortName}</span>
                      <span className="block text-xs text-ink-muted mt-0.5 leading-snug">{c.description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              clsx('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-ink' : 'text-ink-soft hover:text-ink')
            }
          >
            Compare
          </NavLink>
          <NavLink
            to="/resources"
            className={({ isActive }) =>
              clsx('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-ink' : 'text-ink-soft hover:text-ink')
            }
          >
            Resources
          </NavLink>
        </div>

        <button
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg text-ink"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border-soft bg-white animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted px-2 mb-2">Calculators</p>
            {CALCULATORS.map((c) => (
              <Link
                key={c.key}
                to={c.route}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium',
                  location.pathname === c.route ? 'bg-platinum text-ink' : 'text-ink-soft',
                )}
              >
                <c.icon className="h-4 w-4" />
                {c.shortName}
              </Link>
            ))}
            <div className="border-t border-border-soft my-2 pt-2 space-y-1">
              <Link to="/compare" className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft">
                Compare
              </Link>
              <Link to="/resources" className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-soft">
                Resources
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
