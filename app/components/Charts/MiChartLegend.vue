<script setup lang="ts">
/** Legend for chart series in inline, list, stat or ramp variants. Items are { label, color, value?, sub?, shape? }[]. */
import { miSafeColor } from '../../utils/miSafe'
export interface MiLegendItem {
  label: string
  color: string
  /** Right aligned value (`list` and `stat` variants). */
  value?: string
  /** Secondary line under the label (`stat` variant). */
  sub?: string
  /** Swatch shape for the `inline` variant. */
  shape?: 'line' | 'square' | 'dot'
}

withDefaults(defineProps<{
  /** Entries as { label, color, value?, sub?, shape? }[]. */
  items: MiLegendItem[]
  /** inline: swatches in a row. list: ruled rows in columns. stat: dot, label, sub and big value. ramp: Less to More scale. */
  variant?: 'inline' | 'list' | 'stat' | 'ramp'
  /** Column count for the list and stat variants. */
  columns?: number
  /** Caption at the low end of the `ramp` variant. */
  lessLabel?: string
  /** Caption at the high end of the `ramp` variant. */
  moreLabel?: string
  /** Accessible name of the legend. */
  ariaLabel?: string
}>(), { variant: 'inline', columns: 2, lessLabel: 'Less', moreLabel: 'More' })

/** Index of the highlighted item (hover). -1 for none. */
const active = defineModel<number>('active', { default: -1 })

function enter(i: number) { active.value = i }
function leave() { active.value = -1 }
</script>

<template>
  <div v-if="variant === 'ramp'" class="mi-lg-ramp" role="img" :aria-label="ariaLabel ?? `${lessLabel} to ${moreLabel}`">
    {{ lessLabel }}
    <span v-for="(it, i) in items" :key="i" class="mi-lg-step" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />
    {{ moreLabel }}
  </div>
  <ul v-else-if="variant === 'inline'" class="mi-lg-inline" :aria-label="ariaLabel ?? 'Legend'">
    <li v-for="(it, i) in items" :key="i">
      <span class="mi-lg-sw" :class="`mi-lg-sw--${it.shape ?? 'line'}`" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />{{ it.label }}
    </li>
  </ul>
  <ul v-else-if="variant === 'list'" class="mi-lg-list" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }" :aria-label="ariaLabel ?? 'Legend'" @pointerleave="leave">
    <li v-for="(it, i) in items" :key="i" class="mi-lg-row" :class="{ 'is-on': active === i }" @pointerenter="enter(i)">
      <span class="mi-lg-sw mi-lg-sw--square" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />
      <span class="mi-lg-name">{{ it.label }}</span>
      <span v-if="it.value" class="mi-lg-val">{{ it.value }}</span>
    </li>
  </ul>
  <ul v-else class="mi-lg-stat" :aria-label="ariaLabel ?? 'Legend'" @pointerleave="leave">
    <li v-for="(it, i) in items" :key="i" class="mi-lg-srow" :class="{ 'is-on': active === i }" @pointerenter="enter(i)">
      <span class="mi-lg-sw mi-lg-sw--dot" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />
      <span class="mi-lg-txt"><span class="mi-lg-name">{{ it.label }}</span><span v-if="it.sub" class="mi-lg-subline">{{ it.sub }}</span></span>
      <span v-if="it.value" class="mi-lg-big">{{ it.value }}</span>
    </li>
  </ul>
</template>

<style scoped>
ul{list-style:none;margin:0;padding:0}
.mi-lg-inline,.mi-lg-list,.mi-lg-stat,.mi-lg-ramp{font-family:var(--mi-font)}
.mi-lg-inline{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:var(--mi-label2)}
.mi-lg-inline li{display:inline-flex;align-items:center;gap:6px}
.mi-lg-sw{flex:none;display:inline-block}
.mi-lg-sw--line{width:14px;height:3px;border-radius:2px}
.mi-lg-sw--square{width:10px;height:10px;border-radius:3px}
.mi-lg-sw--dot{width:10px;height:10px;border-radius:50%}
.mi-lg-list{display:grid;gap:0 24px}
.mi-lg-row{display:flex;align-items:center;gap:10px;min-height:40px;border-top:.5px solid var(--mi-sep);font-size:14px;color:var(--mi-label)}
.mi-lg-name{flex:1;min-width:0;font-weight:400}
.mi-lg-row.is-on .mi-lg-name{font-weight:600}
.mi-lg-val{flex:none;font-weight:600;font-variant-numeric:tabular-nums}
.mi-lg-row .mi-lg-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mi-lg-stat{display:flex;flex-direction:column;gap:14px;flex:1;min-width:160px}
.mi-lg-srow{display:flex;align-items:center;gap:10px;color:var(--mi-label)}
.mi-lg-txt{flex:1;display:flex;flex-direction:column;min-width:0}
.mi-lg-stat .mi-lg-name{flex:none;font-size:14px;font-weight:600}
.mi-lg-subline{font-size:12px;color:var(--mi-label2)}
.mi-lg-big{font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.mi-lg-ramp{display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:12px;color:var(--mi-label2)}
.mi-lg-step{width:12px;height:12px;border-radius:3px}
</style>
