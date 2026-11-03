<template>
  <section class="rgt mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="rgt-title">
    <header class="rgt__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="rgt-title" variant="title3" as="h2" weight="semibold">Delivery roadmap</MiText>
        <MiText variant="footnote" tone="label2">{{ rows.length }} projects · {{ money(spent) }} of {{ money(budget) }} spent</MiText>
      </div>
      <div class="rgt__tools mi:flex mi:flex-wrap mi:gap-2">
        <MiSegmented v-model="team" label="Team" :options="teams" />
        <MiSegmented v-model="range" label="Time range" :options="ranges" />
      </div>
    </header>

    <div class="rgt__table mi:hidden mi:relative mi:min-w-0 mi:overflow-x-auto mi:@[820px]:block">
      <MiTable :columns="columns" :rows="rows" caption="Projects with their schedule" density="relaxed" :zebra="false" empty-text="No project for this team.">
        <template #cell-name="{ row }">
          <span class="rgt__proj mi:grid mi:min-w-0">
            <span class="rgt__name mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ x(row).name }}</span>
            <span class="rgt__team mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:text-label2 mi:whitespace-nowrap">{{ x(row).team }} · <MiAvatar :name="x(row).lead" size="xs" tone="auto" decorative /> {{ x(row).lead.split(' ')[0] }}</span>
          </span>
        </template>
        <template #cell-status="{ row }"><MiBadge :tone="tones[x(row).status]" :label="labels[x(row).status]" dot /></template>
        <template #cell-burn="{ row }">
          <span class="rgt__burn mi:grid mi:gap-1">
            <span class="rgt__burn-num mi:text-[12.5px] mi:font-semibold mi:tabular-nums mi:whitespace-nowrap">{{ money(x(row).spent) }} <small class="mi:[.rgt__burn-num_&]:text-[11px] mi:[.rgt__burn-num_&]:font-normal mi:[.rgt__burn-num_&]:text-label2">/ {{ money(x(row).budget) }}</small></span>
            <span class="rgt__burn-bar mi:block mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" :class="{ 'is-hot': x(row).spent / x(row).budget > 0.9 }"><i class="mi:[.rgt__burn-bar_&]:block mi:[.rgt__burn-bar_&]:h-full mi:[.rgt__burn-bar_&]:[background:var(--mi-label2)] mi:[.rgt__burn-bar_&]:origin-left mi:[.rgt__burn-bar.is-hot_&]:[background:var(--mi-red)]" :style="{ transform: `scaleX(${x(row).spent / x(row).budget})` }" /></span>
          </span>
        </template>
        <template #cell-schedule="{ row, index }">
          <!-- Gantt cell: month lines and today's line repeat in every row, so they read as one chart; the first row carries the scale. -->
          <span class="rgt__lane mi:relative mi:block mi:[&.has-scale]:pt-4" :class="{ 'has-scale': index === 0 }" :aria-label="`${x(row).name}: ${x(row).startLabel} to ${x(row).endLabel}`" role="img">
            <template v-for="m in frame.months" :key="m.label">
              <i class="rgt__grid mi:absolute mi:-top-3 mi:-bottom-3 mi:w-px mi:[background:var(--mi-sep)] mi:[.rgt__lane--card_&]:top-0 mi:[.rgt__lane--card_&]:bottom-0 mi:[.rgt__lane.has-scale_&]:top-0.5" :style="{ insetInlineStart: m.at + '%' }" />
              <span v-if="index === 0" class="rgt__month mi:absolute mi:top-0 mi:ps-1 mi:text-[10.5px] mi:font-semibold mi:text-label2 mi:whitespace-nowrap" :style="{ insetInlineStart: m.at + '%' }">{{ m.label }}</span>
            </template>
            <b v-if="x(row).bar.show" class="rgt__bar mi:absolute mi:top-[7px] mi:bottom-[7px] mi:rounded-[6px] mi:[.rgt__lane--card_&]:top-[5px] mi:[.rgt__lane--card_&]:bottom-[5px] mi:[&.is-active]:[background:var(--mi-p)] mi:[&.is-risk]:[background:var(--mi-orange)] mi:[&.is-review]:[background:var(--mi-s)] mi:[&.is-planned]:shadow-[inset_0_0_0_1.5px_var(--mi-label3)] mi:[&.cut-start]:[border-start-start-radius:0] mi:[&.cut-start]:[border-end-start-radius:0] mi:[&.cut-end]:[border-start-end-radius:0] mi:[&.cut-end]:[border-end-end-radius:0] mi:[.rgt__lane.has-scale_&]:top-[23px] mi:[.rgt__lane.has-scale_&]:bottom-[7px]" :class="barClass(x(row))" :style="barStyle(x(row))" />
            <span v-else class="rgt__off mi:absolute mi:inset-0 mi:flex mi:items-center mi:[justify-content:flex-end] mi:pe-1.5 mi:text-[11px] mi:text-label3">{{ x(row).start > frame.end ? 'Starts ' + x(row).startLabel : 'Ended ' + x(row).endLabel }}</span>
            <i class="rgt__today mi:absolute mi:-top-3 mi:-bottom-3 mi:w-0.5 mi:-ms-px mi:[background:color-mix(in_srgb,_var(--mi-red)_70%,_transparent)] mi:[.rgt__lane--card_&]:top-[-3px] mi:[.rgt__lane--card_&]:bottom-[-3px] mi:[.rgt__lane.has-scale_&]:top-0.5" :style="{ insetInlineStart: frame.today + '%' }" />
          </span>
        </template>
        <template #cell-end="{ row }"><span class="rgt__due mi:text-[13px] mi:tabular-nums mi:whitespace-nowrap">{{ x(row).endLabel }}</span></template>
      </MiTable>
    </div>

    <ul class="rgt__cards mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[820px]:hidden">
      <li v-for="p in rows" :key="p.id" class="rgt__card mi:grid mi:gap-2 mi:py-3 mi:px-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <div class="rgt__card-top mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2">
          <span class="rgt__proj mi:grid mi:min-w-0"><span class="rgt__name mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ p.name }}</span><span class="rgt__team mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:text-label2 mi:whitespace-nowrap">{{ p.team }} · {{ p.lead }}</span></span>
          <MiBadge :tone="tones[p.status]" :label="labels[p.status]" dot />
        </div>
        <span class="rgt__lane rgt__lane--card mi:relative mi:block mi:my-0.5 mi:mx-0 mi:[&.has-scale]:pt-4" aria-hidden="true">
          <i v-for="m in frame.months" :key="m.label" class="rgt__grid mi:absolute mi:-top-3 mi:-bottom-3 mi:w-px mi:[background:var(--mi-sep)] mi:[.rgt__lane--card_&]:top-0 mi:[.rgt__lane--card_&]:bottom-0 mi:[.rgt__lane.has-scale_&]:top-0.5" :style="{ insetInlineStart: m.at + '%' }" />
          <b v-if="p.bar.show" class="rgt__bar mi:absolute mi:top-[7px] mi:bottom-[7px] mi:rounded-[6px] mi:[.rgt__lane--card_&]:top-[5px] mi:[.rgt__lane--card_&]:bottom-[5px] mi:[&.is-active]:[background:var(--mi-p)] mi:[&.is-risk]:[background:var(--mi-orange)] mi:[&.is-review]:[background:var(--mi-s)] mi:[&.is-planned]:shadow-[inset_0_0_0_1.5px_var(--mi-label3)] mi:[&.cut-start]:[border-start-start-radius:0] mi:[&.cut-start]:[border-end-start-radius:0] mi:[&.cut-end]:[border-start-end-radius:0] mi:[&.cut-end]:[border-end-end-radius:0] mi:[.rgt__lane.has-scale_&]:top-[23px] mi:[.rgt__lane.has-scale_&]:bottom-[7px]" :class="barClass(p)" :style="barStyle(p)" />
          <i class="rgt__today mi:absolute mi:-top-3 mi:-bottom-3 mi:w-0.5 mi:-ms-px mi:[background:color-mix(in_srgb,_var(--mi-red)_70%,_transparent)] mi:[.rgt__lane--card_&]:top-[-3px] mi:[.rgt__lane--card_&]:bottom-[-3px] mi:[.rgt__lane.has-scale_&]:top-0.5" :style="{ insetInlineStart: frame.today + '%' }" />
        </span>
        <MiText variant="caption" tone="label2" tabular>{{ p.startLabel }} → {{ p.endLabel }} · {{ money(p.spent) }} of {{ money(p.budget) }}</MiText>
      </li>
      <li v-if="!rows.length" class="rgt__none mi:p-5 mi:text-center"><MiText variant="footnote" tone="label2">No project for this team.</MiText></li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'active' | 'risk' | 'review' | 'planned'
const tones = { active: 'primary', risk: 'warning', review: 'secondary', planned: 'neutral' } as const
const labels: Record<Status, string> = { active: 'In progress', risk: 'At risk', review: 'In review', planned: 'Planned' }

const DAY = 86_400_000
const TODAY = Date.UTC(2026, 10, 2)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parse = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const label = (ms: number) => { const d = new Date(ms); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` }

// Sample portfolio; budgets in dollars.
const projects = [
  { id: 'r1', name: 'Checkout redesign', team: 'Web', lead: 'Inès Moreau', status: 'active', start: '2026-09-01', end: '2026-11-27', budget: 84_000, spent: 61_200 },
  { id: 'r2', name: 'Android 3.0 parity', team: 'Mobile', lead: 'Yuki Tanaka', status: 'risk', start: '2026-08-17', end: '2026-12-11', budget: 120_000, spent: 97_400 },
  { id: 'r3', name: 'Partner API v2', team: 'Platform', lead: 'Kofi Mensah', status: 'active', start: '2026-07-06', end: '2026-11-20', budget: 70_000, spent: 52_900 },
  { id: 'r4', name: 'Data retention policy', team: 'Platform', lead: 'Lena Vogel', status: 'review', start: '2026-10-19', end: '2026-11-06', budget: 12_000, spent: 10_300 },
  { id: 'r5', name: 'Brand refresh', team: 'Web', lead: 'Saoirse Byrne', status: 'active', start: '2026-10-05', end: '2026-12-18', budget: 40_000, spent: 9_100 },
  { id: 'r6', name: 'Warehouse scanner', team: 'Mobile', lead: 'Tomás Ruiz', status: 'risk', start: '2026-06-22', end: '2026-11-13', budget: 95_000, spent: 91_800 },
  { id: 'r7', name: 'Billing migration', team: 'Platform', lead: 'Arjun Mehta', status: 'planned', start: '2026-11-16', end: '2027-01-29', budget: 60_000, spent: 0 },
  { id: 'r8', name: 'iOS home widgets', team: 'Mobile', lead: 'Yuki Tanaka', status: 'planned', start: '2026-12-01', end: '2026-12-22', budget: 18_000, spent: 0 }
].map(p => ({ ...p, status: p.status as Status, start: parse(p.start), end: parse(p.end), startLabel: label(parse(p.start)), endLabel: label(parse(p.end)) }))
type Project = typeof projects[number]

const teams = [{ value: 'all', label: 'All' }, { value: 'Web', label: 'Web' }, { value: 'Mobile', label: 'Mobile' }, { value: 'Platform', label: 'Platform' }]
const team = ref<string | number | null>('all')
const ranges = [{ value: 'q4', label: 'Q4' }, { value: 'weeks', label: '6 weeks' }]
const range = ref<string | number | null>('q4')

// The visible time window, with month boundaries and today as percentages of its width.
const frame = computed(() => {
  const start = range.value === 'q4' ? Date.UTC(2026, 9, 1) : TODAY - 7 * DAY
  const end = range.value === 'q4' ? Date.UTC(2027, 0, 1) : TODAY + 35 * DAY
  const pct = (ms: number) => ((ms - start) / (end - start)) * 100
  const months: { label: string, at: number }[] = []
  for (let m = 9; m <= 12; m++) {
    const at = pct(Date.UTC(2026, m, 1))
    if (at >= 0 && at < 100) months.push({ label: MONTHS[m % 12] ?? '', at })
  }
  if (!months.length || (months[0]?.at ?? 0) > 6) months.unshift({ label: MONTHS[new Date(start).getUTCMonth()] ?? '', at: 0 })
  return { start, end, months, today: pct(TODAY), pct }
})

const bar = (p: Project) => {
  const w = frame.value
  if (p.end < w.start || p.start > w.end) return { show: false, left: 0, width: 0, cutStart: false, cutEnd: false }
  const left = Math.max(0, w.pct(p.start))
  const right = Math.min(100, w.pct(p.end))
  return { show: true, left, width: Math.max(1.5, right - left), cutStart: p.start < w.start, cutEnd: p.end > w.end }
}
type Row = Project & { bar: ReturnType<typeof bar> }
const x = (row: Record<string, unknown>) => row as unknown as Row
const barClass = (p: Row) => ['is-' + p.status, { 'cut-start': p.bar.cutStart, 'cut-end': p.bar.cutEnd }]
const barStyle = (p: Row) => ({ insetInlineStart: p.bar.left + '%', width: p.bar.width + '%' })

const rows = computed<Row[]>(() => projects.filter(p => team.value === 'all' || p.team === team.value).map(p => ({ ...p, bar: bar(p) })))
const budget = computed(() => rows.value.reduce((n, p) => n + p.budget, 0))
const spent = computed(() => rows.value.reduce((n, p) => n + p.spent, 0))
const money = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`)

const columns = [
  { key: 'name', label: 'Project', sortable: true, width: '200px' },
  { key: 'status', label: 'Status', sortable: true, width: '120px' },
  { key: 'burn', label: 'Budget', sortable: true, width: '130px', sortBy: (r: Record<string, unknown>) => x(r).spent / x(r).budget },
  { key: 'schedule', label: 'Schedule', sortable: true, sortBy: (r: Record<string, unknown>) => x(r).start },
  { key: 'end', label: 'Due', sortable: true, align: 'end' as const, width: '72px' }
]
</script>

<style scoped>
/* Gantt lane */
.rgt__lane { height: 30px; min-width: 220px; }
.rgt__lane--card { height: 22px; min-width: 0; }
.rgt__bar.is-planned { background: transparent; background-image: repeating-linear-gradient(135deg, var(--mi-fill3) 0 4px, transparent 4px 8px); }

.rgt__lane.has-scale { height: 46px; }
</style>
