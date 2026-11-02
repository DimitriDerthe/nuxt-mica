<script lang="ts">
export const playground = {
  props: {
    title: 'Revenue by channel',
    subtitle: 'Last 30 days',
    unit: '',
    data: [
      { label: 'Direct', value: 4200 },
      { label: 'Search', value: 3100 },
      { label: 'Social', value: 1700 },
      { label: 'Referral', value: 1000 }
    ]
  },
  controls: ['title', 'subtitle', 'variant', 'card', 'size', 'thickness', 'gap', 'valueLabels', 'legend', 'toggle', 'animate'],
  layout: 'fill',
  height: 360
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const active = ref(-1)
</script>

<template>
  <MiDonutChart v-bind="p" v-model:active="active" />
</template>
