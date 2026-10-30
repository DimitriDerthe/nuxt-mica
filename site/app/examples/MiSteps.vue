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
  <div class="card" :class="{ wide: p.orientation === 'horizontal' }">
    <MiSteps v-model="step" v-bind="p" aria-label="Checkout" />
    <div class="actions">
      <MiButton variant="gray" :disabled="step === 0" @click="step--">Back</MiButton>
      <MiButton :disabled="step >= count - 1" @click="step++">{{ step >= count - 2 ? 'Review order' : 'Continue' }}</MiButton>
    </div>
  </div>
</template>

<style scoped>
.card { width: min(100%, 340px); padding: 20px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 18px; box-sizing: border-box; }
.card.wide { width: min(100%, 640px); }
.actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
</style>
