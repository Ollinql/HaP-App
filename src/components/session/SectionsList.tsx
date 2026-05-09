import type { Exercise, SectionKey } from '../../types'
import { Button } from '../ui/Button'
import { CollapsibleSection } from '../ui/CollapsibleSection'
import { ExerciseCard } from './ExerciseCard'

const SECTION_LABELS: Record<SectionKey, string> = {
  warmup: 'Aufwärmen',
  main: 'Hauptteil',
  closing: 'Abschluss',
}

const SECTIONS: SectionKey[] = ['warmup', 'main', 'closing']

interface Props {
  localSections: Record<SectionKey, Exercise[]>
  onUpdate: (section: SectionKey, index: number, exercise: Exercise) => void
  onRemove: (section: SectionKey, index: number) => void
  onAddBlank: (section: SectionKey) => void
  onPickFromArchive: (section: SectionKey) => void
  onReorder: (section: SectionKey, fromIndex: number, toIndex: number) => void
}

export function SectionsList({ localSections, onUpdate, onRemove, onAddBlank, onPickFromArchive, onReorder }: Props) {
  return (
    <>
      {SECTIONS.map((section) => (
        <CollapsibleSection
          key={section}
          title={SECTION_LABELS[section]}
          badge={localSections[section].length}
          defaultOpen={section === 'main'}
        >
          <div className="space-y-2">
            {localSections[section].map((exercise, i) => (
              <div key={exercise.id} className="flex items-start gap-1">
                <div className="flex flex-col gap-0.5 pt-2 shrink-0">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => onReorder(section, i, i - 1)}
                    className="p-1 rounded text-muted hover:text-primary disabled:opacity-20 transition-colors"
                    aria-label="Nach oben"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={i === localSections[section].length - 1}
                    onClick={() => onReorder(section, i, i + 1)}
                    className="p-1 rounded text-muted hover:text-primary disabled:opacity-20 transition-colors"
                    aria-label="Nach unten"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1">
                  <ExerciseCard
                    exercise={exercise}
                    onUpdate={(ex) => onUpdate(section, i, ex)}
                    onRemove={() => onRemove(section, i)}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => onAddBlank(section)}>
                + Neue Übung
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onPickFromArchive(section)}>
                Aus Archiv
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      ))}
    </>
  )
}
