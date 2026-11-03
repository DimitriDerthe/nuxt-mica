<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="sft-title">
    <header class="mi:grid mi:gap-0.5">
      <MiText id="sft-title" variant="title3" as="h2" weight="semibold">Q4 regional forecast</MiText>
      <MiText variant="footnote" tone="label2">Select a cell, then format it from the toolbar</MiText>
    </header>

    <!-- Toolbar: every control reads and writes the selected cell's format. -->
    <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:gap-1.5 mi:py-1.5 mi:px-2 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" role="toolbar" aria-label="Cell formatting">
      <MiMenu :model-value="fmt.kind" variant="popup" :items="kinds" aria-label="Number format" @update:model-value="(v) => set({ kind: kindOf(v) })" />
      <span class="mi:self-center mi:w-px mi:h-5 mi:[background:var(--mi-sep)]" aria-hidden="true" />
      <MiIconButton size="toolbar" variant="plain" label="Fewer decimals" :disabled="fmt.kind === 'general' || fmt.dec === 0" @click="set({ dec: fmt.dec - 1 })"><span class="mi:text-[12px] mi:font-bold mi:tabular-nums">.0</span></MiIconButton>
      <MiIconButton size="toolbar" variant="plain" label="More decimals" :disabled="fmt.kind === 'general' || fmt.dec === 3" @click="set({ dec: fmt.dec + 1 })"><span class="mi:text-[12px] mi:font-bold mi:tabular-nums">.00</span></MiIconButton>
      <span class="mi:self-center mi:w-px mi:h-5 mi:[background:var(--mi-sep)]" aria-hidden="true" />
      <MiToggle :pressed="fmt.bold" label="Bold" size="sm" @update:pressed="(v) => set({ bold: v })"><b>B</b></MiToggle>
      <MiToggle :pressed="fmt.italic" label="Italic" size="sm" @update:pressed="(v) => set({ italic: v })"><i class="mi:font-semibold">I</i></MiToggle>
      <span class="mi:self-center mi:w-px mi:h-5 mi:[background:var(--mi-sep)]" aria-hidden="true" />
      <MiToggleGroup :model-value="fmt.align" :options="aligns" label="Alignment" size="sm" :spacing="0" @update:model-value="(v) => set({ align: alignOf(v) })">
        <template #default="{ option }"><MiIcon :name="option.value === 'start' ? 'align-left' : option.value === 'center' ? 'align-center' : 'align-right'" :size="16" /></template>
      </MiToggleGroup>
      <span class="mi:self-center mi:w-px mi:h-5 mi:[background:var(--mi-sep)]" aria-hidden="true" />
      <div class="mi:relative mi:z-1">
        <MiPopover v-model="fillOpen" inline trigger="manual" :width="236" :arrow-offset="22" label="Fill colour">
          <template #trigger="{ attrs, toggle }">
            <MiIconButton v-bind="attrs" size="toolbar" variant="plain" label="Fill colour" :pressed="fillOpen" @click="toggle">
              <span class="mi:w-4.5 mi:h-4.5 mi:rounded-[5px] mi:[background:var(--fill)] mi:shadow-[inset_0_0_0_1.5px_var(--mi-label2)]" :style="{ '--fill': fillCss(fmt.fill) }" />
            </MiIconButton>
          </template>
          <MiSwatch :model-value="fmt.fill" :options="fills" label="Fill" @update:model-value="(v) => set({ fill: v ?? 'none' })" />
        </MiPopover>
      </div>
    </div>

    <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:py-1.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)] mi:text-[13px]">
      <span class="mi:min-w-8 mi:font-bold mi:tabular-nums">{{ selected }}</span>
      <span class="mi:italic mi:text-label3" aria-hidden="true">fx</span>
      <output class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:font-[ui-monospace,_monospace]" aria-live="polite">{{ rawOf(selected) }}</output>
    </div>

    <div class="mi:min-w-0 mi:overflow-x-auto mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
      <table class="mi:w-full mi:min-w-130 mi:border-collapse mi:text-[13px] mi:tabular-nums mi:@[720px]:text-[14px]">
        <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Forecast sheet; activate a cell to select it</caption>
        <thead>
          <tr><th class="mi:py-1 mi:px-2 mi:border mi:border-sep mi:text-[11px] mi:font-semibold mi:text-label3 mi:[background:var(--mi-fill4)]" scope="col" /><th class="mi:py-1 mi:px-2 mi:border mi:border-sep mi:text-[11px] mi:font-semibold mi:text-label3 mi:[background:var(--mi-fill4)]" v-for="c in cols" :key="c" scope="col">{{ c }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in sheet" :key="r">
            <th class="mi:py-1 mi:px-2 mi:border mi:border-sep mi:text-[11px] mi:font-semibold mi:text-label3 mi:[background:var(--mi-fill4)]" scope="row">{{ r + 1 }}</th>
            <td v-for="(v, c) in row" :key="c" class="mi:p-0 mi:border mi:border-sep">
              <button
                type="button" class="mi:block mi:w-full mi:py-2 mi:px-2.5 mi:[border:0] mi:[background:var(--fill)] mi:[font:inherit] mi:cursor-cell mi:whitespace-nowrap mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="cellClass(addr(r, c))" :aria-pressed="selected === addr(r, c)"
                :aria-label="addr(r, c) + ' ' + display(addr(r, c), v)" :style="{ '--fill': fillCss(formatOf(addr(r, c)).fill) }"
                @click="selected = addr(r, c)"
              >
                {{ display(addr(r, c), v) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'general' | 'number' | 'currency' | 'percent'
type Align = 'start' | 'center' | 'end'
interface Format { kind: Kind, dec: number, bold: boolean, italic: boolean, align: Align, fill: string }

const kinds = [{ value: 'general', label: 'General' }, { value: 'number', label: 'Number' }, { value: 'currency', label: 'Currency' }, { value: 'percent', label: 'Percent' }]
const aligns = [{ value: 'start', ariaLabel: 'Align left' }, { value: 'center', ariaLabel: 'Align centre' }, { value: 'end', ariaLabel: 'Align right' }]
const fills = [
  { value: 'none', name: 'None', color: 'var(--mi-card)' }, { value: 'brand', name: 'Brand', color: 'var(--mi-p-tint)' },
  { value: 'green', name: 'Green', color: 'color-mix(in srgb, var(--mi-green) 22%, transparent)' },
  { value: 'yellow', name: 'Yellow', color: 'color-mix(in srgb, var(--mi-yellow) 30%, transparent)' },
  { value: 'red', name: 'Red', color: 'color-mix(in srgb, var(--mi-red) 18%, transparent)' }
]
const cols = ['A', 'B', 'C', 'D']
const sheet: (string | number)[][] = [
  ['Region', 'Q3 actual', 'Q4 forecast', 'Growth'],
  ['Nordics', 412800, 468300, 0.1344],
  ['Benelux', 287450, 301900, 0.0503],
  ['Iberia', 198300, 251700, 0.2693],
  ['Baltics', 96420, 91050, -0.0557]
]

const base: Format = { kind: 'general', dec: 0, bold: false, italic: false, align: 'end', fill: 'none' }
// Starting formats: a bold header row, currency columns, a percent column.
const formats = ref<Record<string, Format>>(Object.fromEntries(sheet.flatMap((row, r) => row.map((v, c) => [addr(r, c), {
  ...base,
  kind: r === 0 || c === 0 ? 'general' : c === 3 ? 'percent' : 'currency',
  dec: c === 3 ? 1 : 0, bold: r === 0, align: c === 0 || typeof v === 'string' ? 'start' : 'end', fill: r === 0 ? 'brand' : 'none'
} satisfies Format]))))
const selected = ref('C4')
const fillOpen = ref(true)

function addr(r: number, c: number) { return `${cols[c]}${r + 1}` }
const formatOf = (a: string) => formats.value[a] ?? base
const fmt = computed(() => formatOf(selected.value))
function set(patch: Partial<Format>) { formats.value[selected.value] = { ...fmt.value, ...patch } }

const kindOf = (v: unknown): Kind => (v === 'number' || v === 'currency' || v === 'percent' ? v : 'general')
const alignOf = (v: unknown): Align => (v === 'start' || v === 'center' ? v : 'end')
const fillCss = (f: string) => (f === 'none' ? 'transparent' : fills.find(x => x.value === f)?.color ?? 'transparent')

function valueAt(a: string) {
  const c = cols.indexOf(a[0] ?? '')
  return sheet[Number(a.slice(1)) - 1]?.[c] ?? ''
}
const rawOf = (a: string) => String(valueAt(a))
function display(a: string, v: string | number) {
  if (typeof v === 'string') return v
  const f = formatOf(a)
  const opts = { minimumFractionDigits: f.dec, maximumFractionDigits: f.dec }
  if (f.kind === 'percent') return (v * 100).toLocaleString('en-US', opts) + '%'
  if (f.kind === 'currency') return '€' + v.toLocaleString('en-US', opts)
  if (f.kind === 'number') return v.toLocaleString('en-US', opts)
  return String(v)
}
function cellClass(a: string) {
  const f = formatOf(a)
  return [
    f.align === 'start' ? 'mi:text-start' : f.align === 'center' ? 'mi:text-center' : 'mi:text-end',
    typeof valueAt(a) === 'number' && Number(valueAt(a)) < 0 ? 'mi:text-red-t' : 'mi:text-inherit',
    f.bold ? 'mi:font-bold' : '',
    f.italic ? 'mi:italic' : '',
    selected.value === a ? 'mi:[outline:2px_solid_var(--mi-p)] mi:outline-offset-[-2px]' : ''
  ]
}
</script>
