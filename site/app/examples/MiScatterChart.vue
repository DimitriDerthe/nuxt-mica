<script lang="ts">
export const playground = {
  props: {
    title: 'Height vs. weight',
    xLabel: 'Height',
    yLabel: 'Weight',
    xUnit: ' cm',
    yUnit: ' kg',
    series: [
      { name: 'Group A', points: [{ x: 158, y: 52 }, { x: 163, y: 58 }, { x: 167, y: 61 }, { x: 171, y: 66 }, { x: 175, y: 71 }, { x: 180, y: 77 }, { x: 184, y: 80 }] },
      { name: 'Group B', points: [{ x: 160, y: 62 }, { x: 166, y: 69 }, { x: 170, y: 74 }, { x: 174, y: 79 }, { x: 178, y: 84 }, { x: 183, y: 90 }] }
    ]
  },
  controls: ['title', 'subtitle', 'card', 'height', 'dotSize', 'maxRadius', 'toolbar', 'toggle', 'animate'],
  layout: 'fill',
  height: 420
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiScatterChart v-bind="p" />
</template>
