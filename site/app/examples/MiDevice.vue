<script lang="ts">
export const playground = {
  props: { device: 'phone', orientation: 'portrait', url: 'https://mica.dev/dashboard', label: 'Preview' },
  controls: ['device', 'orientation', 'url', 'tone', 'maxWidth'],
  layout: 'fill',
  height: 520
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiDevice v-bind="p">
    <div class="screen">
      <MiText variant="title3" weight="semibold">Good evening</MiText>
      <MiText variant="footnote" tone="label2">Everything is on track.</MiText>
      <div class="bar" />
      <div class="bar b2" />
    </div>
  </MiDevice>
</template>

<style scoped>
.screen { height: 100%; display: grid; align-content: center; gap: 8px; padding: 10%; box-sizing: border-box; background: linear-gradient(160deg, var(--mi-p-tint), var(--mi-card)); }
.bar { height: 12px; border-radius: 6px; background: var(--mi-p); opacity: .8; }
.b2 { width: 60%; background: var(--mi-s); }
</style>
