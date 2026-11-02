<script lang="ts">
export const playground = {
  props: { text: 'Reading 4 files in billing/…' },
  controls: ['text', 'duration', 'paused']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex">
    <MiOrb state="working" size="sm" label="" :paused="!!p.paused" />
    <MiShimmerText v-bind="p" />
  </div>
</template>

<style scoped>
.ex { display: flex; align-items: center; gap: 10px; max-width: 100%; padding: 12px 16px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 15px; }
</style>
