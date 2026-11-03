<template>
  <section class="cs mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="cs-title">
    <header class="cs__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="cs-title" variant="title3" as="h2" weight="semibold">Where the cloud bill goes</MiText>
        <MiText variant="footnote" tone="label2">Production account · {{ month.label }} invoice, USD</MiText>
      </div>
      <MiSegmented v-model="monthId" label="Invoice month" :options="months" />
    </header>

    <div class="cs__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1fr)]">
      <div class="cs__chart mi:grid mi:gap-4 mi:items-center mi:min-w-0 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[560px]:grid-cols-[220px_minmax(0,_1fr)]">
        <div class="cs__donut mi:w-full mi:max-w-59 mi:justify-self-center">
          <MiDonutChart
            :key="String(monthId)" :data="slices" :card="false" :legend="false" :toggle="false" :size="236" :thickness="34"
            :active="hovered" :format-value="(v) => money(v)" total-label="This month"
            :aria-label="`${month.label} spend by service, ${money(total)} in total`"
            @update:active="hovered = $event"
          >
            <template #center="{ active, totalText }">
              <div class="cs__center mi:grid mi:justify-items-center mi:gap-0.5 mi:text-center">
                <span class="cs__center-label mi:text-[12px] mi:font-medium mi:text-label2">{{ active ? active.label : 'Total' }}</span>
                <span class="cs__center-value mi:text-[24px] mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ active ? active.text : totalText }}</span>
                <span v-if="active" class="cs__center-sub mi:text-[11px] mi:font-semibold mi:text-label2">{{ pct(active.value) }} of bill</span>
                <span v-else class="cs__center-sub mi:text-[11px] mi:font-semibold mi:text-label2" :class="delta >= 0 ? 'is-up' : 'is-down'">{{ delta >= 0 ? '+' : '' }}{{ delta.toFixed(1) }}% vs {{ month.prev }}</span>
              </div>
            </template>
          </MiDonutChart>
        </div>

        <!-- Custom legend doubles as the selector for the drill-down panel. -->
        <ul class="cs__legend mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Services">
          <li v-for="(s, i) in month.services" :key="s.name">
            <button
              type="button" class="cs__row mi:grid mi:grid-cols-[10px_minmax(0,_1fr)_auto_38px] mi:items-center mi:gap-2.5 mi:w-full mi:py-[9px] mi:px-2.5 mi:[border:0] mi:rounded-md mi:bg-transparent mi:text-inherit mi:text-start mi:cursor-pointer mi:[transition:background-color_var(--mi-dur-2)_var(--mi-ease)] mi:hover:bg-fill4 mi:[&.is-on]:bg-fill4 mi:aria-pressed:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-on': focus === i }" :aria-pressed="selected === i"
              @click="selected = i" @mouseenter="hovered = i" @mouseleave="hovered = -1" @focus="hovered = i" @blur="hovered = -1"
            >
              <i class="mi:[.cs__row_&]:w-2.5 mi:[.cs__row_&]:h-2.5 mi:[.cs__row_&]:rounded-[3px]" :style="{ background: colors[i] }" aria-hidden="true" />
              <span class="cs__row-name mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:font-medium">{{ s.name }}</span>
              <span class="cs__row-val mi:tabular-nums">{{ money(s.spend) }}</span>
              <span class="cs__row-share mi:text-end mi:text-label2 mi:text-[12px] mi:tabular-nums">{{ pct(s.spend) }}</span>
            </button>
          </li>
        </ul>
      </div>

      <article class="cs__detail mi:grid mi:gap-2.5 mi:content-start mi:min-w-0 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-live="polite" aria-labelledby="cs-detail-title">
        <div class="cs__detail-top mi:flex mi:items-center mi:gap-2.5 mi:flex-wrap">
          <span class="cs__swatch mi:w-3.5 mi:h-3.5 mi:rounded-[4px]" :style="{ background: colors[focus] }" aria-hidden="true" />
          <MiText id="cs-detail-title" variant="headline" as="h3">{{ current.name }}</MiText>
          <MiBadge :tone="overBudget ? 'warning' : 'success'" :label="overBudget ? 'Over budget' : 'Within budget'" dot />
        </div>
        <p class="cs__detail-big mi:m-0 mi:text-[clamp(30px,_6cqi,_40px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ money(current.spend) }}</p>
        <MiMeter
          :value="current.spend" :max="current.budget" :color="overBudget ? 'var(--mi-orange)' : colors[focus]"
          :aria-label="`${current.name} budget used`"
          :caption="`${Math.round((current.spend / current.budget) * 100)}% of ${money(current.budget)} budget`"
          :hint="overBudget ? `${money(current.spend - current.budget)} over` : `${money(current.budget - current.spend)} left`"
        />

        <MiText variant="caption" tone="label2" weight="medium" as="h4" class="cs__items-title">Top line items</MiText>
        <ol class="cs__items mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:[counter-reset:cs]">
          <li class="mi:[.cs__items_li&]:grid-cols-[22px_minmax(0,_1fr)_auto] mi:[.cs__items_li&]:items-center mi:[.cs__items_li&]:gap-2.5 mi:[.cs__items_li&]:py-[9px] mi:[.cs__items_li&]:px-0 mi:[.cs__items_li&]:border-t mi:[.cs__items_li&]:border-t-sep mi:[.cs__items_li&]:[counter-increment:cs] mi:[.cs__items_li&]:before:content-[counter(cs)]" v-for="item in current.items" :key="item.name">
            <div class="cs__item-text mi:grid mi:min-w-0">
              <MiText class="mi:[.cs__items_li&]:grid-cols-[22px_minmax(0,_1fr)_auto] mi:[.cs__items_li&]:items-center mi:[.cs__items_li&]:gap-2.5 mi:[.cs__items_li&]:py-[9px] mi:[.cs__items_li&]:px-0 mi:[.cs__items_li&]:border-t mi:[.cs__items_li&]:border-t-sep mi:[.cs__items_li&]:[counter-increment:cs] mi:[.cs__items_li&]:before:content-[counter(cs)]" variant="footnote" weight="medium" :lines="1">{{ item.name }}</MiText>
              <MiText class="mi:[.cs__items_li&]:grid-cols-[22px_minmax(0,_1fr)_auto] mi:[.cs__items_li&]:items-center mi:[.cs__items_li&]:gap-2.5 mi:[.cs__items_li&]:py-[9px] mi:[.cs__items_li&]:px-0 mi:[.cs__items_li&]:border-t mi:[.cs__items_li&]:border-t-sep mi:[.cs__items_li&]:[counter-increment:cs] mi:[.cs__items_li&]:before:content-[counter(cs)]" variant="caption" tone="label2" :lines="1">{{ item.note }}</MiText>
            </div>
            <span class="cs__item-val mi:text-[14px] mi:font-semibold mi:tabular-nums">{{ money(item.spend) }}</span>
          </li>
        </ol>
        <MiTextLink href="#cost-explorer">Open in cost explorer</MiTextLink>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Service { name: string, spend: number, budget: number, items: { name: string, note: string, spend: number }[] }

const months = [{ value: 'aug', label: 'Aug' }, { value: 'sep', label: 'Sep' }, { value: 'oct', label: 'Oct' }]
const monthId = ref<string | number | null>('oct')

// Token colors, one per service, in the same order as the data.
const colors = ['var(--mi-p)', 'var(--mi-s)', 'var(--mi-teal)', 'var(--mi-purple)', 'var(--mi-yellow)']

const item = (name: string, note: string, spend: number) => ({ name, note, spend })
// Sample invoices; swap for your billing export.
const invoices: Record<string, { label: string, prev: string, prevTotal: number, services: Service[] }> = {
  aug: {
    label: 'August', prev: 'July', prevTotal: 36210,
    services: [
      { name: 'Compute', spend: 16980, budget: 18000, items: [item('api-prod node pool', '12 × c6i.2xlarge, on-demand', 9840), item('worker-batch', 'Spot fleet, 70% spot', 4320), item('ci-runners', 'Autoscaled, idle 61% of hours', 2820)] },
      { name: 'Database', spend: 9310, budget: 10000, items: [item('orders-primary', 'Postgres 16, 2 vCPU replicas', 5980), item('analytics-warehouse', 'Columnar, 4 TB scanned', 2410), item('Backups', '35-day retention', 920)] },
      { name: 'Storage', spend: 5820, budget: 6500, items: [item('media-uploads', 'Object storage, 41 TB', 3980), item('logs-archive', 'Cold tier, 118 TB', 1240), item('Snapshots', 'Block volumes', 600)] },
      { name: 'Network', spend: 3050, budget: 3200, items: [item('CDN egress', '62 TB to the internet', 2140), item('NAT gateways', '3 zones', 610), item('Inter-region', 'eu-west to us-east', 300)] },
      { name: 'Observability', spend: 1780, budget: 2000, items: [item('Log ingestion', '3.1 TB indexed', 1110), item('Traces', '10% sampling', 450), item('Uptime checks', '48 endpoints', 220)] }
    ]
  },
  sep: {
    label: 'September', prev: 'August', prevTotal: 36940,
    services: [
      { name: 'Compute', spend: 17640, budget: 18000, items: [item('api-prod node pool', '14 × c6i.2xlarge, on-demand', 10380), item('worker-batch', 'Spot fleet, 72% spot', 4510), item('ci-runners', 'Autoscaled, idle 58% of hours', 2750)] },
      { name: 'Database', spend: 9620, budget: 10000, items: [item('orders-primary', 'Postgres 16, 2 vCPU replicas', 6110), item('analytics-warehouse', 'Columnar, 4.4 TB scanned', 2560), item('Backups', '35-day retention', 950)] },
      { name: 'Storage', spend: 6010, budget: 6500, items: [item('media-uploads', 'Object storage, 43 TB', 4090), item('logs-archive', 'Cold tier, 124 TB', 1290), item('Snapshots', 'Block volumes', 630)] },
      { name: 'Network', spend: 3110, budget: 3200, items: [item('CDN egress', '64 TB to the internet', 2180), item('NAT gateways', '3 zones', 620), item('Inter-region', 'eu-west to us-east', 310)] },
      { name: 'Observability', spend: 1860, budget: 2000, items: [item('Log ingestion', '3.3 TB indexed', 1170), item('Traces', '10% sampling', 470), item('Uptime checks', '48 endpoints', 220)] }
    ]
  },
  oct: {
    label: 'October', prev: 'September', prevTotal: 38240,
    services: [
      { name: 'Compute', spend: 18420, budget: 18000, items: [item('api-prod node pool', '16 × c6i.2xlarge after the launch', 11240), item('worker-batch', 'Spot fleet, 74% spot', 4470), item('ci-runners', 'Autoscaled, idle 55% of hours', 2710)] },
      { name: 'Database', spend: 9870, budget: 10000, items: [item('orders-primary', 'Postgres 16, 3 replicas since Oct 9', 6380), item('analytics-warehouse', 'Columnar, 4.6 TB scanned', 2520), item('Backups', '35-day retention', 970)] },
      { name: 'Storage', spend: 6240, budget: 6500, items: [item('media-uploads', 'Object storage, 46 TB', 4260), item('logs-archive', 'Cold tier, 131 TB', 1330), item('Snapshots', 'Block volumes', 650)] },
      { name: 'Network', spend: 3180, budget: 3200, items: [item('CDN egress', '67 TB to the internet', 2230), item('NAT gateways', '3 zones', 630), item('Inter-region', 'eu-west to us-east', 320)] },
      { name: 'Observability', spend: 1940, budget: 2000, items: [item('Log ingestion', '3.4 TB indexed', 1210), item('Traces', '10% sampling', 500), item('Uptime checks', '52 endpoints', 230)] }
    ]
  }
}

const month = computed(() => invoices[String(monthId.value ?? 'oct')]!)
const slices = computed(() => month.value.services.map((s, i) => ({ label: s.name, value: s.spend, color: colors[i] })))
const total = computed(() => month.value.services.reduce((n, s) => n + s.spend, 0))
const delta = computed(() => (total.value / month.value.prevTotal - 1) * 100)

// Hover previews a service, a click pins it; the panel shows the preview first.
const hovered = ref(-1)
const selected = ref(0)
const focus = computed(() => (hovered.value >= 0 ? hovered.value : selected.value))
const current = computed(() => month.value.services[focus.value]!)
const overBudget = computed(() => current.value.spend > current.value.budget)

const money = (n: number) => '$' + n.toLocaleString('en-US')
const pct = (n: number) => Math.round((n / total.value) * 100) + '%'
</script>

<style scoped>
.cs__center-sub.is-up { color: var(--mi-orange-t); }
.cs__center-sub.is-down { color: var(--mi-green-t); }
.cs__row { font: inherit; font-size: 14px;
}
.cs__detail-top > :nth-child(2) { flex: 1; min-width: 0; }
.cs__items-title { margin-top: 6px; text-transform: uppercase; letter-spacing: .06em; }
.cs__items li { display: grid; }
.cs__items li::before { font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
</style>
