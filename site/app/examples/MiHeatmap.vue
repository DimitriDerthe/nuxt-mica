<script lang="ts">
// 20 weeks of deploys: busy midweek, quiet weekends, a deterministic pseudo-random spread.
const weeks = 20
const weekday = [5, 7, 8, 6, 4, 1, 0]
const data = Array.from({ length: weeks * 7 }, (_, i) => {
  const d = i % 7
  const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1
  const ramp = 0.7 + (i / (weeks * 7)) * 0.6
  return Math.max(0, Math.round((weekday[d] ?? 0) * ramp + Math.abs(noise) * 4 - 1.5))
})

export const playground = {
  props: { title: 'Deploys', subtitle: 'Last 20 weeks, production', unit: 'deploys', data },
  controls: ['title', 'subtitle', 'card', 'legend', 'unit', 'cell', 'gap', 'max'],
  layout: 'fill',
  height: 300
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiHeatmap v-bind="p" />
</template>
