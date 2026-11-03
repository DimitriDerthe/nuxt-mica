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
    <span v-for="(it, i) in items" :key="i" class="mi-lg-step mi:w-3 mi:h-3 mi:rounded-[3px]" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />
    {{ moreLabel }}
  </div>
  <ul v-else-if="variant === 'inline'" class="mi-lg-inline mi:flex-wrap" :aria-label="ariaLabel ?? 'Legend'">
    <li class="mi:[.mi-lg-inline_&]:inline-flex mi:[.mi-lg-inline_&]:items-center mi:[.mi-lg-inline_&]:gap-1.5" v-for="(it, i) in items" :key="i">
      <span class="mi-lg-sw mi:flex-[none] mi:inline-block" :class="`mi-lg-sw--${it.shape ?? 'line'}`" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />{{ it.label }}
    </li>
  </ul>
  <ul v-else-if="variant === 'list'" class="mi-lg-list" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }" :aria-label="ariaLabel ?? 'Legend'" @pointerleave="leave">
    <li v-for="(it, i) in items" :key="i" class="mi-lg-row mi:flex mi:items-center mi:gap-2.5 mi:min-h-10 mi:[border-top:.5px_solid_var(--mi-sep)] mi:text-[14px] mi:text-label" :class="{ 'is-on': active === i }" @pointerenter="enter(i)">
      <span class="mi-lg-sw mi-lg-sw--square mi:flex-[none] mi:inline-block" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />
      <span class="mi-lg-name mi:flex-1 mi:min-w-0 mi:font-normal mi:[.mi-lg-row.is-on_&]:font-semibold mi:[.mi-lg-row_&]:overflow-hidden mi:[.mi-lg-row_&]:text-ellipsis mi:[.mi-lg-row_&]:whitespace-nowrap mi:[.mi-lg-stat_&]:flex-[none] mi:[.mi-lg-stat_&]:text-[14px] mi:[.mi-lg-stat_&]:font-semibold">{{ it.label }}</span>
      <span v-if="it.value" class="mi-lg-val mi:flex-[none] mi:font-semibold mi:tabular-nums">{{ it.value }}</span>
    </li>
  </ul>
  <ul v-else class="mi-lg-stat mi:flex-col" :aria-label="ariaLabel ?? 'Legend'" @pointerleave="leave">
    <li v-for="(it, i) in items" :key="i" class="mi-lg-srow mi:flex mi:items-center mi:gap-2.5 mi:text-label" :class="{ 'is-on': active === i }" @pointerenter="enter(i)">
      <span class="mi-lg-sw mi-lg-sw--dot mi:flex-[none] mi:inline-block" :style="{ background: miSafeColor(it.color, 'var(--mi-label3)') }" />
      <span class="mi-lg-txt mi:flex-1 mi:flex mi:flex-col mi:min-w-0"><span class="mi-lg-name mi:flex-1 mi:min-w-0 mi:font-normal mi:[.mi-lg-row.is-on_&]:font-semibold mi:[.mi-lg-row_&]:overflow-hidden mi:[.mi-lg-row_&]:text-ellipsis mi:[.mi-lg-row_&]:whitespace-nowrap mi:[.mi-lg-stat_&]:flex-[none] mi:[.mi-lg-stat_&]:text-[14px] mi:[.mi-lg-stat_&]:font-semibold">{{ it.label }}</span><span v-if="it.sub" class="mi-lg-subline mi:text-[12px] mi:text-label2">{{ it.sub }}</span></span>
      <span v-if="it.value" class="mi-lg-big mi:text-[17px] mi:font-semibold mi:tabular-nums">{{ it.value }}</span>
    </li>
  </ul>
</template>

<style scoped>
ul{list-style:none;margin:0;padding:0}
.mi-lg-inline,.mi-lg-list,.mi-lg-stat,.mi-lg-ramp{font-family:var(--mi-font)}
.mi-lg-inline{display:flex;gap:6px 14px;font-size:13px;color:var(--mi-label2)}
.mi-lg-sw--line{width:14px;height:3px;border-radius:2px}
.mi-lg-sw--square{width:10px;height:10px;border-radius:3px}
.mi-lg-sw--dot{width:10px;height:10px;border-radius:50%}
.mi-lg-list{display:grid;gap:0 24px}
.mi-lg-stat{display:flex;gap:14px;flex:1;min-width:160px}
.mi-lg-ramp{display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:12px;color:var(--mi-label2)}
</style>
