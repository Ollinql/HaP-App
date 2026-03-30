import { useState, KeyboardEvent } from 'react'
import { Badge } from './Badge'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export function TagInput({ tags, onChange, suggestions = [], placeholder = 'Tag hinzufügen…' }: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const filtered = suggestions.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase()),
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 bg-input border border-border rounded-lg min-h-[2.5rem]">
        {tags.map((tag) => (
          <Badge key={tag} label={tag} onRemove={() => removeTag(tag)} />
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { if (inputValue) addTag(inputValue) }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-primary outline-none placeholder:text-muted"
        />
      </div>
      {inputValue && filtered.length > 0 && (
        <div className="bg-elevated border border-border rounded-lg overflow-hidden">
          {filtered.slice(0, 6).map((s) => (
            <button
              key={s}
              onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
              className="w-full px-3 py-1.5 text-left text-sm text-muted hover:text-primary hover:bg-input"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
