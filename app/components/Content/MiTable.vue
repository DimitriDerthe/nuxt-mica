<script setup lang="ts">
/** Data table with sorting, row selection, sticky header, zebra rows and virtualization from 50 rows. Use for structured tabular data. */
import { computed, ref, useId } from 'vue'

export interface MiTableColumn {
  key: string
  label: string
  align?: 'start' | 'center' | 'end'
  sortable?: boolean
  /** Custom sort value extractor. Defaults to `row[key]`. */
  sortBy?: (row: Record<string, unknown>) => string | number
  /** CSS width of the column, e.g. `120px`. */
  width?: string
  /** Render the cells with the secondary label color. */
  muted?: boolean
  /** Use tabular figures (numbers). */
  numeric?: boolean
}
export interface MiTableSort { key: string, dir: 'asc' | 'desc' }
export type MiTableRow = Record<string, unknown>

defineSlots<{
  /** Content shown instead of `emptyText` when there are no rows. */
  empty?(): unknown
  /** Custom cell content for the column with the matching key; falls back to the `cell` slot. */
  [name: `cell-${string}`]: (props: { row: MiTableRow, value: unknown, selected: boolean, index: number }) => unknown
  /** Custom cell content for every column without a specific `cell-<key>` slot. */
  cell?(props: { row: MiTableRow, column: MiTableColumn, value: unknown, selected: boolean, index: number }): unknown
}>()

const props = withDefaults(defineProps<{
  /** Column definitions: key, label, alignment, sorting and width. */
  columns: MiTableColumn[]
  /** Row objects; each column reads `row[key]`. */
  rows: MiTableRow[]
  /** Field holding a unique id for each row. */
  rowKey?: string
  /** `single` or `multiple` row selection (checkbox column for multiple). `false` disables it. */
  selectable?: false | 'single' | 'multiple'
  /** Alternating row backgrounds. */
  zebra?: boolean
  /** Keep the header visible while the body scrolls (requires `maxHeight`). */
  stickyHeader?: boolean
  /** CSS max-height of the scroll area, e.g. `400px`. Needed for the sticky header. */
  maxHeight?: string
  /** Row height: compact 28px, regular 34px, relaxed 44px. */
  density?: 'compact' | 'regular' | 'relaxed'
  /** Accessible table caption (visually hidden). */
  caption?: string
  /** Skip internal sorting and only emit `update:sort`. */
  manualSort?: boolean
  /** Message shown when there are no rows. */
  emptyText?: string
  /** Force `content-visibility` on/off; by default enabled from 50 rows. */
  virtualize?: boolean
}>(), { rowKey: 'id', selectable: false, zebra: true, stickyHeader: true, density: 'regular', emptyText: 'No results', virtualize: undefined })

const emit = defineEmits<{
  (e: 'row-click', row: MiTableRow, ev: MouseEvent | KeyboardEvent): void
}>()

/** Selected row ids. */
const selected = defineModel<string[]>('selected', { default: () => [] })
/** Active sort. */
const sort = defineModel<MiTableSort | null>('sort', { default: null })

const uid = useId()
const body = ref<HTMLElement>()
const focusIdx = ref(0)
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

const rowId = (r: MiTableRow) => String(r[props.rowKey])
const selSet = computed(() => new Set(selected.value))
const ROW_H = { compact: 28, regular: 34, relaxed: 44 } as const
const rowH = computed(() => ROW_H[props.density])
const cv = computed(() => props.virtualize ?? props.rows.length >= 50)

const view = computed(() => {
  const s = sort.value
  if (!s || props.manualSort) return props.rows
  const col = props.columns.find(c => c.key === s.key)
  const get = col?.sortBy ?? ((r: MiTableRow) => r[s.key] as string | number)
  const k = s.dir === 'desc' ? -1 : 1
  return [...props.rows].sort((a, b) => {
    const x = get(a)
    const y = get(b)
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * k
    return collator.compare(String(x ?? ''), String(y ?? '')) * k
  })
})

const allSelected = computed(() => view.value.length > 0 && view.value.every(r => selSet.value.has(rowId(r))))
const someSelected = computed(() => !allSelected.value && view.value.some(r => selSet.value.has(rowId(r))))

function ariaSort(c: MiTableColumn) {
  if (!c.sortable) return undefined
  return sort.value?.key === c.key ? (sort.value.dir === 'asc' ? 'ascending' : 'descending') : 'none'
}

function toggleSort(c: MiTableColumn) {
  sort.value = sort.value?.key === c.key
    ? { key: c.key, dir: sort.value.dir === 'asc' ? 'desc' : 'asc' }
    : { key: c.key, dir: 'asc' }
}

function toggleRow(r: MiTableRow) {
  if (!props.selectable) return
  const id = rowId(r)
  if (props.selectable === 'single') selected.value = selSet.value.has(id) ? [] : [id]
  else selected.value = selSet.value.has(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

function toggleAll() {
  selected.value = allSelected.value ? [] : view.value.map(rowId)
}

function onRowClick(r: MiTableRow, i: number, e: MouseEvent) {
  const t = e.target as HTMLElement
  // The row checkbox toggles through its own change event; toggling here too would undo it.
  if (t.closest('.mi-tbl__chk')) { focusIdx.value = i; return }
  if (t.closest('a,button,input,select,textarea,label')) return
  focusIdx.value = i
  toggleRow(r)
  emit('row-click', r, e)
}

function focusRow(i: number) {
  const rows = body.value?.querySelectorAll<HTMLElement>('tr[data-row]')
  if (!rows?.length) return
  const n = Math.max(0, Math.min(rows.length - 1, i))
  focusIdx.value = n
  rows[n]!.focus()
}

function onRowKey(r: MiTableRow, i: number, e: KeyboardEvent) {
  if (e.target !== e.currentTarget) return
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); focusRow(i + 1); break
    case 'ArrowUp': e.preventDefault(); focusRow(i - 1); break
    case 'Home': e.preventDefault(); focusRow(0); break
    case 'End': e.preventDefault(); focusRow(view.value.length - 1); break
    case ' ':
    case 'Enter':
      e.preventDefault()
      toggleRow(r)
      emit('row-click', r, e)
      break
    case 'a':
    case 'A':
      if ((e.metaKey || e.ctrlKey) && props.selectable === 'multiple') { e.preventDefault(); selected.value = view.value.map(rowId) }
      break
  }
}

const colCount = computed(() => props.columns.length + (props.selectable === 'multiple' ? 1 : 0))
</script>

<template>
  <div
    class="mi-tbl"
    :class="{ 'mi-tbl--zebra': zebra, 'mi-tbl--cv': cv, 'mi-tbl--sticky': stickyHeader && maxHeight }"
    :style="{ '--mi-tbl-rh': rowH + 'px', maxHeight: maxHeight }"
    :tabindex="selectable ? undefined : 0"
    role="region"
    :aria-label="caption ?? 'Table'"
  >
    <table class="mi-tbl__t" :role="selectable ? 'grid' : undefined" :aria-multiselectable="selectable === 'multiple' ? 'true' : undefined">
      <caption v-if="caption" class="mi-tbl__cap">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-if="selectable === 'multiple'" scope="col" class="mi-tbl__th mi-tbl__selcol">
            <input
              class="mi-tbl__chk"
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected"
              aria-label="Select all rows"
              @change="toggleAll"
            >
          </th>
          <th
            v-for="c in columns"
            :key="c.key"
            scope="col"
            class="mi-tbl__th"
            :class="[`mi-tbl__a-${c.align ?? 'start'}`, { 'mi-tbl__th--s': c.sortable }]"
            :style="c.width ? { width: c.width } : undefined"
            :aria-sort="ariaSort(c)"
          >
            <button
              v-if="c.sortable"
              type="button"
              class="mi-tbl__sort"
              :class="{ 'mi-tbl__sort--on': sort?.key === c.key }"
              @click="toggleSort(c)"
            >
              {{ c.label }}
              <svg
                class="mi-tbl__car"
                :class="{ 'mi-tbl__car--desc': sort?.key === c.key && sort.dir === 'desc' }"
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
              ><path d="M6 9l6 6 6-6" /></svg>
            </button>
            <template v-else>{{ c.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody ref="body">
        <tr v-if="!view.length">
          <td class="mi-tbl__empty" :colspan="colCount">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
        <tr
          v-for="(r, i) in view"
          :key="rowId(r)"
          data-row
          class="mi-tbl__tr"
          :class="{ 'mi-tbl__tr--sel': selSet.has(rowId(r)), 'mi-tbl__tr--int': selectable, 'mi-tbl__tr--odd': i % 2 === 1 }"
          :aria-selected="selectable ? selSet.has(rowId(r)) : undefined"
          :tabindex="selectable ? (i === focusIdx ? 0 : -1) : undefined"
          @click="onRowClick(r, i, $event)"
          @keydown="onRowKey(r, i, $event)"
          @focus="focusIdx = i"
        >
          <td v-if="selectable === 'multiple'" class="mi-tbl__td mi-tbl__selcol">
            <input
              class="mi-tbl__chk"
              type="checkbox"
              tabindex="-1"
              :checked="selSet.has(rowId(r))"
              :aria-labelledby="`${uid}-r${i}`"
              @change="toggleRow(r)"
            >
          </td>
          <td
            v-for="(c, ci) in columns"
            :key="c.key"
            class="mi-tbl__td"
            :class="[`mi-tbl__a-${c.align ?? 'start'}`, { 'mi-tbl__td--dim': c.muted, 'mi-tbl__td--num': c.numeric }]"
          >
            <span :id="ci === 0 ? `${uid}-r${i}` : undefined" class="mi-tbl__c">
              <slot :name="`cell-${c.key}`" :row="r" :value="r[c.key]" :selected="selSet.has(rowId(r))" :index="i">
                <slot name="cell" :row="r" :column="c" :value="r[c.key]" :selected="selSet.has(rowId(r))" :index="i">{{ r[c.key] }}</slot>
              </slot>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.mi-tbl{overflow:auto;border-radius:14px;background:var(--mi-card);box-shadow:var(--mi-sh1);color:var(--mi-label);font-family:var(--mi-font);font-size:13px;overscroll-behavior:contain}
.mi-tbl__t{width:100%;border-collapse:separate;border-spacing:0}
.mi-tbl__cap{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.mi-tbl__th{height:36px;padding:0 16px;font-weight:600;text-align:left;color:var(--mi-label2);background:var(--mi-card);box-shadow:inset 0 -.5px 0 var(--mi-sep);white-space:nowrap}
.mi-tbl__th--s{padding:0}
.mi-tbl--sticky .mi-tbl__th{position:sticky;top:0;z-index:2}
.mi-tbl__selcol{width:44px;padding:0 0 0 16px;text-align:left}
.mi-tbl__a-center{text-align:center}
.mi-tbl__a-end{text-align:right}
.mi-tbl__sort{display:flex;align-items:center;gap:6px;width:100%;height:36px;padding:0 16px;border:0;background:transparent;color:var(--mi-label);font:inherit;font-weight:600;text-align:inherit;cursor:pointer;white-space:nowrap}
.mi-tbl__a-end .mi-tbl__sort{justify-content:flex-end}
.mi-tbl__a-center .mi-tbl__sort{justify-content:center}
.mi-tbl__sort:focus-visible{outline-offset:-3px}
.mi-tbl__car{flex:none;opacity:.35;transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-2) linear}
.mi-tbl__sort--on .mi-tbl__car{opacity:1}
.mi-tbl__car--desc{transform:rotate(180deg)}
.mi-tbl--zebra .mi-tbl__tr--odd{background:var(--mi-zebra,var(--mi-fill4))}
.mi-tbl__td{height:var(--mi-tbl-rh);padding:0 16px;vertical-align:middle;white-space:nowrap}
.mi-tbl__td--dim{color:var(--mi-label2)}
.mi-tbl__td--num{font-variant-numeric:tabular-nums}
.mi-tbl__c{display:block}
.mi-tbl--cv .mi-tbl__c{content-visibility:auto;contain-intrinsic-size:auto var(--mi-tbl-rh);height:var(--mi-tbl-rh);line-height:var(--mi-tbl-rh)}
.mi-tbl__tr--int{cursor:pointer;-webkit-tap-highlight-color:transparent}
.mi-tbl__tr--int:focus-visible{outline-offset:-3px}
@media (hover:hover){.mi-tbl__tr--int:not(.mi-tbl__tr--sel):hover{background:var(--mi-fill3)}}
/* Selected rows use the soft brand tint so badges, links and dim text inside cells stay readable. */
.mi-tbl__tr.mi-tbl__tr--sel{background:var(--mi-p-tint)}
.mi-tbl__chk{width:16px;height:16px;margin:0;vertical-align:middle;accent-color:var(--mi-p);cursor:pointer}
.mi-tbl__empty{padding:28px 16px;text-align:center;color:var(--mi-label2)}
</style>
