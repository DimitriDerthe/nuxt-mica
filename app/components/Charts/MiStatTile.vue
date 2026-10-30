<script setup lang="ts">
/** KPI tile for dashboards: headline value, colored change with trend direction, and optional sparkline. */
import { computed } from 'vue'
import MiSparkline from './MiSparkline.vue'

const props = withDefaults(defineProps<{
  /** Name of the metric shown above the value. */
  label: string
  /** Formatted headline value as a string, e.g. "1,240" or "$3.2k". */
  value: string
  /** Formatted change, e.g. "12%" or "0.4 pt". */
  delta?: string
  /** Direction of the change. */
  trend?: 'up' | 'down'
  /** Whether the change is good (green), bad (red) or neutral. */
  tone?: 'good' | 'bad' | 'neutral'
  /** Text after the delta. */
  comparison?: string
  /** Series for the sparkline; hidden when empty. */
  spark?: number[]
  /** End dot color of the sparkline. */
  color?: string
}>(), { trend: 'up', tone: 'good', comparison: 'vs last month' })

const a11y = computed(() => props.delta
  ? `${props.trend === 'up' ? 'Up' : 'Down'} ${props.delta} ${props.comparison}`.trim()
  : '')

const _slots = defineSlots<{
  /** Extra content shown below the value, such as a note or link. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-st" role="group" :aria-label="`${label}: ${value}`">
    <span class="mi-st-label">{{ label }}</span>
    <span class="mi-st-value">{{ value }}</span>
    <slot />
    <span v-if="delta || spark?.length" class="mi-st-foot">
      <span v-if="delta" class="mi-st-delta" :class="`is-${tone}`">
        <svg class="mi-st-arrow" :class="{ 'is-down': trend === 'down' }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        <span aria-hidden="true">{{ delta }}</span>
        <span class="mi-st-cmp" aria-hidden="true">{{ comparison }}</span>
        <span class="mi-st-sr">{{ a11y }}</span>
      </span>
      <MiSparkline v-if="spark?.length" :values="spark" :color="color" />
    </span>
  </div>
</template>

<style scoped>
.mi-st{background:var(--mi-card);border-radius:18px;box-shadow:var(--mi-sh1);padding:18px;display:flex;flex-direction:column;gap:8px;min-width:0;font-family:var(--mi-font);color:var(--mi-label)}
.mi-st-label{font-size:13px;font-weight:600;color:var(--mi-label2)}
.mi-st-value{font-size:30px;line-height:34px;font-weight:600;letter-spacing:-.025em;font-variant-numeric:tabular-nums}
.mi-st-foot{display:flex;align-items:center;justify-content:space-between;gap:8px}
.mi-st-delta{display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px;min-width:0;font-size:13px;font-weight:600}
.mi-st-delta.is-good{color:var(--mi-green-t)}
.mi-st-delta.is-bad{color:var(--mi-red-t)}
.mi-st-delta.is-neutral{color:var(--mi-label2)}
.mi-st-arrow.is-down{transform:rotate(180deg)}
.mi-st-cmp{font-weight:400;color:var(--mi-label2)}
.mi-st-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
</style>
