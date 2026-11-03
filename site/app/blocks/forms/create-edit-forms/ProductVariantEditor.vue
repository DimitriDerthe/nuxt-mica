<template>
  <section class="pve mi:@container mi:font-mi mi:text-label" aria-labelledby="pve-title">
    <form class="pve__card mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" novalidate @submit.prevent="save">
      <header class="pve__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
        <div>
          <MiText id="pve-title" variant="title3" as="h2" weight="semibold">New product</MiText>
          <MiText variant="footnote" tone="label2">Options build the variant list; edit price and stock per line.</MiText>
        </div>
        <MiBadge tone="primary" :label="`${active.length} of ${rows.length} variants on sale`" />
      </header>

      <div class="pve__basics mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]:grid-cols-[2fr_1fr] mi:@[620px]:items-start">
        <MiField label="Product name" required :error="tried && !name.trim() ? 'Give the product a name.' : ''">
          <MiInput v-model="name" />
        </MiField>
        <MiField label="Base price" hint="New variants start at this price">
          <MiInput v-model="base" prefix="€" inputmode="decimal" />
        </MiField>
      </div>

      <div class="pve__opts mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]:grid-cols-[1fr_1fr] mi:@[620px]:items-start mi:p-3.5 mi:rounded-lg mi:bg-fill4">
        <MiField v-for="o in options" :key="o.name" :label="o.name" :hint="`${o.values.length} values · press Return to add`">
          <MiTagInput v-model="o.values" :max="6" :placeholder="o.hint" />
        </MiField>
      </div>

      <div class="pve__table-head mi:flex mi:items-center mi:justify-between mi:gap-2">
        <MiText variant="subheadline" as="h3" weight="semibold">Variants</MiText>
        <MiButton size="small" variant="plain" @click="resetPrices">Set all to €{{ base || 0 }}</MiButton>
      </div>
      <div class="pve__scroll mi:overflow-x-auto mi:rounded-lg mi:border mi:border-sep">
        <table class="pve__table mi:w-full mi:min-w-140 mi:border-collapse mi:text-[13px]">
          <thead><tr><th scope="col">On sale</th><th scope="col">Variant</th><th scope="col">SKU</th><th scope="col">Price</th><th scope="col">Stock</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.key" :class="{ 'is-off': !r.on }">
              <td><MiCheckbox :model-value="r.on" :aria-label="`Sell ${r.label}`" @update:model-value="patch(r.key, { on: $event })" /></td>
              <td class="pve__name mi:font-medium mi:whitespace-nowrap"><span v-if="r.swatch" class="pve__swatch mi:inline-block mi:w-2.5 mi:h-2.5 mi:me-2 mi:rounded-[50%] mi:shadow-[0_0_0_1px_var(--mi-sep)]" :style="{ background: r.swatch }" aria-hidden="true" />{{ r.label }}</td>
              <td class="pve__sku mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12px] mi:text-label2 mi:whitespace-nowrap">{{ r.sku }}</td>
              <td><MiInput :model-value="r.price" size="sm" prefix="€" inputmode="decimal" :aria-label="`Price of ${r.label}`" @update:model-value="patch(r.key, { price: $event })" /></td>
              <td><MiInput :model-value="String(r.stock)" size="sm" inputmode="numeric" :aria-label="`Stock of ${r.label}`" :invalid="r.on && r.stock === 0" @update:model-value="patch(r.key, { stock: Math.max(0, parseInt($event, 10) || 0) })" /></td>
            </tr>
          </tbody>
        </table>
        <MiText v-if="!rows.length" variant="footnote" tone="label2" class="pve__empty mi:p-3.5">Add at least one value to each option.</MiText>
      </div>

      <footer class="pve__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
        <MiText variant="caption" :tone="saved ? 'green' : 'label2'" aria-live="polite">
          {{ saved ? `${name} saved with ${active.length} variants` : `${totalStock} units in stock · ${empty} on sale with no stock` }}
        </MiText>
        <div class="pve__btns mi:flex mi:gap-2">
          <MiButton variant="gray">Save as draft</MiButton>
          <MiButton type="submit">Create product</MiButton>
        </div>
      </footer>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

interface Override { on: boolean, price: string, stock: number }
interface Row extends Override { key: string, label: string, sku: string, swatch: string }

// Known colors get a token swatch; anything else shows without one.
const SWATCH: Record<string, string> = { Sand: 'var(--mi-yellow)', Moss: 'var(--mi-green)', Ink: 'var(--mi-label)', Rust: 'var(--mi-orange)', Sky: 'var(--mi-blue)' }

const name = ref('Merino crew sweater')
const base = ref('89')
const options = reactive([
  { name: 'Size', hint: 'S, M, L…', values: ['S', 'M', 'L'] },
  { name: 'Color', hint: 'Sand, Moss…', values: ['Sand', 'Moss'] }
])
const overrides = reactive<Record<string, Partial<Override>>>({ 'L / Moss': { price: '94' }, 'S / Sand': { stock: 0 } })
const tried = ref(false)
const saved = ref(false)

const rows = computed<Row[]>(() => {
  const [size, color] = options
  if (!size || !color) return []
  return size.values.flatMap(s => color.values.map((c) => {
    const key = `${s} / ${c}`
    return {
      key, label: key, swatch: SWATCH[c] ?? '',
      sku: `MCS-${s}-${c.slice(0, 3)}`.toUpperCase(),
      on: true, price: base.value, stock: 12, ...overrides[key]
    }
  }))
})
const active = computed(() => rows.value.filter(r => r.on))
const totalStock = computed(() => active.value.reduce((n, r) => n + r.stock, 0))
const empty = computed(() => active.value.filter(r => r.stock === 0).length)

function patch(key: string, p: Partial<Override>) { overrides[key] = { ...overrides[key], ...p } }
function resetPrices() { for (const r of rows.value) patch(r.key, { price: base.value }) }

watch([name, base, options, overrides], () => { saved.value = false }, { deep: true })
function save() {
  tried.value = true
  if (name.value.trim() && active.value.length) saved.value = true
}
</script>

<style scoped>
.pve__table th { padding: 8px 12px; text-align: start; font-size: 12px; font-weight: 600; color: var(--mi-label2); background: var(--mi-fill4); }
.pve__table td { padding: 6px 12px; border-top: 1px solid var(--mi-sep); vertical-align: middle; }
.pve__table td:nth-child(4) { width: 120px; }
.pve__table td:nth-child(5) { width: 96px; }
.pve__table tr.is-off td:not(:first-child) { opacity: .5; }
</style>
