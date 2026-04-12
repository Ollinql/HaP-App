import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Settings, DayKey, Goal } from '../types/settings'
import { generateId } from '../utils/idUtils'

type Setter<T> = (val: T | ((prev: T) => T)) => void

interface SettingsContextValue {
  settings: Settings
  setSettings: Setter<Settings>
  updateSettings: (s: Settings) => void
  addGoal: (text: string, tag?: string) => void
  removeGoal: (id: string) => void
  toggleGoal: (id: string) => void
  addGlobalTag: (tag: string) => void
  removeGlobalTag: (tag: string) => void
  setTrainingDay: (day: DayKey, config: { enabled?: boolean; duration?: number }) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const DEFAULT_SETTINGS: Settings = {
  trainingDays: {
    monday: { enabled: true, duration: 90 },
    tuesday: { enabled: false, duration: 90 },
    wednesday: { enabled: true, duration: 90 },
    thursday: { enabled: false, duration: 90 },
    friday: { enabled: true, duration: 90 },
    saturday: { enabled: false, duration: 90 },
    sunday: { enabled: false, duration: 90 },
  },
  trainingGoals: [],
  globalTags: [],
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('htp_v1_settings', DEFAULT_SETTINGS)

  // Migrate legacy string goals to Goal objects
  const migratedGoals = useMemo(
    () =>
      settings.trainingGoals.map((g) =>
        typeof g === 'string'
          ? ({ id: generateId(), text: g as unknown as string, completed: false } as Goal)
          : g,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.trainingGoals],
  )
  const migratedSettings: Settings = useMemo(
    () => ({ ...settings, trainingGoals: migratedGoals }),
    [settings, migratedGoals],
  )

  useEffect(() => {
    if (settings.trainingGoals.some((g) => typeof g === 'string')) {
      setSettings(migratedSettings)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateSettings(s: Settings) {
    setSettings(s)
  }

  function addGoal(text: string, tag?: string) {
    const goal: Goal = { id: generateId(), text, completed: false, tag }
    setSettings((prev) => ({ ...prev, trainingGoals: [...prev.trainingGoals, goal] }))
  }

  function removeGoal(id: string) {
    setSettings((prev) => ({
      ...prev,
      trainingGoals: prev.trainingGoals.filter((g) => (typeof g === 'string' ? false : g.id !== id)),
    }))
  }

  function toggleGoal(id: string) {
    setSettings((prev) => ({
      ...prev,
      trainingGoals: prev.trainingGoals.map((g) =>
        typeof g !== 'string' && g.id === id ? { ...g, completed: !g.completed } : g,
      ),
    }))
  }

  function addGlobalTag(tag: string) {
    setSettings((prev) => ({ ...prev, globalTags: [...prev.globalTags, tag] }))
  }

  function removeGlobalTag(tag: string) {
    setSettings((prev) => ({
      ...prev,
      globalTags: prev.globalTags.filter((t) => t !== tag),
    }))
  }

  function setTrainingDay(day: DayKey, config: { enabled?: boolean; duration?: number }) {
    setSettings((prev) => ({
      ...prev,
      trainingDays: {
        ...prev.trainingDays,
        [day]: { ...prev.trainingDays[day], ...config },
      },
    }))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings: migratedSettings,
        setSettings,
        updateSettings,
        addGoal,
        removeGoal,
        toggleGoal,
        addGlobalTag,
        removeGlobalTag,
        setTrainingDay,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}
