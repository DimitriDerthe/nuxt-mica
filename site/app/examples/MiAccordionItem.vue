<script lang="ts">
export const playground = {
  props: { value: 'shipping', title: 'Shipping and delivery' },
  controls: ['title', 'disabled'],
  slot: 'Orders placed before 2 pm ship the same day.',
  height: 360
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref<string | null>('shipping')
</script>

<template>
  <MiAccordion v-model="open" class="ex-acc">
    <MiAccordionItem v-bind="p">
      Orders placed before 2 pm ship the same day. Standard delivery takes 2 to 4 business days; express arrives the next business day.
    </MiAccordionItem>
    <MiAccordionItem value="returns" title="Returns and exchanges">
      You have 30 days to return an unused item. Print a prepaid label from your order page and drop it at any partner point.
    </MiAccordionItem>
    <MiAccordionItem value="warranty" title="Warranty">
      Every product is covered for two years against manufacturing defects. Keep your order number for any claim.
    </MiAccordionItem>
  </MiAccordion>
</template>

<style scoped>
.ex-acc { width: min(100%, 520px); }
</style>
