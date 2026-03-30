import type { IntensityLevel } from '../../types'
import { INTENSITY_COLORS, INTENSITY_LABELS } from '../../utils/colorUtils'

interface IntensityPickerProps {
  value: IntensityLevel | null
  onChange: (level: IntensityLevel) => void
  label?: string
}

const LEVELS: IntensityLevel[] = [1, 2, 3, 4, 5]

export function IntensityPicker({ value, onChange, label }: IntensityPickerProps) {
  return (
    <div className="space-y-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <div className="flex items-center gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            title={INTENSITY_LABELS[level]}
            aria-label={`Intensität ${level}: ${INTENSITY_LABELS[level]}`}
            className={[
              'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white',
              'transition-all duration-150',
              INTENSITY_COLORS[level],
              value === level
                ? 'ring-2 ring-white ring-offset-2 ring-offset-base scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-105',
            ].join(' ')}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  )
}
