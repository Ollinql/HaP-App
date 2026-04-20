import { useNavigate } from 'react-router-dom'
import { useGym } from '../store/GymContext'

export function GymTemplatesPage() {
  const navigate = useNavigate()
  const { gymTemplates, gymExercises, deleteGymTemplate } = useGym()

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/gym')} className="text-muted hover:text-primary text-lg" aria-label="Zurück">
          ←
        </button>
        <h1 className="text-lg font-bold text-primary flex-1">Templates</h1>
        <button
          onClick={() => navigate('/gym/templates/new')}
          className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          + Neu
        </button>
      </div>

      {gymTemplates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm">Noch keine Templates.</p>
          <button
            onClick={() => navigate('/gym/templates/new')}
            className="mt-3 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium"
          >
            Erstes Template erstellen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {gymTemplates.map((t) => {
            const exerciseNames = t.exercises
              .slice(0, 3)
              .map((te) => gymExercises.find((e) => e.id === te.exerciseId)?.name ?? '?')
              .join(', ')

            return (
              <div
                key={t.id}
                className="bg-surface border border-border rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary">{t.title || 'Unbenanntes Template'}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {t.exercises.length} Übung{t.exercises.length !== 1 ? 'en' : ''}
                      {exerciseNames && ` · ${exerciseNames}${t.exercises.length > 3 ? '…' : ''}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteGymTemplate(t.id)}
                    className="text-muted hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                    aria-label="Template löschen"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/gym/workout/new?templateId=${t.id}`)}
                    className="flex-1 py-1.5 text-xs text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    Workout starten
                  </button>
                  <button
                    onClick={() => navigate(`/gym/templates/${t.id}`)}
                    className="flex-1 py-1.5 text-xs text-primary border border-border rounded-lg hover:bg-elevated transition-colors"
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
