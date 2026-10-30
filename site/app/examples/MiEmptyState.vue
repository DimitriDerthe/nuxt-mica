<script lang="ts">
export const playground = {
  props: {
    title: 'No invoices yet',
    description: 'Invoices you send or receive will show up here. Create your first one in under a minute.',
    icon: 'document',
    primaryLabel: 'Create invoice',
    secondaryLabel: 'Import from CSV',
    card: true
  },
  controls: ['icon', 'title', 'description', 'primaryLabel', 'secondaryLabel', 'card']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex">
    <MiEmptyState v-bind="p" />
  </div>
</template>

<style scoped>
.ex { width: min(100%, 400px); }
</style>
