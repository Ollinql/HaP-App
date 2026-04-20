import { useState } from 'react'
import { useGym } from '../../store/GymContext'
import type { GymWorkoutExercise, GymSet } from '../../types/gym'

interface Props {
  workoutExercise: GymWorkoutExercise
  index: number
  onChange: (updated: GymWorkoutExercise) => void
  onRemove: () => void
  personalRecord?: number
}

export function WorkoutExerciseRow({ workoutExercise, index, onChange, onRemove, personalRecord }: Props) {
  const { gymExercises } = useGym()
  const exercise = gymExercises.find((e) => e.id === workoutExercise.exerciseId)
  const isBodyweight = exercise?.unit === 'bodyweight'
  const [imageExpanded, setImageExpanded] = useState(false)

  const updateSet = (setIndex: number, field: keyof GymSet, value: number) => {
    const sets = workoutExercise.sets.map((s, i) =>
      i === setIndex ? { ...s, [field]: value } : s,
    )
    onChange({ ...workoutExercise, sets })
  }

  const addSet = () => {
    const last = workoutExercise.sets[workoutExercise.sets.length - 1]
    const newSet: GymSet = last ? { ...last } : { reps: 10, weight: 0 }
    onChange({ ...workoutExercise, sets: [...workoutExercise.sets, newSet] })
  }

  const removeSet = (setIndex: number) => {
    onChange({ ...workoutExercise, sets: workoutExercise.sets.filter((_, i) => i !== setIndex) })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted text-sm cursor-grab select-none">⠿</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary">{exercise?.name ?? 'Unbekannte Übung'}</p>
          {exercise && (
            <p className="text-xs text-muted">
              {exercise.muscleGroup} · {exercise.unit}
              {personalRecord != null && personalRecord > 0 && !isBodyweight && (
                <span className="ml-2 text-amber-400/70 font-mono">PR {personalRecord} {exercise.unit}</span>
              )}
            </p>
          )}
        </div>
        {exercise?.imageBase64 && (
          <button
            onClick={() => setImageExpanded((e) => !e)}
            className="text-xs text-muted hover:text-primary transition-colors"
            aria-label="Bild anzeigen"
          >
            {imageExpanded ? '▲' : '▼'}
          </button>
        )}
        <span className="text-xs text-muted">#{index + 1}</span>
        <button onClick={onRemove} className="text-muted hover:text-red-400 transition-colors text-lg leading-none">×</button>
      </div>

      {imageExpanded && exercise?.imageBase64 && (
        <img
          src={exercise.imageBase64}
          alt={exercise.name}
          className="w-full max-h-48 object-contain rounded-lg"
        />
      )}

      {workoutExercise.sets.length > 0 && (
        <div className="space-y-1">
          <div className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-1.5 px-1 text-xs text-muted">
            <span>#</span>
            <span>Wdh.</span>
            {!isBodyweight && <span>Gewicht</span>}
            <span />
          </div>
          {workoutExercise.sets.map((set, si) => (
            <div key={si} className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-1.5 items-center">
              <span className="text-xs text-muted text-center">{si + 1}</span>
              <input
                type="number"
                min={0}
                value={set.reps}
                onChange={(e) => updateSet(si, 'reps', Number(e.target.value))}
                className="bg-input border border-border rounded px-2 py-1 text-sm text-primary text-center outline-none focus:border-accent"
              />
              {!isBodyweight ? (
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={set.weight}
                  onChange={(e) => updateSet(si, 'weight', Number(e.target.value))}
                  className="bg-input border border-border rounded px-2 py-1 text-sm text-primary text-center outline-none focus:border-accent"
                />
              ) : (
                <span />
              )}
              <button
                onClick={() => removeSet(si)}
                className="text-muted hover:text-red-400 transition-colors text-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addSet}
        className="text-xs text-accent hover:text-accent/80 transition-colors"
      >
        + Satz
      </button>

      <input
        type="text"
        placeholder="Notizen zu dieser Übung…"
        value={workoutExercise.notes ?? ''}
        onChange={(e) => onChange({ ...workoutExercise, notes: e.target.value })}
        className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-primary outline-none focus:border-accent"
      />
    </div>
  )
}
