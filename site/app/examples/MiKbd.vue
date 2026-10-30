<script lang="ts">
export const playground = {}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
// The keycaps are live: pressing the keys toggles the palette and closes it again.
const palette = ref(false)
</script>

<template>
  <div class="ex">
    <span>Open the command palette</span>
    <MiKbdGroup shortcut="Ctrl K" @press="palette = !palette">
      <MiKbd v-bind="p">Ctrl</MiKbd>
      <MiKbd v-bind="p">K</MiKbd>
    </MiKbdGroup>
    <span>or press <MiKbd v-bind="p" shortcut="Esc" @press="palette = false">Esc</MiKbd> to close</span>
    <MiText variant="footnote" tone="label2" aria-live="polite">{{ palette ? 'Command palette open' : 'Command palette closed' }}</MiText>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 10px; justify-items: start; font-size: 15px; color: var(--mi-label2); }
</style>
