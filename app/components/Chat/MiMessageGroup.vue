<script setup lang="ts">
/** Stacks consecutive MiMessage rows with tight spacing; use an empty avatar slot on earlier rows to keep alignment. */

defineSlots<{
  /** Consecutive MiMessage rows. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-mg mi:flex mi:flex-col mi:gap-1 mi:min-w-0"><slot /></div>
</template>
