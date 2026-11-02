<script lang="ts">
export const playground = {
  props: { label: 'Meeting start', minuteStep: 5 },
  controls: ['hour12', 'seconds', 'minuteStep', 'min', 'max', 'disabled', 'invalid']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const time = ref<string | null>('09:30')
</script>

<template>
  <div class="stack">
    <MiTimePicker v-model="time" v-bind="p" />
    <MiText variant="footnote" tone="label2">Value: {{ time ?? 'empty' }}</MiText>
  </div>
</template>

<style scoped>
.stack { display: grid; gap: 10px; justify-items: start; }
</style>
