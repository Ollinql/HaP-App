import { useApp } from '../store/AppContext'
import { DAY_KEYS, DAY_LABELS_FULL } from '../utils/dateUtils'
import { Card } from '../components/ui/Card'
import { GoalsSettings } from '../components/settings/GoalsSettings'
import { TagsSettings } from '../components/settings/TagsSettings'
import { BackgroundSettings } from '../components/settings/BackgroundSettings'
import { DataSettings } from '../components/settings/DataSettings'

export function SettingsPage() {
  const { settings, addGoal, removeGoal, addGlobalTag, removeGlobalTag, setTrainingDay } = useApp()

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Einstellungen</h1>
        <p className="text-sm text-muted">Trainingstage, Ziele und Tags konfigurieren</p>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-primary mb-4">Trainingstage</h2>
        <div className="space-y-3">
          {DAY_KEYS.map((day) => {
            const config = settings.trainingDays[day]
            return (
              <div key={day} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-32 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setTrainingDay(day, { enabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#4f7cf7]"
                  />
                  <span className="text-sm text-primary">{DAY_LABELS_FULL[day]}</span>
                </label>
                {config.enabled && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={config.duration}
                      onChange={(e) => setTrainingDay(day, { duration: Number(e.target.value) })}
                      min={15}
                      step={15}
                      className="w-20 bg-input border border-border rounded-lg px-2 py-1 text-sm text-primary outline-none focus:border-accent text-center"
                    />
                    <span className="text-xs text-muted">Min.</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <GoalsSettings
        goals={settings.trainingGoals}
        onAdd={addGoal}
        onRemove={removeGoal}
      />

      <TagsSettings
        globalTags={settings.globalTags}
        onAdd={addGlobalTag}
        onRemove={removeGlobalTag}
      />

      <BackgroundSettings />

      <DataSettings />
    </div>
  )
}
