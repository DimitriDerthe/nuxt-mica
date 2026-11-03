<template>
  <section class="stk" aria-labelledby="stk-title">
    <header class="stk__head">
      <div>
        <MiText id="stk-title" variant="title3" as="h2" weight="semibold">Products</MiText>
        <MiText variant="footnote" tone="label2">Halden Outdoor store · {{ atRisk }} products will sell out before a restock lands</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Product or SKU" aria-label="Search products" class="stk__search" />
    </header>

    <div class="stk__toolbar">
      <MiSegmented v-model="view" label="Show" :options="views" />
      <p class="stk__legend">
        <span class="stk__legend-bar" aria-hidden="true"><i /></span><MiText as="span" variant="caption" tone="label2">Days of stock</MiText>
        <span class="stk__legend-tick" aria-hidden="true" /><MiText as="span" variant="caption" tone="label2">Supplier lead time</MiText>
      </p>
    </div>

    <div class="stk__table">
      <MiTable :columns="columns" :rows="rows" caption="Products" density="relaxed" :zebra="false" empty-text="No product matches.">
        <template #cell-name="{ row }">
          <span class="stk__prod">
            <span class="stk__thumb" :style="{ '--a': p(row).colors[0], '--b': p(row).colors[1] ?? p(row).colors[0] }" aria-hidden="true" />
            <span class="stk__prod-text">
              <span class="stk__name">{{ p(row).name }}</span>
              <span class="stk__sku">{{ p(row).sku }}</span>
            </span>
          </span>
        </template>
        <template #cell-colors="{ row }">
          <span class="stk__dots" role="img" :aria-label="p(row).colors.length + ' colors'">
            <i v-for="c in p(row).colors" :key="c" :style="{ background: c }" />
          </span>
        </template>
        <template #cell-price="{ row }"><span class="stk__num">${{ p(row).price }}</span></template>
        <template #cell-stock="{ row }"><span class="stk__num" :class="{ 'is-zero': !p(row).stock }">{{ p(row).stock }}</span></template>
        <template #cell-cover="{ row }">
          <span class="stk__cover">
            <span class="stk__track" role="meter" :aria-label="p(row).name + ' days of stock'" aria-valuemin="0" :aria-valuemax="CAP" :aria-valuenow="Math.min(CAP, p(row).cover)">
              <i :class="'is-' + p(row).risk" :style="{ transform: `scaleX(${Math.min(1, p(row).cover / CAP)})` }" />
              <b :style="{ insetInlineStart: (p(row).lead / CAP) * 100 + '%' }" />
            </span>
            <span class="stk__cover-text" :class="'is-' + p(row).risk">{{ coverLabel(p(row)) }}</span>
          </span>
        </template>
        <template #cell-action="{ row }">
          <MiButton
            v-if="p(row).risk !== 'ok' && p(row).status === 'active'" size="mini" :variant="ordered.has(p(row).id) ? 'plain' : 'tinted'"
            :disabled="ordered.has(p(row).id)" @click="reorder(p(row).id)"
          >{{ ordered.has(p(row).id) ? 'PO sent' : 'Reorder' }}</MiButton>
          <MiSwitch
            v-else size="compact" :model-value="p(row).status === 'active'" :label="(p(row).status === 'active' ? 'Unlist ' : 'List ') + p(row).name"
            @update:model-value="setListed(p(row).id, $event)"
          />
        </template>
      </MiTable>
    </div>

    <ul class="stk__cards">
      <li v-for="x in rows" :key="x.id" class="stk__card">
        <span class="stk__thumb stk__thumb--lg" :style="{ '--a': x.colors[0], '--b': x.colors[1] ?? x.colors[0] }" aria-hidden="true" />
        <div class="stk__card-body">
          <div class="stk__card-top">
            <span class="stk__prod-text"><span class="stk__name">{{ x.name }}</span><span class="stk__sku">{{ x.sku }} · ${{ x.price }}</span></span>
            <MiBadge v-if="x.status === 'draft'" tone="neutral" label="Draft" />
          </div>
          <span class="stk__track" aria-hidden="true">
            <i :class="'is-' + x.risk" :style="{ transform: `scaleX(${Math.min(1, x.cover / CAP)})` }" />
            <b :style="{ insetInlineStart: (x.lead / CAP) * 100 + '%' }" />
          </span>
          <div class="stk__card-foot">
            <span class="stk__cover-text" :class="'is-' + x.risk">{{ x.stock }} in stock · {{ coverLabel(x) }}</span>
            <MiButton
              v-if="x.risk !== 'ok' && x.status === 'active'" size="mini" :variant="ordered.has(x.id) ? 'plain' : 'tinted'"
              :disabled="ordered.has(x.id)" @click="reorder(x.id)"
            >{{ ordered.has(x.id) ? 'PO sent' : 'Reorder' }}</MiButton>
          </div>
        </div>
      </li>
      <li v-if="!rows.length" class="stk__none"><MiText variant="footnote" tone="label2">No product matches.</MiText></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Product { id: string, name: string, sku: string, price: number, stock: number, daily: number, lead: number, status: 'active' | 'draft', colors: string[] }

// Cover is capped at 90 days on the bar; `daily` is average units sold per day over 30 days.
const CAP = 90
const products = reactive<Product[]>([
  { id: 'p1', name: 'Fjell 2P tent', sku: 'HO-TN-2P', price: 389, stock: 46, daily: 2.1, lead: 28, status: 'active', colors: ['var(--mi-green)', 'var(--mi-orange)'] },
  { id: 'p2', name: 'Bergen down jacket', sku: 'HO-JK-BRG', price: 279, stock: 312, daily: 6.4, lead: 35, status: 'active', colors: ['var(--mi-indigo)', 'var(--mi-red)', 'var(--mi-label)'] },
  { id: 'p3', name: 'Trail 28L pack', sku: 'HO-PK-28', price: 149, stock: 18, daily: 1.9, lead: 21, status: 'active', colors: ['var(--mi-teal)', 'var(--mi-label2)'] },
  { id: 'p4', name: 'Merino base layer', sku: 'HO-BL-MER', price: 89, stock: 640, daily: 11, lead: 30, status: 'active', colors: ['var(--mi-label2)', 'var(--mi-blue)', 'var(--mi-pink)'] },
  { id: 'p5', name: 'Ridge trekking poles', sku: 'HO-TP-RDG', price: 119, stock: 0, daily: 1.2, lead: 14, status: 'active', colors: ['var(--mi-label)'] },
  { id: 'p6', name: 'Lumen headlamp', sku: 'HO-HL-LMN', price: 49, stock: 205, daily: 3.3, lead: 45, status: 'active', colors: ['var(--mi-yellow)', 'var(--mi-label)'] },
  { id: 'p7', name: 'Kelp dry bag 20L', sku: 'HO-DB-20', price: 39, stock: 120, daily: 0, lead: 20, status: 'draft', colors: ['var(--mi-mint)', 'var(--mi-orange)'] }
])

const cover = (x: Product) => (x.daily ? Math.floor(x.stock / x.daily) : x.stock ? CAP * 2 : 0)
const enriched = computed(() => products.map((x) => {
  const c = cover(x)
  const risk = x.status === 'draft' ? 'ok' : c === 0 ? 'out' : c < x.lead ? 'risk' : 'ok'
  return { ...x, cover: c, risk }
}))
type Row = typeof enriched.value[number]
const p = (row: Record<string, unknown>) => row as unknown as Row

const coverLabel = (x: Row) => {
  if (x.status === 'draft') return 'Not on sale'
  if (x.risk === 'out') return 'Sold out'
  const days = x.cover > CAP ? `${CAP}+ days` : `${x.cover} days`
  return x.risk === 'risk' ? `${days}, restock takes ${x.lead}` : days
}

const views = [{ value: 'all', label: 'All' }, { value: 'risk', label: 'Running low' }, { value: 'draft', label: 'Drafts' }]
const view = ref<string | number | null>('all')
const query = ref('')

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return enriched.value.filter(x => (view.value === 'all' || (view.value === 'risk' ? x.risk !== 'ok' : x.status === 'draft'))
    && (!q || x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q)))
})
const atRisk = computed(() => enriched.value.filter(x => x.risk !== 'ok').length)

const columns = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'colors', label: 'Colors', width: '84px' },
  { key: 'price', label: 'Price', sortable: true, align: 'end' as const, numeric: true, width: '80px' },
  { key: 'stock', label: 'Stock', sortable: true, align: 'end' as const, numeric: true, width: '72px' },
  { key: 'cover', label: 'Cover', sortable: true, width: '220px' },
  { key: 'action', label: '', align: 'end' as const, width: '100px' }
]

const ordered = ref(new Set<string>())
const reorder = (id: string) => { ordered.value = new Set(ordered.value).add(id) }
const setListed = (id: string, on: boolean) => {
  const x = products.find(y => y.id === id)
  if (x) x.status = on ? 'active' : 'draft'
}
</script>

<style scoped>
.stk { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.stk__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.stk__search { flex: 0 1 260px; min-width: 0; }
.stk__toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; }
.stk__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; }
.stk__legend-bar { width: 22px; height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.stk__legend-bar i { display: block; width: 60%; height: 100%; background: var(--mi-green); }
.stk__legend-tick { width: 2px; height: 12px; margin-inline-start: 6px; border-radius: 1px; background: var(--mi-label); }

.stk__table { display: none; min-width: 0; overflow-x: auto; }
.stk__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 760px) { .stk__table { display: block; } .stk__cards { display: none; } }

.stk__prod { display: flex; align-items: center; gap: 10px; min-width: 0; }
/* Product art: a two-tone fabric swatch from the product's own colors. */
.stk__thumb {
  flex: none; width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--a) 85%, var(--mi-card)) 0 50%, color-mix(in srgb, var(--b) 75%, var(--mi-card)) 50% 100%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-label) 10%, transparent);
}
.stk__thumb--lg { width: 48px; height: 48px; border-radius: 12px; }
.stk__prod-text { display: grid; min-width: 0; }
.stk__name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stk__sku { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; color: var(--mi-label2); }
.stk__dots { display: inline-flex; gap: 4px; }
.stk__dots i { width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 1.5px var(--mi-card), 0 0 0 2.5px var(--mi-sep); }
.stk__num { font-variant-numeric: tabular-nums; font-weight: 500; }
.stk__num.is-zero { color: var(--mi-red-t); font-weight: 650; }

.stk__cover { display: grid; gap: 4px; }
.stk__track { position: relative; display: block; height: 6px; border-radius: 3px; background: var(--mi-fill3); }
.stk__track i { position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.stk__track i.is-ok { background: var(--mi-green); }
.stk__track i.is-risk { background: var(--mi-orange); }
.stk__track i.is-out { background: var(--mi-red); }
.stk__track b { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-inline-start: -1px; border-radius: 1px; background: var(--mi-label); box-shadow: 0 0 0 2px var(--mi-card); }
.stk__cover-text { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.stk__cover-text.is-risk { color: var(--mi-orange-t); font-weight: 600; }
.stk__cover-text.is-out { color: var(--mi-red-t); font-weight: 600; }

.stk__card { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.stk__card-body { display: grid; gap: 10px; min-width: 0; }
.stk__card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.stk__card-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; }
.stk__none { padding: 20px; text-align: center; }
</style>
