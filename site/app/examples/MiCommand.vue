<script lang="ts">
export const playground = {
  props: {
    items: [
      { value: 'new-file', label: 'New file', group: 'File', shortcut: 'N' },
      { value: 'open', label: 'Open recent...', group: 'File', shortcut: 'O' },
      { value: 'save', label: 'Save all', group: 'File', shortcut: 'S', keywords: ['write'] },
      { value: 'theme', label: 'Toggle dark mode', group: 'View', keywords: ['appearance'] },
      { value: 'zoom', label: 'Zoom in', group: 'View', shortcut: '+' },
      { value: 'invite', label: 'Invite teammate', group: 'Team' },
      { value: 'billing', label: 'Billing (admin only)', group: 'Team', disabled: true }
    ]
  },
  controls: ['placeholder', 'emptyText'],
  layout: 'center',
  height: 380
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const last = ref('Nothing yet')
</script>

<template>
  <div class="wrap">
    <MiCommand v-bind="p" @select="last = $event.label" />
    <p class="last">Last action: {{ last }}</p>
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 360px); display: grid; gap: 12px; }
.last { margin: 0; font-size: 14px; opacity: .7; }
</style>
