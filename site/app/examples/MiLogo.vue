<script lang="ts">
export const playground = {
  props: { size: '44px' },
  controls: ['variant', 'size', 'tone', 'dot', 'pulse']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="board mi:flex-wrap mi:justify-center">
    <div class="main mi:grid mi:place-items-center mi:w-65 mi:max-w-full mi:h-37.5 mi:rounded-[20px] mi:bg-card mi:shadow-1 mi:[&.solid]:bg-p" :class="{ solid: p.tone === 'on-primary' }">
      <MiLogo v-bind="p" />
    </div>
    <div class="aside mi:grid mi:justify-items-center mi:gap-2">
      <div class="app mi:grid mi:place-items-center mi:w-16 mi:h-16 mi:rounded-[15px] mi:bg-p mi:shadow-2" aria-hidden="true"><MiLogo variant="short" tone="on-primary" dot="inherit" :size="26" decorative /></div>
      <MiText variant="caption" tone="label2">App icon</MiText>
    </div>
  </div>
</template>

<style scoped>
.board { display: flex; align-items: center; gap: 20px; }
</style>
