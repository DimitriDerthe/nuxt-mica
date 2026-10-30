<script lang="ts">
export const playground = {
  props: {
    placeholder: 'Choose a plan',
    options: [
      { value: 'starter', label: 'Starter', description: 'Up to 3 seats, community support' },
      { value: 'team', label: 'Team', description: '$12 per seat / month, shared workspaces' },
      { value: 'business', label: 'Business', description: '$24 per seat / month, SSO and audit log' },
      { value: 'enterprise', label: 'Enterprise', description: 'Contact sales', disabled: true }
    ]
  },
  controls: ['size', 'placeholder', 'invalid', 'success', 'disabled'],
  layout: 'start',
  height: 440
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const plan = ref<string | number | null>('team')
</script>

<template>
  <div class="card">
    <MiField label="Plan" hint="You can switch plans at any time.">
      <MiSelect v-model="plan" v-bind="p" name="plan" />
    </MiField>
  </div>
</template>

<style scoped>
.card { width: min(100%, 340px); margin-inline: auto; padding: 18px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>
