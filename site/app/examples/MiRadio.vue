<script lang="ts">
export const playground = {
  props: {
    value: 'standard',
    label: 'Standard shipping',
    description: '3 to 5 business days · Free'
  },
  controls: ['label', 'description', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const shipping = ref<string | number | boolean | null>('standard')
</script>

<template>
  <div class="card" role="radiogroup" aria-labelledby="ex-radio-title">
    <MiText id="ex-radio-title" variant="headline" as="h3">Delivery</MiText>
    <MiRadio v-model="shipping" v-bind="p" />
    <MiRadio v-model="shipping" value="express" label="Express shipping" description="Next business day · $9.90" />
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 340px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
