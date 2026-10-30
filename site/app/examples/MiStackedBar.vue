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
  <section class="ex-box" aria-labelledby="ex-sb-h">
    <div class="ex-head">
      <h3 id="ex-sb-h" class="ex-h">Storage by type</h3>
      <span class="ex-total">865 GB of 1 TB</span>
    </div>
    <MiStackedBar v-bind="p" v-model:active="active" aria-label="Storage by file type" />
  </section>
</template>

<style scoped>
.ex-box { align-self: center; width: 100%; max-width: 560px; margin: 0 auto; padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.ex-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.ex-h { margin: 0; font-size: 17px; font-weight: 600; color: var(--mi-label); }
.ex-total { font-size: 13px; color: var(--mi-label2); white-space: nowrap; }
</style>
