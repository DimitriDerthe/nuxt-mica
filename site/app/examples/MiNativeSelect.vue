<script lang="ts">
export const playground = {
  props: {
    placeholder: 'Choose a country',
    options: [
      { value: 'fr', label: 'France', group: 'Europe' },
      { value: 'de', label: 'Germany', group: 'Europe' },
      { value: 'es', label: 'Spain', group: 'Europe' },
      { value: 'us', label: 'United States', group: 'Americas' },
      { value: 'ca', label: 'Canada', group: 'Americas' },
      { value: 'jp', label: 'Japan', group: 'Asia', disabled: true }
    ]
  },
  controls: ['size', 'invalid', 'disabled', 'placeholder']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const value = ref<string | number | null>(null)
</script>

<template>
  <div class="wrap">
    <MiNativeSelect v-model="value" v-bind="p" aria-label="Country" />
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 300px); }
</style>
