import { useEffect, useState } from 'react'
import type { GymWorkout } from '../../types/gym'
import { useGym } from '../../store/GymContext'
import { fromISODate } from '../../utils/dateUtils'

interface Props {
  workout: GymWorkout
  totalWorkoutCount: number
  onClose: () => void
}

function calcPRs(workout: GymWorkout, allWorkouts: GymWorkout[]): number {
  let count = 0
  for (const we of workout.exercises) {
    const maxThisWorkout = Math.max(...we.sets.map((s) => s.weight), 0)
    const prevMax = allWorkouts
      .filter((w) => w.id !== workout.id && w.date <= workout.date)
      .flatMap((w) => w.exercises.filter((e) => e.exerciseId === we.exerciseId))
      .flatMap((e) => e.sets)
      .reduce((m, s) => Math.max(m, s.weight), 0)
    if (maxThisWorkout > prevMax) count++
  }
  return count
}

function calcVolume(workout: GymWorkout): number {
  return Math.round(
    workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0,
    ),
  )
}

function getBestSet(sets: GymWorkout['exercises'][0]['sets']): string {
  if (sets.length === 0) return '—'
  const best = sets.reduce((b, s) => (s.weight * s.reps > b.weight * b.reps ? s : b))
  if (best.weight === 0) return `${best.reps} Wdh.`
  return `${best.weight} kg × ${best.reps}`
}

function formatWorkoutDate(dateStr: string): string {
  const d = fromISODate(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

const STAR_DELAYS = [300, 150, 0, 150, 300]

export function WorkoutSummaryOverlay({ workout, totalWorkoutCount, onClose }: Props) {
  const { gymExercises, gymWorkouts } = useGym()
  const [visibleStars, setVisibleStars] = useState(0)

  const prCount = calcPRs(workout, gymWorkouts)
  const volume = calcVolume(workout)

  useEffect(() => {
    const timers = [1, 2, 3, 4, 5].map((n, i) =>
      setTimeout(() => setVisibleStars(n), 200 + i * 120),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleShare = async () => {
    const lines = [
      `💪 ${workout.title || 'Gym Training'} — ${formatWorkoutDate(workout.date)}`,
      workout.duration ? `⏱ ${workout.duration} min` : '',
      `👤 ${volume} kg Volumen`,
      prCount > 0 ? `🏆 ${prCount} neue PRs!` : '',
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      try { await navigator.share({ text: lines }) } catch { /* cancelled */ }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center bg-elevated rounded-full text-muted hover:text-primary transition-colors"
        >
          ✕
        </button>
        <button
          onClick={handleShare}
          className="w-9 h-9 flex items-center justify-center bg-accent/10 border border-accent/30 rounded-full text-accent hover:bg-accent/20 transition-colors"
          aria-label="Teilen"
        >
          ↑
        </button>
      </div>

      {/* Stars */}
      <div className="flex items-end justify-center gap-2 pt-4 pb-2 shrink-0">
        {[1, 2, 3, 4, 5].map((n, i) => {
          const isLit = n <= 3
          const delay = STAR_DELAYS[i]
          const visible = visibleStars >= n
          return (
            <span
              key={n}
              className={[
                'transition-all duration-300',
                n === 3 ? 'text-5xl' : n === 2 || n === 4 ? 'text-4xl' : 'text-3xl',
                visible && isLit ? 'opacity-100 scale-100' : 'opacity-30 scale-90',
              ].join(' ')}
              style={{ transitionDelay: `${delay}ms` }}
            >
              ★
            </span>
          )
        })}
      </div>

      {/* Headline */}
      <div className="text-center px-6 pb-6 shrink-0">
        <h1 className="text-2xl font-bold text-primary mb-1">Glückwunsch!</h1>
        <p className="text-muted text-sm">Das ist dein {totalWorkoutCount}. Workout!</p>
      </div>

      {/* Summary card */}
      <div className="mx-4 bg-surface border border-border rounded-2xl p-4 space-y-3 shrink-0">
        <div>
          <p className="font-bold text-primary text-base">{workout.title || 'Gym Training'}</p>
          <p className="text-sm text-muted">{formatWorkoutDate(workout.date)}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted">
          {workout.duration != null && (
            <span className="flex items-center gap-1">
              <span>⏱</span>
              <span>{workout.duration >= 60 ? `${Math.floor(workout.duration / 60)}h ${workout.duration % 60}min` : `${workout.duration}min`}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span>👤</span>
            <span>{volume} kg</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🏆</span>
            <span>{prCount} PRs</span>
          </span>
        </div>

        <div className="border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="font-semibold text-muted">Übung</span>
            <span className="font-semibold text-muted">Bestes Set</span>
            {workout.exercises.map((we) => {
              const ex = gymExercises.find((e) => e.id === we.exerciseId)
              const name = ex?.name ?? 'Unbekannt'
              const label = `${we.sets.length} × ${name}`
              return (
                <>
                  <span key={`${we.exerciseId}-name`} className="text-primary truncate">{label}</span>
                  <span key={`${we.exerciseId}-best`} className="text-primary">{getBestSet(we.sets)}</span>
                </>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="p-4 pb-8 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 text-sm font-medium text-muted border border-border rounded-xl hover:bg-elevated transition-colors"
        >
          Fertig
        </button>
      </div>
    </div>
  )
}
