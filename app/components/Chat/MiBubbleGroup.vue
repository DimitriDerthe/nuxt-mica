<script setup lang="ts">
/** Groups consecutive bubbles from one sender with tight spacing. Set `align` on each MiBubble, not here. */

defineSlots<{
  /** Consecutive MiBubble elements from the same sender. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-bg"><slot /></div>
</template>

<style scoped>
.mi-bg{display:flex;flex-direction:column;gap:2px;min-width:0}
</style>
