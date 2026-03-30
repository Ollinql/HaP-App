import type { IntensityLevel } from '../types'

export const INTENSITY_COLORS: Record<IntensityLevel, string> = {
  1: 'bg-green-500',
  2: 'bg-lime-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
}

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  1: 'Sehr leicht',
  2: 'Leicht',
  3: 'Mittel',
  4: 'Schwer',
  5: 'Sehr schwer',
}

export function getIntensityColor(level: IntensityLevel): string {
  return INTENSITY_COLORS[level]
}

export const PHASE_COLORS = {
  Vorbereitung: 'bg-blue-600 text-white',
  Wettkampf: 'bg-red-600 text-white',
  Pause: 'bg-gray-600 text-white',
} as const
