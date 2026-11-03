<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="dsi-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="dsi-title" variant="title3" as="h2" weight="semibold">Warehouse tables</MiText>
        <MiText variant="footnote" tone="label2">analytics schema · {{ staleCount }} of {{ sets.length }} tables past their freshness SLA</MiText>
      </div>
      <MiButton size="small" variant="gray">
        <template #leading><MiIcon name="plus" :size="14" /></template>
        Add source
      </MiButton>
    </header>

    <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:@[760px]:grid-cols-[260px_minmax(0,_1fr)] mi:@[760px]:items-start">
      <!-- Freshness list: each bar is the table's age as a share of its SLA, so stale tables read at a glance. -->
      <ul class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:[@container_(min-width:_480px)_and_(max-width:_759px)]:grid-cols-2" aria-label="Tables">
        <li v-for="d in sets" :key="d.id">
          <button type="button" class="mi:grid mi:gap-1.5 mi:w-full mi:p-3 mi:[border:0] mi:rounded-lg mi:text-start mi:[font:inherit] mi:text-inherit mi:bg-card mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="d.id === active ? 'mi:shadow-[0_0_0_2px_var(--mi-p),_var(--mi-sh1)]' : 'mi:shadow-1'" :aria-pressed="d.id === active" @click="active = d.id">
            <span class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
              <span class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-[12.5px] mi:font-semibold mi:wrap-anywhere">{{ d.name }}</span>
              <MiText as="span" variant="caption" tone="label2" tabular>{{ d.rows }}</MiText>
            </span>
            <span class="mi:block mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden">
              <i class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] " :class="state(d) === 'warn' ? 'mi:bg-orange' : state(d) === 'stale' ? 'mi:bg-red' : 'mi:bg-green'" :style="{ transform: `scaleX(${Math.min(1, d.age / d.sla)})` }" />
            </span>
            <MiText as="span" variant="caption" :tone="state(d) === 'stale' ? 'red' : 'label2'" tabular>
              Updated {{ ago(d.age) }} ago · SLA {{ ago(d.sla) }}
            </MiText>
          </button>
        </li>
      </ul>

      <article class="mi:grid mi:gap-4 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" :aria-label="current.name + ' details'">
        <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
          <div class="mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText as="h3" variant="headline" class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace]! mi:text-[15px]! mi:font-semibold! mi:wrap-anywhere!">analytics.{{ current.name }}</MiText>
            <MiText variant="caption" tone="label2">{{ current.blurb }}</MiText>
          </div>
          <MiSegmented v-model="tab" label="Detail view" :options="tabs" />
        </div>

        <dl class="mi:grid mi:grid-cols-2 mi:gap-px mi:m-0 mi:rounded-md mi:overflow-hidden mi:bg-sep mi:@[560px]:grid-cols-4">
          <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Rows</dt><dd class="mi:text-[15px] mi:font-semibold mi:m-0 mi:tabular-nums">{{ current.rows }}</dd></div>
          <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Size</dt><dd class="mi:text-[15px] mi:font-semibold mi:m-0 mi:tabular-nums">{{ current.size }}</dd></div>
          <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Owner</dt><dd class="mi:text-[13px] mi:font-semibold mi:m-0 mi:tabular-nums mi:flex mi:items-center mi:gap-1.5 mi:min-w-0"><MiAvatar :name="current.owner" size="xs" tone="auto" decorative />{{ current.owner }}</dd></div>
          <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-2.5 mi:px-3"><dt class="mi:text-[11px] mi:text-label2">Masked</dt><dd class="mi:text-[15px] mi:font-semibold mi:m-0 mi:tabular-nums">{{ masked }} of {{ current.columns.length }}</dd></div>
        </dl>

        <ul v-if="tab === 'schema'" class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Columns">
          <li v-for="c in current.columns" :key="c.name" class="mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:py-2.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep mi:@[640px]:grid-cols-[minmax(0,_1fr)_150px_auto]">
            <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:min-w-0">
              <span class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-[12.5px] mi:font-semibold mi:wrap-anywhere">{{ c.name }}</span>
              <span class="mi:py-px mi:px-1.5 mi:rounded-[5px] mi:text-[11px] mi:text-label2 mi:bg-fill2">{{ c.type }}</span>
              <MiBadge v-if="c.pii" tone="warning" label="PII" />
            </div>
            <div class="mi:flex mi:items-center mi:gap-2 mi:col-[1] mi:row-[2] mi:@[640px]:col-[2] mi:@[640px]:row-[1]" role="meter" :aria-label="c.name + ' null share'" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="c.nulls">
              <span class="mi:bg-fill3 mi:overflow-hidden mi:flex-[0_0_64px] mi:h-1 mi:rounded-[2px]"><i class="mi:block mi:bg-label3 mi:h-full mi:origin-left" :style="{ transform: `scaleX(${c.nulls / 100})` }" /></span>
              <MiText class="mi:bg-fill3 mi:overflow-hidden mi:flex-[0_0_64px]! mi:h-1! mi:rounded-[2px]!" as="span" variant="caption" tone="label2" tabular>{{ c.nulls }}% null</MiText>
            </div>
            <MiSwitch v-model="c.mask" size="compact" class="mi:col-[2] mi:row-[1_/_span_2] mi:@[640px]:col-[3] mi:@[640px]:row-[1]" :disabled="!c.pii" :label="'Mask ' + c.name" />
          </li>
        </ul>

        <div v-else class="mi:grid mi:gap-2.5 mi:justify-items-start mi:@[900px]:grid-cols-[1fr_40px_auto_40px_1fr] mi:@[900px]:items-center" aria-label="Lineage">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:@[900px]:flex-col mi:@[900px]:items-stretch">
            <MiText as="span" variant="caption2" tone="label2" weight="semibold" class="mi:basis-full">Sources</MiText>
            <span v-for="s in current.sources" :key="s" class="mi:text-[13px] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:py-1.5 mi:px-2.5 mi:rounded-[9px] mi:font-medium mi:bg-fill2">{{ s }}</span>
          </div>
          <span class="mi:after:[border:5px_solid_transparent] mi:after:border-t-label3 mi:after:border-b-0 mi:after:[border-bottom-style:none] mi:after:border-b-current mi:@[900px]:after:[border:5px_solid_transparent] mi:@[900px]:after:border-l-label3 mi:@[900px]:after:border-r-0 mi:@[900px]:after:[border-right-style:none] mi:@[900px]:after:border-r-current mi:w-0.5 mi:h-4.5 mi:ms-4.5 mi:bg-sep mi:relative mi:after:content-[''] mi:after:absolute mi:after:-bottom-0.5 mi:after:-left-1 mi:@[900px]:w-full mi:@[900px]:h-0.5 mi:@[900px]:mt-4.5 mi:@[900px]:mx-0 mi:@[900px]:mb-0 mi:@[900px]:after:bottom-auto mi:@[900px]:after:-top-1 mi:@[900px]:after:left-auto mi:@[900px]:after:-right-0.5" aria-hidden="true" />
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:@[900px]:flex-col mi:@[900px]:items-stretch">
            <MiText as="span" variant="caption2" tone="label2" weight="semibold" class="mi:basis-full">This table</MiText>
            <span class="mi:text-[12.5px] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_35%,_transparent)] mi:py-1.5 mi:px-2.5 mi:rounded-[9px] mi:font-medium mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-p-text mi:bg-p-tint">{{ current.name }}</span>
          </div>
          <span class="mi:after:[border:5px_solid_transparent] mi:after:border-t-label3 mi:after:border-b-0 mi:after:[border-bottom-style:none] mi:after:border-b-current mi:@[900px]:after:[border:5px_solid_transparent] mi:@[900px]:after:border-l-label3 mi:@[900px]:after:border-r-0 mi:@[900px]:after:[border-right-style:none] mi:@[900px]:after:border-r-current mi:w-0.5 mi:h-4.5 mi:ms-4.5 mi:bg-sep mi:relative mi:after:content-[''] mi:after:absolute mi:after:-bottom-0.5 mi:after:-left-1 mi:@[900px]:w-full mi:@[900px]:h-0.5 mi:@[900px]:mt-4.5 mi:@[900px]:mx-0 mi:@[900px]:mb-0 mi:@[900px]:after:bottom-auto mi:@[900px]:after:-top-1 mi:@[900px]:after:left-auto mi:@[900px]:after:-right-0.5" aria-hidden="true" />
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:@[900px]:flex-col mi:@[900px]:items-stretch">
            <MiText as="span" variant="caption2" tone="label2" weight="semibold" class="mi:basis-full">Used by</MiText>
            <span v-for="s in current.consumers" :key="s" class="mi:text-[13px] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:py-1.5 mi:px-2.5 mi:rounded-[9px] mi:font-medium mi:bg-fill2">{{ s }}</span>
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
