<script lang="ts">
export const playground = {
  props: {
    label: 'View',
    options: [
      { value: 'list', icon: 'list', ariaLabel: 'List' },
      { value: 'grid', icon: 'grid', ariaLabel: 'Grid' },
      { value: 'columns', icon: 'columns', ariaLabel: 'Columns' }
    ]
  },
  controls: ['variant', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const view = ref<string | number | null>('grid')
const range = ref<string | number | null>('week')
const ranges = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' }
]
</script>

<template>
  <div class="card">
    <div class="row">
      <div class="text">
        <MiText variant="headline" as="h3">Documents</MiText>
        <MiText variant="footnote" tone="label2">Showing 24 files as {{ view }}</MiText>
      </div>
      <MiSegmented v-model="view" v-bind="p" />
    </div>
    <div class="row">
      <MiText variant="subheadline" tone="label2">Activity</MiText>
      <MiSegmented v-model="range" :variant="p.variant" :disabled="p.disabled" :options="ranges" label="Activity range" />
    </div>
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 380px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; }
.row + .row { padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.text { display: grid; gap: 2px; min-width: 0; }
</style>
