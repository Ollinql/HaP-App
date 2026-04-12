import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const BG_STORAGE_KEY = 'htp_v1_bg_image'
const MAX_WIDTH = 1920
const JPEG_QUALITY = 0.75

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

export function BackgroundSettings() {
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [bgLoading, setBgLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={bgLoading}>
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
  )
}
