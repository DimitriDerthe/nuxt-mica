<script lang="ts">
export const playground = {
  props: {
    orientation: 'vertical',
    steps: [
      { label: 'Cart', description: '3 items, $214.00' },
      { label: 'Shipping', description: 'Address and delivery speed' },
      { label: 'Payment', description: 'Card or bank transfer' },
      { label: 'Review', description: 'Confirm and pay' }
    ]
  },
  controls: ['orientation', 'clickable'],
  height: 380
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const step = ref(1)
const count = computed(() => ((props.p.steps ?? []) as unknown[]).length)
</script>

<template>
  <div class="card mi:rounded-[20px] mi:shadow-1 mi:box-border" :class="{ wide: p.orientation === 'horizontal' }">
    <MiSteps v-model="step" v-bind="p" aria-label="Checkout" />
    <div class="actions mi:flex mi:[justify-content:flex-end] mi:gap-2 mi:pt-3.5 mi:border-t mi:border-t-sep">
      <MiButton variant="gray" :disabled="step === 0" @click="step--">Back</MiButton>
      <MiButton :disabled="step >= count - 1" @click="step++">{{ step >= count - 2 ? 'Review order' : 'Continue' }}</MiButton>
    </div>
  </div>
</template>

<style scoped>
.card { width: min(100%, 340px); padding: 20px; background: var(--mi-card); display: grid; gap: 18px; }
.card.wide { width: min(100%, 640px); }
</style>
