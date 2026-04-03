import { useState } from 'react'
import { getWeekDays, offsetWeek, getISOWeek } from '../../utils/dateUtils'
import { DayCell } from './DayCell'

interface WeekCalendarProps {
  onDaySelect: (dateStr: string) => void
  selectedDate?: string | null
}

export function WeekCalendar({ onDaySelect, selectedDate }: WeekCalendarProps) {
  const [referenceDate, setReferenceDate] = useState(new Date())
  const days = getWeekDays(referenceDate)
  const weekNum = getISOWeek(days[0])

  return (
    <div className="space-y-3">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setReferenceDate((d) => offsetWeek(d, -1))}
          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-elevated transition-colors"
          aria-label="Vorherige Woche"
        >
          ‹
        </button>
        <div className="text-center">
          <span className="text-sm font-semibold text-primary">Kalenderwoche {weekNum}</span>
          <p className="text-xs text-muted">
            {days[0].toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} –{' '}
            {days[6].toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReferenceDate((d) => offsetWeek(d, 1))}
          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-elevated transition-colors"
          aria-label="Nächste Woche"
        >
          ›
        </button>
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              onSelect={onDaySelect}
              isSelected={selectedDate === iso}
            />
          )
        })}
      </div>
    </div>
  )
}
