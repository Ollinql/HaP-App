export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface DayConfig {
  enabled: boolean
  duration: number // default session duration in minutes
}

export interface Settings {
  trainingDays: Record<DayKey, DayConfig>
  trainingGoals: string[]
  globalTags: string[]
}
