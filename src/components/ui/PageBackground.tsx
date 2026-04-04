import { useState, useEffect } from 'react'

const BG_STORAGE_KEY = 'htp_v1_bg_image'

export function PageBackground() {
  const [bgImage, setBgImage] = useState<string | null>(null)

  useEffect(() => {
    setBgImage(localStorage.getItem(BG_STORAGE_KEY))
    const onStorage = (e: StorageEvent) => {
      if (e.key === BG_STORAGE_KEY) setBgImage(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (!bgImage) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        opacity: 0.1,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
