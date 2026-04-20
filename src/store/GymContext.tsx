import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { GymExercise, GymWorkout, GymTemplate } from '../types/gym'

type Setter<T> = (val: T | ((prev: T) => T)) => void

interface GymContextValue {
  gymExercises: GymExercise[]
  gymWorkouts: GymWorkout[]
  gymTemplates: GymTemplate[]
  setGymExercises: Setter<GymExercise[]>
  addGymExercise: (exercise: GymExercise) => void
  updateGymExercise: (exercise: GymExercise) => void
  deleteGymExercise: (id: string) => void
  addGymWorkout: (workout: GymWorkout) => void
  updateGymWorkout: (workout: GymWorkout) => void
  deleteGymWorkout: (id: string) => void
  addGymTemplate: (template: GymTemplate) => void
  updateGymTemplate: (template: GymTemplate) => void
  deleteGymTemplate: (id: string) => void
}

const GymContext = createContext<GymContextValue | null>(null)

export function GymProvider({ children }: { children: ReactNode }) {
  const [gymExercises, setGymExercises] = useLocalStorage<GymExercise[]>('hap_gym_exercises', [])
  const [gymWorkouts, setGymWorkouts] = useLocalStorage<GymWorkout[]>('hap_gym_workouts', [])
  const [gymTemplates, setGymTemplates] = useLocalStorage<GymTemplate[]>('hap_gym_templates', [])

  function addGymExercise(exercise: GymExercise) {
    setGymExercises((prev) => {
      const exists = prev.some((e) => e.id === exercise.id)
      if (exists) return prev
      return [...prev, exercise]
    })
  }

  function updateGymExercise(exercise: GymExercise) {
    setGymExercises((prev) => prev.map((e) => (e.id === exercise.id ? exercise : e)))
  }

  function deleteGymExercise(id: string) {
    setGymExercises((prev) => prev.filter((e) => e.id !== id))
  }

  function addGymWorkout(workout: GymWorkout) {
    setGymWorkouts((prev) => [...prev, workout])
  }

  function updateGymWorkout(workout: GymWorkout) {
    setGymWorkouts((prev) => prev.map((w) => (w.id === workout.id ? workout : w)))
  }

  function deleteGymWorkout(id: string) {
    setGymWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  function addGymTemplate(template: GymTemplate) {
    setGymTemplates((prev) => [...prev, template])
  }

  function updateGymTemplate(template: GymTemplate) {
    setGymTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)))
  }

  function deleteGymTemplate(id: string) {
    setGymTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <GymContext.Provider
      value={{
        gymExercises,
        gymWorkouts,
        gymTemplates,
        setGymExercises,
        addGymExercise,
        updateGymExercise,
        deleteGymExercise,
        addGymWorkout,
        updateGymWorkout,
        deleteGymWorkout,
        addGymTemplate,
        updateGymTemplate,
        deleteGymTemplate,
      }}
    >
      {children}
    </GymContext.Provider>
  )
}

export function useGym(): GymContextValue {
  const ctx = useContext(GymContext)
  if (!ctx) throw new Error('useGym must be used inside GymProvider')
  return ctx
}
