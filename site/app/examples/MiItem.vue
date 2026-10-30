<script lang="ts">
export const playground = {
  props: { variant: 'outline', title: 'Invoice #2041', description: 'Paid on Oct 12 by Northwind Traders' },
  controls: ['variant', 'size', 'mediaVariant', 'title', 'description'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-box">
    <MiItem v-bind="p">
      <template #header><MiBadge>Billing</MiBadge></template>
      <template #media><MiIcon name="document" :size="22" /></template>
      <template #actions><MiButton size="small" variant="tinted">Download</MiButton></template>
      <template #footer>Net 30 · USD</template>
    </MiItem>
  </div>
</template>

<style scoped>
.ex-box { width: min(100%, 460px); margin-inline: auto; }
</style>
