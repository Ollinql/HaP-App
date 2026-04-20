import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useGym } from '../store/GymContext'
import { generateId } from '../utils/idUtils'
import { toISODate } from '../utils/dateUtils'
import type { GymWorkout, GymWorkoutExercise } from '../types/gym'
import { WorkoutTimer } from '../components/gym/WorkoutTimer'
import { WorkoutExerciseRow } from '../components/gym/WorkoutExerciseRow'
import { GymExerciseSelector } from '../components/gym/GymExerciseSelector'

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

function avgReps(sets: { reps: number; weight: number }[]): number {
  if (sets.length === 0) return 10
  return Math.round(sets.reduce((s, set) => s + set.reps, 0) / sets.length)
}

export function GymWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    gymWorkouts,
    gymTemplates,
    addGymWorkout,
    updateGymWorkout,
    deleteGymWorkout,
    addGymTemplate,
    updateGymTemplate,
  } = useGym()

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
      }))
    }
    return base
  })

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [postSaveOpen, setPostSaveOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [dragFrom, setDragFrom] = useState<number | null>(null)

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
        { exerciseId, sets: [{ reps: 10, weight: 0 }], order: prev.exercises.length, notes: '' },
      ],
    }))
  }

  const getExercisePR = (exerciseId: string): number => {
    let max = 0
    for (const w of gymWorkouts) {
      if (w.id === workout.id) continue
      const ex = w.exercises.find((e) => e.exerciseId === exerciseId)
      if (ex) max = Math.max(max, ...ex.sets.map((s) => s.weight))
    }
    return max
  }

  const handleAutoSave = (startedAt: string) => {
    if (gymWorkouts.some((w) => w.id === workout.id)) return
    addGymWorkout({ ...workout, startedAt })
  }

  // Navigate to the permanent URL once the workout has been saved to the store
  useEffect(() => {
    if (isNew && workout.startedAt && gymWorkouts.some((w) => w.id === workout.id)) {
      navigate(`/gym/workout/${workout.id}`, { replace: true })
    }
  }, [gymWorkouts, isNew, navigate, workout.id, workout.startedAt])

  const handleSave = () => {
    if (isNew) {
      addGymWorkout(workout)
    } else {
      updateGymWorkout(workout)
    }
    setPostSaveOpen(true)
  }

  const handleUpdateTemplate = () => {
    const tmpl = gymTemplates.find((t) => t.id === workout.templateId)
    if (tmpl) {
      updateGymTemplate({
        ...tmpl,
        exercises: workout.exercises.map((we, i) => ({
          exerciseId: we.exerciseId,
          targetSets: we.sets.length,
          targetReps: avgReps(we.sets),
          order: i,
        })),
      })
    }
    navigate('/gym')
  }

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) return
    addGymTemplate({
      id: generateId(),
      title: templateName.trim(),
      exercises: workout.exercises.map((we, i) => ({
        exerciseId: we.exerciseId,
        targetSets: we.sets.length,
        targetReps: avgReps(we.sets),
        order: i,
      })),
      notes: workout.notes,
      createdAt: new Date().toISOString(),
    })
    navigate('/gym')
  }

  const handleDelete = () => {
    if (!isNew) deleteGymWorkout(workout.id)
    navigate('/gym')
  }

  const handleExport = () => {
    const json = JSON.stringify(workout, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gym-${workout.date}-${workout.id.slice(0, 6)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const linkedTemplate = workout.templateId
    ? gymTemplates.find((t) => t.id === workout.templateId)
    : undefined

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/gym')} className="text-muted hover:text-primary text-lg" aria-label="Zurück">
          ←
        </button>
        <h1 className="text-lg font-bold text-primary flex-1">
          {isNew ? 'Neues Workout' : 'Workout bearbeiten'}
        </h1>
        {!isNew && (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-muted hover:text-red-400 transition-colors"
            aria-label="Löschen"
          >
            🗑
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Datum</label>
          <input
            type="date"
            value={workout.date}
            onChange={(e) => setWorkout((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Titel (optional)</label>
          <input
            type="text"
            value={workout.title}
            onChange={(e) => setWorkout((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="z.B. Push Day"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Timer */}
      <WorkoutTimer
        workout={workout}
        onUpdate={(updated) => setWorkout(updated)}
        onBeforeStart={isNew ? handleAutoSave : undefined}
        autoStart={autoStart && isNew}
      />

      {/* Exercises */}
      <div className="space-y-2">
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
            className={dragFrom === i ? 'opacity-40' : ''}
          >
            <WorkoutExerciseRow
              workoutExercise={ex}
              index={i}
              onChange={(updated) => updateExercise(i, updated)}
              onRemove={() => removeExercise(i)}
              personalRecord={getExercisePR(ex.exerciseId)}
            />
          </div>
        ))}
        <button
          onClick={() => setSelectorOpen(true)}
          className="w-full py-2.5 text-sm text-accent border border-accent/30 border-dashed rounded-xl hover:bg-accent/10 transition-colors"
        >
          + Übung hinzufügen
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-muted mb-1">Notizen</label>
        <textarea
          value={workout.notes}
          onChange={(e) => setWorkout((prev) => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="Anmerkungen zum Training…"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pb-6">
        <button
          onClick={handleExport}
          className="px-3 py-2 text-sm text-muted border border-border rounded-lg hover:bg-elevated transition-colors"
        >
          Exportieren
        </button>
        <div className="flex-1" />
        <button
          onClick={() => navigate('/gym')}
          className="px-4 py-2 text-sm text-muted border border-border rounded-lg hover:bg-elevated transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          Speichern
        </button>
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

      {/* Post-Save Modal */}
      {postSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <h3 className="text-base font-semibold text-primary">Workout gespeichert</h3>
            </div>

            {/* Template aktualisieren */}
            {linkedTemplate && (
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-sm font-medium text-primary">Template aktualisieren?</p>
                <p className="text-xs text-muted">
                  „{linkedTemplate.title}" mit den Werten aus diesem Workout übernehmen (alle Übungen werden ersetzt).
                </p>
                <button
                  onClick={handleUpdateTemplate}
                  className="w-full py-2 text-sm text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  Template aktualisieren
                </button>
              </div>
            )}

            {/* Als neues Template speichern */}
            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-medium text-primary">Als neues Template speichern?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveAsTemplate()}
                  placeholder="Template-Name…"
                  className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                />
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                  className="px-3 py-2 text-sm text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Erstellen
                </button>
              </div>
            </div>

            {/* Fertig */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => navigate('/gym')}
                className="w-full py-2 text-sm text-muted border border-border rounded-lg hover:bg-elevated transition-colors"
              >
                Fertig
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
