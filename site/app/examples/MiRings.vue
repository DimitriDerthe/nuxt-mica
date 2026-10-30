<script lang="ts">
export const playground = {
  props: {
    title: 'Weekly goals',
    subtitle: 'Oct 27 to Nov 2',
    rings: [
      { label: 'Focus time', sub: '33 of 40 h', value: 0.82 },
      { label: 'Workouts', sub: '3 of 5 sessions', value: 0.6 },
      { label: 'Reading', sub: '4 of 4 chapters', value: 1 }
    ]
  },
  controls: ['title', 'subtitle', 'card', 'legend', 'size', 'strokeWidth', 'gap', 'animate'],
  layout: 'fill',
  height: 320
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const active = ref(-1)
</script>

<template>
  <MiRings v-bind="p" v-model:active="active" />
</template>
