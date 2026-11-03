<script lang="ts">
export const playground = {
  props: { label: 'Guests', min: 1, max: 12 },
  controls: ['variant', 'min', 'max', 'step', 'unit', 'showValue', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const guests = ref(2)
</script>

<template>
  <div class="row mi:shadow-1 mi:box-border">
    <div class="text mi:grid mi:gap-0.5 mi:min-w-0">
      <MiText variant="body" weight="medium" id="ex-stepper">Guests</MiText>
      <MiText variant="footnote" tone="label2">Ages 13 or above</MiText>
    </div>
    <MiStepper v-model="guests" v-bind="p" />
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: min(100%, 340px); padding: 14px 16px; border-radius: 16px; background: var(--mi-card); }
</style>
