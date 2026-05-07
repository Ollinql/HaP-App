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
        'flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl border transition-all duration-150 w-full min-h-[60px] sm:min-h-[72px]',
        isSelected
          ? 'border-accent bg-accent/10'
          : isToday
          ? 'border-accent/50 bg-accent/5'
          : 'border-border hover:border-accent/30 hover:bg-elevated',
        !isTrainingDay && !session ? 'opacity-35' : '',
      ].join(' ')}
    >
      <span
        className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
          isToday || isSelected ? 'text-accent' : 'text-muted'
        }`}
      >
        {dayLabels[dayIndex]}
      </span>
      <span
        className={`text-sm sm:text-base font-black ${
          isToday || isSelected ? 'text-accent' : 'text-primary'
        }`}
        style={{ letterSpacing: '-0.02em' }}
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
          <span className="hidden sm:block text-[9px] text-secondary text-center line-clamp-2 leading-tight w-full px-0.5 font-medium">
            {session.title || 'Training'}
          </span>
          {isPast && !session.postTrainingFeedback && (
            <span className="hidden sm:block text-[8px] text-orange-400 font-bold tracking-wider">
              FB
            </span>
          )}
        </div>
      )}
    </button>
  )
})
