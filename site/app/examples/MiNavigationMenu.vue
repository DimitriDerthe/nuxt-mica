<script lang="ts">
export const playground = {
  props: {
    items: [
      { id: 'product', label: 'Product', links: [
        { title: 'Analytics', description: 'Track usage across every surface.', href: '#analytics' },
        { title: 'Automations', description: 'Route work without writing glue code.', href: '#automations' },
        { title: 'Integrations', description: 'Connect the tools your team already uses.', href: '#integrations' }
      ] },
      { id: 'resources', label: 'Resources', links: [
        { title: 'Documentation', description: 'Guides and API reference.', href: '#docs' },
        { title: 'Changelog', description: 'What shipped this month.', href: '#changelog' }
      ] },
      { id: 'pricing', label: 'Pricing', href: '#pricing' }
    ]
  },
  controls: ['viewport', 'hover', 'closeDelay'],
  layout: 'fill',
  height: 320
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref<string | undefined>()
</script>

<template>
  <MiNavigationMenu v-model="open" v-bind="p" />
</template>
