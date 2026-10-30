/**
 * Private overlay primitives for the Feedback group (dialogs, sheets, menus, popovers, tooltips, toasts).
 * Everything here is SSR safe: DOM access only happens inside watchers / event handlers.
 */
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

/* ------------------------------------------------------------------ tones */

export type MiFeedbackTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral'

const mix = (c: string, pct: number): string => `color-mix(in srgb, var(${c}) ${pct}%, transparent)`

const TONES: Record<MiFeedbackTone, Record<string, string>> = {
  primary: { '--t-solid': 'var(--mi-p)', '--t-on': 'var(--mi-p-on)', '--t-text': 'var(--mi-p-text)', '--t-bg': 'var(--mi-p-tint)', '--t-dot': 'var(--mi-p)' },
  secondary: { '--t-solid': 'var(--mi-s)', '--t-on': 'var(--mi-s-on)', '--t-text': 'var(--mi-s-text)', '--t-bg': 'var(--mi-s-tint)', '--t-dot': 'var(--mi-s)' },
  success: { '--t-solid': 'var(--mi-green-t)', '--t-on': '#FFFFFF', '--t-text': 'var(--mi-green-t)', '--t-bg': mix('--mi-green', 14), '--t-dot': 'var(--mi-green)' },
  warning: { '--t-solid': 'var(--mi-orange-t)', '--t-on': '#FFFFFF', '--t-text': 'var(--mi-orange-t)', '--t-bg': mix('--mi-orange', 14), '--t-dot': 'var(--mi-orange)' },
  danger: { '--t-solid': 'var(--mi-red-t)', '--t-on': '#FFFFFF', '--t-text': 'var(--mi-red-t)', '--t-bg': mix('--mi-red', 12), '--t-dot': 'var(--mi-red)' },
  neutral: { '--t-solid': 'var(--mi-label2)', '--t-on': '#FFFFFF', '--t-text': 'var(--mi-label2)', '--t-bg': 'var(--mi-fill3)', '--t-dot': 'var(--mi-label3)' }
}

/** Inline custom properties (`--t-solid`, `--t-on`, `--t-text`, `--t-bg`, `--t-dot`) for a semantic tone. */
export function miFeedbackToneVars(tone: MiFeedbackTone): Record<string, string> {
  return TONES[tone] ?? TONES.primary
}

/* ------------------------------------------------------------------ focus */

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'

export function miOverlayFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => !el.closest('[hidden],[inert]') && el.getAttribute('aria-hidden') !== 'true')
}

/** Keeps Tab / Shift+Tab inside `root`. Returns true when the event was handled. */
export function miOverlayTrapTab(e: KeyboardEvent, root: HTMLElement): boolean {
  if (e.key !== 'Tab') return false
  const list = miOverlayFocusables(root)
  if (!list.length) {
    e.preventDefault()
    root.focus({ preventScroll: true })
    return true
  }
  const first = list[0]!
  const last = list[list.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (!active || !root.contains(active)) {
    e.preventDefault()
    first.focus({ preventScroll: true })
  } else if (e.shiftKey && (active === first || active === root)) {
    e.preventDefault()
    last.focus({ preventScroll: true })
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus({ preventScroll: true })
  }
  return true
}

/* ------------------------------------------------------------ scroll lock */

let lockCount = 0
let saved: { overflow: string, padding: string } | null = null

/** Locks page scroll (ref-counted, compensates the scrollbar width). Returns an idempotent unlock function. */
export function miOverlayLockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}
  const root = document.documentElement
  if (lockCount === 0) {
    const gap = Math.max(0, window.innerWidth - root.clientWidth)
    saved = { overflow: root.style.overflow, padding: root.style.paddingRight }
    root.style.overflow = 'hidden'
    if (gap) root.style.paddingRight = `${gap}px`
  }
  lockCount++
  let released = false
  return () => {
    if (released) return
    released = true
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0 && saved) {
      root.style.overflow = saved.overflow
      root.style.paddingRight = saved.padding
      saved = null
    }
  }
}

/* ---------------------------------------------------------------- stacking */

const overlayStack: symbol[] = []

/* ------------------------------------------------------- overlay behaviour */

export interface MiOverlayOptions {
  open: Readonly<Ref<boolean>>
  panel: Readonly<Ref<HTMLElement | null | undefined>>
  /** Trap Tab inside the panel (default true). */
  trap?: boolean
  /** Lock page scroll while open (default true). */
  lock?: boolean
  /** Return focus to the previously focused element on close (default true). */
  restoreFocus?: boolean
  /** Called when Escape is pressed on the top-most overlay. */
  onEscape?: () => void
  /** Element to focus on open. Falls back to the first focusable, then the panel. */
  initialFocus?: () => HTMLElement | null | undefined
}

/** Focus trap, scroll lock, Escape handling and focus restoration for a modal-like panel. */
export function useMiOverlay(o: MiOverlayOptions) {
  const token = Symbol('mi-overlay')
  let previous: HTMLElement | null = null
  let unlock: (() => void) | null = null
  let listening = false

  function onKey(e: KeyboardEvent) {
    if (overlayStack[overlayStack.length - 1] !== token) return
    const el = o.panel.value
    if (e.key === 'Escape' && o.onEscape) {
      e.stopPropagation()
      o.onEscape()
    } else if (o.trap !== false && el) {
      miOverlayTrapTab(e, el)
    }
  }

  function activate() {
    if (listening || typeof document === 'undefined') return
    listening = true
    previous = document.activeElement as HTMLElement | null
    overlayStack.push(token)
    document.addEventListener('keydown', onKey, true)
    if (o.lock !== false) unlock = miOverlayLockScroll()
    const el = o.panel.value
    if (el) {
      const target = o.initialFocus?.() ?? miOverlayFocusables(el)[0] ?? el
      target.focus({ preventScroll: true })
    }
  }

  function deactivate() {
    if (!listening) return
    listening = false
    document.removeEventListener('keydown', onKey, true)
    const i = overlayStack.indexOf(token)
    if (i >= 0) overlayStack.splice(i, 1)
    unlock?.()
    unlock = null
    if (o.restoreFocus !== false && previous && document.contains(previous)) previous.focus({ preventScroll: true })
    previous = null
  }

  watch(() => !!(o.open.value && o.panel.value), (on) => { on ? activate() : deactivate() }, { flush: 'post' })
  onBeforeUnmount(deactivate)

  return { activate, deactivate }
}

/** Keeps a panel rendered during its leave transition; renders nothing on the server. */
export function useMiPresence(open: Readonly<Ref<boolean>>) {
  const rendered = ref(false)
  onMounted(() => { rendered.value = open.value })
  watch(open, (v) => { if (v) rendered.value = true })
  function afterLeave() {
    if (!open.value) rendered.value = false
  }
  return { rendered, afterLeave }
}

/** Calls `fn` when a pointerdown lands outside every given element, while `active` is true. */
export function useMiOverlayOutside(active: Readonly<Ref<boolean>>, els: () => Array<HTMLElement | null | undefined>, fn: (e: PointerEvent) => void) {
  function handler(e: PointerEvent) {
    const t = e.target as Node | null
    if (!t) return
    if (els().some(el => el && el.contains(t))) return
    fn(e)
  }
  watch(active, (on) => {
    if (typeof document === 'undefined') return
    document.removeEventListener('pointerdown', handler, true)
    if (on) document.addEventListener('pointerdown', handler, true)
  }, { flush: 'post', immediate: true })
  onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('pointerdown', handler, true)
  })
}

/* ---------------------------------------------------------------- position */

export type MiOverlaySide = 'top' | 'bottom' | 'left' | 'right'
export type MiOverlayPlacement = MiOverlaySide | `${MiOverlaySide}-start` | `${MiOverlaySide}-end`

export interface MiOverlayRect { left: number, top: number, width: number, height: number }

export interface MiOverlayPositionOptions {
  offset?: number
  /** Minimum distance kept from the viewport edges. */
  padding?: number
  viewport: { width: number, height: number }
  flip?: boolean
}

export interface MiOverlayPosition {
  x: number
  y: number
  /** The side actually used after flipping. */
  side: MiOverlaySide
  placement: MiOverlayPlacement
  /** Arrow centre along the cross axis, in px from the floating element's start edge. */
  arrow: number
}

const OPPOSITE: Record<MiOverlaySide, MiOverlaySide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

export function miOverlayPosition(anchor: MiOverlayRect, size: { width: number, height: number }, placement: MiOverlayPlacement, opts: MiOverlayPositionOptions): MiOverlayPosition {
  const offset = opts.offset ?? 8
  const pad = opts.padding ?? 8
  const { width: vw, height: vh } = opts.viewport
  const [sideRaw, alignRaw] = placement.split('-') as [MiOverlaySide, ('start' | 'end')?]
  const align = alignRaw ?? 'center'
  const { width: w, height: h } = size

  const mainPos = (side: MiOverlaySide): number => {
    if (side === 'top') return anchor.top - h - offset
    if (side === 'bottom') return anchor.top + anchor.height + offset
    if (side === 'left') return anchor.left - w - offset
    return anchor.left + anchor.width + offset
  }
  const fits = (side: MiOverlaySide): boolean => {
    const p = mainPos(side)
    if (side === 'top') return p >= pad
    if (side === 'bottom') return p + h <= vh - pad
    if (side === 'left') return p >= pad
    return p + w <= vw - pad
  }
  const room = (side: MiOverlaySide): number => {
    if (side === 'top') return anchor.top - offset - pad
    if (side === 'bottom') return vh - (anchor.top + anchor.height) - offset - pad
    if (side === 'left') return anchor.left - offset - pad
    return vw - (anchor.left + anchor.width) - offset - pad
  }

  let side = sideRaw
  if (opts.flip !== false && !fits(side)) {
    const opp = OPPOSITE[side]
    if (fits(opp) || room(opp) > room(side)) side = opp
  }

  const vertical = side === 'top' || side === 'bottom'
  let x: number
  let y: number
  if (vertical) {
    y = mainPos(side)
    x = align === 'start' ? anchor.left : align === 'end' ? anchor.left + anchor.width - w : anchor.left + anchor.width / 2 - w / 2
    x = Math.max(pad, Math.min(x, vw - w - pad))
  } else {
    x = mainPos(side)
    y = align === 'start' ? anchor.top : align === 'end' ? anchor.top + anchor.height - h : anchor.top + anchor.height / 2 - h / 2
    y = Math.max(pad, Math.min(y, vh - h - pad))
  }

  const centre = vertical ? anchor.left + anchor.width / 2 - x : anchor.top + anchor.height / 2 - y
  const span = vertical ? w : h
  const arrow = Math.max(16, Math.min(centre, span - 16))
  const out: MiOverlayPlacement = align === 'center' ? side : (`${side}-${align}` as MiOverlayPlacement)
  return { x: Math.round(x), y: Math.round(y), side, placement: out, arrow: Math.round(arrow) }
}

/** rAF-throttled callback; `cancel` drops a pending frame. */
export function miOverlayRaf<A extends unknown[]>(fn: (...a: A) => void): ((...a: A) => void) & { cancel: () => void } {
  let id = 0
  let last: A
  const wrapped = (...a: A) => {
    last = a
    if (id) return
    id = requestAnimationFrame(() => {
      id = 0
      fn(...last)
    })
  }
  wrapped.cancel = () => {
    if (id) cancelAnimationFrame(id)
    id = 0
  }
  return wrapped
}

export const MI_OVERLAY_Z = { dialog: 1000, popover: 1100, tooltip: 1200, toast: 1300 } as const
