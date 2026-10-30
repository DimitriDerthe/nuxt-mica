<script lang="ts">
export const playground = {
  controls: ['color', 'labels', 'height'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
import { onMounted, watchEffect } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const { primary, secondary } = useMiTheme()

// After hydration, seed the required `color` with the live brand color so the control and snippet show it.
onMounted(() => watchEffect(() => {
  if (!props.p.color) props.p.color = primary.value
}))
</script>

<template>
  <div class="scale">
    <div class="row">
      <div class="meta">
        <MiText variant="subheadline" weight="semibold">Primary</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ p.color || primary }}</MiText>
      </div>
      <MiColorRamp v-bind="p" :color="p.color || primary" label="Primary color ramp" />
    </div>
    <div class="row">
      <div class="meta">
        <MiText variant="subheadline" weight="semibold">Secondary</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ secondary }}</MiText>
      </div>
      <MiColorRamp :color="secondary" :labels="p.labels" :height="p.height" label="Secondary color ramp" />
    </div>
  </div>
</template>

<style scoped>
.scale { display: grid; gap: 20px; width: 100%; max-width: 720px; margin: auto; }
.row { display: grid; gap: 8px; }
.meta { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
</style>
