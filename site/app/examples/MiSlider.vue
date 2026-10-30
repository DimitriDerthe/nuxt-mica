<script lang="ts">
export const playground = {
  props: { label: 'Volume', unit: '%' },
  controls: ['label', 'tone', 'min', 'max', 'step', 'unit', 'showValue', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const volume = ref(64)
</script>

<template>
  <div class="card">
    <MiSlider v-model="volume" v-bind="p">
      <template #start><MiIcon name="speaker" :size="18" /></template>
      <template #end><MiIcon name="speaker-wave" :size="18" /></template>
    </MiSlider>
  </div>
</template>

<style scoped>
.card { width: min(100%, 340px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; color: var(--mi-label2); }
</style>
