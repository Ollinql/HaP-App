import { useState } from 'react'
import type { Microcycle } from '../../types'
import { Button } from '../ui/Button'
import { getISOWeek, getMondayOfWeek, toISODate } from '../../utils/dateUtils'

interface MicrocycleFormProps {
  initial?: Partial<Microcycle>
  phaseStartDate?: string
  onSave: (data: { weekNumber: number; focusLabel: string; startDate: string }) => void
  onCancel: () => void
}

export function MicrocycleForm({ initial, phaseStartDate, onSave, onCancel }: MicrocycleFormProps) {
  const [focusLabel, setFocusLabel] = useState(initial?.focusLabel ?? '')
  const [startDate, setStartDate] = useState(() => {
    if (initial?.startDate) return initial.startDate
    if (phaseStartDate) return toISODate(getMondayOfWeek(new Date(phaseStartDate + 'T00:00:00')))
    return toISODate(getMondayOfWeek(new Date()))
  })

  const weekNumber = startDate
    ? getISOWeek(new Date(startDate + 'T00:00:00'))
    : 0

  return (
    <div className="space-y-3 p-4">
      <div>
        <label className="block text-xs text-muted mb-1">Wochenbeginn (Montag)</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
        {weekNumber > 0 && (
          <p className="text-xs text-muted mt-1">Kalenderwoche {weekNumber}</p>
        )}
      </div>
      <div>
        <label className="block text-xs text-muted mb-1">Schwerpunkt</label>
        <input
          type="text"
          value={focusLabel}
          onChange={(e) => setFocusLabel(e.target.value)}
          placeholder="z.B. Wurftechnik, Taktik, Regeneration"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" size="sm" onClick={onCancel}>Abbrechen</Button>
        <Button
          size="sm"
          onClick={() => {
            if (focusLabel && startDate && weekNumber) {
              onSave({ weekNumber, focusLabel, startDate })
            }
          }}
          disabled={!focusLabel || !startDate}
        >
          Speichern
        </Button>
      </div>
    </div>
  )
}
