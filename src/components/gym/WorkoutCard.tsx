import { useNavigate } from 'react-router-dom'
import type { GymWorkout } from '../../types/gym'
import { formatDateLong } from '../../utils/dateUtils'

interface Props {
  workout: GymWorkout
}

export function WorkoutCard({ workout }: Props) {
  const navigate = useNavigate()
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)

  return (
    <button
      onClick={() => navigate(`/gym/workout/${workout.id}`)}
      className="w-full text-left bg-surface border border-border rounded-xl p-4 hover:border-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">
            {workout.title || 'Gym Training'}
          </p>
          <p className="text-xs text-muted mt-0.5">{formatDateLong(workout.date)}</p>
        </div>
        {workout.duration !== null && (
          <span className="shrink-0 text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">
            {workout.duration} min
          </span>
        )}
      </div>
      <div className="flex gap-3 mt-2 text-xs text-muted">
        <span>{workout.exercises.length} Übung{workout.exercises.length !== 1 ? 'en' : ''}</span>
        <span>{totalSets} Sätze</span>
      </div>
    </button>
  )
}
