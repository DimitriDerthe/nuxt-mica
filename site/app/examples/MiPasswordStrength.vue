<script lang="ts">
export const playground = {
  props: { requirements: ['length', 'upper', 'lower', 'number', 'symbol'], minLength: 8 },
  controls: ['minLength', 'label', 'emptyLabel']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const password = ref('Mica-2026')
</script>

<template>
  <div class="stack">
    <MiInput v-model="password" type="password" aria-label="Password" />
    <MiPasswordStrength :value="password" v-bind="p" />
  </div>
</template>

<style scoped>
.stack { display: grid; gap: 12px; width: min(100%, 340px); }
</style>
