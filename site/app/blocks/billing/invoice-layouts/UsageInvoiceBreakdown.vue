<template>
  <section class="mi:@container mi:flex mi:flex-col mi:gap-5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="uib-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3.5 mi:pb-4.5 mi:border-b mi:border-b-sep">
      <div class="mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText variant="caption" tone="label2" weight="medium">Invoice INV-2026-1107 · 1–31 October 2026</MiText>
        <MiText id="uib-title" as="h2" variant="title2" weight="bold">Usage invoice</MiText>
        <MiText variant="footnote" tone="label2">Brightloop Labs · billed to Ondine Analytics GmbH, VAT DE 318 442 907</MiText>
      </div>
      <div class="mi:grid mi:justify-items-start mi:gap-1.5 mi:@[620px]:justify-items-end">
        <MiBadge tone="warning" label="Due 15 November" dot />
        <p class="mi:m-0 mi:text-[clamp(30px,_6cqi,_40px)] mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ money(total) }}</p>
      </div>
    </header>

    <div class="mi:grid mi:gap-3">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
        <MiText as="h3" variant="headline">Where the spend went</MiText>
        <MiSegmented v-model="groupBy" label="Group lines by" :options="groupOptions" />
      </div>
      <MiStackedBar :segments="segments" :height="18" :legend-columns="2" :aria-label="'Spend by ' + groupBy" />
    </div>

    <!-- Same lines, regrouped: by service for engineering, by project for finance. -->
    <MiAccordion v-model="open" type="multiple" variant="plain">
      <MiAccordionItem v-for="g in groups" :key="groupBy + g.name" :value="g.name">
        <template #title>
          <span class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-y-0.5 mi:gap-x-2.5 mi:w-full mi:text-start mi:@[520px]:grid-cols-[auto_minmax(0,_1fr)_auto_auto]">
            <span class="mi:w-2.5 mi:h-2.5 mi:rounded-[3px]" :style="{ background: g.color }" aria-hidden="true" />
            <span class="mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ g.name }}</span>
            <span class="mi:hidden mi:text-[13px] mi:font-normal mi:text-label2 mi:@[520px]:block">{{ g.lines.length }} lines</span>
            <span class="mi:font-semibold mi:tabular-nums">{{ money(g.sum) }}</span>
          </span>
        </template>
        <div class="mi:overflow-x-auto">
          <table class="mi:w-full mi:min-w-105 mi:border-collapse mi:text-[13px] mi:tabular-nums">
            <thead><tr><th class="mi:py-2 mi:px-1.5 mi:text-end mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.04em] mi:uppercase mi:first:text-start" scope="col">Line</th><th class="mi:py-2 mi:px-1.5 mi:text-end mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.04em] mi:uppercase mi:first:text-start" scope="col">Usage</th><th class="mi:py-2 mi:px-1.5 mi:text-end mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.04em] mi:uppercase mi:first:text-start" scope="col">Rate</th><th class="mi:py-2 mi:px-1.5 mi:text-end mi:text-[11px] mi:font-semibold mi:text-label2 mi:tracking-[.04em] mi:uppercase mi:first:text-start" scope="col">Amount</th></tr></thead>
            <tbody>
              <tr v-for="l in g.lines" :key="l.id">
                <th class="mi:py-2 mi:px-1.5 mi:text-end mi:border-t mi:border-t-sep mi:font-medium mi:first:text-start" scope="row">{{ l.metric }}<span class="mi:block mi:text-[12px] mi:font-normal mi:text-label2">{{ groupBy === 'service' ? l.project : l.service }}</span></th>
                <td class="mi:py-2 mi:px-1.5 mi:text-end mi:border-t mi:border-t-sep">{{ l.qty.toLocaleString('en-US') }} {{ l.unit }}</td>
                <td class="mi:py-2 mi:px-1.5 mi:text-end mi:border-t mi:border-t-sep">{{ money(l.rate, 4) }}</td>
                <td class="mi:py-2 mi:px-1.5 mi:text-end mi:border-t mi:border-t-sep">{{ money(l.qty * l.rate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MiAccordionItem>
    </MiAccordion>

    <footer class="mi:grid mi:gap-4 mi:pt-4 mi:border-t mi:border-t-sep mi:@[720px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[720px]:items-end">
      <dl class="mi:grid mi:gap-1.5 mi:m-0 mi:max-w-95 mi:text-[14px]">
        <div class="mi:flex mi:justify-between mi:gap-4"><dt class="mi:text-label2">Subtotal</dt><dd class="mi:m-0 mi:tabular-nums">{{ money(subtotal) }}</dd></div>
        <div class="mi:flex mi:justify-between mi:gap-4"><dt class="mi:text-label2">Committed-use credit</dt><dd class="mi:m-0 mi:tabular-nums mi:text-green-t">−{{ money(credit) }}</dd></div>
        <div class="mi:flex mi:justify-between mi:gap-4"><dt class="mi:text-label2">Reverse charge VAT (0%)</dt><dd class="mi:m-0 mi:tabular-nums">{{ money(0) }}</dd></div>
        <div class="mi:flex mi:justify-between mi:gap-4 mi:pt-2 mi:mt-1 mi:border-t mi:border-t-sep mi:font-bold"><dt class="mi:text-label">Amount due</dt><dd class="mi:m-0 mi:tabular-nums">{{ money(total) }}</dd></div>
      </dl>
      <div class="mi:flex mi:flex-wrap mi:gap-2">
        <MiButton variant="gray">
          <template #leading><MiIcon name="document" :size="16" /></template>
          Download PDF
        </MiButton>
        <MiButton>Pay {{ money(total) }}</MiButton>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Service = 'Compute' | 'Storage' | 'Network'
interface Line { id: string, service: Service, project: string, metric: string, qty: number, unit: string, rate: number }
interface Group { name: string, color: string, lines: Line[], sum: number }

const groupOptions = [{ value: 'service', label: 'Service' }, { value: 'project', label: 'Project' }]
const palette = ['var(--mi-p)', 'var(--mi-s)', 'var(--mi-teal)', 'var(--mi-orange)']

// Sample usage lines; swap for your billing API.
const lines: Line[] = [
  { id: 'c1', service: 'Compute', project: 'ingest-pipeline', metric: 'vCPU hours', qty: 18420, unit: 'h', rate: 0.0312 },
  { id: 'c2', service: 'Compute', project: 'dashboard-api', metric: 'vCPU hours', qty: 6210, unit: 'h', rate: 0.0312 },
  { id: 'c3', service: 'Compute', project: 'ingest-pipeline', metric: 'GPU minutes', qty: 2400, unit: 'min', rate: 0.0425 },
  { id: 's1', service: 'Storage', project: 'ingest-pipeline', metric: 'Object storage', qty: 4820, unit: 'GB-mo', rate: 0.021 },
  { id: 's2', service: 'Storage', project: 'warehouse', metric: 'Block volumes', qty: 1600, unit: 'GB-mo', rate: 0.08 },
  { id: 'n1', service: 'Network', project: 'dashboard-api', metric: 'Egress', qty: 3150, unit: 'GB', rate: 0.05 },
  { id: 'n2', service: 'Network', project: 'warehouse', metric: 'Private link', qty: 744, unit: 'h', rate: 0.015 }
]

const groupBy = ref<string | number | null>('service')
const open = ref<string | string[] | null>(['Compute', 'ingest-pipeline'])
const credit = 150

const groups = computed<Group[]>(() => {
  const key = groupBy.value === 'project' ? 'project' : 'service'
  const map = new Map<string, Line[]>()
  for (const l of lines) map.set(l[key], [...(map.get(l[key]) ?? []), l])
  return [...map].map(([name, ls], i) => ({ name, lines: ls, color: palette[i % palette.length]!, sum: ls.reduce((s, l) => s + l.qty * l.rate, 0) }))
    .sort((a, b) => b.sum - a.sum)
})
const segments = computed(() => groups.value.map(g => ({ label: g.name, value: Math.round(g.sum), color: g.color })))
const subtotal = computed(() => lines.reduce((s, l) => s + l.qty * l.rate, 0))
const total = computed(() => subtotal.value - credit)

const money = (n: number, digits = 2) => '€' + n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
</script>
