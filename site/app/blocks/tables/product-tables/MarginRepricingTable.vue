<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="mrt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="mrt-title" variant="title3" as="h2" weight="semibold">Repricing</MiText>
        <MiText variant="footnote" tone="label2">Outpost Supply · spring range · target margin {{ target }}%</MiText>
      </div>
      <div class="mi:grid mi:justify-items-end" role="status">
        <MiText variant="caption" tone="label2">Blended margin</MiText>
        <span class="mi:text-[26px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums" :class="blended < target ? 'mi:text-orange-t' : 'mi:text-green-t'">{{ blended.toFixed(1) }}%</span>
      </div>
    </header>

    <!-- Bulk move: preview a percentage on every price, then apply it to the drafts. -->
    <div class="mi:grid mi:gap-3 mi:items-end mi:py-3.5 mi:px-4 mi:rounded-lg mi:bg-fill4 mi:@[600px]:grid-cols-[minmax(0,_1fr)_auto]">
      <MiSlider v-model="shift" :min="-10" :max="20" label="Move every price" :format="v => (v > 0 ? '+' : '') + v + '%'" class="mi:min-w-0!" />
      <MiButton size="small" variant="tinted" :disabled="shift === 0" @click="applyShift">Apply to {{ products.length }} prices</MiButton>
    </div>

    <div class="mi:min-w-0 mi:overflow-x-auto mi:rounded-xl mi:bg-card mi:shadow-1 mi:*:min-w-[680px]">
      <MiTable :columns="columns" :rows="rows" caption="Prices and margins" :zebra="false">
        <template #cell-name="{ row }">
          <span class="mi:inline-flex mi:flex-wrap mi:items-baseline mi:gap-x-2 mi:font-semibold">
            <i v-if="isChanged(String(row.id))" class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:bg-p mi:self-center" aria-label="Edited" role="img" />
            {{ byId(row.id).name }}
            <MiText as="span" variant="caption" tone="label3">{{ byId(row.id).sku }}</MiText>
          </span>
        </template>
        <template #cell-price="{ row }">
          <MiInput
            v-model="draft[String(row.id)]" size="sm" prefix="$" inputmode="decimal" class="mi:w-[112px]!"
            :invalid="priceOf(String(row.id)) === null" :aria-label="'Price of ' + byId(row.id).name"
          />
        </template>
        <template #cell-margin="{ row }">
          <span class="mi:flex mi:items-center mi:gap-2.5">
            <span class="mi:relative mi:flex-1 mi:h-1.5 mi:rounded-[3px] mi:bg-fill2 mi:overflow-visible" role="meter" :aria-label="'Margin of ' + byId(row.id).name" :aria-valuenow="Math.round(marginOf(String(row.id)))" aria-valuemin="0" aria-valuemax="100">
              <i class="mi:absolute mi:rounded-[inherit] mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="marginOf(String(row.id)) < target ? 'mi:bg-orange' : 'mi:bg-green'" :style="{ transform: `scaleX(${Math.min(1, Math.max(0, marginOf(String(row.id))) / 80)})` }" />
              <b class="mi:absolute mi:w-0.5 mi:rounded-[1px] mi:-top-1 mi:-bottom-1 mi:-ms-px mi:bg-label mi:opacity-50" :style="{ insetInlineStart: (target / 80) * 100 + '%' }" />
            </span>
            <span class="mi:w-12 mi:text-end mi:font-semibold mi:tabular-nums" :class="marginOf(String(row.id)) < target ? 'mi:text-orange-t' : ''">{{ marginOf(String(row.id)).toFixed(1) }}%</span>
          </span>
        </template>
      </MiTable>
    </div>

    <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
      <MiText variant="footnote" tone="label2" aria-live="polite">{{ status }}</MiText>
      <div class="mi:flex mi:gap-2">
        <MiButton size="small" variant="gray" :disabled="!changed.length" @click="reset">Discard</MiButton>
        <MiButton size="small" :disabled="!changed.length || invalid" @click="save">Publish {{ changed.length || '' }} {{ changed.length === 1 ? 'price' : 'prices' }}</MiButton>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Product { id: string, sku: string, name: string, cost: number, price: number, units: number }

const target = 45
const products = ref<Product[]>([
  { id: 'p1', sku: 'OS-TNT-2P', name: 'Ridgeline 2P tent', cost: 142, price: 289, units: 64 },
  { id: 'p2', sku: 'OS-BAG-0C', name: 'Down sleeping bag 0°C', cost: 118, price: 199, units: 88 },
  { id: 'p3', sku: 'OS-STV-TI', name: 'Titanium stove', cost: 31, price: 49, units: 210 },
  { id: 'p4', sku: 'OS-PCK-38', name: 'Daypack 38 L', cost: 46, price: 119, units: 156 },
  { id: 'p5', sku: 'OS-LMP-HD', name: 'Rechargeable headlamp', cost: 19, price: 34, units: 342 },
  { id: 'p6', sku: 'OS-JKT-RN', name: 'Rain shell jacket', cost: 74, price: 159, units: 97 }
])

const draftOf = () => Object.fromEntries(products.value.map(p => [p.id, p.price.toFixed(2)]))
const draft = ref<Record<string, string>>(draftOf())
const shift = ref(0)
const status = ref('Edit a price or move them all; margins update as you type.')

const byIdMap = computed(() => new Map(products.value.map(p => [p.id, p])))
const byId = (id: unknown) => byIdMap.value.get(String(id)) ?? products.value[0]!

// Draft price with the slider preview on top; null when the field is not a positive number.
function priceOf(id: string): number | null {
  const n = Number((draft.value[id] ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.round(n * (1 + shift.value / 100) * 100) / 100 : null
}
function marginOf(id: string) {
  const price = priceOf(id)
  return price ? ((price - byId(id).cost) / price) * 100 : 0
}
const isChanged = (id: string) => priceOf(id) !== byId(id).price

const rows = computed(() => products.value.map(p => ({ id: p.id, name: p.name, cost: '$' + p.cost.toFixed(2), units: p.units, price: priceOf(p.id) ?? 0, margin: marginOf(p.id) })))
const changed = computed(() => products.value.filter(p => isChanged(p.id)))
const invalid = computed(() => products.value.some(p => priceOf(p.id) === null))
// Weighted by units sold last season, so best sellers count for more.
const blended = computed(() => {
  const revenue = products.value.reduce((t, p) => t + (priceOf(p.id) ?? 0) * p.units, 0)
  const cost = products.value.reduce((t, p) => t + p.cost * p.units, 0)
  return revenue ? ((revenue - cost) / revenue) * 100 : 0
})

const columns = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'units', label: 'Sold', sortable: true, numeric: true, align: 'end' as const, width: '72px' },
  { key: 'cost', label: 'Unit cost', muted: true, numeric: true, align: 'end' as const, width: '96px' },
  { key: 'price', label: 'Price', width: '128px' },
  { key: 'margin', label: 'Margin', sortable: true, width: '180px' }
]

function applyShift() {
  for (const p of products.value) draft.value[p.id] = (priceOf(p.id) ?? p.price).toFixed(2)
  status.value = `Moved every price by ${shift.value > 0 ? '+' : ''}${shift.value}%. Review, then publish.`
  shift.value = 0
}
function reset() {
  draft.value = draftOf()
  shift.value = 0
  status.value = 'Drafts discarded.'
}
function save() {
  const n = changed.value.length
  for (const p of products.value) p.price = priceOf(p.id) ?? p.price
  draft.value = draftOf()
  shift.value = 0
  status.value = `${n} ${n === 1 ? 'price' : 'prices'} published to the storefront.`
}
</script>
