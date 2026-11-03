<template>
  <section class="sod mi:@container mi:grid mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="sod-title">
    <div class="sod__in mi:relative mi:grid mi:min-w-0 mi:@[900px]:grid-cols-[244px_minmax(0,_1fr)]">
    <div class="sod__side mi:hidden mi:grid-rows-[auto_minmax(0,_1fr)] mi:gap-2 mi:py-3.5 mi:px-2.5 mi:border-b mi:border-b-sep mi:[background:var(--mi-page)] mi:[&.is-open]:grid mi:@[900px]:grid mi:@[900px]:content-start mi:@[900px]:[border-bottom:0] mi:@[900px]:border-r mi:@[900px]:border-r-sep mi:@[900px]:[&.is-open]:grid mi:@[900px]:[&.is-open]:content-start mi:@[900px]:[&.is-open]:[border-bottom:0] mi:@[900px]:[&.is-open]:border-r mi:@[900px]:[&.is-open]:border-r-sep" :class="{ 'is-open': navOpen }">
      <div class="sod__brand mi:flex mi:items-center mi:gap-2.5 mi:pt-1 mi:px-2 mi:pb-2">
        <span class="sod__mark mi:w-7 mi:h-7 mi:rounded-[9px] mi:flex-[none] mi:[background:radial-gradient(circle_at_35%_30%,_var(--mi-s)_0_22%,_transparent_23%),_linear-gradient(140deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_50%,_var(--mi-s)))]" aria-hidden="true" />
        <div>
          <MiText as="span" variant="subheadline" weight="bold">Fernhouse</MiText>
          <MiText variant="caption2" tone="label2">Studio back office</MiText>
        </div>
      </div>
      <MiSidebar v-model="page" :groups="nav" aria-label="Back office" footer-label="Help and shortcuts" class="sod__nav" @select="navOpen = false" />
    </div>

    <div class="sod__main mi:grid mi:content-start mi:min-w-0">
      <header class="sod__top mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep mi:[background:var(--mi-card)]">
        <MiIconButton class="sod__menu" label="Toggle navigation" variant="gray" size="regular" :pressed="navOpen" @click="navOpen = !navOpen">
          <MiIcon name="sidebar" :size="18" />
        </MiIconButton>
        <div class="sod__title mi:flex-[1_1_180px] mi:min-w-0">
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

      <div class="sod__content mi:grid mi:gap-3.5 mi:p-4 mi:@[760px]:p-5 mi:@[760px]:gap-4">
        <div class="sod__kpis mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2.5 mi:@[440px]:grid-cols-2 mi:@[760px]:grid-cols-4 mi:@[900px]:grid-cols-2 mi:@[1140px]:grid-cols-4">
          <MiStatTile v-for="k in kpis" :key="k.label" v-bind="k" :comparison="range === '7d' ? 'vs last week' : 'vs last month'" />
        </div>

        <div class="sod__row mi:grid mi:gap-3.5 mi:@[900px]:grid-cols-[minmax(0,_1.8fr)_minmax(0,_1fr)]">
          <div class="sod__chart mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
            <div class="sod__chart-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
              <div>
                <MiText as="h3" variant="headline" weight="semibold">Net sales</MiText>
                <MiText variant="caption" tone="label2">Online shop and studio counter, in € thousands</MiText>
              </div>
              <MiSegmented v-model="range" label="Range" :options="[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]" />
            </div>
            <MiLineChart :key="String(range)" :categories="series.categories" :series="series.lines" unit="k" :height="200" :card="false" :end-labels="false" />
          </div>

          <aside class="sod__stock mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0" aria-labelledby="sod-stock">
            <div class="sod__stock-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
              <MiText class="mi:[.sod__stock_ul&]:p-0 mi:[.sod__stock_ul&]:[list-style:none]" id="sod-stock" as="h3" variant="headline" weight="semibold">Running low</MiText>
              <MiTextLink class="mi:[.sod__stock_ul&]:p-0 mi:[.sod__stock_ul&]:[list-style:none]" href="#">Restock</MiTextLink>
            </div>
            <ul class="mi:[.sod__stock_ul&]:p-0 mi:[.sod__stock_ul&]:[list-style:none]">
              <li v-for="s in stock" :key="s.name">
                <MiMeter class="mi:[.sod__stock_ul&]:p-0 mi:[.sod__stock_ul&]:[list-style:none]" :value="s.left" :max="s.par" :label="s.name" :caption="`${s.left} left`" :hint="s.note" size="sm" :color="s.left / s.par < 0.25 ? 'var(--mi-red)' : 'var(--mi-orange)'" />
              </li>
            </ul>
          </aside>
        </div>

        <div class="sod__orders mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
          <div class="sod__orders-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
            <MiText as="h3" variant="headline" weight="semibold">Latest orders</MiText>
            <MiText variant="caption" tone="label2">{{ filtered.length }} of {{ orders.length }}</MiText>
          </div>
          <div class="sod__table mi:min-w-0">
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
.sod__nav { width: auto; min-height: 0; }
.sod__search { flex: 1 1 100%; order: 5; }
.sod__me { flex: none; }
/* The last hover column of the chart reaches past the plot; keep it inside the card. */
.sod__chart :deep(.mi-lc-svg) { overflow: hidden; }
.sod__stock ul { display: grid; gap: 14px; margin: 0; }
/* MiTable scrolls on its own; forcing it wider than this wrapper would cut its rounded edge. */
.sod__table :deep(table) { min-width: 560px; }
@container (min-width: 640px) {
  .sod__search { flex: 0 1 220px; order: 0; }
}
@container (min-width: 900px) {
  .sod__menu { display: none; }
}
</style>
