import { useState, useMemo, useCallback } from 'react'
import { useApp } from '../store/AppContext'
import type { Exercise, SectionKey } from '../types'
import { generateId } from '../utils/idUtils'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DrawingCanvas } from '../components/canvas/DrawingCanvas'
import { TagInput } from '../components/ui/TagInput'
import { Badge } from '../components/ui/Badge'
import { PageBackground } from '../components/ui/PageBackground'
import { useModalState } from '../hooks/useModalState'
import { ExerciseFilterBar } from '../components/archive/ExerciseFilterBar'
import { ExerciseGrid } from '../components/archive/ExerciseGrid'

const SECTION_OPTIONS: { value: SectionKey; label: string }[] = [
  { value: 'warmup', label: 'Aufwärmen' },
  { value: 'main', label: 'Hauptteil' },
  { value: 'closing', label: 'Abschluss' },
]

export function ExerciseArchivePage() {
  const { exercises, settings, addExercise, updateExercise, deleteExercise } = useApp()
  const [filterTag, setFilterTag] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [creationStep, setCreationStep] = useState<'metadata' | 'canvas'>('metadata')
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  const previewModal = useModalState<Exercise>()
  const editModal = useModalState<Exercise>()

  const allTags = useMemo(() => [...new Set(exercises.flatMap((e) => e.tags))], [exercises])

  const filtered = useMemo(
    () => exercises.filter((e) => !filterTag || e.tags.includes(filterTag)),
    [exercises, filterTag],
  )

  const handleCreateNew = useCallback(() => {
    const ex: Exercise = {
      id: generateId(),
      title: '',
      tags: [],
      drawingData: '',
      section: 'main',
      createdAt: new Date().toISOString(),
    }
    setIsCreatingNew(true)
    setCreationStep('metadata')
    editModal.open(ex)
  }, [editModal])

  const handleCloseEdit = useCallback(() => {
    editModal.close()
    setIsCreatingNew(false)
    setCreationStep('metadata')
  }, [editModal])

  const handleSaveDrawingAndCommit = useCallback((pngDataUrl: string, elementsJson: string) => {
    const ex = editModal.data
    if (!ex) return
    const updated: Exercise = { ...ex, drawingData: pngDataUrl, drawingElements: elementsJson }
    if (isCreatingNew) addExercise(updated)
    else updateExercise(updated)
    handleCloseEdit()
  }, [editModal.data, isCreatingNew, addExercise, updateExercise, handleCloseEdit])

  const handleEditFromPreview = useCallback((ex: Exercise) => {
    previewModal.close()
    setIsCreatingNew(false)
    setCreationStep('metadata')
    editModal.open({ ...ex })
  }, [previewModal, editModal])

  return (
    <div className="relative min-h-full">
      <PageBackground />
      <div className="relative z-10 p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Übungsarchiv</h1>
            <p className="text-sm text-muted">{exercises.length} Übungen gespeichert</p>
          </div>
          <Button size="sm" onClick={handleCreateNew}>+ Übung</Button>
        </div>

        <ExerciseFilterBar
          allTags={allTags}
          totalCount={exercises.length}
          filterTag={filterTag}
          onFilterChange={setFilterTag}
        />

        <ExerciseGrid
          filtered={filtered}
          totalCount={exercises.length}
          onPreview={(ex) => previewModal.open(ex)}
          onEdit={(ex) => { setIsCreatingNew(false); setCreationStep('metadata'); editModal.open({ ...ex }) }}
          onDelete={setDeleteId}
          onCreateFirst={handleCreateNew}
        />

        {/* Preview modal */}
        <Modal open={previewModal.isOpen} onClose={previewModal.close} title={previewModal.data?.title || 'Übung'} size="lg">
          {previewModal.data && (
            <div className="p-4 space-y-3">
              <DrawingCanvas drawingData={previewModal.data.drawingData} readOnly />
              <div className="flex flex-wrap gap-1">
                {previewModal.data.tags.map((t) => <Badge key={t} label={t} />)}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleEditFromPreview(previewModal.data!)}>Bearbeiten</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit / Create modal */}
        <Modal
          open={editModal.isOpen}
          onClose={handleCloseEdit}
          title={isCreatingNew ? 'Neue Übung' : 'Übung bearbeiten'}
          size={creationStep === 'canvas' ? 'xl' : 'lg'}
          fullscreen={creationStep === 'canvas'}
        >
          {editModal.data && creationStep === 'metadata' && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1">Titel</label>
                <input
                  type="text"
                  value={editModal.data.title}
                  onChange={(e) => editModal.open({ ...editModal.data!, title: e.target.value })}
                  placeholder="Übungsbezeichnung"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Abschnitt</label>
                <select
                  value={editModal.data.section}
                  onChange={(e) => editModal.open({ ...editModal.data!, section: e.target.value as SectionKey })}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                >
                  {SECTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Tags</label>
                <TagInput
                  tags={editModal.data.tags}
                  onChange={(tags) => editModal.open({ ...editModal.data!, tags })}
                  suggestions={settings.globalTags}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={handleCloseEdit}>Abbrechen</Button>
                <Button onClick={() => setCreationStep('canvas')}>Weiter →</Button>
              </div>
            </div>
          )}

          {editModal.data && creationStep === 'canvas' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setCreationStep('metadata')}
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  ← Zurück
                </button>
                <span className="text-xs text-muted ml-auto truncate max-w-[200px]">
                  {editModal.data.title || 'Unbenannt'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <DrawingCanvas
                  drawingElements={editModal.data.drawingElements}
                  drawingData={editModal.data.drawingData}
                  onSave={handleSaveDrawingAndCommit}
                />
              </div>
            </div>
          )}
        </Modal>

        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => { if (deleteId) deleteExercise(deleteId); setDeleteId(null) }}
          title="Übung löschen"
          message="Diese Übung wirklich aus dem Archiv entfernen?"
        />
      </div>
    </div>
  )
}
