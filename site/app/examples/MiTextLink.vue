<script lang="ts">
export const playground = {
  controls: ['brand', 'chevron'],
  slot: 'Browse the catalog'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="card">
    <MiText variant="title3" as="h3">Built for real products</MiText>
    <MiText variant="body" tone="label2">
      Every component ships with dark mode, keyboard support and docs an assistant can read.
      <MiTextLink v-bind="p" @click.prevent>Browse the catalog</MiTextLink>
    </MiText>
  </div>
</template>

<style scoped>
.card { display: grid; gap: 8px; width: min(100%, 420px); padding: 20px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
