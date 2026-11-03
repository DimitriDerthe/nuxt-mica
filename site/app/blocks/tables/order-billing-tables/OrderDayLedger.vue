<template>
  <section class="odl" aria-labelledby="odl-title">
    <header class="odl__head">
      <div>
        <MiText id="odl-title" variant="title3" as="h2" weight="semibold">Orders by day</MiText>
        <MiText variant="footnote" tone="label2">Kettle &amp; Crumb roastery · net {{ money(net) }} across {{ visible.length }} orders</MiText>
      </div>
      <MiSegmented v-model="status" label="Status" :options="statuses" />
    </header>

    <div class="odl__scroll">
      <table class="odl__table">
        <caption class="odl__sr">Orders grouped by day with daily subtotals</caption>
        <thead>
          <tr>
            <th scope="col"><span class="odl__sr">Details</span></th>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Fulfillment</th>
            <th scope="col" class="odl__end">Total</th>
          </tr>
        </thead>
        <!-- One tbody per day: a day row carrying the subtotal, then the orders. -->
        <tbody v-for="day in days" :key="day.date">
          <tr class="odl__day">
            <th scope="rowgroup" colspan="4">{{ day.date }} <span>{{ day.orders.length }} {{ day.orders.length === 1 ? 'order' : 'orders' }}</span></th>
            <td class="odl__end">{{ money(day.subtotal) }}</td>
          </tr>
          <template v-for="o in day.orders" :key="o.id">
            <tr class="odl__row" :class="{ 'is-open': open === o.id }">
              <td>
                <MiIconButton
                  size="small" variant="plain" :label="(open === o.id ? 'Hide' : 'Show') + ' items of ' + o.id"
                  :aria-expanded="open === o.id" :aria-controls="'odl-items-' + o.id" @click="open = open === o.id ? null : o.id"
                >
                  <MiIcon name="chevron-right" :size="16" class="odl__chev" />
                </MiIconButton>
              </td>
              <td class="odl__id">{{ o.id }}<MiText as="span" variant="caption" tone="label3">{{ o.time }}</MiText></td>
              <td class="odl__who"><MiAvatar :name="o.customer" size="xs" tone="auto" decorative />{{ o.customer }}</td>
              <td>
                <span class="odl__steps" role="img" :aria-label="stepLabel(o)">
                  <i v-for="(s, i) in steps" :key="s" :class="{ 'is-done': i < o.step }" />
                </span>
                <MiText as="span" variant="caption" :tone="o.refunded ? 'red' : 'label2'">{{ stepLabel(o) }}</MiText>
              </td>
              <td class="odl__end" :class="{ 'is-refund': o.refunded }">{{ money(total(o)) }}</td>
            </tr>
            <tr v-if="open === o.id" :id="'odl-items-' + o.id" class="odl__items">
              <td />
              <td colspan="4">
                <ul class="odl__lines">
                  <li v-for="l in o.lines" :key="l.sku"><span>{{ l.qty }} × {{ l.name }}</span><span>{{ money(l.qty * l.price) }}</span></li>
                </ul>
                <div class="odl__actions">
                  <MiButton v-if="!o.refunded && o.step < 3" size="small" variant="tinted" @click="advance(o)">Mark {{ steps[o.step]?.toLowerCase() }}</MiButton>
                  <MiButton v-if="!o.refunded" size="small" variant="destructive" soft @click="refund(o)">Refund {{ money(total(o)) }}</MiButton>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="odl__log" aria-live="polite">{{ log }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Line { sku: string, name: string, qty: number, price: number }
interface Order { id: string, date: string, time: string, customer: string, step: number, refunded: boolean, lines: Line[] }

const steps = ['Paid', 'Packed', 'Shipped']
const statuses = [{ value: 'all', label: 'All' }, { value: 'open', label: 'To ship' }, { value: 'refunded', label: 'Refunded' }]
const status = ref<string | number | null>('all')
const open = ref<string | null>('KC-2087')
const log = ref('Open an order to see its items, move it along or refund it.')

const orders = ref<Order[]>([
  { id: 'KC-2087', date: 'Today, Nov 3', time: '09:42', customer: 'Priya Natarajan', step: 1, refunded: false, lines: [{ sku: 'eth-250', name: 'Ethiopia Guji, 250 g', qty: 2, price: 16 }, { sku: 'flt-v60', name: 'V60 paper filters', qty: 1, price: 7 }] },
  { id: 'KC-2086', date: 'Today, Nov 3', time: '08:15', customer: 'Lucas Ferreira', step: 2, refunded: false, lines: [{ sku: 'sub-m', name: 'Monthly subscription', qty: 1, price: 29 }] },
  { id: 'KC-2085', date: 'Yesterday, Nov 2', time: '18:03', customer: 'Hanna Kowalczyk', step: 3, refunded: false, lines: [{ sku: 'col-1k', name: 'Colombia Huila, 1 kg', qty: 1, price: 48 }, { sku: 'mug-st', name: 'Stoneware mug', qty: 2, price: 18 }] },
  { id: 'KC-2084', date: 'Yesterday, Nov 2', time: '11:27', customer: 'Daniel Osei', step: 1, refunded: true, lines: [{ sku: 'grn-c2', name: 'Burr grinder C2', qty: 1, price: 89 }] },
  { id: 'KC-2083', date: 'Yesterday, Nov 2', time: '07:50', customer: 'Sofia Marchetti', step: 3, refunded: false, lines: [{ sku: 'dec-250', name: 'Decaf Sierra, 250 g', qty: 3, price: 15 }] },
  { id: 'KC-2081', date: 'Oct 31', time: '16:38', customer: 'Kenji Watanabe', step: 3, refunded: false, lines: [{ sku: 'gift-50', name: 'Gift card', qty: 1, price: 50 }, { sku: 'eth-250', name: 'Ethiopia Guji, 250 g', qty: 1, price: 16 }] }
])

const total = (o: Order) => o.lines.reduce((t, l) => t + l.qty * l.price, 0)
const visible = computed(() => orders.value.filter(o =>
  status.value === 'open' ? !o.refunded && o.step < 3 : status.value === 'refunded' ? o.refunded : true))
// Refunds stay listed but drop out of the subtotal, so each day shows what was actually kept.
const days = computed(() => {
  const map = new Map<string, Order[]>()
  for (const o of visible.value) map.set(o.date, [...(map.get(o.date) ?? []), o])
  return [...map].map(([date, list]) => ({ date, orders: list, subtotal: list.reduce((t, o) => t + (o.refunded ? 0 : total(o)), 0) }))
})
const net = computed(() => days.value.reduce((t, d) => t + d.subtotal, 0))

const stepLabel = (o: Order) => (o.refunded ? 'Refunded' : o.step >= 3 ? 'Shipped' : `${steps[o.step - 1]} · next: ${steps[o.step]?.toLowerCase()}`)

function advance(o: Order) {
  o.step += 1
  log.value = `${o.id} marked ${steps[o.step - 1]?.toLowerCase()}.`
}
function refund(o: Order) {
  o.refunded = true
  log.value = `${o.id} refunded ${money(total(o))} to ${o.customer}.`
}

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<style scoped>
.odl { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.odl__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.odl__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.odl__scroll { min-width: 0; overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.odl__table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
.odl__table th, .odl__table td { padding: 8px 12px; text-align: start; vertical-align: middle; }
.odl__table thead th { font-size: 12px; font-weight: 600; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); }
.odl__table th:first-child, .odl__table td:first-child { width: 44px; padding-inline: 8px 0; }
.odl__table .odl__end { text-align: end; font-weight: 600; }

.odl__day th, .odl__day td { padding-block: 10px 6px; background: var(--mi-fill4); font-size: 13px; font-weight: 600; }
.odl__day th { padding-inline-start: 16px; }
.odl__day span { margin-inline-start: 6px; font-weight: 400; color: var(--mi-label2); }
.odl__row td { border-bottom: 1px solid var(--mi-sep); }
.odl__row.is-open td { border-bottom-color: transparent; }
.odl__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.odl__row.is-open .odl__chev { transform: rotate(90deg); }
.odl__id { display: grid; font-weight: 600; line-height: 1.2; }
.odl__who { white-space: nowrap; }
.odl__who > :first-child { margin-inline-end: 8px; vertical-align: middle; }
.is-refund { color: var(--mi-label3); text-decoration: line-through; }

/* Three-step track: lit segments are completed steps. */
.odl__steps { display: flex; gap: 3px; width: 72px; margin-bottom: 3px; }
.odl__steps i { flex: 1; height: 4px; border-radius: 2px; background: var(--mi-fill2); }
.odl__steps i.is-done { background: var(--mi-p); }

.odl__items td { padding-top: 0; border-bottom: 1px solid var(--mi-sep); }
.odl__lines { display: grid; gap: 4px; margin: 0 0 10px; padding: 10px 12px; list-style: none; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-size: 13px; }
.odl__lines li { display: flex; justify-content: space-between; gap: 12px; }
.odl__actions { display: flex; flex-wrap: wrap; gap: 8px; padding-bottom: 4px; }

.odl__log { margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>
