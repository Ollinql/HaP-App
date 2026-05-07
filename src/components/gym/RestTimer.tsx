import { useState, useEffect, useRef } from 'react'

interface Props {
  seconds: number
  onDone: () => void
  onSkip: () => void
}

function fmt(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function RestTimer({ seconds, onDone, onSkip }: Props) {
  const [remaining, setRemaining] = useState(seconds)
  const doneRef = useRef(false)

  useEffect(() => {
    if (remaining <= 0) {
      if (!doneRef.current) {
        doneRef.current = true
        try { navigator.vibrate([200, 100, 200]) } catch { /* unsupported */ }
        onDone()
      }
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, onDone])

  const progress = remaining / seconds

  return (
    <div className="flex items-center justify-center gap-3 py-1.5">
      <div className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
          <circle cx="14" cy="14" r="12" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
          <circle
            cx="14" cy="14" r="12"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress)}`}
            strokeLinecap="round"
            transform="rotate(-90 14 14)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="text-accent font-mono text-base font-semibold tabular-nums">
          {fmt(remaining)}
        </span>
      </div>
      <button
        onClick={onSkip}
        className="text-xs text-muted hover:text-primary transition-colors"
      >
        Überspringen
      </button>
    </div>
  )
}
