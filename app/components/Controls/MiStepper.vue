<script setup lang="ts">
/** Numeric stepper with minus and plus buttons, press-and-hold repeat and keyboard support. Variants: `default` (pill) or `field` (value box). */
import { computed, onBeforeUnmount } from 'vue'
import { miClamp, miSnap } from '../../utils/miControls'

export type MiStepperVariant = 'default' | 'field'

const props = withDefaults(defineProps<{
  /** `default` is the iOS plus/minus pill, `field` the desktop value box with stacked arrows. */
  variant?: MiStepperVariant
  /** Lowest allowed value; the decrement button disables there. */
  min?: number
  /** Highest allowed value; the increment button disables there. */
  max?: number
  /** Increment per press; values snap to multiples of `step` counted from `min`. */
  step?: number
  /** Accessible name of the control. */
  label?: string
  /** Unit appended to the displayed value, e.g. `pt`. */
  unit?: string
  /** Show the current value next to the pill (always shown by the `field` variant). */
  showValue?: boolean
  /** Accessible name of the plus button. Defaults to "Increase <label>", or "Increase". */
  incrementLabel?: string
  /** Accessible name of the minus button. Defaults to "Decrease <label>", or "Decrease". */
  decrementLabel?: string
  /** Blocks interaction and dims the control. */
  disabled?: boolean
}>(), {
  variant: 'default',
  min: 0,
  max: 100,
  step: 1
})

/** Current number, kept within `min` and `max`. */

const model = defineModel<number>({ default: 0 })

const atMin = computed(() => model.value <= props.min)
const atMax = computed(() => model.value >= props.max)
const text = computed(() => (props.unit ? `${model.value} ${props.unit}` : String(model.value)))
const incLabel = computed(() => props.incrementLabel ?? (props.label ? `Increase ${props.label.toLowerCase()}` : 'Increase'))
const decLabel = computed(() => props.decrementLabel ?? (props.label ? `Decrease ${props.label.toLowerCase()}` : 'Decrease'))

function set(v: number) {
  if (props.disabled) return
  const next = miSnap(miClamp(v, props.min, props.max), props.min, props.max, props.step)
  if (next !== model.value) model.value = next
}

function step(dir: 1 | -1, factor = 1) {
  set(model.value + dir * props.step * factor)
}

let holdTimer: ReturnType<typeof setTimeout> | undefined
let holdRepeat: ReturnType<typeof setInterval> | undefined

function stopHold() {
  clearTimeout(holdTimer)
  clearInterval(holdRepeat)
  holdTimer = holdRepeat = undefined
  if (typeof window !== 'undefined') window.removeEventListener('pointerup', stopHold)
}

/** Pointer press steps once, then repeats while held. Keyboard clicks (detail 0) are handled in `onClick`. */
function onPointerDown(dir: 1 | -1, e: PointerEvent) {
  if (e.button !== 0 || props.disabled) return
  step(dir)
  stopHold()
  window.addEventListener('pointerup', stopHold, { once: true })
  holdTimer = setTimeout(() => {
    holdRepeat = setInterval(() => {
      if ((dir === 1 && atMax.value) || (dir === -1 && atMin.value)) stopHold()
      else step(dir)
    }, 70)
  }, 420)
}

function onClick(dir: 1 | -1, e: MouseEvent) {
  if (e.detail === 0) step(dir)
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'PageUp') step(1, 10)
  else if (e.key === 'PageDown') step(-1, 10)
  else if (e.key === 'Home') set(props.min)
  else if (e.key === 'End') set(props.max)
  else return
  e.preventDefault()
}

onBeforeUnmount(stopHold)
</script>

<template>
  <span class="mi-stepper" :class="[`is-${variant}`, { 'is-disabled': disabled }]">
    <output v-if="variant === 'default' && showValue" class="mi-stepper__value" aria-live="polite">{{ text }}</output>
    <span
      v-if="variant === 'field'"
      class="mi-stepper__field"
      role="spinbutton"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      :aria-valuenow="model"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuetext="text"
      :aria-disabled="disabled || undefined"
      @keydown="onKeydown"
    >{{ text }}</span>
    <span class="mi-stepper__ctl" role="group" :aria-label="label" @keydown="variant === 'default' ? onKeydown($event) : undefined">
      <template v-if="variant === 'default'">
        <button type="button" class="mi-stepper__btn" :aria-label="decLabel" :disabled="disabled || atMin" @pointerdown="onPointerDown(-1, $event)" @click="onClick(-1, $event)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
        </button>
        <span class="mi-stepper__sep" aria-hidden="true" />
        <button type="button" class="mi-stepper__btn" :aria-label="incLabel" :disabled="disabled || atMax" @pointerdown="onPointerDown(1, $event)" @click="onClick(1, $event)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </template>
      <template v-else>
        <button type="button" class="mi-stepper__btn" :aria-label="incLabel" tabindex="-1" :disabled="disabled || atMax" @pointerdown="onPointerDown(1, $event)" @click="onClick(1, $event)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
        </button>
        <button type="button" class="mi-stepper__btn" :aria-label="decLabel" tabindex="-1" :disabled="disabled || atMin" @pointerdown="onPointerDown(-1, $event)" @click="onClick(-1, $event)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </template>
    </span>
  </span>
</template>

<style scoped>
.mi-stepper {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-family: var(--mi-font);
  color: var(--mi-label);
}
.mi-stepper.is-field { gap: 6px; }
.mi-stepper.is-disabled { opacity: .4; }

.mi-stepper__value {
  min-width: 24px;
  text-align: right;
  font-size: 17px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.mi-stepper__field {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 52px;
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  background: var(--mi-field);
  box-shadow: inset 0 0 0 1px var(--mi-field-b);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.mi-stepper__ctl {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 9px;
  background: var(--mi-fill3);
}
.is-field .mi-stepper__ctl {
  flex-direction: column;
  padding: 0;
  border-radius: 6px;
  background: var(--mi-field);
  box-shadow: inset 0 0 0 1px var(--mi-field-b);
  overflow: hidden;
}

.mi-stepper__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--mi-label);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.is-field .mi-stepper__btn { width: 20px; height: 13px; border-radius: 0; }
.mi-stepper__btn:disabled { color: var(--mi-label3); cursor: default; }

/* Pressed feedback is an opacity-faded layer, never an animated background. */
.mi-stepper__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-fill2);
  opacity: 0;
  transition: opacity var(--mi-dur-1) ease;
}
.mi-stepper__btn:active:not(:disabled)::before { opacity: 1; }
.mi-stepper__btn svg { position: relative; }

.mi-stepper__sep {
  width: 1px;
  height: 18px;
  background: var(--mi-sep2);
}
.mi-stepper__field:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 2px; }
</style>
