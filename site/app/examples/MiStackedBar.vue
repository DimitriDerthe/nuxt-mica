<script lang="ts">
export const playground = {
  props: {
    segments: [
      { label: 'Video', value: 412 },
      { label: 'Photos', value: 268 },
      { label: 'Docs', value: 96 },
      { label: 'Backups', value: 58 },
      { label: 'Other', value: 31 }
    ]
  },
  controls: ['height', 'legend', 'legendColumns', 'animate'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const active = ref(-1)
</script>

<template>
  <section class="ex-box mi:self-center mi:max-w-140 mi:shadow-1 mi:box-border" aria-labelledby="ex-sb-h">
    <div class="ex-head mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:mb-3.5">
      <h3 id="ex-sb-h" class="ex-h mi:m-0 mi:text-[17px] mi:font-semibold mi:text-label">Storage by type</h3>
      <span class="ex-total mi:text-[13px] mi:text-label2 mi:whitespace-nowrap">865 GB of 1 TB</span>
    </div>
    <MiStackedBar v-bind="p" v-model:active="active" aria-label="Storage by file type" />
  </section>
</template>

<style scoped>
.ex-box { width: 100%; margin: 0 auto; padding: 16px 18px; border-radius: 18px; background: var(--mi-card); }
</style>
