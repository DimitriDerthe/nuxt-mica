<script lang="ts">
export const playground = {
  props: { maxHeight: '220px' },
  controls: ['orientation', 'maxHeight'],
  layout: 'center',
  height: 300
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const tags = ['v2.4.0', 'v2.3.2', 'v2.3.1', 'v2.3.0', 'v2.2.5', 'v2.2.4', 'v2.2.0', 'v2.1.3', 'v2.1.0', 'v2.0.1', 'v2.0.0', 'v1.9.8']
</script>

<template>
  <div class="ex-box mi:w-[min(100%,_280px)] mi:py-3 mi:px-4 mi:rounded-[16px] mi:bg-card mi:shadow-1 mi:box-border">
    <h4>Releases</h4>
    <MiScrollArea v-bind="p">
      <div v-for="t in tags" :key="t" class="ex-row mi:py-2 mi:px-0 mi:text-[15px] mi:text-label mi:whitespace-nowrap">{{ t }}</div>
    </MiScrollArea>
  </div>
</template>

<style scoped>
h4 { margin: 0 0 8px; font-size: 15px; color: var(--mi-label); }
.ex-row { border-bottom: 1px solid var(--mi-separator, currentColor); border-bottom-color: color-mix(in srgb, var(--mi-label2) 20%, transparent); }
</style>
