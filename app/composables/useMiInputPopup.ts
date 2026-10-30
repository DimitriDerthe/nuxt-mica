import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { CSSProperties, Ref } from 'vue'

export interface MiInputPopupOptions {
  /** Element the popup is anchored to. */
  trigger: () => HTMLElement | null
  panel: Ref<HTMLElement | null>
  /** Make the panel as wide as the trigger. */
  matchWidth?: boolean
  align?: 'start' | 'end'
  gap?: number
  onClose?: () => void
}

/**
 * Teleported popup behaviour shared by MiSelect and MiDatePicker: positioning (flip + clamp),
 * outside-press and Escape dismissal, and inheritance of the nearest light/dark scope.
 * Layout is read once on open and on rAF-throttled scroll/resize, never in a frame loop.
 */
export function useMiInputPopup(opts: MiInputPopupOptions) {
  const open = ref(false)
  const pos = ref({ top: 0, left: 0, width: 0, maxHeight: 0, origin: 'top' })
  const scope = ref('')
  let raf = 0

  const style = computed<CSSProperties>(() => ({
    top: `${pos.value.top}px`,
    left: `${pos.value.left}px`,
    ...(opts.matchWidth ? { width: `${pos.value.width}px` } : {}),
    maxHeight: pos.value.maxHeight ? `${pos.value.maxHeight}px` : undefined,
    '--mi-origin': pos.value.origin === 'top' ? 'top' : 'bottom'
  } as CSSProperties))

  function place() {
    const t = opts.trigger()
    const p = opts.panel.value
    if (!t || !p) return
    const gap = opts.gap ?? 6
    const r = t.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pw = opts.matchWidth ? r.width : p.offsetWidth
    const ph = p.scrollHeight
    const below = vh - r.bottom - gap - 8
    const above = r.top - gap - 8
    const flip = ph > below && above > below
    const room = flip ? above : below
    const h = Math.min(ph, room)
    const top = flip ? r.top - gap - h : r.bottom + gap
    let left = opts.align === 'end' ? r.right - pw : r.left
    left = Math.max(8, Math.min(left, vw - pw - 8))
    pos.value = { top: Math.round(top), left: Math.round(left), width: Math.round(r.width), maxHeight: Math.max(120, Math.floor(room)), origin: flip ? 'bottom' : 'top' }
  }

  function schedule() {
    if (raf) return
    raf = requestAnimationFrame(() => { raf = 0; place() })
  }

  function onPointerDown(e: Event) {
    const n = e.target as Node
    if (opts.panel.value?.contains(n) || opts.trigger()?.contains(n)) return
    hide(false)
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.stopPropagation(); hide(true) }
  }

  function bind() {
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true, capture: true })
  }

  function unbind() {
    document.removeEventListener('pointerdown', onPointerDown, true)
    document.removeEventListener('keydown', onKey, true)
    window.removeEventListener('resize', schedule)
    window.removeEventListener('scroll', schedule, true)
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
  }

  function show() {
    if (open.value) return
    const scoped = opts.trigger()?.closest('.mi-dark,.mi-light')
    scope.value = scoped ? (scoped.classList.contains('mi-dark') ? 'mi-dark' : 'mi-light') : ''
    open.value = true
    bind()
    void nextTick(place)
  }

  function hide(restoreFocus = false) {
    if (!open.value) return
    open.value = false
    unbind()
    opts.onClose?.()
    if (restoreFocus) opts.trigger()?.focus()
  }

  function toggle() { open.value ? hide(false) : show() }

  watch(open, v => { if (v) void nextTick(place) })
  onBeforeUnmount(unbind)

  return { open, style, scope, show, hide, toggle, place }
}
