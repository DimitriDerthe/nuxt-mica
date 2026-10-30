<script setup lang="ts">
/** @internal Renders one icon from the shared Mi navigation icon set; the building block of the other Mi navigation components. */
import { computed } from 'vue'
import { miNavIcons, type MiNavIconName } from '../../utils/miNav'

const props = withDefaults(defineProps<{
  /** Icon to draw, from the shared navigation icon set. */
  name: MiNavIconName
  /** Icon width and height in px. */
  size?: number
  /** Stroke width in 24-unit viewBox units, not px: it scales with size. */
  stroke?: number
}>(), { size: 18, stroke: 1.9 })
const markup = computed(() => miNavIcons[props.name] ?? '')
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"
    v-html="markup"
  />
</template>
