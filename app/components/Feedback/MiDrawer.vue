<script setup lang="ts">
/** Edge drawer (bottom, top, left or right) with a drag handle and swipe-to-dismiss; use MiSheet for detent-based bottom sheets. */
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { MI_OVERLAY_Z, miOverlayRaf, useMiOverlay, useMiPresence } from '../../utils/miOverlay'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Direction the drawer is swiped to dismiss, which also sets its edge: `down` is a bottom drawer, `right` a right-hand one. */
  swipeDirection?: 'down' | 'up' | 'left' | 'right'
  /** Heading text (or use the `title` slot). */
  title?: string
  /** Supporting text under the title (or use the `description` slot). */
  description?: string
  /** Show the swipe handle bar. */
  showSwipeHandle?: boolean
  /** Allow swipe, Escape and scrim click to dismiss. */
  dismissible?: boolean
  /** Dim the page, trap focus and lock scroll. */
  modal?: boolean
  /** Render the panel in place without teleport, scrim or drag (documentation and boards). */
  inline?: boolean
  /** Accessible name when there is no title. */
  label?: string
}>(), {
  swipeDirection: 'down',
  showSwipeHandle: false,
  dismissible: true,
  modal: true
})

const emit = defineEmits<{
  close: [reason: 'escape' | 'backdrop' | 'drag']
}>()

/** Whether the drawer is open. */

const open = defineModel<boolean>({ default: false })

const uid = useId()
const titleId = `mi-dr-t-${uid}`
const descId = `mi-dr-d-${uid}`
const panel = ref<HTMLElement | null>(null)
const card = ref<HTMLElement | null>(null)
const dragging = ref(false)
const { rendered, afterLeave } = useMiPresence(open)

const SIDES = { down: 'bottom', up: 'top', left: 'left', right: 'right' } as const
const side = computed(() => SIDES[props.swipeDirection])
const vertical = computed(() => side.value === 'bottom' || side.value === 'top')
const showHandle = computed(() => props.showSwipeHandle)
/** +1 when moving away from the edge is positive along the axis. */
const sign = computed(() => (side.value === 'bottom' || side.value === 'right' ? 1 : -1))

function close(reason: 'escape' | 'backdrop' | 'drag') {
  if (!props.inline) open.value = false
  emit('close', reason)
}
function dismiss(reason: 'escape' | 'backdrop') {
  if (props.dismissible) close(reason)
}

let start = 0
let size = 0
let last = 0
let lastT = 0
let vel = 0
let delta = 0
const apply = miOverlayRaf(() => {
  card.value?.style.setProperty('--mi-dr-drag', `${delta}px`)
})

function axisPos(e: PointerEvent) { return vertical.value ? e.clientY : e.clientX }
function onDragStart(e: PointerEvent) {
  if (props.inline || !props.dismissible || !card.value) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return
  size = vertical.value ? card.value.offsetHeight : card.value.offsetWidth
  start = last = axisPos(e)
  lastT = e.timeStamp
  vel = 0
  delta = 0
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}
function onDragMove(e: PointerEvent) {
  if (!dragging.value) return
  const p = axisPos(e)
  const raw = (p - start) * sign.value
  delta = raw < 0 ? raw * 0.15 : raw
  const dt = e.timeStamp - lastT
  if (dt > 0) vel = vel * 0.6 + (((p - last) * sign.value) / dt) * 0.4
  last = p
  lastT = e.timeStamp
  apply()
}
function onDragEnd(e: PointerEvent) {
  if (!dragging.value) return
  apply.cancel()
  dragging.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  const projected = delta + vel * 180
  card.value?.style.removeProperty('--mi-dr-drag')
  if (projected > size * 0.4 || vel > 0.6) close('drag')
}
onBeforeUnmount(() => apply.cancel())

let downOnScrim = false
function onScrimDown(e: PointerEvent) { downOnScrim = e.target === e.currentTarget }
function onScrimClick(e: MouseEvent) {
  if (downOnScrim && e.target === e.currentTarget) dismiss('backdrop')
  downOnScrim = false
}

useMiOverlay({
  open: computed(() => open.value && !props.inline),
  panel,
  trap: props.modal,
  lock: props.modal,
  onEscape: () => dismiss('escape'),
  initialFocus: () => panel.value?.querySelector<HTMLElement>('[data-mi-autofocus]') ?? panel.value
})

defineSlots<{
  /** Heading content; replaces the `title` prop. */
  title?(): unknown
  /** Supporting text under the title; replaces the `description` prop. */
  description?(): unknown
  /** Drawer body; `close` dismisses the drawer. */
  default?(props: { close: () => void }): unknown
  /** Pinned footer, typically buttons; `close` dismisses the drawer. Hidden when not provided. */
  footer?(props: { close: () => void }): unknown
}>()
</script>

<template>
  <Teleport to="body" :disabled="inline">
    <div
      v-if="inline || rendered"
      class="mi mi-dr-root mi:font-mi mi:[&.is-modeless]:pointer-events-none"
      :class="[`mi-dr--${side}`, { 'is-inline': inline, 'is-modeless': !modal }]"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog }"
    >
      <Transition v-if="!inline && modal" name="mi-dr-fade" appear>
        <div v-if="open" class="mi-dr-scrim mi:absolute mi:inset-0 mi:bg-scrim" aria-hidden="true" @pointerdown="onScrimDown" @click="onScrimClick" />
      </Transition>
      <Transition :name="`mi-dr-${side}`" :appear="!inline" @after-leave="afterLeave">
        <div v-if="inline || open" class="mi-dr-wrap mi:absolute mi:flex mi:pointer-events-none mi:[.mi-dr--bottom_&]:left-0 mi:[.mi-dr--bottom_&]:right-0 mi:[.mi-dr--bottom_&]:bottom-0 mi:[.mi-dr--bottom_&]:justify-center mi:[.mi-dr--top_&]:justify-center mi:[.mi-dr--left_&]:bottom-0 mi:[.mi-dr--right_&]:bottom-0 mi:[.is-inline_&]:static mi:[.is-inline_&]:block">
          <div
            ref="panel"
            v-bind="$attrs"
            class="mi-dr mi:pointer-events-auto mi:[outline:none] mi:min-h-0"
            :class="{ 'is-dragging': dragging }"
            role="dialog"
            :aria-modal="!inline && modal ? 'true' : undefined"
            :aria-labelledby="title || $slots.title ? titleId : undefined"
            :aria-describedby="description || $slots.description ? descId : undefined"
            :aria-label="title || $slots.title ? undefined : (label ?? 'Drawer')"
            tabindex="-1"
          >
            <div ref="card" class="mi-dr-card mi:flex-1 mi:min-w-0 mi:flex mi:flex-col mi:bg-elev mi:shadow-3 mi:overflow-hidden mi:[.mi-dr.is-dragging_&]:will-change-transform">
              <div
                v-if="showHandle || title || $slots.title"
                class="mi-dr-head mi:flex-[none] mi:touch-none mi:[&.is-draggable]:cursor-grab mi:[&.is-draggable:active]:cursor-grabbing"
                :class="{ 'is-draggable': !inline && dismissible }"
                @pointerdown="onDragStart"
                @pointermove="onDragMove"
                @pointerup="onDragEnd"
                @pointercancel="onDragEnd"
              >
                <span v-if="showHandle && side !== 'top'" class="mi-dr-handle mi:block mi:w-9 mi:h-[5px] mi:mt-2 mi:mx-auto mi:mb-0 mi:rounded-[999px] mi:bg-fill" data-handle aria-hidden="true" />
                <div v-if="title || $slots.title || description || $slots.description" class="mi-dr-text mi:flex mi:flex-col mi:gap-1 mi:pt-3 mi:px-5 mi:pb-2">
                  <h3 :id="titleId" class="mi-dr-title mi:m-0 mi:text-[17px] mi:leading-[22px] mi:font-semibold"><slot name="title">{{ title }}</slot></h3>
                  <p v-if="description || $slots.description" :id="descId" class="mi-dr-desc mi:m-0 mi:text-[13px] mi:leading-[18px] mi:text-label2"><slot name="description">{{ description }}</slot></p>
                </div>
              </div>
              <div class="mi-dr-content mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:overscroll-contain mi:pt-2 mi:px-5 mi:pb-5"><slot :close="() => close('drag')" /></div>
              <div v-if="$slots.footer" class="mi-dr-foot mi:flex-[none] mi:pt-3 mi:px-5 mi:pb-[max(16px,env(safe-area-inset-bottom))] mi:[border-top:.5px_solid_var(--mi-sep)] mi:flex mi:flex-col mi:gap-2"><slot name="footer" :close="() => close('drag')" /></div>
              <div
                v-if="showHandle && side === 'top'"
                class="mi-dr-tail mi:flex-[none] mi:touch-none mi:[&.is-draggable]:cursor-grab mi:[&.is-draggable:active]:cursor-grabbing mi:pb-2"
                :class="{ 'is-draggable': !inline && dismissible }"
                @pointerdown="onDragStart"
                @pointermove="onDragMove"
                @pointerup="onDragEnd"
                @pointercancel="onDragEnd"
              >
                <span class="mi-dr-handle mi:block mi:w-9 mi:h-[5px] mi:mt-2 mi:mx-auto mi:mb-0 mi:rounded-[999px] mi:bg-fill" data-handle aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-dr-root{position:fixed;inset:0}
.mi-dr-root.is-inline{position:static;inset:auto}
.mi-dr--bottom .mi-dr-wrap{max-height:92dvh}
.mi-dr--top .mi-dr-wrap{left:0;right:0;top:0;max-height:92dvh}
.mi-dr--left .mi-dr-wrap{left:0;top:0;max-width:min(380px,92vw)}
.mi-dr--right .mi-dr-wrap{right:0;top:0;max-width:min(380px,92vw)}
.is-inline .mi-dr-wrap{max-height:none;max-width:none}
.mi-dr{position:relative;color:var(--mi-label);letter-spacing:-.01em;display:flex;min-width:0}
.mi-dr--bottom .mi-dr,.mi-dr--top .mi-dr{width:100%;max-width:640px}
.mi-dr--left .mi-dr,.mi-dr--right .mi-dr{width:min(380px,92vw);height:100%}
.is-inline .mi-dr{width:100%;max-width:none;height:auto}
.mi-dr--bottom .mi-dr-card{border-radius:22px 22px 0 0;transform:translate3d(0,var(--mi-dr-drag,0px),0)}
.mi-dr--top .mi-dr-card{border-radius:0 0 22px 22px;transform:translate3d(0,calc(var(--mi-dr-drag,0px) * -1),0)}
.mi-dr--right .mi-dr-card{border-radius:22px 0 0 22px;transform:translate3d(var(--mi-dr-drag,0px),0,0)}
.mi-dr--left .mi-dr-card{border-radius:0 22px 22px 0;transform:translate3d(calc(var(--mi-dr-drag,0px) * -1),0,0)}
.is-inline .mi-dr-card{border-radius:22px;transform:none}
.mi-dr-head, .mi-dr-tail{user-select:none;-webkit-user-select:none}
.mi-dr--bottom .mi-dr-text,.mi-dr--top .mi-dr-text{text-align:center}

.mi-dr-fade-enter-active,.mi-dr-fade-leave-active{transition:opacity var(--mi-dur-3) var(--mi-ease);will-change:opacity}
.mi-dr-fade-enter-from,.mi-dr-fade-leave-to{opacity:0}
.mi-dr-bottom-enter-active,.mi-dr-top-enter-active,.mi-dr-left-enter-active,.mi-dr-right-enter-active{transition:transform var(--mi-dur-4) var(--mi-spring);will-change:transform}
.mi-dr-bottom-leave-active,.mi-dr-top-leave-active,.mi-dr-left-leave-active,.mi-dr-right-leave-active{transition:transform var(--mi-dur-3) var(--mi-ease-in-out);will-change:transform}
.mi-dr-bottom-enter-from,.mi-dr-bottom-leave-to{transform:translate3d(0,100%,0)}
.mi-dr-top-enter-from,.mi-dr-top-leave-to{transform:translate3d(0,-100%,0)}
.mi-dr-left-enter-from,.mi-dr-left-leave-to{transform:translate3d(-100%,0,0)}
.mi-dr-right-enter-from,.mi-dr-right-leave-to{transform:translate3d(100%,0,0)}
</style>
