<script lang="ts">
export const playground = {
  props: {
    title: 'New subscriptions',
    subtitle: 'Per month, 2026',
    data: [
      { label: 'Jan', value: 312 }, { label: 'Feb', value: 348 }, { label: 'Mar', value: 401 },
      { label: 'Apr', value: 389 }, { label: 'May', value: 452 }, { label: 'Jun', value: 498 },
      { label: 'Jul', value: 441 }, { label: 'Aug', value: 417 }, { label: 'Sep', value: 536 },
      { label: 'Oct', value: 584 }
    ]
  },
  controls: ['title', 'subtitle', 'card', 'valueLabels', 'unit', 'height', 'ticks', 'maxBarWidth', 'radius', 'animate'],
  layout: 'fill',
  height: 340
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiBarChart v-bind="p" />
</template>
