<script setup lang="ts">
/** Main text of a trace line. */

defineSlots<{
  /** Main label of the step. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-tr__title"><slot /></span>
</template>
