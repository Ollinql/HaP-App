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

  return (
    <div className="relative min-h-full">
      <PageBackground />

      <div className="relative z-10 p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-primary">Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">Aktuelle Trainingswoche</p>
        </div>

        <MicrocycleBanner />

        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-sm">
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
