import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../store/GymContext'
import { fromISODate } from '../utils/dateUtils'
import { WorkoutCard } from '../components/gym/WorkoutCard'
import { ExerciseProgressChart } from '../components/gym/ExerciseProgressChart'
import { VolumeChart } from '../components/gym/VolumeChart'
import { TemplatePreviewModal } from '../components/gym/TemplatePreviewModal'
import type { GymTemplate } from '../types/gym'

function relativeDate(isoDate: string): string {
  const d = fromISODate(isoDate)
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'heute'
  if (diffDays === 1) return 'gestern'
  if (diffDays < 31) return `vor ${diffDays} Tagen`
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

function groupByMonth(workouts: ReturnType<typeof useGym>['gymWorkouts']) {
  const groups: Record<string, typeof workouts> = {}
  for (const w of workouts) {
    const d = fromISODate(w.date)
    const key = d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }).toUpperCase()
    if (!groups[key]) groups[key] = []
    groups[key].push(w)
  }
  return groups
}

export function GymDashboardPage() {
  const navigate = useNavigate()
  const { gymWorkouts, gymExercises, gymTemplates } = useGym()

  const [previewTemplate, setPreviewTemplate] = useState<GymTemplate | null>(null)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    // Default to first exercise that has workout data
    const withData = gymExercises.find((ex) =>
      gymWorkouts.some((w) => w.exercises.some((e) => e.exerciseId === ex.id)),
    )
    return withData?.id ?? ''
  })

  const sortedWorkouts = [...gymWorkouts].sort((a, b) => b.date.localeCompare(a.date))
  const monthGroups = groupByMonth(sortedWorkouts)
  const selectedExercise = gymExercises.find((e) => e.id === selectedExerciseId)

  const getTemplateLastDate = (t: GymTemplate): string | null => {
    const last = gymWorkouts
      .filter((w) => w.templateId === t.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
    return last?.date ?? null
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Workout beginnen</h1>
      </div>

      {/* Schnellstart */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Schnellstart</p>
        <button
          onClick={() => navigate('/gym/workout/new?autostart=true')}
          className="w-full py-4 text-base font-semibold text-white bg-accent rounded-xl hover:bg-accent/90 active:scale-[0.98] transition-all"
        >
          Ein leeres Workout beginnen
        </button>
      </div>

      {/* Schablonen */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-primary">Schablonen</h2>
          <button
            onClick={() => navigate('/gym/templates/new')}
            className="flex items-center gap-1.5 text-sm text-accent font-medium hover:text-accent/80 transition-colors"
          >
            <span>+</span> Template
          </button>
        </div>

        {gymTemplates.length === 0 ? (
          <div className="text-center py-8 bg-surface border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted">Noch keine Templates.</p>
            <button
              onClick={() => navigate('/gym/templates/new')}
              className="mt-2 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Erstes Template erstellen →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted font-medium">My Templates ({gymTemplates.length})</p>
            <div className="grid grid-cols-2 gap-3">
              {gymTemplates.map((t) => {
                const exerciseNames = t.exercises
                  .slice(0, 4)
                  .map((te) => gymExercises.find((e) => e.id === te.exerciseId)?.name ?? '?')
                  .join(', ')
                const lastDate = getTemplateLastDate(t)

                return (
                  <button
                    key={t.id}
                    onClick={() => setPreviewTemplate(t)}
                    className="text-left bg-surface border border-border rounded-2xl p-3 space-y-2 hover:border-accent/40 transition-colors active:scale-[0.97]"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-bold text-primary leading-snug">{t.title}</p>
                      <span className="text-muted text-base leading-none shrink-0">•••</span>
                    </div>
                    {exerciseNames && (
                      <p className="text-xs text-muted leading-snug line-clamp-3">
                        {exerciseNames}{t.exercises.length > 4 ? '…' : ''}
                      </p>
                    )}
                    {lastDate && (
                      <p className="text-xs text-muted flex items-center gap-1">
                        <span>⏱</span>
                        <span className="italic">{relativeDate(lastDate)}</span>
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Statistiken */}
      {gymExercises.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Statistiken</h2>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="bg-input border border-border rounded-lg px-2 py-1 text-sm text-primary outline-none focus:border-accent max-w-[180px] truncate"
            >
              <option value="">Übung wählen</option>
              {gymExercises.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
            {selectedExercise ? (
              <>
                <div>
                  <p className="text-xs text-white font-medium mb-2">
                    Max. Gewicht ({selectedExercise.unit})
                  </p>
                  <ExerciseProgressChart
                    workouts={gymWorkouts}
                    exerciseId={selectedExercise.id}
                    unit={selectedExercise.unit}
                  />
                </div>
                <div>
                  <p className="text-xs text-white font-medium mb-2">Volumen pro Session</p>
                  <VolumeChart workouts={gymWorkouts} exerciseId={selectedExercise.id} />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted text-center py-6">
                Wähle eine Übung für den Fortschritt
              </p>
            )}
          </div>
        </div>
      )}

      {/* Verlauf */}
      {sortedWorkouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-primary">Verlauf</h2>
          {Object.entries(monthGroups).map(([month, workouts]) => (
            <div key={month} className="space-y-2">
              <p className="text-xs font-bold text-muted tracking-widest">{month}</p>
              {workouts.map((w) => (
                <WorkoutCard key={w.id} workout={w} allWorkouts={gymWorkouts} />
              ))}
            </div>
          ))}
        </div>
      )}

      {sortedWorkouts.length === 0 && gymTemplates.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted text-sm">Noch keine Workouts. Los geht's!</p>
        </div>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  )
}
