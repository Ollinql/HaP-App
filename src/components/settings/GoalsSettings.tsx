import { useState } from 'react'
import type { Goal } from '../../types/settings'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface Props {
  goals: Goal[]
  onAdd: (text: string) => void
  onRemove: (id: string) => void
}

export function GoalsSettings({ goals, onAdd, onRemove }: Props) {
  const [newGoal, setNewGoal] = useState('')

  const handleAdd = () => {
    const trimmed = newGoal.trim()
    if (trimmed && !goals.some((g) => g.text === trimmed)) {
      onAdd(trimmed)
      setNewGoal('')
    }
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-primary mb-4">Trainingsziele</h2>
      <div className="space-y-2 mb-3">
        {goals.length === 0 && (
          <p className="text-xs text-muted">Noch keine Ziele definiert.</p>
        )}
        {goals.map((goal) => (
          <div key={goal.id} className="flex items-center gap-2 p-2 bg-elevated border border-border rounded-lg">
            <span className="flex-1 text-sm text-primary">{goal.text}</span>
            {goal.tag && (
              <span className="text-xs text-muted px-1.5 py-0.5 bg-surface border border-border rounded">
                {goal.tag}
              </span>
            )}
            <button
              onClick={() => onRemove(goal.id)}
              className="text-muted hover:text-red-400 text-sm transition-colors"
              aria-label={`Ziel "${goal.text}" entfernen`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Neues Ziel hinzufügen…"
          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newGoal.trim()}>
          Hinzufügen
        </Button>
      </div>
    </Card>
  )
}
