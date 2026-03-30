import type { DayKey } from '../types'

export const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Mo',
  tuesday: 'Di',
  wednesday: 'Mi',
  thursday: 'Do',
  friday: 'Fr',
  saturday: 'Sa',
  sunday: 'So',
}

export const DAY_LABELS_FULL: Record<DayKey, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
}

/** Format a Date to YYYY-MM-DD */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse a YYYY-MM-DD string to a Date (local time) */
export function fromISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Get Monday of the week containing `date` */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get an array of 7 Date objects for Mon–Sun of the week containing `date` */
export function getWeekDays(date: Date): Date[] {
  const monday = getMondayOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
}

/** Return the DayKey for a given Date */
export function getDayKey(date: Date): DayKey {
  return DAY_KEYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
}

/** Format date as "28. März 2026" */
export function formatDateLong(dateStr: string): string {
  const d = fromISODate(dateStr)
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Format date as "28.03." */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })
}

/** Is dateStr before today? */
export function isDatePast(dateStr: string): boolean {
  const today = toISODate(new Date())
  return dateStr < today
}

/** Is dateStr today? */
export function isToday(dateStr: string): boolean {
  return dateStr === toISODate(new Date())
}

/** Get ISO week number */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Offset the displayed week by +/- weeks from a reference date */
export function offsetWeek(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}
