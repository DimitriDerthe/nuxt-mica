<script lang="ts">
export const playground = {
  props: { label: 'Work email', hint: 'We send the workspace invite here.' },
  controls: ['label', 'hint', 'error', 'success', 'required', 'disabled'],
  slot: '<MiInput v-model="email" type="email" />'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const email = ref('alex@northwind.io')
const password = ref('')
</script>

<template>
  <form class="card" @submit.prevent>
    <h3>Create your account</h3>
    <MiField v-bind="p">
      <MiInput v-model="email" type="email" autocomplete="email" />
    </MiField>
    <MiField label="Password" hint="At least 12 characters.">
      <MiInput v-model="password" type="password" autocomplete="new-password" />
    </MiField>
    <MiButton block type="submit">Continue</MiButton>
  </form>
</template>

<style scoped>
.card { width: min(100%, 340px); padding: 20px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 16px; }
h3 { margin: 0; font-size: 20px; font-weight: 700; color: var(--mi-label); }
</style>
