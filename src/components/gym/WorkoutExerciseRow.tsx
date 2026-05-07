import { useState } from 'react'
import { useGym } from '../../store/GymContext'
import type { GymWorkoutExercise, GymSet, GymWorkout } from '../../types/gym'
import { RestTimer } from './RestTimer'

interface Props {
  workoutExercise: GymWorkoutExercise
  index: number
  onChange: (updated: GymWorkoutExercise) => void
  onRemove: () => void
  allWorkouts: GymWorkout[]
  currentWorkoutId: string
}

function getSetReference(
  workouts: GymWorkout[],
  currentWorkoutId: string,
  exerciseId: string,
  setIndex: number,
): string {
  const relevant = workouts
    .filter((w) => w.id !== currentWorkoutId && w.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  let best: GymSet | null = null
  for (const w of relevant) {
    const ex = w.exercises.find((e) => e.exerciseId === exerciseId)
    const s = ex?.sets[setIndex]
    if (!s) continue
    if (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
      best = s
    }
  }
  if (!best || best.weight === 0) return ''
  return `${best.weight} kg × ${best.reps}`
}

export function WorkoutExerciseRow({
  workoutExercise,
  index,
  onChange,
  onRemove,
  allWorkouts,
  currentWorkoutId,
}: Props) {
  const { gymExercises } = useGym()
  const exercise = gymExercises.find((e) => e.id === workoutExercise.exerciseId)
  const isBodyweight = exercise?.unit === 'bodyweight'
  const restSeconds = workoutExercise.restSeconds ?? 120

  const [activeRestIndex, setActiveRestIndex] = useState<number | null>(null)

  const updateSet = (si: number, field: keyof GymSet, value: number | boolean) => {
    const sets = workoutExercise.sets.map((s, i) =>
      i === si ? { ...s, [field]: value } : s,
    )
    onChange({ ...workoutExercise, sets })
  }

  const completeSet = (si: number) => {
    updateSet(si, 'completed', true)
    setActiveRestIndex(si)
  }

  const uncompleteSet = (si: number) => {
    updateSet(si, 'completed', false)
    if (activeRestIndex === si) setActiveRestIndex(null)
  }

  const addSet = () => {
    const last = workoutExercise.sets[workoutExercise.sets.length - 1]
    const newSet: GymSet = last ? { reps: last.reps, weight: last.weight } : { reps: 10, weight: 0 }
    onChange({ ...workoutExercise, sets: [...workoutExercise.sets, newSet] })
  }

  const removeSet = (si: number) => {
    onChange({ ...workoutExercise, sets: workoutExercise.sets.filter((_, i) => i !== si) })
    if (activeRestIndex === si) setActiveRestIndex(null)
  }

  const restLabel = restSeconds >= 60
    ? `${Math.floor(restSeconds / 60)}:${String(restSeconds % 60).padStart(2, '0')}`
    : `0:${String(restSeconds).padStart(2, '0')}`

  return (
    <div className="space-y-1">
      {/* Exercise header */}
      <div className="flex items-center gap-2 px-1">
        <button className="flex-1 text-left">
          <span className="text-sm font-semibold text-accent">
            {exercise?.name ?? 'Unbekannte Übung'}
          </span>
        </button>
        <button className="text-muted hover:text-primary transition-colors p-1" aria-label="Verlauf">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <span className="text-xs text-muted">#{index + 1}</span>
        <button
          onClick={onRemove}
          className="text-muted hover:text-red-400 transition-colors text-lg leading-none p-1"
        >
          ×
        </button>
      </div>

      {/* Column headers */}
      {workoutExercise.sets.length > 0 && (
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_2rem_1.5rem] gap-1.5 px-1 text-xs text-muted font-medium">
          <span className="text-center">Set</span>
          <span className="text-center">Vorige</span>
          <span className="text-center">{exercise?.unit ?? 'kg'}</span>
          <span className="text-center">Wdh.</span>
          <span className="text-center">✓</span>
          <span />
        </div>
      )}

      {/* Set rows */}
      {workoutExercise.sets.map((set, si) => (
        <div key={si}>
          <div
            className={[
              'grid grid-cols-[2rem_1fr_1fr_1fr_2rem_1.5rem] gap-1.5 items-center px-1 py-0.5 rounded-lg transition-colors',
              set.completed ? 'bg-accent/8' : '',
            ].join(' ')}
          >
            <span
              className={[
                'text-xs font-semibold text-center w-7 h-7 flex items-center justify-center rounded-md mx-auto',
                set.completed ? 'bg-accent/20 text-accent' : 'bg-elevated text-muted',
              ].join(' ')}
            >
              {si + 1}
            </span>

            <span className="text-xs text-muted text-center truncate">
              {getSetReference(allWorkouts, currentWorkoutId, workoutExercise.exerciseId, si)}
            </span>

            {!isBodyweight ? (
              <input
                type="number"
                min={0}
                step={0.5}
                value={set.weight}
                onChange={(e) => updateSet(si, 'weight', Number(e.target.value))}
                className={[
                  'bg-input border border-border rounded-lg px-1 py-1.5 text-sm text-primary text-center outline-none focus:border-accent w-full',
                  set.completed ? 'opacity-70' : '',
                ].join(' ')}
              />
            ) : (
              <span className="text-xs text-muted text-center">KG</span>
            )}

            <input
              type="number"
              min={0}
              value={set.reps}
              onChange={(e) => updateSet(si, 'reps', Number(e.target.value))}
              className={[
                'bg-input border border-border rounded-lg px-1 py-1.5 text-sm text-primary text-center outline-none focus:border-accent w-full',
                set.completed ? 'opacity-70' : '',
              ].join(' ')}
            />

            <button
              onClick={() => set.completed ? uncompleteSet(si) : completeSet(si)}
              className={[
                'w-7 h-7 flex items-center justify-center rounded-md border transition-colors mx-auto',
                set.completed
                  ? 'bg-accent border-accent text-white'
                  : 'border-border text-muted hover:border-accent hover:text-accent',
              ].join(' ')}
              aria-label={set.completed ? 'Satz rückgängig' : 'Satz abschließen'}
            >
              ✓
            </button>

            <button
              onClick={() => removeSet(si)}
              className="text-muted hover:text-red-400 transition-colors text-sm text-center"
              aria-label="Satz löschen"
            >
              ×
            </button>
          </div>

          {/* Rest timer between sets */}
          {activeRestIndex === si && (
            <RestTimer
              seconds={restSeconds}
              onDone={() => setActiveRestIndex(null)}
              onSkip={() => setActiveRestIndex(null)}
            />
          )}
        </div>
      ))}

      {/* Add set */}
      <div className="px-1">
        <button
          onClick={addSet}
          className="w-full py-2 text-xs text-muted hover:text-primary bg-elevated hover:bg-elevated/80 border border-border rounded-lg transition-colors"
        >
          + Set ({restLabel})
        </button>
      </div>

      {/* Notes */}
      <div className="px-1">
        <input
          type="text"
          placeholder="Notizen zu dieser Übung…"
          value={workoutExercise.notes ?? ''}
          onChange={(e) => onChange({ ...workoutExercise, notes: e.target.value })}
          className="w-full bg-input border border-border rounded-lg px-2 py-1 text-xs text-primary outline-none focus:border-accent"
        />
      </div>
    </div>
  )
}
