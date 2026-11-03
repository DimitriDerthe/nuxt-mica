<script lang="ts">
export const playground = {
  props: {
    variant: 'popup',
    label: 'Sort by',
    items: [
      { heading: 'Sort by' },
      { value: 'modified', label: 'Date modified' },
      { value: 'created', label: 'Date created' },
      { value: 'name', label: 'Name' },
      { value: 'size', label: 'Size' },
      { value: 'kind', label: 'Kind' }
    ]
  },
  controls: ['variant', 'placement', 'offset', 'disabled'],
  height: 380,
  layout: 'start'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const sort = ref<string | number | undefined>('modified')
const last = ref('')
const actions = [
  { value: 'rename', label: 'Rename', shortcut: '⏎' },
  { value: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
  { value: 'move', label: 'Move to…', shortcut: '⇧⌘M' },
  { separator: true },
  { value: 'archive', label: 'Archive' },
  { value: 'delete', label: 'Delete', shortcut: '⌘⌫', destructive: true }
]
</script>

<template>
  <div class="bar mi:flex-wrap mi:justify-between">
    <div class="text mi:grid mi:gap-0.5 mi:min-w-0">
      <MiText variant="headline" as="h3">Documents</MiText>
      <MiText variant="footnote" tone="label2">{{ last || '24 files · 1.2 GB' }}</MiText>
    </div>
    <MiMenu
      v-if="p.variant === 'pulldown'"
      v-bind="p"
      :items="actions"
      label="Actions"
      @select="item => (last = (item.label || '') + ' selected')"
    />
    <MiMenu v-else v-model="sort" v-bind="p" aria-label="Sort documents by" />
  </div>
</template>

<style scoped>
.bar { display: flex; align-items: center; gap: 12px 20px; width: min(100%, 440px); margin: 0 auto; padding: 14px 16px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
