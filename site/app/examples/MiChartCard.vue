<script lang="ts">
export const playground = {
  props: { title: 'Support tickets', subtitle: 'Opened per day' },
  controls: ['title', 'subtitle', 'surface', 'headingLevel'],
  slot: '<MiBarChart :data="data" :card="false" />',
  layout: 'fill',
  height: 340
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const range = ref<string | number | null>('week')
const ranges = [{ value: 'week', label: '7D' }, { value: 'month', label: '4W' }]
const data = computed(() => range.value === 'week'
  ? [{ label: 'Mon', value: 64 }, { label: 'Tue', value: 71 }, { label: 'Wed', value: 58 }, { label: 'Thu', value: 83 }, { label: 'Fri', value: 77 }, { label: 'Sat', value: 22 }, { label: 'Sun', value: 18 }]
  : [{ label: 'Oct 6', value: 402 }, { label: 'Oct 13', value: 451 }, { label: 'Oct 20', value: 388 }, { label: 'Oct 27', value: 393 }])
</script>

<template>
  <MiChartCard v-bind="p">
    <template #actions>
      <MiSegmented v-model="range" :options="ranges" label="Range" />
    </template>
    <MiBarChart :data="data" :card="false" :height="180" aria-label="Support tickets opened" />
  </MiChartCard>
</template>
