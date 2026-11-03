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
  <section class="ex mi:justify-items-start mi:shadow-1">
    <h3 class="head mi:m-0 mi:text-[17px] mi:font-semibold mi:text-label">Billing</h3>
    <MiAlert v-model="visible" v-bind="p" />
    <MiButton v-if="!visible" variant="gray" size="small" @click="visible = true">Show the alert again</MiButton>
    <div class="row mi:flex mi:justify-between mi:gap-3 mi:pt-2.5 mi:border-t mi:border-t-sep mi:text-[14px] mi:text-label2"><span>Plan</span><strong class="mi:[.row_&]:text-label mi:[.row_&]:font-medium">Pro · $12 / month</strong></div>
    <div class="row mi:flex mi:justify-between mi:gap-3 mi:pt-2.5 mi:border-t mi:border-t-sep mi:text-[14px] mi:text-label2"><span>Next invoice</span><strong class="mi:[.row_&]:text-label mi:[.row_&]:font-medium">Dec 1, 2026</strong></div>
  </section>
</template>

<style scoped>
.ex { display: grid; gap: 12px; width: min(100%, 440px); padding: 18px; border-radius: 20px; background: var(--mi-card); }
.ex > :deep(*) { justify-self: stretch; }
.ex > :deep(.mi-btn), .ex > button { justify-self: start; }
</style>
