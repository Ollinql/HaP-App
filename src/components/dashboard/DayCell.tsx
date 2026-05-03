import { memo } from 'react'
import { useApp } from '../../store/AppContext'
import type { TrainingSession } from '../../types'
import { toISODate, getDayKey } from '../../utils/dateUtils'
import { getIntensityColor } from '../../utils/colorUtils'

interface DayCellProps {
  date: Date
  onSelect: (dateStr: string) => void
  isSelected?: boolean
}

export const DayCell = memo(function DayCell({ date, onSelect, isSelected }: DayCellProps) {
  const { sessions, settings } = useApp()

  const dateStr = toISODate(date)
  const dayKey = getDayKey(date)
  const dayConfig = settings.trainingDays[dayKey]
  const isTrainingDay = dayConfig?.enabled ?? false

  const session: TrainingSession | undefined = sessions.find((s) => s.date === dateStr)
  const todayStr = toISODate(new Date())
  const isToday = dateStr === todayStr
  const isPast = dateStr < todayStr

  const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1

  return (
    <button
      type="button"
      onClick={() => onSelect(dateStr)}
      className={[
        'flex flex-col items-center gap-1 p-1.5 sm:p-2.5 rounded-xl border transition-all duration-150 w-full min-h-[64px] sm:min-h-[76px]',
        isToday
          ? 'border-accent bg-accent/10 ring-1 ring-accent/60'
          : isSelected
          ? 'border-accent/60 bg-elevated ring-1 ring-accent/40'
          : 'border-border hover:border-accent/40 hover:bg-elevated/70',
        !isTrainingDay && !session ? 'opacity-40' : '',
      ].join(' ')}
    >
      <span
        className={`text-[10px] sm:text-xs font-medium ${isToday ? 'text-accent' : 'text-muted'}`}
      >
        {dayLabels[dayIndex]}
      </span>
      <span
        className={`text-sm sm:text-base font-bold ${isToday ? 'text-accent' : 'text-primary'}`}
      >
        {date.getDate()}
      </span>

      {isTrainingDay && !session && (
        <span className="w-1.5 h-1.5 rounded-full bg-border" title="Trainingstag" />
      )}

      {session && (
        <div className="flex flex-col items-center gap-0.5 w-full">
          {session.intensityRating && (
            <span
              className={`w-2 h-2 rounded-full ${getIntensityColor(session.intensityRating)}`}
              title={`Intensität ${session.intensityRating}`}
            />
          )}
          <span className="hidden sm:block text-[9px] text-primary text-center line-clamp-2 leading-tight w-full px-0.5">
            {session.title || 'Training'}
          </span>
          {isPast && !session.postTrainingFeedback && (
            <span className="hidden sm:block text-[8px] text-orange-400 font-medium">● FB</span>
          )}
        </div>
      )}
    </button>
  )
})
