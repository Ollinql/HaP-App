interface ColorPaletteProps {
  activeColor: string
  onColorChange: (color: string) => void
  isEraser: boolean
  onEraserToggle: () => void
  onClear: () => void
}

const COLORS = [
  { value: '#ffffff', label: 'Weiß' },
  { value: '#ef4444', label: 'Rot' },
  { value: '#22c55e', label: 'Grün' },
  { value: '#3b82f6', label: 'Blau' },
  { value: '#f59e0b', label: 'Gelb' },
  { value: '#a855f7', label: 'Lila' },
  { value: '#f97316', label: 'Orange' },
  { value: '#06b6d4', label: 'Türkis' },
]

export function ColorPalette({
  activeColor,
  onColorChange,
  isEraser,
  onEraserToggle,
  onClear,
}: ColorPaletteProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-elevated border-t border-border rounded-b-lg">
      {/* Color swatches */}
      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          aria-label={c.label}
          onClick={() => { onColorChange(c.value) }}
          style={{ backgroundColor: c.value }}
          className={[
            'w-6 h-6 rounded-full transition-transform',
            !isEraser && activeColor === c.value
              ? 'ring-2 ring-white ring-offset-1 ring-offset-elevated scale-110'
              : 'hover:scale-105',
          ].join(' ')}
        />
      ))}

      <div className="w-px h-5 bg-border mx-1" />

      {/* Eraser */}
      <button
        type="button"
        title="Radierer"
        aria-label="Radierer"
        onClick={onEraserToggle}
        className={[
          'px-2 py-1 rounded text-xs font-medium transition-colors',
          isEraser
            ? 'bg-accent text-white'
            : 'bg-input text-muted hover:text-primary',
        ].join(' ')}
      >
        ⌫ Rad.
      </button>

      {/* Clear */}
      <button
        type="button"
        title="Alles löschen"
        aria-label="Zeichnung löschen"
        onClick={onClear}
        className="px-2 py-1 rounded text-xs font-medium bg-input text-muted hover:text-red-400 transition-colors"
      >
        ✕ Leer
      </button>
    </div>
  )
}
