<script setup lang="ts">
/** Drag-and-drop reorderable list with no dependencies: pointer drag with a placeholder and auto-scroll, plus keyboard reordering with live announcements; v-model is the array of items. */
import { nextTick, onBeforeUnmount, ref, useId } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MiSortableItem = Record<string, any>

defineSlots<{
  /** Row content for each item. */
  default?(props: { item: MiSortableItem, index: number, dragging: boolean }): unknown
  /** Replaces the grip glyph inside the drag handle (only with `handle`). */
  handle?(props: { item: MiSortableItem, index: number, dragging: boolean }): unknown
}>()

const props = withDefaults(defineProps<{
  /** Field of each item used as its unique key (primitive items use themselves). */
  itemKey?: string
  /** Show a dedicated drag handle per row; only the handle starts a drag and takes keyboard focus. Recommended on touch screens. Without it the whole row drags. */
  handle?: boolean
  /** `vertical` stacks rows, `horizontal` lays them out in a row. */
  orientation?: 'vertical' | 'horizontal'
  /** Gap between rows in px. */
  gap?: number
  /** Scroll the nearest scrollable ancestor while dragging near its edge. */
  autoScroll?: boolean
  /** Turns off dragging and keyboard reordering. */
  disabled?: boolean
  /** Rows without their card shell (no background, shadow or rounding) so the slot draws its own row; the dragged row still lifts. */
  bare?: boolean
  /** Accessible name of the list. */
  ariaLabel?: string
  /** Returns the spoken name of an item in announcements and handle labels. Defaults to "Item N". */
  itemLabel?: (item: MiSortableItem, index: number) => string
}>(), { itemKey: 'id', orientation: 'vertical', gap: 8, autoScroll: true, ariaLabel: 'Sortable list' })

/** The ordered items. Updated on drop (pointer) or on every step (keyboard). */

const model = defineModel<MiSortableItem[]>({ default: () => [] })
const emit = defineEmits<{ reorder: [move: { from: number, to: number }] }>()

const list = ref<HTMLElement | null>(null)
const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)
const shifts = ref<number[]>([])
const ph = ref<{ w: number, h: number, x: number, y: number, d: number } | null>(null)
const grabbed = ref<number | null>(null)
const message = ref('')
const uid = `mi-sort-${useId()}`
const horizontal = () => props.orientation === 'horizontal'

const keyOf = (item: MiSortableItem, i: number): string | number => {
  const k = item !== null && typeof item === 'object' ? item[props.itemKey] : item
  return k ?? i
}
const labelOf = (item: MiSortableItem, i: number) => props.itemLabel?.(item, i) ?? `Item ${i + 1}`
const rowEls = () => Array.from(list.value?.querySelectorAll<HTMLElement>(':scope > li.mi-sort__item') ?? [])
function move<T>(arr: T[], from: number, to: number): T[] {
  const out = arr.slice()
  const [it] = out.splice(from, 1)
  out.splice(to, 0, it as T)
  return out
}

/* ---------- pointer drag: one rAF writes transform through CSS variables; rects are measured once at drag start ---------- */
interface Span { s: number, e: number }
let pending: { idx: number, el: HTMLElement, x: number, y: number } | null = null
let spans: Span[] = []
let from = -1
let el: HTMLElement | null = null
let startPtr = 0
let startScroll = 0
let ptr = 0
let scroller: HTMLElement | null = null
let edge = { lo: 0, hi: 0 }
let raf = 0

function scrollPos() {
  if (scroller) return horizontal() ? scroller.scrollLeft : scroller.scrollTop
  return horizontal() ? window.scrollX : window.scrollY
}
function findScroller(): HTMLElement | null {
  for (let n: HTMLElement | null = list.value; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n)
    const ov = horizontal() ? cs.overflowX : cs.overflowY
    if ((ov === 'auto' || ov === 'scroll') && (horizontal() ? n.scrollWidth > n.clientWidth : n.scrollHeight > n.clientHeight)) return n
  }
  return null
}

function onDown(e: PointerEvent, idx: number) {
  if (props.disabled || (e.pointerType === 'mouse' && e.button !== 0) || pending || dragIndex.value !== null) return
  const target = e.target as HTMLElement
  if (props.handle ? !target.closest('[data-mi-handle]') : target.closest('button,a,input,textarea,select,[contenteditable],[data-mi-nodrag]')) return
  const row = (e.currentTarget as HTMLElement)
  pending = { idx, el: row, x: e.clientX, y: e.clientY }
  try { row.setPointerCapture?.(e.pointerId) } catch { /* not capturable */ }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onCancel)
  window.addEventListener('keydown', onWinKey)
}
function detach() {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onCancel)
  window.removeEventListener('keydown', onWinKey)
  cancelAnimationFrame(raf)
  raf = 0
}
function onMove(e: PointerEvent) {
  if (!pending && dragIndex.value === null) return
  ptr = horizontal() ? e.clientX : e.clientY
  if (pending && dragIndex.value === null) {
    if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < 4) return
    start()
  }
  if (dragIndex.value !== null && !raf) raf = requestAnimationFrame(tick)
}
function start() {
  if (!pending || !list.value) return
  from = pending.idx
  el = pending.el
  const h = horizontal()
  scroller = props.autoScroll ? findScroller() : null
  startScroll = scrollPos()
  const sr = scroller ? scroller.getBoundingClientRect() : null
  edge = sr
    ? (h ? { lo: sr.left, hi: sr.right } : { lo: sr.top, hi: sr.bottom })
    : { lo: 0, hi: h ? window.innerWidth : window.innerHeight }
  spans = rowEls().map((r) => {
    const b = r.getBoundingClientRect()
    return h ? { s: b.left + startScroll, e: b.right + startScroll } : { s: b.top + startScroll, e: b.bottom + startScroll }
  })
  startPtr = h ? pending.x : pending.y
  ph.value = { w: el.offsetWidth, h: el.offsetHeight, x: el.offsetLeft, y: el.offsetTop, d: 0 }
  shifts.value = spans.map(() => 0)
  overIndex.value = from
  dragIndex.value = from
  message.value = ''
  pending = null
}
function tick() {
  raf = 0
  if (dragIndex.value === null || !el) return
  let moving = false
  if (scroller || props.autoScroll) {
    const zone = 56
    const d = ptr < edge.lo + zone ? -(1 - Math.max(ptr - edge.lo, 0) / zone) : ptr > edge.hi - zone ? 1 - Math.max(edge.hi - ptr, 0) / zone : 0
    if (d !== 0) {
      const dy = Math.round(d * 18)
      if (scroller) { if (horizontal()) scroller.scrollLeft += dy; else scroller.scrollTop += dy } else window.scrollBy(horizontal() ? dy : 0, horizontal() ? 0 : dy)
      moving = true
    }
  }
  const me = spans[from]!
  const size = me.e - me.s
  const lo = spans[0]!.s - me.s
  const hi = spans[spans.length - 1]!.e - me.e
  const off = Math.min(Math.max(ptr - startPtr + (scrollPos() - startScroll), lo), hi)
  el.style.setProperty(horizontal() ? '--mi-dx' : '--mi-dy', `${off}px`)
  const centre = me.s + size / 2 + off
  let over = from
  spans.forEach((sp, i) => {
    const mid = (sp.s + sp.e) / 2
    if (i > from && centre >= mid) over = i
    if (i < from && centre <= mid && i < over) over = i
  })
  if (over !== overIndex.value) {
    overIndex.value = over
    shifts.value = spans.map((sp, i) => {
      if (over > from && i > from && i <= over) return spans[i - 1]!.s - sp.s
      if (over < from && i >= over && i < from) return spans[i + 1]!.s - sp.s
      return 0
    })
    if (ph.value) ph.value = { ...ph.value, d: (over > from ? spans[over]!.e - size : spans[over]!.s) - me.s }
  }
  if (moving) raf = requestAnimationFrame(tick)
}
function finish(commit: boolean) {
  detach()
  const to = overIndex.value
  const wasDragging = dragIndex.value !== null
  if (el) { el.style.removeProperty('--mi-dx'); el.style.removeProperty('--mi-dy') }
  pending = null
  el = null
  dragIndex.value = null
  overIndex.value = null
  ph.value = null
  shifts.value = []
  if (wasDragging && commit && to !== null && to !== from) {
    model.value = move(model.value, from, to)
    emit('reorder', { from, to })
    message.value = `${labelOf(model.value[to]!, to)} moved to position ${to + 1} of ${model.value.length}.`
  }
}
const onUp = () => finish(true)
const onCancel = () => finish(false)
function onWinKey(e: KeyboardEvent) { if (e.key === 'Escape') finish(false) }

/* ---------- keyboard ---------- */
let restoring = false
let snapshot: MiSortableItem[] | null = null
async function refocus(i: number) {
  restoring = true
  await nextTick()
  const row = rowEls()[i]
  ;(props.handle ? row?.querySelector<HTMLElement>('[data-mi-handle]') : row)?.focus()
  restoring = false
}
function drop(announce = true) {
  if (grabbed.value === null) return
  const at = grabbed.value
  grabbed.value = null
  snapshot = null
  if (announce) message.value = `${labelOf(model.value[at]!, at)} dropped at position ${at + 1} of ${model.value.length}.`
}
function onKey(e: KeyboardEvent, idx: number) {
  if (props.disabled || e.ctrlKey || e.metaKey || e.altKey) return
  const t = e.target as HTMLElement
  if (props.handle ? !t.closest('[data-mi-handle]') : t !== e.currentTarget) return
  const n = model.value.length
  if (grabbed.value === null) {
    if (e.key === ' ') {
      e.preventDefault()
      snapshot = model.value.slice()
      grabbed.value = idx
      message.value = `${labelOf(model.value[idx]!, idx)} picked up, position ${idx + 1} of ${n}. Use the arrow keys to move, Space to drop, Escape to cancel.`
    }
    return
  }
  const h = horizontal()
  const cur = grabbed.value
  let to = cur
  if (e.key === (h ? 'ArrowLeft' : 'ArrowUp')) to = Math.max(cur - 1, 0)
  else if (e.key === (h ? 'ArrowRight' : 'ArrowDown')) to = Math.min(cur + 1, n - 1)
  else if (e.key === 'Home') to = 0
  else if (e.key === 'End') to = n - 1
  else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); drop(); return }
  else if (e.key === 'Escape') {
    e.preventDefault()
    const back = snapshot ? Math.max(snapshot.indexOf(model.value[cur]!), 0) : cur
    if (snapshot) model.value = snapshot
    grabbed.value = null
    snapshot = null
    message.value = `Reorder cancelled. ${labelOf(model.value[back]!, back)} returned to position ${back + 1} of ${n}.`
    void refocus(back)
    return
  }
  else return
  e.preventDefault()
  if (to === cur) { message.value = `${labelOf(model.value[cur]!, cur)} is already at position ${cur + 1} of ${n}.`; return }
  model.value = move(model.value, cur, to)
  emit('reorder', { from: cur, to })
  grabbed.value = to
  message.value = `${labelOf(model.value[to]!, to)} moved to position ${to + 1} of ${n}.`
  void refocus(to)
}
function onFocusOut(e: FocusEvent) {
  if (restoring || grabbed.value === null) return
  if (!list.value?.contains(e.relatedTarget as Node | null)) drop()
}

onBeforeUnmount(detach)
</script>

<template>
  <div class="mi-sort" :class="[`is-${orientation}`, { 'is-sorting': dragIndex !== null, 'is-disabled': disabled, 'is-bare': bare }]" :style="{ '--mi-sort-gap': `${gap}px` }">
    <ul ref="list" class="mi-sort__list" role="list" :aria-label="ariaLabel" @focusout="onFocusOut">
      <li
        v-for="(item, i) in model"
        :key="keyOf(item, i)"
        class="mi-sort__item"
        :class="{ 'is-dragging': dragIndex === i, 'is-grabbed': grabbed === i, 'has-handle': handle }"
        :tabindex="handle || disabled ? undefined : 0"
        aria-roledescription="sortable item"
        :aria-describedby="handle ? undefined : `${uid}-help`"
        :style="dragIndex !== null && dragIndex !== i && shifts[i] ? { [horizontal() ? '--mi-tx' : '--mi-ty']: `${shifts[i]}px` } : undefined"
        @pointerdown="onDown($event, i)"
        @keydown="onKey($event, i)"
      >
        <button
          v-if="handle"
          type="button"
          class="mi-sort__handle"
          data-mi-handle
          :disabled="disabled"
          :aria-label="`Reorder ${labelOf(item, i)}`"
          :aria-describedby="`${uid}-help`"
          :aria-pressed="grabbed === i"
        >
          <slot name="handle" :item="item" :index="i" :dragging="dragIndex === i || grabbed === i">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true"><circle cx="4" cy="3" r="1.5" /><circle cx="10" cy="3" r="1.5" /><circle cx="4" cy="9" r="1.5" /><circle cx="10" cy="9" r="1.5" /><circle cx="4" cy="15" r="1.5" /><circle cx="10" cy="15" r="1.5" /></svg>
          </slot>
        </button>
        <div class="mi-sort__content"><slot :item="item" :index="i" :dragging="dragIndex === i || grabbed === i" /></div>
      </li>
      <li
        v-if="ph" class="mi-sort__ph" aria-hidden="true" role="presentation"
        :style="{ width: `${ph.w}px`, height: `${ph.h}px`, left: `${ph.x}px`, top: `${ph.y}px`, [horizontal() ? '--mi-px' : '--mi-py']: `${ph.d}px` }"
      />
    </ul>
    <p :id="`${uid}-help`" class="mi-sort__sr">Press Space to pick up, the arrow keys to move, Space or Enter to drop, Escape to cancel.</p>
    <div class="mi-sort__sr" role="status" aria-live="assertive" aria-atomic="true">{{ message }}</div>
  </div>
</template>

<style scoped>
.mi-sort{font-family:var(--mi-font);min-width:0}
.mi-sort__list{position:relative;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--mi-sort-gap)}
.is-horizontal .mi-sort__list{flex-direction:row;align-items:stretch}
.is-horizontal .mi-sort__item{flex:none}
.mi-sort__item{position:relative;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:var(--mi-radius-m,14px);background:var(--mi-card);color:var(--mi-label);box-shadow:var(--mi-sh1);outline:none;touch-action:auto;-webkit-tap-highlight-color:transparent}
.mi-sort__item:not(.has-handle){cursor:grab}
.mi-sort__item:not(.has-handle){touch-action:none}
.mi-sort__item.has-handle{padding-left:6px}
.is-bare .mi-sort__item{background:transparent;box-shadow:none;border-radius:0}
.is-bare .mi-sort__item.is-dragging{border-radius:var(--mi-radius-m,14px)}
.mi-sort__content{min-width:0;flex:1}
.mi-sort__handle{flex:none;display:flex;align-items:center;justify-content:center;width:32px;height:36px;margin:-4px 0;border:0;border-radius:10px;background:transparent;color:var(--mi-label3);cursor:grab;touch-action:none}
.mi-sort__handle:hover{background:var(--mi-fill3);color:var(--mi-label2)}
.mi-sort__handle[aria-pressed=true]{color:var(--mi-p-text);background:var(--mi-p-tint)}
.mi-sort__handle:disabled{opacity:.4;cursor:default}
.mi-sort__item:focus-visible,.mi-sort__handle:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
.is-disabled .mi-sort__item{cursor:default}
.is-sorting .mi-sort__item{user-select:none}
.is-sorting .mi-sort__item:not(.is-dragging){transform:translate3d(var(--mi-tx,0px),var(--mi-ty,0px),0);transition:transform var(--mi-dur-2) var(--mi-ease)}
.mi-sort__item::after{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:var(--mi-sh3);opacity:0;transition:opacity var(--mi-dur-1) var(--mi-ease)}
.mi-sort__item.is-dragging{z-index:2;cursor:grabbing;transform:translate3d(var(--mi-dx,0px),var(--mi-dy,0px),0) scale(1.02);will-change:transform;background:var(--mi-elev)}
.mi-sort__item.is-dragging::after,.mi-sort__item.is-grabbed::after{opacity:1}
.mi-sort__item.is-grabbed{z-index:1;box-shadow:inset 0 0 0 2px var(--mi-p)}
.mi-sort__ph{position:absolute;z-index:0;pointer-events:none;box-sizing:border-box;border-radius:var(--mi-radius-m,14px);border:2px dashed color-mix(in srgb,var(--mi-p) 45%,transparent);background:var(--mi-p-tint);opacity:.7;transform:translate3d(var(--mi-px,0px),var(--mi-py,0px),0);transition:transform var(--mi-dur-2) var(--mi-ease)}
.mi-sort__sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
</style>
