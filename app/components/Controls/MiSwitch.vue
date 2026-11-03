<script setup lang="ts">
/** On/off toggle switch bound to a boolean v-model. Sizes `regular` (51x31) or `compact` (38x22); tones primary, secondary, success. */
export type MiSwitchTone = 'primary' | 'secondary' | 'success'
export type MiSwitchSize = 'regular' | 'compact'

const props = withDefaults(defineProps<{
  /** `regular` is 51x31, `compact` is 38x22 for dense desktop forms. */
  size?: MiSwitchSize
  /** Color of the on state. */
  tone?: MiSwitchTone
  /** Blocks interaction and dims the control. */
  disabled?: boolean
  /** Accessible name. Use `aria-labelledby` instead when a visible label exists. */
  label?: string
}>(), {
  size: 'regular',
  tone: 'primary'
})

/** Whether the switch is on. */
const model = defineModel<boolean>({ default: false })

function toggle() {
  if (!props.disabled) model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="mi-switch mi:[--_c:var(--mi-p)] mi:[--_x:20px] mi:[-webkit-tap-highlight-color:transparent] mi:[&.is-compact]:[--_x:16px] mi:[&.tone-secondary]:[--_c:var(--mi-s)] mi:[&.tone-success]:[--_c:var(--mi-green)]"
    :class="[`is-${size}`, `tone-${tone}`, { 'is-on': model }]"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="mi-switch__on mi:absolute mi:inset-0 mi:rounded-[inherit] mi:[background:var(--\_c)] mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_ease] mi:[.is-on_&]:opacity-100" aria-hidden="true" />
    <span class="mi-switch__knob mi:absolute mi:top-0.5 mi:left-0.5 mi:w-[27px] mi:h-[27px] mi:rounded-[50%] mi:[background:#fff] mi:shadow-[0_3px_8px_rgba(0,_0,_0,_.15),_0_3px_1px_rgba(0,_0,_0,_.06)] mi:transform-[translateX(0)] mi:[transition:transform_var(--mi-dur-2)_cubic-bezier(.3,_.7,_.4,_1)] mi:[.is-compact_&]:w-4.5 mi:[.is-compact_&]:h-4.5 mi:[.is-compact_&]:shadow-[0_2px_4px_rgba(0,_0,_0,_.18)] mi:[.is-on_&]:transform-[translateX(var(--\_x))]" aria-hidden="true" />
  </button>
</template>

<style scoped>
.mi-switch {
  position: relative;
  display: inline-block;
  flex: none;
  width: 51px;
  height: 31px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--mi-off);
}
.mi-switch.is-compact { width: 38px; height: 22px; }
.mi-switch:disabled { opacity: .4; cursor: default; }
</style>
