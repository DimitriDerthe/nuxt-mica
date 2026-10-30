<script lang="ts">
export const playground = {}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex">
    <span>Open the command palette</span>
    <MiKbdGroup>
      <MiKbd v-bind="p">Ctrl</MiKbd>
      <MiKbd v-bind="p">K</MiKbd>
    </MiKbdGroup>
    <span>or press <MiKbd v-bind="p">Esc</MiKbd> to close</span>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 10px; justify-items: start; font-size: 15px; color: var(--mi-label2); }
</style>
