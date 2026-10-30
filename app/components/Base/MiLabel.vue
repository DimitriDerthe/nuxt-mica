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
  <label class="mi-label" :class="{ 'mi-label--disabled': disabled }" :for="$props.for">
    <slot /><span v-if="required" class="mi-label__req" aria-hidden="true">*</span>
  </label>
</template>

<style scoped>
.mi-label{display:inline-flex;align-items:center;gap:4px;font-family:var(--mi-font);font-size:14px;line-height:1;font-weight:500;color:var(--mi-label)}
.mi-label--disabled{opacity:.5;cursor:not-allowed}
.mi-label__req{color:var(--mi-red-t)}
</style>
