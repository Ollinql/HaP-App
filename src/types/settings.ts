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

export interface Goal {
  id: string
  text: string
  completed: boolean
  tag?: string
}

export interface Settings {
  trainingDays: Record<DayKey, DayConfig>
  trainingGoals: Goal[]
  globalTags: string[]
}
