import type { Season, Phase } from '../../types'
import { Card } from '../ui/Card'
import { PHASE_COLORS } from '../../utils/colorUtils'

interface Props {
  selectedSeason: Season | undefined
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onEdit: (phase: Phase) => void
  onDelete: (phase: Phase) => void
}

export function PhaseListColumn({ selectedSeason, selectedId, onSelect, onAdd, onEdit, onDelete }: Props) {
  return (
    <Card padding={false}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Phasen</h2>
        {selectedSeason && (
          <button onClick={onAdd} className="text-xs text-accent hover:text-accent-hover">
            + Phase
          </button>
        )}
      </div>
      {!selectedSeason ? (
        <p className="p-4 text-sm text-muted text-center">Saison auswählen</p>
      ) : selectedSeason.phases.length === 0 ? (
        <p className="p-4 text-sm text-muted text-center">Noch keine Phasen.</p>
      ) : (
        <div className="divide-y divide-border">
          {selectedSeason.phases.map((phase) => (
            <div
              key={phase.id}
              className={[
                'flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors',
                selectedId === phase.id
                  ? 'bg-accent/10 border-r-2 border-accent'
                  : 'hover:bg-elevated',
              ].join(' ')}
              onClick={() => onSelect(phase.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${PHASE_COLORS[phase.type]}`}>
                    {phase.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-primary truncate">{phase.name}</p>
                <p className="text-xs text-muted">{phase.microcycles.length} Mikrozyklen</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(phase) }}
                  className="text-muted hover:text-primary text-xs px-1"
                >✎</button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(phase) }}
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
