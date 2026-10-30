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
  <ul class="mi-ramp" :aria-label="label" :style="{ height: `${height}px` }">
    <li v-for="s in stops" :key="s.label" class="mi-ramp__cell" :style="{ background: s.color, color: s.on }" :title="`${s.label} · ${s.color}`">
      <span v-if="labels" class="mi-ramp__label">{{ s.label }}</span>
      <span class="mi-ramp__sr">{{ s.label }} {{ s.color }}</span>
    </li>
  </ul>
</template>

<style scoped>
.mi-ramp{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));margin:0;padding:0;list-style:none;font-family:var(--mi-font);overflow:hidden}
.mi-ramp__cell{position:relative;display:flex;align-items:center;justify-content:center;min-width:0;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.mi-ramp__sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
</style>
