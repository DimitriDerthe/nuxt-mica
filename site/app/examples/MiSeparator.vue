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
  <div class="ex mi:gap-3 mi:text-[15px] mi:[&.row]:items-stretch mi:[&.row]:gap-4" :class="{ row: p.orientation === 'vertical' }">
    <div><strong>Mica</strong><span>A UI layer for Nuxt</span></div>
    <MiSeparator v-bind="p" />
    <nav class="links mi:flex mi:gap-3.5 mi:[.row_&]:items-center"><a href="#docs" @click.prevent>Docs</a><a href="#blog" @click.prevent>Blog</a><a href="#source" @click.prevent>Source</a></nav>
  </div>
</template>

<style scoped>
.ex { display: grid; width: min(100%, 300px); }
.ex.row { display: flex; height: 64px; width: auto; }
div { display: grid; }
span { color: var(--mi-label2); }
a { color: var(--mi-p); text-decoration: none; }
</style>
