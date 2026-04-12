import type { TrainingSession } from '../../types'
import type { Phase } from '../../types'
import { TagInput } from '../ui/TagInput'
import { IntensityPicker } from '../ui/IntensityPicker'

interface Props {
  session: TrainingSession
  allPhases: Phase[]
  globalTags: string[]
  onChange: <K extends keyof TrainingSession>(key: K, value: TrainingSession[K]) => void
}

export function SessionMetaForm({ session, allPhases, globalTags, onChange }: Props) {
  return (
    <>
      {/* Title */}
      <div>
        <label className="block text-xs text-muted mb-1">Titel</label>
        <input
          type="text"
          value={session.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Trainingsziel: …"
          className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-primary outline-none focus:border-accent"
        />
      </div>

      {/* Date + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Datum</label>
          <input
            type="date"
            value={session.date}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Dauer (Min.)</label>
          <input
            type="number"
            value={session.duration}
            onChange={(e) => onChange('duration', Number(e.target.value))}
            min={15}
            step={15}
            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Phase */}
      <div>
        <label className="block text-xs text-muted mb-1">Phase</label>
        <select
          value={session.phaseId ?? ''}
          onChange={(e) => onChange('phaseId', e.target.value || null)}
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        >
          <option value="">Keine Phase</option>
          {allPhases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type} – {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-muted mb-1">Tags</label>
        <TagInput
          tags={session.tags}
          onChange={(tags) => onChange('tags', tags)}
          suggestions={globalTags}
        />
      </div>

      {/* Intensity */}
      <IntensityPicker
        value={session.intensityRating}
        onChange={(v) => onChange('intensityRating', v)}
        label="Intensität (geplant)"
      />
    </>
  )
}
