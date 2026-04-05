import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AppContext'
import { fromISODate, formatDateLong, getMondayOfWeek, toISODate, getISOWeek } from '../../utils/dateUtils'
import type { Phase, Microcycle } from '../../types'
import { TrainingRunModal } from './TrainingRunModal'

interface DayDetailPanelProps {
  date: string
  onClose: () => void
}

function findPhaseForDate(date: string, phases: Phase[]): Phase | undefined {
  return phases.find((p) => p.startDate <= date && date <= p.endDate)
}

function findMicrocycleForDate(date: string, phase: Phase): Microcycle | undefined {
  const monday = toISODate(getMondayOfWeek(fromISODate(date)))
  return phase.microcycles.find((mc) => mc.startDate === monday)
}

const PHASE_TYPE_LABEL: Record<string, string> = {
  Vorbereitung: 'Vorbereitung',
  Wettkampf: 'Wettkampfphase',
  Pause: 'Pause',
}

const SECTION_LABELS: Record<string, string> = {
  warmup: 'Aufwärmen',
  main: 'Hauptteil',
  closing: 'Abschluss',
}

export function DayDetailPanel({ date, onClose }: DayDetailPanelProps) {
  const navigate = useNavigate()
  const { sessions, exercises, seasons } = useApp()
  const [trainingRunOpen, setTrainingRunOpen] = useState(false)

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const session = sessions.find((s) => s.date === date)

  // Find phase and microcycle across all seasons
  let phase: Phase | undefined
  let microcycle: Microcycle | undefined
  for (const season of seasons) {
    phase = findPhaseForDate(date, season.phases)
    if (phase) {
      microcycle = findMicrocycleForDate(date, phase)
      break
    }
  }

  const weekNum = getISOWeek(fromISODate(date))

  return (
    <div className="rounded-xl border border-border bg-elevated p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted uppercase tracking-wide">Tagesübersicht</p>
          <h2 className="text-sm font-semibold text-primary">{formatDateLong(date)}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface transition-colors text-lg leading-none"
          aria-label="Schließen"
        >
          ×
        </button>
      </div>

      {/* Phase & Microcycle Info */}
      <div className="flex flex-wrap gap-2 text-xs">
        {phase ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-muted">
            <span className="text-accent">◆</span>
            {PHASE_TYPE_LABEL[phase.type] ?? phase.type}
            {phase.name ? ` – ${phase.name}` : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-muted">
            Keine Saisonphase
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-muted">
          KW {weekNum}
          {microcycle?.focusLabel ? ` – ${microcycle.focusLabel}` : ''}
        </span>
      </div>

      {/* No session */}
      {!session && (
        <div className="space-y-3">
          <p className="text-sm text-muted">Kein Training geplant.</p>
          <button
            type="button"
            onClick={() => navigate(`/sessions/new?date=${date}`)}
            className="w-full py-2 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            + Training planen
          </button>
        </div>
      )}

      {/* Session overview */}
      {session && (
        <div className="space-y-3">
          {/* Title & meta */}
          <div>
            <p className="font-semibold text-primary text-sm">{session.title || 'Training'}</p>
            <p className="text-xs text-muted">{session.duration} Min.</p>
          </div>

          {/* Tags */}
          {session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-surface border border-border text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-2">
            {(['warmup', 'main', 'closing'] as const).map((sectionKey) => {
              const refs = session.sections[sectionKey]
              if (refs.length === 0) return null
              const resolved = refs.flatMap((ref) => {
                const ex = exerciseMap.get(ref.exerciseId)
                return ex ? [ex] : []
              })
              return (
                <div key={sectionKey}>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">
                    {SECTION_LABELS[sectionKey]} ({refs.length})
                  </p>
                  <ul className="space-y-0.5">
                    {resolved.map((ex) => (
                      <li key={ex.id} className="text-xs text-primary pl-2 border-l border-border">
                        {ex.title || '—'}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTrainingRunOpen(true)}
              className="flex-1 py-2 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Training starten
            </button>
            <button
              type="button"
              onClick={() => navigate(`/sessions/${session.id}`)}
              className="py-2 px-4 rounded-lg border border-accent text-accent text-sm font-medium hover:bg-accent/10 transition-colors"
            >
              Bearbeiten
            </button>
          </div>
        </div>
      )}

      {session && trainingRunOpen && (
        <TrainingRunModal session={session} onClose={() => setTrainingRunOpen(false)} />
      )}
    </div>
  )
}
