import type { ComputedRef, InjectionKey } from 'vue'

/** Context an MiField provides to the control it wraps. */
export interface MiFieldContext {
  id: string
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  success: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  required: ComputedRef<boolean>
}

export const MI_FIELD: InjectionKey<MiFieldContext> = Symbol('mi-field')

export type MiFieldSize = 'sm' | 'md'

export interface MiSelectOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

/* ---------- date helpers (local time, no timezone surprises) ---------- */

export const miDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const miSameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const miDaysInMonth = (y: number, m: number): number => new Date(y, m + 1, 0).getDate()

export const miAddDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes())

/** Add months, clamping the day (Jan 31 + 1 month = Feb 28/29). */
export function miAddMonths(d: Date, n: number): Date {
  const t = d.getFullYear() * 12 + d.getMonth() + n
  const y = Math.floor(t / 12)
  const m = ((t % 12) + 12) % 12
  return new Date(y, m, Math.min(d.getDate(), miDaysInMonth(y, m)), d.getHours(), d.getMinutes())
}

export const miDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function miClampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  const x = miDay(d)
  if (min && x < miDay(min)) return miDay(min)
  if (max && x > miDay(max)) return miDay(max)
  return d
}

/** First day of week for a locale (0 = Sunday ... 6 = Saturday). */
export function miFirstWeekday(locale: string): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }, weekInfo?: { firstDay: number } }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info) return info.firstDay % 7
  } catch { /* fall through */ }
  return /^en(-US|-CA)?$/i.test(locale) ? 0 : 1
}
