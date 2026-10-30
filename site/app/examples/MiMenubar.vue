<script lang="ts">
export const playground = {
  props: {
    menus: [
      { id: 'file', label: 'File', items: [
        { value: 'new', label: 'New window', shortcut: 'Cmd N' },
        { value: 'open', label: 'Open...', shortcut: 'Cmd O' },
        { separator: true },
        { value: 'close', label: 'Close tab', shortcut: 'Cmd W' }
      ] },
      { id: 'edit', label: 'Edit', items: [
        { value: 'undo', label: 'Undo', shortcut: 'Cmd Z' },
        { value: 'redo', label: 'Redo', shortcut: 'Shift Cmd Z', disabled: true },
        { separator: true },
        { value: 'delete', label: 'Delete', destructive: true }
      ] },
      { id: 'view', label: 'View', items: [
        { heading: 'Panels' },
        { value: 'sidebar', label: 'Sidebar', checked: true },
        { value: 'status', label: 'Status bar', checked: false }
      ] },
      { id: 'help', label: 'Help', disabled: true, items: [] }
    ]
  },
  controls: ['ariaLabel'],
  layout: 'start',
  height: 260
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const last = ref('')
</script>

<template>
  <div class="wrap">
    <MiMenubar v-bind="p" @select="(m, i) => last = `${m} / ${i.label}`" />
    <p v-if="last" class="last">Selected: {{ last }}</p>
  </div>
</template>

<style scoped>
.wrap { display: grid; gap: 12px; }
.last { margin: 0; font-size: 14px; opacity: .7; }
</style>
