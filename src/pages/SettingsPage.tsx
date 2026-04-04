import { useState, useEffect, useRef } from 'react'
import { useApp } from '../store/AppContext'
import { DAY_KEYS, DAY_LABELS_FULL } from '../utils/dateUtils'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const BG_STORAGE_KEY = 'htp_v1_bg_image'
const MAX_WIDTH = 1920
const JPEG_QUALITY = 0.75
const DATA_KEYS = ['htp_v1_seasons', 'htp_v1_sessions', 'htp_v1_exercises', 'htp_v1_settings']

function handleExport() {
  const data: Record<string, unknown> = {
    version: 1,
    exportedAt: new Date().toISOString(),
  }
  DATA_KEYS.forEach((key) => {
    const val = localStorage.getItem(key)
    if (val) {
      try { data[key] = JSON.parse(val) } catch { /* skip corrupted */ }
    }
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hap-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function SettingsPage() {
  const { settings, addGoal, removeGoal, addGlobalTag, removeGlobalTag, setTrainingDay } = useApp()

  const [newGoal, setNewGoal] = useState('')
  const [newTag, setNewTag] = useState('')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [bgLoading, setBgLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  useEffect(() => {
    setBgImage(localStorage.getItem(BG_STORAGE_KEY))
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBgLoading(true)
    try {
      const compressed = await compressImage(file)
      localStorage.setItem(BG_STORAGE_KEY, compressed)
      setBgImage(compressed)
    } catch {
      alert('Das Bild konnte nicht geladen werden.')
    } finally {
      setBgLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveBg = () => {
    localStorage.removeItem(BG_STORAGE_KEY)
    setBgImage(null)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const restored = DATA_KEYS.filter((key) => data[key] !== undefined)
      if (restored.length === 0) {
        setImportError('Die Datei enthält keine gültigen Daten.')
        return
      }
      if (!confirm(`Backup vom ${data.exportedAt ? new Date(data.exportedAt).toLocaleDateString('de-DE') : 'unbekanntem Datum'} wiederherstellen? Aktuelle Daten werden überschrieben.`)) return
      restored.forEach((key) => localStorage.setItem(key, JSON.stringify(data[key])))
      window.location.reload()
    } catch {
      setImportError('Die Datei konnte nicht gelesen werden.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const handleAddGoal = () => {
    const trimmed = newGoal.trim()
    if (trimmed && !settings.trainingGoals.some((g) => g.text === trimmed)) {
      addGoal(trimmed)
      setNewGoal('')
    }
  }

  const handleAddTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !settings.globalTags.includes(trimmed)) {
      addGlobalTag(trimmed)
      setNewTag('')
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primary">Einstellungen</h1>
        <p className="text-sm text-muted">Trainingstage, Ziele und Tags konfigurieren</p>
      </div>

      {/* Training days */}
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

      {/* Training goals */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-4">Trainingsziele</h2>
        <div className="space-y-2 mb-3">
          {settings.trainingGoals.length === 0 && (
            <p className="text-xs text-muted">Noch keine Ziele definiert.</p>
          )}
          {settings.trainingGoals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-2 p-2 bg-elevated border border-border rounded-lg">
              <span className="flex-1 text-sm text-primary">{goal.text}</span>
              {goal.tag && (
                <span className="text-xs text-muted px-1.5 py-0.5 bg-surface border border-border rounded">
                  {goal.tag}
                </span>
              )}
              <button
                onClick={() => removeGoal(goal.id)}
                className="text-muted hover:text-red-400 text-sm transition-colors"
                aria-label={`Ziel "${goal.text}" entfernen`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddGoal() }}
            placeholder="Neues Ziel hinzufügen…"
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
          <Button size="sm" onClick={handleAddGoal} disabled={!newGoal.trim()}>
            Hinzufügen
          </Button>
        </div>
      </Card>

      {/* Global tags */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-4">Globale Tags</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.globalTags.length === 0 && (
            <p className="text-xs text-muted">Noch keine Tags definiert.</p>
          )}
          {settings.globalTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-elevated border border-border rounded-full text-xs text-muted"
            >
              {tag}
              <button
                onClick={() => removeGlobalTag(tag)}
                className="hover:text-red-400 transition-colors ml-0.5"
                aria-label={`Tag "${tag}" entfernen`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag() }}
            placeholder="Neuen Tag hinzufügen…"
            className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
          />
          <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
            Hinzufügen
          </Button>
        </div>
      </Card>

      {/* Background image */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-1">Dashboard-Hintergrundbild</h2>
        <p className="text-xs text-muted mb-4">
          Wähle ein eigenes Foto für den Dashboard-Hintergrund. Das Bild wird lokal im Browser
          gespeichert — bei einem anderen Gerät oder Browser muss es erneut ausgewählt werden.
        </p>

        {bgImage && (
          <div className="mb-3">
            <img
              src={bgImage}
              alt="Aktuelles Hintergrundbild"
              className="w-full h-28 object-cover rounded-lg border border-border opacity-80"
            />
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {/* Hidden file input — accept="image/*" öffnet auf iOS die Fotos-Auswahl */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={bgLoading}
          >
            {bgLoading ? 'Wird geladen…' : bgImage ? 'Bild ersetzen' : 'Bild auswählen'}
          </Button>
          {bgImage && (
            <button
              onClick={handleRemoveBg}
              className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              Zurücksetzen
            </button>
          )}
        </div>
      </Card>

      {/* Backup / Restore */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-1">Backup & Wiederherstellen</h2>
        <p className="text-xs text-muted mb-4">
          Exportiere alle Daten als JSON-Datei und speichere sie z.B. in einem eigenen Ordner in iCloud Drive.
          So bleiben deine Daten sicher — auch wenn der Browser-Cache geleert wird.
          Das Hintergrundbild ist nicht im Backup enthalten.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handleExport}>Backup exportieren</Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => { setImportError(null); importRef.current?.click() }}
            className="text-xs text-muted hover:text-primary border border-border hover:border-accent px-3 py-1.5 rounded-lg transition-colors"
          >
            Backup importieren
          </button>
        </div>
        {importError && (
          <p className="text-xs text-red-400 mt-2">{importError}</p>
        )}
      </Card>

      {/* Danger zone */}
      <Card>
        <h2 className="text-sm font-semibold text-red-400 mb-3">Daten</h2>
        <p className="text-xs text-muted mb-3">
          Alle Daten werden lokal im Browser gespeichert (localStorage).
        </p>
        <button
          onClick={() => {
            if (confirm('Alle Daten wirklich löschen? Dies kann nicht rückgängig gemacht werden!')) {
              ['htp_v1_seasons', 'htp_v1_sessions', 'htp_v1_exercises', 'htp_v1_settings'].forEach((k) =>
                localStorage.removeItem(k),
              )
              window.location.reload()
            }
          }}
          className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Alle Daten löschen
        </button>
      </Card>
    </div>
  )
}
