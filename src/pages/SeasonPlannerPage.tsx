import { useState, useCallback } from 'react'
import { useApp } from '../store/AppContext'
import type { Season, Phase, Microcycle } from '../types'
import { useModalState } from '../hooks/useModalState'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { SeasonForm } from '../components/season/SeasonForm'
import { PhaseForm } from '../components/season/PhaseForm'
import { MicrocycleForm } from '../components/season/MicrocycleForm'
import { SeasonListColumn } from '../components/season/SeasonListColumn'
import { PhaseListColumn } from '../components/season/PhaseListColumn'
import { MicrocycleListColumn } from '../components/season/MicrocycleListColumn'
import { PageBackground } from '../components/ui/PageBackground'

type DeleteTarget = { type: 'season' | 'phase' | 'mc'; id: string; label: string }

export function SeasonPlannerPage() {
  const { seasons, addSeason, updateSeason, deleteSeason, addPhase, updatePhase, deletePhase, addMicrocycle, updateMicrocycle, deleteMicrocycle } = useApp()

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)

  const seasonModal = useModalState<Season>()
  const phaseModal = useModalState<Phase>()
  const mcModal = useModalState<Microcycle>()
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId)
  const selectedPhase = selectedSeason?.phases.find((p) => p.id === selectedPhaseId)

  const handleSeasonSelect = useCallback((id: string) => {
    setSelectedSeasonId(id)
    setSelectedPhaseId(null)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'season') deleteSeason(deleteTarget.id)
    else if (deleteTarget.type === 'phase') deletePhase(deleteTarget.id)
    else deleteMicrocycle(deleteTarget.id)
    setDeleteTarget(null)
  }, [deleteTarget, deleteSeason, deletePhase, deleteMicrocycle])

  return (
    <div className="relative min-h-full">
      <PageBackground />
      <div className="relative z-10 p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Saisonplanung</h1>
            <p className="text-sm text-muted">Saisons, Phasen und Mikrozyklen verwalten</p>
          </div>
          <Button size="sm" onClick={() => seasonModal.open()}>+ Saison</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <SeasonListColumn
            seasons={seasons}
            selectedId={selectedSeasonId}
            onSelect={handleSeasonSelect}
            onEdit={(s) => seasonModal.open(s)}
            onDelete={(s) => setDeleteTarget({ type: 'season', id: s.id, label: s.name })}
          />
          <PhaseListColumn
            selectedSeason={selectedSeason}
            selectedId={selectedPhaseId}
            onSelect={setSelectedPhaseId}
            onAdd={() => phaseModal.open()}
            onEdit={(p) => phaseModal.open(p)}
            onDelete={(p) => setDeleteTarget({ type: 'phase', id: p.id, label: p.name })}
          />
          <MicrocycleListColumn
            selectedPhase={selectedPhase}
            onAdd={() => mcModal.open()}
            onEdit={(mc) => mcModal.open(mc)}
            onDelete={(mc) => setDeleteTarget({ type: 'mc', id: mc.id, label: mc.focusLabel })}
          />
        </div>

        <Modal open={seasonModal.isOpen} onClose={seasonModal.close} title={seasonModal.data ? 'Saison bearbeiten' : 'Neue Saison'} size="sm">
          <SeasonForm
            initial={seasonModal.data}
            onCancel={seasonModal.close}
            onSave={(data) => {
              if (seasonModal.data) {
                updateSeason({ ...seasonModal.data, ...data })
              } else {
                const s = addSeason(data.name, data.startDate, data.endDate)
                setSelectedSeasonId(s.id)
              }
              seasonModal.close()
            }}
          />
        </Modal>

        <Modal open={phaseModal.isOpen} onClose={phaseModal.close} title={phaseModal.data ? 'Phase bearbeiten' : 'Neue Phase'} size="sm">
          {selectedSeason && (
            <PhaseForm
              initial={phaseModal.data}
              onCancel={phaseModal.close}
              onSave={(data) => {
                if (phaseModal.data) {
                  updatePhase({ ...phaseModal.data, ...data })
                } else {
                  const p = addPhase(selectedSeason.id, data)
                  setSelectedPhaseId(p.id)
                }
                phaseModal.close()
              }}
            />
          )}
        </Modal>

        <Modal open={mcModal.isOpen} onClose={mcModal.close} title={mcModal.data ? 'Mikrozyklus bearbeiten' : 'Neuer Mikrozyklus'} size="sm">
          {selectedPhase && (
            <MicrocycleForm
              initial={mcModal.data}
              phaseStartDate={selectedPhase.startDate}
              onCancel={mcModal.close}
              onSave={(data) => {
                if (mcModal.data) {
                  updateMicrocycle({ ...mcModal.data, ...data })
                } else {
                  addMicrocycle(selectedPhase.id, data)
                }
                mcModal.close()
              }}
            />
          )}
        </Modal>

        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Löschen bestätigen"
          message={deleteTarget ? `„${deleteTarget.label}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.` : ''}
        />
      </div>
    </div>
  )
}
