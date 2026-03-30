import { useRef, useState, useEffect, useCallback } from 'react'
import { HandballCourtSVG } from './HandballCourtSVG'
import { ColorPalette } from './ColorPalette'

interface DrawingCanvasProps {
  drawingData?: string // existing base64 PNG to preload
  onSave?: (data: string) => void
  readOnly?: boolean
}

export function DrawingCanvas({ drawingData, onSave, readOnly = false }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const [activeColor, setActiveColor] = useState('#ffffff')
  const [isEraser, setIsEraser] = useState(false)

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null

  // Load existing drawing on mount
  useEffect(() => {
    if (!drawingData) return
    const ctx = getCtx()
    if (!ctx) return
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height)
    img.src = drawingData
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep canvas pixel dimensions in sync with DOM size
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Save current drawing
      let imageData: ImageData | null = null
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        } catch {
          // ignore
        }
      }

      canvas.width = Math.round(width)
      canvas.height = Math.round(height)

      // Restore drawing
      if (imageData) {
        ctx.putImageData(imageData, 0, 0)
      }
    })

    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  const getCanvasPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (readOnly) return
      isDrawing.current = true
      const pos = getCanvasPos(e)
      lastPos.current = pos
      const ctx = getCtx()
      if (!ctx) return
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over'
      ctx.lineWidth = isEraser ? 20 : 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : activeColor
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [readOnly, getCanvasPos, isEraser, activeColor],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || readOnly) return
      const pos = getCanvasPos(e)
      const ctx = getCtx()
      if (!ctx) return
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastPos.current = pos
    },
    [readOnly, getCanvasPos],
  )

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false
    lastPos.current = null
    const ctx = getCtx()
    if (ctx) ctx.globalCompositeOperation = 'source-over'
  }, [])

  const handleColorChange = (color: string) => {
    setActiveColor(color)
    setIsEraser(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    if (!ctx || !canvas) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !onSave) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-border">
      {/* Canvas area */}
      <div
        ref={wrapperRef}
        className="relative bg-[#1a2e1a] aspect-[3/4] w-full"
        style={{ maxHeight: '480px' }}
      >
        <HandballCourtSVG />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: 'none', cursor: readOnly ? 'default' : (isEraser ? 'cell' : 'crosshair') }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <ColorPalette
          activeColor={activeColor}
          onColorChange={handleColorChange}
          isEraser={isEraser}
          onEraserToggle={() => setIsEraser((e) => !e)}
          onClear={handleClear}
        />
      )}

      {/* Save button */}
      {!readOnly && onSave && (
        <div className="flex justify-end px-3 py-2 bg-elevated border-t border-border">
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-md font-medium transition-colors"
          >
            Zeichnung speichern
          </button>
        </div>
      )}
    </div>
  )
}
