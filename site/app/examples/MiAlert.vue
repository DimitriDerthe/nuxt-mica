<script lang="ts">
export const playground = {
  props: {
    tone: 'warning',
    title: 'Your card expires next month',
    message: 'Update the Visa ending in 4242 before Nov 30 to keep your Pro plan active.',
    actionLabel: 'Update card',
    dismissible: true
  },
  controls: ['tone', 'title', 'message', 'actionLabel', 'dismissible', 'icon']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const visible = ref(true)
</script>

<template>
  <section class="ex">
    <h3 class="head">Billing</h3>
    <MiAlert v-model="visible" v-bind="p" />
    <MiButton v-if="!visible" variant="gray" size="small" @click="visible = true">Show the alert again</MiButton>
    <div class="row"><span>Plan</span><strong>Pro · $12 / month</strong></div>
    <div class="row"><span>Next invoice</span><strong>Dec 1, 2026</strong></div>
  </section>
</template>

<style scoped>
.ex { display: grid; gap: 12px; justify-items: start; width: min(100%, 440px); padding: 18px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ex > :deep(*) { justify-self: stretch; }
.ex > :deep(.mi-btn), .ex > button { justify-self: start; }
.head { margin: 0; font-size: 17px; font-weight: 600; color: var(--mi-label); }
.row { display: flex; justify-content: space-between; gap: 12px; padding-top: 10px; border-top: 1px solid var(--mi-sep); font-size: 14px; color: var(--mi-label2); }
.row strong { color: var(--mi-label); font-weight: 500; }
</style>
