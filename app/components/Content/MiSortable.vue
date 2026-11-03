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
  <div class="mi-sort mi:font-mi" :class="[`is-${orientation}`, { 'is-sorting': dragIndex !== null, 'is-disabled': disabled, 'is-bare': bare }]" :style="{ '--mi-sort-gap': `${gap}px` }">
    <ul ref="list" class="mi-sort__list mi:relative mi:[list-style:none] mi:m-0 mi:p-0 mi:flex mi:flex-col mi:gap-(--mi-sort-gap) mi:[.is-horizontal_&]:flex-row mi:[.is-horizontal_&]:items-stretch" role="list" :aria-label="ariaLabel" @focusout="onFocusOut">
      <li
        v-for="(item, i) in model"
        :key="keyOf(item, i)"
        class="mi-sort__item mi:[.is-horizontal_&]:flex-[none] mi:relative mi:flex mi:items-center mi:gap-2.5 mi:py-2.5 mi:px-3.5 mi:rounded-[var(--mi-radius-m,14px)] mi:bg-card mi:text-label mi:shadow-1 mi:[outline:none] mi:touch-auto mi:[-webkit-tap-highlight-color:transparent] mi:[&:not(.has-handle)]:touch-none mi:[&.has-handle]:pl-1.5 mi:[.is-bare_&]:rounded-none mi:[.is-bare_&.is-dragging]:rounded-[var(--mi-radius-m,14px)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px] mi:[.is-sorting_&]:select-none mi:[.is-sorting_&:not(.is-dragging)]:transform-[translate3d(var(--mi-tx,0px),var(--mi-ty,0px),0)] mi:[.is-sorting_&:not(.is-dragging)]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-3 mi:after:opacity-0 mi:after:[transition:opacity_var(--mi-dur-1)_var(--mi-ease)] mi:[&.is-dragging]:z-2 mi:[&.is-dragging]:transform-[translate3d(var(--mi-dx,0px),var(--mi-dy,0px),0)_scale(1.02)] mi:[&.is-dragging]:will-change-transform mi:[&.is-grabbed]:z-1"
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
          class="mi-sort__handle mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:w-8 mi:h-9 mi:-my-1 mi:mx-0 mi:[border:0] mi:rounded-[10px] mi:bg-transparent mi:text-label3 mi:cursor-grab mi:touch-none mi:disabled:opacity-40 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px]"
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
        <div class="mi-sort__content mi:min-w-0 mi:flex-1"><slot :item="item" :index="i" :dragging="dragIndex === i || grabbed === i" /></div>
      </li>
      <li
        v-if="ph" class="mi-sort__ph mi:absolute mi:z-0 mi:pointer-events-none mi:box-border mi:rounded-[var(--mi-radius-m,14px)] mi:[border:2px_dashed_color-mix(in_srgb,var(--mi-p)_45%,transparent)] mi:bg-p-tint mi:opacity-70 mi:transform-[translate3d(var(--mi-px,0px),var(--mi-py,0px),0)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" aria-hidden="true" role="presentation"
        :style="{ width: `${ph.w}px`, height: `${ph.h}px`, left: `${ph.x}px`, top: `${ph.y}px`, [horizontal() ? '--mi-px' : '--mi-py']: `${ph.d}px` }"
      />
    </ul>
    <p :id="`${uid}-help`" class="mi-sort__sr mi:absolute mi:w-px mi:h-px mi:-m-px mi:p-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Press Space to pick up, the arrow keys to move, Space or Enter to drop, Escape to cancel.</p>
    <div class="mi-sort__sr mi:absolute mi:w-px mi:h-px mi:-m-px mi:p-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="assertive" aria-atomic="true">{{ message }}</div>
  </div>
</template>

<style scoped>
.mi-sort{min-width:0}
.mi-sort__item:not(.has-handle){cursor:grab}
.is-bare .mi-sort__item{background:transparent;box-shadow:none}
.mi-sort__handle:hover{background:var(--mi-fill3);color:var(--mi-label2)}
.mi-sort__handle[aria-pressed=true]{color:var(--mi-p-text);background:var(--mi-p-tint)}
.is-disabled .mi-sort__item{cursor:default}
.mi-sort__item.is-dragging{cursor:grabbing;background:var(--mi-elev)}
.mi-sort__item.is-dragging::after,.mi-sort__item.is-grabbed::after{opacity:1}
.mi-sort__item.is-grabbed{box-shadow:inset 0 0 0 2px var(--mi-p)}
</style>
