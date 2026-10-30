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
    class="mi-switch"
    :class="[`is-${size}`, `tone-${tone}`, { 'is-on': model }]"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="mi-switch__on" aria-hidden="true" />
    <span class="mi-switch__knob" aria-hidden="true" />
  </button>
</template>

<style scoped>
.mi-switch {
  --_c: var(--mi-p);
  --_x: 20px;
  position: relative;
  display: inline-block;
  flex: none;
  width: 51px;
  height: 31px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--mi-off);
  -webkit-tap-highlight-color: transparent;
}
.mi-switch.is-compact { --_x: 16px; width: 38px; height: 22px; }
.mi-switch.tone-secondary { --_c: var(--mi-s); }
.mi-switch.tone-success { --_c: var(--mi-green); }
.mi-switch:disabled { opacity: .4; cursor: default; }

.mi-switch__on {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--_c);
  opacity: 0;
  transition: opacity var(--mi-dur-2) ease;
}
.is-on .mi-switch__on { opacity: 1; }

.mi-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, .15), 0 3px 1px rgba(0, 0, 0, .06);
  transform: translateX(0);
  transition: transform var(--mi-dur-2) cubic-bezier(.3, .7, .4, 1);
}
.is-compact .mi-switch__knob { width: 18px; height: 18px; box-shadow: 0 2px 4px rgba(0, 0, 0, .18); }
.is-on .mi-switch__knob { transform: translateX(var(--_x)); }
</style>
