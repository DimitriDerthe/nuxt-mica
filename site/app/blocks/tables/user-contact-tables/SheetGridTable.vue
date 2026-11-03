<template>
  <section class="mi:[--sgt-t3:color-mix(in_srgb,_var(--mi-label2)_78%,_transparent)] mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="sgt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText id="sgt-title" variant="title3" as="h2" weight="semibold">Partner renewals</MiText>
        <MiText variant="footnote" tone="label2">{{ rows.length }} partner contacts · Enter to edit, arrows to move, Shift to select</MiText>
      </div>
      <MiPopover v-model="colsOpen" placement="bottom-end" label="Visible columns" :width="220">
        <template #trigger="{ attrs }">
          <MiButton variant="gray" size="small" v-bind="attrs">
            <template #leading><MiIcon name="columns" :size="15" /></template>
            Columns <span class="mi:tabular-nums mi:text-label2 mi:ms-0.5">{{ visible.length }}/{{ columns.length }}</span>
          </MiButton>
        </template>
        <div class="mi:grid mi:gap-2.5">
          <MiText variant="caption" weight="semibold" tone="label2">Show columns</MiText>
          <MiCheckbox
            v-for="col in columns" :key="col.key" :model-value="!hidden.includes(col.key)" :label="col.label"
            :disabled="col.key === 'name'" @update:model-value="toggleCol(col.key)"
          />
        </div>
      </MiPopover>
    </header>

    <!-- Formula bar: the address and raw value of the active cell, like a spreadsheet name box. -->
    <div class="mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)] mi:items-center mi:gap-0 mi:min-h-8.5 mi:border mi:border-sep mi:rounded-md mi:bg-card mi:text-[13px] mi:overflow-hidden" aria-hidden="true">
      <span class="mi:min-w-14 mi:py-0 mi:px-3 mi:font-semibold mi:tabular-nums mi:text-center mi:border-r mi:border-r-sep">{{ addr(active.r, active.c) }}</span>
      <span class="mi:py-0 mi:px-2.5 mi:italic mi:font-semibold mi:text-(--sgt-t3) mi:border-r mi:border-r-sep">fx</span>
      <span class="mi:py-0 mi:px-3 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12.5px] mi:text-label2">{{ editing ? draft : String(cellValue(active.r, active.c)) }}</span>
    </div>

    <div class="mi:grid mi:border mi:border-sep mi:rounded-lg mi:bg-card mi:shadow-1 mi:overflow-hidden">
      <div ref="scroller" class="mi:max-h-101 mi:overflow-auto mi:overscroll-contain mi:[scroll-padding:36px_0_0_150px] mi:@[720px]:max-h-109.5 mi:@[720px]:[scroll-padding-left:210px]">
        <table
          ref="grid" class="mi:border-separate mi:[border-spacing:0] mi:min-w-full mi:text-[13px]" role="grid" aria-labelledby="sgt-title" :aria-rowcount="rows.length + 1" :aria-colcount="visible.length"
          aria-multiselectable="true" @keydown="onKey"
        >
          <thead>
            <tr role="row">
              <th v-for="(col, ci) in visible" :key="col.key" role="columnheader" scope="col" class="mi:sticky mi:top-0 mi:h-9 mi:py-0 mi:px-3 mi:whitespace-nowrap mi:group mi:text-[12px] mi:font-semibold mi:[background:color-mix(in_srgb,_var(--mi-fill4)_80%,_var(--mi-card))] mi:border-b mi:border-b-sep mi:border-r mi:border-r-sep" :data-on="inCols(ci) || undefined" :class="[col.num ? 'mi:text-end' : 'mi:text-start', ci === 0 ? 'mi:left-0 mi:z-3' : 'mi:z-2', inCols(ci) ? 'mi:text-p-text mi:shadow-[inset_0_-2px_0_var(--mi-p)]' : 'mi:text-label2']">
                <span class="mi:me-1.5 mi:text-[10px] mi:font-bold mi:text-(--sgt-t3) mi:tabular-nums mi:group-data-[on]:text-p-text">{{ letter(ci) }}</span>{{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in rows" :key="row.id" role="row" :aria-rowindex="ri + 2">
              <component
                :is="ci === 0 ? 'th' : 'td'" v-for="(col, ci) in visible" :key="col.key" :role="ci === 0 ? 'rowheader' : 'gridcell'"
                :data-cell="`${ri}-${ci}`" :data-active="isActive(ri, ci) || undefined" :tabindex="isActive(ri, ci) ? 0 : -1" :aria-selected="inRange(ri, ci)"
                class="mi:h-8.5 mi:max-w-55 mi:py-0 mi:px-3 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis mi:border-b mi:border-b-sep mi:border-r mi:border-r-sep mi:cursor-cell mi:select-none mi:[outline:none] mi:[tr:last-child_&]:[border-bottom:0] mi:data-[active]:after:content-[''] mi:data-[active]:after:absolute mi:data-[active]:after:right-px mi:data-[active]:after:bottom-px mi:data-[active]:after:w-1.5 mi:data-[active]:after:h-1.5 mi:data-[active]:after:bg-p mi:data-[active]:after:shadow-[0_0_0_1.5px_var(--mi-card)] mi:focus-visible:shadow-[inset_0_0_0_2px_var(--mi-p),_0_0_0_3px_color-mix(in_srgb,_var(--mi-p)_28%,_transparent)]" :class="[col.num ? 'mi:text-end mi:tabular-nums' : 'mi:text-start', ci === 0 ? 'mi:sticky mi:left-0 mi:min-w-37.5 mi:pl-0 mi:font-medium mi:@[720px]:min-w-52.5' : col.num ? 'mi:relative mi:min-w-22 mi:font-normal' : 'mi:relative mi:min-w-28 mi:font-normal', inRange(ri, ci) ? 'mi:bg-[color-mix(in_srgb,_var(--mi-p)_9%,_var(--mi-card))]' : 'mi:bg-card', isActive(ri, ci) ? 'mi:z-2 mi:shadow-[inset_0_0_0_2px_var(--mi-p)]' : ci === 0 ? 'mi:z-1 mi:shadow-[1px_0_0_var(--mi-sep),_6px_0_12px_-10px_var(--mi-label3)]' : '']"
                @mousedown="pick(ri, ci, $event)" @dblclick="startEdit()"
              >
                <span v-if="ci === 0" class="mi:inline-block mi:w-9 mi:me-2.5 mi:py-0 mi:px-1 mi:text-center mi:text-[11px] mi:tabular-nums mi:border-r mi:border-r-sep mi:leading-[34px]" :class="inRows(ri) ? 'mi:text-p-text mi:font-bold mi:[background:color-mix(in_srgb,_var(--mi-p)_9%,_transparent)]' : 'mi:font-medium mi:text-(--sgt-t3)'" aria-hidden="true">{{ ri + 1 }}</span>
                <input
                  v-if="editing && isActive(ri, ci)" ref="editor" v-model="draft" class="mi:[font:inherit] mi:font-medium mi:absolute mi:inset-0.5 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[2px] mi:[outline:none] mi:bg-card mi:text-label" :class="[col.num ? 'mi:text-end mi:tabular-nums' : '', ci === 0 ? 'mi:left-12 mi:w-[calc(100%_-_50px)]' : 'mi:w-[calc(100%_-_4px)]']"
                  :inputmode="col.num ? 'decimal' : 'text'" :aria-label="`Edit ${col.label}, row ${ri + 1}`" @keydown="onEditKey" @blur="commit()"
                >
                <span v-else class="mi:data-[tone=good]:text-green-t mi:data-[tone=good]:font-semibold mi:data-[tone=bad]:text-red-t mi:data-[tone=bad]:font-semibold" :data-tone="col.key === 'nps' ? npsTone(row.nps) : undefined">{{ show(row, col.key) }}</span>
              </component>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-4 mi:py-[9px] mi:px-3.5 mi:border-t mi:border-t-sep mi:[background:color-mix(in_srgb,_var(--mi-fill4)_80%,_var(--mi-card))] mi:text-[12px] mi:text-label2">
        <span>{{ rows.length }} rows<template v-if="hidden.length"> · {{ hidden.length }} hidden {{ hidden.length === 1 ? 'column' : 'columns' }}</template></span>
        <span class="mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-4.5 mi:tabular-nums mi:font-semibold mi:text-label" role="status" aria-live="polite">
          <span><em class="mi:font-medium mi:me-1.5 mi:not-italic mi:text-(--sgt-t3)">Count</em>{{ summary.count }}</span>
          <template v-if="summary.nums">
            <span><em class="mi:font-medium mi:me-1.5 mi:not-italic mi:text-(--sgt-t3)">Sum</em>{{ summary.sum }}</span>
            <span><em class="mi:font-medium mi:me-1.5 mi:not-italic mi:text-(--sgt-t3)">Avg</em>{{ summary.avg }}</span>
          </template>
        </span>
      </footer>
    </div>
    <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="assertive">{{ notice }}</p>
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
