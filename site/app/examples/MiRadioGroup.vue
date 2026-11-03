<script lang="ts">
export const playground = {
  props: {
    label: 'Billing cycle',
    options: [
      { value: 'monthly', label: 'Monthly', description: '$12 per month' },
      { value: 'yearly', label: 'Yearly', description: '$120 per year, save 17%' },
      { value: 'lifetime', label: 'Lifetime', description: 'Coming soon', disabled: true }
    ]
  },
  controls: ['orientation', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const cycle = ref<string | number | boolean | null>('yearly')
</script>

<template>
  <div class="card mi:shadow-1 mi:box-border">
    <MiText variant="headline" as="h3">Billing cycle</MiText>
    <MiRadioGroup v-model="cycle" v-bind="p" />
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 520px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); }
</style>
