<script lang="ts">
export const playground = {
  props: {
    label: 'Product updates',
    description: 'One email a month about new features. Unsubscribe anytime.'
  },
  controls: ['label', 'description', 'indeterminate', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const updates = ref(true)
const digest = ref(false)
// Mirror the component clearing its mixed state back into the control.
function onMixed(v: boolean) { props.p.indeterminate = v }
</script>

<template>
  <div class="card mi:box-border">
    <MiText variant="footnote" weight="semibold" tone="label2" as="h3">EMAIL</MiText>
    <MiCheckbox v-model="updates" v-bind="p" @update:indeterminate="onMixed" />
    <MiCheckbox v-model="digest" label="Weekly digest" description="A summary of activity in your workspaces, every Monday." />
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 360px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>
