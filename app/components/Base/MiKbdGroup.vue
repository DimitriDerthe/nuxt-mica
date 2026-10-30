<script setup lang="ts">
/** Groups several MiKbd keys in a row, e.g. a shortcut like Ctrl + K. */

defineSlots<{
  /** MiKbd keys that form one shortcut. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-kbd-group"><slot /></span>
</template>

<style scoped>
.mi-kbd-group{display:inline-flex;align-items:center;gap:4px}
</style>
