<script lang="ts">
export const playground = {
  props: { for: 'ex-email' },
  controls: ['required', 'disabled'],
  slot: 'Email address'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex mi:grid mi:gap-2 mi:w-[min(100%,_300px)]">
    <MiLabel v-bind="p">Email address</MiLabel>
    <MiInput id="ex-email" type="email" placeholder="you@company.com" :disabled="Boolean(p.disabled)" />
  </div>
</template>
