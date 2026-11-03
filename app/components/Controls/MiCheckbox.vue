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
    class="mi-checkbox mi:min-h-11 mi:[-webkit-tap-highlight-color:transparent] mi:[&.has-desc]:min-h-13 mi:disabled:cursor-default"
    :class="{ 'is-on': checked || indeterminate, 'has-desc': !!description }"
    :aria-checked="aria"
    :disabled="isDisabled"
    @click="toggle"
  >
    <span class="mi-checkbox__box mi:relative mi:flex mi:flex-[none] mi:items-center mi:justify-center mi:w-5 mi:h-5 mi:rounded-[6px] mi:bg-field mi:text-p-on mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.mi-checkbox:active:not(:disabled)_&]:transform-[scale(.9)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:shadow-[inset_0_0_0_1.5px_var(--mi-ctl,_#8E8E93)] mi:before:opacity-100 mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[.is-on_&]:before:opacity-0" aria-hidden="true">
      <span class="mi-checkbox__fill mi:absolute mi:inset-0 mi:rounded-[inherit] mi:bg-p mi:opacity-0 mi:[transition:opacity_var(--mi-dur-1)_ease] mi:[.is-on_&]:opacity-100" />
      <svg class="mi-checkbox__mark mi:absolute mi:inset-0 mi:m-auto mi:[stroke-dasharray:1] mi:[stroke-dashoffset:1] mi:[transition:stroke-dashoffset_var(--mi-dur-1)_ease] mi:[&.is-shown]:[stroke-dashoffset:0] mi:[&.is-shown]:[transition:stroke-dashoffset_var(--mi-dur-2)_var(--mi-ease)_50ms]" :class="{ 'is-shown': checked && !indeterminate }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7" pathLength="1" /></svg>
      <svg class="mi-checkbox__mark mi:absolute mi:inset-0 mi:m-auto mi:[stroke-dasharray:1] mi:[stroke-dashoffset:1] mi:[transition:stroke-dashoffset_var(--mi-dur-1)_ease] mi:[&.is-shown]:[stroke-dashoffset:0] mi:[&.is-shown]:[transition:stroke-dashoffset_var(--mi-dur-2)_var(--mi-ease)_50ms]" :class="{ 'is-shown': indeterminate }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"><path d="M6 12h12" pathLength="1" /></svg>
    </span>
    <span v-if="label || description || $slots.default" class="mi-checkbox__text mi:flex mi:flex-col mi:gap-px mi:min-w-0">
      <span class="mi-checkbox__label"><slot>{{ label }}</slot></span>
      <span v-if="description" class="mi-checkbox__desc mi:text-[13px] mi:font-normal mi:text-label2">{{ description }}</span>
    </span>
  </button>
</template>

<style scoped>
.mi-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 4px 0;
  border: 0;
  background: transparent;
  color: var(--mi-label);
  font-family: var(--mi-font);
  font-size: 15px;
  text-align: left;
}
.mi-checkbox:disabled { opacity: .4; }
/* Group parent row: bold label with a hairline under it. */
.mi-checkbox--parent { font-weight: 600; border-bottom: .5px solid var(--mi-sep); padding-bottom: 0; }
</style>
