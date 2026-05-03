import { useSeasonLookup } from '../../hooks/useSeasonLookup'
import { PHASE_COLORS } from '../../utils/colorUtils'

export function MicrocycleBanner() {
  const { activePhase, activeMicrocycle } = useSeasonLookup()

  if (!activePhase && !activeMicrocycle) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface border border-border rounded-xl shadow-sm">
      {activePhase && (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${PHASE_COLORS[activePhase.type]}`}>
          {activePhase.type}
        </span>
      )}
      {activeMicrocycle ? (
        <span className="text-sm text-primary">
          <span className="text-muted">KW {activeMicrocycle.weekNumber} · </span>
          {activeMicrocycle.focusLabel}
        </span>
      ) : (
        activePhase && (
          <span className="text-sm text-primary">{activePhase.name}</span>
        )
      )}
    </div>
  )
}
