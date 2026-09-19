import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

type Primitive = string | number | boolean | null | undefined

/**
 * Keeps a flat object of calculator inputs in sync with the URL's query
 * string, so a configuration can be shared via link. Values are read once
 * on mount (so typing doesn't fight the URL) and written on every change.
 */
export function useUrlState<T extends Record<string, Primitive>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = useRef<T | null>(null)

  if (initial.current === null) {
    const parsed = { ...defaults }
    for (const key of Object.keys(defaults)) {
      const raw = searchParams.get(key)
      if (raw === null || raw === '') continue
      const defaultVal = defaults[key]
      if (typeof defaultVal === 'number') {
        const num = parseFloat(raw)
        if (!isNaN(num)) (parsed as any)[key] = num
      } else if (typeof defaultVal === 'boolean') {
        ;(parsed as any)[key] = raw === 'true'
      } else {
        ;(parsed as any)[key] = raw
      }
    }
    initial.current = parsed
  }

  const updateUrl = useCallback(
    (state: Partial<T>) => {
      const next = new URLSearchParams()
      for (const [key, value] of Object.entries(state)) {
        if (value === null || value === undefined || value === '') continue
        next.set(key, String(value))
      }
      setSearchParams(next, { replace: true })
    },
    [setSearchParams],
  )

  return useMemo(() => ({ initialState: initial.current as T, updateUrl }), [updateUrl])
}
