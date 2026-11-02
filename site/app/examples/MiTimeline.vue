<script lang="ts">
export const playground = {
  props: {
    items: [
      { title: 'Order placed', description: 'Payment confirmed for order #4821.', time: '2026-03-02', icon: 'check', status: 'done' },
      { title: 'Packed', description: 'Your items were packed at the Lyon warehouse.', time: '2026-03-03', icon: 'archive', status: 'done' },
      { title: 'Out for delivery', description: 'The courier is on the way.', time: '2026-03-04', icon: 'arrow-right', status: 'current' },
      { title: 'Delivered', time: '2026-03-05', status: 'upcoming', tone: 'success' }
    ]
  },
  controls: ['align'],
  height: 440
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiTimeline v-bind="p" class="ex-tl" aria-label="Order progress" />
</template>

<style scoped>
.ex-tl { width: min(100%, 760px); }
</style>
