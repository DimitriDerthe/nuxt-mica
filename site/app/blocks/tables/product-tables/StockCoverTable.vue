<template>
  <section class="stk mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="stk-title">
    <header class="stk__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="stk-title" variant="title3" as="h2" weight="semibold">Products</MiText>
        <MiText variant="footnote" tone="label2">Halden Outdoor store · {{ atRisk }} products will sell out before a restock lands</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Product or SKU" aria-label="Search products" class="stk__search" />
    </header>

    <div class="stk__toolbar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4">
      <MiSegmented v-model="view" label="Show" :options="views" />
      <p class="stk__legend mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:m-0">
        <span class="stk__legend-bar mi:w-5.5 mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" aria-hidden="true"><i class="mi:[.stk__legend-bar_&]:block mi:[.stk__legend-bar_&]:[background:var(--mi-green)]" /></span><MiText as="span" variant="caption" tone="label2">Days of stock</MiText>
        <span class="stk__legend-tick mi:w-0.5 mi:h-3 mi:ms-1.5 mi:rounded-[1px] mi:[background:var(--mi-label)]" aria-hidden="true" /><MiText as="span" variant="caption" tone="label2">Supplier lead time</MiText>
      </p>
    </div>

    <div class="stk__table mi:hidden mi:min-w-0 mi:overflow-x-auto mi:@[760px]:block">
      <MiTable :columns="columns" :rows="rows" caption="Products" density="relaxed" :zebra="false" empty-text="No product matches.">
        <template #cell-name="{ row }">
          <span class="stk__prod mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
            <span class="stk__thumb mi:flex-[none] mi:rounded-[10px] mi:[background:linear-gradient(135deg,_color-mix(in_srgb,_var(--a)_85%,_var(--mi-card))_0_50%,_color-mix(in_srgb,_var(--b)_75%,_var(--mi-card))_50%_100%)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-label)_10%,_transparent)]" :style="{ '--a': p(row).colors[0], '--b': p(row).colors[1] ?? p(row).colors[0] }" aria-hidden="true" />
            <span class="stk__prod-text mi:grid mi:min-w-0">
              <span class="stk__name mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ p(row).name }}</span>
              <span class="stk__sku mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[11.5px] mi:text-label2">{{ p(row).sku }}</span>
            </span>
          </span>
        </template>
        <template #cell-colors="{ row }">
          <span class="stk__dots mi:inline-flex mi:gap-1" role="img" :aria-label="p(row).colors.length + ' colors'">
            <i class="mi:[.stk__dots_&]:rounded-[50%] mi:[.stk__dots_&]:shadow-[0_0_0_1.5px_var(--mi-card),_0_0_0_2.5px_var(--mi-sep)]" v-for="c in p(row).colors" :key="c" :style="{ background: c }" />
          </span>
        </template>
        <template #cell-price="{ row }"><span class="stk__num mi:tabular-nums mi:font-medium mi:[&.is-zero]:text-red-t mi:[&.is-zero]:font-650">${{ p(row).price }}</span></template>
        <template #cell-stock="{ row }"><span class="stk__num mi:tabular-nums mi:font-medium mi:[&.is-zero]:text-red-t mi:[&.is-zero]:font-650" :class="{ 'is-zero': !p(row).stock }">{{ p(row).stock }}</span></template>
        <template #cell-cover="{ row }">
          <span class="stk__cover mi:grid mi:gap-1">
            <span class="stk__track mi:relative mi:block mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)]" role="meter" :aria-label="p(row).name + ' days of stock'" aria-valuemin="0" :aria-valuemax="CAP" :aria-valuenow="Math.min(CAP, p(row).cover)">
              <i class="mi:[.stk__track_&]:inset-0 mi:[.stk__track_&]:origin-left mi:[.stk__track_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="'is-' + p(row).risk" :style="{ transform: `scaleX(${Math.min(1, p(row).cover / CAP)})` }" />
              <b class="mi:[.stk__track_&]:-top-1 mi:[.stk__track_&]:-bottom-1 mi:[.stk__track_&]:-ms-px mi:[.stk__track_&]:[background:var(--mi-label)] mi:[.stk__track_&]:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ insetInlineStart: (p(row).lead / CAP) * 100 + '%' }" />
            </span>
            <span class="stk__cover-text mi:text-[12px] mi:text-label2 mi:tabular-nums" :class="'is-' + p(row).risk">{{ coverLabel(p(row)) }}</span>
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

    <ul class="stk__cards mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[760px]:hidden">
      <li v-for="x in rows" :key="x.id" class="stk__card mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-3 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <span class="stk__thumb stk__thumb--lg mi:flex-[none] mi:rounded-[10px] mi:[background:linear-gradient(135deg,_color-mix(in_srgb,_var(--a)_85%,_var(--mi-card))_0_50%,_color-mix(in_srgb,_var(--b)_75%,_var(--mi-card))_50%_100%)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-label)_10%,_transparent)] mi:rounded-[12px]" :style="{ '--a': x.colors[0], '--b': x.colors[1] ?? x.colors[0] }" aria-hidden="true" />
        <div class="stk__card-body mi:grid mi:gap-2.5 mi:min-w-0">
          <div class="stk__card-top mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2">
            <span class="stk__prod-text mi:grid mi:min-w-0"><span class="stk__name mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ x.name }}</span><span class="stk__sku mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[11.5px] mi:text-label2">{{ x.sku }} · ${{ x.price }}</span></span>
            <MiBadge v-if="x.status === 'draft'" tone="neutral" label="Draft" />
          </div>
          <span class="stk__track mi:relative mi:block mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)]" aria-hidden="true">
            <i class="mi:[.stk__track_&]:inset-0 mi:[.stk__track_&]:origin-left mi:[.stk__track_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="'is-' + x.risk" :style="{ transform: `scaleX(${Math.min(1, x.cover / CAP)})` }" />
            <b class="mi:[.stk__track_&]:-top-1 mi:[.stk__track_&]:-bottom-1 mi:[.stk__track_&]:-ms-px mi:[.stk__track_&]:[background:var(--mi-label)] mi:[.stk__track_&]:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ insetInlineStart: (x.lead / CAP) * 100 + '%' }" />
          </span>
          <div class="stk__card-foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-2.5">
            <span class="stk__cover-text mi:text-[12px] mi:text-label2 mi:tabular-nums" :class="'is-' + x.risk">{{ x.stock }} in stock · {{ coverLabel(x) }}</span>
            <MiButton
              v-if="x.risk !== 'ok' && x.status === 'active'" size="mini" :variant="ordered.has(x.id) ? 'plain' : 'tinted'"
              :disabled="ordered.has(x.id)" @click="reorder(x.id)"
            >{{ ordered.has(x.id) ? 'PO sent' : 'Reorder' }}</MiButton>
          </div>
        </div>
      </li>
      <li v-if="!rows.length" class="stk__none mi:p-5 mi:text-center"><MiText variant="footnote" tone="label2">No product matches.</MiText></li>
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
.stk__search { flex: 0 1 260px; min-width: 0; }
.stk__legend-bar i { width: 60%; height: 100%; }
/* Product art: a two-tone fabric swatch from the product's own colors. */
.stk__thumb { width: 36px; height: 36px;
}
.stk__thumb--lg { width: 48px; height: 48px; }
.stk__dots i { width: 12px; height: 12px; }
.stk__track i { position: absolute; border-radius: inherit; }
.stk__track i.is-ok { background: var(--mi-green); }
.stk__track i.is-risk { background: var(--mi-orange); }
.stk__track i.is-out { background: var(--mi-red); }
.stk__track b { position: absolute; width: 2px; border-radius: 1px; }
.stk__cover-text.is-risk { color: var(--mi-orange-t); font-weight: 600; }
.stk__cover-text.is-out { color: var(--mi-red-t); font-weight: 600; }
</style>
