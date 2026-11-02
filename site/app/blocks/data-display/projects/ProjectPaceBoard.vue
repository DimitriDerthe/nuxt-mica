<template>
  <section class="pace" aria-labelledby="pace-title">
    <header class="pace__head">
      <div>
        <MiText id="pace-title" variant="title3" as="h2" weight="semibold">Client projects</MiText>
        <MiText variant="footnote" tone="label2">Field &amp; Form studio · {{ projects.length }} projects · today is Mon, Nov 2</MiText>
      </div>
      <div class="pace__tools">
        <MiSegmented v-model="filter" label="Filter projects" :options="filters" />
        <MiMenu v-model="sort" variant="popup" :items="sorts" aria-label="Sort projects" placement="bottom-end" />
      </div>
    </header>

    <!-- Legend: explains the one idea of the board, the pace tick. -->
    <p class="pace__legend">
      <span class="pace__legend-bar" aria-hidden="true"><i /></span>
      <MiText as="span" variant="caption" tone="label2">Work done</MiText>
      <span class="pace__legend-tick" aria-hidden="true" />
      <MiText as="span" variant="caption" tone="label2">Where the work should be today</MiText>
    </p>

    <ul class="pace__grid" aria-live="polite">
      <li v-for="p in visible" :key="p.id" class="pace__card">
        <div class="pace__top">
          <span class="pace__glyph" :style="{ '--hue': p.hue }" aria-hidden="true">{{ p.code }}</span>
          <div class="pace__name">
            <MiText as="h3" variant="headline" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ p.client }} · {{ p.phase }}</MiText>
          </div>
          <MiIconButton variant="plain" size="small" :label="'More actions for ' + p.name">
            <MiIcon name="more" :size="18" />
          </MiIconButton>
        </div>

        <div class="pace__meter">
          <div
            class="pace__track" role="meter" :aria-label="p.name + ' progress'" aria-valuemin="0" aria-valuemax="100"
            :aria-valuenow="p.done" :aria-valuetext="`${p.done}% done, ${p.elapsed}% of time used`"
          >
            <span class="pace__fill" :class="'pace__fill--' + p.state" :style="{ transform: `scaleX(${p.done / 100})` }" />
            <span v-if="p.state !== 'shipped'" class="pace__tick" :style="{ insetInlineStart: p.elapsed + '%' }" />
          </div>
          <div class="pace__numbers">
            <MiText as="span" variant="caption" tone="label2" tabular>{{ p.done }}% done · {{ p.elapsed }}% of time used</MiText>
            <span class="pace__gap" :class="'pace__gap--' + p.state">{{ p.gapLabel }}</span>
          </div>
        </div>

        <footer class="pace__foot">
          <MiAvatarGroup :items="p.team" :max="3" :size="26" :label="'Team: ' + p.team.map(t => t.name).join(', ')" />
          <MiText as="span" variant="caption" tone="label2" tabular>{{ p.tasksDone }}/{{ p.tasks }} tasks</MiText>
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

<style scoped>
.pace { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.pace__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.pace__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; max-width: 100%; }

.pace__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin: 0; }
.pace__legend-bar { width: 22px; height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.pace__legend-bar i { display: block; width: 60%; height: 100%; background: var(--mi-p); }
.pace__legend-tick { width: 2px; height: 12px; margin-inline-start: 8px; border-radius: 1px; background: var(--mi-label); }

.pace__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 600px) { .pace__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 960px) { .pace__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.pace__card { display: grid; gap: 16px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.pace__top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.pace__glyph {
  display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; font-size: 13px; font-weight: 700; letter-spacing: .02em;
  color: var(--hue); background: color-mix(in srgb, var(--hue) 14%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--hue) 22%, transparent);
}
.pace__name { min-width: 0; }

.pace__meter { display: grid; gap: 8px; }
.pace__track { position: relative; height: 8px; border-radius: 4px; background: var(--mi-fill3); }
.pace__fill { position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.pace__fill--ahead, .pace__fill--track { background: var(--mi-p); }
.pace__fill--risk { background: var(--mi-orange); }
.pace__fill--shipped { background: var(--mi-green); }
/* The pace tick: where the bar should reach if work tracked time evenly. */
.pace__tick { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-inline-start: -1px; border-radius: 1px; background: var(--mi-label); box-shadow: 0 0 0 2px var(--mi-card); }
.pace__numbers { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; }
.pace__gap { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.pace__gap--ahead, .pace__gap--shipped { color: var(--mi-green-t); }
.pace__gap--risk { color: var(--mi-orange-t); }
.pace__gap--track { color: var(--mi-label2); }

.pace__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.pace__foot > :nth-child(2) { margin-inline-end: auto; }
</style>
