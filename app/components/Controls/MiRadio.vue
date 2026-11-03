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
    class="mi-radio mi:flex mi:items-center mi:gap-3 mi:w-full mi:min-h-11 mi:py-1 mi:px-0 mi:[border:0] mi:bg-transparent mi:text-label mi:font-mi mi:text-[15px] mi:text-left mi:[-webkit-tap-highlight-color:transparent] mi:[&.has-desc]:min-h-13 mi:disabled:opacity-40 mi:disabled:cursor-default"
    :class="{ 'is-on': checked, 'has-desc': !!description }"
    :aria-checked="checked"
    :tabindex="tabindex"
    :disabled="isDisabled"
    @click="pick"
  >
    <span class="mi-radio__box mi:relative mi:flex mi:flex-[none] mi:items-center mi:justify-center mi:w-5 mi:h-5 mi:rounded-[50%] mi:bg-field mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.mi-radio:active:not(:disabled)_&]:transform-[scale(.9)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:shadow-[inset_0_0_0_1.5px_var(--mi-ctl,_#8E8E93)] mi:before:[transition:opacity_var(--mi-dur-1)_ease] mi:[.is-on_&]:before:opacity-0" aria-hidden="true">
      <span class="mi-radio__fill mi:absolute mi:inset-0 mi:rounded-[inherit] mi:bg-p mi:opacity-0 mi:[transition:opacity_var(--mi-dur-1)_ease] mi:[.is-on_&]:opacity-100" />
      <span class="mi-radio__dot mi:relative mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-p-on mi:transform-[scale(0)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.is-on_&]:transform-[scale(1)]" />
    </span>
    <span v-if="label || description || $slots.default" class="mi-radio__text mi:flex mi:flex-col mi:gap-px mi:min-w-0">
      <span><slot>{{ label }}</slot></span>
      <span v-if="description" class="mi-radio__desc mi:text-[13px] mi:text-label2">{{ description }}</span>
    </span>
  </button>
</template>
