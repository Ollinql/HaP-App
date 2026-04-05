export type SectionKey = 'warmup' | 'main' | 'closing'
export type IntensityLevel = 1 | 2 | 3 | 4 | 5

export interface Exercise {
  id: string
  title: string
  tags: string[]
  drawingData: string          // base64 PNG data URL
  drawingElements?: string     // JSON.stringify(CanvasElement[]) — für Weiterbearbeitung
  section: SectionKey
  createdAt: string // ISO date string
}

// Lightweight reference stored in a TrainingSession — exercises live only in the archive
export interface SessionExerciseRef {
  exerciseId: string
  section: SectionKey
  intensityFeedback?: IntensityLevel | null // einmalige Bewertung nach dem Training (pro Session)
}

export interface TrainingSession {
  id: string
  title: string
  date: string // YYYY-MM-DD
  duration: number // minutes
  tags: string[]
  phaseId: string | null
  sections: Record<SectionKey, SessionExerciseRef[]>
  intensityRating: IntensityLevel | null
  postTrainingFeedback: IntensityLevel | null
  notes: string
}
