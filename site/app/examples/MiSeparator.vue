<script lang="ts">
export const playground = {
  props: { orientation: 'horizontal' },
  controls: ['orientation', 'decorative'],
  layout: 'start'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex" :class="{ row: p.orientation === 'vertical' }">
    <div><strong>Mica</strong><span>A UI layer for Nuxt</span></div>
    <MiSeparator v-bind="p" />
    <nav class="links"><a href="#docs" @click.prevent>Docs</a><a href="#blog" @click.prevent>Blog</a><a href="#source" @click.prevent>Source</a></nav>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 12px; width: min(100%, 300px); font-size: 15px; }
.ex.row { display: flex; align-items: stretch; gap: 16px; height: 64px; width: auto; }
div { display: grid; }
span { color: var(--mi-label2); }
.links { display: flex; gap: 14px; }
.row .links { align-items: center; }
a { color: var(--mi-p); text-decoration: none; }
</style>
