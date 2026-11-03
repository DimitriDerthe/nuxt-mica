<script setup lang="ts">
/** Data table with global filter, sortable columns, pagination and row selection, built on MiTable and MiPagination. Cells are customised with `cell-<key>` slots. */
import { computed, watch } from 'vue'
import MiTable from './MiTable.vue'
import type { MiTableColumn, MiTableRow, MiTableSort } from './MiTable.vue'
import MiInput from '../Inputs/MiInput.vue'
import MiPagination from '../Navigation/MiPagination.vue'

defineSlots<{
  /** Content placed in the toolbar beside the filter input. */
  toolbar?(): unknown
  /** Custom cell content for the column with the matching key, in place of the raw value. */
  [name: `cell-${string}`]: (props: { row: MiTableRow, value: unknown, selected: boolean, index: number }) => unknown
  /** Content shown instead of `emptyText` when no row matches. */
  empty?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Column definitions: key, label, alignment, sorting and width. */
  columns: MiTableColumn[]
  /** Row objects; each column reads `row[key]`. */
  rows: MiTableRow[]
  /** Field holding a unique id for each row. */
  rowKey?: string
  /** Show the filter input. */
  filterable?: boolean
  /** Placeholder of the filter input. */
  filterPlaceholder?: string
  /** Filter only this column key; overrides `filterKeys`. */
  filterKey?: string
  /** Show a Columns menu to toggle column visibility. */
  columnToggle?: boolean
  /** Restrict filtering to these column keys (default: all columns). */
  filterKeys?: string[]
  /** Rows per page. */
  pageSize?: number
  /** Row selection mode. */
  selectable?: false | 'single' | 'multiple'
  /** Text shown when no row matches. */
  emptyText?: string
  /** Accessible table caption. */
  caption?: string
}>(), { rowKey: 'id', filterable: true, filterPlaceholder: 'Filter...', pageSize: 10, selectable: false, emptyText: 'No results' })

/** Selected row ids. */
const selected = defineModel<string[]>('selected', { default: () => [] })
/** Active sort. */
const sort = defineModel<MiTableSort | null>('sort', { default: null })
/** Filter text. */
const filter = defineModel<string>('filter', { default: '' })
/** Current page, 1-based. */
const page = defineModel<number>('page', { default: 1 })

/** Keys of hidden columns. */
const hidden = defineModel<string[]>('hidden', { default: () => [] })
const shown = computed(() => props.columns.filter(c => !hidden.value.includes(c.key)))
function toggleCol(k: string) { hidden.value = hidden.value.includes(k) ? hidden.value.filter(x => x !== k) : [...hidden.value, k] }

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const filtered = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return props.rows
  const keys = props.filterKey ? [props.filterKey] : (props.filterKeys ?? props.columns.map(c => c.key))
  return props.rows.filter(r => keys.some(k => String(r[k] ?? '').toLowerCase().includes(q)))
})
const sorted = computed(() => {
  const s = sort.value
  if (!s) return filtered.value
  const col = props.columns.find(c => c.key === s.key)
  const get = col?.sortBy ?? ((r: MiTableRow) => r[s.key] as string | number)
  const k = s.dir === 'desc' ? -1 : 1
  return [...filtered.value].sort((a, b) => {
    const x = get(a), y = get(b)
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * k
    return collator.compare(String(x ?? ''), String(y ?? '')) * k
  })
})
const pages = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)))
const current = computed(() => Math.min(Math.max(page.value, 1), pages.value))
const visible = computed(() => sorted.value.slice((current.value - 1) * props.pageSize, current.value * props.pageSize))

watch(filter, () => { page.value = 1 })
</script>

<template>
  <div class="mi-dt mi:flex mi:flex-col mi:gap-3 mi:font-mi mi:text-label">
    <div v-if="filterable" class="mi-dt__bar mi:flex mi:items-center mi:gap-2">
      <MiInput v-model="filter" class="mi-dt__filter" type="search" :placeholder="filterPlaceholder" :aria-label="filterPlaceholder" clearable />
      <slot name="toolbar" />
      <details v-if="columnToggle" class="mi-dt__cols mi:relative">
        <summary class="mi-dt__colsbtn mi:inline-flex mi:items-center mi:h-9 mi:py-0 mi:px-3 mi:[border:.5px_solid_var(--mi-sep)] mi:rounded-[10px] mi:bg-card mi:text-[14px] mi:cursor-pointer mi:[list-style:none]">Columns</summary>
        <div class="mi-dt__colsmenu mi:absolute mi:right-0 mi:z-5 mi:mt-1 mi:min-w-40 mi:p-1.5 mi:rounded-[12px] mi:bg-card mi:shadow-2">
          <label v-for="c in columns" :key="c.key" class="mi-dt__colopt mi:flex mi:gap-2 mi:items-center mi:py-1.5 mi:px-2 mi:text-[13px] mi:cursor-pointer"><input type="checkbox" :checked="!hidden.includes(c.key)" @change="toggleCol(c.key)"> {{ c.label }}</label>
        </div>
      </details>
    </div>
    <MiTable
      v-model:selected="selected"
      v-model:sort="sort"
      :columns="shown"
      :rows="visible"
      :row-key="rowKey"
      :selectable="selectable"
      :caption="caption"
      :empty-text="emptyText"
      manual-sort
    >
      <template v-for="c in shown" :key="c.key" #[`cell-${c.key}`]="sp">
        <slot :name="`cell-${c.key}`" v-bind="sp">{{ sp.value }}</slot>
      </template>
      <template #empty><slot name="empty">{{ emptyText }}</slot></template>
    </MiTable>
    <div class="mi-dt__foot mi:flex mi:items-center mi:justify-between mi:gap-3 mi:flex-wrap">
      <span v-if="selectable" class="mi-dt__count mi:text-[13px] mi:text-label2">{{ selected.length }} of {{ sorted.length }} row(s) selected</span>
      <span v-else class="mi-dt__count mi:text-[13px] mi:text-label2">{{ sorted.length }} row(s)</span>
      <MiPagination v-if="pages > 1" v-model="page" :total="pages" :summary="false" />
    </div>
  </div>
</template>

<style scoped>
.mi-dt__filter{flex:1;max-width:320px}
</style>
