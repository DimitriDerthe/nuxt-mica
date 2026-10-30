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
  <div class="board">
    <div class="main" :class="{ solid: p.tone === 'on-primary' }">
      <MiLogo v-bind="p" />
    </div>
    <div class="aside">
      <div class="app" aria-hidden="true"><MiLogo variant="short" tone="on-primary" dot="inherit" :size="26" decorative /></div>
      <MiText variant="caption" tone="label2">App icon</MiText>
    </div>
  </div>
</template>

<style scoped>
.board { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: center; }
.main { display: grid; place-items: center; width: 260px; max-width: 100%; height: 150px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.main.solid { background: var(--mi-p); }
.aside { display: grid; justify-items: center; gap: 8px; }
.app { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 15px; background: var(--mi-p); box-shadow: var(--mi-sh2); }
</style>
