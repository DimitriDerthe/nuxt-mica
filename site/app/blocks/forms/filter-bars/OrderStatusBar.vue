<template>
  <section class="osb" aria-labelledby="osb-title">
    <header class="osb__head">
      <div>
        <MiText id="osb-title" variant="title3" as="h2" weight="semibold">Orders</MiText>
        <MiText variant="footnote" tone="label2">Kōbō Ceramics · {{ money(total) }} across {{ rows.length }} orders</MiText>
      </div>
      <MiSegmented v-model="range" label="Date range" :options="RANGES.map(r => ({ value: r.days, label: r.label }))" />
    </header>

    <div class="osb__card">
      <!-- Status filter: pills with live counts, and the same split drawn as a clickable strip. -->
      <div class="osb__pills" role="group" aria-label="Status">
        <button
          v-for="s in STATUSES" :key="s.id" type="button" class="osb__pill" :class="{ 'is-on': status === s.id }"
          :aria-pressed="status === s.id" @click="status = s.id"
        >
          <i v-if="s.id !== 'all'" :style="{ background: s.color }" aria-hidden="true" />
          {{ s.label }}<span>{{ s.id === 'all' ? pool.length : counts[s.id] ?? 0 }}</span>
        </button>
      </div>
      <div class="osb__strip" role="group" aria-label="Status distribution">
        <button
          v-for="s in STATUSES.slice(1)" v-show="counts[s.id]" :key="s.id" type="button" class="osb__seg"
          :class="{ 'is-dim': status !== 'all' && status !== s.id }" :style="{ flexGrow: counts[s.id] ?? 0, background: s.color }"
          :aria-label="`${s.label}: ${counts[s.id] ?? 0} orders`" @click="status = status === s.id ? 'all' : s.id"
        />
      </div>

      <div class="osb__tools">
        <MiSearch v-model="query" class="osb__search" size="compact" placeholder="Order, customer or SKU" :cancelable="false" />
        <MiNativeSelect v-model="channel" class="osb__channel" size="sm" aria-label="Channel" :options="CHANNELS" />
        <div class="osb__flag">
          <MiSwitch v-model="flagged" size="compact" aria-labelledby="osb-flag" />
          <span id="osb-flag">Flagged only</span>
        </div>
        <MiMenu v-model="sort" variant="popup" class="osb__sort" aria-label="Sort orders" :items="SORTS" />
      </div>

      <div class="osb__scroll">
        <table class="osb__table">
          <caption class="osb__sr">Orders matching the filters</caption>
          <thead>
            <tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">Channel</th><th scope="col" class="is-num">Total</th><th scope="col">Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="o in rows" :key="o.id">
              <td class="osb__id">
                {{ o.id }}
                <MiIcon v-if="o.flag" :svg="FLAG" :size="14" label="Flagged" class="osb__flag-icon" />
              </td>
              <td>{{ o.customer }}</td>
              <td class="osb__muted">{{ o.days === 0 ? 'Today' : o.days === 1 ? 'Yesterday' : o.days + ' days ago' }}</td>
              <td class="osb__muted">{{ CHANNELS.find(c => c.value === o.channel)?.label }}</td>
              <td class="is-num">{{ money(o.total) }}</td>
              <td><span class="osb__status"><i :style="{ background: colorOf(o.status) }" />{{ labelOf(o.status) }}</span></td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="6" class="osb__empty">No orders match. <button type="button" @click="resetAll">Reset filters</button></td>
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

<style scoped>
.osb { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.osb__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.osb__card { display: grid; gap: 12px; padding: 14px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }

.osb__pills { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: -2px; padding: 2px; }
.osb__pill {
  display: inline-flex; align-items: center; gap: 7px; flex: none; height: 32px; padding: 0 12px; border: 0; border-radius: 999px; cursor: pointer;
  background: var(--mi-fill4); color: var(--mi-label2); font: 500 13px var(--mi-font); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.osb__pill:active { transform: scale(.96); }
.osb__pill:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.osb__pill i { width: 7px; height: 7px; border-radius: 50%; }
.osb__pill span { font-variant-numeric: tabular-nums; color: var(--mi-label3); }
.osb__pill.is-on { background: var(--mi-label); color: var(--mi-card); }
.osb__pill.is-on span { color: inherit; opacity: .7; }

.osb__strip { display: flex; gap: 3px; height: 8px; }
.osb__seg { flex-basis: 0; min-width: 8px; height: 100%; padding: 0; border: 0; border-radius: 4px; cursor: pointer; transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.osb__seg:hover { transform: scaleY(1.5); }
.osb__seg.is-dim { opacity: .25; }
.osb__seg:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.osb__tools { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; padding-top: 4px; border-top: 1px solid var(--mi-sep); }
.osb__search { grid-column: 1 / -1; }
@container (min-width: 760px) { .osb__tools { grid-template-columns: minmax(200px, 1fr) 170px auto auto; } .osb__search { grid-column: auto; } }
.osb__flag { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--mi-label2); white-space: nowrap; }
.osb__sort { justify-self: end; }

.osb__scroll { overflow-x: auto; margin: 0 -14px -14px; }
.osb__table { width: 100%; min-width: 660px; border-collapse: collapse; font-size: 13px; }
.osb__table th { padding: 8px 14px; text-align: start; font-weight: 500; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); white-space: nowrap; }
.osb__table td { padding: 11px 14px; border-bottom: 1px solid var(--mi-sep); white-space: nowrap; }
.osb__table tbody tr:last-child td { border-bottom: 0; }
.osb__table .is-num { text-align: end; font-variant-numeric: tabular-nums; }
.osb__id { font-weight: 600; font-variant-numeric: tabular-nums; }
.osb__flag-icon { margin-left: 4px; vertical-align: -2px; color: var(--mi-red); }
.osb__muted { color: var(--mi-label2); }
.osb__status { display: inline-flex; align-items: center; gap: 6px; }
.osb__status i { width: 7px; height: 7px; border-radius: 50%; }
.osb__table td.osb__empty { padding: 28px 14px; text-align: center; color: var(--mi-label2); }
.osb__empty button { border: 0; background: none; padding: 0; color: var(--mi-p-text); font: inherit; font-weight: 600; cursor: pointer; }
.osb__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
</style>
