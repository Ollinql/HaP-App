import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { useState } from 'react'
import type { IntensityLevel } from '../types'
import { Button } from '../components/ui/Button'
import { IntensityPicker } from '../components/ui/IntensityPicker'
import { formatDateLong } from '../utils/dateUtils'

export function FeedbackPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, updateSession } = useApp()

  const session = sessions.find((s) => s.id === id)

  const [feedback, setFeedback] = useState<IntensityLevel | null>(session?.postTrainingFeedback ?? null)
  const [notes, setNotes] = useState(session?.notes ?? '')

  if (!session) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted">Trainingseinheit nicht gefunden.</p>
        <Button className="mt-3" onClick={() => navigate('/')}>Zurück</Button>
      </div>
    )
  }

  const handleSave = () => {
    updateSession({ ...session, postTrainingFeedback: feedback, notes })
    navigate('/')
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted hover:text-primary text-lg">←</button>
        <div>
          <p className="text-xs text-muted">{formatDateLong(session.date)}</p>
          <h1 className="text-lg font-bold text-primary">Feedback</h1>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-primary mb-1">{session.title || 'Training'}</h2>
        <p className="text-xs text-muted">{session.duration} Minuten</p>
      </div>

      <IntensityPicker
        value={feedback}
        onChange={setFeedback}
        label="Wie war das Training?"
      />

      <div>
        <label className="block text-xs text-muted mb-1">Notizen</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Beobachtungen, was lief gut, was sollte besser werden…"
          className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button onClick={handleSave}>Feedback speichern</Button>
      </div>
    </div>
  )
}
