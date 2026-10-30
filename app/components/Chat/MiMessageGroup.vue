<script setup lang="ts">
/** Stacks consecutive MiMessage rows with tight spacing; use an empty avatar slot on earlier rows to keep alignment. */

defineSlots<{
  /** Consecutive MiMessage rows. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-mg"><slot /></div>
</template>

<style scoped>
.mi-mg{display:flex;flex-direction:column;gap:4px;min-width:0}
</style>
