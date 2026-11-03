<template>
  <section class="sft" aria-labelledby="sft-title">
    <header class="sft__head">
      <MiText id="sft-title" variant="title3" as="h2" weight="semibold">Q4 regional forecast</MiText>
      <MiText variant="footnote" tone="label2">Select a cell, then format it from the toolbar</MiText>
    </header>

    <!-- Toolbar: every control reads and writes the selected cell's format. -->
    <div class="sft__toolbar" role="toolbar" aria-label="Cell formatting">
      <MiMenu :model-value="fmt.kind" variant="popup" :items="kinds" aria-label="Number format" @update:model-value="(v) => set({ kind: kindOf(v) })" />
      <span class="sft__sep" aria-hidden="true" />
      <MiIconButton size="toolbar" variant="plain" label="Fewer decimals" :disabled="fmt.kind === 'general' || fmt.dec === 0" @click="set({ dec: fmt.dec - 1 })"><span class="sft__glyph">.0</span></MiIconButton>
      <MiIconButton size="toolbar" variant="plain" label="More decimals" :disabled="fmt.kind === 'general' || fmt.dec === 3" @click="set({ dec: fmt.dec + 1 })"><span class="sft__glyph">.00</span></MiIconButton>
      <span class="sft__sep" aria-hidden="true" />
      <MiToggle :pressed="fmt.bold" label="Bold" size="sm" @update:pressed="(v) => set({ bold: v })"><b>B</b></MiToggle>
      <MiToggle :pressed="fmt.italic" label="Italic" size="sm" @update:pressed="(v) => set({ italic: v })"><i class="sft__italic">I</i></MiToggle>
      <span class="sft__sep" aria-hidden="true" />
      <MiToggleGroup :model-value="fmt.align" :options="aligns" label="Alignment" size="sm" :spacing="0" @update:model-value="(v) => set({ align: alignOf(v) })">
        <template #default="{ option }"><MiIcon :name="option.value === 'start' ? 'align-left' : option.value === 'center' ? 'align-center' : 'align-right'" :size="16" /></template>
      </MiToggleGroup>
      <span class="sft__sep" aria-hidden="true" />
      <div class="sft__fill">
        <MiPopover v-model="fillOpen" inline trigger="manual" :width="236" :arrow-offset="22" label="Fill colour">
          <template #trigger="{ attrs, toggle }">
            <MiIconButton v-bind="attrs" size="toolbar" variant="plain" label="Fill colour" :pressed="fillOpen" @click="toggle">
              <span class="sft__bucket" :style="{ '--fill': fillCss(fmt.fill) }" />
            </MiIconButton>
          </template>
          <MiSwatch :model-value="fmt.fill" :options="fills" label="Fill" @update:model-value="(v) => set({ fill: v ?? 'none' })" />
        </MiPopover>
      </div>
    </div>

    <div class="sft__formula">
      <span class="sft__addr">{{ selected }}</span>
      <span class="sft__fx" aria-hidden="true">fx</span>
      <output class="sft__raw" aria-live="polite">{{ rawOf(selected) }}</output>
    </div>

    <div class="sft__scroll">
      <table class="sft__grid">
        <caption class="sft__sr">Forecast sheet; activate a cell to select it</caption>
        <thead>
          <tr><th scope="col" /><th v-for="c in cols" :key="c" scope="col">{{ c }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in sheet" :key="r">
            <th scope="row">{{ r + 1 }}</th>
            <td v-for="(v, c) in row" :key="c">
              <button
                type="button" class="sft__cell" :class="cellClass(addr(r, c))" :aria-pressed="selected === addr(r, c)"
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
  return { 'is-sel': selected.value === a, 'is-bold': f.bold, 'is-italic': f.italic, ['is-' + f.align]: true, 'is-neg': typeof valueAt(a) === 'number' && Number(valueAt(a)) < 0 }
}
</script>

<style scoped>
.sft { container-type: inline-size; display: grid; align-content: start; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }
.sft__head { display: grid; gap: 2px; }
.sft__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.sft__toolbar { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 6px; padding: 6px 8px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sft__sep { align-self: center; width: 1px; height: 20px; background: var(--mi-sep); }
.sft__glyph { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.sft__italic { font-weight: 600; }
.sft__fill { position: relative; z-index: 1; }
.sft__bucket { width: 18px; height: 18px; border-radius: 5px; background: var(--fill); box-shadow: inset 0 0 0 1.5px var(--mi-label2); }

.sft__formula { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 6px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-size: 13px; }
.sft__addr { min-width: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
.sft__fx { font-style: italic; color: var(--mi-label3); }
.sft__raw { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, monospace; }

.sft__scroll { min-width: 0; overflow-x: auto; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sft__grid { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.sft__grid th { padding: 4px 8px; font-size: 11px; font-weight: 600; color: var(--mi-label3); background: var(--mi-fill4); border: 1px solid var(--mi-sep); }
.sft__grid td { padding: 0; border: 1px solid var(--mi-sep); }
.sft__cell { display: block; width: 100%; padding: 8px 10px; border: 0; background: var(--fill); font: inherit; color: inherit; text-align: end; cursor: cell; white-space: nowrap; }
.sft__cell.is-start { text-align: start; }
.sft__cell.is-center { text-align: center; }
.sft__cell.is-bold { font-weight: 700; }
.sft__cell.is-italic { font-style: italic; }
.sft__cell.is-neg { color: var(--mi-red-t); }
.sft__cell.is-sel { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.sft__cell:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
@container (min-width: 720px) { .sft__grid { font-size: 14px; } }
</style>
