<script setup lang="ts">
/** Slider for a number or [low, high] range via tuple v-model. Keyboard and pointer input; use MiStepper for exact small changes. */
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { miClamp, miSnap } from '../../utils/miControls'

export type MiSliderValue = number | [number, number]

defineSlots<{
  /** Content on the left of the track, such as a min icon. */
  start?(): unknown
  /** Content on the right of the track, such as a max icon. */
  end?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Lowest selectable value. */
  min?: number
  /** Highest selectable value. */
  max?: number
  /** Increment; values snap to multiples of `step` counted from `min`. */
  step?: number
  /** Visible label above the track; also names the thumb(s). */
  label?: string
  /** Accessible name when there is no visible `label`. */
  ariaLabel?: string
  /** Fill color. */
  tone?: 'primary' | 'secondary'
  /** Unit appended to the displayed value, e.g. `%`. */
  unit?: string
  /** Show the value above the track. Defaults to true when a `label` is set. */
  showValue?: boolean
  /** Custom value formatter, used for the visible value and `aria-valuetext`. */
  format?: (value: number) => string
  /** Form field name; a range submits two values under the same name. */
  name?: string
  /** Blocks interaction and dims the control. */
  disabled?: boolean
}>(), {
  min: 0,
  max: 100,
  step: 1,
  tone: 'primary',
  showValue: undefined,
  unit: undefined,
  format: undefined
})

/** A number for a single slider, or a `[low, high]` tuple for a range slider. */
const model = defineModel<MiSliderValue>({ default: 0 })

const uid = useId()
const labelId = `mi-slider-${uid}`
const area = ref<HTMLElement | null>(null)
const rail = ref<HTMLElement | null>(null)
const thumbs = ref<HTMLElement[]>([])
const dragging = ref(false)
const activeIdx = ref(-1)

const isRange = computed(() => Array.isArray(model.value))
const span = computed(() => props.max - props.min || 1)
const lo = computed(() => {
  const v = model.value
  return miClamp(Array.isArray(v) ? Math.min(v[0], v[1]) : props.min, props.min, props.max)
})
const hi = computed(() => {
  const v = model.value
  return miClamp(Array.isArray(v) ? Math.max(v[0], v[1]) : v, props.min, props.max)
})
const fLo = computed(() => (lo.value - props.min) / span.value)
const fHi = computed(() => (hi.value - props.min) / span.value)
const values = computed(() => (isRange.value ? [lo.value, hi.value] : [hi.value]))
const hasHeader = computed(() => !!props.label || props.showValue === true)
const showVal = computed(() => props.showValue ?? !!props.label)

function fmt(n: number) {
  return props.format ? props.format(n) : String(n)
}
const display = computed(() => {
  const t = values.value.map(fmt).join(' – ')
  return props.unit ? `${t} ${props.unit}` : t
})

function bounds(i: number): [number, number] {
  if (!isRange.value) return [props.min, props.max]
  return i === 0 ? [props.min, hi.value] : [lo.value, props.max]
}

function thumbLabel(i: number) {
  const base = props.label ?? props.ariaLabel
  if (!isRange.value) return base
  const part = i === 0 ? 'minimum' : 'maximum'
  return base ? `${base} ${part}` : part
}

function apply(i: number, raw: number) {
  const v = miSnap(raw, props.min, props.max, props.step)
  if (!isRange.value) {
    if (v !== model.value) model.value = v
    return
  }
  const [a, b] = [lo.value, hi.value]
  const next: [number, number] = i === 0 ? [Math.min(v, b), b] : [a, Math.max(v, a)]
  if (next[0] !== a || next[1] !== b) model.value = next
}

/* Pointer handling: the rail rect is read once on pointerdown, moves are coalesced into one rAF write. */
let rect: DOMRect | null = null
let raf = 0
let pendingX = 0

function valueAt(x: number) {
  if (!rect || !rect.width) return props.min
  return props.min + miClamp((x - rect.left) / rect.width, 0, 1) * span.value
}

function nearest(v: number) {
  if (!isRange.value) return 0
  if (lo.value === hi.value) return v >= hi.value ? 1 : 0
  return Math.abs(v - lo.value) <= Math.abs(v - hi.value) ? 0 : 1
}

function flush() {
  raf = 0
  if (activeIdx.value >= 0) apply(activeIdx.value, valueAt(pendingX))
}

function onDown(e: PointerEvent) {
  if (props.disabled || !rail.value || (e.pointerType === 'mouse' && e.button !== 0)) return
  rect = rail.value.getBoundingClientRect()
  const v = valueAt(e.clientX)
  activeIdx.value = nearest(v)
  dragging.value = true
  pendingX = e.clientX
  area.value?.setPointerCapture?.(e.pointerId)
  apply(activeIdx.value, v)
  thumbs.value[activeIdx.value]?.focus({ preventScroll: true })
}

function onMove(e: PointerEvent) {
  if (!dragging.value) return
  pendingX = e.clientX
  if (!raf) raf = requestAnimationFrame(flush)
}

function onUp(e: PointerEvent) {
  if (!dragging.value) return
  if (raf) { cancelAnimationFrame(raf); flush() }
  dragging.value = false
  rect = null
  area.value?.releasePointerCapture?.(e.pointerId)
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (props.disabled || e.altKey || e.ctrlKey || e.metaKey) return
  const [bMin, bMax] = bounds(i)
  const cur = values.value[i]!
  const big = Math.max(props.step, span.value / 10)
  let next: number
  switch (e.key) {
    case 'ArrowRight': case 'ArrowUp': next = cur + props.step; break
    case 'ArrowLeft': case 'ArrowDown': next = cur - props.step; break
    case 'PageUp': next = cur + big; break
    case 'PageDown': next = cur - big; break
    case 'Home': next = bMin; break
    case 'End': next = bMax; break
    default: return
  }
  e.preventDefault()
  activeIdx.value = i
  apply(i, miClamp(next, bMin, bMax))
}

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<template>
  <div class="mi-slider" :class="[`tone-${tone}`, { 'is-dragging': dragging, 'is-disabled': disabled, 'is-range': isRange }]" :style="{ '--_lo': fLo, '--_hi': fHi }">
    <div v-if="hasHeader" class="mi-slider__head">
      <span v-if="label" :id="labelId" class="mi-slider__label">{{ label }}</span>
      <output v-if="showVal" class="mi-slider__value">{{ display }}</output>
    </div>
    <div class="mi-slider__row">
      <span v-if="$slots.start" class="mi-slider__side"><slot name="start" /></span>
      <div
        ref="area"
        class="mi-slider__area"
        @pointerdown="onDown"
        @pointermove.passive="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <div class="mi-slider__track" aria-hidden="true">
          <span v-if="!isRange" class="mi-slider__cap" />
          <span class="mi-slider__bar"><span class="mi-slider__fill" /></span>
        </div>
        <div ref="rail" class="mi-slider__rail">
          <div
            v-for="(v, i) in values"
            :key="i"
            class="mi-slider__mover"
            :class="{ 'is-active': activeIdx === i }"
            :style="{ '--f': i === 0 && isRange ? fLo : fHi }"
          >
            <span
              :ref="(el) => { if (el) thumbs[i] = el as HTMLElement }"
              class="mi-slider__thumb"
              role="slider"
              :tabindex="disabled ? -1 : 0"
              :aria-label="label ? undefined : thumbLabel(i)"
              :aria-labelledby="label ? labelId : undefined"
              :aria-valuemin="bounds(i)[0]"
              :aria-valuemax="bounds(i)[1]"
              :aria-valuenow="v"
              :aria-valuetext="unit ? `${fmt(v)} ${unit}` : fmt(v)"
              aria-orientation="horizontal"
              :aria-disabled="disabled || undefined"
              @keydown="onKeydown(i, $event)"
              @focus="activeIdx = i"
            />
          </div>
        </div>
      </div>
      <span v-if="$slots.end" class="mi-slider__side"><slot name="end" /></span>
    </div>
    <template v-if="name">
      <input v-for="(v, i) in values" :key="i" type="hidden" :name="name" :value="v">
    </template>
  </div>
</template>

<style scoped>
.mi-slider {
  --_c: var(--mi-p);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  font-family: var(--mi-font);
  color: var(--mi-label);
}
.mi-slider.tone-secondary { --_c: var(--mi-s); }
.mi-slider.is-disabled { opacity: .4; pointer-events: none; }

.mi-slider__head { display: flex; justify-content: space-between; gap: 12px; font-size: 15px; font-weight: 500; }
.mi-slider__value { margin-left: auto; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

.mi-slider__row { display: flex; align-items: center; gap: 14px; height: 44px; color: var(--mi-label2); }
.mi-slider__side { display: inline-flex; align-items: center; flex: none; font-size: 12px; font-weight: 600; }

.mi-slider__area {
  position: relative;
  flex: 1;
  align-self: stretch;
  min-width: 0;
  cursor: pointer;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.mi-slider__track {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 999px;
  background: var(--mi-fill);
  overflow: hidden;
}
.mi-slider__cap { position: absolute; top: 0; bottom: 0; left: 0; width: 12px; background: var(--_c); }
/* The bar spans the thumb travel (12px inset each side). Fill is scaled and shifted, never resized. */
.mi-slider__bar { position: absolute; top: 0; bottom: 0; left: 12px; right: 12px; }
.mi-slider__fill {
  position: absolute;
  inset: 0;
  background: var(--_c);
  transform-origin: left center;
  transform: translateX(calc(var(--_lo) * 100%)) scaleX(calc(var(--_hi) - var(--_lo)));
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.is-dragging .mi-slider__fill { transition: none; will-change: transform; }

.mi-slider__rail { position: absolute; top: 0; bottom: 0; left: 12px; right: 12px; pointer-events: none; }

/* Each mover is as wide as the rail; the thumb sits on its right edge, so moving it left by (1 - f) * 100% puts the thumb at f. */
.mi-slider__mover {
  position: absolute;
  inset: 0;
  transform: translateX(calc((var(--f) - 1) * 100%));
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.mi-slider__mover.is-active { z-index: 2; }
.is-dragging .mi-slider__mover { transition: none; will-change: transform; }

.mi-slider__thumb {
  position: absolute;
  top: 10px;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 .5px 4px rgba(0, 0, 0, .12), 0 6px 13px rgba(0, 0, 0, .12), 0 0 0 .5px rgba(0, 0, 0, .06);
  transform: translateX(50%);
  pointer-events: auto;
  cursor: grab;
  touch-action: pan-y;
}
.is-dragging .mi-slider__thumb { cursor: grabbing; }
.mi-slider__thumb:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 2px; }
</style>
