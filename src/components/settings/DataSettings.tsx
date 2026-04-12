import { useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

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

export function DataSettings() {
  const importRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

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

  return (
    <>
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
        {importError && <p className="text-xs text-red-400 mt-2">{importError}</p>}
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-red-400 mb-3">Daten</h2>
        <p className="text-xs text-muted mb-3">
          Alle Daten werden lokal im Browser gespeichert (localStorage).
        </p>
        <button
          onClick={() => {
            if (confirm('Alle Daten wirklich löschen? Dies kann nicht rückgängig gemacht werden!')) {
              DATA_KEYS.forEach((k) => localStorage.removeItem(k))
              window.location.reload()
            }
          }}
          className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Alle Daten löschen
        </button>
      </Card>
    </>
  )
}
