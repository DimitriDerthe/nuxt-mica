<script setup lang="ts">
/** Groups consecutive bubbles from one sender with tight spacing. Set `align` on each MiBubble, not here. */

defineSlots<{
  /** Consecutive MiBubble elements from the same sender. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-bg mi:flex mi:flex-col mi:gap-0.5 mi:min-w-0"><slot /></div>
</template>
