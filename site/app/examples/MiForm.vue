<script lang="ts">
export const playground = {
  props: {
    title: 'Billing details',
    description: 'Shown on every invoice. Changes apply from the next billing cycle.',
    maxWidth: '640px'
  },
  controls: ['title', 'description', 'maxWidth'],
  layout: 'fill',
  height: 560
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()

const name = ref('Alex Morgan')
const company = ref('Northwind Labs')
const country = ref<string | number | null>('fr')
const vat = ref('FR40303265045')
const saved = ref(false)

const countries = [
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' }
]
</script>

<template>
  <MiForm v-bind="p" @submit="saved = true">
    <MiFormRow label="Full name" required>
      <MiInput v-model="name" autocomplete="name" />
    </MiFormRow>
    <MiFormRow label="Company">
      <MiInput v-model="company" autocomplete="organization" />
    </MiFormRow>
    <MiFormRow label="Country" required>
      <MiSelect v-model="country" :options="countries" name="country" />
    </MiFormRow>
    <MiFormRow label="VAT number" hint="Required for reverse charge in the EU.">
      <MiInput v-model="vat" />
    </MiFormRow>
    <template #actions>
      <span v-if="saved" class="saved" role="status">Saved</span>
      <MiButton variant="gray" @click="saved = false">Cancel</MiButton>
      <MiButton type="submit">Save details</MiButton>
    </template>
  </MiForm>
</template>

<style scoped>
.saved { align-self: center; margin-right: auto; font-size: 14px; color: var(--mi-green-t); }
</style>
