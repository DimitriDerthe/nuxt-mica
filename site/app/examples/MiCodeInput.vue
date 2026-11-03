<script lang="ts">
export const playground = {
  props: { length: 6, mode: 'numeric' },
  controls: ['length', 'mode', 'mask', 'invalid', 'disabled'],
  height: 300
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const code = ref('')
const status = ref('')

function onComplete(value: string) {
  status.value = `Checking ${value.length}-character code...`
}
</script>

<template>
  <div class="card mi:box-border mi:shadow-1 mi:justify-items-center mi:text-center">
    <h3>Check your email</h3>
    <p class="lead mi:-mt-1.5 mi:mx-0 mi:mb-1 mi:text-[14px] mi:text-label2">Enter the code we sent to <strong class="mi:[.lead_&]:text-label mi:[.lead_&]:font-semibold">alex@northwind.io</strong>.</p>
    <MiCodeInput v-model="code" v-bind="p" @complete="onComplete" @update:model-value="status = ''" />
    <p class="foot mi:m-0 mi:min-h-8 mi:flex mi:items-center mi:gap-1 mi:text-[13px] mi:text-label2">
      <span v-if="status" class="status mi:text-label2" role="status">{{ status }}</span>
      <template v-else>Didn't get it? <MiButton variant="plain" size="small">Resend code</MiButton></template>
    </p>
  </div>
</template>

<style scoped>
.card { width: min(100%, 360px); padding: 24px 16px; border-radius: 20px; background: var(--mi-card); display: grid; gap: 14px; }
h3 { margin: 0; font-size: 20px; font-weight: 700; color: var(--mi-label); }
</style>
