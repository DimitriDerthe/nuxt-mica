<script setup lang="ts">
/** Secondary trace text after the title, such as a count or duration. */

defineSlots<{
  /** Secondary text such as a count, tool name or duration. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-tr__desc"><slot /></span>
</template>
