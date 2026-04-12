// Re-export AppProvider for backward compatibility
export { AppProvider } from './AppProvider'

// Combined hook — all existing useApp() calls work unchanged
import { useSeasons } from './SeasonsContext'
import { useSessions } from './SessionsContext'
import { useExercises } from './ExercisesContext'
import { useSettings } from './SettingsContext'

export function useApp() {
  const seasons = useSeasons()
  const sessions = useSessions()
  const exercises = useExercises()
  const settings = useSettings()

  return {
    ...seasons,
    ...sessions,
    ...exercises,
    ...settings,
  }
}
