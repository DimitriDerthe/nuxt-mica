<script setup lang="ts">
/** Row revealing trailing actions on swipe or arrow keys. Wrap a row; `action` is emitted with the chosen action id. */
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

export interface MiSwipeAction {
  id: string
  label: string
  /** Visual tone of the action button. */
  tone?: 'primary' | 'secondary' | 'danger' | 'neutral'
  /** SVG path data (24x24 viewBox, stroked) for the default icon. */
  icon?: string
}

defineSlots<{
  /** Custom content of each action button, replacing the icon and label. */
  action?(props: { action: MiSwipeAction }): unknown
  /** Row content that slides to reveal the actions. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Trailing actions revealed on swipe; the chosen `id` is emitted on `action`. */
  actions: MiSwipeAction[]
  /** Width of each action button in px. */
  actionWidth?: number
  /** Prevents swiping and keeps the actions hidden. */
  disabled?: boolean
  /** Keep the row open after an action is triggered. */
  keepOpen?: boolean
}>(), { actionWidth: 75 })

const emit = defineEmits<{ (e: 'action', id: string): void }>()
/** Whether the actions are revealed. */
const open = defineModel<boolean>('open', { default: false })

const uid = useId()
const root = ref<HTMLElement>()
const content = ref<HTMLElement>()
const acts = ref<HTMLElement>()

const AXIS_LOCK = 6
const RUBBER = 0.25
let sx = 0
let sy = 0
let base = 0
let cur = 0
let lastX = 0
let lastT = 0
let vel = 0
let pid = -1
let lock: 'x' | 'y' | null = null
let down = false
let suppress = false
let raf = 0

const reveal = () => props.actions.length * props.actionWidth

function paint() {
  raf = 0
  content.value?.style.setProperty('--mi-sw-x', cur + 'px')
}

function onDown(e: PointerEvent) {
  suppress = false
  if (props.disabled || !props.actions.length || (e.pointerType === 'mouse' && e.button !== 0)) return
  down = true
  lock = null
  pid = e.pointerId
  sx = e.clientX
  sy = e.clientY
  lastX = e.clientX
  lastT = e.timeStamp
  vel = 0
  base = open.value ? -reveal() : 0
  cur = base
}

function onMove(e: PointerEvent) {
  if (!down || e.pointerId !== pid) return
  const dx = e.clientX - sx
  if (!lock) {
    const dy = e.clientY - sy
    if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return
    if (Math.abs(dy) > Math.abs(dx)) { down = false; return }
    lock = 'x'
    content.value?.classList.add('mi-sw__c--drag')
    try { content.value?.setPointerCapture(pid) } catch { /* pointer already gone */ }
  }
  const dt = e.timeStamp - lastT
  if (dt > 0) vel = (e.clientX - lastX) / dt
  lastX = e.clientX
  lastT = e.timeStamp
  let t = base + dx
  const r = reveal()
  if (t > 0) t *= RUBBER
  else if (t < -r) t = -r + (t + r) * RUBBER
  cur = t
  if (!raf) raf = requestAnimationFrame(paint)
}

function finish(cancel: boolean) {
  if (!down) return
  down = false
  if (lock !== 'x') return
  lock = null
  suppress = true
  if (raf) { cancelAnimationFrame(raf); raf = 0 }
  const el = content.value
  const r = reveal()
  const next = cancel ? open.value : vel < -0.4 ? true : vel > 0.4 ? false : cur < -r / 2
  try { el?.releasePointerCapture(pid) } catch { /* ignore */ }
  el?.classList.remove('mi-sw__c--drag')
  el?.style.removeProperty('--mi-sw-x')
  open.value = next
}

function onUp(e: PointerEvent) {
  if (e.pointerId === pid) finish(false)
}
function onCancel(e: PointerEvent) {
  if (e.pointerId === pid) finish(true)
}

function onClickCapture(e: MouseEvent) {
  if (suppress) {
    suppress = false
    e.preventDefault()
    e.stopPropagation()
    return
  }
  if (open.value) {
    e.preventDefault()
    e.stopPropagation()
    open.value = false
  }
}

function focusContent() {
  const f = content.value?.querySelector<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')
  f?.focus({ preventScroll: true })
}

function onKey(e: KeyboardEvent) {
  if (props.disabled || !props.actions.length || e.altKey || e.ctrlKey || e.metaKey) return
  const t = e.target as HTMLElement
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return
  if (e.key === 'ArrowLeft' && !open.value) {
    e.preventDefault()
    open.value = true
    nextTick(() => acts.value?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }))
  } else if ((e.key === 'ArrowRight' || e.key === 'Escape') && open.value) {
    e.preventDefault()
    const inside = acts.value?.contains(document.activeElement)
    open.value = false
    if (inside) nextTick(focusContent)
  }
}

function trigger(a: MiSwipeAction) {
  emit('action', a.id)
  if (!props.keepOpen) open.value = false
}

function outside(e: Event) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

watch(open, (v) => {
  if (typeof document === 'undefined') return
  if (v) document.addEventListener('pointerdown', outside, { passive: true, capture: true })
  else document.removeEventListener('pointerdown', outside, { capture: true })
}, { immediate: true })

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  if (typeof document !== 'undefined') document.removeEventListener('pointerdown', outside, { capture: true })
})
</script>

<template>
  <div
    ref="root"
    class="mi-sw mi:relative mi:overflow-hidden mi:font-mi mi:min-w-0"
    :class="{ 'mi-sw--open': open }"
    role="group"
    aria-roledescription="swipeable row"
    :aria-describedby="`${uid}-hint`"
    :style="{ '--mi-sw-reveal': reveal() + 'px', '--mi-sw-aw': actionWidth + 'px' }"
    @keydown="onKey"
  >
    <span :id="`${uid}-hint`" class="mi-sw__hint mi:absolute mi:w-px mi:h-px mi:-m-px mi:p-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap mi:[border:0]">Swipe left or press the left arrow key to reveal actions. Press the right arrow key or Escape to hide them.</span>
    <div ref="acts" class="mi-sw__acts mi:absolute mi:top-0 mi:right-0 mi:bottom-0 mi:flex mi:w-(--mi-sw-reveal)" :inert="!open" :aria-hidden="open ? undefined : 'true'">
      <button
        v-for="a in actions"
        :key="a.id"
        type="button"
        class="mi-sw__act mi:flex-[none] mi:flex mi:flex-col mi:items-center mi:justify-center mi:gap-1 mi:w-(--mi-sw-aw) mi:[border:0] mi:p-0 mi:text-[13px] mi:font-semibold mi:font-[inherit] mi:text-label mi:bg-fill2 mi:focus-visible:outline-offset-[-3px]"
        :class="`mi-sw__act--${a.tone ?? 'neutral'}`"
        @click="trigger(a)"
      >
        <slot name="action" :action="a">
          <svg v-if="a.icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="a.icon" /></svg>
          <span>{{ a.label }}</span>
        </slot>
      </button>
    </div>
    <div
      ref="content"
      class="mi-sw__c mi:[--mi-sw-x:0px] mi:relative mi:z-1 mi:bg-card mi:touch-pan-y mi:transform-[translate3d(var(--mi-sw-x),0,0)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:[.mi-sw--open_&]:[--mi-sw-x:calc(var(--mi-sw-reveal)_*_-1)] mi:[&.mi-sw__c--drag]:[transition:none] mi:[&.mi-sw__c--drag]:will-change-transform mi:[&.mi-sw__c--drag]:select-none mi:[&.mi-sw__c--drag]:cursor-grabbing"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onCancel"
      @click.capture="onClickCapture"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.mi-sw__act--primary{background:var(--mi-p);color:var(--mi-p-on)}
.mi-sw__act--secondary{background:var(--mi-s);color:var(--mi-s-on)}
.mi-sw__act--danger{background:var(--mi-red-t);color:#fff}
</style>
