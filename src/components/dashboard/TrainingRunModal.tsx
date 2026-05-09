import { useMemo, useState } from 'react'
import type { TrainingSession, Exercise, IntensityLevel, SessionExerciseRef } from '../../types'
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

type ResolvedExercise = Exercise & { intensityFeedback?: IntensityLevel | null }

export function TrainingRunModal({ session, onClose }: TrainingRunModalProps) {
  const { exercises, updateSession } = useApp()
  const [phase, setPhase] = useState<Phase>('running')

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])

  const globalIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    let idx = 0
    ;(['warmup', 'main', 'closing'] as const).forEach((sk) => {
      session.sections[sk].forEach((ref) => {
        map.set(ref.exerciseId, ++idx)
      })
    })
    return map
  }, [session])

  const resolveRef = (ref: SessionExerciseRef): ResolvedExercise | null => {
    const ex = exerciseMap.get(ref.exerciseId)
    if (!ex) return null
    return { ...ex, intensityFeedback: ref.intensityFeedback ?? null }
  }

  // Flatten all exercises in order: warmup → main → closing
  const allExercises: ResolvedExercise[] = (['warmup', 'main', 'closing'] as const).flatMap((sk) =>
    session.sections[sk].flatMap((ref) => {
      const resolved = resolveRef(ref)
      return resolved ? [resolved] : []
    }),
  )

  // Only exercises without a rating are shown for feedback
  const unratedRefs = (['warmup', 'main', 'closing'] as const).flatMap((sk) =>
    session.sections[sk].filter((ref) => ref.intensityFeedback == null),
  )
  const unratedExercises = unratedRefs.flatMap((ref) => {
    const resolved = resolveRef(ref)
    return resolved ? [resolved] : []
  })

  // Local feedback state: exerciseId → rating
  const [feedback, setFeedback] = useState<Record<string, IntensityLevel>>({})

  const handleFinish = () => {
    if (unratedRefs.length === 0) {
      onClose()
      return
    }

    // Write feedback back to the session's refs
    const applyFeedback = (refs: SessionExerciseRef[]): SessionExerciseRef[] =>
      refs.map((ref) => {
        const rating = feedback[ref.exerciseId]
        return rating != null ? { ...ref, intensityFeedback: rating } : ref
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
          <div className="flex-1 overflow-y-auto pb-4">
            {(['warmup', 'main', 'closing'] as const).map((sectionKey) => {
              const sectionExercises = session.sections[sectionKey].flatMap((ref) => {
                const resolved = resolveRef(ref)
                return resolved ? [resolved] : []
              })
              if (sectionExercises.length === 0) return null
              return (
                <div key={sectionKey}>
                  {/* Abschnitts-Trennlinie */}
                  <div className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-bold text-accent uppercase tracking-widest shrink-0">
                      {SECTION_LABELS[sectionKey]}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="flex flex-col gap-4 px-4">
                    {sectionExercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="bg-surface border border-border rounded-xl overflow-hidden"
                      >
                        {/* Nummer + Titel */}
                        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
                          <span className="text-sm font-bold text-accent w-6 shrink-0">
                            {globalIndexMap.get(ex.id)}.
                          </span>
                          <p className="text-base font-semibold text-primary leading-tight">{ex.title || '—'}</p>
                        </div>
                        {/* Zeichnung — volle Breite, dunkler Hintergrund für Letterbox */}
                        <div className="w-full aspect-[4/3] bg-black">
                          {ex.drawingData ? (
                            <img src={ex.drawingData} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted text-3xl">
                              ✏️
                            </div>
                          )}
                        </div>
                        {/* Tags */}
                        {ex.tags.length > 0 && (
                          <div className="px-4 py-2 flex flex-wrap gap-1">
                            {ex.tags.map((tag) => (
                              <Badge key={tag} label={tag} />
                            ))}
                          </div>
                        )}
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
