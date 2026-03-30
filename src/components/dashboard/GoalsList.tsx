import { useApp } from '../../store/AppContext'
import { useNavigate } from 'react-router-dom'

export function GoalsList() {
  const { settings } = useApp()
  const navigate = useNavigate()

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary">Trainingsziele</h3>
        <button
          onClick={() => navigate('/settings')}
          className="text-xs text-muted hover:text-accent transition-colors"
        >
          Bearbeiten
        </button>
      </div>
      {settings.trainingGoals.length === 0 ? (
        <p className="text-xs text-muted">
          Keine Ziele definiert.{' '}
          <button
            onClick={() => navigate('/settings')}
            className="text-accent hover:underline"
          >
            Ziele hinzufügen
          </button>
        </p>
      ) : (
        <ul className="space-y-1.5">
          {settings.trainingGoals.map((goal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <span className="text-accent mt-0.5 shrink-0">◦</span>
              {goal}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
