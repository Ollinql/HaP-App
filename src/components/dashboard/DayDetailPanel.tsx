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
    <div className="rounded-xl border border-border bg-elevated shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider font-medium">Tagesübersicht</p>
          <h2 className="text-sm font-semibold text-primary mt-0.5">{formatDateLong(date)}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-surface transition-colors"
          aria-label="Schließen"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Phase & KW badges */}
        <div className="flex flex-wrap gap-2">
          {phase ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {PHASE_TYPE_LABEL[phase.type] ?? phase.type}
              {phase.name ? ` · ${phase.name}` : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-muted">
              Keine Phase
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-secondary">
            KW {weekNum}
            {microcycle?.focusLabel ? ` · ${microcycle.focusLabel}` : ''}
          </span>
        </div>

        {/* No session */}
        {!session && (
          <div className="space-y-3">
            <p className="text-sm text-muted">Kein Training geplant.</p>
            <button
              type="button"
              onClick={() => navigate(`/sessions/new?date=${date}`)}
              className="w-full py-2.5 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
            >
              + Training planen
            </button>
          </div>
        )}

        {/* Session overview */}
        {session && (
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-primary text-sm">{session.title || 'Training'}</p>
              <p className="text-xs text-muted mt-0.5">{session.duration} Min.</p>
            </div>

            {session.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {session.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-surface border border-border text-xs text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2.5">
              {(['warmup', 'main', 'closing'] as const).map((sectionKey) => {
                const refs = session.sections[sectionKey]
                if (refs.length === 0) return null
                const resolved = refs.flatMap((ref) => {
                  const ex = exerciseMap.get(ref.exerciseId)
                  return ex ? [ex] : []
                })
                return (
                  <div key={sectionKey}>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      {SECTION_LABELS[sectionKey]} ({refs.length})
                    </p>
                    <ul className="space-y-1">
                      {resolved.map((ex) => (
                        <li
                          key={ex.id}
                          className="text-xs text-secondary pl-3 border-l-2 border-border py-0.5"
                        >
                          {ex.title || '—'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTrainingRunOpen(true)}
                className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
              >
                Training starten
              </button>
              <button
                type="button"
                onClick={() => navigate(`/sessions/${session.id}`)}
                className="py-2.5 px-4 rounded-lg border border-border text-secondary text-sm font-medium hover:text-primary hover:border-accent/50 hover:bg-elevated transition-all"
              >
                Bearbeiten
              </button>
            </div>
          </div>
        )}
      </div>

      {session && trainingRunOpen && (
        <TrainingRunModal session={session} onClose={() => setTrainingRunOpen(false)} />
      )}
    </div>
  )
}
