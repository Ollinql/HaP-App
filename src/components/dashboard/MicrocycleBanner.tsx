import { useApp } from '../../store/AppContext'
import { toISODate } from '../../utils/dateUtils'
import { PHASE_COLORS } from '../../utils/colorUtils'

export function MicrocycleBanner() {
  const { seasons } = useApp()
  const today = toISODate(new Date())

  // Find active microcycle
  let activeMc = null
  let activePhase = null

  outer: for (const season of seasons) {
    for (const phase of season.phases) {
      if (today >= phase.startDate && today <= phase.endDate) {
        for (const mc of phase.microcycles) {
          const mcEnd = new Date(mc.startDate)
          mcEnd.setDate(mcEnd.getDate() + 6)
          if (today >= mc.startDate && today <= toISODate(mcEnd)) {
            activeMc = mc
            activePhase = phase
            break outer
          }
        }
        // Phase matched but no microcycle matched — still show phase
        if (!activeMc) {
          activePhase = phase
          break outer
        }
      }
    }
  }

  if (!activePhase && !activeMc) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border border-border rounded-xl">
      {activePhase && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PHASE_COLORS[activePhase.type]}`}>
          {activePhase.type}
        </span>
      )}
      {activeMc ? (
        <span className="text-sm text-primary">
          <span className="text-muted">KW {activeMc.weekNumber} · </span>
          {activeMc.focusLabel}
        </span>
      ) : (
        activePhase && (
          <span className="text-sm text-primary">{activePhase.name}</span>
        )
      )}
    </div>
  )
}
