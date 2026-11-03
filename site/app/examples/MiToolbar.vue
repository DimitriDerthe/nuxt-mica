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
  <div class="window mi:self-center mi:rounded-[16px] mi:overflow-hidden mi:bg-card mi:shadow-1 mi:min-w-0">
    <MiToolbar v-model:view="view" v-model:search="search" v-bind="p" />
    <div class="body mi:p-4.5 mi:min-h-15">
      <span class="meta mi:text-[13px] mi:text-label2">{{ view === 'list' ? 'List' : 'Grid' }} view{{ search ? ` · matching "${search}"` : '' }}</span>
    </div>
  </div>
</template>
