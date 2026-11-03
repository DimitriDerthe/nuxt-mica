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
  <div class="mi-slider mi:[--_c:var(--mi-p)] mi:flex-col mi:[&.tone-secondary]:[--_c:var(--mi-s)] mi:[&.is-disabled]:pointer-events-none" :class="[`tone-${tone}`, { 'is-dragging': dragging, 'is-disabled': disabled, 'is-range': isRange }]" :style="{ '--_lo': fLo, '--_hi': fHi }">
    <div v-if="hasHeader" class="mi-slider__head mi:flex mi:justify-between mi:gap-3 mi:text-[15px] mi:font-medium">
      <span v-if="label" :id="labelId" class="mi-slider__label">{{ label }}</span>
      <output v-if="showVal" class="mi-slider__value mi:ml-auto mi:text-label2 mi:tabular-nums">{{ display }}</output>
    </div>
    <div class="mi-slider__row mi:flex mi:items-center mi:gap-3.5 mi:h-11 mi:text-label2">
      <span v-if="$slots.start" class="mi-slider__side mi:inline-flex mi:items-center mi:flex-[none] mi:text-[12px] mi:font-semibold"><slot name="start" /></span>
      <div
        ref="area"
        class="mi-slider__area mi:relative mi:flex-1 mi:self-stretch mi:min-w-0 mi:cursor-pointer mi:touch-pan-y"
        @pointerdown="onDown"
        @pointermove.passive="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <div class="mi-slider__track mi:absolute mi:top-5 mi:left-0 mi:right-0 mi:h-1 mi:rounded-[999px] mi:[background:var(--mi-fill)] mi:overflow-hidden" aria-hidden="true">
          <span v-if="!isRange" class="mi-slider__cap mi:absolute mi:top-0 mi:bottom-0 mi:left-0 mi:w-3 mi:[background:var(--\_c)]" />
          <span class="mi-slider__bar mi:absolute mi:top-0 mi:bottom-0 mi:left-3 mi:right-3"><span class="mi-slider__fill mi:absolute mi:inset-0 mi:[background:var(--\_c)] mi:origin-[left_center] mi:transform-[translateX(calc(var(--\_lo)_*_100%))_scaleX(calc(var(--\_hi)_-_var(--\_lo)))] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.is-dragging_&]:[transition:none] mi:[.is-dragging_&]:will-change-transform" /></span>
        </div>
        <div ref="rail" class="mi-slider__rail mi:absolute mi:top-0 mi:bottom-0 mi:left-3 mi:right-3 mi:pointer-events-none">
          <div
            v-for="(v, i) in values"
            :key="i"
            class="mi-slider__mover mi:absolute mi:inset-0 mi:transform-[translateX(calc((var(--f)_-_1)_*_100%))] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-active]:z-2 mi:[.is-dragging_&]:[transition:none] mi:[.is-dragging_&]:will-change-transform"
            :class="{ 'is-active': activeIdx === i }"
            :style="{ '--f': i === 0 && isRange ? fLo : fHi }"
          >
            <span
              :ref="(el) => { if (el) thumbs[i] = el as HTMLElement }"
              class="mi-slider__thumb mi:absolute mi:top-2.5 mi:right-0 mi:w-6 mi:h-6 mi:rounded-[50%] mi:[background:#fff] mi:shadow-[0_.5px_4px_rgba(0,_0,_0,_.12),_0_6px_13px_rgba(0,_0,_0,_.12),_0_0_0_.5px_rgba(0,_0,_0,_.06)] mi:transform-[translateX(50%)] mi:pointer-events-auto mi:cursor-grab mi:touch-pan-y mi:[.is-dragging_&]:cursor-grabbing mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]"
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
      <span v-if="$slots.end" class="mi-slider__side mi:inline-flex mi:items-center mi:flex-[none] mi:text-[12px] mi:font-semibold"><slot name="end" /></span>
    </div>
    <template v-if="name">
      <input v-for="(v, i) in values" :key="i" type="hidden" :name="name" :value="v">
    </template>
  </div>
</template>

<style scoped>
.mi-slider {
  display: flex;
  gap: 8px;
  min-width: 0;
  font-family: var(--mi-font);
  color: var(--mi-label);
}
.mi-slider.is-disabled { opacity: .4; }

.mi-slider__area {
  user-select: none;
  -webkit-user-select: none;
}
</style>
