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
  <div class="row">
    <div class="text">
      <MiText variant="body" weight="medium" id="ex-stepper">Guests</MiText>
      <MiText variant="footnote" tone="label2">Ages 13 or above</MiText>
    </div>
    <MiStepper v-model="guests" v-bind="p" />
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: min(100%, 340px); padding: 14px 16px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.text { display: grid; gap: 2px; min-width: 0; }
</style>
