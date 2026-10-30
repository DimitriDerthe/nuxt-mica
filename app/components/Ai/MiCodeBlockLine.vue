<script setup lang="ts">
/** One code line with an optional highlighted, added or removed variant. */
withDefaults(defineProps<{
  /** Line emphasis. */
  variant?: 'default' | 'highlighted' | 'added' | 'removed'
}>(), { variant: 'default' })

defineSlots<{
  /** Text of the line. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-cb__line" :class="variant !== 'default' && `is-${variant}`"><slot /></span>
</template>
