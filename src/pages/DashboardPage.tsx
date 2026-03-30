import { WeekCalendar } from '../components/dashboard/WeekCalendar'
import { MicrocycleBanner } from '../components/dashboard/MicrocycleBanner'
import { GoalsList } from '../components/dashboard/GoalsList'

export function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-muted">Aktuelle Trainingswoche</p>
      </div>

      <MicrocycleBanner />
      <WeekCalendar />
      <GoalsList />
    </div>
  )
}
