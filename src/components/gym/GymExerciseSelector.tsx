import { useState } from 'react'
import { useGym } from '../../store/GymContext'
import { generateId } from '../../utils/idUtils'
import type { GymExercise } from '../../types/gym'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (exerciseId: string) => void
}

const MUSCLE_GROUPS = [
  'Brust', 'Rücken', 'Schulter', 'Bizeps', 'Trizeps',
  'Beine', 'Gesäß', 'Bauch', 'Ganzkörper', 'Sonstiges',
]

export function GymExerciseSelector({ open, onClose, onSelect }: Props) {
  const { gymExercises, addGymExercise } = useGym()
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newMuscle, setNewMuscle] = useState(MUSCLE_GROUPS[0])
  const [newUnit, setNewUnit] = useState<GymExercise['unit']>('kg')
  const [newImageBase64, setNewImageBase64] = useState<string | undefined>()

  if (!open) return null

  const filtered = gymExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleCreate = () => {
    if (!newName.trim()) return
    const ex: GymExercise = {
      id: generateId(),
      name: newName.trim(),
      muscleGroup: newMuscle,
      unit: newUnit,
      createdAt: new Date().toISOString(),
      imageBase64: newImageBase64,
    }
    addGymExercise(ex)
    onSelect(ex.id)
    onClose()
    setNewName('')
    setNewImageBase64(undefined)
    setShowNew(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-surface border border-border rounded-t-2xl md:rounded-2xl p-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-primary">Übung wählen</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-lg">✕</button>
        </div>

        <input
          type="text"
          placeholder="Suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent mb-3"
          autoFocus
        />

        <div className="flex-1 overflow-y-auto space-y-1 mb-3">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => { onSelect(ex.id); onClose() }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-elevated transition-colors"
            >
              <p className="text-sm text-primary font-medium">{ex.name}</p>
              <p className="text-xs text-muted">{ex.muscleGroup} · {ex.unit}</p>
            </button>
          ))}
          {filtered.length === 0 && !showNew && (
            <p className="text-sm text-muted text-center py-4">Keine Übungen gefunden</p>
          )}
        </div>

        {showNew ? (
          <div className="border-t border-border pt-3 space-y-2">
            <input
              type="text"
              placeholder="Name der Übung"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={newMuscle}
                onChange={(e) => setNewMuscle(e.target.value)}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              >
                {MUSCLE_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value as GymExercise['unit'])}
                className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="bodyweight">Körpergewicht</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Bild (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = () => setNewImageBase64(reader.result as string)
                  reader.readAsDataURL(file)
                }}
                className="w-full text-xs text-muted bg-input border border-border rounded px-2 py-1.5"
              />
              {newImageBase64 && (
                <img src={newImageBase64} className="mt-1.5 h-16 w-full rounded object-contain" alt="Vorschau" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 py-2 text-sm text-muted border border-border rounded-lg hover:bg-elevated transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2 text-sm text-white bg-accent rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                Erstellen
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="w-full py-2 text-sm text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-colors"
          >
            + Neue Übung erstellen
          </button>
        )}
      </div>
    </div>
  )
}
