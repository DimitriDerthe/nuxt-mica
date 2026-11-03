<template>
  <section class="co" aria-labelledby="co-title">
    <header class="co__hero">
      <div class="co__id">
        <MiAvatar name="Camille Roux" size="lg" tone="purple" decorative />
        <div class="co__id-text">
          <div class="co__name-row">
            <MiText id="co-title" as="h2" variant="title2" weight="bold">Camille Roux</MiText>
            <MiBadge tone="secondary" label="Gold member" />
          </div>
          <MiText variant="footnote" tone="label2">Customer since March 2021 · Lyon, France · prefers email</MiText>
        </div>
      </div>
      <dl class="co__stats">
        <div v-for="s in stats" :key="s.label" class="co__stat">
          <dt>{{ s.label }}</dt>
          <dd>{{ s.value }}</dd>
        </div>
      </dl>
    </header>

    <div class="co__body">
      <nav class="co__orders" aria-labelledby="co-orders-title">
        <MiText id="co-orders-title" as="h3" variant="subheadline" weight="semibold">Orders</MiText>
        <ul class="co__list">
          <li v-for="o in orders" :key="o.id">
            <button type="button" class="co__order" :class="{ 'is-on': o.id === activeId }" :aria-current="o.id === activeId ? 'true' : undefined" @click="activeId = o.id">
              <span class="co__order-top">
                <span class="co__order-no">#{{ o.id }}</span>
                <MiBadge :tone="tones[o.status]" :label="o.status" />
              </span>
              <span class="co__order-meta">{{ o.date }} · {{ o.items.length }} {{ o.items.length === 1 ? 'item' : 'items' }} · {{ money(total(o)) }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <article class="co__detail" aria-labelledby="co-detail-title">
        <header class="co__detail-head">
          <div>
            <MiText id="co-detail-title" as="h3" variant="headline" weight="semibold">Order #{{ active.id }}</MiText>
            <MiText variant="caption" tone="label2">Placed {{ active.date }} · {{ money(total(active)) }}</MiText>
          </div>
          <div class="co__acts">
            <MiButton variant="gray" size="small" @click="resend">Resend receipt</MiButton>
            <MiButton variant="destructive" size="small" soft :disabled="active.status === 'Refunded'" @click="refund">Refund</MiButton>
          </div>
        </header>

        <ul class="co__items">
          <li v-for="it in active.items" :key="it.sku" class="co__item">
            <span class="co__thumb" :style="{ '--co-hue': it.hue }" aria-hidden="true" />
            <span class="co__item-text">
              <span class="co__item-name">{{ it.name }}</span>
              <span class="co__item-meta">{{ it.variant }} · qty {{ it.qty }}</span>
            </span>
            <span class="co__item-price">{{ money(it.price * it.qty) }}</span>
          </li>
        </ul>

        <div class="co__split">
          <MiDetails :items="facts" label-width="96px" />
          <MiTimeline :items="active.events" aria-label="Order history" />
        </div>
        <p class="co__status" role="status">{{ status }}</p>
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

<style scoped>
.co { container-type: inline-size; min-height: 620px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.co__hero { display: grid; gap: 18px; padding: 22px 20px; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); }
.co__id { display: flex; align-items: center; gap: 14px; min-width: 0; }
.co__id-text { min-width: 0; }
.co__name-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.co__stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 0; border-radius: var(--mi-radius-l); background: var(--mi-sep); overflow: hidden; }
.co__stat { padding: 10px 14px; background: var(--mi-card); }
.co__stat dt { font-size: 12px; color: var(--mi-label2); }
.co__stat dd { margin: 2px 0 0; font-size: 20px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

.co__body { display: grid; gap: 16px; padding: 16px; grid-template-columns: minmax(0, 1fr); }
.co__orders { display: grid; align-content: start; gap: 8px; }
.co__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.co__order { display: grid; gap: 4px; width: 100%; padding: 12px 14px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: var(--mi-card); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.co__order.is-on { border-color: var(--mi-p); background: var(--mi-p-tint); }
.co__order:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.co__order-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.co__order-no { font-weight: 700; font-variant-numeric: tabular-nums; }
.co__order-meta { font-size: 12.5px; color: var(--mi-label2); }

.co__detail { display: grid; align-content: start; gap: 16px; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.co__detail-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.co__acts { display: flex; flex-wrap: wrap; gap: 8px; }
.co__items { list-style: none; margin: 0; padding: 0; display: grid; }
.co__item { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.co__item + .co__item { border-top: 1px solid var(--mi-sep); }
.co__thumb { flex: none; width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(150deg, color-mix(in srgb, var(--co-hue) 70%, var(--mi-card)), color-mix(in srgb, var(--co-hue) 25%, var(--mi-card))); }
.co__item-text { display: grid; flex: 1; min-width: 0; }
.co__item-name { font-size: 14.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.co__item-meta { font-size: 12.5px; color: var(--mi-label2); }
.co__item-price { font-weight: 600; font-variant-numeric: tabular-nums; }
.co__split { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.co__status { margin: 0; min-height: 18px; font-size: 13px; color: var(--mi-label2); }

@container (min-width: 640px) {
  .co__stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .co__split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
}
@container (min-width: 880px) {
  .co__hero { grid-template-columns: auto minmax(0, 520px); justify-content: space-between; align-items: center; padding: 24px 28px; }
  .co__body { grid-template-columns: 280px minmax(0, 1fr); padding: 20px 28px 28px; gap: 20px; }
}
</style>
