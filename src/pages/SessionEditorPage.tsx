import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import type { TrainingSession, Exercise, SectionKey } from '../types'
import { generateId } from '../utils/idUtils'
import { toISODate, isDatePast, formatDateLong } from '../utils/dateUtils'
import { Button } from '../components/ui/Button'
import { TagInput } from '../components/ui/TagInput'
import { IntensityPicker } from '../components/ui/IntensityPicker'
import { CollapsibleSection } from '../components/ui/CollapsibleSection'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ExerciseCard } from '../components/session/ExerciseCard'
import { ExercisePicker } from '../components/session/ExercisePicker'

const SECTION_LABELS: Record<SectionKey, string> = {
  warmup: 'Aufwärmen',
  main: 'Hauptteil',
  closing: 'Abschluss',
}

const SECTIONS: SectionKey[] = ['warmup', 'main', 'closing']

function createBlankSession(date: string, duration: number): TrainingSession {
  return {
    id: generateId(),
    title: '',
    date,
    duration,
    tags: [],
    phaseId: null,
    sections: { warmup: [], main: [], closing: [] },
    intensityRating: null,
    postTrainingFeedback: null,
    notes: '',
  }
}

export function SessionEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { sessions, settings, seasons, addSession, updateSession, deleteSession, addExercise } = useApp()

  const isNew = id === undefined
  const dateParam = searchParams.get('date') ?? toISODate(new Date())

  const existing = id ? sessions.find((s) => s.id === id) : undefined

  const [session, setSession] = useState<TrainingSession>(() => {
    if (existing) return { ...existing }
    const dayKey = (() => {
      const d = new Date(dateParam + 'T00:00:00')
      const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
      return keys[d.getDay()]
    })()
    const duration = settings.trainingDays[dayKey]?.duration ?? 90
    return createBlankSession(dateParam, duration)
  })

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pickerState, setPickerState] = useState<{ open: boolean; section: SectionKey }>({
    open: false,
    section: 'main',
  })

  const isPast = isDatePast(session.date)

  // All phases from all seasons for the dropdown
  const allPhases = seasons.flatMap((s) => s.phases)

  const updateField = <K extends keyof TrainingSession>(key: K, value: TrainingSession[K]) => {
    setSession((prev) => ({ ...prev, [key]: value }))
  }

  const updateSectionExercise = (section: SectionKey, index: number, exercise: Exercise) => {
    setSession((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section].map((e, i) => (i === index ? exercise : e)),
      },
    }))
  }

  const removeSectionExercise = (section: SectionKey, index: number) => {
    setSession((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section].filter((_, i) => i !== index),
      },
    }))
  }

  const addBlankExercise = (section: SectionKey) => {
    const ex: Exercise = {
      id: generateId(),
      title: '',
      tags: [],
      drawingData: '',
      section,
      createdAt: new Date().toISOString(),
    }
    setSession((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: [...prev.sections[section], ex],
      },
    }))
  }

  const pickExercise = (exercise: Exercise) => {
    const section = pickerState.section
    setSession((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: [...prev.sections[section], { ...exercise, section }],
      },
    }))
  }

  const handleSave = () => {
    // Also persist each exercise to the archive if it has a title
    session.sections.warmup.concat(session.sections.main, session.sections.closing).forEach((ex) => {
      if (ex.title) {
        addExercise(ex)
      }
    })

    if (isNew) {
      addSession(session)
    } else {
      updateSession(session)
    }
    navigate('/')
  }

  const handleDelete = () => {
    if (!isNew && id) deleteSession(id)
    navigate('/')
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted hover:text-primary text-lg"
          aria-label="Zurück"
        >
          ←
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted">{formatDateLong(session.date)}</p>
          <h1 className="text-lg font-bold text-primary">
            {isNew ? 'Neue Trainingseinheit' : 'Trainingseinheit bearbeiten'}
          </h1>
        </div>
        {!isNew && (
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
            🗑
          </Button>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-muted mb-1">Titel</label>
        <input
          type="text"
          value={session.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Trainingsziel: …"
          className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
        />
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Datum</label>
          <input
            type="date"
            value={session.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Dauer (Min.)</label>
          <input
            type="number"
            value={session.duration}
            onChange={(e) => updateField('duration', Number(e.target.value))}
            min={15}
            step={15}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Phase */}
      <div>
        <label className="block text-xs text-muted mb-1">Phase</label>
        <select
          value={session.phaseId ?? ''}
          onChange={(e) => updateField('phaseId', e.target.value || null)}
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        >
          <option value="">Keine Phase</option>
          {allPhases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type} – {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-muted mb-1">Tags</label>
        <TagInput
          tags={session.tags}
          onChange={(tags) => updateField('tags', tags)}
          suggestions={settings.globalTags}
        />
      </div>

      {/* Intensity */}
      <IntensityPicker
        value={session.intensityRating}
        onChange={(v) => updateField('intensityRating', v)}
        label="Intensität (geplant)"
      />

      {/* Sections */}
      {SECTIONS.map((section) => (
        <CollapsibleSection
          key={section}
          title={SECTION_LABELS[section]}
          badge={session.sections[section].length}
          defaultOpen={section === 'main'}
        >
          <div className="space-y-2">
            {session.sections[section].map((exercise, i) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdate={(ex) => updateSectionExercise(section, i, ex)}
                onRemove={() => removeSectionExercise(section, i)}
              />
            ))}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => addBlankExercise(section)}
              >
                + Neue Übung
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPickerState({ open: true, section })}
              >
                Aus Archiv
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      ))}

      {/* Post-Training Feedback (only shown for past sessions) */}
      {isPast && (
        <div className="p-4 bg-surface border border-border rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-primary">Nachträgliches Feedback</h3>
          <IntensityPicker
            value={session.postTrainingFeedback}
            onChange={(v) => updateField('postTrainingFeedback', v)}
            label="Wie war das Training?"
          />
          <div>
            <label className="block text-xs text-muted mb-1">Notizen</label>
            <textarea
              value={session.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              placeholder="Beobachtungen, Anmerkungen…"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none"
            />
          </div>
        </div>
      )}

      {/* Notes (always visible) */}
      {!isPast && (
        <div>
          <label className="block text-xs text-muted mb-1">Notizen</label>
          <textarea
            value={session.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            placeholder="Beobachtungen, Anmerkungen…"
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none"
          />
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="secondary" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button onClick={handleSave}>Speichern</Button>
      </div>

      {/* Exercise picker */}
      <ExercisePicker
        open={pickerState.open}
        onClose={() => setPickerState({ ...pickerState, open: false })}
        section={pickerState.section}
        onPick={pickExercise}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Trainingseinheit löschen"
        message="Diese Trainingseinheit wirklich löschen?"
      />
    </div>
  )
}
