<script lang="ts">
export const playground = {
  props: { variant: 'text', lines: 2 },
  controls: ['variant', 'height', 'radius', 'animated']
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
// `height` and `radius` are `string | number`: the explorer edits them as text, so treat "24" as 24px.
const px = (v: unknown) => (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : v)
const line = computed(() => ({ ...props.p, height: px(props.p.height), radius: px(props.p.radius) }))
</script>

<template>
  <section class="ex" aria-busy="true" aria-label="Loading messages">
    <div v-for="n in 3" :key="n" class="row">
      <MiSkeleton variant="circle" :width="40" :height="40" :animated="p.animated" />
      <div class="txt"><MiSkeleton v-bind="line" /></div>
      <MiSkeleton :width="34" :height="10" :radius="5" :animated="p.animated" />
    </div>
  </section>
</template>

<style scoped>
.ex { width: min(100%, 360px); padding: 4px 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--mi-sep); }
.row:last-child { border-bottom: 0; }
.txt { flex: 1; min-width: 0; }
</style>
