<script setup lang="ts">
/** Nine-step tonal ramp (50-800) generated from one base color; use it to preview or document a brand color scale. */
import { computed } from 'vue'
import { miHex } from '../../utils/color'
import { miRamp } from '../../utils/miRamp'

const props = withDefaults(defineProps<{
  /** Base color (becomes step 500). Falls back to the default primary when invalid. */
  color: string
  /** Show the step labels (50-800) inside the cells. */
  labels?: boolean
  /** Row height in px. */
  height?: number
  /** Accessible name of the ramp. */
  label?: string
}>(), { labels: true, height: 40, label: 'Color ramp' })

const stops = computed(() => miRamp(miHex(props.color, '#0071E3')))
</script>

<template>
  <ul class="mi-ramp mi:grid mi:grid-cols-9 mi:m-0 mi:p-0 mi:[list-style:none] mi:font-mi mi:overflow-hidden" :aria-label="label" :style="{ height: `${height}px` }">
    <li v-for="s in stops" :key="s.label" class="mi-ramp__cell mi:relative mi:flex mi:items-center mi:justify-center mi:min-w-0 mi:text-[11px] mi:font-semibold mi:tabular-nums" :style="{ background: s.color, color: s.on }" :title="`${s.label} · ${s.color}`">
      <span v-if="labels" class="mi-ramp__label">{{ s.label }}</span>
      <span class="mi-ramp__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ s.label }} {{ s.color }}</span>
    </li>
  </ul>
</template>
