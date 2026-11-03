<script lang="ts">
export const playground = {
  props: { label: 'Accent color' },
  controls: ['target', 'label'],
  height: 320
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="card">
    <div class="head mi:grid mi:gap-0.5">
      <MiText variant="headline" as="h3">Brand</MiText>
      <MiText variant="footnote" tone="label2">Changes apply to the whole site instantly.</MiText>
    </div>
    <MiColorPicker v-bind="p" />
    <div class="preview mi:flex mi:flex-wrap mi:gap-2 mi:pt-3.5 mi:border-t mi:border-t-sep">
      <MiButton size="small" :brand="p.target === 'secondary' ? 'secondary' : 'primary'">Save changes</MiButton>
      <MiButton size="small" variant="tinted" :brand="p.target === 'secondary' ? 'secondary' : 'primary'">Preview</MiButton>
    </div>
  </div>
</template>

<style scoped>
.card { display: grid; gap: 16px; width: min(100%, 340px); padding: 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
