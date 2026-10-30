<script setup lang="ts">
/** Attachment file name, truncated to one line. */

defineSlots<{
  /** File name text, truncated with an ellipsis. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-att__name"><slot /></span>
</template>
