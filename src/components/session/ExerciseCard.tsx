import { useState } from 'react'
import type { Exercise } from '../../types'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { DrawingCanvas } from '../canvas/DrawingCanvas'

interface ExerciseCardProps {
  exercise: Exercise
  onUpdate: (exercise: Exercise) => void
  onRemove: () => void
}

export function ExerciseCard({ exercise, onUpdate, onRemove }: ExerciseCardProps) {
  const [canvasOpen, setCanvasOpen] = useState(false)

  const handleSaveDrawing = (pngDataUrl: string, elementsJson: string) => {
    onUpdate({ ...exercise, drawingData: pngDataUrl, drawingElements: elementsJson })
    setCanvasOpen(false)
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-elevated border border-border rounded-lg">
      {/* Preview thumbnail */}
      <button
        type="button"
        onClick={() => setCanvasOpen(true)}
        className="shrink-0 w-14 h-14 rounded overflow-hidden bg-[#1a2e1a] border border-border hover:border-accent transition-colors"
        title="Zeichnung öffnen"
      >
        {exercise.drawingData ? (
          <img src={exercise.drawingData} alt="" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
            ✏️
          </div>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={exercise.title}
          onChange={(e) => onUpdate({ ...exercise, title: e.target.value })}
          placeholder="Übungsbezeichnung"
          className="w-full bg-transparent text-sm font-medium text-primary outline-none placeholder:text-muted border-b border-transparent focus:border-border pb-0.5"
        />
        <div className="flex flex-wrap gap-1 mt-1">
          {exercise.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setCanvasOpen(true)}
          className="text-xs text-primary hover:text-accent transition-colors"
          title="Zeichnen"
        >
          ✏
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-muted hover:text-red-400 transition-colors"
          title="Entfernen"
        >
          ×
        </button>
      </div>

      {/* Drawing modal */}
      <Modal open={canvasOpen} onClose={() => setCanvasOpen(false)} title={exercise.title || 'Übung zeichnen'} size="lg">
        <div className="p-4">
          <DrawingCanvas
            drawingData={exercise.drawingData}
            drawingElements={exercise.drawingElements}
            onSave={handleSaveDrawing}
          />
        </div>
      </Modal>
    </div>
  )
}
