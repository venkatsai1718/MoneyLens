import React from 'react'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Aurora } from '../components/ui/Aurora'

export function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <Aurora />
      <div className="relative mx-auto max-w-md px-4 py-28 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-platinum text-ink-soft mb-6 animate-float">
          <Compass className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-ink-muted mb-2 animate-fadeIn" style={{ animationDelay: '60ms' }}>
          404
        </p>
        <h1 className="text-2xl font-bold text-ink mb-3 animate-fadeIn" style={{ animationDelay: '120ms' }}>
          Page not found
        </h1>
        <p className="text-sm text-ink-muted mb-8 animate-fadeIn" style={{ animationDelay: '180ms' }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="animate-fadeIn" style={{ animationDelay: '240ms' }}>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
