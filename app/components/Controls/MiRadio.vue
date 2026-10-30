<script setup lang="ts">
/** Single radio button for one choice, standalone via v-model or inside MiRadioGroup via `value`. Prefer MiRadioGroup for a set of options. */
import { computed, inject } from 'vue'
import { MI_RADIO_KEY } from '../../utils/miControls'

defineSlots<{
  /** Custom label content replacing the `label` text. */
  default?(): unknown
}>()

const props = defineProps<{
  /** The value this radio represents. */
  value: string | number | boolean
  /** Text shown beside the radio. */
  label?: string
  /** Secondary line under the label. */
  description?: string
  /** Blocks interaction and dims the control. */
  disabled?: boolean
}>()

/** Selected value (standalone use). Inside an MiRadioGroup the group's model wins. */
const model = defineModel<string | number | boolean | null>({ default: null })

const group = inject(MI_RADIO_KEY, null)
const checked = computed(() => (group ? group.isSelected(props.value) : model.value === props.value))
const isDisabled = computed(() => !!props.disabled || !!group?.disabled())
const tabindex = computed(() => (checked.value || !group || !group.hasSelection() ? 0 : -1))

function pick() {
  if (isDisabled.value) return
  if (group) group.select(props.value)
  else model.value = props.value
}
</script>

<template>
  <button
    type="button"
    role="radio"
    class="mi-radio"
    :class="{ 'is-on': checked, 'has-desc': !!description }"
    :aria-checked="checked"
    :tabindex="tabindex"
    :disabled="isDisabled"
    @click="pick"
  >
    <span class="mi-radio__box" aria-hidden="true">
      <span class="mi-radio__fill" />
      <span class="mi-radio__dot" />
    </span>
    <span v-if="label || description || $slots.default" class="mi-radio__text">
      <span><slot>{{ label }}</slot></span>
      <span v-if="description" class="mi-radio__desc">{{ description }}</span>
    </span>
  </button>
</template>

<style scoped>
.mi-radio {
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
.mi-radio.has-desc { min-height: 52px; }
.mi-radio:disabled { opacity: .4; cursor: default; }

.mi-radio__box {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--mi-field);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.mi-radio:active:not(:disabled) .mi-radio__box { transform: scale(.9); }
.mi-radio__box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1.5px var(--mi-ctl, #8E8E93);
  transition: opacity var(--mi-dur-1) ease;
}
.is-on .mi-radio__box::before { opacity: 0; }
.mi-radio__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-p);
  opacity: 0;
  transition: opacity var(--mi-dur-1) ease;
}
.is-on .mi-radio__fill { opacity: 1; }
.mi-radio__dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--mi-p-on);
  transform: scale(0);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.is-on .mi-radio__dot { transform: scale(1); }

.mi-radio__text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.mi-radio__desc { font-size: 13px; color: var(--mi-label2); }
</style>
