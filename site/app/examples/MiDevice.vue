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
    <div class="screen mi:h-full mi:grid mi:content-center mi:gap-2 mi:p-[10%] mi:box-border mi:[background:linear-gradient(160deg,_var(--mi-p-tint),_var(--mi-card))]">
      <MiText variant="title3" weight="semibold">Good evening</MiText>
      <MiText variant="footnote" tone="label2">Everything is on track.</MiText>
      <div class="bar mi:h-3 mi:rounded-[6px] mi:[background:var(--mi-p)] mi:opacity-80" />
      <div class="bar b2 mi:h-3 mi:rounded-[6px] mi:[background:var(--mi-p)] mi:opacity-80 mi:w-[60%] mi:[background:var(--mi-s)]" />
    </div>
  </MiDevice>
</template>
