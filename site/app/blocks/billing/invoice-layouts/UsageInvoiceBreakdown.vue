<template>
  <section class="uib" aria-labelledby="uib-title">
    <header class="uib__head">
      <div class="uib__id">
        <MiText variant="caption" tone="label2" weight="medium">Invoice INV-2026-1107 · 1–31 October 2026</MiText>
        <MiText id="uib-title" as="h2" variant="title2" weight="bold">Usage invoice</MiText>
        <MiText variant="footnote" tone="label2">Brightloop Labs · billed to Ondine Analytics GmbH, VAT DE 318 442 907</MiText>
      </div>
      <div class="uib__due">
        <MiBadge tone="warning" label="Due 15 November" dot />
        <p class="uib__total">{{ money(total) }}</p>
      </div>
    </header>

    <div class="uib__split">
      <div class="uib__split-head">
        <MiText as="h3" variant="headline">Where the spend went</MiText>
        <MiSegmented v-model="groupBy" label="Group lines by" :options="groupOptions" />
      </div>
      <MiStackedBar :segments="segments" :height="18" :legend-columns="2" :aria-label="'Spend by ' + groupBy" />
    </div>

    <!-- Same lines, regrouped: by service for engineering, by project for finance. -->
    <MiAccordion v-model="open" type="multiple" variant="plain" class="uib__groups">
      <MiAccordionItem v-for="g in groups" :key="groupBy + g.name" :value="g.name">
        <template #title>
          <span class="uib__group">
            <span class="uib__dot" :style="{ background: g.color }" aria-hidden="true" />
            <span class="uib__group-name">{{ g.name }}</span>
            <span class="uib__group-n">{{ g.lines.length }} lines</span>
            <span class="uib__group-sum">{{ money(g.sum) }}</span>
          </span>
        </template>
        <div class="uib__table-wrap">
          <table class="uib__table">
            <thead><tr><th scope="col">Line</th><th scope="col">Usage</th><th scope="col">Rate</th><th scope="col">Amount</th></tr></thead>
            <tbody>
              <tr v-for="l in g.lines" :key="l.id">
                <th scope="row">{{ l.metric }}<span>{{ groupBy === 'service' ? l.project : l.service }}</span></th>
                <td>{{ l.qty.toLocaleString('en-US') }} {{ l.unit }}</td>
                <td>{{ money(l.rate, 4) }}</td>
                <td>{{ money(l.qty * l.rate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MiAccordionItem>
    </MiAccordion>

    <footer class="uib__foot">
      <dl class="uib__sums">
        <div><dt>Subtotal</dt><dd>{{ money(subtotal) }}</dd></div>
        <div><dt>Committed-use credit</dt><dd class="is-credit">−{{ money(credit) }}</dd></div>
        <div><dt>Reverse charge VAT (0%)</dt><dd>{{ money(0) }}</dd></div>
        <div class="is-total"><dt>Amount due</dt><dd>{{ money(total) }}</dd></div>
      </dl>
      <div class="uib__actions">
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

<style scoped>
.uib { container-type: inline-size; display: flex; flex-direction: column; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.uib__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; padding-bottom: 18px; border-bottom: 1px solid var(--mi-sep); }
.uib__id { display: grid; gap: 2px; min-width: 0; }
.uib__due { display: grid; justify-items: start; gap: 6px; }
@container (min-width: 620px) { .uib__due { justify-items: end; } }
.uib__total { margin: 0; font-size: clamp(30px, 6cqi, 40px); font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }

.uib__split { display: grid; gap: 12px; }
.uib__split-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }

.uib__group { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 2px 10px; width: 100%; text-align: start; }
.uib__dot { width: 10px; height: 10px; border-radius: 3px; }
.uib__group-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.uib__group-n { display: none; font-size: 13px; font-weight: 400; color: var(--mi-label2); }
.uib__group-sum { font-weight: 600; font-variant-numeric: tabular-nums; }
@container (min-width: 520px) { .uib__group { grid-template-columns: auto minmax(0, 1fr) auto auto; } .uib__group-n { display: block; } }

/* The line table scrolls inside its own wrapper on narrow cards. */
.uib__table-wrap { overflow-x: auto; }
.uib__table { width: 100%; min-width: 420px; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.uib__table th, .uib__table td { padding: 8px 6px; text-align: end; border-top: 1px solid var(--mi-sep); }
.uib__table thead th { border-top: 0; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label2); }
.uib__table th:first-child { text-align: start; }
.uib__table tbody th { font-weight: 500; }
.uib__table tbody th span { display: block; font-size: 12px; font-weight: 400; color: var(--mi-label2); }

.uib__foot { display: grid; gap: 16px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
@container (min-width: 720px) { .uib__foot { grid-template-columns: minmax(0, 1fr) auto; align-items: end; } }
.uib__sums { display: grid; gap: 6px; margin: 0; max-width: 380px; font-size: 14px; }
.uib__sums div { display: flex; justify-content: space-between; gap: 16px; }
.uib__sums dt { color: var(--mi-label2); }
.uib__sums dd { margin: 0; font-variant-numeric: tabular-nums; }
.uib__sums .is-credit { color: var(--mi-green-t); }
.uib__sums .is-total { padding-top: 8px; margin-top: 4px; border-top: 1px solid var(--mi-sep); font-weight: 700; }
.uib__sums .is-total dt { color: var(--mi-label); }
.uib__actions { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
