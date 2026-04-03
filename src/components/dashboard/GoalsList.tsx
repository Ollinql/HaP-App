import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../store/AppContext'

// Deterministic color from tag string
const TAG_COLORS: Record<string, string> = {
  Technik: 'bg-teal-900/60 text-teal-300 border-teal-700',
  Taktik: 'bg-blue-900/60 text-blue-300 border-blue-700',
  Fitness: 'bg-purple-900/60 text-purple-300 border-purple-700',
  Athletik: 'bg-orange-900/60 text-orange-300 border-orange-700',
  Mental: 'bg-pink-900/60 text-pink-300 border-pink-700',
}

const FALLBACK_COLORS = [
  'bg-cyan-900/60 text-cyan-300 border-cyan-700',
  'bg-green-900/60 text-green-300 border-green-700',
  'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  'bg-rose-900/60 text-rose-300 border-rose-700',
  'bg-indigo-900/60 text-indigo-300 border-indigo-700',
]

function tagColor(tag: string): string {
  if (TAG_COLORS[tag]) return TAG_COLORS[tag]
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length]
}

const DEFAULT_TAGS = ['Technik', 'Taktik', 'Fitness']

export function GoalsList() {
  const { settings, addGoal, removeGoal, toggleGoal } = useApp()
  const availableTags = [...DEFAULT_TAGS, ...settings.globalTags.filter((t) => !DEFAULT_TAGS.includes(t))]
  const [showAdd, setShowAdd] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTag, setNewTag] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showAdd) inputRef.current?.focus()
  }, [showAdd])

  const goals = settings.trainingGoals
  const open = goals.filter((g) => !g.completed)
  const done = goals.filter((g) => g.completed)
  const sorted = [...open, ...done]

  function handleAdd() {
    const text = newText.trim()
    if (!text) return
    addGoal(text, newTag || undefined)
    setNewText('')
    setNewTag('')
    setShowAdd(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') {
      setShowAdd(false)
      setNewText('')
      setNewTag('')
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-primary">Trainingsziele</h3>
          {goals.length > 0 && (
            <span className="text-xs text-muted tabular-nums">
              {done.length}/{goals.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors font-medium"
        >
          <span className="text-base leading-none">+</span> Neu
        </button>
      </div>

      {/* Goal list */}
      {sorted.length === 0 && !showAdd && (
        <p className="text-xs text-muted py-1">Noch keine Ziele. Klicke auf <span className="text-accent">+ Neu</span> um zu starten.</p>
      )}

      {sorted.length > 0 && (
        <ul className="space-y-1.5 mb-2">
          {sorted.map((goal) => (
            <li
              key={goal.id}
              className="group flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-elevated transition-colors"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleGoal(goal.id)}
                aria-label={goal.completed ? 'Als offen markieren' : 'Als erledigt markieren'}
                className="shrink-0 w-4.5 h-4.5 flex items-center justify-center"
              >
                {goal.completed ? (
                  <span className="w-4 h-4 rounded-full bg-accent/20 border border-accent flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-accent" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-border group-hover:border-accent/50 transition-colors" />
                )}
              </button>

              {/* Text */}
              <span
                className={`flex-1 text-sm min-w-0 truncate transition-colors ${
                  goal.completed ? 'line-through text-muted/50' : 'text-primary'
                }`}
              >
                {goal.text}
              </span>

              {/* Tag badge */}
              {goal.tag && (
                <span
                  className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${tagColor(goal.tag)}`}
                >
                  {goal.tag}
                </span>
              )}

              {/* Delete */}
              <button
                onClick={() => removeGoal(goal.id)}
                aria-label={`Ziel "${goal.text}" löschen`}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all text-base leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inline add row */}
      {showAdd && (
        <div className="mt-2 flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Neues Ziel…"
            className="flex-1 bg-input border border-border focus:border-accent rounded-lg px-3 py-1.5 text-sm text-primary outline-none transition-colors"
          />
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="bg-input border border-border focus:border-accent rounded-lg px-2 py-1.5 text-xs text-muted outline-none transition-colors cursor-pointer"
          >
            <option value="">Tag…</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-30 transition-colors"
            aria-label="Ziel speichern"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
