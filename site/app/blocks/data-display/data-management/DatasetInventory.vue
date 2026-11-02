<template>
  <section class="dsi" aria-labelledby="dsi-title">
    <header class="dsi__head">
      <div>
        <MiText id="dsi-title" variant="title3" as="h2" weight="semibold">Warehouse tables</MiText>
        <MiText variant="footnote" tone="label2">analytics schema · {{ staleCount }} of {{ sets.length }} tables past their freshness SLA</MiText>
      </div>
      <MiButton size="small" variant="gray">
        <template #leading><MiIcon name="plus" :size="14" /></template>
        Add source
      </MiButton>
    </header>

    <div class="dsi__layout">
      <!-- Freshness list: each bar is the table's age as a share of its SLA, so stale tables read at a glance. -->
      <ul class="dsi__list" aria-label="Tables">
        <li v-for="d in sets" :key="d.id">
          <button type="button" class="dsi__item" :class="{ 'is-on': d.id === active }" :aria-pressed="d.id === active" @click="active = d.id">
            <span class="dsi__item-top">
              <span class="dsi__mono">{{ d.name }}</span>
              <MiText as="span" variant="caption" tone="label2" tabular>{{ d.rows }}</MiText>
            </span>
            <span class="dsi__fresh" :class="'is-' + state(d)">
              <i :style="{ transform: `scaleX(${Math.min(1, d.age / d.sla)})` }" />
            </span>
            <MiText as="span" variant="caption" :tone="state(d) === 'stale' ? 'red' : 'label2'" tabular>
              Updated {{ ago(d.age) }} ago · SLA {{ ago(d.sla) }}
            </MiText>
          </button>
        </li>
      </ul>

      <article class="dsi__detail" :aria-label="current.name + ' details'">
        <div class="dsi__detail-head">
          <div class="dsi__detail-title">
            <MiText as="h3" variant="headline" class="dsi__mono dsi__mono--lg">analytics.{{ current.name }}</MiText>
            <MiText variant="caption" tone="label2">{{ current.blurb }}</MiText>
          </div>
          <MiSegmented v-model="tab" label="Detail view" :options="tabs" />
        </div>

        <dl class="dsi__facts">
          <div><dt>Rows</dt><dd>{{ current.rows }}</dd></div>
          <div><dt>Size</dt><dd>{{ current.size }}</dd></div>
          <div><dt>Owner</dt><dd class="dsi__owner"><MiAvatar :name="current.owner" size="xs" tone="auto" decorative />{{ current.owner }}</dd></div>
          <div><dt>Masked</dt><dd>{{ masked }} of {{ current.columns.length }}</dd></div>
        </dl>

        <ul v-if="tab === 'schema'" class="dsi__cols" aria-label="Columns">
          <li v-for="c in current.columns" :key="c.name" class="dsi__col">
            <div class="dsi__col-name">
              <span class="dsi__mono">{{ c.name }}</span>
              <span class="dsi__type">{{ c.type }}</span>
              <MiBadge v-if="c.pii" tone="warning" label="PII" />
            </div>
            <div class="dsi__nulls" role="meter" :aria-label="c.name + ' null share'" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="c.nulls">
              <span><i :style="{ transform: `scaleX(${c.nulls / 100})` }" /></span>
              <MiText as="span" variant="caption" tone="label2" tabular>{{ c.nulls }}% null</MiText>
            </div>
            <MiSwitch v-model="c.mask" size="compact" :disabled="!c.pii" :label="'Mask ' + c.name" />
          </li>
        </ul>

        <div v-else class="dsi__lineage" aria-label="Lineage">
          <div class="dsi__lane">
            <MiText as="span" variant="caption2" tone="label2" weight="semibold">Sources</MiText>
            <span v-for="s in current.sources" :key="s" class="dsi__node">{{ s }}</span>
          </div>
          <span class="dsi__arrow" aria-hidden="true" />
          <div class="dsi__lane">
            <MiText as="span" variant="caption2" tone="label2" weight="semibold">This table</MiText>
            <span class="dsi__node dsi__node--self">{{ current.name }}</span>
          </div>
          <span class="dsi__arrow" aria-hidden="true" />
          <div class="dsi__lane">
            <MiText as="span" variant="caption2" tone="label2" weight="semibold">Used by</MiText>
            <span v-for="s in current.consumers" :key="s" class="dsi__node">{{ s }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

// Ages and SLAs are in minutes. Sample warehouse; swap for your catalog API.
const sets = reactive([
  {
    id: 'orders', name: 'orders', rows: '4.82M', size: '1.9 GB', age: 12, sla: 60, owner: 'Lena Vogel', blurb: 'One row per checkout, refunds folded in.',
    sources: ['shop-prod.orders', 'Stripe charges'], consumers: ['Revenue dashboard', 'Finance export', 'Churn model'],
    columns: [
      { name: 'order_id', type: 'uuid', nulls: 0, pii: false, mask: false },
      { name: 'customer_email', type: 'text', nulls: 2, pii: true, mask: true },
      { name: 'total_cents', type: 'int8', nulls: 0, pii: false, mask: false },
      { name: 'shipping_address', type: 'jsonb', nulls: 14, pii: true, mask: false },
      { name: 'coupon_code', type: 'text', nulls: 71, pii: false, mask: false },
      { name: 'placed_at', type: 'timestamptz', nulls: 0, pii: false, mask: false }
    ]
  },
  {
    id: 'events', name: 'events_web', rows: '1.27B', size: '412 GB', age: 58, sla: 30, owner: 'Kofi Mensah', blurb: 'Raw page and click events from the web app.',
    sources: ['Segment stream'], consumers: ['Funnel explorer', 'Experiment results'],
    columns: [
      { name: 'event_id', type: 'uuid', nulls: 0, pii: false, mask: false },
      { name: 'anonymous_id', type: 'text', nulls: 0, pii: true, mask: true },
      { name: 'event_name', type: 'text', nulls: 0, pii: false, mask: false },
      { name: 'page_path', type: 'text', nulls: 6, pii: false, mask: false },
      { name: 'ip_address', type: 'inet', nulls: 1, pii: true, mask: true }
    ]
  },
  {
    id: 'customers', name: 'customers', rows: '312k', size: '148 MB', age: 200, sla: 360, owner: 'Inès Moreau', blurb: 'Golden customer record merged from CRM and billing.',
    sources: ['HubSpot contacts', 'Stripe customers'], consumers: ['Revenue dashboard', 'Lifecycle emails'],
    columns: [
      { name: 'customer_id', type: 'uuid', nulls: 0, pii: false, mask: false },
      { name: 'full_name', type: 'text', nulls: 3, pii: true, mask: false },
      { name: 'country', type: 'char(2)', nulls: 1, pii: false, mask: false },
      { name: 'plan', type: 'text', nulls: 0, pii: false, mask: false },
      { name: 'first_paid_at', type: 'timestamptz', nulls: 38, pii: false, mask: false }
    ]
  },
  {
    id: 'subs', name: 'subscriptions', rows: '41k', size: '22 MB', age: 46, sla: 60, owner: 'Lena Vogel', blurb: 'Subscription periods with MRR at each change.',
    sources: ['Stripe subscriptions'], consumers: ['MRR report', 'Churn model'],
    columns: [
      { name: 'subscription_id', type: 'text', nulls: 0, pii: false, mask: false },
      { name: 'mrr_cents', type: 'int8', nulls: 0, pii: false, mask: false },
      { name: 'status', type: 'text', nulls: 0, pii: false, mask: false },
      { name: 'canceled_at', type: 'timestamptz', nulls: 86, pii: false, mask: false }
    ]
  },
  {
    id: 'tickets', name: 'support_tickets', rows: '88k', size: '61 MB', age: 1570, sla: 1440, owner: 'Noor Haddad', blurb: 'Help desk tickets with first-response times.',
    sources: ['Zendesk export'], consumers: ['Support quality board'],
    columns: [
      { name: 'ticket_id', type: 'int8', nulls: 0, pii: false, mask: false },
      { name: 'requester_email', type: 'text', nulls: 0, pii: true, mask: true },
      { name: 'subject', type: 'text', nulls: 0, pii: true, mask: false },
      { name: 'first_reply_min', type: 'int4', nulls: 9, pii: false, mask: false }
    ]
  }
])
type Dataset = typeof sets[number]

const active = ref('orders')
const current = computed(() => sets.find(d => d.id === active.value) ?? sets[0]!)
const tabs = [{ value: 'schema', label: 'Schema' }, { value: 'lineage', label: 'Lineage' }]
const tab = ref<string | number | null>('schema')

const state = (d: Dataset) => (d.age >= d.sla ? 'stale' : d.age / d.sla > 0.75 ? 'warn' : 'ok')
const staleCount = computed(() => sets.filter(d => state(d) === 'stale').length)
const masked = computed(() => current.value.columns.filter(c => c.mask).length)
const ago = (min: number) => (min < 60 ? `${min} min` : min < 1440 ? `${Math.round(min / 60)} h` : `${Math.floor(min / 1440)} d ${Math.round((min % 1440) / 60)} h`)
</script>

<style scoped>
.dsi { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.dsi__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dsi__mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; font-weight: 600; overflow-wrap: anywhere; }
.dsi__mono--lg { font-size: 15px; }

.dsi__layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@container (min-width: 760px) { .dsi__layout { grid-template-columns: 260px minmax(0, 1fr); align-items: start; } }

.dsi__list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 480px) and (max-width: 759px) { .dsi__list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.dsi__item {
  display: grid; gap: 6px; width: 100%; padding: 12px; border: 0; border-radius: var(--mi-radius-l); text-align: start; font: inherit; color: inherit;
  background: var(--mi-card); box-shadow: var(--mi-sh1); cursor: pointer;
}
.dsi__item.is-on { box-shadow: 0 0 0 2px var(--mi-p), var(--mi-sh1); }
.dsi__item:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.dsi__item-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.dsi__fresh { display: block; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.dsi__fresh i { display: block; height: 100%; border-radius: inherit; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.dsi__fresh.is-ok i { background: var(--mi-green); }
.dsi__fresh.is-warn i { background: var(--mi-orange); }
.dsi__fresh.is-stale i { background: var(--mi-red); }

.dsi__detail { display: grid; gap: 16px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.dsi__detail-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; }
.dsi__detail-title { display: grid; gap: 2px; min-width: 0; }
.dsi__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 0; border-radius: var(--mi-radius-m); overflow: hidden; background: var(--mi-sep); }
@container (min-width: 560px) { .dsi__facts { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.dsi__facts div { display: grid; gap: 2px; padding: 10px 12px; background: var(--mi-card); }
.dsi__facts dt { font-size: 11px; color: var(--mi-label2); }
.dsi__facts dd { margin: 0; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.dsi__facts dd.dsi__owner { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 13px; }

.dsi__cols { display: grid; margin: 0; padding: 0; list-style: none; }
.dsi__col { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 6px 12px; padding: 10px 0; }
.dsi__col + .dsi__col { border-top: 1px solid var(--mi-sep); }
.dsi__col-name { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; }
.dsi__type { padding: 1px 6px; border-radius: 5px; font-size: 11px; color: var(--mi-label2); background: var(--mi-fill2); }
.dsi__nulls { display: flex; align-items: center; gap: 8px; grid-column: 1; grid-row: 2; }
.dsi__nulls > span { flex: 0 0 64px; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.dsi__nulls i { display: block; height: 100%; background: var(--mi-label3); transform-origin: left; }
.dsi__col > :last-child { grid-column: 2; grid-row: 1 / span 2; }
@container (min-width: 640px) {
  .dsi__col { grid-template-columns: minmax(0, 1fr) 150px auto; }
  .dsi__nulls { grid-column: 2; grid-row: 1; }
  .dsi__col > :last-child { grid-column: 3; grid-row: 1; }
}

.dsi__lineage { display: grid; gap: 10px; justify-items: start; }
.dsi__lane { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.dsi__lane > :first-child { flex-basis: 100%; }
.dsi__node { padding: 6px 10px; border-radius: 9px; font-size: 13px; font-weight: 500; background: var(--mi-fill2); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.dsi__node--self { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; color: var(--mi-p-text); background: var(--mi-p-tint); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 35%, transparent); }
.dsi__arrow { width: 2px; height: 18px; margin-inline-start: 18px; background: var(--mi-sep); position: relative; }
.dsi__arrow::after { content: ""; position: absolute; bottom: -2px; left: -4px; border: 5px solid transparent; border-top-color: var(--mi-label3); border-bottom: 0; }
@container (min-width: 900px) {
  .dsi__lineage { grid-template-columns: 1fr 40px auto 40px 1fr; align-items: center; }
  .dsi__lane { flex-direction: column; align-items: stretch; }
  .dsi__arrow { width: 100%; height: 2px; margin: 18px 0 0; }
  .dsi__arrow::after { bottom: auto; top: -4px; left: auto; right: -2px; border: 5px solid transparent; border-left-color: var(--mi-label3); border-right: 0; }
}
</style>
