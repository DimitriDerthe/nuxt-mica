<template>
  <div class="osq">
    <section class="osq__card" aria-labelledby="osq-title">
      <header class="osq__head">
        <MiText id="osq-title" variant="title3" as="h2" weight="semibold">Orders to handle</MiText>
        <MiText variant="footnote" tone="label2">Fernwood Ceramics shop · today</MiText>
      </header>

      <!-- Filter rail: every status is a button carrying a live count badge. -->
      <div class="osq__rail" role="group" aria-label="Filter by status">
        <button
          v-for="f in filters" :key="f.id" type="button" class="osq__filter" :aria-pressed="filter === f.id" @click="filter = f.id"
        >
          {{ f.label }}
          <MiBadge :count="counts[f.id]" show-zero :tone="f.id === 'failed' && counts.failed ? 'danger' : 'neutral'" :count-noun="`${f.label.toLowerCase()} orders`" />
        </button>
      </div>

      <ul class="osq__list" aria-label="Orders">
        <li v-for="o in shown" :key="o.id" class="osq__row">
          <div class="osq__main">
            <MiText variant="subheadline" weight="semibold">{{ o.customer }}</MiText>
            <MiText variant="caption" tone="label2">{{ o.id }} · {{ o.items }} · {{ o.placed }}</MiText>
          </div>
          <MiBadge v-bind="look[o.status]" :label="label[o.status]" class="osq__badge" />
          <MiText as="span" variant="subheadline" weight="medium" tabular class="osq__total">{{ o.total }}</MiText>
          <div class="osq__act">
            <MiButton v-if="next[o.status]" size="small" variant="tinted" @click="advance(o)">{{ next[o.status]?.label }}</MiButton>
          </div>
        </li>
        <li v-if="!shown.length" class="osq__empty"><MiText variant="footnote" tone="label2">No orders in this state.</MiText></li>
      </ul>

      <footer class="osq__legend" aria-label="Badge legend">
        <span v-for="s in statuses" :key="s" class="osq__key">
          <MiBadge v-bind="look[s]" :label="label[s]" />
          <MiText as="span" variant="caption2" tone="label3">{{ meaning[s] }}</MiText>
        </span>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'failed' | 'refunded'
type FilterId = 'all' | 'todo' | 'shipped' | 'failed'
type Tone = 'primary' | 'secondary' | 'warning' | 'neutral' | 'danger' | 'success'
interface Order { id: string, customer: string, items: string, placed: string, total: string, status: Status }

const statuses: Status[] = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'failed', 'refunded']
const look: Record<Status, { tone: Tone, variant: 'tint' | 'solid' | 'outline', dot?: boolean }> = {
  pending: { tone: 'warning', variant: 'outline' },
  paid: { tone: 'primary', variant: 'tint', dot: true },
  packed: { tone: 'secondary', variant: 'tint', dot: true },
  shipped: { tone: 'primary', variant: 'solid' },
  delivered: { tone: 'success', variant: 'tint', dot: true },
  failed: { tone: 'danger', variant: 'solid' },
  refunded: { tone: 'neutral', variant: 'outline' }
}
const label: Record<Status, string> = { pending: 'Awaiting payment', paid: 'Paid', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', failed: 'Payment failed', refunded: 'Refunded' }
const meaning: Record<Status, string> = { pending: 'bank transfer', paid: 'ready to pack', packed: 'label printed', shipped: 'with carrier', delivered: 'signed for', failed: 'needs contact', refunded: 'closed' }
const next: Partial<Record<Status, { label: string, to: Status }>> = {
  paid: { label: 'Mark packed', to: 'packed' }, packed: { label: 'Hand to carrier', to: 'shipped' }, failed: { label: 'Send reminder', to: 'pending' }
}

const filters: { id: FilterId, label: string }[] = [{ id: 'all', label: 'All' }, { id: 'todo', label: 'To ship' }, { id: 'shipped', label: 'In transit' }, { id: 'failed', label: 'Failed' }]
const inFilter: Record<FilterId, (s: Status) => boolean> = {
  all: () => true, todo: s => s === 'paid' || s === 'packed', shipped: s => s === 'shipped', failed: s => s === 'failed'
}

const orders = ref<Order[]>([
  { id: '#4821', customer: 'Léa Fontaine', items: '2 × Speckled mug', placed: '08:12', total: '€58.00', status: 'paid' },
  { id: '#4820', customer: 'Tomás Reyes', items: 'Serving bowl, large', placed: '07:40', total: '€94.00', status: 'packed' },
  { id: '#4819', customer: 'Aiko Tanaka', items: '6 × Dinner plate', placed: '07:02', total: '€216.00', status: 'failed' },
  { id: '#4818', customer: 'Grace Mensah', items: 'Bud vase set', placed: 'Yesterday', total: '€42.00', status: 'shipped' },
  { id: '#4817', customer: 'Oskar Lind', items: 'Teapot, celadon', placed: 'Yesterday', total: '€120.00', status: 'pending' },
  { id: '#4816', customer: 'Nadia Haddad', items: '4 × Espresso cup', placed: 'Mon', total: '€64.00', status: 'delivered' },
  { id: '#4815', customer: 'Ben Carter', items: 'Fruit bowl', placed: 'Mon', total: '€48.00', status: 'refunded' }
])
const filter = ref<FilterId>('todo')

const shown = computed(() => orders.value.filter(o => inFilter[filter.value](o.status)))
const count = (id: FilterId): number => orders.value.filter(o => inFilter[id](o.status)).length
const counts = computed<Record<FilterId, number>>(() => ({ all: count('all'), todo: count('todo'), shipped: count('shipped'), failed: count('failed') }))

function advance(o: Order): void {
  const step = next[o.status]
  if (step) o.status = step.to
}
</script>

<style scoped>
.osq { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.osq__card { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.osq__head { display: grid; gap: 2px; }

.osq__rail { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.osq__filter {
  display: inline-flex; flex: none; align-items: center; gap: 8px; height: 34px; padding: 0 10px 0 14px; border: 0; border-radius: 17px;
  background: var(--mi-fill4); color: var(--mi-label2); font: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.osq__filter[aria-pressed="true"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.osq__filter:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.osq__list { display: grid; margin: 0; padding: 0; list-style: none; }
.osq__row {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "main total" "badge act";
  align-items: center; gap: 8px 12px; padding: 14px 0; border-top: 1px solid var(--mi-sep);
}
.osq__main { grid-area: main; min-width: 0; }
.osq__badge { grid-area: badge; justify-self: start; }
.osq__total { grid-area: total; text-align: end; }
.osq__act { grid-area: act; justify-self: end; }
.osq__empty { padding: 18px 0; border-top: 1px solid var(--mi-sep); }

.osq__legend { display: flex; flex-wrap: wrap; gap: 10px 16px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.osq__key { display: inline-flex; align-items: center; gap: 6px; }

@container (min-width: 720px) {
  .osq__card { padding: 24px 28px; }
  .osq__row { grid-template-columns: minmax(0, 1fr) 150px 90px 150px; grid-template-areas: "main badge total act"; }
}
</style>
