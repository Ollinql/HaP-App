import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../store/GymContext'
import { toISODate, getMondayOfWeek, fromISODate } from '../utils/dateUtils'
import { WorkoutCard } from '../components/gym/WorkoutCard'
import { ExerciseProgressChart } from '../components/gym/ExerciseProgressChart'
import { VolumeChart } from '../components/gym/VolumeChart'
import { GymStartModal } from '../components/gym/GymStartModal'

function getWeekStart(): string {
  return toISODate(getMondayOfWeek(new Date()))
}

function getWeekEnd(): string {
  const monday = getMondayOfWeek(new Date())
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  return toISODate(sunday)
}

function formatDate(isoDate: string): string {
  const d = fromISODate(isoDate)
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function GymDashboardPage() {
  const navigate = useNavigate()
  const { gymWorkouts, gymExercises, gymTemplates } = useGym()
  const [startModalOpen, setStartModalOpen] = useState(false)

  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const weekWorkouts = gymWorkouts.filter((w) => w.date >= weekStart && w.date <= weekEnd)
  const totalMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration ?? 0), 0)
  const totalVolume = Math.round(
    weekWorkouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s2, ex) => s2 + ex.sets.reduce((s3, set) => s3 + set.reps * set.weight, 0),
          0,
        ),
      0,
    ),
  )

  // Count all-time PRs
  let prCount = 0
  for (const ex of gymExercises) {
    let max = 0
    const sorted = [...gymWorkouts]
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap((w) => w.exercises.filter((e) => e.exerciseId === ex.id))
    for (const we of sorted) {
      const m = Math.max(...we.sets.map((s) => s.weight), 0)
      if (m > max) { prCount++; max = m }
    }
  }

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const selectedExercise = selectedExerciseId ? gymExercises.find((e) => e.id === selectedExerciseId) : null

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const selectedTemplate = selectedTemplateId ? gymTemplates.find((t) => t.id === selectedTemplateId) : null
  const templateWorkouts = selectedTemplate
    ? gymWorkouts.filter((w) => w.templateId === selectedTemplate.id)
    : []

  const recentWorkouts = [...gymWorkouts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  const lastWorkout = recentWorkouts[0] ?? null

  const summaryTiles = [
    { label: 'Trainings', value: weekWorkouts.length },
    { label: 'Minuten', value: totalMinutes },
    { label: 'Volumen kg', value: totalVolume },
    { label: 'All-time PRs', value: prCount },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-primary">Gym Training</h1>
        <p className="text-sm text-muted">Krafttraining & Fortschritt</p>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => setStartModalOpen(true)}
        className="w-full py-4 text-base font-semibold text-white bg-accent rounded-xl hover:bg-accent/90 active:scale-[0.98] transition-all"
      >
        Workout beginnen
      </button>

      {/* Last workout */}
      {lastWorkout && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-1">
          <p className="text-xs text-muted uppercase tracking-wide font-medium">Letztes Training</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">
              {lastWorkout.title || 'Gym Training'}
            </p>
            <span className="text-xs text-muted">{formatDate(lastWorkout.date)}</span>
          </div>
          <p className="text-xs text-muted">
            {lastWorkout.exercises.length} Übungen
            {lastWorkout.duration ? ` · ${lastWorkout.duration} min` : ''}
          </p>
        </div>
      )}

      {/* Weekly summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryTiles.map((tile) => (
          <div key={tile.label} className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary tabular-nums">{tile.value}</p>
            <p className="text-xs text-muted mt-0.5">{tile.label}</p>
          </div>
        ))}
      </div>

      {/* Progress charts */}
      {gymExercises.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">Fortschritt</p>
            <select
              value={selectedExerciseId ?? ''}
              onChange={(e) => setSelectedExerciseId(e.target.value || null)}
              className="bg-input border border-border rounded-lg px-2 py-1 text-sm text-primary outline-none focus:border-accent"
            >
              <option value="">Übung wählen</option>
              {gymExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          {selectedExercise ? (
            <>
              <div>
                <p className="text-xs text-muted mb-1">Max. Gewicht ({selectedExercise.unit})</p>
                <ExerciseProgressChart
                  workouts={gymWorkouts}
                  exerciseId={selectedExercise.id}
                  unit={selectedExercise.unit}
                />
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Volumen pro Session</p>
                <VolumeChart workouts={gymWorkouts} exerciseId={selectedExercise.id} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted text-center py-4">Wähle eine Übung für den Chart</p>
          )}
        </div>
      )}

      {/* Template progress */}
      {gymTemplates.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-primary">Template-Fortschritt</p>
            <select
              value={selectedTemplateId ?? ''}
              onChange={(e) => setSelectedTemplateId(e.target.value || null)}
              className="bg-input border border-border rounded-lg px-2 py-1 text-sm text-primary outline-none focus:border-accent"
            >
              <option value="">Template wählen</option>
              {gymTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {selectedTemplate && templateWorkouts.length >= 2 ? (
            <div className="grid grid-cols-2 gap-3">
              {selectedTemplate.exercises.map((te) => {
                const ex = gymExercises.find((e) => e.id === te.exerciseId)
                if (!ex) return null
                return (
                  <div key={te.exerciseId} className="space-y-1">
                    <p className="text-xs text-muted font-medium truncate">{ex.name}</p>
                    <ExerciseProgressChart
                      workouts={templateWorkouts}
                      exerciseId={ex.id}
                      unit={ex.unit}
                    />
                  </div>
                )
              })}
            </div>
          ) : selectedTemplate ? (
            <p className="text-sm text-muted text-center py-4">
              Mindestens 2 Workouts mit diesem Template benötigt
            </p>
          ) : (
            <p className="text-sm text-muted text-center py-4">
              Wähle ein Template für den Fortschritt
            </p>
          )}
        </div>
      )}

      {/* Recent workouts */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">Letzte Workouts</p>
        {recentWorkouts.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            Noch keine Workouts. Los geht's!
          </p>
        ) : (
          recentWorkouts.map((w) => <WorkoutCard key={w.id} workout={w} />)
        )}
      </div>

      {/* Templates link */}
      <div className="pb-4 text-center">
        <button
          onClick={() => navigate('/gym/templates')}
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          Templates verwalten →
        </button>
      </div>

      <GymStartModal open={startModalOpen} onClose={() => setStartModalOpen(false)} />
    </div>
  )
}
