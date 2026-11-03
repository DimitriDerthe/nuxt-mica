<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:font-mi mi:text-label mi:@[760px]:grid-cols-[280px_minmax(0,_1fr)] mi:@[760px]:items-start mi:@[760px]:gap-5" aria-labelledby="jfp-title">
      <aside class="mi:grid mi:gap-3 mi:py-4 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="jfp-filters">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText id="jfp-filters" variant="headline" as="h3">Filters</MiText>
          <div class="mi:flex mi:gap-1">
            <MiButton variant="plain" size="small" :disabled="!active.length" @click="clearAll">Clear all</MiButton>
            <MiButton class="mi:@[760px]:hidden!" variant="gray" size="small" :aria-expanded="showPanel" aria-controls="jfp-body" @click="showPanel = !showPanel">
              {{ showPanel ? 'Hide' : 'Show' }}
            </MiButton>
          </div>
        </div>

        <div v-show="showPanel" id="jfp-body" class="mi:grid mi:gap-5 mi:@[760px]:grid! mi:[@container_(min-width:_520px)_and_(max-width:_759px)]:grid-cols-2">
          <fieldset class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <legend class="mi:mb-2 mi:p-0 mi:text-[15px] mi:font-semibold">Team</legend>
            <div v-for="t in TEAMS" :key="t" class="mi:flex mi:items-center mi:justify-between mi:gap-2">
              <MiCheckbox :model-value="teams.includes(t)" :disabled="!counts.team[t] && !teams.includes(t)" :label="t" @update:model-value="toggle(teams, t)" />
              <span class="mi:min-w-6.5 mi:py-px mi:px-[7px] mi:rounded-[999px] mi:bg-fill4 mi:text-label2 mi:text-[12px] mi:text-center mi:tabular-nums" :class="!counts.team[t] && !teams.includes(t) ? 'mi:opacity-50' : ''">{{ counts.team[t] ?? 0 }}</span>
            </div>
          </fieldset>

          <div class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">Work style</MiText>
            <MiSegmented v-model="mode" label="Work style" :options="MODES.map(m => ({ value: m.value, label: m.label }))" />
            <MiText variant="caption" tone="label3">{{ counts.mode.remote ?? 0 }} remote · {{ counts.mode.hybrid ?? 0 }} hybrid · {{ counts.mode.onsite ?? 0 }} on-site</MiText>
          </div>

          <div class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">Level</MiText>
            <MiToggleGroup v-model="levels" multiple variant="outline" size="sm" label="Level" :options="LEVELS.map(l => ({ value: l, label: l + ' ' + (counts.level[l] ?? 0) }))" />
          </div>

          <div class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <MiSlider v-model="salary" label="Minimum salary" :min="40" :max="180" :step="10" :format="v => (v <= 40 ? 'Any' : '$' + v + 'k+')" />
          </div>

          <div class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">Posted</MiText>
            <MiRadioGroup v-model="posted" label="Posted" :options="POSTED.map(p => ({ value: p.days, label: p.label + ' (' + (counts.posted[p.days] ?? 0) + ')' }))" />
          </div>
        </div>
      </aside>

      <div class="mi:grid mi:gap-3 mi:content-start mi:min-w-0">
        <header class="mi:flex mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div>
            <MiText id="jfp-title" variant="title3" as="h2" weight="semibold">Open roles</MiText>
            <MiText variant="footnote" tone="label2" aria-live="polite">{{ results.length }} of {{ JOBS.length }} roles at Fieldwork</MiText>
          </div>
        </header>

        <div v-if="active.length" class="mi:flex mi:flex-wrap mi:gap-1.5" aria-label="Active filters" role="group">
          <MiChip v-for="c in active" :key="c.id" removable size="small" :label="c.label" :remove-label="'Remove ' + c.label" @remove="c.clear()" />
        </div>

        <ul v-if="results.length" class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden">
          <li v-for="j in results" :key="j.id" class="mi:grid mi:gap-1.5 mi:py-3.5 mi:px-4 mi:[li+&]:border-t mi:[li+&]:border-t-sep mi:hover:bg-fill4 mi:@[560px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[560px]:items-center">
            <div class="mi:grid mi:gap-0.5 mi:min-w-0">
              <MiText variant="headline" as="h3" :lines="1">{{ j.title }}</MiText>
              <MiText variant="footnote" tone="label2">{{ j.team }} · {{ j.city }} · {{ MODES.find(m => m.value === j.mode)?.label }}</MiText>
            </div>
            <div class="mi:flex mi:items-baseline mi:gap-2.5 mi:@[560px]:grid mi:@[560px]:justify-items-end mi:@[560px]:gap-0.5">
              <span class="mi:text-[14px] mi:font-semibold mi:tabular-nums">${{ j.salary }}k–{{ j.salary + 30 }}k</span>
              <MiText variant="caption" tone="label3">{{ j.days === 0 ? 'Today' : j.days + 'd ago' }}</MiText>
            </div>
          </li>
        </ul>
        <MiEmptyState v-else icon="search" title="No roles match" description="Lower the salary floor or widen the work style." secondary-label="Clear all filters" @secondary="clearAll" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const TEAMS = ['Engineering', 'Design', 'Product', 'Data', 'Support']
const LEVELS = ['Junior', 'Mid', 'Senior', 'Lead']
const MODES = [{ value: 'any', label: 'Any' }, { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'onsite', label: 'On-site' }]
const POSTED = [{ days: 99, label: 'Any time' }, { days: 7, label: 'Past week' }, { days: 1, label: 'Past 24 hours' }]

const JOBS = [
  { id: 1, title: 'Senior Backend Engineer, Payments', team: 'Engineering', level: 'Senior', mode: 'remote', city: 'Lisbon', salary: 140, days: 2 },
  { id: 2, title: 'Product Designer, Mobile', team: 'Design', level: 'Mid', mode: 'hybrid', city: 'Berlin', salary: 95, days: 0 },
  { id: 3, title: 'Staff Engineer, Platform', team: 'Engineering', level: 'Lead', mode: 'remote', city: 'Remote EU', salary: 175, days: 9 },
  { id: 4, title: 'Data Analyst, Growth', team: 'Data', level: 'Junior', mode: 'onsite', city: 'Amsterdam', salary: 60, days: 4 },
  { id: 5, title: 'Product Manager, Onboarding', team: 'Product', level: 'Senior', mode: 'hybrid', city: 'London', salary: 130, days: 1 },
  { id: 6, title: 'Frontend Engineer, Design Systems', team: 'Engineering', level: 'Mid', mode: 'remote', city: 'Remote EU', salary: 105, days: 6 },
  { id: 7, title: 'Customer Support Specialist (FR/EN)', team: 'Support', level: 'Junior', mode: 'onsite', city: 'Paris', salary: 45, days: 0 },
  { id: 8, title: 'Design Lead, Brand', team: 'Design', level: 'Lead', mode: 'hybrid', city: 'Berlin', salary: 150, days: 12 },
  { id: 9, title: 'Machine Learning Engineer, Search', team: 'Data', level: 'Senior', mode: 'remote', city: 'Remote', salary: 160, days: 3 },
  { id: 10, title: 'Support Team Lead, EMEA', team: 'Support', level: 'Lead', mode: 'hybrid', city: 'Dublin', salary: 85, days: 15 },
  { id: 11, title: 'iOS Engineer', team: 'Engineering', level: 'Mid', mode: 'onsite', city: 'London', salary: 110, days: 5 },
  { id: 12, title: 'Associate Product Manager', team: 'Product', level: 'Junior', mode: 'onsite', city: 'Amsterdam', salary: 65, days: 8 },
  { id: 13, title: 'Analytics Engineer', team: 'Data', level: 'Mid', mode: 'hybrid', city: 'Lisbon', salary: 90, days: 1 }
]
type Job = typeof JOBS[number]

const teams = ref<string[]>(['Engineering', 'Data'])
const mode = ref<string | number | null>('any')
const levels = ref<string | number | (string | number)[] | null>(['Mid', 'Senior'])
const salary = ref<number | [number, number]>(80)
const posted = ref<string | number | boolean | null>(99)
const showPanel = ref(true)

const levelList = computed(() => (Array.isArray(levels.value) ? levels.value.map(String) : []))
const minSalary = computed(() => (typeof salary.value === 'number' ? salary.value : 40))

// Each facet is a predicate; counts for a facet apply every other facet, so a number says what you would get.
type Facet = 'team' | 'mode' | 'level' | 'salary' | 'posted'
const tests: Record<Facet, (j: Job) => boolean> = {
  team: j => !teams.value.length || teams.value.includes(j.team),
  mode: j => mode.value === 'any' || j.mode === mode.value,
  level: j => !levelList.value.length || levelList.value.includes(j.level),
  salary: j => minSalary.value <= 40 || j.salary >= minSalary.value,
  posted: j => j.days <= Number(posted.value ?? 99)
}
const passExcept = (j: Job, skip?: Facet) => (Object.keys(tests) as Facet[]).every(k => k === skip || tests[k](j))
const results = computed(() => JOBS.filter(j => passExcept(j)))

function tally(skip: Facet, keyOf: (j: Job) => string | number) {
  const out: Record<string, number> = {}
  for (const j of JOBS) if (passExcept(j, skip)) out[keyOf(j)] = (out[keyOf(j)] ?? 0) + 1
  return out
}
const counts = computed(() => {
  const postedPool = JOBS.filter(j => passExcept(j, 'posted'))
  return {
    team: tally('team', j => j.team),
    mode: tally('mode', j => j.mode),
    level: tally('level', j => j.level),
    posted: Object.fromEntries(POSTED.map(p => [p.days, postedPool.filter(j => j.days <= p.days).length]))
  }
})

function toggle(list: string[], v: string) {
  const i = list.indexOf(v)
  if (i >= 0) list.splice(i, 1)
  else list.push(v)
}

const active = computed(() => [
  ...teams.value.map(t => ({ id: 't' + t, label: t, clear: () => toggle(teams.value, t) })),
  ...(mode.value !== 'any' ? [{ id: 'mode', label: MODES.find(m => m.value === mode.value)?.label ?? '', clear: () => { mode.value = 'any' } }] : []),
  ...levelList.value.map(l => ({ id: 'l' + l, label: l, clear: () => { levels.value = levelList.value.filter(x => x !== l) } })),
  ...(minSalary.value > 40 ? [{ id: 'sal', label: '$' + minSalary.value + 'k+', clear: () => { salary.value = 40 } }] : []),
  ...(posted.value !== 99 ? [{ id: 'posted', label: POSTED.find(p => p.days === posted.value)?.label ?? '', clear: () => { posted.value = 99 } }] : [])
])
function clearAll() {
  teams.value = []
  mode.value = 'any'
  levels.value = []
  salary.value = 40
  posted.value = 99
}
</script>
