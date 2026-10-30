<script setup lang="ts">
/** Question title, rendered as the legend of its item. */

defineSlots<{
  /** Question text. */
  default?(): unknown
}>()
</script>

<template>
  <legend class="mi-qn__q"><slot /></legend>
</template>
