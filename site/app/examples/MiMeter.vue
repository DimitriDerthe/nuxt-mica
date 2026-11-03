<script lang="ts">
export const playground = {
  props: { value: 164, max: 200, label: 'Storage', caption: '164 GB of 200 GB used', hint: '36 GB free' },
  controls: ['value', 'max', 'size', 'label', 'caption', 'hint']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-box mi:justify-items-start mi:box-border">
    <MiMeter v-bind="p" />
    <MiButton size="small" variant="tinted">Upgrade to 1 TB</MiButton>
  </div>
</template>

<style scoped>
.ex-box { display: grid; gap: 16px; width: min(100%, 380px); padding: 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ex-box > :first-child { justify-self: stretch; }
</style>
