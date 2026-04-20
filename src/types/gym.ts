export interface GymExercise {
  id: string
  name: string
  muscleGroup: string
  unit: 'kg' | 'lbs' | 'bodyweight'
  createdAt: string
  imageBase64?: string
}

export interface GymSet {
  reps: number
  weight: number // 0 for bodyweight
}

export interface GymWorkoutExercise {
  exerciseId: string
  sets: GymSet[]
  order: number
  notes?: string
}

export interface GymWorkout {
  id: string
  title: string
  date: string // YYYY-MM-DD
  exercises: GymWorkoutExercise[]
  notes: string
  duration: number | null // minutes (auto-filled by timer)
  startedAt: string | null // ISO timestamp — timer running when set
  completedAt: string | null
  createdAt: string
  templateId?: string
}

export interface GymTemplateExercise {
  exerciseId: string
  targetSets: number
  targetReps: number
  order: number
}

export interface GymTemplate {
  id: string
  title: string
  exercises: GymTemplateExercise[]
  notes: string
  createdAt: string
}
