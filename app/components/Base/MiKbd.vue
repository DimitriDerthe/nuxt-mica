<script setup lang="ts">
/** Keyboard key or short keyboard input, rendered as a small keycap. */

defineSlots<{
  /** Key name or symbol, such as Ctrl or Esc. */
  default?(): unknown
}>()
</script>

<template>
  <kbd class="mi-kbd"><slot /></kbd>
</template>

<style scoped>
.mi-kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--mi-radius-s);background:var(--mi-fill2);color:var(--mi-label2);font-family:var(--mi-font);font-size:12px;line-height:1;font-weight:500;user-select:none;box-sizing:border-box}
</style>
