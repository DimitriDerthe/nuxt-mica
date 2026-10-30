<script lang="ts">
export const playground = {
  props: { content: 'Duplicate', shortcut: '⌘D' },
  controls: ['content', 'shortcut', 'placement', 'delay', 'closeDelay', 'offset', 'disabled'],
  height: 220
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()

const tools = [
  { icon: 'pencil', label: 'Edit', shortcut: 'E' },
  { icon: 'copy', label: 'Duplicate', main: true },
  { icon: 'share', label: 'Share', shortcut: '⇧⌘S' },
  { icon: 'trash', label: 'Delete', shortcut: '⌫' }
] as const
</script>

<template>
  <div class="bar" role="toolbar" aria-label="Slide actions">
    <MiTooltip
      v-for="t in tools" :key="t.icon"
      v-bind="'main' in t ? p : { ...p, content: t.label, shortcut: t.shortcut }"
    >
      <MiIconButton :label="t.label" variant="plain" size="toolbar"><MiIcon :name="t.icon" /></MiIconButton>
    </MiTooltip>
  </div>
</template>

<style scoped>
.bar { display: flex; gap: 4px; padding: 6px; border-radius: 14px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>
