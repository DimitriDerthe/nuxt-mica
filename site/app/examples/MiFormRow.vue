<script lang="ts">
export const playground = {
  props: { label: 'Display name', hint: 'Visible to everyone in your workspace.' },
  controls: ['label', 'hint', 'error', 'required', 'top'],
  slot: '<MiInput v-model="name" />',
  layout: 'fill',
  height: 420
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()

const name = ref('Alex Morgan')
const bio = ref('Product designer at Northwind. Usually shipping something small.')
const zone = ref<string | number | null>('europe-paris')
const zones = [
  { value: 'america-new-york', label: 'New York (UTC-5)' },
  { value: 'europe-london', label: 'London (UTC+0)' },
  { value: 'europe-paris', label: 'Paris (UTC+1)' },
  { value: 'asia-tokyo', label: 'Tokyo (UTC+9)' }
]
</script>

<template>
  <!-- MiFormRow lays its label and control out on MiForm's two-column grid. -->
  <MiForm title="Profile" class="profile mi:self-center">
    <MiFormRow v-bind="p">
      <MiInput v-model="name" autocomplete="name" />
    </MiFormRow>
    <MiFormRow label="Bio" top>
      <MiTextarea v-model="bio" :rows="2" />
    </MiFormRow>
    <MiFormRow label="Time zone">
      <MiSelect v-model="zone" :options="zones" />
    </MiFormRow>
  </MiForm>
</template>
