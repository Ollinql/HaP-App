import type { Phase, Microcycle } from '../../types'
import { Card } from '../ui/Card'

interface Props {
  selectedPhase: Phase | undefined
  onAdd: () => void
  onEdit: (mc: Microcycle) => void
  onDelete: (mc: Microcycle) => void
}

export function MicrocycleListColumn({ selectedPhase, onAdd, onEdit, onDelete }: Props) {
  return (
    <Card padding={false}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Mikrozyklen</h2>
        {selectedPhase && (
          <button onClick={onAdd} className="text-xs text-accent hover:text-accent-hover">
            + Mikrozyklus
          </button>
        )}
      </div>
      {!selectedPhase ? (
        <p className="p-4 text-sm text-muted text-center">Phase auswählen</p>
      ) : selectedPhase.microcycles.length === 0 ? (
        <p className="p-4 text-sm text-muted text-center">Noch keine Mikrozyklen.</p>
      ) : (
        <div className="divide-y divide-border">
          {selectedPhase.microcycles.map((mc) => (
            <div key={mc.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-elevated">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted">KW {mc.weekNumber}</p>
                <p className="text-sm font-medium text-primary truncate">{mc.focusLabel}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(mc)}
                  className="text-muted hover:text-primary text-xs px-1"
                >✎</button>
                <button
                  onClick={() => onDelete(mc)}
                  className="text-muted hover:text-red-400 text-xs px-1"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
