<template>
  <section class="sgt mi:[--sgt-t3:color-mix(in_srgb,_var(--mi-label2)_78%,_transparent)] mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="sgt-title">
    <header class="sgt__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="sgt__title mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText id="sgt-title" variant="title3" as="h2" weight="semibold">Partner renewals</MiText>
        <MiText variant="footnote" tone="label2">{{ rows.length }} partner contacts · Enter to edit, arrows to move, Shift to select</MiText>
      </div>
      <MiPopover v-model="colsOpen" placement="bottom-end" label="Visible columns" :width="220">
        <template #trigger="{ attrs }">
          <MiButton variant="gray" size="small" v-bind="attrs">
            <template #leading><MiIcon name="columns" :size="15" /></template>
            Columns <span class="sgt__num mi:tabular-nums mi:text-label2 mi:ms-0.5">{{ visible.length }}/{{ columns.length }}</span>
          </MiButton>
        </template>
        <div class="sgt__cols mi:grid mi:gap-2.5">
          <MiText variant="caption" weight="semibold" tone="label2">Show columns</MiText>
          <MiCheckbox
            v-for="col in columns" :key="col.key" :model-value="!hidden.includes(col.key)" :label="col.label"
            :disabled="col.key === 'name'" @update:model-value="toggleCol(col.key)"
          />
        </div>
      </MiPopover>
    </header>

    <!-- Formula bar: the address and raw value of the active cell, like a spreadsheet name box. -->
    <div class="sgt__bar mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)] mi:items-center mi:gap-0 mi:min-h-8.5 mi:border mi:border-sep mi:rounded-md mi:bg-card mi:text-[13px] mi:overflow-hidden" aria-hidden="true">
      <span class="sgt__addr mi:min-w-14 mi:py-0 mi:px-3 mi:font-semibold mi:tabular-nums mi:text-center mi:border-r mi:border-r-sep">{{ addr(active.r, active.c) }}</span>
      <span class="sgt__fx mi:py-0 mi:px-2.5 mi:italic mi:font-semibold mi:text-(--sgt-t3) mi:border-r mi:border-r-sep">fx</span>
      <span class="sgt__raw mi:py-0 mi:px-3 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12.5px] mi:text-label2">{{ editing ? draft : String(cellValue(active.r, active.c)) }}</span>
    </div>

    <div class="sgt__sheet mi:grid mi:border mi:border-sep mi:rounded-lg mi:bg-card mi:shadow-1 mi:overflow-hidden">
      <div ref="scroller" class="sgt__scroll mi:max-h-101 mi:overflow-auto mi:overscroll-contain mi:[scroll-padding:36px_0_0_150px] mi:@[720px]:max-h-109.5 mi:@[720px]:[scroll-padding-left:210px]">
        <table
          ref="grid" class="sgt__grid mi:border-separate mi:[border-spacing:0] mi:min-w-full mi:text-[13px]" role="grid" aria-labelledby="sgt-title" :aria-rowcount="rows.length + 1" :aria-colcount="visible.length"
          aria-multiselectable="true" @keydown="onKey"
        >
          <thead>
            <tr role="row">
              <th v-for="(col, ci) in visible" :key="col.key" role="columnheader" scope="col" class="sgt__colhead mi:sticky mi:top-0 mi:z-2 mi:h-9 mi:py-0 mi:px-3 mi:whitespace-nowrap mi:text-start mi:text-[12px] mi:font-semibold mi:text-label2 mi:[background:color-mix(in_srgb,_var(--mi-fill4)_80%,_var(--mi-card))] mi:border-b mi:border-b-sep mi:border-r mi:border-r-sep mi:[&.is-num]:text-end mi:[&.is-pin]:left-0 mi:[&.is-pin]:z-3 mi:[&.is-on]:text-p-text mi:[&.is-on]:shadow-[inset_0_-2px_0_var(--mi-p)]" :class="{ 'is-num': col.num, 'is-on': inCols(ci), 'is-pin': ci === 0 }">
                <span class="sgt__letter mi:me-1.5 mi:text-[10px] mi:font-bold mi:text-(--sgt-t3) mi:tabular-nums mi:[.sgt__colhead.is-on_&]:text-p-text">{{ letter(ci) }}</span>{{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in rows" :key="row.id" role="row" :aria-rowindex="ri + 2">
              <component
                :is="ci === 0 ? 'th' : 'td'" v-for="(col, ci) in visible" :key="col.key" :role="ci === 0 ? 'rowheader' : 'gridcell'"
                :data-cell="`${ri}-${ci}`" :tabindex="isActive(ri, ci) ? 0 : -1" :aria-selected="inRange(ri, ci)"
                class="sgt__cell" :class="{ 'is-num': col.num, 'is-pin': ci === 0, 'is-sel': inRange(ri, ci), 'is-active': isActive(ri, ci) }"
                @mousedown="pick(ri, ci, $event)" @dblclick="startEdit()"
              >
                <span v-if="ci === 0" class="sgt__rownum mi:inline-block mi:w-9 mi:me-2.5 mi:py-0 mi:px-1 mi:text-center mi:text-[11px] mi:font-medium mi:text-(--sgt-t3) mi:tabular-nums mi:border-r mi:border-r-sep mi:leading-[34px] mi:[&.is-on]:text-p-text mi:[&.is-on]:font-bold mi:[&.is-on]:[background:color-mix(in_srgb,_var(--mi-p)_9%,_transparent)]" :class="{ 'is-on': inRows(ri) }" aria-hidden="true">{{ ri + 1 }}</span>
                <input
                  v-if="editing && isActive(ri, ci)" ref="editor" v-model="draft" class="sgt__edit mi:absolute mi:inset-0.5 mi:w-[calc(100%_-_4px)] mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[2px] mi:[outline:none] mi:bg-card mi:text-label mi:[.sgt__cell.is-pin_&]:left-12 mi:[.sgt__cell.is-pin_&]:w-[calc(100%_-_50px)] mi:[&.is-num]:text-end" :class="{ 'is-num': col.num }"
                  :inputmode="col.num ? 'decimal' : 'text'" :aria-label="`Edit ${col.label}, row ${ri + 1}`" @keydown="onEditKey" @blur="commit()"
                >
                <span v-else class="sgt__val" :data-tone="col.key === 'nps' ? npsTone(row.nps) : undefined">{{ show(row, col.key) }}</span>
              </component>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="sgt__status mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-4 mi:py-[9px] mi:px-3.5 mi:border-t mi:border-t-sep mi:[background:color-mix(in_srgb,_var(--mi-fill4)_80%,_var(--mi-card))] mi:text-[12px] mi:text-label2">
        <span class="sgt__meta">{{ rows.length }} rows<template v-if="hidden.length"> · {{ hidden.length }} hidden {{ hidden.length === 1 ? 'column' : 'columns' }}</template></span>
        <span class="sgt__sum mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-4.5 mi:tabular-nums mi:font-semibold mi:text-label" role="status" aria-live="polite">
          <span><em class="mi:[.sgt__sum_&]:me-1.5 mi:[.sgt__sum_&]:not-italic mi:[.sgt__sum_&]:text-(--sgt-t3)">Count</em>{{ summary.count }}</span>
          <template v-if="summary.nums">
            <span><em class="mi:[.sgt__sum_&]:me-1.5 mi:[.sgt__sum_&]:not-italic mi:[.sgt__sum_&]:text-(--sgt-t3)">Sum</em>{{ summary.sum }}</span>
            <span><em class="mi:[.sgt__sum_&]:me-1.5 mi:[.sgt__sum_&]:not-italic mi:[.sgt__sum_&]:text-(--sgt-t3)">Avg</em>{{ summary.avg }}</span>
          </template>
        </span>
      </footer>
    </div>
    <p class="sgt__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="assertive">{{ notice }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'

type Key = 'name' | 'company' | 'email' | 'region' | 'seats' | 'arr' | 'renewal' | 'nps'
interface Row { id: number, name: string, company: string, email: string, region: string, seats: number, arr: number, renewal: string, nps: number }
interface Col { key: Key, label: string, num?: boolean, money?: boolean }

const columns: Col[] = [
  { key: 'name', label: 'Contact' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'region', label: 'Region' },
  { key: 'seats', label: 'Seats', num: true },
  { key: 'arr', label: 'ARR', num: true, money: true },
  { key: 'renewal', label: 'Renewal' },
  { key: 'nps', label: 'NPS', num: true }
]

// Sample sheet; swap for your CRM export.
const rows = reactive<Row[]>([
  { id: 1, name: 'Hanna Lindqvist', company: 'Fjord Analytics', email: 'hanna@fjordanalytics.se', region: 'EMEA', seats: 42, arr: 50_400, renewal: '2027-01-14', nps: 62 },
  { id: 2, name: 'Marcus Oyelaran', company: 'Tidewater Logistics', email: 'm.oyelaran@tidewater.co', region: 'NA', seats: 180, arr: 194_400, renewal: '2026-12-01', nps: 41 },
  { id: 3, name: 'Chloé Garnier', company: 'Atelier Verre', email: 'chloe@atelierverre.fr', region: 'EMEA', seats: 12, arr: 14_400, renewal: '2027-03-30', nps: 78 },
  { id: 4, name: 'Daniel Okafor', company: 'Northbeam Energy', email: 'dokafor@northbeam.energy', region: 'EMEA', seats: 95, arr: 102_600, renewal: '2026-11-20', nps: -8 },
  { id: 5, name: 'Sakura Ishida', company: 'Kumo Games', email: 'sakura@kumogames.jp', region: 'APAC', seats: 64, arr: 69_120, renewal: '2027-02-08', nps: 55 },
  { id: 6, name: 'Gabriel Moreno', company: 'Pampa Agro', email: 'gmoreno@pampaagro.ar', region: 'LATAM', seats: 28, arr: 30_240, renewal: '2027-05-17', nps: 33 },
  { id: 7, name: 'Leah Rosenthal', company: 'Bellweather Legal', email: 'leah@bellweather.law', region: 'NA', seats: 36, arr: 51_840, renewal: '2026-12-15', nps: 70 },
  { id: 8, name: 'Arash Karimi', company: 'Sable Security', email: 'arash@sablesec.io', region: 'NA', seats: 150, arr: 216_000, renewal: '2027-04-01', nps: 12 },
  { id: 9, name: 'Nomvula Dlamini', company: 'Karoo Health', email: 'nomvula@karoohealth.za', region: 'EMEA', seats: 54, arr: 58_320, renewal: '2027-01-31', nps: 47 },
  { id: 10, name: 'Oliver Bennett', company: 'Gull & Rowe', email: 'oliver.bennett@gullrowe.co.uk', region: 'EMEA', seats: 22, arr: 26_400, renewal: '2027-06-12', nps: 59 },
  { id: 11, name: 'Priyanka Rao', company: 'Monsoon Retail', email: 'priyanka@monsoonretail.in', region: 'APAC', seats: 210, arr: 201_600, renewal: '2027-02-22', nps: 24 },
  { id: 12, name: 'Tomasz Nowak', company: 'Wisła Robotics', email: 't.nowak@wislarobotics.pl', region: 'EMEA', seats: 18, arr: 21_600, renewal: '2026-11-28', nps: -15 },
  { id: 13, name: 'Isabela Costa', company: 'Maré Travel', email: 'isabela@maretravel.com.br', region: 'LATAM', seats: 40, arr: 43_200, renewal: '2027-03-09', nps: 66 },
  { id: 14, name: 'Wei Zhang', company: 'Lattice Biotech', email: 'wei.zhang@latticebio.sg', region: 'APAC', seats: 75, arr: 90_000, renewal: '2027-01-05', nps: 38 }
])

const hidden = ref<Key[]>(['email'])
const colsOpen = ref(false)
const visible = computed(() => columns.filter(c => !hidden.value.includes(c.key)))

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const int = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const show = (row: Row, key: Key) => {
  const col = columns.find(c => c.key === key)!
  const v = row[key]
  return col.money ? usd.format(v as number) : col.num ? int.format(v as number) : v
}
const npsTone = (n: number) => (n >= 50 ? 'good' : n < 0 ? 'bad' : undefined)
// Letters stay tied to the source column, so hiding Email leaves a gap between B and D like a real sheet.
const letter = (i: number) => String.fromCharCode(65 + columns.indexOf(visible.value[i]!))
const addr = (r: number, c: number) => `${letter(c)}${r + 1}`
const cellValue = (r: number, c: number) => rows[r]?.[visible.value[c]?.key ?? 'name'] ?? ''

// Selection is an anchor plus the active cell; the range is the rectangle between them.
const anchor = reactive({ r: 1, c: 4 })
const active = reactive({ r: 4, c: 4 })
const lo = (a: number, b: number) => Math.min(a, b)
const hi = (a: number, b: number) => Math.max(a, b)
const inRows = (r: number) => r >= lo(anchor.r, active.r) && r <= hi(anchor.r, active.r)
const inCols = (c: number) => c >= lo(anchor.c, active.c) && c <= hi(anchor.c, active.c)
const inRange = (r: number, c: number) => inRows(r) && inCols(c)
const isActive = (r: number, c: number) => active.r === r && active.c === c

const summary = computed(() => {
  const vals: number[] = []
  let count = 0
  let money = true
  for (let r = lo(anchor.r, active.r); r <= hi(anchor.r, active.r); r++) {
    for (let c = lo(anchor.c, active.c); c <= hi(anchor.c, active.c); c++) {
      const col = visible.value[c]
      if (!col) continue
      count++
      if (col.num) { vals.push(rows[r]![col.key] as number); money &&= !!col.money }
    }
  }
  const total = vals.reduce((n, v) => n + v, 0)
  const f = (n: number) => (money ? usd.format(n) : int.format(n))
  return { count, nums: vals.length, sum: f(total), avg: vals.length ? f(total / vals.length) : '' }
})

const grid = ref<HTMLTableElement | null>(null)
const editor = ref<HTMLInputElement[] | HTMLInputElement | null>(null)
const editing = ref(false)
const draft = ref('')
const notice = ref('')

function focusActive() {
  nextTick(() => grid.value?.querySelector<HTMLElement>(`[data-cell="${active.r}-${active.c}"]`)?.focus())
}

function move(dr: number, dc: number, extend: boolean) {
  active.r = Math.min(rows.length - 1, Math.max(0, active.r + dr))
  active.c = Math.min(visible.value.length - 1, Math.max(0, active.c + dc))
  if (!extend) { anchor.r = active.r; anchor.c = active.c }
  focusActive()
}

function pick(r: number, c: number, e: MouseEvent) {
  if (editing.value && isActive(r, c)) return
  if (editing.value) commit()
  active.r = r
  active.c = c
  if (!e.shiftKey) { anchor.r = r; anchor.c = c }
}

function startEdit(seed?: string) {
  editing.value = true
  draft.value = seed ?? String(cellValue(active.r, active.c))
  nextTick(() => {
    const el = Array.isArray(editor.value) ? editor.value[0] : editor.value
    el?.focus()
    if (seed === undefined) el?.select()
  })
}

function commit() {
  if (!editing.value) return
  editing.value = false
  const col = visible.value[active.c]
  const row = rows[active.r]
  if (!col || !row) return
  if (col.num) {
    const n = Number(draft.value.replace(/[$,\s]/g, ''))
    if (Number.isNaN(n)) { notice.value = `${col.label} needs a number; the value was kept.`; return }
    ;(row[col.key] as number) = n
  }
  else {
    ;(row[col.key] as string) = draft.value.trim()
  }
  notice.value = `${addr(active.r, active.c)} set to ${show(row, col.key)}`
}

function cancel() {
  editing.value = false
  notice.value = 'Edit cancelled'
  focusActive()
}

function onEditKey(e: KeyboardEvent) {
  e.stopPropagation()
  if (e.key === 'Escape') { e.preventDefault(); cancel() }
  else if (e.key === 'Enter') { e.preventDefault(); commit(); move(e.shiftKey ? -1 : 1, 0, false) }
  else if (e.key === 'Tab') { e.preventDefault(); commit(); move(0, e.shiftKey ? -1 : 1, false) }
}

const arrows: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }

function onKey(e: KeyboardEvent) {
  if (editing.value) return
  const step = arrows[e.key]
  if (step) { e.preventDefault(); move(step[0], step[1], e.shiftKey) }
  else if (e.key === 'Home') { e.preventDefault(); move(0, -active.c, e.shiftKey) }
  else if (e.key === 'End') { e.preventDefault(); move(0, visible.value.length, e.shiftKey) }
  else if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit() }
  else if (e.key === 'Tab' && !e.shiftKey && active.c < visible.value.length - 1) { e.preventDefault(); move(0, 1, false) }
  else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); startEdit(e.key) }
}

function toggleCol(key: Key) {
  hidden.value = hidden.value.includes(key) ? hidden.value.filter(k => k !== key) : [...hidden.value, key]
  const last = visible.value.length - 1
  active.c = Math.min(active.c, last)
  anchor.c = Math.min(anchor.c, last)
}
</script>

<style scoped>
.sgt__cell {
  position: relative; height: 34px; min-width: 112px; max-width: 220px; padding: 0 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-align: start; font-weight: 400; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); border-right: 1px solid var(--mi-sep);
  cursor: cell; user-select: none; outline: none;
}
tr:last-child .sgt__cell { border-bottom: 0; }
.sgt__cell.is-num { text-align: end; font-variant-numeric: tabular-nums; min-width: 88px; }
.sgt__cell.is-pin { position: sticky; left: 0; z-index: 1; min-width: 150px; padding-left: 0; font-weight: 500; box-shadow: 1px 0 0 var(--mi-sep), 6px 0 12px -10px var(--mi-label3); }
.sgt__cell.is-sel { background: color-mix(in srgb, var(--mi-p) 9%, var(--mi-card)); }
/* Active cell: inset ring plus a square fill handle in the corner, the spreadsheet signature. */
.sgt__cell.is-active { box-shadow: inset 0 0 0 2px var(--mi-p); z-index: 2; }
.sgt__cell.is-active::after { content: ""; position: absolute; right: 1px; bottom: 1px; width: 6px; height: 6px; background: var(--mi-p); box-shadow: 0 0 0 1.5px var(--mi-card); }
.sgt__cell.is-pin.is-active { z-index: 2; }
.sgt__cell:focus-visible { box-shadow: inset 0 0 0 2px var(--mi-p), 0 0 0 3px color-mix(in srgb, var(--mi-p) 28%, transparent); }
.sgt__val[data-tone="good"] { color: var(--mi-green-t); font-weight: 600; }
.sgt__val[data-tone="bad"] { color: var(--mi-red-t); font-weight: 600; }

.sgt__edit { font: inherit; font-weight: 500;
}
.sgt__edit.is-num { font-variant-numeric: tabular-nums; }
.sgt__sum em { font-weight: 500; }

@container (min-width: 720px) {
  .sgt__cell.is-pin { min-width: 210px; }
}
</style>
