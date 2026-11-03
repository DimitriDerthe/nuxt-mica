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
  <section class="ex mi:py-1 mi:px-4 mi:shadow-1" aria-busy="true" aria-label="Loading messages">
    <div v-for="n in 3" :key="n" class="row mi:flex mi:items-center mi:gap-3.5 mi:py-3.5 mi:px-0 mi:border-b mi:border-b-sep mi:last:[border-bottom:0]">
      <MiSkeleton variant="circle" :width="40" :height="40" :animated="p.animated" />
      <div class="txt mi:flex-1 mi:min-w-0"><MiSkeleton v-bind="line" /></div>
      <MiSkeleton :width="34" :height="10" :radius="5" :animated="p.animated" />
    </div>
  </section>
</template>

<style scoped>
.ex { width: min(100%, 360px); border-radius: 18px; background: var(--mi-card); }
</style>
