<template>
  <div class="osq mi:@container mi:font-mi mi:text-label">
    <section class="osq__card mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[720px]:py-6 mi:@[720px]:px-7" aria-labelledby="osq-title">
      <header class="osq__head mi:grid mi:gap-0.5">
        <MiText id="osq-title" variant="title3" as="h2" weight="semibold">Orders to handle</MiText>
        <MiText variant="footnote" tone="label2">Fernwood Ceramics shop · today</MiText>
      </header>

      <!-- Filter rail: every status is a button carrying a live count badge. -->
      <div class="osq__rail mi:flex mi:gap-1.5 mi:overflow-x-auto mi:[scrollbar-width:none]" role="group" aria-label="Filter by status">
        <button
          v-for="f in filters" :key="f.id" type="button" class="osq__filter mi:inline-flex mi:flex-[none] mi:items-center mi:gap-2 mi:h-8.5 mi:pt-0 mi:pr-2.5 mi:pb-0 mi:pl-3.5 mi:[border:0] mi:rounded-[17px] mi:bg-fill4 mi:text-label2 mi:cursor-pointer mi:aria-pressed:bg-p-tint mi:aria-pressed:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-pressed="filter === f.id" @click="filter = f.id"
        >
          {{ f.label }}
          <MiBadge :count="counts[f.id]" show-zero :tone="f.id === 'failed' && counts.failed ? 'danger' : 'neutral'" :count-noun="`${f.label.toLowerCase()} orders`" />
        </button>
      </div>

      <ul class="osq__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Orders">
        <li v-for="o in shown" :key="o.id" class="osq__row mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:[grid-template-areas:'main_total'_'badge_act'] mi:items-center mi:gap-y-2 mi:gap-x-3 mi:py-3.5 mi:px-0 mi:border-t mi:border-t-sep mi:@[720px]:grid-cols-[minmax(0,_1fr)_150px_90px_150px] mi:@[720px]:[grid-template-areas:'main_badge_total_act']">
          <div class="osq__main mi:[grid-area:main] mi:min-w-0">
            <MiText variant="subheadline" weight="semibold">{{ o.customer }}</MiText>
            <MiText variant="caption" tone="label2">{{ o.id }} · {{ o.items }} · {{ o.placed }}</MiText>
          </div>
          <MiBadge v-bind="look[o.status]" :label="label[o.status]" class="osq__badge" />
          <MiText as="span" variant="subheadline" weight="medium" tabular class="osq__total mi:[grid-area:total] mi:text-end">{{ o.total }}</MiText>
          <div class="osq__act mi:[grid-area:act] mi:justify-self-end">
            <MiButton v-if="next[o.status]" size="small" variant="tinted" @click="advance(o)">{{ next[o.status]?.label }}</MiButton>
          </div>
        </li>
        <li v-if="!shown.length" class="osq__empty mi:py-4.5 mi:px-0 mi:border-t mi:border-t-sep"><MiText variant="footnote" tone="label2">No orders in this state.</MiText></li>
      </ul>

      <footer class="osq__legend mi:flex mi:flex-wrap mi:gap-y-2.5 mi:gap-x-4 mi:pt-3.5 mi:border-t mi:border-t-sep" aria-label="Badge legend">
        <span v-for="s in statuses" :key="s" class="osq__key mi:inline-flex mi:items-center mi:gap-1.5">
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
.osq__filter { font: inherit; font-size: 14px; font-weight: 500;
}
.osq__badge { grid-area: badge; justify-self: start; }
</style>
