<script setup lang="ts">
/** Title in a code block header, such as a filename or Terminal. */

defineSlots<{
  /** Title text, such as a filename or language. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-cb__name"><slot /></span>
</template>
