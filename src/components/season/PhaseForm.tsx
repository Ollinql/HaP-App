import { useState } from 'react'
import type { Phase, PhaseType } from '../../types'
import { Button } from '../ui/Button'

interface PhaseFormProps {
  initial?: Partial<Phase>
  onSave: (data: { type: PhaseType; name: string; startDate: string; endDate: string }) => void
  onCancel: () => void
}

const PHASE_TYPES: PhaseType[] = ['Vorbereitung', 'Wettkampf', 'Pause']

export function PhaseForm({ initial, onSave, onCancel }: PhaseFormProps) {
  const [type, setType] = useState<PhaseType>(initial?.type ?? 'Vorbereitung')
  const [name, setName] = useState(initial?.name ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [endDate, setEndDate] = useState(initial?.endDate ?? '')

  return (
    <div className="space-y-3 p-4">
      <div>
        <label className="block text-xs text-muted mb-1">Typ</label>
        <div className="flex gap-2">
          {PHASE_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={[
                'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                type === t
                  ? 'border-accent bg-accent/20 text-accent'
                  : 'border-border bg-input text-muted hover:text-primary',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`z.B. ${type} Phase 1`}
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
          onClick={() => { if (name && startDate && endDate) onSave({ type, name, startDate, endDate }) }}
          disabled={!name || !startDate || !endDate}
        >
          Speichern
        </Button>
      </div>
    </div>
  )
}
