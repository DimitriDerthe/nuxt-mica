<template>
  <div class="jfp-cq">
    <section class="jfp" aria-labelledby="jfp-title">
      <aside class="jfp__panel" aria-labelledby="jfp-filters">
        <div class="jfp__panel-head">
          <MiText id="jfp-filters" variant="headline" as="h3">Filters</MiText>
          <div class="jfp__panel-tools">
            <MiButton variant="plain" size="small" :disabled="!active.length" @click="clearAll">Clear all</MiButton>
            <MiButton class="jfp__toggle" variant="gray" size="small" :aria-expanded="showPanel" aria-controls="jfp-body" @click="showPanel = !showPanel">
              {{ showPanel ? 'Hide' : 'Show' }}
            </MiButton>
          </div>
        </div>

        <div v-show="showPanel" id="jfp-body" class="jfp__body">
          <fieldset class="jfp__facet">
            <legend>Team</legend>
            <div v-for="t in TEAMS" :key="t" class="jfp__check" :class="{ 'is-empty': !counts.team[t] && !teams.includes(t) }">
              <MiCheckbox :model-value="teams.includes(t)" :disabled="!counts.team[t] && !teams.includes(t)" :label="t" @update:model-value="toggle(teams, t)" />
              <span class="jfp__n">{{ counts.team[t] ?? 0 }}</span>
            </div>
          </fieldset>

          <div class="jfp__facet">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">Work style</MiText>
            <MiSegmented v-model="mode" label="Work style" :options="MODES.map(m => ({ value: m.value, label: m.label }))" />
            <MiText variant="caption" tone="label3">{{ counts.mode.remote ?? 0 }} remote · {{ counts.mode.hybrid ?? 0 }} hybrid · {{ counts.mode.onsite ?? 0 }} on-site</MiText>
          </div>

          <div class="jfp__facet">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">Level</MiText>
            <MiToggleGroup v-model="levels" multiple variant="outline" size="sm" label="Level" :options="LEVELS.map(l => ({ value: l, label: l + ' ' + (counts.level[l] ?? 0) }))" />
          </div>

          <div class="jfp__facet">
            <MiSlider v-model="salary" label="Minimum salary" :min="40" :max="180" :step="10" :format="v => (v <= 40 ? 'Any' : '$' + v + 'k+')" />
          </div>

          <div class="jfp__facet">
            <MiText variant="subheadline" weight="semibold" aria-hidden="true">Posted</MiText>
            <MiRadioGroup v-model="posted" label="Posted" :options="POSTED.map(p => ({ value: p.days, label: p.label + ' (' + (counts.posted[p.days] ?? 0) + ')' }))" />
          </div>
        </div>
      </aside>

      <div class="jfp__results">
        <header class="jfp__results-head">
          <div>
            <MiText id="jfp-title" variant="title3" as="h2" weight="semibold">Open roles</MiText>
            <MiText variant="footnote" tone="label2" aria-live="polite">{{ results.length }} of {{ JOBS.length }} roles at Fieldwork</MiText>
          </div>
        </header>

        <div v-if="active.length" class="jfp__chips" aria-label="Active filters" role="group">
          <MiChip v-for="c in active" :key="c.id" removable size="small" :label="c.label" :remove-label="'Remove ' + c.label" @remove="c.clear()" />
        </div>

        <ul v-if="results.length" class="jfp__list">
          <li v-for="j in results" :key="j.id" class="jfp__job">
            <div class="jfp__job-main">
              <MiText variant="headline" as="h3" :lines="1">{{ j.title }}</MiText>
              <MiText variant="footnote" tone="label2">{{ j.team }} · {{ j.city }} · {{ MODES.find(m => m.value === j.mode)?.label }}</MiText>
            </div>
            <div class="jfp__job-meta">
              <span class="jfp__salary">${{ j.salary }}k–{{ j.salary + 30 }}k</span>
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

<style scoped>
.jfp-cq { container-type: inline-size; }
.jfp { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 760px) { .jfp { grid-template-columns: 280px minmax(0, 1fr); align-items: start; gap: 20px; } }

.jfp__panel { display: grid; gap: 12px; padding: 16px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.jfp__panel-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.jfp__panel-tools { display: flex; gap: 4px; }
.jfp__body { display: grid; gap: 20px; }
@container (min-width: 760px) { .jfp__toggle { display: none; } .jfp__body { display: grid !important; } }
@container (min-width: 520px) and (max-width: 759px) { .jfp__body { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.jfp__facet { display: grid; gap: 8px; margin: 0; padding: 0; border: 0; min-width: 0; }
.jfp__facet legend { margin-bottom: 8px; padding: 0; font-size: 15px; font-weight: 600; }
.jfp__check { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.jfp__n { min-width: 26px; padding: 1px 7px; border-radius: 999px; background: var(--mi-fill4); color: var(--mi-label2); font-size: 12px; text-align: center; font-variant-numeric: tabular-nums; }
.jfp__check.is-empty .jfp__n { opacity: .5; }

.jfp__results { display: grid; gap: 12px; align-content: start; min-width: 0; }
.jfp__results-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.jfp__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.jfp__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.jfp__job { display: grid; gap: 6px; padding: 14px 16px; }
.jfp__job + .jfp__job { border-top: 1px solid var(--mi-sep); }
.jfp__job:hover { background: var(--mi-fill4); }
.jfp__job-main { display: grid; gap: 2px; min-width: 0; }
.jfp__job-meta { display: flex; align-items: baseline; gap: 10px; }
@container (min-width: 560px) { .jfp__job { grid-template-columns: minmax(0, 1fr) auto; align-items: center; } .jfp__job-meta { display: grid; justify-items: end; gap: 2px; } }
.jfp__salary { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>
