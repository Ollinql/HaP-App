import { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { Season, Phase, Microcycle } from '../types'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Modal } from '../components/ui/Modal'
import { SeasonForm } from '../components/season/SeasonForm'
import { PhaseForm } from '../components/season/PhaseForm'
import { MicrocycleForm } from '../components/season/MicrocycleForm'
import { PHASE_COLORS } from '../utils/colorUtils'
import { PageBackground } from '../components/ui/PageBackground'

export function SeasonPlannerPage() {
  const { seasons, addSeason, updateSeason, deleteSeason, addPhase, updatePhase, deletePhase, addMicrocycle, updateMicrocycle, deleteMicrocycle } = useApp()

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)

  // Modal state
  const [seasonModal, setSeasonModal] = useState<{ open: boolean; editing?: Season }>({ open: false })
  const [phaseModal, setPhaseModal] = useState<{ open: boolean; editing?: Phase }>({ open: false })
  const [mcModal, setMcModal] = useState<{ open: boolean; editing?: Microcycle }>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; label: string }>({ open: false, type: '', id: '', label: '' })

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId)
  const selectedPhase = selectedSeason?.phases.find((p) => p.id === selectedPhaseId)

  const handleDeleteConfirm = () => {
    if (deleteDialog.type === 'season') deleteSeason(deleteDialog.id)
    else if (deleteDialog.type === 'phase') deletePhase(deleteDialog.id)
    else if (deleteDialog.type === 'mc') deleteMicrocycle(deleteDialog.id)
  }

  return (
    <div className="relative min-h-full">
      <PageBackground />
      <div className="relative z-10 p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Saisonplanung</h1>
          <p className="text-sm text-muted">Saisons, Phasen und Mikrozyklen verwalten</p>
        </div>
        <Button size="sm" onClick={() => setSeasonModal({ open: true })}>+ Saison</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Column 1: Seasons */}
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
                    selectedSeasonId === season.id
                      ? 'bg-accent/10 border-r-2 border-accent'
                      : 'hover:bg-elevated',
                  ].join(' ')}
                  onClick={() => { setSelectedSeasonId(season.id); setSelectedPhaseId(null) }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{season.name}</p>
                    <p className="text-xs text-muted">{season.phases.length} Phasen</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSeasonModal({ open: true, editing: season }) }}
                      className="text-muted hover:text-primary text-xs px-1"
                      title="Bearbeiten"
                    >✎</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, type: 'season', id: season.id, label: season.name }) }}
                      className="text-muted hover:text-red-400 text-xs px-1"
                      title="Löschen"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Column 2: Phases */}
        <Card padding={false}>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Phasen</h2>
            {selectedSeason && (
              <button
                onClick={() => setPhaseModal({ open: true })}
                className="text-xs text-accent hover:text-accent-hover"
              >
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
                    selectedPhaseId === phase.id
                      ? 'bg-accent/10 border-r-2 border-accent'
                      : 'hover:bg-elevated',
                  ].join(' ')}
                  onClick={() => setSelectedPhaseId(phase.id)}
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
                      onClick={(e) => { e.stopPropagation(); setPhaseModal({ open: true, editing: phase }) }}
                      className="text-muted hover:text-primary text-xs px-1"
                    >✎</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, type: 'phase', id: phase.id, label: phase.name }) }}
                      className="text-muted hover:text-red-400 text-xs px-1"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Column 3: Microcycles */}
        <Card padding={false}>
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Mikrozyklen</h2>
            {selectedPhase && (
              <button
                onClick={() => setMcModal({ open: true })}
                className="text-xs text-accent hover:text-accent-hover"
              >
                + Mikrozyklus
              </button>
            )}
          </div>
          {!selectedPhase ? (
            <p className="p-4 text-sm text-muted text-center">Phase auswählen</p>
          ) : selectedPhase.microcycles.length === 0 ? (
            <p className="p-4 text-sm text-muted text-center">Noch keine Mikrozyklen.</p>
          ) : (
            <div className="divide-y divide-border">
              {selectedPhase.microcycles.map((mc) => (
                <div key={mc.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-elevated">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted">KW {mc.weekNumber}</p>
                    <p className="text-sm font-medium text-primary truncate">{mc.focusLabel}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setMcModal({ open: true, editing: mc })}
                      className="text-muted hover:text-primary text-xs px-1"
                    >✎</button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, type: 'mc', id: mc.id, label: mc.focusLabel })}
                      className="text-muted hover:text-red-400 text-xs px-1"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Season modal */}
      <Modal open={seasonModal.open} onClose={() => setSeasonModal({ open: false })} title={seasonModal.editing ? 'Saison bearbeiten' : 'Neue Saison'} size="sm">
        <SeasonForm
          initial={seasonModal.editing}
          onCancel={() => setSeasonModal({ open: false })}
          onSave={(data) => {
            if (seasonModal.editing) {
              updateSeason({ ...seasonModal.editing, ...data })
            } else {
              const s = addSeason(data.name, data.startDate, data.endDate)
              setSelectedSeasonId(s.id)
            }
            setSeasonModal({ open: false })
          }}
        />
      </Modal>

      {/* Phase modal */}
      <Modal open={phaseModal.open} onClose={() => setPhaseModal({ open: false })} title={phaseModal.editing ? 'Phase bearbeiten' : 'Neue Phase'} size="sm">
        {selectedSeason && (
          <PhaseForm
            initial={phaseModal.editing}
            onCancel={() => setPhaseModal({ open: false })}
            onSave={(data) => {
              if (phaseModal.editing) {
                updatePhase({ ...phaseModal.editing, ...data })
              } else {
                const p = addPhase(selectedSeason.id, data)
                setSelectedPhaseId(p.id)
              }
              setPhaseModal({ open: false })
            }}
          />
        )}
      </Modal>

      {/* Microcycle modal */}
      <Modal open={mcModal.open} onClose={() => setMcModal({ open: false })} title={mcModal.editing ? 'Mikrozyklus bearbeiten' : 'Neuer Mikrozyklus'} size="sm">
        {selectedPhase && (
          <MicrocycleForm
            initial={mcModal.editing}
            phaseStartDate={selectedPhase.startDate}
            onCancel={() => setMcModal({ open: false })}
            onSave={(data) => {
              if (mcModal.editing) {
                updateMicrocycle({ ...mcModal.editing, ...data })
              } else {
                addMicrocycle(selectedPhase.id, data)
              }
              setMcModal({ open: false })
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        onConfirm={handleDeleteConfirm}
        title="Löschen bestätigen"
        message={`„${deleteDialog.label}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
      />
      </div>
    </div>
  )
}
