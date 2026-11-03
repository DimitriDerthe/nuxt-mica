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
  <span class="mi-stepper mi:font-mi" :class="[`is-${variant}`, { 'is-disabled': disabled }]">
    <output v-if="variant === 'default' && showValue" class="mi-stepper__value mi:min-w-6 mi:text-right mi:text-[17px] mi:font-semibold mi:tabular-nums" aria-live="polite">{{ text }}</output>
    <span
      v-if="variant === 'field'"
      class="mi-stepper__field mi:inline-flex mi:items-center mi:[justify-content:flex-end] mi:min-w-13 mi:h-6.5 mi:py-0 mi:px-2 mi:rounded-[6px] mi:bg-field mi:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:text-[13px] mi:tabular-nums mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]"
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
    <span class="mi-stepper__ctl mi:inline-flex mi:items-center mi:p-0.5 mi:rounded-[9px] mi:bg-fill3 mi:[.is-field_&]:flex-col mi:[.is-field_&]:p-0 mi:[.is-field_&]:rounded-[6px] mi:[.is-field_&]:bg-field mi:[.is-field_&]:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:[.is-field_&]:overflow-hidden" role="group" :aria-label="label" @keydown="variant === 'default' ? onKeydown($event) : undefined">
      <template v-if="variant === 'default'">
        <button type="button" class="mi-stepper__btn mi:relative mi:inline-flex mi:items-center mi:justify-center mi:w-11 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[7px] mi:bg-transparent mi:text-label mi:[-webkit-tap-highlight-color:transparent] mi:touch-manipulation mi:[.is-field_&]:w-5 mi:[.is-field_&]:h-[13px] mi:[.is-field_&]:rounded-none mi:disabled:text-label3 mi:disabled:cursor-default mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill2 mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[&:active:not(:disabled)]:before:opacity-100" :aria-label="decLabel" :disabled="disabled || atMin" @pointerdown="onPointerDown(-1, $event)" @click="onClick(-1, $event)">
          <svg class="mi:[.mi-stepper__btn_&]:relative" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
        </button>
        <span class="mi-stepper__sep mi:w-px mi:h-4.5 mi:bg-sep2" aria-hidden="true" />
        <button type="button" class="mi-stepper__btn mi:relative mi:inline-flex mi:items-center mi:justify-center mi:w-11 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[7px] mi:bg-transparent mi:text-label mi:[-webkit-tap-highlight-color:transparent] mi:touch-manipulation mi:[.is-field_&]:w-5 mi:[.is-field_&]:h-[13px] mi:[.is-field_&]:rounded-none mi:disabled:text-label3 mi:disabled:cursor-default mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill2 mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[&:active:not(:disabled)]:before:opacity-100" :aria-label="incLabel" :disabled="disabled || atMax" @pointerdown="onPointerDown(1, $event)" @click="onClick(1, $event)">
          <svg class="mi:[.mi-stepper__btn_&]:relative" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </template>
      <template v-else>
        <button type="button" class="mi-stepper__btn mi:relative mi:inline-flex mi:items-center mi:justify-center mi:w-11 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[7px] mi:bg-transparent mi:text-label mi:[-webkit-tap-highlight-color:transparent] mi:touch-manipulation mi:[.is-field_&]:w-5 mi:[.is-field_&]:h-[13px] mi:[.is-field_&]:rounded-none mi:disabled:text-label3 mi:disabled:cursor-default mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill2 mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[&:active:not(:disabled)]:before:opacity-100" :aria-label="incLabel" tabindex="-1" :disabled="disabled || atMax" @pointerdown="onPointerDown(1, $event)" @click="onClick(1, $event)">
          <svg class="mi:[.mi-stepper__btn_&]:relative" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
        </button>
        <button type="button" class="mi-stepper__btn mi:relative mi:inline-flex mi:items-center mi:justify-center mi:w-11 mi:h-7.5 mi:p-0 mi:[border:0] mi:rounded-[7px] mi:bg-transparent mi:text-label mi:[-webkit-tap-highlight-color:transparent] mi:touch-manipulation mi:[.is-field_&]:w-5 mi:[.is-field_&]:h-[13px] mi:[.is-field_&]:rounded-none mi:disabled:text-label3 mi:disabled:cursor-default mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill2 mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[&:active:not(:disabled)]:before:opacity-100" :aria-label="decLabel" tabindex="-1" :disabled="disabled || atMin" @pointerdown="onPointerDown(-1, $event)" @click="onClick(-1, $event)">
          <svg class="mi:[.mi-stepper__btn_&]:relative" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
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
  color: var(--mi-label);
}
.mi-stepper.is-field { gap: 6px; }
.mi-stepper.is-disabled { opacity: .4; }
</style>
