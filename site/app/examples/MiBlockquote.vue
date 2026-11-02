<script lang="ts">
export const playground = {
  props: {
    quote: 'Switching to the layer cut our UI work in half, and nobody on the team had to relearn anything.',
    cite: 'Maya Okafor',
    role: 'Head of Design, Northwind'
  },
  controls: ['variant', 'size']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiBlockquote v-bind="p" class="ex-bq">
    <template #avatar><MiAvatar name="Maya Okafor" tone="auto" /></template>
  </MiBlockquote>
</template>

<style scoped>
.ex-bq { width: min(100%, 520px); }
</style>
