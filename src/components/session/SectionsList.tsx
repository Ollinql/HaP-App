import { useState } from 'react'
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
  const [dragInfo, setDragInfo] = useState<{ section: SectionKey; index: number } | null>(null)

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
              <div
                key={exercise.id}
                draggable
                onDragStart={() => setDragInfo({ section, index: i })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragInfo && dragInfo.section === section && dragInfo.index !== i) {
                    onReorder(section, dragInfo.index, i)
                  }
                  setDragInfo(null)
                }}
                onDragEnd={() => setDragInfo(null)}
                className={dragInfo?.section === section && dragInfo?.index === i ? 'opacity-40' : ''}
              >
                <ExerciseCard
                  exercise={exercise}
                  onUpdate={(ex) => onUpdate(section, i, ex)}
                  onRemove={() => onRemove(section, i)}
                />
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
