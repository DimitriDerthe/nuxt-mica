<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="pace-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="pace-title" variant="title3" as="h2" weight="semibold">Client projects</MiText>
        <MiText variant="footnote" tone="label2">Field &amp; Form studio · {{ projects.length }} projects · today is Mon, Nov 2</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:max-w-full">
        <MiSegmented v-model="filter" label="Filter projects" :options="filters" />
        <MiMenu v-model="sort" variant="popup" :items="sorts" aria-label="Sort projects" placement="bottom-end" />
      </div>
    </header>

    <!-- Legend: explains the one idea of the board, the pace tick. -->
    <p class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2 mi:m-0">
      <span class="mi:w-5.5 mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" aria-hidden="true"><i class="mi:block mi:w-[60%] mi:h-full mi:bg-p" /></span>
      <MiText as="span" variant="caption" tone="label2">Work done</MiText>
      <span class="mi:w-0.5 mi:h-3 mi:ms-2 mi:rounded-[1px] mi:bg-label" aria-hidden="true" />
      <MiText as="span" variant="caption" tone="label2">Where the work should be today</MiText>
    </p>

    <ul class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[600px]:grid-cols-2 mi:@[960px]:grid-cols-3" aria-live="polite">
      <li v-for="p in visible" :key="p.id" class="mi:grid mi:gap-4 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
          <span class="mi:grid mi:place-items-center mi:w-10 mi:h-10 mi:rounded-[12px] mi:text-[13px] mi:font-bold mi:tracking-[.02em] mi:text-(--hue) mi:[background:color-mix(in_srgb,_var(--hue)_14%,_transparent)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--hue)_22%,_transparent)]" :style="{ '--hue': p.hue }" aria-hidden="true">{{ p.code }}</span>
          <div class="mi:min-w-0">
            <MiText as="h3" variant="headline" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ p.client }} · {{ p.phase }}</MiText>
          </div>
          <MiIconButton variant="plain" size="small" :label="'More actions for ' + p.name">
            <MiIcon name="more" :size="18" />
          </MiIconButton>
        </div>

        <div class="mi:grid mi:gap-2">
          <div
            class="mi:relative mi:h-2 mi:rounded-[4px] mi:bg-fill3" role="meter" :aria-label="p.name + ' progress'" aria-valuemin="0" aria-valuemax="100"
            :aria-valuenow="p.done" :aria-valuetext="`${p.done}% done, ${p.elapsed}% of time used`"
          >
            <span class="mi:absolute mi:inset-0 mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="[p.state === 'risk' ? 'mi:bg-orange' : p.state === 'shipped' ? 'mi:bg-green' : 'mi:bg-p']" :style="{ transform: `scaleX(${p.done / 100})` }" />
            <span v-if="p.state !== 'shipped'" class="mi:absolute mi:-top-1 mi:-bottom-1 mi:w-0.5 mi:-ms-px mi:rounded-[1px] mi:bg-label mi:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ insetInlineStart: p.elapsed + '%' }" />
          </div>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1 mi:gap-x-2">
            <MiText as="span" variant="caption" tone="label2" tabular>{{ p.done }}% done · {{ p.elapsed }}% of time used</MiText>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums mi:whitespace-nowrap" :class="[p.state === 'risk' ? 'mi:text-orange-t' : p.state === 'track' ? 'mi:text-label2' : 'mi:text-green-t']">{{ p.gapLabel }}</span>
          </div>
        </div>

        <footer class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3 mi:pt-3 mi:border-t mi:border-t-sep">
          <MiAvatarGroup :items="p.team" :max="3" :size="26" :label="'Team: ' + p.team.map(t => t.name).join(', ')" />
          <MiText as="span" variant="caption" tone="label2" tabular class="mi:me-auto!">{{ p.tasksDone }}/{{ p.tasks }} tasks</MiText>
          <MiBadge :tone="p.state === 'risk' ? 'warning' : p.state === 'shipped' ? 'success' : 'neutral'" :label="p.dueLabel" />
        </footer>
      </li>
    </ul>

    <MiEmptyState v-if="!visible.length" title="Nothing here" description="No project matches this filter." icon="folder" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type State = 'ahead' | 'risk' | 'track' | 'shipped'

// Sample portfolio; dates are ISO days, "today" is fixed so the preview is stable.
const TODAY = Date.UTC(2026, 10, 2)
const DAY = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const raw = [
  { id: 'p1', code: 'CK', hue: 'var(--mi-p)', name: 'Checkout redesign', client: 'Halden Outdoor', phase: 'Build', start: '2026-09-01', due: '2026-11-27', done: 74, tasks: 64, tasksDone: 47, team: ['Inès Moreau', 'Kofi Mensah', 'Saoirse Byrne', 'Tomás Ruiz'] },
  { id: 'p2', code: 'A3', hue: 'var(--mi-orange)', name: 'Android 3.0 parity', client: 'Pocketmeal', phase: 'Build', start: '2026-08-17', due: '2026-12-11', done: 55, tasks: 112, tasksDone: 62, team: ['Yuki Tanaka', 'Marta Kowalska'] },
  { id: 'p3', code: 'PA', hue: 'var(--mi-teal)', name: 'Partner API v2', client: 'Ledgerline', phase: 'Beta', start: '2026-07-06', due: '2026-11-20', done: 88, tasks: 58, tasksDone: 51, team: ['Kofi Mensah', 'Arjun Mehta', 'Lena Vogel'] },
  { id: 'p4', code: 'BR', hue: 'var(--mi-pink)', name: 'Brand refresh', client: 'Oakmere Bakery', phase: 'Design', start: '2026-10-05', due: '2026-12-18', done: 34, tasks: 36, tasksDone: 12, team: ['Saoirse Byrne', 'Noor Haddad'] },
  { id: 'p5', code: 'WS', hue: 'var(--mi-indigo)', name: 'Warehouse scanner', client: 'Brightpath Logistics', phase: 'QA', start: '2026-06-22', due: '2026-11-13', done: 84, tasks: 80, tasksDone: 67, team: ['Tomás Ruiz', 'Yuki Tanaka', 'Arjun Mehta', 'Inès Moreau', 'Lena Vogel'] },
  { id: 'p6', code: 'ON', hue: 'var(--mi-green)', name: 'Onboarding emails', client: 'Pocketmeal', phase: 'Live', start: '2026-08-03', due: '2026-10-23', done: 100, tasks: 24, tasksDone: 24, team: ['Noor Haddad', 'Marta Kowalska'] }
]

const day = (iso: string) => Date.parse(iso + 'T00:00:00Z')
const fmt = (ms: number) => { const d = new Date(ms); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` }

const projects = raw.map((p) => {
  const start = day(p.start)
  const due = day(p.due)
  const span = (due - start) / DAY
  const elapsed = Math.round(Math.min(1, Math.max(0, (TODAY - start) / (due - start))) * 100)
  const gapDays = Math.round(((p.done - elapsed) / 100) * span)
  const state: State = p.done >= 100 ? 'shipped' : gapDays <= -7 ? 'risk' : gapDays >= 3 ? 'ahead' : 'track'
  const n = Math.abs(gapDays)
  const gapLabel = state === 'shipped' ? 'Shipped' : n === 0 ? 'On pace' : `${n} ${n === 1 ? 'day' : 'days'} ${gapDays > 0 ? 'ahead' : 'behind'}`
  const left = Math.round((due - TODAY) / DAY)
  const dueLabel = state === 'shipped' ? `Done ${fmt(due)}` : left <= 14 ? `Due in ${left} days` : `Due ${fmt(due)}`
  return { ...p, team: p.team.map(name => ({ name, tone: 'auto' as const })), elapsed, gapDays, state, gapLabel, dueLabel, due }
})

const filters = [
  { value: 'all', label: 'All' },
  { value: 'risk', label: 'Behind' },
  { value: 'ok', label: 'On track' },
  { value: 'shipped', label: 'Shipped' }
]
const filter = ref<string | number | null>('all')

const sorts = [{ value: 'due', label: 'Due date' }, { value: 'pace', label: 'Most behind' }, { value: 'name', label: 'Name' }]
const sort = ref<string | number | undefined>('due')

const visible = computed(() => {
  const list = projects.filter(p => filter.value === 'all' || p.state === filter.value || (filter.value === 'ok' && (p.state === 'ahead' || p.state === 'track')))
  if (sort.value === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name))
  // Shipped work always sinks to the end: the board is about what is still moving.
  const live = (p: typeof list[number]) => (p.state === 'shipped' ? 1 : 0)
  if (sort.value === 'pace') return [...list].sort((a, b) => live(a) - live(b) || a.gapDays - b.gapDays)
  return [...list].sort((a, b) => live(a) - live(b) || a.due - b.due)
})
</script>
