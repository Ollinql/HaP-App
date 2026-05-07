import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGym } from '../store/GymContext'
import { generateId } from '../utils/idUtils'
import type { GymTemplate, GymTemplateExercise } from '../types/gym'
import { GymExerciseSelector } from '../components/gym/GymExerciseSelector'

function createBlankTemplate(): GymTemplate {
  return {
    id: generateId(),
    title: '',
    exercises: [],
    notes: '',
    createdAt: new Date().toISOString(),
  }
}

export function GymTemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { gymTemplates, gymExercises, addGymTemplate, updateGymTemplate } = useGym()

  const isNew = id === undefined
  const existing = id ? gymTemplates.find((t) => t.id === id) : undefined

  const [template, setTemplate] = useState<GymTemplate>(() =>
    existing ? { ...existing } : createBlankTemplate(),
  )
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)

  const updateExercise = (index: number, updated: GymTemplateExercise) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.map((e, i) => (i === index ? updated : e)),
    }))
  }

  const removeExercise = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }))
  }

  const reorder = (from: number, to: number) => {
    setTemplate((prev) => {
      const arr = [...prev.exercises]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...prev, exercises: arr.map((e, i) => ({ ...e, order: i })) }
    })
  }

  const addExercise = (exerciseId: string) => {
    setTemplate((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { exerciseId, targetSets: 3, targetReps: 10, order: prev.exercises.length, restSeconds: 120 },
      ],
    }))
  }

  const handleSave = () => {
    if (isNew) addGymTemplate(template)
    else updateGymTemplate(template)
    navigate('/gym/templates')
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/gym/templates')} className="text-muted hover:text-primary text-lg" aria-label="Zurück">
          ←
        </button>
        <h1 className="text-lg font-bold text-primary flex-1">
          {isNew ? 'Neues Template' : 'Template bearbeiten'}
        </h1>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Titel</label>
        <input
          type="text"
          value={template.title}
          onChange={(e) => setTemplate((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="z.B. Push Day"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted font-medium uppercase tracking-wide">Übungen</p>
        {template.exercises.map((te, i) => {
          const ex = gymExercises.find((e) => e.id === te.exerciseId)
          return (
            <div
              key={`${te.exerciseId}-${i}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null && dragFrom !== i) reorder(dragFrom, i)
                setDragFrom(null)
              }}
              onDragEnd={() => setDragFrom(null)}
              className={`bg-surface border border-border rounded-xl p-3 space-y-2 ${dragFrom === i ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-muted cursor-grab select-none">⠿</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{ex?.name ?? 'Unbekannte Übung'}</p>
                  {ex && <p className="text-xs text-muted">{ex.muscleGroup}</p>}
                </div>
                <button onClick={() => removeExercise(i)} className="text-muted hover:text-red-400 text-lg leading-none">×</button>
              </div>
              <div className="flex gap-3 items-center flex-wrap">
                <label className="text-xs text-muted">Sätze</label>
                <input
                  type="number"
                  min={1}
                  value={te.targetSets}
                  onChange={(e) => updateExercise(i, { ...te, targetSets: Number(e.target.value) })}
                  className="w-16 bg-input border border-border rounded px-2 py-1 text-sm text-primary text-center outline-none focus:border-accent"
                />
                <label className="text-xs text-muted">Wdh.</label>
                <input
                  type="number"
                  min={1}
                  value={te.targetReps}
                  onChange={(e) => updateExercise(i, { ...te, targetReps: Number(e.target.value) })}
                  className="w-16 bg-input border border-border rounded px-2 py-1 text-sm text-primary text-center outline-none focus:border-accent"
                />
                <label className="text-xs text-muted">Pause (s)</label>
                <input
                  type="number"
                  min={0}
                  step={15}
                  value={te.restSeconds ?? 120}
                  onChange={(e) => updateExercise(i, { ...te, restSeconds: Number(e.target.value) })}
                  className="w-16 bg-input border border-border rounded px-2 py-1 text-sm text-primary text-center outline-none focus:border-accent"
                />
              </div>
            </div>
          )
        })}
        <button
          onClick={() => setSelectorOpen(true)}
          className="w-full py-2.5 text-sm text-accent border border-accent/30 border-dashed rounded-xl hover:bg-accent/10 transition-colors"
        >
          + Übung hinzufügen
        </button>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Notizen</label>
        <textarea
          value={template.notes}
          onChange={(e) => setTemplate((prev) => ({ ...prev, notes: e.target.value }))}
          rows={3}
          placeholder="Anmerkungen zum Template…"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end pb-6">
        <button
          onClick={() => navigate('/gym/templates')}
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

      <GymExerciseSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={addExercise}
      />
    </div>
  )
}
