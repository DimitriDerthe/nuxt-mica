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
  <div class="mi-ct" :style="{ '--mi-ct-zebra': miChartZebra }">
    <table class="mi-ct-table" :class="{ 'is-zebra': zebra }">
      <caption v-if="caption" class="mi-ct-cap">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key" scope="col" :class="{ 'is-left': c.align === 'left' || (!c.align && c.key === first) }">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <th v-if="first" scope="row" class="is-left">{{ r[first] }}</th>
          <td v-for="c in rest" :key="c.key" :class="{ 'is-left': c.align === 'left' }">{{ r[c.key] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mi-ct{overflow-x:auto;border-radius:10px;box-shadow:inset 0 0 0 .5px var(--mi-sep2);font-family:var(--mi-font);color:var(--mi-label)}
.mi-ct-table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums;text-align:right}
.mi-ct-cap{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
thead tr{color:var(--mi-label2)}
thead th{padding:8px 14px;font-weight:600}
tbody th{padding:6px 14px;font-weight:500}
tbody td{padding:6px 14px}
.is-left{text-align:left}
.is-zebra tbody tr:nth-child(even){background:var(--mi-ct-zebra)}
</style>
