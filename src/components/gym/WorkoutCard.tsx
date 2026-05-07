import { useNavigate } from 'react-router-dom'
import type { GymWorkout } from '../../types/gym'
import { useGym } from '../../store/GymContext'
import { fromISODate } from '../../utils/dateUtils'

interface Props {
  workout: GymWorkout
  allWorkouts: GymWorkout[]
}

function calcVolume(workout: GymWorkout): number {
  return Math.round(
    workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0,
    ),
  )
}

function calcPRs(workout: GymWorkout, allWorkouts: GymWorkout[]): number {
  let count = 0
  for (const we of workout.exercises) {
    const maxThisWorkout = Math.max(...we.sets.map((s) => s.weight), 0)
    if (maxThisWorkout === 0) continue
    const prevMax = allWorkouts
      .filter((w) => w.id !== workout.id && w.date <= workout.date)
      .flatMap((w) => w.exercises.filter((e) => e.exerciseId === we.exerciseId))
      .flatMap((e) => e.sets)
      .reduce((m, s) => Math.max(m, s.weight), 0)
    if (maxThisWorkout > prevMax) count++
  }
  return count
}

function getBestSet(sets: GymWorkout['exercises'][0]['sets']): string {
  if (sets.length === 0) return '—'
  const best = sets.reduce((b, s) => (s.weight * s.reps > b.weight * b.reps ? s : b))
  if (best.weight === 0) return `${best.reps} Wdh.`
  return `${best.weight} kg × ${best.reps}`
}

function formatCardDate(dateStr: string): string {
  const d = fromISODate(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function WorkoutCard({ workout, allWorkouts }: Props) {
  const navigate = useNavigate()
  const { gymExercises } = useGym()
  const volume = calcVolume(workout)
  const prs = calcPRs(workout, allWorkouts)

  const durationLabel = workout.duration != null
    ? workout.duration >= 60
      ? `${Math.floor(workout.duration / 60)}h ${workout.duration % 60}min`
      : `${workout.duration}min`
    : null

  return (
    <button
      onClick={() => navigate(`/gym/workout/${workout.id}`)}
      className="w-full text-left bg-surface border border-border rounded-2xl p-4 space-y-3 hover:border-accent/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-primary text-sm">{workout.title || 'Gym Training'}</p>
          <p className="text-xs text-muted mt-0.5">{formatCardDate(workout.date)}</p>
        </div>
        <span className="text-muted text-lg leading-none shrink-0">•••</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted">
        {durationLabel && (
          <span className="flex items-center gap-1">⏱ {durationLabel}</span>
        )}
        <span className="flex items-center gap-1">👤 {volume} kg</span>
        <span className="flex items-center gap-1">🏆 {prs} PRs</span>
      </div>

      {workout.exercises.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs border-t border-border pt-2">
          <span className="font-semibold text-muted">Übung</span>
          <span className="font-semibold text-muted">Bestes Set</span>
          {workout.exercises.slice(0, 4).map((we) => {
            const ex = gymExercises.find((e) => e.id === we.exerciseId)
            const name = `${we.sets.length} × ${ex?.name ?? 'Unbekannt'}`
            return (
              <>
                <span key={`${we.exerciseId}-n`} className="text-primary truncate">{name}</span>
                <span key={`${we.exerciseId}-b`} className="text-primary">{getBestSet(we.sets)}</span>
              </>
            )
          })}
          {workout.exercises.length > 4 && (
            <span className="text-muted col-span-2">+{workout.exercises.length - 4} weitere</span>
          )}
        </div>
      )}
    </button>
  )
}
