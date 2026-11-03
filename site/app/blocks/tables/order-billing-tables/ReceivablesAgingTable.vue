<template>
  <section class="rcv mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="rcv-title">
    <header class="rcv__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="rcv-title" variant="title3" as="h2" weight="semibold">Receivables</MiText>
        <MiText variant="footnote" tone="label2">Field &amp; Form studio · as of Nov 2, 2026</MiText>
      </div>
      <div class="rcv__total mi:grid mi:justify-items-end">
        <MiText as="span" variant="caption" tone="label2">Outstanding</MiText>
        <span class="rcv__big mi:text-[clamp(26px,_6cqi,_34px)] mi:font-bold mi:tracking-[-.035em] mi:leading-[1.1] mi:tabular-nums">{{ money(outstanding) }}</span>
      </div>
    </header>

    <!-- Aging strip: the outstanding total split by lateness; each bucket is a filter. -->
    <div class="rcv__aging mi:flex mi:gap-1" role="group" aria-label="Filter by age">
      <button
        v-for="b in buckets" :key="b.id" type="button" class="rcv__bucket mi:grid mi:content-start mi:gap-1 mi:basis-0 mi:min-w-0 mi:pt-0 mi:px-0 mi:pb-1 mi:[border:0] mi:[background:none] mi:text-start mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-dim]:opacity-40 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px] mi:focus-visible:rounded-[6px]" :class="['rcv__bucket--' + b.id, { 'is-on': bucket === b.id, 'is-dim': bucket && bucket !== b.id }]"
        :style="{ flexGrow: Math.max(b.sum, outstanding * 0.12) }" :aria-pressed="bucket === b.id" @click="pick(b.id)"
      >
        <span class="rcv__bucket-bar mi:h-2.5 mi:rounded-[5px] mi:origin-bottom mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[.rcv__bucket:hover_&]:transform-[scaleY(1.5)] mi:[.rcv__bucket.is-on_&]:transform-[scaleY(1.5)] mi:[.rcv__bucket--current_&]:[background:var(--mi-fill4)] mi:[.rcv__bucket--d30_&]:[background:var(--mi-orange)] mi:[.rcv__bucket--d60_&]:[background:color-mix(in_srgb,_var(--mi-red)_70%,_var(--mi-orange))] mi:[.rcv__bucket--d90_&]:[background:var(--mi-red)]" aria-hidden="true" />
        <span class="rcv__bucket-label mi:text-[11px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ b.label }}</span>
        <span class="rcv__bucket-sum mi:text-[14px] mi:font-650 mi:tabular-nums mi:whitespace-nowrap">{{ money(b.sum, true) }}</span>
      </button>
    </div>

    <div class="rcv__toolbar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-3">
      <MiSegmented v-model="status" label="Status" :options="statuses" />
      <MiText variant="caption" tone="label2" tabular aria-live="polite">{{ rows.length }} invoices · {{ money(rows.reduce((n, r) => n + r.amount, 0)) }}</MiText>
    </div>

    <div class="rcv__table mi:hidden mi:min-w-0 mi:overflow-x-auto mi:rounded-lg mi:@[720px]:block">
      <MiTable :columns="columns" :rows="rows" caption="Invoices" density="relaxed" :zebra="false" empty-text="No invoice in this bucket.">
        <template #cell-number="{ row }">
          <span class="rcv__inv mi:grid mi:min-w-0"><span class="rcv__mono mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12.5px] mi:font-semibold">{{ r(row).number }}</span><span class="rcv__cust mi:text-[12px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ r(row).customer }}</span></span>
        </template>
        <template #cell-due="{ row }">
          <span class="rcv__due mi:grid mi:leading-[1.3]">
            <span>{{ r(row).dueLabel }}</span>
            <span v-if="r(row).late > 0 && r(row).status === 'open'" class="rcv__late mi:text-[11.5px] mi:font-semibold" :class="'rcv__late--' + r(row).bucket">{{ r(row).late }} days late</span>
          </span>
        </template>
        <template #cell-amount="{ row }"><span class="rcv__amount mi:font-semibold mi:tabular-nums mi:whitespace-nowrap">{{ money(r(row).amount) }}</span></template>
        <template #cell-status="{ row }">
          <MiBadge :tone="badge(r(row)).tone" :label="badge(r(row)).label" dot />
        </template>
        <template #cell-action="{ row }">
          <MiButton
            v-if="r(row).status === 'open' && r(row).late > 0" size="mini" :variant="reminded.has(r(row).id) ? 'plain' : 'tinted'"
            :disabled="reminded.has(r(row).id)" @click="remind(r(row).id)"
          >
            {{ reminded.has(r(row).id) ? 'Reminded' : 'Send reminder' }}
          </MiButton>
        </template>
      </MiTable>
    </div>

    <ul class="rcv__cards mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[720px]:hidden">
      <li v-for="inv in rows" :key="inv.id" class="rcv__card mi:grid mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:[border-inline-start:3px_solid_transparent]" :class="'rcv__card--' + (inv.status === 'open' ? inv.bucket : 'paid')">
        <div class="rcv__card-top mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
          <span class="rcv__inv mi:grid mi:min-w-0"><span class="rcv__mono mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12.5px] mi:font-semibold">{{ inv.number }}</span><span class="rcv__cust mi:text-[12px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ inv.customer }}</span></span>
          <span class="rcv__amount mi:font-semibold mi:tabular-nums mi:whitespace-nowrap">{{ money(inv.amount) }}</span>
        </div>
        <div class="rcv__card-foot mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2.5">
          <MiBadge :tone="badge(inv).tone" :label="badge(inv).label" dot />
          <MiText as="span" variant="caption" tone="label2">{{ inv.status === 'paid' ? 'Paid ' + inv.paidLabel : (inv.late > 0 ? inv.late + ' days late' : 'Due ' + inv.dueLabel) }}</MiText>
          <MiButton
            v-if="inv.status === 'open' && inv.late > 0" size="mini" :variant="reminded.has(inv.id) ? 'plain' : 'tinted'"
            :disabled="reminded.has(inv.id)" class="rcv__card-btn mi:ms-auto" @click="remind(inv.id)"
          >
            {{ reminded.has(inv.id) ? 'Reminded' : 'Remind' }}
          </MiButton>
        </div>
      </li>
      <li v-if="!rows.length" class="rcv__none mi:p-5 mi:text-center"><MiText variant="footnote" tone="label2">No invoice in this bucket.</MiText></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Bucket = 'current' | 'd30' | 'd60' | 'd90'
interface Invoice { id: string, number: string, customer: string, issued: string, due: string, amount: number, status: 'open' | 'paid', paid?: string }

const TODAY = Date.UTC(2026, 10, 2)
const DAY = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parse = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const short = (iso: string) => { const d = new Date(parse(iso)); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` }

// Amounts in dollars. Sample ledger; swap for your billing API.
const invoices: Invoice[] = [
  { id: 'i1', number: 'INV-1049', customer: 'Halden Outdoor', issued: '2026-10-28', due: '2026-11-27', amount: 12_400, status: 'open' },
  { id: 'i2', number: 'INV-1048', customer: 'Pocketmeal', issued: '2026-10-20', due: '2026-11-19', amount: 3_150, status: 'open' },
  { id: 'i3', number: 'INV-1046', customer: 'Brightpath Logistics', issued: '2026-10-01', due: '2026-10-31', amount: 8_760, status: 'open' },
  { id: 'i4', number: 'INV-1044', customer: 'Oakmere Bakery', issued: '2026-09-25', due: '2026-10-10', amount: 1_980, status: 'open' },
  { id: 'i5', number: 'INV-1041', customer: 'Ledgerline GmbH', issued: '2026-09-01', due: '2026-10-01', amount: 9_600, status: 'open' },
  { id: 'i6', number: 'INV-1038', customer: 'Fernhill Clinics', issued: '2026-08-12', due: '2026-09-11', amount: 6_240, status: 'open' },
  { id: 'i7', number: 'INV-1031', customer: 'Tidewater Ferries', issued: '2026-07-01', due: '2026-07-31', amount: 6_790, status: 'open' },
  { id: 'i8', number: 'INV-1043', customer: 'Halden Outdoor', issued: '2026-10-02', due: '2026-11-01', amount: 4_800, status: 'paid', paid: '2026-11-01' },
  { id: 'i9', number: 'INV-1037', customer: 'Pocketmeal', issued: '2026-09-27', due: '2026-10-27', amount: 2_150, status: 'paid', paid: '2026-10-27' }
]

const ledger = invoices.map((inv) => {
  const late = Math.round((TODAY - parse(inv.due)) / DAY)
  const bucket: Bucket = late <= 0 ? 'current' : late <= 30 ? 'd30' : late <= 60 ? 'd60' : 'd90'
  return { ...inv, late, bucket, dueLabel: short(inv.due), issuedLabel: short(inv.issued), paidLabel: inv.paid ? short(inv.paid) : '', dueTs: parse(inv.due) }
})
type Row = typeof ledger[number]
const r = (row: Record<string, unknown>) => row as unknown as Row

const money = (n: number, compact = false) => (compact && n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : '$' + n.toLocaleString('en-US'))
const open = ledger.filter(x => x.status === 'open')
const outstanding = open.reduce((n, x) => n + x.amount, 0)
const buckets = ([['current', 'Not due'], ['d30', '1–30 days'], ['d60', '31–60 days'], ['d90', '60+ days']] as const)
  .map(([id, label]) => ({ id, label, sum: open.filter(x => x.bucket === id).reduce((n, x) => n + x.amount, 0) }))

const statuses = [{ value: 'open', label: 'Open' }, { value: 'paid', label: 'Paid' }, { value: 'all', label: 'All' }]
const status = ref<string | number | null>('open')
const bucket = ref<Bucket | null>(null)
const pick = (id: Bucket) => { bucket.value = bucket.value === id ? null : id; if (bucket.value) status.value = 'open' }

const rows = computed(() => ledger
  .filter(x => (status.value === 'all' || x.status === status.value) && (!bucket.value || (x.status === 'open' && x.bucket === bucket.value)))
  .sort((a, b) => b.late - a.late))

const columns = [
  { key: 'number', label: 'Invoice', sortable: true },
  { key: 'issuedLabel', label: 'Issued', muted: true, width: '96px' },
  { key: 'due', label: 'Due', sortable: true, width: '150px', sortBy: (x: Record<string, unknown>) => r(x).dueTs },
  { key: 'amount', label: 'Amount', sortable: true, align: 'end' as const, numeric: true, width: '120px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'action', label: '', align: 'end' as const, width: '140px' }
]

const badge = (x: Row): { tone: 'success' | 'danger' | 'warning' | 'neutral', label: string } => {
  if (x.status === 'paid') return { tone: 'success', label: 'Paid' }
  if (x.bucket === 'current') return { tone: 'neutral', label: 'Sent' }
  return x.bucket === 'd30' ? { tone: 'warning', label: 'Overdue' } : { tone: 'danger', label: 'Overdue' }
}

const reminded = ref(new Set<string>())
const remind = (id: string) => { reminded.value = new Set(reminded.value).add(id) }
</script>

<style scoped>
.rcv__late--d30 { color: var(--mi-orange-t); }
.rcv__late--d60, .rcv__late--d90 { color: var(--mi-red-t); }
.rcv__card--d30 { border-inline-start-color: var(--mi-orange); }
.rcv__card--d60, .rcv__card--d90 { border-inline-start-color: var(--mi-red); }
</style>
