import { useState, useEffect, useCallback } from 'react'

type Setter<T> = (val: T | ((prev: T) => T)) => void

export function useLocalStorage<T>(key: string, initialValue: T): [T, Setter<T>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue: Setter<T> = useCallback(
    (val) => {
      setStoredValue((prev) => {
        const next = val instanceof Function ? val(prev) : val
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // quota exceeded or private mode
        }
        return next
      })
    },
    [key],
  )

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return
      try {
        if (e.newValue !== null) {
          setStoredValue(JSON.parse(e.newValue) as T)
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key])

  return [storedValue, setValue]
}
