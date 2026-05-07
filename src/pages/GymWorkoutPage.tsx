import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useGym } from '../store/GymContext'
import { generateId } from '../utils/idUtils'
import { toISODate, fromISODate } from '../utils/dateUtils'
import type { GymWorkout, GymWorkoutExercise } from '../types/gym'
import { WorkoutExerciseRow } from '../components/gym/WorkoutExerciseRow'
import { GymExerciseSelector } from '../components/gym/GymExerciseSelector'
import { WorkoutSummaryOverlay } from '../components/gym/WorkoutSummaryOverlay'

function createBlankWorkout(date: string): GymWorkout {
  return {
    id: generateId(),
    title: '',
    date,
    exercises: [],
    notes: '',
    duration: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  }
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function formatWorkoutDate(dateStr: string): string {
  const d = fromISODate(dateStr)
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export function GymWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { gymWorkouts, gymTemplates, addGymWorkout, updateGymWorkout, deleteGymWorkout } = useGym()

  const isNew = id === undefined
  const existing = id ? gymWorkouts.find((w) => w.id === id) : undefined
  const templateId = searchParams.get('templateId')
  const template = templateId ? gymTemplates.find((t) => t.id === templateId) : undefined
  const autoStart = searchParams.get('autostart') === 'true'

  const [workout, setWorkout] = useState<GymWorkout>(() => {
    if (existing) return { ...existing }
    const base = createBlankWorkout(toISODate(new Date()))
    if (template) {
      base.title = template.title
      base.templateId = templateId ?? undefined
      base.exercises = template.exercises.map((te, i) => ({
        exerciseId: te.exerciseId,
        sets: Array.from({ length: te.targetSets }, () => ({ reps: te.targetReps, weight: 0 })),
        order: i,
        notes: '',
        restSeconds: te.restSeconds ?? 120,
      }))
    }
    return base
  })

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [summaryVisible, setSummaryVisible] = useState(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [editingTitle, setEditingTitle] = useState(false)

  // Auto-start timer
  useEffect(() => {
    if (autoStart && isNew && !workout.startedAt) {
      const startedAt = new Date().toISOString()
      setWorkout((prev) => ({ ...prev, startedAt }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tick timer
  useEffect(() => {
    if (!workout.startedAt || workout.completedAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [workout.startedAt, workout.completedAt])

  // Navigate to permanent URL once saved
  useEffect(() => {
    if (isNew && workout.startedAt && gymWorkouts.some((w) => w.id === workout.id)) {
      navigate(`/gym/workout/${workout.id}`, { replace: true })
    }
  }, [gymWorkouts, isNew, navigate, workout.id, workout.startedAt])

  // Auto-save when timer starts on new workout
  const handleTimerAutoSave = (startedAt: string) => {
    if (gymWorkouts.some((w) => w.id === workout.id)) return
    addGymWorkout({ ...workout, startedAt })
  }

  const startTimer = () => {
    const startedAt = new Date().toISOString()
    const updated = { ...workout, startedAt }
    setWorkout(updated)
    if (isNew) handleTimerAutoSave(startedAt)
    else updateGymWorkout(updated)
  }

  const resetTimer = () => {
    const updated = { ...workout, startedAt: null, completedAt: null, duration: null }
    setWorkout(updated)
    if (!isNew) updateGymWorkout(updated)
  }

  const handleFinish = () => {
    const startMs = workout.startedAt ? Date.parse(workout.startedAt) : Date.now()
    const durationMin = Math.round((Date.now() - startMs) / 60000)
    const updated: GymWorkout = {
      ...workout,
      completedAt: new Date().toISOString(),
      duration: durationMin || null,
      startedAt: null,
    }
    if (isNew) {
      addGymWorkout(updated)
    } else {
      updateGymWorkout(updated)
    }
    setWorkout(updated)
    setSummaryVisible(true)
  }

  const updateExercise = (index: number, updated: GymWorkoutExercise) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e, i) => (i === index ? updated : e)),
    }))
  }

  const removeExercise = (index: number) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }))
  }

  const reorderExercise = (fromIndex: number, toIndex: number) => {
    setWorkout((prev) => {
      const arr = [...prev.exercises]
      const [moved] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, moved)
      return { ...prev, exercises: arr.map((e, i) => ({ ...e, order: i })) }
    })
  }

  const addExercise = (exerciseId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { exerciseId, sets: [{ reps: 10, weight: 0 }], order: prev.exercises.length, notes: '', restSeconds: 120 },
      ],
    }))
  }

  const handleDelete = () => {
    if (!isNew) deleteGymWorkout(workout.id)
    navigate('/gym')
  }

  const isRunning = !!workout.startedAt && !workout.completedAt
  const elapsed = isRunning && workout.startedAt ? now - Date.parse(workout.startedAt) : 0

  if (summaryVisible) {
    return (
      <WorkoutSummaryOverlay
        workout={workout}
        totalWorkoutCount={gymWorkouts.filter((w) => w.completedAt).length}
        onClose={() => navigate('/gym')}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto pb-20">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={isRunning ? resetTimer : startTimer}
          className="w-10 h-10 flex items-center justify-center bg-elevated border border-border rounded-xl text-muted hover:text-primary transition-colors"
          aria-label={isRunning ? 'Timer zurücksetzen' : 'Timer starten'}
        >
          ↺
        </button>
        <div className="flex-1" />
        <button
          onClick={() => navigate('/gym')}
          className="px-3 py-1.5 text-sm text-muted border border-border rounded-lg hover:bg-elevated transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleFinish}
          className="px-4 py-1.5 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
        >
          Beenden
        </button>
      </div>

      {/* Workout header */}
      <div className="space-y-1">
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            value={workout.title}
            onChange={(e) => setWorkout((prev) => ({ ...prev, title: e.target.value }))}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            placeholder="Workout-Titel…"
            className="text-xl font-bold text-primary bg-transparent border-b border-accent outline-none w-full"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary flex-1">
              {workout.title || 'Workout'}
            </h1>
            <button
              onClick={() => setEditingTitle(true)}
              className="text-muted hover:text-primary transition-colors"
              aria-label="Titel bearbeiten"
            >
              •••
            </button>
            {!isNew && (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-muted hover:text-red-400 transition-colors text-sm"
              >
                🗑
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <span>📅</span>
            <input
              type="date"
              value={workout.date}
              onChange={(e) => setWorkout((prev) => ({ ...prev, date: e.target.value }))}
              className="bg-transparent outline-none text-sm text-muted cursor-pointer"
            />
          </span>
          <span className="flex items-center gap-1.5">
            <span>🕐</span>
            <span className={['font-mono tabular-nums', isRunning ? 'text-accent' : ''].join(' ')}>
              {isRunning ? formatElapsed(elapsed) : (workout.duration ? `${workout.duration}min` : formatWorkoutDate(workout.date))}
            </span>
          </span>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-5">
        {workout.exercises.map((ex, i) => (
          <div
            key={`${ex.exerciseId}-${i}`}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null && dragFrom !== i) reorderExercise(dragFrom, i)
              setDragFrom(null)
            }}
            onDragEnd={() => setDragFrom(null)}
            className={[
              'bg-surface border border-border rounded-xl p-3',
              dragFrom === i ? 'opacity-40' : '',
            ].join(' ')}
          >
            <WorkoutExerciseRow
              workoutExercise={ex}
              index={i}
              onChange={(updated) => updateExercise(i, updated)}
              onRemove={() => removeExercise(i)}
              allWorkouts={gymWorkouts}
              currentWorkoutId={workout.id}
            />
          </div>
        ))}

        <button
          onClick={() => setSelectorOpen(true)}
          className="w-full py-3 text-sm text-accent border border-accent/30 border-dashed rounded-xl hover:bg-accent/10 transition-colors"
        >
          + Übung hinzufügen
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-muted mb-1">Workout-Notizen</label>
        <textarea
          value={workout.notes}
          onChange={(e) => setWorkout((prev) => ({ ...prev, notes: e.target.value }))}
          rows={2}
          placeholder="Anmerkungen zum Training…"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-base font-semibold text-primary">Workout löschen?</h3>
            <p className="text-sm text-muted">Dieser Eintrag wird dauerhaft gelöscht.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-muted border border-border rounded-lg hover:bg-elevated transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      <GymExerciseSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={addExercise}
      />
    </div>
  )
}
