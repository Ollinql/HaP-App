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
    <div className="space-y-2">
      {label && <span className="text-xs text-muted font-medium">{label}</span>}
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
                ? 'ring-2 ring-white ring-offset-2 ring-offset-base scale-110 shadow-md'
                : 'opacity-50 hover:opacity-90 hover:scale-105',
            ].join(' ')}
          >
            {level}
          </button>
        ))}
        {value && (
          <span className="text-xs text-secondary ml-1">{INTENSITY_LABELS[value]}</span>
        )}
      </div>
    </div>
  )
}
