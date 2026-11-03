<template>
  <section class="mrt" aria-labelledby="mrt-title">
    <header class="mrt__head">
      <div>
        <MiText id="mrt-title" variant="title3" as="h2" weight="semibold">Repricing</MiText>
        <MiText variant="footnote" tone="label2">Outpost Supply · spring range · target margin {{ target }}%</MiText>
      </div>
      <div class="mrt__summary" role="status">
        <MiText variant="caption" tone="label2">Blended margin</MiText>
        <span class="mrt__blend" :class="{ 'is-low': blended < target }">{{ blended.toFixed(1) }}%</span>
      </div>
    </header>

    <!-- Bulk move: preview a percentage on every price, then apply it to the drafts. -->
    <div class="mrt__bulk">
      <MiSlider v-model="shift" :min="-10" :max="20" label="Move every price" :format="v => (v > 0 ? '+' : '') + v + '%'" class="mrt__slider" />
      <MiButton size="small" variant="tinted" :disabled="shift === 0" @click="applyShift">Apply to {{ products.length }} prices</MiButton>
    </div>

    <div class="mrt__scroll">
      <MiTable :columns="columns" :rows="rows" caption="Prices and margins" :zebra="false">
        <template #cell-name="{ row }">
          <span class="mrt__name">
            <i v-if="isChanged(String(row.id))" class="mrt__dot" aria-label="Edited" role="img" />
            {{ byId(row.id).name }}
            <MiText as="span" variant="caption" tone="label3">{{ byId(row.id).sku }}</MiText>
          </span>
        </template>
        <template #cell-price="{ row }">
          <MiInput
            v-model="draft[String(row.id)]" size="sm" prefix="$" inputmode="decimal" class="mrt__input"
            :invalid="priceOf(String(row.id)) === null" :aria-label="'Price of ' + byId(row.id).name"
          />
        </template>
        <template #cell-margin="{ row }">
          <span class="mrt__margin">
            <span class="mrt__bar" role="meter" :aria-label="'Margin of ' + byId(row.id).name" :aria-valuenow="Math.round(marginOf(String(row.id)))" aria-valuemin="0" aria-valuemax="100">
              <i :class="{ 'is-low': marginOf(String(row.id)) < target }" :style="{ transform: `scaleX(${Math.min(1, Math.max(0, marginOf(String(row.id))) / 80)})` }" />
              <b :style="{ insetInlineStart: (target / 80) * 100 + '%' }" />
            </span>
            <span class="mrt__pct" :class="{ 'is-low': marginOf(String(row.id)) < target }">{{ marginOf(String(row.id)).toFixed(1) }}%</span>
          </span>
        </template>
      </MiTable>
    </div>

    <footer class="mrt__foot">
      <MiText variant="footnote" tone="label2" aria-live="polite">{{ status }}</MiText>
      <div class="mrt__foot-actions">
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

<style scoped>
.mrt { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.mrt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.mrt__summary { display: grid; justify-items: end; }
.mrt__blend { font-size: 26px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; color: var(--mi-green-t); }
.mrt__blend.is-low { color: var(--mi-orange-t); }

.mrt__bulk { display: grid; gap: 12px; align-items: end; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
@container (min-width: 600px) { .mrt__bulk { grid-template-columns: minmax(0, 1fr) auto; } }
.mrt__slider { min-width: 0; }

.mrt__scroll { min-width: 0; overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mrt__scroll > * { min-width: 680px; }
.mrt__name { display: inline-flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; font-weight: 600; }
.mrt__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-p); align-self: center; }
.mrt__input { width: 112px; }

.mrt__margin { display: flex; align-items: center; gap: 10px; }
.mrt__bar { position: relative; flex: 1; height: 6px; border-radius: 3px; background: var(--mi-fill2); overflow: visible; }
.mrt__bar i { position: absolute; inset: 0; border-radius: inherit; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.mrt__bar i.is-low { background: var(--mi-orange); }
/* Target tick: a margin short of it reads as a bar that stops before the line. */
.mrt__bar b { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-inline-start: -1px; border-radius: 1px; background: var(--mi-label); opacity: .5; }
.mrt__pct { width: 48px; text-align: end; font-weight: 600; font-variant-numeric: tabular-nums; }
.mrt__pct.is-low { color: var(--mi-orange-t); }

.mrt__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.mrt__foot-actions { display: flex; gap: 8px; }
</style>
