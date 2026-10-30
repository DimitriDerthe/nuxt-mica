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
      class="mi mi-sh-root"
      :class="{ 'is-inline': inline, 'is-modeless': !modal }"
      :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.dialog, '--mi-sh-max': maxD, '--mi-sh-y': yPct(index) }"
    >
      <Transition v-if="!inline && modal" name="mi-sh-fade" appear>
        <div v-if="open" class="mi-sh-scrim" aria-hidden="true" @pointerdown="onScrimDown" @click="onScrimClick" />
      </Transition>
      <Transition name="mi-sh-slide" :appear="!inline" @after-leave="afterLeave">
        <div v-if="inline || open" class="mi-sh-wrap">
          <div
            ref="panel"
            v-bind="$attrs"
            class="mi-sh"
            :class="{ 'is-dragging': dragging }"
            role="dialog"
            :aria-modal="!inline && modal ? 'true' : undefined"
            :aria-labelledby="title ? titleId : undefined"
            :aria-label="title ? undefined : (label ?? 'Sheet')"
            tabindex="-1"
          >
            <div ref="sheetEl" class="mi-sh-card">
              <div class="mi-sh-head" :class="{ 'is-draggable': !inline && dismissible }" @pointerdown="onDragStart" @pointermove="onDragMove" @pointerup="onDragEnd" @pointercancel="onDragEnd">
                <button v-if="cycles && grabber" type="button" class="mi-sh-grab" data-grab aria-label="Change sheet size" @click="onGrabClick" @keydown="onGrabKey">
                  <span class="mi-sh-bar" />
                </button>
                <span v-else-if="grabber" class="mi-sh-grab is-static" aria-hidden="true"><span class="mi-sh-bar" /></span>
                <div v-if="hasNav || title || $slots.title || $slots.leading || $slots.trailing" class="mi-sh-nav">
                  <span class="mi-sh-lead">
                    <slot name="leading" :cancel="onCancel">
                      <button v-if="cancelLabel" type="button" class="mi-sh-act" @click="onCancel">{{ cancelLabel }}</button>
                    </slot>
                  </span>
                  <h3 :id="titleId" class="mi-sh-title"><slot name="title">{{ title }}</slot></h3>
                  <span class="mi-sh-trail">
                    <slot name="trailing" :confirm="onConfirm">
                      <button v-if="confirmLabel" type="button" class="mi-sh-act is-strong" @click="onConfirm">{{ confirmLabel }}</button>
                    </slot>
                  </span>
                </div>
              </div>
              <div class="mi-sh-content"><slot /></div>
              <div v-if="$slots.footer" class="mi-sh-foot"><slot name="footer" /></div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-sh-root{position:fixed;inset:0;font-family:var(--mi-font)}
.mi-sh-root.is-modeless{pointer-events:none}
.mi-sh-root.is-inline{position:static;inset:auto}
.mi-sh-scrim{position:absolute;inset:0;background:var(--mi-scrim)}
.mi-sh-wrap{position:absolute;left:0;right:0;bottom:0;height:calc(var(--mi-sh-max,1) * 100dvh);display:flex;justify-content:center;pointer-events:none}
.is-inline .mi-sh-wrap{position:static;height:auto;display:block}
.mi-sh{position:relative;width:100%;max-width:640px;height:100%;pointer-events:auto;outline:none;color:var(--mi-label);letter-spacing:-.01em;transform:translate3d(0,calc(var(--mi-sh-y,0) * 1%),0);transition:transform var(--mi-dur-4) var(--mi-spring)}
.is-inline .mi-sh{height:auto;max-width:none;transform:none;transition:none}
.mi-sh.is-dragging{transition:none;will-change:transform}
.mi-sh-card{height:100%;display:flex;flex-direction:column;background:var(--mi-elev);border-radius:22px 22px 0 0;box-shadow:var(--mi-sh3);overflow:hidden;transform:translate3d(0,var(--mi-sh-drag,0px),0)}
.is-inline .mi-sh-card{height:auto;border-radius:22px;transform:none}
.mi-sh-head{flex:none;touch-action:none;user-select:none;-webkit-user-select:none}
.mi-sh-head.is-draggable{cursor:grab}
.mi-sh-head.is-draggable:active{cursor:grabbing}
.mi-sh-grab{appearance:none;display:flex;justify-content:center;width:100%;height:17px;margin:0;padding:6px 0 0;border:0;background:transparent;cursor:inherit}
.mi-sh-grab.is-static{pointer-events:none}
.mi-sh-bar{display:block;width:36px;height:5px;border-radius:999px;background:var(--mi-fill)}
.mi-sh-grab:focus-visible{outline-offset:-3px}
.mi-sh-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:6px 16px 10px}
.mi-sh-lead{justify-self:start;display:flex}
.mi-sh-trail{justify-self:end;display:flex}
.mi-sh-title{margin:0;font-size:17px;line-height:22px;font-weight:600;text-align:center}
.mi-sh-act{appearance:none;height:44px;padding:0;margin:0;border:0;background:transparent;color:var(--mi-p-text);font-family:inherit;font-size:17px;font-weight:400}
.mi-sh-act.is-strong{font-weight:600}
.mi-sh-act:active{opacity:.55}
.mi-sh-content{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 16px 20px}
.mi-sh-foot{flex:none;padding:12px 16px max(16px,env(safe-area-inset-bottom));border-top:.5px solid var(--mi-sep)}

.mi-sh-fade-enter-active,.mi-sh-fade-leave-active{transition:opacity var(--mi-dur-3) var(--mi-ease);will-change:opacity}
.mi-sh-fade-enter-from,.mi-sh-fade-leave-to{opacity:0}
.mi-sh-slide-enter-active{transition:transform var(--mi-dur-4) var(--mi-spring);will-change:transform}
.mi-sh-slide-leave-active{transition:transform var(--mi-dur-3) var(--mi-ease-in-out);will-change:transform}
.mi-sh-slide-enter-from,.mi-sh-slide-leave-to{transform:translate3d(0,100%,0)}
</style>
