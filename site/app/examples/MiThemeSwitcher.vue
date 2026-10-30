<script lang="ts">
export const playground = {
  controls: ['iconOnly', 'label']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="row">
    <div class="text">
      <MiText variant="body" weight="medium">Appearance</MiText>
      <MiText variant="footnote" tone="label2">Match your system or pick a mode.</MiText>
    </div>
    <MiThemeSwitcher v-bind="p" />
  </div>
</template>

<style scoped>
.row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; width: min(100%, 600px); padding: 14px 16px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.text { display: grid; gap: 2px; min-width: 0; }
</style>
