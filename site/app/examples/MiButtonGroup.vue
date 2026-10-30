<script lang="ts">
export const playground = {
  props: {
    variant: 'segmented',
    label: 'Calendar view',
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' }
    ]
  },
  controls: ['variant'],
  height: 300
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const view = ref<string | number | undefined>('week')
const createItems = [
  { value: 'task', label: 'New task', shortcut: '⌘T' },
  { value: 'reminder', label: 'New reminder', shortcut: '⌘R' },
  { separator: true },
  { value: 'import', label: 'Import calendar…' }
]
</script>

<template>
  <div class="bar">
    <MiText variant="headline" as="h3">October 2026</MiText>
    <MiButtonGroup v-if="p.variant === 'attached'" v-bind="p" label="Navigate weeks">
      <MiIconButton label="Previous week" size="toolbar"><MiIcon name="chevron-left" :size="18" /></MiIconButton>
      <MiButton variant="gray" size="small">Today</MiButton>
      <MiIconButton label="Next week" size="toolbar"><MiIcon name="chevron-right" :size="18" /></MiIconButton>
    </MiButtonGroup>
    <MiButtonGroup v-else-if="p.variant === 'split'" v-bind="p" label="Create">
      <MiButton>New event</MiButton>
      <MiMenu :items="createItems" aria-label="More create options" placement="bottom-end">
        <template #trigger="{ props: t }">
          <MiButton v-bind="t"><MiIcon name="chevron-down" :size="16" /></MiButton>
        </template>
      </MiMenu>
    </MiButtonGroup>
    <MiButtonGroup v-else v-model="view" v-bind="p" />
  </div>
</template>

<style scoped>
.bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; width: min(100%, 480px); padding: 12px 14px 12px 18px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
