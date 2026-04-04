import { useState } from 'react'
import { WeekCalendar } from '../components/dashboard/WeekCalendar'
import { MicrocycleBanner } from '../components/dashboard/MicrocycleBanner'
import { GoalsList } from '../components/dashboard/GoalsList'
import { DayDetailPanel } from '../components/dashboard/DayDetailPanel'
import { PageBackground } from '../components/ui/PageBackground'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const handleDaySelect = (dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr))
  }

  return (
    <div className="relative min-h-full">
      <PageBackground />

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted">Aktuelle Trainingswoche</p>
        </div>

        <MicrocycleBanner />
        <WeekCalendar onDaySelect={handleDaySelect} selectedDate={selectedDate} />
        {selectedDate && (
          <DayDetailPanel date={selectedDate} onClose={() => setSelectedDate(null)} />
        )}
        <GoalsList />
      </div>
    </div>
  )
}
