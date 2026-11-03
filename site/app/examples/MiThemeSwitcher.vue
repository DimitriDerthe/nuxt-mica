<script lang="ts">
export const playground = {
  controls: ['iconOnly', 'label']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="row mi:flex-wrap mi:justify-between">
    <div class="text mi:grid mi:gap-0.5 mi:min-w-0">
      <MiText variant="body" weight="medium">Appearance</MiText>
      <MiText variant="footnote" tone="label2">Match your system or pick a mode.</MiText>
    </div>
    <MiThemeSwitcher v-bind="p" />
  </div>
</template>

<style scoped>
.row { display: flex; align-items: center; gap: 12px 24px; width: min(100%, 600px); padding: 14px 16px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
