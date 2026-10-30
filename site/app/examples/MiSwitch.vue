<script lang="ts">
export const playground = {
  controls: ['size', 'tone', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const on = ref(true)
</script>

<template>
  <div class="row">
    <span id="ex-switch">Wi-Fi assist</span>
    <MiSwitch v-model="on" v-bind="p" aria-labelledby="ex-switch" />
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; justify-content: space-between; gap: 24px; width: min(100%, 320px); padding: 12px 16px; border-radius: 14px; background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 17px; }
</style>
