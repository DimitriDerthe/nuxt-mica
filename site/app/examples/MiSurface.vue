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
  <div class="backdrop mi:place-items-center mi:p-2 mi:before:content-[''] mi:before:inset-y-[18%] mi:before:inset-x-[8%] mi:before:rounded-[50%] mi:before:[background:linear-gradient(120deg,_var(--mi-p),_var(--mi-s))] mi:before:opacity-55 mi:before:[filter:blur(28px)]">
    <MiSurface v-bind="p" class="plan" as="section">
      <MiText variant="footnote" weight="semibold" tone="primary">PRO</MiText>
      <MiText variant="title2" as="h3">$12 <MiText as="span" variant="subheadline" tone="label2">/ month</MiText></MiText>
      <MiText variant="subheadline" tone="label2">Unlimited projects, version history and priority support for your whole team.</MiText>
      <MiButton block>Upgrade</MiButton>
    </MiSurface>
  </div>
</template>

<style scoped>
.backdrop { position: relative; display: grid; width: min(100%, 360px); }
.backdrop::before { position: absolute; }
.plan { position: relative; display: grid; gap: 8px; width: 100%; max-width: 300px; box-sizing: border-box; }
</style>
