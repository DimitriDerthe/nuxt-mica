<script lang="ts">
export const playground = {
  props: {
    title: 'Roadmap',
    subtitle: '12 docs',
    searchable: true,
    searchPlaceholder: 'Search documents',
    primaryLabel: 'New',
    avatar: 'AM',
    views: [
      { id: 'grid', label: 'Grid', icon: 'grid' },
      { id: 'list', label: 'List', icon: 'list' }
    ]
  },
  controls: ['title', 'subtitle', 'sidebarToggle', 'history', 'canGoBack', 'canGoForward', 'searchable', 'share', 'primaryLabel', 'avatar'],
  layout: 'fill',
  height: 200
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const view = ref<string | undefined>('grid')
const search = ref('')
</script>

<template>
  <div class="window">
    <MiToolbar v-model:view="view" v-model:search="search" v-bind="p" />
    <div class="body">
      <span class="meta">{{ view === 'list' ? 'List' : 'Grid' }} view{{ search ? ` · matching "${search}"` : '' }}</span>
    </div>
  </div>
</template>

<style scoped>
.window { align-self: center; border-radius: 16px; overflow: hidden; background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.body { padding: 18px; min-height: 60px; }
.meta { font-size: 13px; color: var(--mi-label2); }
</style>
