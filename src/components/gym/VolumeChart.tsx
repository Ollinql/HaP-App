import type { GymWorkout } from '../../types/gym'
import { fromISODate } from '../../utils/dateUtils'

interface Props {
  workouts: GymWorkout[]
  exerciseId: string
}

interface DataPoint {
  date: string
  volume: number
}

export function VolumeChart({ workouts, exerciseId }: Props) {
  const data: DataPoint[] = []

  const sorted = [...workouts]
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => a.date.localeCompare(b.date))

  for (const workout of sorted) {
    const ex = workout.exercises.find((e) => e.exerciseId === exerciseId)
    if (!ex || ex.sets.length === 0) continue
    const volume = ex.sets.reduce((sum, s) => sum + s.reps * s.weight, 0)
    data.push({ date: workout.date, volume })
  }

  if (data.length < 2) return null

  const W = 340
  const H = 100
  const PAD = { top: 10, right: 12, bottom: 24, left: 44 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.map((d) => d.volume))
  const minVal = 0

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW
  const toY = (v: number) => PAD.top + chartH - (v / (maxVal || 1)) * chartH

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.volume)}`).join(' ')

  const yLabel = Math.round(maxVal)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" fontSize={8} fill="var(--color-muted)">
        {yLabel}
      </text>
      <text x={PAD.left - 6} y={PAD.top + chartH + 4} textAnchor="end" fontSize={8} fill="var(--color-muted)">
        {minVal}
      </text>
      <line x1={PAD.left} y1={PAD.top} x2={W - PAD.right} y2={PAD.top} stroke="var(--color-border)" strokeWidth={0.8} />
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="var(--color-border)" strokeWidth={0.8} />

      <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeOpacity={0.8} strokeLinejoin="round" strokeDasharray="4 2" />

      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.volume)} r={3} fill="var(--color-accent)" fillOpacity={0.9} />
      ))}

      {data.map((d, i) => {
        if (data.length > 4 && i % 2 !== 0) return null
        const date = fromISODate(d.date)
        const label = `${date.getDate()}.${date.getMonth() + 1}.`
        return (
          <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fontSize={8} fill="var(--color-muted)">
            {label}
          </text>
        )
      })}
    </svg>
  )
}
