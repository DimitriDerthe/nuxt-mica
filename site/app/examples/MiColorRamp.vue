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
  <div class="scale mi:grid mi:gap-5 mi:w-full mi:max-w-180 mi:m-auto">
    <div class="row mi:grid mi:gap-2">
      <div class="meta mi:flex mi:items-baseline mi:justify-between mi:gap-3">
        <MiText variant="subheadline" weight="semibold">Primary</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ p.color || primary }}</MiText>
      </div>
      <MiColorRamp v-bind="p" :color="p.color || primary" label="Primary color ramp" />
    </div>
    <div class="row mi:grid mi:gap-2">
      <div class="meta mi:flex mi:items-baseline mi:justify-between mi:gap-3">
        <MiText variant="subheadline" weight="semibold">Secondary</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ secondary }}</MiText>
      </div>
      <MiColorRamp :color="secondary" :labels="p.labels" :height="p.height" label="Secondary color ramp" />
    </div>
  </div>
</template>
