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
  <div class="card">
    <h3>Check your email</h3>
    <p class="lead">Enter the code we sent to <strong>alex@northwind.io</strong>.</p>
    <MiCodeInput v-model="code" v-bind="p" @complete="onComplete" @update:model-value="status = ''" />
    <p class="foot">
      <span v-if="status" class="status" role="status">{{ status }}</span>
      <template v-else>Didn't get it? <MiButton variant="plain" size="small">Resend code</MiButton></template>
    </p>
  </div>
</template>

<style scoped>
.card { width: min(100%, 360px); padding: 24px 16px; box-sizing: border-box; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; justify-items: center; gap: 14px; text-align: center; }
h3 { margin: 0; font-size: 20px; font-weight: 700; color: var(--mi-label); }
.lead { margin: -6px 0 4px; font-size: 14px; color: var(--mi-label2); }
.lead strong { color: var(--mi-label); font-weight: 600; }
.foot { margin: 0; min-height: 32px; display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--mi-label2); }
.status { color: var(--mi-label2); }
</style>
