import { useState } from 'react'
import { WeekCalendar } from '../components/dashboard/WeekCalendar'
import { MicrocycleBanner } from '../components/dashboard/MicrocycleBanner'
import { GoalsList } from '../components/dashboard/GoalsList'
import { DayDetailPanel } from '../components/dashboard/DayDetailPanel'
import { PageBackground } from '../components/ui/PageBackground'
import { toISODate } from '../utils/dateUtils'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(toISODate(new Date()))

  const handleDaySelect = (dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
  }

  const today = new Date()
  const dateLabel = today.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="relative min-h-full">
      <PageBackground />

      <div className="relative z-10 p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
        {/* Bold Athletic Header */}
        <div className="pt-1">
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{dateLabel}</p>
          <h1
            className="text-3xl font-black text-primary leading-none tracking-tight"
            style={{ letterSpacing: '-0.04em', fontStyle: 'italic' }}
          >
            DASHBOARD
          </h1>
        </div>

        <MicrocycleBanner />

        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4">
          <WeekCalendar onDaySelect={handleDaySelect} selectedDate={selectedDate} />
        </div>

        {selectedDate && (
          <DayDetailPanel date={selectedDate} onClose={() => setSelectedDate(null)} />
        )}

        <GoalsList />
      </div>
    </div>
  )
}
