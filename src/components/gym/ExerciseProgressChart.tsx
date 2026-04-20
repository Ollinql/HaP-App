import type { GymWorkout } from '../../types/gym'
import { fromISODate } from '../../utils/dateUtils'

interface Props {
  workouts: GymWorkout[]
  exerciseId: string
  unit: string
}

interface DataPoint {
  date: string
  maxWeight: number
  isPR: boolean
}

export function ExerciseProgressChart({ workouts, exerciseId, unit }: Props) {
  const data: DataPoint[] = []
  let allTimePR = 0

  const sorted = [...workouts]
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => a.date.localeCompare(b.date))

  for (const workout of sorted) {
    const ex = workout.exercises.find((e) => e.exerciseId === exerciseId)
    if (!ex || ex.sets.length === 0) continue
    const maxWeight = Math.max(...ex.sets.map((s) => s.weight))
    const isPR = maxWeight > allTimePR
    if (isPR) allTimePR = maxWeight
    data.push({ date: workout.date, maxWeight, isPR })
  }

  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-muted text-sm">
        Noch keine Daten
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="h-32 flex items-center justify-center text-muted text-sm">
        Mindestens 2 Einträge für Chart benötigt
      </div>
    )
  }

  const W = 340
  const H = 140
  const PAD = { top: 12, right: 12, bottom: 28, left: 44 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.map((d) => d.maxWeight))
  const minVal = Math.min(...data.map((d) => d.maxWeight))
  const range = maxVal - minVal || 1

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / range) * chartH

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.maxWeight)}`).join(' ')

  const yTicks = 3
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const v = minVal + (range / (yTicks - 1)) * i
    return { v: Math.round(v * 10) / 10, y: toY(v) }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      {/* Y-axis labels */}
      {yLabels.map(({ v, y }) => (
        <text key={v} x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="var(--color-muted)">
          {v}
        </text>
      ))}

      {/* Y-axis gridlines */}
      {yLabels.map(({ v, y }) => (
        <line key={v} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--color-border)" strokeWidth={0.8} />
      ))}

      {/* Line */}
      <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(d.maxWeight)}
          r={d.isPR ? 4.5 : 3.5}
          fill={d.isPR ? '#f59e0b' : 'var(--color-accent)'}
          stroke="var(--color-surface)"
          strokeWidth={1.5}
        />
      ))}

      {/* X-axis date labels (every other to avoid crowding) */}
      {data.map((d, i) => {
        if (data.length > 4 && i % 2 !== 0) return null
        const date = fromISODate(d.date)
        const label = `${date.getDate()}.${date.getMonth() + 1}.`
        return (
          <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize={8} fill="var(--color-muted)">
            {label}
          </text>
        )
      })}

      {/* Unit label */}
      <text x={PAD.left - 6} y={PAD.top - 2} textAnchor="end" fontSize={8} fill="var(--color-muted)">
        {unit}
      </text>
    </svg>
  )
}
