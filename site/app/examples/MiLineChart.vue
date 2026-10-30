<script lang="ts">
export const playground = {
  props: {
    title: 'Weekly active users',
    subtitle: 'Last 8 weeks, all workspaces',
    unit: 'k',
    categories: ['Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20', 'Oct 27'],
    series: [
      { name: 'This year', data: [12.4, 13.1, 12.8, 14.6, 15.2, 14.9, 16.8, 18.1] },
      { name: 'Last year', data: [9.8, 10.2, 10.9, 10.6, 11.4, 11.9, 12.2, 12.8] }
    ]
  },
  controls: ['title', 'card', 'area', 'endLabels', 'toolbar', 'height', 'ticks', 'unit'],
  layout: 'fill',
  height: 360
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiLineChart v-bind="p" />
</template>
