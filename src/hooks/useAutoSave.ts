import { useEffect, useRef, useState } from 'react'

type SaveStatus = 'idle' | 'pending' | 'saved'

export function useAutoSave<T>(
  data: T,
  save: (data: T) => void,
  options: { delay?: number; enabled?: boolean } = {},
): SaveStatus {
  const { delay = 1500, enabled = true } = options
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const isFirstRender = useRef(true)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!enabled) return

    clearTimeout(timerRef.current)
    setStatus('pending')

    timerRef.current = setTimeout(() => {
      save(data)
      setStatus('saved')
      clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setStatus('idle'), 2000)
    }, delay)

    return () => clearTimeout(timerRef.current)
  }, [data, save, delay, enabled])

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(savedTimerRef.current)
    }
  }, [])

  return status
}
