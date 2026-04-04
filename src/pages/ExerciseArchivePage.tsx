import { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { Exercise, SectionKey } from '../types'
import { generateId } from '../utils/idUtils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { DrawingCanvas } from '../components/canvas/DrawingCanvas'
import { TagInput } from '../components/ui/TagInput'
import { PageBackground } from '../components/ui/PageBackground'

export function ExerciseArchivePage() {
  const { exercises, settings, addExercise, updateExercise, deleteExercise } = useApp()
  const [filterTag, setFilterTag] = useState('')
  const [previewEx, setPreviewEx] = useState<Exercise | null>(null)
  const [editEx, setEditEx] = useState<Exercise | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [newExOpen, setNewExOpen] = useState(false)
  const [creationStep, setCreationStep] = useState<'metadata' | 'canvas'>('metadata')

  const allTags = [...new Set(exercises.flatMap((e) => e.tags))]

  const filtered = exercises.filter((e) => {
    if (!filterTag) return true
    return e.tags.includes(filterTag)
  })

  const handleCreateNew = () => {
    const ex: Exercise = {
      id: generateId(),
      title: '',
      tags: [],
      drawingData: '',
      section: 'main',
      createdAt: new Date().toISOString(),
    }
    setEditEx(ex)
    setCreationStep('metadata')
    setNewExOpen(true)
  }

  const handleCloseModal = () => {
    setEditEx(null)
    setNewExOpen(false)
    setCreationStep('metadata')
  }

  // Zeichnung speichern = Übung direkt committen
  const handleSaveDrawingAndCommit = (pngDataUrl: string, elementsJson: string) => {
    if (!editEx) return
    const updated: Exercise = { ...editEx, drawingData: pngDataUrl, drawingElements: elementsJson }
    if (newExOpen) {
      addExercise(updated)
    } else {
      updateExercise(updated)
    }
    setEditEx(null)
    setNewExOpen(false)
    setCreationStep('metadata')
  }

  const SECTION_OPTIONS: { value: SectionKey; label: string }[] = [
    { value: 'warmup', label: 'Aufwärmen' },
    { value: 'main', label: 'Hauptteil' },
    { value: 'closing', label: 'Abschluss' },
  ]

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

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterTag('')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              !filterTag ? 'bg-accent text-white' : 'bg-elevated text-muted hover:text-primary'
            }`}
          >
            Alle ({exercises.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filterTag === tag
                  ? 'bg-accent text-white'
                  : 'bg-elevated text-muted hover:text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm">
            {exercises.length === 0
              ? 'Noch keine Übungen. Erstelle deine erste Übung!'
              : 'Keine Übungen mit diesem Tag.'}
          </p>
          {exercises.length === 0 && (
            <Button className="mt-3" onClick={handleCreateNew}>Erste Übung erstellen</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              className="bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/50 transition-colors group"
            >
              {/* Drawing preview */}
              <button
                type="button"
                className="w-full aspect-[3/4] bg-[#1a2e1a] relative"
                onClick={() => setPreviewEx(ex)}
              >
                {ex.drawingData ? (
                  <img src={ex.drawingData} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                    Keine Zeichnung
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white text-xs font-medium">Vorschau</span>
                </div>
              </button>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs font-semibold text-primary truncate">{ex.title || 'Unbenannt'}</p>
                <div className="flex flex-wrap gap-0.5 mt-1">
                  {ex.tags.slice(0, 3).map((t) => (
                    <Badge key={t} label={t} />
                  ))}
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => { setEditEx({ ...ex }); setCreationStep('metadata'); setNewExOpen(false) }}
                    className="text-xs text-muted hover:text-accent transition-colors"
                  >
                    ✎ Bearbeiten
                  </button>
                  <button
                    onClick={() => setDeleteId(ex.id)}
                    className="text-xs text-muted hover:text-red-400 transition-colors ml-auto"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <Modal open={!!previewEx} onClose={() => setPreviewEx(null)} title={previewEx?.title || 'Übung'} size="lg">
        {previewEx && (
          <div className="p-4 space-y-3">
            <DrawingCanvas drawingData={previewEx.drawingData} readOnly />
            <div className="flex flex-wrap gap-1">
              {previewEx.tags.map((t) => <Badge key={t} label={t} />)}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => { setPreviewEx(null); setEditEx({ ...previewEx }); setCreationStep('metadata'); setNewExOpen(false) }}>
                Bearbeiten
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit / Create modal */}
      <Modal
        open={!!editEx}
        onClose={handleCloseModal}
        title={newExOpen ? 'Neue Übung' : 'Übung bearbeiten'}
        size={creationStep === 'canvas' ? 'xl' : 'lg'}
        fullscreen={creationStep === 'canvas'}
      >
        {editEx && creationStep === 'metadata' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1">Titel</label>
              <input
                type="text"
                value={editEx.title}
                onChange={(e) => setEditEx({ ...editEx, title: e.target.value })}
                placeholder="Übungsbezeichnung"
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Abschnitt</label>
              <select
                value={editEx.section}
                onChange={(e) => setEditEx({ ...editEx, section: e.target.value as SectionKey })}
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
                tags={editEx.tags}
                onChange={(tags) => setEditEx({ ...editEx, tags })}
                suggestions={settings.globalTags}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={handleCloseModal}>Abbrechen</Button>
              <Button onClick={() => setCreationStep('canvas')}>Weiter →</Button>
            </div>
          </div>
        )}

        {editEx && creationStep === 'canvas' && (
          <div className="flex flex-col h-full">
            {/* Zurück-Streifen */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
              <button
                type="button"
                onClick={() => setCreationStep('metadata')}
                className="text-sm text-muted hover:text-primary transition-colors"
              >
                ← Zurück
              </button>
              <span className="text-xs text-muted ml-auto truncate max-w-[200px]">
                {editEx.title || 'Unbenannt'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <DrawingCanvas
                drawingElements={editEx.drawingElements}
                drawingData={editEx.drawingData}
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
