<template>
  <section class="cs" aria-labelledby="cs-title">
    <header class="cs__head">
      <div>
        <MiText id="cs-title" variant="title3" as="h2" weight="semibold">Where the cloud bill goes</MiText>
        <MiText variant="footnote" tone="label2">Production account · {{ month.label }} invoice, USD</MiText>
      </div>
      <MiSegmented v-model="monthId" label="Invoice month" :options="months" />
    </header>

    <div class="cs__grid">
      <div class="cs__chart">
        <div class="cs__donut">
          <MiDonutChart
            :key="String(monthId)" :data="slices" :card="false" :legend="false" :toggle="false" :size="236" :thickness="34"
            :active="hovered" :format-value="(v) => money(v)" total-label="This month"
            :aria-label="`${month.label} spend by service, ${money(total)} in total`"
            @update:active="hovered = $event"
          >
            <template #center="{ active, totalText }">
              <div class="cs__center">
                <span class="cs__center-label">{{ active ? active.label : 'Total' }}</span>
                <span class="cs__center-value">{{ active ? active.text : totalText }}</span>
                <span v-if="active" class="cs__center-sub">{{ pct(active.value) }} of bill</span>
                <span v-else class="cs__center-sub" :class="delta >= 0 ? 'is-up' : 'is-down'">{{ delta >= 0 ? '+' : '' }}{{ delta.toFixed(1) }}% vs {{ month.prev }}</span>
              </div>
            </template>
          </MiDonutChart>
        </div>

        <!-- Custom legend doubles as the selector for the drill-down panel. -->
        <ul class="cs__legend" aria-label="Services">
          <li v-for="(s, i) in month.services" :key="s.name">
            <button
              type="button" class="cs__row" :class="{ 'is-on': focus === i }" :aria-pressed="selected === i"
              @click="selected = i" @mouseenter="hovered = i" @mouseleave="hovered = -1" @focus="hovered = i" @blur="hovered = -1"
            >
              <i :style="{ background: colors[i] }" aria-hidden="true" />
              <span class="cs__row-name">{{ s.name }}</span>
              <span class="cs__row-val">{{ money(s.spend) }}</span>
              <span class="cs__row-share">{{ pct(s.spend) }}</span>
            </button>
          </li>
        </ul>
      </div>

      <article class="cs__detail" aria-live="polite" aria-labelledby="cs-detail-title">
        <div class="cs__detail-top">
          <span class="cs__swatch" :style="{ background: colors[focus] }" aria-hidden="true" />
          <MiText id="cs-detail-title" variant="headline" as="h3">{{ current.name }}</MiText>
          <MiBadge :tone="overBudget ? 'warning' : 'success'" :label="overBudget ? 'Over budget' : 'Within budget'" dot />
        </div>
        <p class="cs__detail-big">{{ money(current.spend) }}</p>
        <MiMeter
          :value="current.spend" :max="current.budget" :color="overBudget ? 'var(--mi-orange)' : colors[focus]"
          :aria-label="`${current.name} budget used`"
          :caption="`${Math.round((current.spend / current.budget) * 100)}% of ${money(current.budget)} budget`"
          :hint="overBudget ? `${money(current.spend - current.budget)} over` : `${money(current.budget - current.spend)} left`"
        />

        <MiText variant="caption" tone="label2" weight="medium" as="h4" class="cs__items-title">Top line items</MiText>
        <ol class="cs__items">
          <li v-for="item in current.items" :key="item.name">
            <div class="cs__item-text">
              <MiText variant="footnote" weight="medium" :lines="1">{{ item.name }}</MiText>
              <MiText variant="caption" tone="label2" :lines="1">{{ item.note }}</MiText>
            </div>
            <span class="cs__item-val">{{ money(item.spend) }}</span>
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
.cs { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.cs__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.cs__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .cs__grid { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); } }

.cs__chart { display: grid; gap: 16px; align-items: center; min-width: 0; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 560px) { .cs__chart { grid-template-columns: 220px minmax(0, 1fr); } }
/* The donut sizes itself from its container, so give it a definite width. */
.cs__donut { width: 100%; max-width: 236px; justify-self: center; }

.cs__center { display: grid; justify-items: center; gap: 2px; text-align: center; }
.cs__center-label { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.cs__center-value { font-size: 24px; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.cs__center-sub { font-size: 11px; font-weight: 600; color: var(--mi-label2); }
.cs__center-sub.is-up { color: var(--mi-orange-t); }
.cs__center-sub.is-down { color: var(--mi-green-t); }

.cs__legend { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.cs__row {
  display: grid; grid-template-columns: 10px minmax(0, 1fr) auto 38px; align-items: center; gap: 10px; width: 100%; padding: 9px 10px;
  border: 0; border-radius: var(--mi-radius-m); background: transparent; color: inherit; font: inherit; font-size: 14px; text-align: start; cursor: pointer;
  transition: background-color var(--mi-dur-2) var(--mi-ease);
}
.cs__row:hover, .cs__row.is-on { background: var(--mi-fill4); }
.cs__row[aria-pressed="true"] { box-shadow: inset 0 0 0 1px var(--mi-sep); }
.cs__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.cs__row i { width: 10px; height: 10px; border-radius: 3px; }
.cs__row-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.cs__row-val { font-variant-numeric: tabular-nums; }
.cs__row-share { text-align: end; color: var(--mi-label2); font-size: 12px; font-variant-numeric: tabular-nums; }

.cs__detail { display: grid; gap: 10px; align-content: start; min-width: 0; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cs__detail-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cs__detail-top > :nth-child(2) { flex: 1; min-width: 0; }
.cs__swatch { width: 14px; height: 14px; border-radius: 4px; }
.cs__detail-big { margin: 0; font-size: clamp(30px, 6cqi, 40px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.cs__items-title { margin-top: 6px; text-transform: uppercase; letter-spacing: .06em; }
.cs__items { display: grid; margin: 0; padding: 0; list-style: none; counter-reset: cs; }
.cs__items li { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 9px 0; border-top: 1px solid var(--mi-sep); counter-increment: cs; }
.cs__items li::before { content: counter(cs); font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.cs__item-text { display: grid; min-width: 0; }
.cs__item-val { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>
