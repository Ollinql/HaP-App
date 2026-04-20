import { useState, useEffect } from 'react'
import { useGym } from '../../store/GymContext'
import type { GymWorkout } from '../../types/gym'

interface Props {
  workout: GymWorkout
  onUpdate: (workout: GymWorkout) => void
  onBeforeStart?: (startedAt: string) => void
  autoStart?: boolean
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function WorkoutTimer({ workout, onUpdate, onBeforeStart, autoStart }: Props) {
  const { updateGymWorkout } = useGym()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!workout.startedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [workout.startedAt])

  useEffect(() => {
    if (autoStart && !workout.startedAt && !workout.completedAt) {
      handleStart()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isRunning = !!workout.startedAt && !workout.completedAt

  const handleStart = () => {
    const startedAt = new Date().toISOString()
    const updated = { ...workout, startedAt, completedAt: null }
    if (onBeforeStart) {
      onBeforeStart(startedAt)
      onUpdate(updated)
      return
    }
    updateGymWorkout(updated)
    onUpdate(updated)
  }

  const handleStop = () => {
    const startMs = workout.startedAt ? Date.parse(workout.startedAt) : Date.now()
    const durationMin = Math.round((Date.now() - startMs) / 60000)
    const updated = {
      ...workout,
      completedAt: new Date().toISOString(),
      duration: durationMin,
      startedAt: null,
    }
    updateGymWorkout(updated)
    onUpdate(updated)
  }

  const elapsed = isRunning && workout.startedAt ? now - Date.parse(workout.startedAt) : 0

  return (
    <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl">
      {isRunning && (
        <span className="text-xl font-mono text-accent tabular-nums">{formatElapsed(elapsed)}</span>
      )}
      {workout.duration !== null && !isRunning && (
        <span className="text-sm text-muted">{workout.duration} min</span>
      )}
      <div className="ml-auto">
        {isRunning ? (
          <button
            onClick={handleStop}
            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Training beenden
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-3 py-1.5 bg-accent/20 text-accent border border-accent/30 rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            Timer starten
          </button>
        )}
      </div>
    </div>
  )
}
