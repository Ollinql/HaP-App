import { useNavigate } from 'react-router-dom'
import { useApp } from '../../store/AppContext'
import type { TrainingSession } from '../../types'
import { toISODate, getDayKey } from '../../utils/dateUtils'
import { getIntensityColor } from '../../utils/colorUtils'

interface DayCellProps {
  date: Date
}

export function DayCell({ date }: DayCellProps) {
  const navigate = useNavigate()
  const { sessions, settings } = useApp()

  const dateStr = toISODate(date)
  const dayKey = getDayKey(date)
  const dayConfig = settings.trainingDays[dayKey]
  const isTrainingDay = dayConfig?.enabled ?? false

  const session: TrainingSession | undefined = sessions.find((s) => s.date === dateStr)
  const todayStr = toISODate(new Date())
  const isToday = dateStr === todayStr
  const isPast = dateStr < todayStr

  const handleClick = () => {
    if (session) {
      navigate(`/sessions/${session.id}`)
    } else {
      navigate(`/sessions/new?date=${dateStr}`)
    }
  }

  const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-left w-full',
        isToday
          ? 'border-accent bg-accent/10 ring-1 ring-accent'
          : 'border-border hover:border-accent/50 hover:bg-elevated',
        !isTrainingDay && !session ? 'opacity-50' : '',
      ].join(' ')}
    >
      <span className={`text-xs font-medium ${isToday ? 'text-accent' : 'text-muted'}`}>
        {dayLabels[dayIndex]}
      </span>
      <span className={`text-base font-bold ${isToday ? 'text-accent' : 'text-primary'}`}>
        {date.getDate()}
      </span>

      {/* Training day indicator */}
      {isTrainingDay && !session && (
        <span className="w-1.5 h-1.5 rounded-full bg-border" title="Trainingstag" />
      )}

      {/* Session indicator */}
      {session && (
        <div className="flex flex-col items-center gap-1 w-full">
          {session.intensityRating && (
            <span
              className={`w-2.5 h-2.5 rounded-full ${getIntensityColor(session.intensityRating)}`}
              title={`Intensität ${session.intensityRating}`}
            />
          )}
          <span className="text-[10px] text-primary text-center line-clamp-2 leading-tight">
            {session.title || 'Training'}
          </span>
          {isPast && !session.postTrainingFeedback && (
            <span className="text-[9px] text-orange-400">● Feedback</span>
          )}
        </div>
      )}
    </button>
  )
}
