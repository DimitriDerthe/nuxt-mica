<script setup lang="ts">
/** Checkbox with optional description and mixed (indeterminate) state. Use standalone with v-model, or inside MiCheckboxGroup via `value`. */
import { computed, inject } from 'vue'
import { MI_CHECKBOX_KEY } from '../../utils/miControls'

defineSlots<{
  /** Custom label content replacing the `label` text. */
  default?(): unknown
}>()

const props = defineProps<{
  /** Value used when the checkbox lives inside an MiCheckboxGroup. */
  value?: string | number
  /** Text shown beside the box. */
  label?: string
  /** Secondary line under the label. */
  description?: string
  /** Blocks interaction and dims the control. */
  disabled?: boolean
}>()

/** Checked state (standalone use). Inside a group the group's array wins. */
const model = defineModel<boolean>({ default: false })
/** Mixed state, shown as a dash. Activating the box clears it and checks the box. */
const indeterminate = defineModel<boolean>('indeterminate', { default: false })

const group = inject(MI_CHECKBOX_KEY, null)
const grouped = computed(() => !!group && props.value !== undefined)
const checked = computed(() => (grouped.value ? group!.isChecked(props.value) : model.value))
const isDisabled = computed(() => !!props.disabled || !!group?.disabled())
const aria = computed(() => (indeterminate.value ? 'mixed' : checked.value))

function write(on: boolean) {
  if (grouped.value) group!.set(props.value, on)
  else model.value = on
}

function toggle() {
  if (isDisabled.value) return
  if (indeterminate.value) {
    indeterminate.value = false
    write(true)
  } else {
    write(!checked.value)
  }
}
</script>

<template>
  <button
    type="button"
    role="checkbox"
    class="mi-checkbox"
    :class="{ 'is-on': checked || indeterminate, 'has-desc': !!description }"
    :aria-checked="aria"
    :disabled="isDisabled"
    @click="toggle"
  >
    <span class="mi-checkbox__box" aria-hidden="true">
      <span class="mi-checkbox__fill" />
      <svg class="mi-checkbox__mark" :class="{ 'is-shown': checked && !indeterminate }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7" pathLength="1" /></svg>
      <svg class="mi-checkbox__mark" :class="{ 'is-shown': indeterminate }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 12h12" pathLength="1" /></svg>
    </span>
    <span v-if="label || description || $slots.default" class="mi-checkbox__text">
      <span class="mi-checkbox__label"><slot>{{ label }}</slot></span>
      <span v-if="description" class="mi-checkbox__desc">{{ description }}</span>
    </span>
  </button>
</template>

<style scoped>
.mi-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 44px;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--mi-label);
  font-family: var(--mi-font);
  font-size: 15px;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.mi-checkbox.has-desc { min-height: 52px; }
.mi-checkbox:disabled { opacity: .4; cursor: default; }
/* Group parent row: bold label with a hairline under it. */
.mi-checkbox--parent { font-weight: 600; border-bottom: .5px solid var(--mi-sep); padding-bottom: 0; }

.mi-checkbox__box {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--mi-field);
  color: var(--mi-p-on);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.mi-checkbox:active:not(:disabled) .mi-checkbox__box { transform: scale(.9); }
.mi-checkbox__box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1.5px var(--mi-ctl, #8E8E93);
  opacity: 1;
  transition: opacity var(--mi-dur-1) ease;
}
.is-on .mi-checkbox__box::before { opacity: 0; }
.mi-checkbox__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-p);
  opacity: 0;
  transition: opacity var(--mi-dur-1) ease;
}
.is-on .mi-checkbox__fill { opacity: 1; }

.mi-checkbox__mark {
  position: absolute;
  inset: 0;
  margin: auto;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset var(--mi-dur-1) ease;
}
.mi-checkbox__mark.is-shown {
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--mi-dur-2) var(--mi-ease) 50ms;
}

.mi-checkbox__text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.mi-checkbox__desc { font-size: 13px; font-weight: 400; color: var(--mi-label2); }
</style>
