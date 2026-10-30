<script setup lang="ts">
/** Secondary attachment text such as type, size or upload status. */

defineSlots<{
  /** Secondary text such as file size, type or upload status. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-att__meta"><slot /></span>
</template>
