<script lang="ts">
/** Shared across instances: moving between neighbouring tooltips skips the open delay. */
let lastClosedAt = 0
</script>

<script setup lang="ts">
/** Hover and focus hint for an icon or short label, with optional shortcut text; opens after a delay, instant between neighbours. */
import { nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, useSlots, watch } from 'vue'
import { MI_OVERLAY_Z, miOverlayPosition, miOverlayRaf, type MiOverlayPlacement, type MiOverlaySide } from '../../utils/miOverlay'
import { isNavigationShortcut, matchShortcut, mayFireGlobally, parseShortcut } from '../../utils/miShortcut'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Tooltip text. Use the `content` slot for rich content. */
  content?: string
  /** Keyboard shortcut such as `⌘D` or `E`: shown next to the text, and pressing it clicks the trigger (plain keys are ignored while typing in a field). */
  shortcut?: string
  /** Side and alignment of the tooltip relative to the trigger; flips when it would leave the viewport. */
  placement?: MiOverlayPlacement
  /** Delay before opening on hover, in ms. Focus opens immediately. */
  delay?: number
  /** Delay before closing, in ms. */
  closeDelay?: number
  /** Gap between trigger and tooltip, in px. */
  offset?: number
  /** Prevents the tooltip from appearing. */
  disabled?: boolean
}>(), {
  placement: 'top',
  delay: 500,
  closeDelay: 0,
  offset: 8
})

/** Force the tooltip open or closed. Leave unbound for hover / focus behaviour. */
const open = defineModel<boolean>({ default: false })

const slots = useSlots()
const id = `mi-tip-${useId()}`
const anchor = ref<HTMLElement | null>(null)
const mounted = ref(false)
const geo = ref({ x: 0, y: 0, side: 'top' as MiOverlaySide })
const clipped = ref(false)
const bubble = ref<HTMLElement | null>(null)
let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

function place() {
  const a = anchor.value
  const b = bubble.value
  if (!a || !b) return
  const r = a.getBoundingClientRect()
  clipped.value = r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth
  const res = miOverlayPosition(
    { left: r.left, top: r.top, width: r.width, height: r.height },
    { width: b.offsetWidth, height: b.offsetHeight },
    props.placement,
    { offset: props.offset, viewport: { width: window.innerWidth, height: window.innerHeight }, padding: 8 }
  )
  geo.value = { x: res.x, y: res.y, side: res.side }
}
const placeRaf = miOverlayRaf(place)

function show(immediate: boolean) {
  if (props.disabled || (!props.content && !props.shortcut && !slots.content)) return
  clearTimeout(closeTimer)
  clearTimeout(openTimer)
  const wait = immediate || Date.now() - lastClosedAt < 300 ? 0 : props.delay
  if (wait <= 0) {
    open.value = true
  } else {
    openTimer = setTimeout(() => { open.value = true }, wait)
  }
}
function hide(immediate = false) {
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  if (!open.value) return
  if (immediate || props.closeDelay <= 0) {
    open.value = false
  } else {
    closeTimer = setTimeout(() => { open.value = false }, props.closeDelay)
  }
}

async function onOpened() {
  await nextTick()
  place()
  window.addEventListener('scroll', placeRaf, { capture: true, passive: true })
  window.addEventListener('resize', placeRaf, { passive: true })
  document.addEventListener('keydown', onDocKey, true)
}

watch(open, (v) => {
  if (typeof window === 'undefined') return
  if (v) {
    onOpened()
  } else {
    lastClosedAt = Date.now()
    window.removeEventListener('scroll', placeRaf, { capture: true } as EventListenerOptions)
    window.removeEventListener('resize', placeRaf)
    document.removeEventListener('keydown', onDocKey, true)
    placeRaf.cancel()
  }
})

function onDocKey(e: KeyboardEvent) {
  if (e.key === 'Escape') hide(true)
}

function onEnter(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  show(false)
}
/** Focus caused by a pointer press should not pop a tooltip; keyboard focus should. */
let lastPointerAt = 0
function onPointerDown() {
  lastPointerAt = Date.now()
  hide(true)
}
function onFocusIn() {
  if (Date.now() - lastPointerAt > 120) show(true)
}

function describe() {
  const el = (anchor.value?.firstElementChild ?? anchor.value) as HTMLElement | null
  if (!el) return
  const cur = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
  if (!cur.includes(id)) el.setAttribute('aria-describedby', [...cur, id].join(' '))
}

/** Pressing the shortcut activates the trigger, as the hint promises. */
function onShortcut(e: KeyboardEvent) {
  const s = parseShortcut(props.shortcut)
  if (!s || props.disabled || e.defaultPrevented || isNavigationShortcut(s) || !matchShortcut(e, s) || !mayFireGlobally(e, s)) return
  const el = (anchor.value?.firstElementChild ?? anchor.value) as HTMLButtonElement | null
  if (!el?.isConnected || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.getClientRects().length === 0) return
  e.preventDefault()
  el.click()
}

onMounted(() => {
  mounted.value = true
  describe()
  document.addEventListener('keydown', onShortcut)
  if (open.value) onOpened()
})
onUpdated(describe)
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('keydown', onShortcut)
  clearTimeout(openTimer)
  clearTimeout(closeTimer)
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', placeRaf, { capture: true } as EventListenerOptions)
    window.removeEventListener('resize', placeRaf)
    document.removeEventListener('keydown', onDocKey, true)
  }
  placeRaf.cancel()
})

defineSlots<{
  /** Trigger element; bind `id` to its `aria-describedby` and read `open` for state. */
  default?(props: { id: string, open: boolean }): unknown
  /** Rich tooltip content; replaces the `content` prop text. */
  content?(): unknown
}>()
</script>

<template>
  <span
    ref="anchor"
    class="mi-tip-anchor"
    v-bind="$attrs"
    @pointerenter="onEnter"
    @pointerleave="hide()"
    @pointerdown="onPointerDown"
    @focusin="onFocusIn"
    @focusout="hide(true)"
  >
    <slot :id="id" :open="open" />
  </span>
  <Teleport v-if="mounted" to="body">
    <div class="mi mi-tip-pos mi:fixed mi:left-0 mi:top-0 mi:pointer-events-none mi:font-mi" :style="{ transform: `translate3d(${geo.x}px,${geo.y}px,0)`, zIndex: MI_OVERLAY_Z.tooltip }">
      <div :id="id" ref="bubble" role="tooltip" class="mi-tip mi:box-border mi:min-h-6.5 mi:py-1 mi:px-[9px] mi:rounded-[6px] mi:bg-elev mi:shadow-2 mi:text-label mi:text-[12px] mi:leading-[18px] mi:whitespace-nowrap mi:inline-flex mi:items-center mi:gap-2 mi:tracking-[-.005em] mi:opacity-0 mi:invisible mi:transform-[translate3d(0,3px,0)_scale(.96)] mi:[transition:opacity_var(--mi-dur-1)_var(--mi-ease),transform_var(--mi-dur-1)_var(--mi-ease),visibility_0s_linear_var(--mi-dur-1)] mi:[&.is-in]:opacity-100 mi:[&.is-in]:visible mi:[&.is-in]:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-2)_var(--mi-ease),visibility_0s]" :class="{ 'is-in': open && !clipped }" :data-side="geo.side">
        <slot name="content"><span>{{ content }}</span></slot>
        <span v-if="shortcut" class="mi-tip-short mi:text-label2">{{ shortcut }}</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-tip-anchor{display:inline-flex}
.mi-tip[data-side=bottom]{transform:translate3d(0,-3px,0) scale(.96)}
.mi-tip[data-side=left]{transform:translate3d(3px,0,0) scale(.96)}
.mi-tip[data-side=right]{transform:translate3d(-3px,0,0) scale(.96)}
.mi-tip.is-in{transform:none}
</style>
