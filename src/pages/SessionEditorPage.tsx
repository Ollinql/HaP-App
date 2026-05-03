import { useState, useMemo, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import type { TrainingSession, Exercise, SectionKey, SessionExerciseRef } from '../types'
import { generateId } from '../utils/idUtils'
import { toISODate, isDatePast, formatDateLong } from '../utils/dateUtils'
import { Button } from '../components/ui/Button'
import { IntensityPicker } from '../components/ui/IntensityPicker'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { SessionMetaForm } from '../components/session/SessionMetaForm'
import { SectionsList } from '../components/session/SectionsList'
import { ExercisePicker } from '../components/session/ExercisePicker'
import { useAutoSave } from '../hooks/useAutoSave'

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

function resolveSessionSections(
  sections: Record<SectionKey, SessionExerciseRef[]>,
  exerciseMap: Map<string, Exercise>,
): Record<SectionKey, Exercise[]> {
  const resolve = (refs: SessionExerciseRef[]): Exercise[] =>
    refs.flatMap((ref) => {
      const ex = exerciseMap.get(ref.exerciseId)
      return ex ? [{ ...ex, section: ref.section }] : []
    })
  return {
    warmup: resolve(sections.warmup),
    main: resolve(sections.main),
    closing: resolve(sections.closing),
  }
}

function buildSessionToSave(
  session: TrainingSession,
  localSections: Record<SectionKey, Exercise[]>,
): TrainingSession {
  const toRefs = (section: SectionKey): SessionExerciseRef[] =>
    localSections[section].map((ex) => ({ exerciseId: ex.id, section }))
  return {
    ...session,
    sections: {
      warmup: toRefs('warmup'),
      main: toRefs('main'),
      closing: toRefs('closing'),
    },
  }
}

export function SessionEditorPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    sessions,
    exercises,
    settings,
    seasons,
    addSession,
    updateSession,
    deleteSession,
    addExercise,
    updateExercise,
  } = useApp()

  const isNew = id === undefined
  const dateParam = searchParams.get('date') ?? toISODate(new Date())
  const existing = id ? sessions.find((s) => s.id === id) : undefined

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const [session, setSession] = useState<TrainingSession>(() => {
    if (existing) return { ...existing }
    const d = new Date(dateParam + 'T00:00:00')
    const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    const dayKey = keys[d.getDay()]
    const duration = settings.trainingDays[dayKey]?.duration ?? 90
    return createBlankSession(dateParam, duration)
  })

  const [localSections, setLocalSections] = useState<Record<SectionKey, Exercise[]>>(() => {
    if (existing) return resolveSessionSections(existing.sections, exerciseMap)
    return { warmup: [], main: [], closing: [] }
  })

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pickerState, setPickerState] = useState<{ open: boolean; section: SectionKey }>({
    open: false,
    section: 'main',
  })

  const isPast = isDatePast(session.date)
  const allPhases = seasons.flatMap((s) => s.phases)

  // Auto-save payload (only for existing sessions)
  const autoSavePayload = useMemo(
    () => ({ session, localSections }),
    [session, localSections],
  )

  const performAutoSave = useCallback(
    ({ session, localSections }: typeof autoSavePayload) => {
      updateSession(buildSessionToSave(session, localSections))
    },
    [updateSession],
  )

  const saveStatus = useAutoSave(autoSavePayload, performAutoSave, {
    delay: 1200,
    enabled: !isNew,
  })

  const updateField = useCallback(<K extends keyof TrainingSession>(key: K, value: TrainingSession[K]) => {
    setSession((prev) => ({ ...prev, [key]: value }))
    setSaveError(null)
  }, [])

  const updateSectionExercise = useCallback(
    (section: SectionKey, index: number, exercise: Exercise) => {
      setLocalSections((prev) => ({
        ...prev,
        [section]: prev[section].map((e, i) => (i === index ? exercise : e)),
      }))
      updateExercise(exercise)
    },
    [updateExercise],
  )

  const removeSectionExercise = useCallback((section: SectionKey, index: number) => {
    setLocalSections((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }))
  }, [])

  const addBlankExercise = useCallback(
    (section: SectionKey) => {
      const ex: Exercise = {
        id: generateId(),
        title: '',
        tags: [],
        drawingData: '',
        section,
        createdAt: new Date().toISOString(),
      }
      setLocalSections((prev) => ({ ...prev, [section]: [...prev[section], ex] }))
      addExercise(ex)
    },
    [addExercise],
  )

  const openPicker = useCallback((section: SectionKey) => {
    setPickerState({ open: true, section })
  }, [])

  const pickExercise = useCallback(
    (exercise: Exercise) => {
      const section = pickerState.section
      setLocalSections((prev) => ({
        ...prev,
        [section]: [...prev[section], { ...exercise, section }],
      }))
    },
    [pickerState.section],
  )

  const reorderSectionExercises = useCallback((section: SectionKey, from: number, to: number) => {
    setLocalSections((prev) => {
      const arr = [...prev[section]]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { ...prev, [section]: arr }
    })
  }, [])

  const handleSave = () => {
    const allLocal = [...localSections.warmup, ...localSections.main, ...localSections.closing]
    const hasUntitled = allLocal.some((ex) => !ex.title.trim())
    if (hasUntitled) {
      setSaveError('Bitte alle Übungen benennen.')
      return
    }
    setSaveError(null)
    const built = buildSessionToSave(session, localSections)
    if (isNew) addSession(built)
    else updateSession(built)
    navigate('/')
  }

  const handleDelete = () => {
    if (!isNew && id) deleteSession(id)
    navigate('/')
  }

  const saveIndicator =
    saveStatus === 'pending'
      ? { text: 'Speichert…', color: 'text-muted' }
      : saveStatus === 'saved'
      ? { text: '✓ Gespeichert', color: 'text-green-400' }
      : null

  const INPUT_CLASS =
    'w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-primary outline-none focus:border-accent transition-colors'

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-elevated transition-colors"
          aria-label="Zurück"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">{formatDateLong(session.date)}</p>
          <h1 className="text-lg font-bold text-primary truncate">
            {isNew ? 'Neue Trainingseinheit' : 'Trainingseinheit bearbeiten'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {saveIndicator && (
            <span className={`text-xs font-medium ${saveIndicator.color} transition-all`}>
              {saveIndicator.text}
            </span>
          )}
          {!isNew && (
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              🗑
            </Button>
          )}
        </div>
      </div>

      <SessionMetaForm
        session={session}
        allPhases={allPhases}
        globalTags={settings.globalTags}
        onChange={updateField}
      />

      <SectionsList
        localSections={localSections}
        onUpdate={updateSectionExercise}
        onRemove={removeSectionExercise}
        onAddBlank={addBlankExercise}
        onPickFromArchive={openPicker}
        onReorder={reorderSectionExercises}
      />

      {/* Post-Training Feedback */}
      {isPast && (
        <div className="p-4 bg-surface border border-border rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-primary">Nachträgliches Feedback</h3>
          <IntensityPicker
            value={session.postTrainingFeedback}
            onChange={(v) => updateField('postTrainingFeedback', v)}
            label="Wie war das Training?"
          />
          <div>
            <label className="block text-xs text-muted mb-1.5">Notizen</label>
            <textarea
              value={session.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              placeholder="Beobachtungen, Anmerkungen…"
              className={INPUT_CLASS + ' resize-none'}
            />
          </div>
        </div>
      )}

      {!isPast && (
        <div>
          <label className="block text-xs text-muted mb-1.5">Notizen</label>
          <textarea
            value={session.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            placeholder="Beobachtungen, Anmerkungen…"
            className={INPUT_CLASS + ' resize-none'}
          />
        </div>
      )}

      {/* Save bar */}
      <div className="flex flex-col gap-2 pb-8">
        {saveError && <p className="text-xs text-red-400 text-right">{saveError}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>Fertig</Button>
        </div>
      </div>

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
