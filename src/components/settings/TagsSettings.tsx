import { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface Props {
  globalTags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
}

export function TagsSettings({ globalTags, onAdd, onRemove }: Props) {
  const [newTag, setNewTag] = useState('')

  const handleAdd = () => {
    const trimmed = newTag.trim()
    if (trimmed && !globalTags.includes(trimmed)) {
      onAdd(trimmed)
      setNewTag('')
    }
  }

  return (
    <Card>
      <h2 className="text-sm font-semibold text-primary mb-4">Globale Tags</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {globalTags.length === 0 && (
          <p className="text-xs text-muted">Noch keine Tags definiert.</p>
        )}
        {globalTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-elevated border border-border rounded-full text-xs text-muted"
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
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
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
          placeholder="Neuen Tag hinzufügen…"
          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newTag.trim()}>
          Hinzufügen
        </Button>
      </div>
    </Card>
  )
}
