<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="odl-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="odl-title" variant="title3" as="h2" weight="semibold">Orders by day</MiText>
        <MiText variant="footnote" tone="label2">Kettle &amp; Crumb roastery · net {{ money(net) }} across {{ visible.length }} orders</MiText>
      </div>
      <MiSegmented v-model="status" label="Status" :options="statuses" />
    </header>

    <div class="mi:min-w-0 mi:overflow-x-auto mi:rounded-xl mi:bg-card mi:shadow-1">
      <table class="mi:w-full mi:min-w-160 mi:border-collapse mi:text-[14px] mi:tabular-nums">
        <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Orders grouped by day with daily subtotals</caption>
        <thead>
          <tr>
            <th class="mi:py-2 mi:ps-2 mi:pe-0 mi:w-11 mi:text-start mi:align-middle mi:font-semibold mi:text-[12px] mi:text-label2 mi:border-b mi:border-b-sep" scope="col"><span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Details</span></th>
            <th class="mi:py-2 mi:px-3 mi:text-start mi:align-middle mi:font-semibold mi:text-[12px] mi:text-label2 mi:border-b mi:border-b-sep" scope="col">Order</th>
            <th class="mi:py-2 mi:px-3 mi:text-start mi:align-middle mi:font-semibold mi:text-[12px] mi:text-label2 mi:border-b mi:border-b-sep" scope="col">Customer</th>
            <th class="mi:py-2 mi:px-3 mi:text-start mi:align-middle mi:font-semibold mi:text-[12px] mi:text-label2 mi:border-b mi:border-b-sep" scope="col">Fulfillment</th>
            <th scope="col" class="mi:py-2 mi:px-3 mi:text-end mi:font-semibold mi:align-middle mi:text-[12px] mi:text-label2 mi:border-b mi:border-b-sep">Total</th>
          </tr>
        </thead>
        <!-- One tbody per day: a day row carrying the subtotal, then the orders. -->
        <tbody v-for="day in days" :key="day.date">
          <tr>
            <th scope="rowgroup" colspan="4" class="mi:pt-2.5 mi:pb-1.5 mi:ps-2 mi:pe-0 mi:w-11 mi:bg-fill4 mi:text-[13px] mi:font-semibold mi:text-start mi:align-middle">{{ day.date }} <span class="mi:font-normal mi:ms-1.5 mi:text-label2">{{ day.orders.length }} {{ day.orders.length === 1 ? 'order' : 'orders' }}</span></th>
            <td class="mi:pt-2.5 mi:pb-1.5 mi:px-3 mi:bg-fill4 mi:text-[13px] mi:font-semibold mi:text-end mi:align-middle">{{ money(day.subtotal) }}</td>
          </tr>
          <template v-for="o in day.orders" :key="o.id">
            <tr class="mi:group" :data-open="open === o.id || undefined">
              <td class="mi:py-2 mi:ps-2 mi:pe-0 mi:w-11 mi:text-start mi:align-middle mi:border-b mi:border-b-sep mi:group-data-[open]:border-b-transparent">
                <MiIconButton
                  size="small" variant="plain" :label="(open === o.id ? 'Hide' : 'Show') + ' items of ' + o.id"
                  :aria-expanded="open === o.id" :aria-controls="'odl-items-' + o.id" @click="open = open === o.id ? null : o.id"
                >
                  <MiIcon name="chevron-right" :size="16" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="open === o.id ? 'mi:transform-[rotate(90deg)]' : ''" />
                </MiIconButton>
              </td>
              <td class="mi:py-2 mi:px-3 mi:text-start mi:align-middle mi:border-b mi:border-b-sep mi:group-data-[open]:border-b-transparent mi:grid mi:font-semibold mi:leading-[1.2]">{{ o.id }}<MiText as="span" variant="caption" tone="label3">{{ o.time }}</MiText></td>
              <td class="mi:py-2 mi:px-3 mi:text-start mi:align-middle mi:border-b mi:border-b-sep mi:group-data-[open]:border-b-transparent mi:whitespace-nowrap"><MiAvatar class="mi:me-2! mi:align-middle!" :name="o.customer" size="xs" tone="auto" decorative />{{ o.customer }}</td>
              <td class="mi:py-2 mi:px-3 mi:text-start mi:align-middle mi:border-b mi:border-b-sep mi:group-data-[open]:border-b-transparent">
                <span class="mi:flex mi:gap-[3px] mi:w-18 mi:mb-[3px]" role="img" :aria-label="stepLabel(o)">
                  <i class="mi:flex-1 mi:h-1 mi:rounded-[2px]" v-for="(s, i) in steps" :key="s" :class="i < o.step ? 'mi:bg-p' : 'mi:bg-fill2'" />
                </span>
                <MiText as="span" variant="caption" :tone="o.refunded ? 'red' : 'label2'">{{ stepLabel(o) }}</MiText>
              </td>
              <td class="mi:py-2 mi:px-3 mi:text-end mi:font-semibold mi:align-middle mi:border-b mi:border-b-sep mi:group-data-[open]:border-b-transparent" :class="o.refunded ? 'mi:text-label3 mi:[text-decoration:line-through]' : ''">{{ money(total(o)) }}</td>
            </tr>
            <tr v-if="open === o.id" :id="'odl-items-' + o.id">
              <td class="mi:pt-0 mi:pb-2 mi:ps-2 mi:pe-0 mi:w-11 mi:text-start mi:align-middle mi:border-b mi:border-b-sep" />
              <td colspan="4" class="mi:pt-0 mi:pb-2 mi:px-3 mi:text-start mi:align-middle mi:border-b mi:border-b-sep">
                <ul class="mi:grid mi:gap-1 mi:mt-0 mi:mx-0 mi:mb-2.5 mi:py-2.5 mi:px-3 mi:[list-style:none] mi:rounded-md mi:bg-fill4 mi:text-[13px]">
                  <li class="mi:flex mi:justify-between mi:gap-3" v-for="l in o.lines" :key="l.sku"><span>{{ l.qty }} × {{ l.name }}</span><span>{{ money(l.qty * l.price) }}</span></li>
                </ul>
                <div class="mi:flex mi:flex-wrap mi:gap-2 mi:pb-1">
                  <MiButton v-if="!o.refunded && o.step < 3" size="small" variant="tinted" @click="advance(o)">Mark {{ steps[o.step]?.toLowerCase() }}</MiButton>
                  <MiButton v-if="!o.refunded" size="small" variant="destructive" soft @click="refund(o)">Refund {{ money(total(o)) }}</MiButton>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ log }}</p>
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
