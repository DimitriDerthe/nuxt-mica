<template>
  <section class="mi:@container mi:min-h-155 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="co-title">
    <header class="mi:grid mi:gap-4.5 mi:py-5.5 mi:px-5 mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:@[880px]:grid-cols-[auto_minmax(0,_520px)] mi:@[880px]:justify-between mi:@[880px]:items-center mi:@[880px]:py-6 mi:@[880px]:px-7">
      <div class="mi:flex mi:items-center mi:gap-3.5 mi:min-w-0">
        <MiAvatar name="Camille Roux" size="lg" tone="purple" decorative />
        <div class="mi:min-w-0">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
            <MiText id="co-title" as="h2" variant="title2" weight="bold">Camille Roux</MiText>
            <MiBadge tone="secondary" label="Gold member" />
          </div>
          <MiText variant="footnote" tone="label2">Customer since March 2021 · Lyon, France · prefers email</MiText>
        </div>
      </div>
      <dl class="mi:grid mi:grid-cols-2 mi:gap-px mi:m-0 mi:rounded-lg mi:[background:var(--mi-sep)] mi:overflow-hidden mi:@[640px]:grid-cols-4">
        <div v-for="s in stats" :key="s.label" class="mi:py-2.5 mi:px-3.5 mi:[background:var(--mi-card)]">
          <dt class="mi:text-[12px] mi:text-label2">{{ s.label }}</dt>
          <dd class="mi:mt-0.5 mi:mx-0 mi:mb-0 mi:text-[20px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ s.value }}</dd>
        </div>
      </dl>
    </header>

    <div class="mi:grid mi:gap-4 mi:p-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[880px]:grid-cols-[280px_minmax(0,_1fr)] mi:@[880px]:pt-5 mi:@[880px]:px-7 mi:@[880px]:pb-7 mi:@[880px]:gap-5">
      <nav class="mi:grid mi:content-start mi:gap-2" aria-labelledby="co-orders-title">
        <MiText id="co-orders-title" as="h3" variant="subheadline" weight="semibold">Orders</MiText>
        <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-1.5">
          <li v-for="o in orders" :key="o.id">
            <button type="button" class="mi:grid mi:gap-1 mi:w-full mi:py-3 mi:px-3.5 mi:border mi:rounded-lg mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="o.id === activeId ? 'mi:border-p mi:[background:var(--mi-p-tint)]' : 'mi:border-sep mi:[background:var(--mi-card)]'" :aria-current="o.id === activeId ? 'true' : undefined" @click="activeId = o.id">
              <span class="mi:flex mi:items-center mi:justify-between mi:gap-2">
                <span class="mi:font-bold mi:tabular-nums">#{{ o.id }}</span>
                <MiBadge :tone="tones[o.status]" :label="o.status" />
              </span>
              <span class="mi:text-[12.5px] mi:text-label2">{{ o.date }} · {{ o.items.length }} {{ o.items.length === 1 ? 'item' : 'items' }} · {{ money(total(o)) }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <article class="mi:grid mi:content-start mi:gap-4 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="co-detail-title">
        <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
          <div>
            <MiText id="co-detail-title" as="h3" variant="headline" weight="semibold">Order #{{ active.id }}</MiText>
            <MiText variant="caption" tone="label2">Placed {{ active.date }} · {{ money(total(active)) }}</MiText>
          </div>
          <div class="mi:flex mi:flex-wrap mi:gap-2">
            <MiButton variant="gray" size="small" @click="resend">Resend receipt</MiButton>
            <MiButton variant="destructive" size="small" soft :disabled="active.status === 'Refunded'" @click="refund">Refund</MiButton>
          </div>
        </header>

        <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid">
          <li v-for="it in active.items" :key="it.sku" class="mi:flex mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
            <span class="mi:flex-[none] mi:w-11 mi:h-11 mi:rounded-[10px] mi:[background:linear-gradient(150deg,_color-mix(in_srgb,_var(--co-hue)_70%,_var(--mi-card)),_color-mix(in_srgb,_var(--co-hue)_25%,_var(--mi-card)))]" :style="{ '--co-hue': it.hue }" aria-hidden="true" />
            <span class="mi:grid mi:flex-1 mi:min-w-0">
              <span class="mi:text-[14.5px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ it.name }}</span>
              <span class="mi:text-[12.5px] mi:text-label2">{{ it.variant }} · qty {{ it.qty }}</span>
            </span>
            <span class="mi:font-semibold mi:tabular-nums">{{ money(it.price * it.qty) }}</span>
          </li>
        </ul>

        <div class="mi:grid mi:gap-4.5 mi:grid-cols-[minmax(0,_1fr)] mi:pt-4 mi:border-t mi:border-t-sep mi:@[640px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
          <MiDetails :items="facts" label-width="96px" />
          <MiTimeline :items="active.events" aria-label="Order history" />
        </div>
        <p class="mi:m-0 mi:min-h-4.5 mi:text-[13px] mi:text-label2" role="status">{{ status }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'Delivered' | 'In transit' | 'Refunded'
interface Item { sku: string, name: string, variant: string, qty: number, price: number, hue: string }
interface OrderEvent { title: string, time: string, tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }
interface Order { id: string, date: string, status: Status, carrier: string, tracking: string, address: string, items: Item[], events: OrderEvent[] }

const tones: Record<Status, 'success' | 'primary' | 'neutral'> = { 'Delivered': 'success', 'In transit': 'primary', 'Refunded': 'neutral' }
const stats = [
  { label: 'Lifetime value', value: '€2,148' },
  { label: 'Orders', value: '14' },
  { label: 'Return rate', value: '7%' },
  { label: 'Last contact', value: '3 days ago' }
]

// Sample orders; swap for your commerce API.
const orders = ref<Order[]>([
  {
    id: '58214', date: 'Jan 28', status: 'In transit', carrier: 'Colissimo', tracking: '6A2190448712', address: '14 rue Mercière, Lyon',
    items: [
      { sku: 'w1', name: 'Merino crew sweater', variant: 'Forest · M', qty: 1, price: 129, hue: 'var(--mi-green)' },
      { sku: 'w2', name: 'Wool socks, 3 pack', variant: 'Oat', qty: 2, price: 24, hue: 'var(--mi-orange)' }
    ],
    events: [
      { title: 'Out for delivery', time: 'Today 08:10', tone: 'primary' },
      { title: 'Left the Paris hub', time: 'Jan 30' },
      { title: 'Order placed', time: 'Jan 28' }
    ]
  },
  {
    id: '57390', date: 'Dec 11', status: 'Delivered', carrier: 'DHL Express', tracking: 'JD0146002271', address: '14 rue Mercière, Lyon',
    items: [{ sku: 'c1', name: 'Waxed field jacket', variant: 'Navy · M', qty: 1, price: 289, hue: 'var(--mi-p)' }],
    events: [
      { title: 'Delivered, signed by C. Roux', time: 'Dec 13', tone: 'success' },
      { title: 'Order placed', time: 'Dec 11' }
    ]
  },
  {
    id: '56102', date: 'Oct 2', status: 'Refunded', carrier: 'Colissimo', tracking: '6A2101937720', address: '14 rue Mercière, Lyon',
    items: [{ sku: 'b1', name: 'Leather weekender', variant: 'Cognac', qty: 1, price: 345, hue: 'var(--mi-s)' }],
    events: [
      { title: 'Refunded €345, strap stitching defect', time: 'Oct 19', tone: 'neutral' },
      { title: 'Delivered', time: 'Oct 4', tone: 'success' },
      { title: 'Order placed', time: 'Oct 2' }
    ]
  }
])

const activeId = ref('58214')
const status = ref('')
const active = computed(() => orders.value.find(o => o.id === activeId.value) ?? orders.value[0]!)
const facts = computed(() => [
  { key: 'carrier', label: 'Carrier', value: active.value.carrier },
  { key: 'tracking', label: 'Tracking', value: active.value.tracking },
  { key: 'address', label: 'Ship to', value: active.value.address }
])

const total = (o: Order) => o.items.reduce((sum, it) => sum + it.price * it.qty, 0)
const money = (n: number) => '€' + n.toLocaleString('en-US')

function refund() {
  const o = active.value
  o.status = 'Refunded'
  o.events.unshift({ title: `Refunded ${money(total(o))} by you`, time: 'Just now', tone: 'neutral' })
  status.value = `Refund for order #${o.id} issued. Camille gets an email confirmation.`
}

function resend() {
  status.value = `Receipt for order #${active.value.id} sent to Camille.`
}
</script>
