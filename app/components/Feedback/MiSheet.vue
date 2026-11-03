<script lang="ts">
export type MiSheetDetent = number | 'medium' | 'large'
const DETENT_NAMED = { medium: 0.5, large: 0.92 } as const
</script>

<script setup lang="ts">
/** Bottom sheet with snap detents for drag-to-resize; modal by default, non-modal keeps the page usable, `inline` skips teleport. */
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { MI_OVERLAY_Z, miOverlayRaf, useMiOverlay, useMiPresence } from '../../utils/miOverlay'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Centred heading in the header bar (or use the `title` slot). */
  title?: string
  /** Heights as viewport fractions (0.1 to 1) or `medium` (50%) / `large` (92%), in ascending order. */
  detents?: MiSheetDetent[]
  /** Text of the leading header button; it closes the sheet and emits `cancel`. */
  cancelLabel?: string
  /** Text of the trailing header button; it emits `confirm` and closes the sheet when `closeOnConfirm` is set. */
  confirmLabel?: string
  /** Show a grabber and allow dragging, flicking and Escape to dismiss. */
  dismissible?: boolean
  /** Shows the drag handle bar at the top of the sheet. */
  grabber?: boolean
  /** Dim the page, trap focus and lock scroll. Non-modal sheets leave the page interactive. */
  modal?: boolean
  /** Close after the confirm button is pressed. */
  closeOnConfirm?: boolean
  /** Render the card in place without teleport, scrim or drag (documentation and boards). */
  inline?: boolean
  /** Accessible name when there is no title. */
  label?: string
}>(), {
  detents: () => ['medium', 'large'],
  dismissible: true,
  grabber: true,
  modal: true,
  closeOnConfirm: true
})

const emit = defineEmits<{
  cancel: []
  confirm: []
  close: [reason: 'cancel' | 'confirm' | 'escape' | 'backdrop' | 'drag']
}>()

/** Whether the sheet is open. */

const open = defineModel<boolean>({ default: false })
/** Index of the active detent. */
const detent = defineModel<number>('detent', { default: 0 })

const titleId = `mi-sh-t-${useId()}`
const panel = ref<HTMLElement | null>(null)
const sheetEl = ref<HTMLElement | null>(null)
const dragging = ref(false)
const { rendered, afterLeave } = useMiPresence(open)

const resolved = computed(() => props.detents.map(d => (typeof d === 'number' ? Math.min(1, Math.max(0.1, d)) : DETENT_NAMED[d])))
const maxD = computed(() => Math.max(...resolved.value))
const index = computed(() => Math.min(Math.max(detent.value, 0), resolved.value.length - 1))
const yPct = (i: number) => (1 - (resolved.value[i] ?? maxD.value) / maxD.value) * 100
const cycles = computed(() => !props.inline && resolved.value.length > 1)
const hasNav = computed(() => !!(props.cancelLabel || props.confirmLabel))

function close(reason: 'cancel' | 'confirm' | 'escape' | 'backdrop' | 'drag') {
  if (!props.inline) open.value = false
  emit('close', reason)
}
function dismiss(reason: 'escape' | 'backdrop') {
  if (props.dismissible) close(reason)
}
function onCancel() {
  emit('cancel')
  close('cancel')
}
function onConfirm() {
  emit('confirm')
  if (props.closeOnConfirm) close('confirm')
}

/* ------------------------------------------------------------- dragging */

let startY = 0
let height = 0
let base = 0
let lastY = 0
let lastT = 0
let vel = 0
let pending = 0
let justDragged = false
const apply = miOverlayRaf(() => {
  let pos = base + pending
  if (pos < 0) pos *= 0.2
  sheetEl.value?.style.setProperty('--mi-sh-drag', `${pos - base}px`)
})

function onDragStart(e: PointerEvent) {
  if (props.inline || !sheetEl.value || (e.target as HTMLElement).closest('button:not([data-grab])')) return
  if (e.pointerType === 'mouse' && e.button !== 0) return
  height = sheetEl.value.offsetHeight
  base = (yPct(index.value) / 100) * height
  startY = lastY = e.clientY
  lastT = e.timeStamp
  vel = 0
  pending = 0
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
}
function onDragMove(e: PointerEvent) {
  if (!dragging.value) return
  pending = e.clientY - startY
  const dt = e.timeStamp - lastT
  if (dt > 0) vel = vel * 0.6 + ((e.clientY - lastY) / dt) * 0.4
  lastY = e.clientY
  lastT = e.timeStamp
  apply()
}
function onDragEnd(e: PointerEvent) {
  if (!dragging.value) return
  apply.cancel()
  dragging.value = false
  ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  const moved = Math.abs(pending) > 4
  justDragged = moved
  const projected = base + pending + vel * 180
  const stops = resolved.value.map((_, i) => ({ i, y: (yPct(i) / 100) * height }))
  let best = { i: index.value, y: Infinity, d: Infinity }
  for (const s of stops) {
    const d = Math.abs(projected - s.y)
    if (d < best.d) best = { i: s.i, y: s.y, d }
  }
  sheetEl.value?.style.removeProperty('--mi-sh-drag')
  if (!moved) return
  if (props.dismissible && Math.abs(projected - height) < best.d) {
    close('drag')
  } else {
    detent.value = best.i
  }
}
function onGrabKey(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    detent.value = Math.min(index.value + 1, resolved.value.length - 1)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (index.value > 0) detent.value = index.value - 1
    else if (props.dismissible) close('drag')
  }
}
function onGrabClick() {
  if (justDragged) {
    justDragged = false
    return
  }
  detent.value = (index.value + 1) % resolved.value.length
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
  /** Replaces the leading header button; call `cancel` to close and emit `cancel`. */
  leading?(props: { cancel: () => void }): unknown
  /** Heading content; replaces the `title` prop. */
  title?(): unknown
  /** Replaces the trailing header button; call `confirm` to emit `confirm`. */
  trailing?(props: { confirm: () => void }): unknown
  /** Sheet body. */
  default?(): unknown
  /** Pinned footer below the body. Hidden when not provided. */
  footer?(): unknown
}>()
</script>

<template>
  <Teleport to="body" :disabled="inline">
    <div
      v-if="inline || rendered"
      class="mi mi-sh-root mi:fixed mi:inset-0 mi:font-mi mi:[&.is-modeless]:pointer-events-none mi:[&.is-inline]:static mi:[&.is-inline]:inset-auto"
      :class="{ 'is-inline': inline, 'is-modeless': !modal }"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog, '--mi-sh-max': maxD, '--mi-sh-y': yPct(index) }"
    >
      <Transition v-if="!inline && modal" name="mi-sh-fade" appear>
        <div v-if="open" class="mi-sh-scrim mi:absolute mi:inset-0 mi:bg-scrim" aria-hidden="true" @pointerdown="onScrimDown" @click="onScrimClick" />
      </Transition>
      <Transition name="mi-sh-slide" :appear="!inline" @after-leave="afterLeave">
        <div v-if="inline || open" class="mi-sh-wrap mi:absolute mi:left-0 mi:right-0 mi:bottom-0 mi:h-[calc(var(--mi-sh-max,1)_*_100dvh)] mi:flex mi:justify-center mi:pointer-events-none mi:[.is-inline_&]:static mi:[.is-inline_&]:h-auto mi:[.is-inline_&]:block">
          <div
            ref="panel"
            v-bind="$attrs"
            class="mi-sh mi:relative mi:h-full mi:pointer-events-auto mi:[outline:none] mi:tracking-[-.01em] mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[.is-inline_&]:h-auto mi:[&.is-dragging]:will-change-transform"
            :class="{ 'is-dragging': dragging }"
            role="dialog"
            :aria-modal="!inline && modal ? 'true' : undefined"
            :aria-labelledby="title ? titleId : undefined"
            :aria-label="title ? undefined : (label ?? 'Sheet')"
            tabindex="-1"
          >
            <div ref="sheetEl" class="mi-sh-card mi:h-full mi:flex mi:flex-col mi:bg-elev mi:rounded-[22px_22px_0_0] mi:shadow-3 mi:overflow-hidden mi:transform-[translate3d(0,var(--mi-sh-drag,0px),0)] mi:[.is-inline_&]:h-auto mi:[.is-inline_&]:rounded-[22px] mi:[.is-inline_&]:transform-none">
              <div class="mi-sh-head mi:flex-[none] mi:touch-none mi:[&.is-draggable]:cursor-grab mi:[&.is-draggable:active]:cursor-grabbing" :class="{ 'is-draggable': !inline && dismissible }" @pointerdown="onDragStart" @pointermove="onDragMove" @pointerup="onDragEnd" @pointercancel="onDragEnd">
                <button v-if="cycles && grabber" type="button" class="mi-sh-grab mi:appearance-none mi:flex mi:justify-center mi:w-full mi:h-[17px] mi:m-0 mi:pt-1.5 mi:px-0 mi:pb-0 mi:[border:0] mi:bg-transparent mi:cursor-[inherit] mi:[&.is-static]:pointer-events-none mi:focus-visible:outline-offset-[-3px]" data-grab aria-label="Change sheet size" @click="onGrabClick" @keydown="onGrabKey">
                  <span class="mi-sh-bar mi:block mi:w-9 mi:h-[5px] mi:rounded-[999px] mi:bg-fill" />
                </button>
                <span v-else-if="grabber" class="mi-sh-grab is-static mi:appearance-none mi:flex mi:justify-center mi:w-full mi:h-[17px] mi:m-0 mi:pt-1.5 mi:px-0 mi:pb-0 mi:[border:0] mi:bg-transparent mi:cursor-[inherit] mi:[&.is-static]:pointer-events-none mi:focus-visible:outline-offset-[-3px]" aria-hidden="true"><span class="mi-sh-bar mi:block mi:w-9 mi:h-[5px] mi:rounded-[999px] mi:bg-fill" /></span>
                <div v-if="hasNav || title || $slots.title || $slots.leading || $slots.trailing" class="mi-sh-nav mi:grid mi:grid-cols-[1fr_auto_1fr] mi:items-center mi:pt-1.5 mi:px-4 mi:pb-2.5">
                  <span class="mi-sh-lead mi:justify-self-start mi:flex">
                    <slot name="leading" :cancel="onCancel">
                      <button v-if="cancelLabel" type="button" class="mi-sh-act mi:appearance-none mi:h-11 mi:p-0 mi:m-0 mi:[border:0] mi:bg-transparent mi:text-p-text mi:font-[inherit] mi:text-[17px] mi:font-normal mi:[&.is-strong]:font-semibold mi:active:opacity-55" @click="onCancel">{{ cancelLabel }}</button>
                    </slot>
                  </span>
                  <h3 :id="titleId" class="mi-sh-title mi:m-0 mi:text-[17px] mi:leading-[22px] mi:font-semibold mi:text-center"><slot name="title">{{ title }}</slot></h3>
                  <span class="mi-sh-trail mi:justify-self-end mi:flex">
                    <slot name="trailing" :confirm="onConfirm">
                      <button v-if="confirmLabel" type="button" class="mi-sh-act is-strong mi:appearance-none mi:h-11 mi:p-0 mi:m-0 mi:[border:0] mi:bg-transparent mi:text-p-text mi:font-[inherit] mi:text-[17px] mi:font-normal mi:[&.is-strong]:font-semibold mi:active:opacity-55" @click="onConfirm">{{ confirmLabel }}</button>
                    </slot>
                  </span>
                </div>
              </div>
              <div class="mi-sh-content mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:overscroll-contain mi:pt-0 mi:px-4 mi:pb-5"><slot /></div>
              <div v-if="$slots.footer" class="mi-sh-foot mi:flex-[none] mi:pt-3 mi:px-4 mi:pb-[max(16px,env(safe-area-inset-bottom))] mi:[border-top:.5px_solid_var(--mi-sep)]"><slot name="footer" /></div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-sh{width:100%;max-width:640px;color:var(--mi-label);transform:translate3d(0,calc(var(--mi-sh-y,0) * 1%),0)}
.is-inline .mi-sh{max-width:none;transform:none;transition:none}
.mi-sh.is-dragging{transition:none}
.mi-sh-head{user-select:none;-webkit-user-select:none}

.mi-sh-fade-enter-active,.mi-sh-fade-leave-active{transition:opacity var(--mi-dur-3) var(--mi-ease);will-change:opacity}
.mi-sh-fade-enter-from,.mi-sh-fade-leave-to{opacity:0}
.mi-sh-slide-enter-active{transition:transform var(--mi-dur-4) var(--mi-spring);will-change:transform}
.mi-sh-slide-leave-active{transition:transform var(--mi-dur-3) var(--mi-ease-in-out);will-change:transform}
.mi-sh-slide-enter-from,.mi-sh-slide-leave-to{transform:translate3d(0,100%,0)}
</style>
