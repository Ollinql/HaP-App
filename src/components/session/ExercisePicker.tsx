import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import type { Exercise, SectionKey } from '../../types'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { generateId } from '../../utils/idUtils'

interface ExercisePickerProps {
  open: boolean
  onClose: () => void
  section: SectionKey
  onPick: (exercise: Exercise) => void
}

export function ExercisePicker({ open, onClose, section, onPick }: ExercisePickerProps) {
  const { exercises, settings } = useApp()
  const [filterTag, setFilterTag] = useState('')

  const filtered = exercises.filter((e) => {
    if (!filterTag) return true
    return e.tags.includes(filterTag)
  })

  const allTags = [...new Set(exercises.flatMap((e) => e.tags))]

  const handlePick = (ex: Exercise) => {
    // Clone the exercise with a new ID so session has its own copy
    onPick({
      ...ex,
      id: generateId(),
      section,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Übung aus Archiv wählen" size="lg">
      <div className="p-4 space-y-3">
        {/* Tag filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterTag('')}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterTag ? 'bg-accent text-white' : 'bg-elevated text-muted hover:text-primary'
            }`}
          >
            Alle
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                filterTag === tag
                  ? 'bg-accent text-white'
                  : 'bg-elevated text-muted hover:text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted text-sm py-8">
            {exercises.length === 0
              ? 'Noch keine Übungen im Archiv.'
              : 'Keine Übungen mit diesem Tag.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handlePick(ex)}
                className="flex flex-col gap-2 p-2 bg-elevated border border-border rounded-lg hover:border-accent transition-colors text-left"
              >
                <div className="aspect-[3/2] w-full rounded overflow-hidden bg-[#1a2e1a]">
                  {ex.drawingData ? (
                    <img src={ex.drawingData} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      Keine Zeichnung
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-primary truncate">{ex.title || 'Unbenannt'}</p>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {ex.tags.slice(0, 2).map((t) => (
                      <Badge key={t} label={t} />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Use global tags for the exercise picker context */}
        {settings.globalTags.length === 0 && exercises.length === 0 && (
          <p className="text-xs text-muted text-center">
            Erstelle zuerst Übungen im Übungsarchiv.
          </p>
        )}
      </div>
    </Modal>
  )
}
