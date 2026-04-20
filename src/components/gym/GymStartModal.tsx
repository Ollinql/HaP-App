import { useNavigate } from 'react-router-dom'
import { useGym } from '../../store/GymContext'

interface Props {
  open: boolean
  onClose: () => void
}

export function GymStartModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { gymTemplates, gymExercises } = useGym()

  if (!open) return null

  const startEmpty = () => {
    onClose()
    navigate('/gym/workout/new?autostart=true')
  }

  const startTemplate = (templateId: string) => {
    onClose()
    navigate(`/gym/workout/new?templateId=${templateId}&autostart=true`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-t-2xl md:rounded-2xl w-full max-w-md mx-auto max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-base font-semibold text-primary">Workout beginnen</h2>

          {/* Empty workout */}
          <button
            onClick={startEmpty}
            className="w-full py-3 px-4 text-sm font-medium text-accent border border-accent/30 rounded-xl hover:bg-accent/10 transition-colors text-left"
          >
            <span className="block font-semibold">Leeres Workout</span>
            <span className="text-xs text-muted font-normal">Übungen selbst hinzufügen</span>
          </button>

          {/* Templates */}
          {gymTemplates.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted uppercase tracking-wide font-medium">Templates</p>
              {gymTemplates.map((t) => {
                const exerciseNames = t.exercises
                  .map((te) => gymExercises.find((e) => e.id === te.exerciseId)?.name)
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(', ')
                const more = t.exercises.length > 3 ? ` +${t.exercises.length - 3}` : ''
                return (
                  <button
                    key={t.id}
                    onClick={() => startTemplate(t.id)}
                    className="w-full py-3 px-4 text-sm text-left bg-elevated border border-border rounded-xl hover:border-accent/50 hover:bg-accent/5 transition-colors"
                  >
                    <span className="block font-semibold text-primary">{t.title}</span>
                    {exerciseNames && (
                      <span className="text-xs text-muted font-normal">{exerciseNames}{more}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-muted hover:text-primary transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
