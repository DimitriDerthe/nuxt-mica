<script setup lang="ts">
/** Footer area of a code block. */

defineSlots<{
  /** Footer content such as a caption or run status. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-cb__foot"><slot /></div>
</template>
