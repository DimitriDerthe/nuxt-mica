<script setup lang="ts">
/** Accessible data table of chart values. Columns are { key, label, align? }[]; rows are objects keyed by column key. */
import { computed } from 'vue'
import { miChartZebra } from '../../utils/miChartPalette'

export interface MiChartTableColumn {
  key: string
  label: string
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<{
  /** Column definitions { key, label, align? }[]; the first column is the row header. */
  columns: MiChartTableColumn[]
  /** Row objects keyed by column key; values are strings or numbers. */
  rows: Array<Record<string, string | number>>
  /** Visually hidden caption announced by screen readers. */
  caption?: string
  /** Shades every other row to ease reading across wide tables. */
  zebra?: boolean
}>(), { zebra: true })

const first = computed(() => props.columns[0]?.key)
const rest = computed(() => props.columns.slice(1))
</script>

<template>
  <div class="mi-ct mi:overflow-x-auto mi:shadow-[inset_0_0_0_.5px_var(--mi-sep2)]" :style="{ '--mi-ct-zebra': miChartZebra }">
    <table class="mi-ct-table mi:w-full mi:border-collapse mi:text-[13px] mi:tabular-nums mi:text-right" :class="{ 'is-zebra': zebra }">
      <caption v-if="caption" class="mi-ct-cap mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ caption }}</caption>
      <thead>
        <tr class="mi:[thead_&]:text-label2">
          <th v-for="c in columns" :key="c.key" scope="col" :class="{ 'is-left mi:text-left': c.align === 'left' || (!c.align && c.key === first) }">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="mi:[.is-zebra_tbody_&:nth-child(even)]:[background:var(--mi-ct-zebra)]" v-for="(r, i) in rows" :key="i">
          <th v-if="first" scope="row" class="is-left mi:text-left">{{ r[first] }}</th>
          <td class="mi:[tbody_&]:py-1.5 mi:[tbody_&]:px-3.5" v-for="c in rest" :key="c.key" :class="{ 'is-left mi:text-left': c.align === 'left' }">{{ r[c.key] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mi-ct{border-radius:10px;font-family:var(--mi-font);color:var(--mi-label)}
thead th{padding:8px 14px;font-weight:600}
tbody th{padding:6px 14px;font-weight:500}
</style>
