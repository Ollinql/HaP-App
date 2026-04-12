import type { Season } from '../../types'
import { Card } from '../ui/Card'

interface Props {
  seasons: Season[]
  selectedId: string | null
  onSelect: (id: string) => void
  onEdit: (season: Season) => void
  onDelete: (season: Season) => void
}

export function SeasonListColumn({ seasons, selectedId, onSelect, onEdit, onDelete }: Props) {
  return (
    <Card padding={false}>
      <div className="p-3 border-b border-border">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Saisons</h2>
      </div>
      {seasons.length === 0 ? (
        <p className="p-4 text-sm text-muted text-center">Noch keine Saisons.</p>
      ) : (
        <div className="divide-y divide-border">
          {seasons.map((season) => (
            <div
              key={season.id}
              className={[
                'flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors',
                selectedId === season.id
                  ? 'bg-accent/10 border-r-2 border-accent'
                  : 'hover:bg-elevated',
              ].join(' ')}
              onClick={() => onSelect(season.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{season.name}</p>
                <p className="text-xs text-muted">{season.phases.length} Phasen</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(season) }}
                  className="text-muted hover:text-primary text-xs px-1"
                  title="Bearbeiten"
                >✎</button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(season) }}
                  className="text-muted hover:text-red-400 text-xs px-1"
                  title="Löschen"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
