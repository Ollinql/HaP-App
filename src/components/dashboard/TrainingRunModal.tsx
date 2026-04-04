import { useState } from 'react'
import type { TrainingSession, Exercise, IntensityLevel } from '../../types'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { IntensityPicker } from '../ui/IntensityPicker'
import { useApp } from '../../store/AppContext'

interface TrainingRunModalProps {
  session: TrainingSession
  onClose: () => void
}

const SECTION_LABELS: Record<string, string> = {
  warmup: 'Aufwärmen',
  main: 'Hauptteil',
  closing: 'Abschluss',
}

type Phase = 'running' | 'feedback'

export function TrainingRunModal({ session, onClose }: TrainingRunModalProps) {
  const { updateSession } = useApp()
  const [phase, setPhase] = useState<Phase>('running')

  // Flatten all exercises in order: warmup → main → closing
  const allExercises: Exercise[] = [
    ...session.sections.warmup,
    ...session.sections.main,
    ...session.sections.closing,
  ]

  // Only exercises without a rating are shown for feedback
  const unratedExercises = allExercises.filter((ex) => ex.intensityFeedback == null)

  // Local feedback state: exerciseId → rating
  const [feedback, setFeedback] = useState<Record<string, IntensityLevel>>({})

  const handleFinish = () => {
    if (unratedExercises.length === 0) {
      onClose()
      return
    }

    // Apply feedback to exercises in session sections
    const applyFeedback = (exercises: Exercise[]): Exercise[] =>
      exercises.map((ex) => {
        const rating = feedback[ex.id]
        if (rating != null) return { ...ex, intensityFeedback: rating }
        return ex
      })

    const updatedSession: TrainingSession = {
      ...session,
      sections: {
        warmup: applyFeedback(session.sections.warmup),
        main: applyFeedback(session.sections.main),
        closing: applyFeedback(session.sections.closing),
      },
    }
    updateSession(updatedSession)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={phase === 'running' ? session.title || 'Training' : 'Übungsbewertung'}
      size="lg"
    >
      {phase === 'running' && (
        <div className="flex flex-col" style={{ minHeight: '60vh' }}>
          {/* Meta */}
          <div className="px-5 pt-4 pb-2 shrink-0">
            <p className="text-xs text-muted">{session.duration} Min.</p>
            {session.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {session.tags.map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </div>
            )}
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
            {(['warmup', 'main', 'closing'] as const).map((sectionKey) => {
              const exercises = session.sections[sectionKey]
              if (exercises.length === 0) return null
              return (
                <div key={sectionKey}>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    {SECTION_LABELS[sectionKey]}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="bg-surface border border-border rounded-lg overflow-hidden"
                      >
                        {/* Großes Vorschaubild */}
                        <div className="w-full aspect-[4/3] bg-[#1a2e1a]">
                          {ex.drawingData ? (
                            <img src={ex.drawingData} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted text-2xl">
                              ✏️
                            </div>
                          )}
                        </div>
                        {/* Titel + Tags */}
                        <div className="px-3 py-2">
                          <p className="text-sm font-semibold text-primary">{ex.title || '—'}</p>
                          {ex.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ex.tags.map((tag) => (
                                <Badge key={tag} label={tag} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {allExercises.length === 0 && (
              <p className="text-sm text-muted text-center py-8">Keine Übungen geplant.</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
            <button
              type="button"
              onClick={() => setPhase('feedback')}
              className="w-full py-2.5 px-4 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Training beenden
            </button>
          </div>
        </div>
      )}

      {phase === 'feedback' && (
        <div className="flex flex-col" style={{ minHeight: '40vh' }}>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {unratedExercises.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">
                Alle Übungen wurden bereits bewertet.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted">
                  Bewerte die Intensität jeder Übung (einmalig):
                </p>
                {unratedExercises.map((ex) => (
                  <div key={ex.id} className="space-y-2">
                    <p className="text-sm font-medium text-primary">{ex.title || '—'}</p>
                    <IntensityPicker
                      value={feedback[ex.id] ?? null}
                      onChange={(level) => setFeedback((prev) => ({ ...prev, [ex.id]: level }))}
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 pt-3 border-t border-border shrink-0">
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-2.5 px-4 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
