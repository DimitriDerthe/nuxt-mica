<script setup lang="ts">
/** Floating panel anchored to a trigger for rich contextual content; `click` or `manual` control, `inline` renders in flow. */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import {
  MI_OVERLAY_Z,
  miOverlayPosition,
  miOverlayRaf,
  useMiOverlay,
  useMiOverlayOutside,
  useMiPresence,
  type MiOverlayPlacement,
  type MiOverlaySide
} from '../../utils/miOverlay'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Side and alignment of the panel relative to the trigger; flips when it would leave the viewport. */
  placement?: MiOverlayPlacement
  /** Gap between the trigger and the panel, in px. */
  offset?: number
  /** Shows a pointer from the panel to the trigger. */
  arrow?: boolean
  /** Panel width in px (or any CSS length). Defaults to content width, capped at 280px. */
  width?: number | string
  /** Remove the 16px panel padding. */
  flush?: boolean
  /** Accessible name of the popover. */
  label?: string
  /** `click` toggles on any click inside the trigger slot, so do not also call the slot `toggle` there. `manual` leaves control to `v-model` or to the slot `toggle` (manual mode only). */
  trigger?: 'click' | 'manual'
  /** Closes the panel when a pointer press lands outside it. */
  closeOnOutside?: boolean
  /** Closes the panel when Escape is pressed. */
  closeOnEscape?: boolean
  /** Render the panel in flow under the trigger (documentation and boards). */
  inline?: boolean
  /** Arrow position from the panel's left edge in `inline` mode, in px. */
  arrowOffset?: number
  /** Prevents the panel from opening and closes it if already open. */
  disabled?: boolean
}>(), {
  placement: 'bottom-start',
  offset: 8,
  arrow: true,
  trigger: 'click',
  closeOnOutside: true,
  closeOnEscape: true,
  arrowOffset: 30
})

/** Whether the panel is open. */

const open = defineModel<boolean>({ default: false })

const panelId = `mi-pop-${useId()}`
const anchor = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const { rendered } = useMiPresence(open)
const ready = ref(false)
const geo = ref({ x: 0, y: 0, side: 'bottom' as MiOverlaySide, arrow: 24 })
let leaveTimer: ReturnType<typeof setTimeout> | undefined

const shown = computed(() => props.inline || open.value)
const triggerEl = () => anchor.value?.firstElementChild as HTMLElement | null | undefined

function place() {
  const a = anchor.value
  const p = panel.value
  if (!a || !p) return
  const r = a.getBoundingClientRect()
  const res = miOverlayPosition(
    { left: r.left, top: r.top, width: r.width, height: r.height },
    { width: p.offsetWidth, height: p.offsetHeight },
    props.placement,
    { offset: props.offset + (props.arrow ? 6 : 0), viewport: { width: window.innerWidth, height: window.innerHeight }, padding: 8 }
  )
  geo.value = { x: res.x, y: res.y, side: res.side, arrow: res.arrow }
  ready.value = true
}
const placeRaf = miOverlayRaf(place)

function addGlobal() {
  window.addEventListener('resize', placeRaf, { passive: true })
  window.addEventListener('scroll', placeRaf, { capture: true, passive: true })
}
function removeGlobal() {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', placeRaf)
  window.removeEventListener('scroll', placeRaf, { capture: true } as EventListenerOptions)
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
    leaveTimer = setTimeout(() => { if (!open.value) rendered.value = false }, 220)
  }
})

onMounted(async () => {
  syncAria()
  if (open.value && !props.inline) {
    await nextTick()
    place()
    addGlobal()
  }
})
onBeforeUnmount(() => {
  removeGlobal()
  clearTimeout(leaveTimer)
})

function syncAria() {
  const t = triggerEl()
  if (!t || props.inline) return
  t.setAttribute('aria-haspopup', 'dialog')
  t.setAttribute('aria-expanded', String(open.value))
  t.setAttribute('aria-controls', panelId)
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}
function close(refocus = false) {
  open.value = false
  if (refocus) triggerEl()?.focus({ preventScroll: true })
}
function onAnchorClick(e: MouseEvent) {
  if (props.trigger !== 'click' || props.inline) return
  const t = triggerEl()
  if (t && (e.target === t || t.contains(e.target as Node))) toggle()
}

useMiOverlay({
  open: computed(() => open.value && !props.inline),
  panel,
  lock: false,
  restoreFocus: false,
  onEscape: () => { if (props.closeOnEscape) close(true) },
  initialFocus: () => panel.value
})
useMiOverlayOutside(computed(() => open.value && !props.inline && props.closeOnOutside), () => [panel.value, anchor.value], () => close())

const sideNow = computed<MiOverlaySide>(() => (props.inline ? 'bottom' : geo.value.side))
const arrowPos = computed(() => (props.inline ? props.arrowOffset : geo.value.arrow))
const panelStyle = computed(() => {
  const w = props.width === undefined ? undefined : typeof props.width === 'number' ? `${props.width}px` : props.width
  const s = sideNow.value
  const a = arrowPos.value
  const origin = s === 'bottom' ? `${a}px 0` : s === 'top' ? `${a}px 100%` : s === 'right' ? `0 ${a}px` : `100% ${a}px`
  return { width: w, '--mi-arrow': `${a}px`, transformOrigin: origin }
})

defineSlots<{
  /** Element that anchors and opens the panel; bind `attrs` to the focusable control for ARIA, and call `toggle` in manual mode. */
  trigger?(props: { open: boolean, toggle: () => void, attrs: Record<string, unknown> }): unknown
  /** Content of the panel. */
  default?(): unknown
}>()
</script>

<template>
  <span v-if="$slots.trigger" ref="anchor" class="mi-pop-anchor" :class="{ 'is-inline': inline }" @click="onAnchorClick">
    <slot name="trigger" :open="open" :toggle="toggle" :attrs="{ 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': panelId }" />
  </span>
  <Teleport to="body" :disabled="inline">
    <div
      v-if="inline || rendered"
      class="mi mi-pop-pos"
      :class="{ 'is-inline': inline }"
      :style="inline ? undefined : { transform: `translate3d(${geo.x}px,${geo.y}px,0)`, zIndex: MI_OVERLAY_Z.popover }"
    >
      <div
        v-if="shown || rendered"
        :id="panelId"
        ref="panel"
        v-bind="$attrs"
        class="mi-pop"
        :class="{ 'is-in': inline || (open && ready), 'is-flush': flush }"
        :data-side="sideNow"
        role="dialog"
        :aria-label="label"
        tabindex="-1"
        :style="panelStyle"
      >
        <span v-if="arrow" class="mi-pop-arrow" aria-hidden="true" />
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-pop-anchor{display:inline-flex}
.mi-pop-anchor.is-inline{display:flex;flex-direction:column;align-items:flex-start}
.mi-pop-pos{position:fixed;left:0;top:0;font-family:var(--mi-font)}
.mi-pop-pos.is-inline{position:static;display:block}
.mi-pop{position:relative;box-sizing:border-box;min-width:120px;max-width:min(280px,calc(100vw - 16px));padding:16px;border-radius:14px;background:var(--mi-elev);box-shadow:var(--mi-sh3),0 0 0 .5px var(--mi-mat-b);color:var(--mi-label);letter-spacing:-.01em;outline:none;opacity:0;transform:scale(.94);pointer-events:none}
.mi-pop.is-flush{padding:0}
.mi-pop.is-in{opacity:1;transform:none;pointer-events:auto;transition:transform var(--mi-dur-3) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease)}
.mi-pop:not(.is-in){transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-1) var(--mi-ease)}
.mi-pop-arrow{position:absolute;width:14px;height:14px;border-radius:3px;background:var(--mi-elev);transform:rotate(45deg);pointer-events:none}
/* The panel shadow falls downward, so the arrow carries its own hairline and a short shadow to stay visible on light pages;
   clip-path keeps only its outer half so no edge shows over the panel. */
.mi-pop[data-side=bottom] .mi-pop-arrow{top:-6px;left:calc(var(--mi-arrow) - 7px);box-shadow:-.5px -.5px 0 .5px var(--mi-mat-b),-2px -2px 5px var(--mi-mat-b);clip-path:polygon(-50% -50%,150% -50%,-50% 150%)}
.mi-pop[data-side=top] .mi-pop-arrow{bottom:-6px;left:calc(var(--mi-arrow) - 7px);box-shadow:.5px .5px 0 .5px var(--mi-mat-b),2px 2px 5px var(--mi-mat-b);clip-path:polygon(150% 150%,-50% 150%,150% -50%)}
.mi-pop[data-side=right] .mi-pop-arrow{left:-6px;top:calc(var(--mi-arrow) - 7px);box-shadow:-.5px .5px 0 .5px var(--mi-mat-b),-2px 2px 5px var(--mi-mat-b);clip-path:polygon(-50% 150%,-50% -50%,150% 150%)}
.mi-pop[data-side=left] .mi-pop-arrow{right:-6px;top:calc(var(--mi-arrow) - 7px);box-shadow:.5px -.5px 0 .5px var(--mi-mat-b),2px -2px 5px var(--mi-mat-b);clip-path:polygon(150% -50%,150% 150%,-50% -50%)}
.mi-pop-pos.is-inline .mi-pop{margin-top:6px}
</style>
