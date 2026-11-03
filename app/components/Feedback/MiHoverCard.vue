<script setup lang="ts">
/** Rich preview card shown when a trigger is hovered or focused, with open and close delays; non-modal and never steals focus. */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import {
  MI_OVERLAY_Z,
  miOverlayPosition,
  miOverlayRaf,
  useMiPresence,
  type MiOverlayPlacement,
  type MiOverlaySide
} from '../../utils/miOverlay'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Side of the trigger the card appears on. */
  side?: MiOverlaySide
  /** Alignment along that side. */
  align?: 'start' | 'center' | 'end'
  /** Gap between the trigger and the card, in px. */
  offset?: number
  /** Delay before opening on hover or focus, in ms. */
  delay?: number
  /** Delay before closing after the pointer or focus leaves, in ms. */
  closeDelay?: number
  /** Card width in px (or any CSS length). */
  width?: number | string
  /** Accessible name of the card. */
  label?: string
  /** Render the card in flow under the trigger (documentation and boards). */
  inline?: boolean
  /** Prevents the card from opening and closes it if already open. */
  disabled?: boolean
}>(), {
  side: 'bottom',
  align: 'center',
  offset: 8,
  delay: 600,
  closeDelay: 300,
  width: 256
})

/** Whether the card is open. Hover and focus open it by themselves; bind this to control it. */

const open = defineModel<boolean>({ default: false })

const placement = computed<MiOverlayPlacement>(() => (props.align === 'center' ? props.side : `${props.side}-${props.align}`))
const cardId = `mi-hc-${useId()}`
const anchor = ref<HTMLElement | null>(null)
const card = ref<HTMLElement | null>(null)
const { rendered } = useMiPresence(open)
const ready = ref(false)
const geo = ref({ x: 0, y: 0, side: 'bottom' as MiOverlaySide })
let timer: ReturnType<typeof setTimeout> | undefined
let leaveTimer: ReturnType<typeof setTimeout> | undefined

function clear() { clearTimeout(timer) }
function show() {
  if (props.disabled) return
  clear()
  if (open.value) return
  timer = setTimeout(() => { open.value = true }, props.delay)
}
function hide() {
  clear()
  if (!open.value) return
  timer = setTimeout(() => { open.value = false }, props.closeDelay)
}
function keep() {
  if (open.value) clear()
}
function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (next && (anchor.value?.contains(next) || card.value?.contains(next))) return
  hide()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    clear()
    open.value = false
  }
}

function place() {
  const a = anchor.value
  const c = card.value
  if (!a || !c) return
  const r = a.getBoundingClientRect()
  const res = miOverlayPosition(
    { left: r.left, top: r.top, width: r.width, height: r.height },
    { width: c.offsetWidth, height: c.offsetHeight },
    placement.value,
    { offset: props.offset, viewport: { width: window.innerWidth, height: window.innerHeight }, padding: 8 }
  )
  geo.value = { x: res.x, y: res.y, side: res.side }
  ready.value = true
}
const placeRaf = miOverlayRaf(place)

function addGlobal() {
  window.addEventListener('resize', placeRaf, { passive: true })
  window.addEventListener('scroll', placeRaf, { capture: true, passive: true })
  document.addEventListener('keydown', onKey, true)
}
function removeGlobal() {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', placeRaf)
  window.removeEventListener('scroll', placeRaf, { capture: true } as EventListenerOptions)
  document.removeEventListener('keydown', onKey, true)
  placeRaf.cancel()
}

watch(open, async (v) => {
  clearTimeout(leaveTimer)
  syncAria()
  if (props.inline) return
  if (v) {
    ready.value = false
    await nextTick()
    place()
    addGlobal()
  } else {
    ready.value = false
    removeGlobal()
    leaveTimer = setTimeout(() => { if (!open.value) rendered.value = false }, 200)
  }
})
watch(() => props.disabled, (d) => { if (d) { clear(); open.value = false } })

function syncAria() {
  const t = anchor.value?.firstElementChild as HTMLElement | null | undefined
  if (!t) return
  t.setAttribute('aria-describedby', cardId)
}

onBeforeUnmount(() => {
  clear()
  clearTimeout(leaveTimer)
  removeGlobal()
})

const shown = computed(() => props.inline || open.value)
const cardStyle = computed(() => {
  const w = typeof props.width === 'number' ? `${props.width}px` : props.width
  return { width: w }
})

defineSlots<{
  /** Element that opens the card on hover or focus; `open` reflects the current state. */
  trigger?(props: { open: boolean }): unknown
  /** Content of the card. */
  default?(): unknown
}>()
</script>

<template>
  <span
    v-if="$slots.trigger"
    ref="anchor"
    class="mi-hc-anchor mi:inline-flex"
    @pointerenter="show"
    @pointerleave="hide"
    @focusin="show"
    @focusout="onFocusOut"
  >
    <slot name="trigger" :open="open" />
  </span>
  <Teleport to="body" :disabled="inline">
    <div
      v-if="inline || rendered"
      class="mi mi-hc-pos mi:fixed mi:left-0 mi:top-0 mi:font-mi mi:[&.is-inline]:static mi:[&.is-inline]:block"
      :class="{ 'is-inline': inline }"
      :style="inline ? undefined : { transform: `translate3d(${geo.x}px,${geo.y}px,0)`, zIndex: MI_OVERLAY_Z.popover }"
    >
      <div
        v-if="shown || rendered"
        :id="cardId"
        ref="card"
        v-bind="$attrs"
        class="mi-hc mi:relative mi:box-border mi:max-w-[calc(100vw_-_16px)] mi:p-4 mi:rounded-[14px] mi:bg-elev mi:shadow-[var(--mi-sh3),0_0_0_.5px_var(--mi-mat-b)] mi:text-label mi:tracking-[-.01em] mi:text-[14px] mi:leading-5 mi:opacity-0 mi:transform-[scale(.96)] mi:pointer-events-none mi:[&.is-in]:opacity-100 mi:[&.is-in]:transform-none mi:[&.is-in]:pointer-events-auto mi:[&.is-in]:[transition:transform_var(--mi-dur-3)_var(--mi-spring),opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:not(.is-in)]:[transition:transform_var(--mi-dur-2)_var(--mi-ease),opacity_var(--mi-dur-1)_var(--mi-ease)] mi:[&[data-side=bottom]]:origin-[50%_0] mi:[&[data-side=top]]:origin-[50%_100%] mi:[.mi-hc-pos.is-inline_&]:mt-1.5"
        :class="{ 'is-in': inline || (open && ready) }"
        :data-side="inline ? 'bottom' : geo.side"
        role="tooltip"
        :aria-label="label"
        :style="cardStyle"
        @pointerenter="keep"
        @pointerleave="hide"
        @focusin="keep"
        @focusout="onFocusOut"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
