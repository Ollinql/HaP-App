import { useMemo } from 'react'
import { useSeasons } from '../store/SeasonsContext'
import { toISODate } from '../utils/dateUtils'
import type { Season, Phase, Microcycle } from '../types/season'

interface SeasonLookup {
  activeSeason: Season | null
  activePhase: Phase | null
  activeMicrocycle: Microcycle | null
}

export function useSeasonLookup(): SeasonLookup {
  const { seasons } = useSeasons()
  const today = toISODate(new Date())

  return useMemo(() => {
    for (const season of seasons) {
      for (const phase of season.phases) {
        if (today >= phase.startDate && today <= phase.endDate) {
          for (const mc of phase.microcycles) {
            const mcEnd = new Date(mc.startDate)
            mcEnd.setDate(mcEnd.getDate() + 6)
            if (today >= mc.startDate && today <= toISODate(mcEnd)) {
              return { activeSeason: season, activePhase: phase, activeMicrocycle: mc }
            }
          }
          // Phase matched but no microcycle matched
          return { activeSeason: season, activePhase: phase, activeMicrocycle: null }
        }
      }
    }
    return { activeSeason: null, activePhase: null, activeMicrocycle: null }
  }, [seasons, today])
}
