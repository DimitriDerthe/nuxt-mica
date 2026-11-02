<template>
  <section class="rgt" aria-labelledby="rgt-title">
    <header class="rgt__head">
      <div>
        <MiText id="rgt-title" variant="title3" as="h2" weight="semibold">Delivery roadmap</MiText>
        <MiText variant="footnote" tone="label2">{{ rows.length }} projects · {{ money(spent) }} of {{ money(budget) }} spent</MiText>
      </div>
      <div class="rgt__tools">
        <MiSegmented v-model="team" label="Team" :options="teams" />
        <MiSegmented v-model="range" label="Time range" :options="ranges" />
      </div>
    </header>

    <div class="rgt__table">
      <MiTable :columns="columns" :rows="rows" caption="Projects with their schedule" density="relaxed" :zebra="false" empty-text="No project for this team.">
        <template #cell-name="{ row }">
          <span class="rgt__proj">
            <span class="rgt__name">{{ x(row).name }}</span>
            <span class="rgt__team">{{ x(row).team }} · <MiAvatar :name="x(row).lead" size="xs" tone="auto" decorative /> {{ x(row).lead.split(' ')[0] }}</span>
          </span>
        </template>
        <template #cell-status="{ row }"><MiBadge :tone="tones[x(row).status]" :label="labels[x(row).status]" dot /></template>
        <template #cell-burn="{ row }">
          <span class="rgt__burn">
            <span class="rgt__burn-num">{{ money(x(row).spent) }} <small>/ {{ money(x(row).budget) }}</small></span>
            <span class="rgt__burn-bar" :class="{ 'is-hot': x(row).spent / x(row).budget > 0.9 }"><i :style="{ transform: `scaleX(${x(row).spent / x(row).budget})` }" /></span>
          </span>
        </template>
        <template #cell-schedule="{ row, index }">
          <!-- Gantt cell: month lines and today's line repeat in every row, so they read as one chart; the first row carries the scale. -->
          <span class="rgt__lane" :class="{ 'has-scale': index === 0 }" :aria-label="`${x(row).name}: ${x(row).startLabel} to ${x(row).endLabel}`" role="img">
            <template v-for="m in frame.months" :key="m.label">
              <i class="rgt__grid" :style="{ insetInlineStart: m.at + '%' }" />
              <span v-if="index === 0" class="rgt__month" :style="{ insetInlineStart: m.at + '%' }">{{ m.label }}</span>
            </template>
            <b v-if="x(row).bar.show" class="rgt__bar" :class="barClass(x(row))" :style="barStyle(x(row))" />
            <span v-else class="rgt__off">{{ x(row).start > frame.end ? 'Starts ' + x(row).startLabel : 'Ended ' + x(row).endLabel }}</span>
            <i class="rgt__today" :style="{ insetInlineStart: frame.today + '%' }" />
          </span>
        </template>
        <template #cell-end="{ row }"><span class="rgt__due">{{ x(row).endLabel }}</span></template>
      </MiTable>
    </div>

    <ul class="rgt__cards">
      <li v-for="p in rows" :key="p.id" class="rgt__card">
        <div class="rgt__card-top">
          <span class="rgt__proj"><span class="rgt__name">{{ p.name }}</span><span class="rgt__team">{{ p.team }} · {{ p.lead }}</span></span>
          <MiBadge :tone="tones[p.status]" :label="labels[p.status]" dot />
        </div>
        <span class="rgt__lane rgt__lane--card" aria-hidden="true">
          <i v-for="m in frame.months" :key="m.label" class="rgt__grid" :style="{ insetInlineStart: m.at + '%' }" />
          <b v-if="p.bar.show" class="rgt__bar" :class="barClass(p)" :style="barStyle(p)" />
          <i class="rgt__today" :style="{ insetInlineStart: frame.today + '%' }" />
        </span>
        <MiText variant="caption" tone="label2" tabular>{{ p.startLabel }} → {{ p.endLabel }} · {{ money(p.spent) }} of {{ money(p.budget) }}</MiText>
      </li>
      <li v-if="!rows.length" class="rgt__none"><MiText variant="footnote" tone="label2">No project for this team.</MiText></li>
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
.rgt { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.rgt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.rgt__tools { display: flex; flex-wrap: wrap; gap: 8px; }

.rgt__table { display: none; position: relative; min-width: 0; overflow-x: auto; }
.rgt__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 820px) { .rgt__table { display: block; } .rgt__cards { display: none; } }

.rgt__proj { display: grid; min-width: 0; }
.rgt__name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rgt__team { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--mi-label2); white-space: nowrap; }
.rgt__burn { display: grid; gap: 4px; }
.rgt__burn-num { font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rgt__burn-num small { font-size: 11px; font-weight: 400; color: var(--mi-label2); }
.rgt__burn-bar { display: block; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.rgt__burn-bar i { display: block; height: 100%; background: var(--mi-label2); transform-origin: left; }
.rgt__burn-bar.is-hot i { background: var(--mi-red); }

/* Gantt lane */
.rgt__lane { position: relative; display: block; height: 30px; min-width: 220px; }
.rgt__lane--card { height: 22px; min-width: 0; margin: 2px 0; }
.rgt__grid { position: absolute; top: -12px; bottom: -12px; width: 1px; background: var(--mi-sep); }
.rgt__lane--card .rgt__grid { top: 0; bottom: 0; }
.rgt__today { position: absolute; top: -12px; bottom: -12px; width: 2px; margin-inline-start: -1px; background: color-mix(in srgb, var(--mi-red) 70%, transparent); }
.rgt__lane--card .rgt__today { top: -3px; bottom: -3px; }
.rgt__bar { position: absolute; top: 7px; bottom: 7px; border-radius: 6px; }
.rgt__lane--card .rgt__bar { top: 5px; bottom: 5px; }
.rgt__bar.is-active { background: var(--mi-p); }
.rgt__bar.is-risk { background: var(--mi-orange); }
.rgt__bar.is-review { background: var(--mi-s); }
.rgt__bar.is-planned { background: transparent; box-shadow: inset 0 0 0 1.5px var(--mi-label3); background-image: repeating-linear-gradient(135deg, var(--mi-fill3) 0 4px, transparent 4px 8px); }
.rgt__bar.cut-start { border-start-start-radius: 0; border-end-start-radius: 0; }
.rgt__bar.cut-end { border-start-end-radius: 0; border-end-end-radius: 0; }
.rgt__off { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; padding-inline-end: 6px; font-size: 11px; color: var(--mi-label3); }
.rgt__due { font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; }

.rgt__lane.has-scale { height: 46px; padding-top: 16px; }
.rgt__lane.has-scale .rgt__bar { top: 23px; bottom: 7px; }
.rgt__lane.has-scale .rgt__grid, .rgt__lane.has-scale .rgt__today { top: 2px; }
.rgt__month { position: absolute; top: 0; padding-inline-start: 4px; font-size: 10.5px; font-weight: 600; color: var(--mi-label2); white-space: nowrap; }

.rgt__card { display: grid; gap: 8px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rgt__card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.rgt__none { padding: 20px; text-align: center; }
</style>
