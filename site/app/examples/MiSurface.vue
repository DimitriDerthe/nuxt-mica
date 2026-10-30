<script lang="ts">
export const playground = {
  props: { padding: 'lg' },
  controls: ['variant', 'material', 'radius', 'padding', 'elevation'],
  slot: '…',
  height: 320
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="backdrop">
    <MiSurface v-bind="p" class="plan" as="section">
      <MiText variant="footnote" weight="semibold" tone="primary">PRO</MiText>
      <MiText variant="title2" as="h3">$12 <MiText as="span" variant="subheadline" tone="label2">/ month</MiText></MiText>
      <MiText variant="subheadline" tone="label2">Unlimited projects, version history and priority support for your whole team.</MiText>
      <MiButton block>Upgrade</MiButton>
    </MiSurface>
  </div>
</template>

<style scoped>
.backdrop { position: relative; display: grid; place-items: center; width: min(100%, 360px); padding: 8px; }
.backdrop::before { content: ''; position: absolute; inset: 18% 8%; border-radius: 50%; background: linear-gradient(120deg, var(--mi-p), var(--mi-s)); opacity: 0.55; filter: blur(28px); }
.plan { position: relative; display: grid; gap: 8px; width: 100%; max-width: 300px; box-sizing: border-box; }
</style>
