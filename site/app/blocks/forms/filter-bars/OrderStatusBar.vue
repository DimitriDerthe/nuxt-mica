<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="osb-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="osb-title" variant="title3" as="h2" weight="semibold">Orders</MiText>
        <MiText variant="footnote" tone="label2">Kōbō Ceramics · {{ money(total) }} across {{ rows.length }} orders</MiText>
      </div>
      <MiSegmented v-model="range" label="Date range" :options="RANGES.map(r => ({ value: r.days, label: r.label }))" />
    </header>

    <div class="mi:grid mi:gap-3 mi:p-3.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
      <!-- Status filter: pills with live counts, and the same split drawn as a clickable strip. -->
      <div class="mi:flex mi:gap-1.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:-m-0.5 mi:p-0.5" role="group" aria-label="Status">
        <button
          v-for="s in STATUSES" :key="s.id" type="button" class="mi:group mi:inline-flex mi:items-center mi:gap-[7px] mi:flex-[none] mi:h-8 mi:py-0 mi:px-3 mi:[border:0] mi:rounded-[999px] mi:cursor-pointer mi:[font:500_13px_var(--mi-font)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.96)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :data-on="status === s.id || undefined" :class="status === s.id ? 'mi:bg-label mi:text-card' : 'mi:[background:var(--mi-fill4)] mi:text-label2'"
          :aria-pressed="status === s.id" @click="status = s.id"
        >
          <i class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%]" v-if="s.id !== 'all'" :style="{ background: s.color }" aria-hidden="true" />
          {{ s.label }}<span class="mi:tabular-nums mi:text-label3 mi:group-data-[on]:text-inherit mi:group-data-[on]:opacity-70">{{ s.id === 'all' ? pool.length : counts[s.id] ?? 0 }}</span>
        </button>
      </div>
      <div class="mi:flex mi:gap-[3px] mi:h-2" role="group" aria-label="Status distribution">
        <button
          v-for="s in STATUSES.slice(1)" v-show="counts[s.id]" :key="s.id" type="button" class="mi:basis-0 mi:min-w-2 mi:h-full mi:p-0 mi:[border:0] mi:rounded-[4px] mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[scaleY(1.5)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
          :class="status !== 'all' && status !== s.id ? 'mi:opacity-25' : ''" :style="{ flexGrow: counts[s.id] ?? 0, background: s.color }"
          :aria-label="`${s.label}: ${counts[s.id] ?? 0} orders`" @click="status = status === s.id ? 'all' : s.id"
        />
      </div>

      <div class="mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:items-center mi:pt-1 mi:border-t mi:border-t-sep mi:@[760px]:grid-cols-[minmax(200px,_1fr)_170px_auto_auto]">
        <MiSearch v-model="query" class="mi:col-span-full mi:@[760px]:col-[auto]" size="compact" placeholder="Order, customer or SKU" :cancelable="false" />
        <MiNativeSelect v-model="channel" size="sm" aria-label="Channel" :options="CHANNELS" />
        <div class="mi:flex mi:items-center mi:gap-2 mi:text-[13px] mi:text-label2 mi:whitespace-nowrap">
          <MiSwitch v-model="flagged" size="compact" aria-labelledby="osb-flag" />
          <span id="osb-flag">Flagged only</span>
        </div>
        <MiMenu v-model="sort" variant="popup" class="mi:justify-self-end" aria-label="Sort orders" :items="SORTS" />
      </div>

      <div class="mi:overflow-x-auto mi:mt-0 mi:-mx-3.5 mi:-mb-3.5">
        <table class="mi:w-full mi:min-w-165 mi:border-collapse mi:text-[13px]">
          <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)]">Orders matching the filters</caption>
          <thead>
            <tr><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-start mi:font-medium mi:text-label2 mi:border-b mi:border-b-sep mi:whitespace-nowrap">Order</th><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-start mi:font-medium mi:text-label2 mi:border-b mi:border-b-sep mi:whitespace-nowrap">Customer</th><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-start mi:font-medium mi:text-label2 mi:border-b mi:border-b-sep mi:whitespace-nowrap">Placed</th><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-start mi:font-medium mi:text-label2 mi:border-b mi:border-b-sep mi:whitespace-nowrap">Channel</th><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-end mi:font-medium mi:text-label2 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:tabular-nums">Total</th><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-start mi:font-medium mi:text-label2 mi:border-b mi:border-b-sep mi:whitespace-nowrap">Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="o in rows" :key="o.id">
              <td class="mi:py-[11px] mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:[tbody_tr:last-child_&]:[border-bottom:0] mi:font-semibold mi:tabular-nums">
                {{ o.id }}
                <MiIcon v-if="o.flag" :svg="FLAG" :size="14" label="Flagged" class="mi:[vertical-align:-2px]! mi:ml-1 mi:text-red" />
              </td>
              <td class="mi:py-[11px] mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:[tbody_tr:last-child_&]:[border-bottom:0]">{{ o.customer }}</td>
              <td class="mi:py-[11px] mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:[tbody_tr:last-child_&]:[border-bottom:0] mi:text-label2">{{ o.days === 0 ? 'Today' : o.days === 1 ? 'Yesterday' : o.days + ' days ago' }}</td>
              <td class="mi:py-[11px] mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:[tbody_tr:last-child_&]:[border-bottom:0] mi:text-label2">{{ CHANNELS.find(c => c.value === o.channel)?.label }}</td>
              <td class="mi:py-[11px] mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:text-end mi:[tbody_tr:last-child_&]:[border-bottom:0] mi:tabular-nums">{{ money(o.total) }}</td>
              <td class="mi:py-[11px] mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:[tbody_tr:last-child_&]:[border-bottom:0]"><span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%]" :style="{ background: colorOf(o.status) }" />{{ labelOf(o.status) }}</span></td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="6" class="mi:py-7 mi:px-3.5 mi:border-b mi:border-b-sep mi:whitespace-nowrap mi:[tbody_tr:last-child_&]:[border-bottom:0] mi:text-center mi:text-label2">No orders match. <button class="mi:[border:0] mi:[background:none] mi:p-0 mi:text-p-text mi:[font:inherit] mi:font-semibold mi:cursor-pointer" type="button" @click="resetAll">Reset filters</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const FLAG = '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>'
const STATUSES = [
  { id: 'all', label: 'All', color: '' },
  { id: 'unpaid', label: 'Unpaid', color: 'var(--mi-red)' },
  { id: 'unfulfilled', label: 'Unfulfilled', color: 'var(--mi-orange)' },
  { id: 'ready', label: 'Ready to ship', color: 'var(--mi-p)' },
  { id: 'shipped', label: 'Shipped', color: 'var(--mi-green)' },
  { id: 'returned', label: 'Returned', color: 'var(--mi-label3)' }
]
const RANGES = [{ days: 0, label: 'Today' }, { days: 7, label: '7 days' }, { days: 30, label: '30 days' }]
const CHANNELS = [{ value: 'all', label: 'All channels' }, { value: 'web', label: 'Online store' }, { value: 'pos', label: 'Shop counter' }, { value: 'b2b', label: 'Wholesale' }]
const SORTS = [{ value: 'new', label: 'Newest first' }, { value: 'old', label: 'Oldest first' }, { value: 'high', label: 'Highest total' }]

const ORDERS = [
  { id: '#4182', customer: 'Mei Lin', days: 0, channel: 'web', total: 184, status: 'unpaid', flag: true },
  { id: '#4181', customer: 'Tobias Krüger', days: 0, channel: 'pos', total: 62, status: 'shipped', flag: false },
  { id: '#4180', customer: 'Atelier Rousseau', days: 1, channel: 'b2b', total: 1260, status: 'unfulfilled', flag: false },
  { id: '#4179', customer: 'Grace Owusu', days: 1, channel: 'web', total: 96, status: 'ready', flag: false },
  { id: '#4178', customer: 'Lucas Ferreira', days: 2, channel: 'web', total: 248, status: 'unfulfilled', flag: true },
  { id: '#4177', customer: 'Sara Haddad', days: 3, channel: 'web', total: 74, status: 'ready', flag: false },
  { id: '#4176', customer: 'Kettle & Crumb Café', days: 4, channel: 'b2b', total: 880, status: 'shipped', flag: false },
  { id: '#4175', customer: 'Jonas Berg', days: 5, channel: 'pos', total: 38, status: 'shipped', flag: false },
  { id: '#4174', customer: 'Amelia Novak', days: 6, channel: 'web', total: 142, status: 'returned', flag: true },
  { id: '#4171', customer: 'Ren Takahashi', days: 9, channel: 'web', total: 310, status: 'shipped', flag: false },
  { id: '#4168', customer: 'Studio Halden', days: 12, channel: 'b2b', total: 2140, status: 'unpaid', flag: false },
  { id: '#4163', customer: 'Nadia Rahman', days: 16, channel: 'web', total: 58, status: 'shipped', flag: false },
  { id: '#4159', customer: 'Pablo Ortega', days: 21, channel: 'pos', total: 120, status: 'returned', flag: false },
  { id: '#4151', customer: 'Ivy Chen', days: 27, channel: 'web', total: 204, status: 'shipped', flag: false }
]

const status = ref('all')
const range = ref<string | number | null>(7)
const channel = ref<string | number | null>('all')
const flagged = ref(false)
const query = ref('')
const sort = ref<string | number | undefined>('new')

// Everything but the status: the pills and the strip count from this pool.
const pool = computed(() => {
  const q = query.value.trim().toLowerCase()
  return ORDERS.filter(o =>
    o.days <= Number(range.value ?? 30)
    && (channel.value === 'all' || o.channel === channel.value)
    && (!flagged.value || o.flag)
    && (!q || o.id.includes(q) || o.customer.toLowerCase().includes(q)))
})
const counts = computed(() => pool.value.reduce<Record<string, number>>((m, o) => ({ ...m, [o.status]: (m[o.status] ?? 0) + 1 }), {}))
const rows = computed(() => {
  const list = pool.value.filter(o => status.value === 'all' || o.status === status.value)
  const by = { new: (a: typeof ORDERS[number], b: typeof ORDERS[number]) => a.days - b.days, old: (a: typeof ORDERS[number], b: typeof ORDERS[number]) => b.days - a.days, high: (a: typeof ORDERS[number], b: typeof ORDERS[number]) => b.total - a.total }
  return [...list].sort(by[(sort.value ?? 'new') as keyof typeof by])
})
const total = computed(() => rows.value.reduce((s, o) => s + o.total, 0))

const labelOf = (id: string) => STATUSES.find(s => s.id === id)?.label ?? id
const colorOf = (id: string) => STATUSES.find(s => s.id === id)?.color ?? 'var(--mi-label3)'
const money = (n: number) => '$' + n.toLocaleString('en-US')
function resetAll() {
  status.value = 'all'
  range.value = 30
  channel.value = 'all'
  flagged.value = false
  query.value = ''
}
</script>
