<script setup lang="ts">
/** Star rating slider with whole or half values, hover preview, keyboard control, optional clear on re-click, and read-only display. */
import { computed, ref } from 'vue'
import MiIcon from '../Base/MiIcon.vue'

export type MiRatingSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  /** Number of stars, which is also the highest value. */
  max?: number
  /** Allow half-star values (step 0.5 instead of 1). */
  half?: boolean
  /** Shows the value without allowing changes; stays focusable. */
  readonly?: boolean
  /** Blocks interaction and dims the stars. */
  disabled?: boolean
  /** Star size. */
  size?: MiRatingSize
  /** Clicking the current value again resets the rating to 0. */
  clearable?: boolean
  /** Accessible name of the control. */
  label?: string
  /** Shows the numeric value after the stars. */
  showValue?: boolean
}>(), {
  max: 5,
  size: 'md',
  label: 'Rating'
})

/** Current rating from 0 to `max`, in steps of 1 (0.5 with `half`). */

const model = defineModel<number>({ default: 0 })

const hover = ref<number | null>(null)
const step = computed(() => (props.half ? 0.5 : 1))
const active = computed(() => !props.disabled && !props.readonly)
const shown = computed(() => hover.value ?? model.value)
const stars = computed(() => Array.from({ length: Math.max(1, Math.floor(props.max)) }, (_, i) => Math.min(1, Math.max(0, shown.value - i))))
const px = computed(() => ({ sm: 16, md: 24, lg: 34 })[props.size])
const valueText = computed(() => `${model.value} out of ${props.max}`)

const clamp = (v: number) => Math.min(props.max, Math.max(0, Math.round(v / step.value) * step.value))

function set(v: number) {
  const n = clamp(v)
  if (n !== model.value) model.value = n
}

function pointValue(i: number, e: MouseEvent | PointerEvent): number {
  if (!props.half) return i + 1
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  return i + (r.width > 0 && e.clientX - r.left < r.width / 2 ? 0.5 : 1)
}

function onMove(i: number, e: PointerEvent) {
  if (active.value && e.pointerType !== 'touch') hover.value = pointValue(i, e)
}

function onClick(i: number, e: MouseEvent) {
  if (!active.value) return
  const v = pointValue(i, e)
  set(props.clearable && v === model.value ? 0 : v)
  hover.value = null
}

function onKey(e: KeyboardEvent) {
  if (!active.value) return
  const k = e.key
  if (k === 'ArrowRight' || k === 'ArrowUp') set(model.value + step.value)
  else if (k === 'ArrowLeft' || k === 'ArrowDown') set(model.value - step.value)
  else if (k === 'Home') set(0)
  else if (k === 'End') set(props.max)
  else if ((k === 'Backspace' || k === 'Delete') && props.clearable) set(0)
  else return
  e.preventDefault()
}
</script>

<template>
  <span
    class="mi-rating"
    :class="[`is-${size}`, { 'is-disabled': disabled, 'is-readonly': readonly, 'is-active': active }]"
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-label="label"
    aria-orientation="horizontal"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="model"
    :aria-valuetext="valueText"
    :aria-readonly="readonly || undefined"
    :aria-disabled="disabled || undefined"
    @keydown="onKey"
    @pointerleave="hover = null"
  >
    <span class="mi-rating__stars">
      <span
        v-for="(fill, i) in stars"
        :key="i"
        class="mi-rating__star"
        :style="{ width: `${px}px`, height: `${px}px` }"
        data-star
        @pointermove="onMove(i, $event)"
        @click="onClick(i, $event)"
      >
        <span class="mi-rating__clip" :style="{ clipPath: `inset(0 0 0 ${fill * 100}%)` }" data-empty>
          <MiIcon class="mi-rating__bg" name="star" :size="px" :weight="1.6" />
        </span>
        <span class="mi-rating__clip" :style="{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }">
          <MiIcon class="mi-rating__fg" name="star" :size="px" :weight="1.6" filled />
        </span>
      </span>
    </span>
    <output v-if="showValue" class="mi-rating__value" aria-hidden="true">{{ model }}</output>
  </span>
</template>

<style scoped>
.mi-rating { display: inline-flex; align-items: center; gap: 10px; font-family: var(--mi-font); color: var(--mi-label); outline: none; border-radius: 8px; }
.mi-rating.is-disabled { opacity: .4; }
.mi-rating:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 3px; }
.mi-rating__stars { display: inline-flex; gap: 2px; }
.mi-rating__star { position: relative; display: inline-block; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
.is-active .mi-rating__star { cursor: pointer; }
.is-active .mi-rating__star:hover { transform: scale(1.12); }
.mi-rating__star { transition: transform var(--mi-dur-2) var(--mi-spring); }
.mi-rating__bg { color: var(--mi-label3); }
.mi-rating__clip { position: absolute; inset: 0; pointer-events: none; }
.mi-rating__fg { color: var(--mi-orange); }
.mi-rating__value { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.is-lg .mi-rating__value { font-size: 18px; }
</style>
