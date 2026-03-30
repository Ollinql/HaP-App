import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { ColorPalette } from './ColorPalette'

type FieldType = 'half' | 'full'

interface DrawingCanvasProps {
  drawingData?: string
  onSave?: (data: string) => void
  readOnly?: boolean
}

export function DrawingCanvas({ onSave, readOnly = false }: DrawingCanvasProps) {
  const [fieldType, setFieldType] = useState<FieldType>('half')
  const [activeColor, setActiveColor] = useState('#ffffff')
  const [isEraser, setIsEraser] = useState(false)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)

  type DrawnLine = { points: number[]; color: string; eraser: boolean; width: number }

  const isDrawing = useRef(false)
  const [lines, setLines] = useState<DrawnLine[]>([])
  const linesRef = useRef<DrawnLine[]>([])

  const syncLines = (next: DrawnLine[]) => {
    linesRef.current = next
    setLines(next)
  }

  // Observe container size, matching the background image dimensions
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setStageSize({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Clear drawing when switching field type
  useEffect(() => { syncLines([]) }, [fieldType])

  const courtImage = fieldType === 'half' ? '/courts/half-court.png' : '/courts/full-court.png'

  const handleMouseDown = (e: any) => {
    if (readOnly) return
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    syncLines([...linesRef.current, {
      points: [pos.x, pos.y],
      color: activeColor,
      eraser: isEraser,
      width: isEraser ? 20 : 3,
    }])
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || readOnly) return
    const pos = e.target.getStage().getPointerPosition()
    const all = linesRef.current
    const last = all[all.length - 1]
    if (!last) return
    syncLines([...all.slice(0, -1), { ...last, points: [...last.points, pos.x, pos.y] }])
  }

  const handleMouseUp = () => { isDrawing.current = false }

  const handleColorChange = (color: string) => {
    setActiveColor(color)
    setIsEraser(false)
  }

  const handleSave = () => {
    if (!stageRef.current || !onSave) return
    onSave(stageRef.current.toDataURL({ mimeType: 'image/png' }))
  }

  const cursor = readOnly ? 'default' : isEraser ? 'cell' : 'crosshair'

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-border">
      {/* Field type selector */}
      <div className="flex gap-2 px-3 py-2 bg-elevated border-b border-border">
        <button
          type="button"
          onClick={() => setFieldType('half')}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            fieldType === 'half'
              ? 'bg-accent text-white'
              : 'bg-surface text-muted hover:text-primary hover:bg-hover'
          }`}
        >
          Halbfeld
        </button>
        <button
          type="button"
          onClick={() => setFieldType('full')}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            fieldType === 'full'
              ? 'bg-accent text-white'
              : 'bg-surface text-muted hover:text-primary hover:bg-hover'
          }`}
        >
          Ganzes Feld
        </button>
      </div>

      {/* Canvas area: court image drives height, Konva Stage overlaid on top */}
      <div ref={containerRef} className="relative w-full" style={{ cursor }}>
        <img
          src={courtImage}
          alt=""
          className="w-full block"
          style={{ objectFit: 'contain' }}
        />
        {stageSize.w > 0 && (
          <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            style={{ position: 'absolute', inset: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.eraser ? 'rgba(0,0,0,1)' : line.color}
                  strokeWidth={line.width}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={line.eraser ? 'destination-out' : 'source-over'}
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <ColorPalette
          activeColor={activeColor}
          onColorChange={handleColorChange}
          isEraser={isEraser}
          onEraserToggle={() => setIsEraser(e => !e)}
          onClear={() => syncLines([])}
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
