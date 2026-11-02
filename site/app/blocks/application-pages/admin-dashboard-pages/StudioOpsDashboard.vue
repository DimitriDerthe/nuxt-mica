<template>
  <section class="sod" aria-labelledby="sod-title">
    <div class="sod__in">
    <div class="sod__side" :class="{ 'is-open': navOpen }">
      <div class="sod__brand">
        <span class="sod__mark" aria-hidden="true" />
        <div>
          <MiText as="span" variant="subheadline" weight="bold">Fernhouse</MiText>
          <MiText variant="caption2" tone="label2">Studio back office</MiText>
        </div>
      </div>
      <MiSidebar v-model="page" :groups="nav" aria-label="Back office" footer-label="Help and shortcuts" class="sod__nav" @select="navOpen = false" />
    </div>

    <div class="sod__main">
      <header class="sod__top">
        <MiIconButton class="sod__menu" label="Toggle navigation" variant="gray" size="regular" :pressed="navOpen" @click="navOpen = !navOpen">
          <MiIcon name="sidebar" :size="18" />
        </MiIconButton>
        <div class="sod__title">
          <MiText id="sod-title" as="h2" variant="title3" weight="bold">Good afternoon, Odile</MiText>
          <MiText variant="caption" tone="label2">Kiln 2 firing ends 17:40 · 9 orders to pack today</MiText>
        </div>
        <MiSearch v-model="query" size="compact" placeholder="Search orders" shortcut="⌘K" hotkey="k" class="sod__search" :cancelable="false" />
        <MiBadge :count="3" count-noun="new alerts">
          <template #target>
            <MiIconButton label="Notifications" variant="gray" size="regular"><MiIcon name="bell" :size="18" /></MiIconButton>
          </template>
        </MiBadge>
        <MiAvatar name="Odile Ferrand" size="sm" tone="auto" class="sod__me" />
      </header>

      <div class="sod__content">
        <div class="sod__kpis">
          <MiStatTile v-for="k in kpis" :key="k.label" v-bind="k" :comparison="range === '7d' ? 'vs last week' : 'vs last month'" />
        </div>

        <div class="sod__row">
          <div class="sod__chart">
            <div class="sod__chart-head">
              <div>
                <MiText as="h3" variant="headline" weight="semibold">Net sales</MiText>
                <MiText variant="caption" tone="label2">Online shop and studio counter, in € thousands</MiText>
              </div>
              <MiSegmented v-model="range" label="Range" :options="[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]" />
            </div>
            <MiLineChart :key="String(range)" :categories="series.categories" :series="series.lines" unit="k" :height="200" :card="false" :end-labels="false" />
          </div>

          <aside class="sod__stock" aria-labelledby="sod-stock">
            <div class="sod__stock-head">
              <MiText id="sod-stock" as="h3" variant="headline" weight="semibold">Running low</MiText>
              <MiTextLink href="#">Restock</MiTextLink>
            </div>
            <ul>
              <li v-for="s in stock" :key="s.name">
                <MiMeter :value="s.left" :max="s.par" :label="s.name" :caption="`${s.left} left`" :hint="s.note" size="sm" :color="s.left / s.par < 0.25 ? 'var(--mi-red)' : 'var(--mi-orange)'" />
              </li>
            </ul>
          </aside>
        </div>

        <div class="sod__orders">
          <div class="sod__orders-head">
            <MiText as="h3" variant="headline" weight="semibold">Latest orders</MiText>
            <MiText variant="caption" tone="label2">{{ filtered.length }} of {{ orders.length }}</MiText>
          </div>
          <div class="sod__table">
            <MiTable :columns="columns" :rows="filtered" density="regular" caption="Latest orders" empty-text="No order matches that search">
              <template #cell="{ column, value }">
                <MiBadge v-if="column.key === 'status'" :tone="statusTone[String(value)] ?? 'neutral'" :label="String(value)" />
                <span v-else>{{ value }}</span>
              </template>
            </MiTable>
          </div>
        </div>
      </div>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const nav = [
  { items: [
    { id: 'overview', label: 'Overview', icon: 'home' as const },
    { id: 'orders', label: 'Orders', icon: 'inbox' as const, badge: 9 },
    { id: 'products', label: 'Products', icon: 'grid' as const },
    { id: 'customers', label: 'Customers', icon: 'people' as const },
    { id: 'payouts', label: 'Payouts', icon: 'billing' as const }
  ] },
  { id: 'studio', label: 'Studio', collapsible: true, items: [
    { id: 'kilns', label: 'Kiln schedule', icon: 'calendar' as const },
    { id: 'glazes', label: 'Glaze recipes', icon: 'document' as const },
    { id: 'settings', label: 'Settings', icon: 'settings' as const }
  ] }
]
const page = ref<string | undefined>('overview')
const navOpen = ref(false)
const query = ref('')
const range = ref<string | number | null>('7d')

const data = {
  '7d': {
    kpis: [
      { label: 'Net sales', value: '€18.6k', delta: '9.4%', spark: [2.1, 2.4, 2.2, 2.9, 3.1, 2.6, 3.3] },
      { label: 'Orders', value: '214', delta: '6.1%', spark: [24, 28, 27, 33, 36, 30, 36] },
      { label: 'Avg. basket', value: '€86.9', delta: '3.1%', spark: [84, 85, 83, 87, 86, 88, 87] },
      { label: 'Breakage returns', value: '1.4%', delta: '0.3 pt', trend: 'down' as const, tone: 'good' as const, spark: [2.1, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4] }
    ],
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    lines: [{ name: 'This week', data: [2.1, 2.4, 2.2, 2.9, 3.1, 2.6, 3.3] }, { name: 'Last week', data: [1.9, 2.0, 2.3, 2.4, 2.6, 2.5, 2.8], area: false }]
  },
  '30d': {
    kpis: [
      { label: 'Net sales', value: '€71.2k', delta: '12.8%', spark: [14, 16, 17, 18, 19, 18, 21] },
      { label: 'Orders', value: '826', delta: '8.7%', spark: [170, 180, 192, 201, 214, 206, 226] },
      { label: 'Avg. basket', value: '€86.2', delta: '1.2%', trend: 'down' as const, tone: 'bad' as const, spark: [88, 88, 87, 87, 86, 86, 86] },
      { label: 'Breakage returns', value: '1.6%', delta: '0.5 pt', trend: 'down' as const, tone: 'good' as const, spark: [2.4, 2.2, 2.0, 1.9, 1.8, 1.7, 1.6] }
    ],
    categories: ['W1', 'W2', 'W3', 'W4', 'W5'],
    lines: [{ name: 'This month', data: [14.2, 15.8, 17.1, 18.6, 5.5] }, { name: 'Last month', data: [13.1, 14.0, 15.2, 15.9, 4.9], area: false }]
  }
}
const current = computed(() => data[(range.value ?? '7d') as keyof typeof data])
const kpis = computed(() => current.value.kpis)
const series = computed(() => ({ categories: current.value.categories, lines: current.value.lines }))

const stock = [
  { name: 'Speckled clay, 10 kg', left: 3, par: 20, note: 'Lasts ~4 days' },
  { name: 'Celadon glaze', left: 6, par: 18, note: 'Reorder Fri' },
  { name: 'Gift boxes, medium', left: 41, par: 120, note: 'Lasts ~2 weeks' }
]

const columns = [
  { key: 'id', label: 'Order', width: '96px' },
  { key: 'customer', label: 'Customer' },
  { key: 'items', label: 'Items', muted: true },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total', align: 'end' as const, numeric: true, sortable: true, sortBy: (r: Record<string, unknown>) => Number(String(r.total).replace(/[^\d.]/g, '')) }
]
const orders = [
  { id: 'FH-20431', customer: 'Camille Moreau', items: 'Tidal bowl, 2 cups', status: 'To pack', total: '€140.00' },
  { id: 'FH-20430', customer: 'Jonas Becker', items: 'Ash plates ×6', status: 'Shipped', total: '€132.00' },
  { id: 'FH-20429', customer: 'Priya Natarajan', items: 'Bud vase, moss', status: 'To pack', total: '€38.00' },
  { id: 'FH-20428', customer: 'Lucía Ortega', items: 'Espresso set', status: 'Refunded', total: '€54.00' },
  { id: 'FH-20427', customer: 'Henrik Dahl', items: 'Serving platter', status: 'Delivered', total: '€112.00' }
]
const statusTone: Record<string, 'primary' | 'success' | 'warning' | 'neutral'> = { 'To pack': 'warning', Shipped: 'primary', Delivered: 'success', Refunded: 'neutral' }
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? orders.filter(o => Object.values(o).some(v => v.toLowerCase().includes(q))) : orders
})
</script>

<style scoped>
.sod { container-type: inline-size; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.sod__in { position: relative; display: grid; min-width: 0; }

/* Narrow: the sidebar is an in-flow panel toggled from the header, so nothing overlaps. */
.sod__side { display: none; grid-template-rows: auto minmax(0, 1fr); gap: 8px; padding: 14px 10px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-page); }
.sod__side.is-open { display: grid; }
.sod__brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 8px; }
.sod__mark { width: 28px; height: 28px; border-radius: 9px; flex: none; background: radial-gradient(circle at 35% 30%, var(--mi-s) 0 22%, transparent 23%), linear-gradient(140deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 50%, var(--mi-s))); }
.sod__nav { width: auto; min-height: 0; }

.sod__main { display: grid; align-content: start; min-width: 0; }
.sod__top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.sod__title { flex: 1 1 180px; min-width: 0; }
.sod__search { flex: 1 1 100%; order: 5; }
.sod__me { flex: none; }
.sod__content { display: grid; gap: 14px; padding: 16px; }

.sod__kpis { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
.sod__row { display: grid; gap: 14px; }
.sod__chart, .sod__stock, .sod__orders { display: grid; align-content: start; gap: 12px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
/* The last hover column of the chart reaches past the plot; keep it inside the card. */
.sod__chart :deep(.mi-lc-svg) { overflow: hidden; }
.sod__chart-head, .sod__stock-head, .sod__orders-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.sod__stock ul { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.sod__table { min-width: 0; }
/* MiTable scrolls on its own; forcing it wider than this wrapper would cut its rounded edge. */
.sod__table :deep(table) { min-width: 560px; }

@container (min-width: 440px) {
  .sod__kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (min-width: 640px) {
  .sod__search { flex: 0 1 220px; order: 0; }
}
@container (min-width: 760px) {
  .sod__kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .sod__content { padding: 20px; gap: 16px; }
}
@container (min-width: 900px) {
  .sod__kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sod__in { grid-template-columns: 244px minmax(0, 1fr); }
  .sod__side, .sod__side.is-open { display: grid; align-content: start; border-bottom: 0; border-right: 1px solid var(--mi-sep); }
  .sod__menu { display: none; }
  .sod__row { grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr); }
}
@container (min-width: 1140px) { .sod__kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
</style>
