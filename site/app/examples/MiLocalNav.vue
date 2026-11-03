<script lang="ts">
export const playground = {
  props: {
    title: 'Mica Pro',
    actionLabel: 'Buy',
    sticky: false,
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'features', label: 'Features' },
      { id: 'specs', label: 'Tech specs' },
      { id: 'pricing', label: 'Pricing' },
      { id: 'support', label: 'Support', disabled: true }
    ]
  },
  controls: ['title', 'actionLabel', 'sticky'],
  layout: 'fill',
  height: 200
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const section = ref<string | undefined>('features')
</script>

<template>
  <div class="wrap mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:content-center mi:min-w-0">
    <MiLocalNav v-model="section" v-bind="p" />
  </div>
</template>
