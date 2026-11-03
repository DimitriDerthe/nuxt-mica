<script setup lang="ts">
/** Accessible form label bound to a control by id, with optional required marker and disabled styling. */
defineProps<{
  /** Id of the control this label describes. */
  for?: string
  /** Show a required asterisk (hidden from assistive tech). */
  required?: boolean
  /** Dim the label to match a disabled control. */
  disabled?: boolean
}>()

defineSlots<{
  /** Label text, shown before the required marker. */
  default?(): unknown
}>()
</script>

<template>
  <label class="mi-label mi:inline-flex mi:items-center mi:gap-1 mi:font-mi mi:text-[14px] mi:leading-none mi:font-medium mi:text-label" :class="{ 'mi-label--disabled mi:opacity-50 mi:cursor-not-allowed': disabled }" :for="$props.for">
    <slot /><span v-if="required" class="mi-label__req mi:text-red-t" aria-hidden="true">*</span>
  </label>
</template>
