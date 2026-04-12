import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Exercise } from '../types/session'

type Setter<T> = (val: T | ((prev: T) => T)) => void

interface ExercisesContextValue {
  exercises: Exercise[]
  setExercises: Setter<Exercise[]>
  addExercise: (exercise: Exercise) => void
  updateExercise: (exercise: Exercise) => void
  deleteExercise: (id: string) => void
}

const ExercisesContext = createContext<ExercisesContextValue | null>(null)

function deduplicateExercises(exercises: Exercise[]): Exercise[] {
  const byId = new Map<string, Exercise>()
  for (const ex of exercises) {
    if (!byId.has(ex.id)) byId.set(ex.id, ex)
  }
  const byNameSection = new Map<string, boolean>()
  const result: Exercise[] = []
  for (const ex of byId.values()) {
    if (!ex.title) { result.push(ex); continue }
    const key = `${ex.title.trim().toLowerCase()}::${ex.section}`
    if (!byNameSection.has(key)) { byNameSection.set(key, true); result.push(ex) }
  }
  return result
}

export { deduplicateExercises }

export function ExercisesProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('htp_v1_exercises', [])

  // Deduplicate archive on startup (by ID, then by title+section)
  useEffect(() => {
    const deduped = deduplicateExercises(exercises)
    if (deduped.length !== exercises.length) {
      setExercises(deduped)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addExercise(exercise: Exercise) {
    setExercises((prev) => {
      const exists = prev.some((e) => e.id === exercise.id)
      if (exists) return prev.map((e) => (e.id === exercise.id ? exercise : e))
      return [...prev, exercise]
    })
  }

  function updateExercise(exercise: Exercise) {
    setExercises((prev) => prev.map((e) => (e.id === exercise.id ? exercise : e)))
  }

  function deleteExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <ExercisesContext.Provider value={{ exercises, setExercises, addExercise, updateExercise, deleteExercise }}>
      {children}
    </ExercisesContext.Provider>
  )
}

export function useExercises(): ExercisesContextValue {
  const ctx = useContext(ExercisesContext)
  if (!ctx) throw new Error('useExercises must be used inside ExercisesProvider')
  return ctx
}
