import type { InjectionKey } from 'vue'

/** Context shared by MiRadioGroup and the MiRadio items it contains. */
export interface MiRadioContext {
  name: string
  isSelected: (value: unknown) => boolean
  hasSelection: () => boolean
  select: (value: unknown) => void
  disabled: () => boolean
}

/** Context shared by MiCheckboxGroup and the MiCheckbox items it contains. */
export interface MiCheckboxContext {
  isChecked: (value: unknown) => boolean
  set: (value: unknown, on: boolean) => void
  disabled: () => boolean
}

export const MI_RADIO_KEY: InjectionKey<MiRadioContext> = Symbol('mi-radio-group')
export const MI_CHECKBOX_KEY: InjectionKey<MiCheckboxContext> = Symbol('mi-checkbox-group')

export interface MiSwatchOption {
  value: string
  name: string
  /** Any CSS color, including `var(--mi-p)` so the swatch follows runtime theming. */
  color: string
}

/** Default palette of the color well: brand colors first, then system colors. */
export const MI_SWATCH_DEFAULTS: MiSwatchOption[] = [
  { value: 'primary', name: 'Primary', color: 'var(--mi-p)' },
  { value: 'secondary', name: 'Secondary', color: 'var(--mi-s)' },
  { value: 'red', name: 'Red', color: 'var(--mi-red)' },
  { value: 'orange', name: 'Orange', color: 'var(--mi-orange)' },
  { value: 'yellow', name: 'Yellow', color: 'var(--mi-yellow)' },
  { value: 'green', name: 'Green', color: 'var(--mi-green)' },
  { value: 'teal', name: 'Teal', color: 'var(--mi-teal)' },
  { value: 'gray', name: 'Gray', color: 'var(--mi-ctl, #8E8E93)' }
]

export function miClamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/** Number of decimals needed to represent `step` without floating point noise. */
export function miDecimals(step: number): number {
  const s = String(step)
  const e = s.match(/e-(\d+)$/)
  if (e) return Number(e[1])
  const i = s.indexOf('.')
  return i < 0 ? 0 : s.length - i - 1
}

/** Snaps `v` to the step grid anchored at `min`, then clamps to `[min, max]`. */
export function miSnap(v: number, min: number, max: number, step: number): number {
  if (!(step > 0)) return miClamp(v, min, max)
  const snapped = Math.round((v - min) / step) * step + min
  return miClamp(Number(snapped.toFixed(miDecimals(step))), min, max)
}

const NEXT = new Set(['ArrowRight', 'ArrowDown'])
const PREV = new Set(['ArrowLeft', 'ArrowUp'])

/**
 * Roving focus for radio-like groups: arrows move (and wrap), Home/End jump,
 * the newly focused item is activated. Returns true when the key was handled.
 */
export function miRovingKey(e: KeyboardEvent, root: HTMLElement | null, selector: string): boolean {
  if (!root || e.altKey || e.ctrlKey || e.metaKey) return false
  const k = e.key
  const next = NEXT.has(k)
  if (!next && !PREV.has(k) && k !== 'Home' && k !== 'End') return false
  const items = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => !el.hasAttribute('disabled'))
  if (!items.length) return false
  const from = (e.target as HTMLElement | null)?.closest<HTMLElement>(selector) ?? null
  const idx = from ? items.indexOf(from) : -1
  let to: number
  if (k === 'Home') to = 0
  else if (k === 'End') to = items.length - 1
  else if (idx < 0) to = next ? 0 : items.length - 1
  else to = (idx + (next ? 1 : -1) + items.length) % items.length
  e.preventDefault()
  const target = items[to]!
  target.focus({ preventScroll: true })
  target.click()
  return true
}
