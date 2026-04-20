import type { Exercise } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface Props {
  filtered: Exercise[]
  totalCount: number
  onPreview: (ex: Exercise) => void
  onEdit: (ex: Exercise) => void
  onDelete: (id: string) => void
  onCreateFirst: () => void
}

export function ExerciseGrid({ filtered, totalCount, onPreview, onEdit, onDelete, onCreateFirst }: Props) {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted text-sm">
          {totalCount === 0
            ? 'Noch keine Übungen. Erstelle deine erste Übung!'
            : 'Keine Übungen mit diesem Tag.'}
        </p>
        {totalCount === 0 && (
          <Button className="mt-3" onClick={onCreateFirst}>Erste Übung erstellen</Button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filtered.map((ex) => (
        <div
          key={ex.id}
          className="bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors group"
        >
          <button
            type="button"
            className="w-full aspect-[3/4] bg-elevated relative"
            onClick={() => onPreview(ex)}
          >
            {ex.drawingData ? (
              <img src={ex.drawingData} alt="" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                Keine Zeichnung
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs font-medium">Vorschau</span>
            </div>
          </button>

          <div className="p-2.5">
            <p className="text-xs font-semibold text-primary truncate">{ex.title || 'Unbenannt'}</p>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {ex.tags.slice(0, 3).map((t) => (
                <Badge key={t} label={t} />
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => onEdit(ex)}
                className="text-xs text-primary hover:text-accent transition-colors"
              >
                ✎ Bearbeiten
              </button>
              <button
                onClick={() => onDelete(ex.id)}
                className="text-xs text-muted hover:text-red-400 transition-colors ml-auto"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
