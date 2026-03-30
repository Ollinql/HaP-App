import { useState } from 'react'
import type { Season } from '../../types'
import { Button } from '../ui/Button'

interface SeasonFormProps {
  initial?: Partial<Season>
  onSave: (data: { name: string; startDate: string; endDate: string }) => void
  onCancel: () => void
}

export function SeasonForm({ initial, onSave, onCancel }: SeasonFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')

  return (
    <div className="space-y-3 p-4">
      <div>
        <label className="block text-xs text-muted mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Saison 2025/26"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Start</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Ende</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onCancel}>Abbrechen</Button>
        <Button
          size="sm"
          onClick={() => { if (name && startDate && endDate) onSave({ name, startDate, endDate }) }}
          disabled={!name || !startDate || !endDate}
        >
          Speichern
        </Button>
      </div>
    </div>
  )
}
