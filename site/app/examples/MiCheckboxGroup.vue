<script lang="ts">
export const playground = {
  props: {
    label: 'Notification channels',
    parentLabel: 'All channels',
    options: [
      { value: 'email', label: 'Email', description: 'Sent to dimitri@mica.dev' },
      { value: 'push', label: 'Push notifications', description: 'On your phone and desktop' },
      { value: 'sms', label: 'Text messages', description: 'Only for security alerts' },
      { value: 'slack', label: 'Slack', description: 'Connect a workspace first', disabled: true }
    ]
  },
  controls: ['parentLabel', 'disabled'],
  height: 340
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const channels = ref<(string | number)[]>(['email', 'push'])
</script>

<template>
  <div class="card mi:shadow-1 mi:box-border">
    <MiText variant="headline" as="h3">Notify me about mentions</MiText>
    <MiCheckboxGroup v-model="channels" v-bind="p" />
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 360px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); }
</style>
