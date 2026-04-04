import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Arrow, RegularPolygon, Circle, Text as KonvaText, Transformer, Image as KonvaImage } from 'react-konva'

type FieldType = 'half' | 'full'

type ToolType =
  | 'kleiner-kegel'
  | 'grosser-kegel'
  | 'dreieck'
  | 'kreis'
  | 'text'
  | 'stift'
  | 'pfeil'
  | 'gestrichelter-pfeil'
  | 'radierer'

const COLORS = [
  { value: '#e63946', label: 'Rot' },
  { value: '#1d6fa4', label: 'Blau' },
  { value: '#000000', label: 'Schwarz' },
  { value: '#f4a261', label: 'Gelb' },
]

const CONE_COLOR = '#f97316'

interface BaseEl { id: string }
interface KleinerKegelEl extends BaseEl { type: 'kleiner-kegel'; x: number; y: number; scaleX?: number; scaleY?: number; rotation?: number }
interface GrosserKegelEl extends BaseEl { type: 'grosser-kegel'; x: number; y: number; scaleX?: number; scaleY?: number; rotation?: number }
interface DreieckEl extends BaseEl { type: 'dreieck'; x: number; y: number; color: string; scaleX?: number; scaleY?: number; rotation?: number }
interface KreisEl extends BaseEl { type: 'kreis'; x: number; y: number; color: string; scaleX?: number; scaleY?: number; rotation?: number }
interface TextEl extends BaseEl { type: 'text'; x: number; y: number; text: string; color: string; scaleX?: number; scaleY?: number; rotation?: number }
interface StiftEl extends BaseEl { type: 'stift'; points: number[]; color: string }
interface PfeilEl extends BaseEl { type: 'pfeil'; points: number[]; color: string }
interface GestricheltPfeilEl extends BaseEl { type: 'gestrichelter-pfeil'; points: number[]; color: string }

type CanvasElement =
  | KleinerKegelEl | GrosserKegelEl | DreieckEl | KreisEl | TextEl
  | StiftEl | PfeilEl | GestricheltPfeilEl

function uid() { return Math.random().toString(36).slice(2, 10) }

interface DrawingCanvasProps {
  drawingData?: string          // PNG data URL — nur für readOnly-Anzeige
  drawingElements?: string      // JSON.stringify(CanvasElement[]) — Seed für Bearbeitung
  onSave?: (pngDataUrl: string, elementsJson: string) => void
  readOnly?: boolean
}

const SHAPE_TOOLS: ToolType[] = ['kleiner-kegel', 'grosser-kegel', 'dreieck', 'kreis', 'text']
const DRAW_TOOLS: ToolType[] = ['stift', 'pfeil', 'gestrichelter-pfeil']
const UNIFORM_SCALE_TYPES = ['kleiner-kegel', 'grosser-kegel', 'kreis']
const TRANSFORMABLE_TYPES = ['kleiner-kegel', 'grosser-kegel', 'dreieck', 'kreis', 'text']

export function DrawingCanvas({ drawingData, drawingElements, onSave, readOnly = false }: DrawingCanvasProps) {
  const [fieldType, setFieldType] = useState<FieldType>('half')
  const [activeTool, setActiveTool] = useState<ToolType>('stift')
  const [activeColor, setActiveColor] = useState('#000000')
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [courtImg, setCourtImg] = useState<HTMLImageElement | null>(null)
  const [editingText, setEditingText] = useState<{
    id: string; x: number; y: number; text: string; color: string
  } | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [zoomState, setZoomState] = useState({ scale: 1, x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const isDrawing = useRef(false)
  const elementsRef = useRef<CanvasElement[]>([])
  const zoomRef = useRef({ scale: 1, x: 0, y: 0 })
  const lastDist = useRef(0)
  const isPinching = useRef(false)

  const syncElements = (next: CanvasElement[]) => {
    elementsRef.current = next
    setElements(next)
  }

  const applyZoom = (z: { scale: number; x: number; y: number }) => {
    zoomRef.current = z
    setZoomState(z)
  }

  // Elemente aus drawingElements laden (JSON-Array für Weiterbearbeitung)
  useEffect(() => {
    if (drawingElements) {
      try { syncElements(JSON.parse(drawingElements)) } catch { /* ignore */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Container-Größe beobachten
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setStageSize({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Feldtyp-Wechsel leert Canvas und resettet Zoom
  useEffect(() => {
    syncElements([])
    detachTransformer()
    setSelectedId(null)
    applyZoom({ scale: 1, x: 0, y: 0 })
  }, [fieldType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Draw-Tool deselektiert Transformer
  useEffect(() => {
    if (DRAW_TOOLS.includes(activeTool)) {
      detachTransformer()
      setSelectedId(null)
    }
  }, [activeTool]) // eslint-disable-line react-hooks/exhaustive-deps

  // Touch-Scroll nur verhindern wenn editMode aktiv
  useEffect(() => {
    if (readOnly || !editMode) return
    const el = containerRef.current
    if (!el) return
    const prevent = (e: TouchEvent) => e.preventDefault()
    el.addEventListener('touchmove', prevent, { passive: false })
    el.addEventListener('touchstart', prevent, { passive: false })
    return () => {
      el.removeEventListener('touchmove', prevent)
      el.removeEventListener('touchstart', prevent)
    }
  }, [readOnly, editMode])

  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const courtImage = fieldType === 'half' ? `${base}/courts/half-court.png` : `${base}/courts/full-court.png`

  // Hintergrundbild als Konva-Node laden (wird in toDataURL() erfasst)
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = courtImage
    img.onload = () => setCourtImg(img)
    setCourtImg(null) // Reset während Laden
  }, [courtImage])

  const detachTransformer = () => {
    if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }

  // getPos berücksichtigt Zoom-Offset und Scale
  const getPos = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition()
    if (!pos) return null
    const { scale, x, y } = zoomRef.current
    return { x: (pos.x - x) / scale, y: (pos.y - y) / scale }
  }

  const handleMouseDown = (e: any) => {
    if (readOnly || !DRAW_TOOLS.includes(activeTool)) return
    if (!editMode) return
    const pos = getPos(e)
    if (!pos) return
    isDrawing.current = true
    const id = uid()
    let newEl: CanvasElement
    if (activeTool === 'stift') {
      newEl = { id, type: 'stift', points: [pos.x, pos.y], color: activeColor }
    } else if (activeTool === 'pfeil') {
      newEl = { id, type: 'pfeil', points: [pos.x, pos.y, pos.x + 0.1, pos.y + 0.1], color: activeColor }
    } else {
      newEl = { id, type: 'gestrichelter-pfeil', points: [pos.x, pos.y, pos.x + 0.1, pos.y + 0.1], color: activeColor }
    }
    syncElements([...elementsRef.current, newEl])
  }

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || readOnly) return
    const pos = getPos(e)
    if (!pos) return
    const all = elementsRef.current
    const last = all[all.length - 1]
    if (!last) return
    if (last.type === 'stift') {
      syncElements([...all.slice(0, -1), { ...last, points: [...last.points, pos.x, pos.y] }])
    } else if (last.type === 'pfeil' || last.type === 'gestrichelter-pfeil') {
      const [x1, y1] = last.points
      syncElements([...all.slice(0, -1), { ...last, points: [x1, y1, pos.x, pos.y] }])
    }
  }

  const handleMouseUp = () => { isDrawing.current = false }

  // Touch-Handler mit Pinch-Zoom-Unterstützung
  const handleTouchStart = (e: any) => {
    if (!editMode) return
    const t = (e.evt as TouchEvent).touches
    if (t.length === 2) {
      isPinching.current = true
      isDrawing.current = false
      lastDist.current = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY)
    } else if (t.length === 1 && !isPinching.current) {
      handleMouseDown(e)
    }
  }

  const handleTouchMove = (e: any) => {
    if (!editMode) return
    const t = (e.evt as TouchEvent).touches
    if (isPinching.current && t.length === 2) {
      const newDist = Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY)
      const ratio = newDist / lastDist.current
      const rect = stageRef.current.container().getBoundingClientRect()
      const cx = (t[0].clientX + t[1].clientX) / 2 - rect.left
      const cy = (t[0].clientY + t[1].clientY) / 2 - rect.top
      const { scale: old, x: ox, y: oy } = zoomRef.current
      const newScale = Math.max(0.5, Math.min(6, old * ratio))
      applyZoom({
        scale: newScale,
        x: cx - (cx - ox) * (newScale / old),
        y: cy - (cy - oy) * (newScale / old),
      })
      lastDist.current = newDist
    } else if (!isPinching.current) {
      handleMouseMove(e)
    }
  }

  const handleTouchEnd = (e: any) => {
    if ((e.evt as TouchEvent).touches.length < 2) isPinching.current = false
    handleMouseUp()
  }

  const handleStageClick = (e: any) => {
    if (e.target === stageRef.current) {
      setSelectedId(null)
      detachTransformer()
    }
    if (readOnly || !SHAPE_TOOLS.includes(activeTool)) return
    if (!editMode) return
    if (e.target !== stageRef.current) return
    const pos = getPos(e)
    if (!pos) return
    const id = uid()
    let newEl: CanvasElement | null = null
    switch (activeTool) {
      case 'kleiner-kegel': newEl = { id, type: 'kleiner-kegel', x: pos.x, y: pos.y }; break
      case 'grosser-kegel': newEl = { id, type: 'grosser-kegel', x: pos.x, y: pos.y }; break
      case 'dreieck': newEl = { id, type: 'dreieck', x: pos.x, y: pos.y, color: activeColor }; break
      case 'kreis': newEl = { id, type: 'kreis', x: pos.x, y: pos.y, color: activeColor }; break
      case 'text': newEl = { id, type: 'text', x: pos.x, y: pos.y, text: 'Text', color: activeColor }; break
    }
    if (newEl) syncElements([...elementsRef.current, newEl])
  }

  const handleShapeClick = (e: any, id: string) => {
    e.cancelBubble = true
    if (activeTool === 'radierer') {
      if (selectedId === id) { setSelectedId(null); detachTransformer() }
      syncElements(elementsRef.current.filter(el => el.id !== id))
      return
    }
    const el = elementsRef.current.find(el => el.id === id)
    if (el && TRANSFORMABLE_TYPES.includes(el.type) && !DRAW_TOOLS.includes(activeTool)) {
      setSelectedId(id)
      if (transformerRef.current) {
        transformerRef.current.nodes([e.target])
        if (UNIFORM_SCALE_TYPES.includes(el.type)) {
          transformerRef.current.setAttrs({
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
            keepRatio: true,
          })
        } else {
          transformerRef.current.setAttrs({
            enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right'],
            keepRatio: false,
          })
        }
        transformerRef.current.getLayer()?.batchDraw()
      }
    }
  }

  const handleDragEnd = (e: any, id: string) => {
    syncElements(elementsRef.current.map(el =>
      el.id === id && 'x' in el ? { ...(el as any), x: e.target.x(), y: e.target.y() } : el
    ))
  }

  const handleTransformEnd = (e: any, id: string) => {
    const node = e.target
    syncElements(elementsRef.current.map(el =>
      el.id === id
        ? { ...(el as any), x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY(), rotation: node.rotation() }
        : el
    ))
  }

  const startEditText = (el: TextEl, node: any) => {
    const pos = node.getAbsolutePosition()
    setEditingText({ id: el.id, x: pos.x, y: pos.y, text: el.text, color: el.color })
  }

  const commitTextEdit = () => {
    if (!editingText) return
    syncElements(elementsRef.current.map(el =>
      el.id === editingText.id ? { ...el, text: editingText.text } as TextEl : el
    ))
    setEditingText(null)
  }

  const isDraggable = !DRAW_TOOLS.includes(activeTool) && activeTool !== 'radierer' && editMode

  const sharedProps = (id: string) => ({
    draggable: isDraggable,
    onClick: (e: any) => handleShapeClick(e, id),
    onTap: (e: any) => handleShapeClick(e, id),
    onDragEnd: (e: any) => handleDragEnd(e, id),
    onTransformEnd: (e: any) => handleTransformEnd(e, id),
  })

  const renderElement = (el: CanvasElement) => {
    const sp = sharedProps(el.id)
    switch (el.type) {
      case 'kleiner-kegel':
        return (
          <RegularPolygon
            key={el.id} {...sp}
            x={el.x} y={el.y} sides={3} radius={13} fill={CONE_COLOR} stroke="#c45e00" strokeWidth={1}
            scaleX={el.scaleX} scaleY={el.scaleY} rotation={el.rotation}
          />
        )
      case 'grosser-kegel':
        return (
          <RegularPolygon
            key={el.id} {...sp}
            x={el.x} y={el.y} sides={3} radius={21} fill={CONE_COLOR} stroke="#c45e00" strokeWidth={1}
            scaleX={el.scaleX} scaleY={el.scaleY} rotation={el.rotation}
          />
        )
      case 'dreieck':
        return (
          <RegularPolygon
            key={el.id} {...sp}
            x={el.x} y={el.y} sides={3} radius={16} fill={el.color}
            scaleX={el.scaleX} scaleY={el.scaleY} rotation={el.rotation}
          />
        )
      case 'kreis':
        return (
          <Circle
            key={el.id} {...sp}
            x={el.x} y={el.y} radius={20} fill={el.color}
            scaleX={el.scaleX} scaleY={el.scaleY} rotation={el.rotation}
          />
        )
      case 'text':
        return (
          <KonvaText
            key={el.id} {...sp}
            x={el.x} y={el.y}
            text={el.text}
            fill={el.color}
            fontSize={16}
            fontFamily="sans-serif"
            scaleX={el.scaleX} scaleY={el.scaleY} rotation={el.rotation}
            visible={editingText?.id !== el.id}
            onDblClick={(e: any) => startEditText(el, e.target)}
            onDblTap={(e: any) => startEditText(el, e.target)}
          />
        )
      case 'stift':
        return (
          <Line
            key={el.id}
            points={el.points}
            stroke={el.color}
            strokeWidth={3}
            lineCap="round"
            lineJoin="round"
            onClick={(e: any) => handleShapeClick(e, el.id)}
            onTap={(e: any) => handleShapeClick(e, el.id)}
          />
        )
      case 'pfeil':
        return (
          <Arrow
            key={el.id}
            points={el.points}
            stroke={el.color}
            fill={el.color}
            strokeWidth={2}
            pointerLength={10}
            pointerWidth={8}
            onClick={(e: any) => handleShapeClick(e, el.id)}
            onTap={(e: any) => handleShapeClick(e, el.id)}
          />
        )
      case 'gestrichelter-pfeil':
        return (
          <Arrow
            key={el.id}
            points={el.points}
            stroke={el.color}
            fill={el.color}
            strokeWidth={2}
            dash={[8, 6]}
            pointerLength={10}
            pointerWidth={8}
            onClick={(e: any) => handleShapeClick(e, el.id)}
            onTap={(e: any) => handleShapeClick(e, el.id)}
          />
        )
    }
  }

  const toolBtn = (tool: ToolType, label: React.ReactNode, title: string) => (
    <button
      key={tool}
      type="button"
      title={title}
      onClick={() => setActiveTool(tool)}
      className={`flex-shrink-0 min-w-[44px] h-[44px] px-2 flex items-center justify-center text-xs font-medium rounded transition-colors ${
        activeTool === tool
          ? 'bg-accent text-white'
          : 'bg-surface text-muted hover:text-primary hover:bg-hover'
      }`}
    >
      {label}
    </button>
  )

  const cursor = readOnly ? 'default'
    : !editMode ? 'default'
    : activeTool === 'radierer' ? 'not-allowed'
    : DRAW_TOOLS.includes(activeTool) ? 'crosshair'
    : 'copy'

  // ReadOnly: nur das gespeicherte PNG anzeigen
  if (readOnly) {
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        {drawingData
          ? <img src={drawingData} alt="" className="w-full block" />
          : <div className={`${fieldType === 'half' ? 'aspect-[3/4]' : 'aspect-[2/3]'} bg-[#1a2e1a] flex items-center justify-center text-muted text-sm`}>Keine Zeichnung</div>
        }
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-border">
      {/* Field type selector */}
      <div className="flex gap-2 px-3 py-2 bg-elevated border-b border-border shrink-0">
        {(['half', 'full'] as FieldType[]).map(ft => (
          <button
            key={ft}
            type="button"
            onClick={() => setFieldType(ft)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              fieldType === ft
                ? 'bg-accent text-white'
                : 'bg-surface text-muted hover:text-primary hover:bg-hover'
            }`}
          >
            {ft === 'half' ? 'Halbfeld' : 'Ganzes Feld'}
          </button>
        ))}

        {/* Edit mode toggle */}
        <button
          type="button"
          onClick={() => setEditMode(m => !m)}
          className={`ml-auto px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            editMode
              ? 'bg-accent text-white'
              : 'bg-surface text-muted hover:text-primary hover:bg-hover'
          }`}
        >
          {editMode ? '✏ Zeichnen aktiv' : '✏ Zeichnen'}
        </button>
      </div>

      {/* Toolbar — nur sichtbar wenn editMode */}
      {editMode && (
        <div className="flex items-center gap-1 px-2 py-1 bg-elevated border-b border-border overflow-x-auto min-h-[52px] shrink-0">
          {/* Shapes */}
          {toolBtn('kleiner-kegel',
            <span style={{ display:'inline-block', width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderBottom:'12px solid #f97316' }} />,
            'Kleiner Kegel'
          )}
          {toolBtn('grosser-kegel',
            <span style={{ display:'inline-block', width:0, height:0, borderLeft:'11px solid transparent', borderRight:'11px solid transparent', borderBottom:'20px solid #f97316' }} />,
            'Großer Kegel'
          )}
          {toolBtn('dreieck',
            <span style={{ display:'inline-block', width:0, height:0, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderBottom:`14px solid ${activeColor}` }} />,
            'Dreieck (Spieler)'
          )}
          {toolBtn('kreis',
            <span style={{ display:'inline-block', width:14, height:14, borderRadius:'50%', background: activeColor }} />,
            'Kreis'
          )}
          {toolBtn('text', <span className="font-bold text-sm">T</span>, 'Text')}

          <div className="w-px h-6 bg-border mx-0.5 flex-shrink-0" />

          {/* Draw tools */}
          {toolBtn('stift', <span>✏️</span>, 'Stift')}
          {toolBtn('pfeil', <span className="text-base font-bold">→</span>, 'Pfeil')}
          {toolBtn('gestrichelter-pfeil', <span className="text-base">⇢</span>, 'Gestrichelter Pfeil')}

          <div className="w-px h-6 bg-border mx-0.5 flex-shrink-0" />

          {/* Radierer */}
          {toolBtn('radierer', <span>⌫</span>, 'Radierer')}

          {/* Undo */}
          <button
            type="button"
            title="Rückgängig"
            onClick={() => syncElements(elementsRef.current.slice(0, -1))}
            className="flex-shrink-0 min-w-[44px] h-[44px] px-2 flex items-center justify-center text-xs font-medium rounded transition-colors bg-surface text-muted hover:text-primary hover:bg-hover"
          >
            ↩
          </button>

          {/* Leer */}
          <button
            type="button"
            title="Alles löschen"
            onClick={() => syncElements([])}
            className="flex-shrink-0 min-w-[44px] h-[44px] px-2 flex items-center justify-center text-xs font-medium rounded transition-colors bg-surface text-muted hover:text-red-400 hover:bg-hover"
          >
            ✕ Leer
          </button>

          <div className="w-px h-6 bg-border mx-0.5 flex-shrink-0" />

          {/* Color palette */}
          {COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => setActiveColor(c.value)}
              style={{ backgroundColor: c.value }}
              className={`flex-shrink-0 w-[30px] h-[30px] rounded-full transition-transform ${
                activeColor === c.value
                  ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-elevated'
                  : 'hover:scale-105'
              }`}
            />
          ))}
        </div>
      )}

      {/* Canvas area — festes Seitenverhältnis, kein flex-stretch */}
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden ${fieldType === 'half' ? 'aspect-[3/4]' : 'aspect-[2/3]'}`}
        style={{ cursor, touchAction: editMode ? 'none' : 'auto', maxHeight: '70vh' }}
      >
        {stageSize.w > 0 && (
          <Stage
            ref={stageRef}
            width={stageSize.w}
            height={stageSize.h}
            x={zoomState.x}
            y={zoomState.y}
            scaleX={zoomState.scale}
            scaleY={zoomState.scale}
            style={{ position: 'absolute', inset: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleStageClick}
            onTap={handleStageClick}
          >
            <Layer>
              {/* Hintergrundbild als Konva-Node (wird in PNG-Export erfasst) */}
              {courtImg && (
                <KonvaImage
                  image={courtImg}
                  x={0} y={0}
                  width={stageSize.w}
                  height={stageSize.h}
                  listening={false}
                />
              )}
              {elements.map(el => renderElement(el))}
              <Transformer
                ref={transformerRef}
                rotateEnabled={true}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) return oldBox
                  return newBox
                }}
              />
            </Layer>
          </Stage>
        )}

        {/* Text editing overlay */}
        {editingText && (
          <input
            type="text"
            autoFocus
            value={editingText.text}
            onChange={e => setEditingText({ ...editingText, text: e.target.value })}
            onBlur={commitTextEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitTextEdit() }}
            style={{
              position: 'absolute',
              left: editingText.x,
              top: editingText.y,
              fontSize: 16,
              fontFamily: 'sans-serif',
              color: editingText.color,
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid #999',
              borderRadius: 3,
              padding: '2px 4px',
              minWidth: 60,
              zIndex: 10,
              outline: 'none',
            }}
          />
        )}

        {/* Overlay-Hinweis wenn editMode inaktiv */}
        {!editMode && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-pointer"
            onClick={() => setEditMode(true)}
          >
            <span className="bg-surface/90 text-primary text-sm font-medium px-3 py-1.5 rounded-full border border-border shadow">
              Tippen zum Zeichnen
            </span>
          </div>
        )}
      </div>

      {/* Save button */}
      {onSave && (
        <div className="flex justify-end px-3 py-2 bg-elevated border-t border-border shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!stageRef.current) return
              const stage = stageRef.current
              // Zoom temporär zurücksetzen für sauberes PNG
              stage.scale({ x: 1, y: 1 })
              stage.position({ x: 0, y: 0 })
              const pngDataUrl = stage.toDataURL({ pixelRatio: 1 })
              // Zoom wiederherstellen
              const z = zoomRef.current
              stage.scale({ x: z.scale, y: z.scale })
              stage.position({ x: z.x, y: z.y })
              const elementsJson = JSON.stringify(elementsRef.current)
              onSave(pngDataUrl, elementsJson)
            }}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm rounded-md font-medium transition-colors"
          >
            Zeichnung speichern
          </button>
        </div>
      )}
    </div>
  )
}
