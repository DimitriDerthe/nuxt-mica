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
  <div class="card mi:grid mi:gap-3.5 mi:w-[min(100%,_340px)] mi:py-4 mi:px-4.5 mi:rounded-[18px] mi:bg-card mi:shadow-1 mi:box-border" role="radiogroup" aria-labelledby="ex-radio-title">
    <MiText id="ex-radio-title" variant="headline" as="h3">Delivery</MiText>
    <MiRadio v-model="shipping" v-bind="p" />
    <MiRadio v-model="shipping" value="express" label="Express shipping" description="Next business day · $9.90" />
  </div>
</template>
