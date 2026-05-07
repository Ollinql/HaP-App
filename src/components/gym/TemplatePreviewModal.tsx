import { useNavigate } from 'react-router-dom'
import { useGym } from '../../store/GymContext'
import type { GymTemplate } from '../../types/gym'
import { fromISODate } from '../../utils/dateUtils'

interface Props {
  template: GymTemplate | null
  onClose: () => void
}

function relativeDate(isoDate: string): string {
  const d = fromISODate(isoDate)
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'heute'
  if (diffDays === 1) return 'gestern'
  if (diffDays < 31) return `vor ${diffDays} Tagen`
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

export function TemplatePreviewModal({ template, onClose }: Props) {
  const navigate = useNavigate()
  const { gymExercises, gymWorkouts } = useGym()

  if (!template) return null

  const lastWorkout = [...gymWorkouts]
    .filter((w) => w.templateId === template.id)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  const startWorkout = () => {
    onClose()
    navigate(`/gym/workout/new?templateId=${template.id}&autostart=true`)
  }

  const editTemplate = () => {
    onClose()
    navigate(`/gym/templates/${template.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface rounded-t-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-elevated rounded-full text-muted hover:text-primary transition-colors mr-3"
          >
            ✕
          </button>
          <h2 className="flex-1 text-base font-bold text-primary text-center">{template.title}</h2>
          <button
            onClick={editTemplate}
            className="text-accent text-sm font-medium hover:text-accent/80 transition-colors"
          >
            Bearbeiten
          </button>
        </div>

        {lastWorkout && (
          <p className="text-xs text-muted px-4 pt-2">
            Zuletzt durchgeführt: {relativeDate(lastWorkout.date)}
          </p>
        )}

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {template.exercises.map((te) => {
            const ex = gymExercises.find((e) => e.id === te.exerciseId)
            if (!ex) return null
            return (
              <div key={te.exerciseId} className="flex items-center gap-3">
                {ex.imageBase64 ? (
                  <img
                    src={ex.imageBase64}
                    alt={ex.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-elevated"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-elevated shrink-0 flex items-center justify-center text-muted text-xl">
                    🏋
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {te.targetSets} × {ex.name}
                  </p>
                  <p className="text-xs text-muted">{ex.muscleGroup}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="p-4 pt-2 pb-8">
          <button
            onClick={startWorkout}
            className="w-full py-3.5 text-base font-semibold text-white bg-accent rounded-xl hover:bg-accent/90 active:scale-[0.98] transition-all"
          >
            Workout beginnen
          </button>
        </div>
      </div>
    </div>
  )
}
