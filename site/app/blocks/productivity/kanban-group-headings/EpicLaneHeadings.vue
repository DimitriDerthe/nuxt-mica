<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="elh-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="elh-title" variant="title3" as="h2" weight="semibold">Q4 roadmap by epic</MiText>
        <MiText variant="footnote" tone="label2">Team velocity {{ VELOCITY }} pt per week · today is November 3</MiText>
      </div>
      <MiSegmented v-model="sortBy" label="Sort epics by" :options="sorts" />
    </header>

    <!-- One horizontal heading per lane: progress split by status, a forecast against the due date, owners, add. -->
    <div class="mi:grid mi:gap-2.5">
      <section v-for="e in sorted" :key="e.id" class="mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[inset_3px_0_0_var(--c),_var(--mi-sh1)] mi:overflow-hidden" :style="{ '--c': e.color }" :aria-labelledby="'elh-' + e.id">
        <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:[grid-template-areas:'name_end'_'prog_prog'_'fc_fc'] mi:items-center mi:gap-y-2 mi:gap-x-3 mi:pt-2.5 mi:pr-3 mi:pb-3 mi:pl-3.5 mi:@[760px]:grid-cols-[minmax(160px,_1.1fr)_minmax(160px,_1.2fr)_auto_auto] mi:@[760px]:[grid-template-areas:'name_prog_fc_end'] mi:@[760px]:gap-4">
          <h3 class="mi:[grid-area:name] mi:m-0 mi:min-w-0">
            <button :id="'elh-' + e.id" type="button" class="mi:flex mi:items-center mi:gap-2 mi:max-w-full mi:py-1 mi:px-0 mi:[border:0] mi:[background:transparent] mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:text-start mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]" :aria-expanded="open.has(e.id)" @click="toggle(e.id)">
              <MiIcon name="chevron-right" :size="14" class="mi:flex-[none] mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="open.has(e.id) ? 'mi:transform-[rotate(90deg)]' : ''" />
              <span class="mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:[background:var(--c)]" aria-hidden="true" />
              <span class="mi:text-[15px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ e.name }}</span>
            </button>
          </h3>

          <div class="mi:[grid-area:prog] mi:flex mi:items-center mi:gap-2.5">
            <div class="mi:flex mi:flex-1 mi:gap-0.5 mi:h-2" role="img" :aria-label="`${e.stats.done} done, ${e.stats.doing} in progress, ${e.stats.todo} to do, in points`">
              <span class="mi:basis-0 mi:rounded-[3px] mi:[background:var(--c)] mi:min-w-0" :style="{ flexGrow: e.stats.done }" /><span class="mi:basis-0 mi:rounded-[3px] mi:[background:color-mix(in_srgb,var(--c)_45%,transparent)] mi:min-w-0" :style="{ flexGrow: e.stats.doing }" /><span class="mi:basis-0 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:min-w-0" :style="{ flexGrow: e.stats.todo }" />
            </div>
            <span class="mi:min-w-9 mi:text-[13px] mi:font-semibold mi:text-end mi:tabular-nums">{{ e.stats.pct }}%</span>
          </div>

          <span class="mi:[grid-area:fc] mi:inline-flex mi:items-center mi:gap-1.5 mi:justify-self-start mi:text-[12px]" :class="e.stats.risk === 'late' ? 'mi:rounded-[999px] mi:[background:color-mix(in_srgb,var(--mi-red)_12%,transparent)] mi:py-[3px] mi:px-2 mi:text-red-t mi:font-semibold' : 'mi:text-label2 mi:font-medium'">
            <MiIcon :name="e.stats.risk === 'late' ? 'warning' : 'calendar'" :size="13" />
            {{ e.stats.risk === 'late' ? `${e.stats.weeksLeft} wk needed, ${e.stats.weeksToDue} left` : 'Due ' + e.due }}
          </span>

          <div class="mi:[grid-area:end] mi:flex mi:items-center mi:gap-1.5">
            <MiAvatarGroup :items="members(e.owners)" :max="2" size="xs" />
            <MiIconButton size="small" variant="plain" :label="'Add task to ' + e.name" @click="addTask(e.id)"><MiIcon name="plus" :size="16" /></MiIconButton>
          </div>
        </div>

        <ul v-if="open.has(e.id)" class="mi:grid mi:m-0 mi:pt-0 mi:pr-3 mi:pb-2.5 mi:pl-3.5 mi:[list-style:none]">
          <li v-for="t in e.tasks" :key="t.id" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5 mi:pt-[9px] mi:pr-1 mi:pb-[9px] mi:pl-6.5 mi:border-t mi:border-t-sep mi:text-[13px]">
            <span class="mi:w-2 mi:h-2 mi:rounded-[50%]" :class="t.status === 'done' ? 'mi:[background:var(--c)]' : t.status === 'doing' ? 'mi:shadow-[inset_0_0_0_2px_var(--c)]' : t.status === 'todo' ? 'mi:shadow-[inset_0_0_0_2px_var(--mi-label3)]' : ''" aria-hidden="true" />
            <span class="mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ t.title }}</span>
            <span class="mi:text-label2 mi:tabular-nums">{{ statusLabel[t.status] }} · {{ t.points }} pt</span>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'done' | 'doing' | 'todo'
type Risk = 'ok' | 'late'
interface Task { id: number, title: string, status: Status, points: number }
interface Epic { id: string, name: string, color: string, due: string, weeksToDue: number, owners: string[], tasks: Task[] }
interface Stats { done: number, doing: number, todo: number, pct: number, weeksLeft: number, weeksToDue: number, risk: Risk }

const VELOCITY = 14
const members = (names: string[]): { name: string, tone: 'auto' }[] => names.map(name => ({ name, tone: 'auto' }))
const statusLabel: Record<Status, string> = { done: 'Done', doing: 'In progress', todo: 'To do' }
const sorts = [{ value: 'risk', label: 'At risk first' }, { value: 'progress', label: 'Progress' }]
const sortBy = ref<string | number | null>('risk')
const open = ref(new Set<string>(['billing']))

// Sample epics; weeksToDue is counted from today. Swap for your tracker.
const epics = ref<Epic[]>([
  { id: 'billing', name: 'Usage-based billing', color: 'var(--mi-p)', due: 'Dec 12', weeksToDue: 5.5, owners: ['Omar Haddad', 'Lena Brooks', 'Ken Osei'], tasks: [
    { id: 1, title: 'Meter events pipeline', status: 'done', points: 13 },
    { id: 2, title: 'Invoice preview in settings', status: 'doing', points: 8 },
    { id: 3, title: 'Proration rules for mid-cycle changes', status: 'todo', points: 21 },
    { id: 4, title: 'Spend alerts by email', status: 'todo', points: 8 },
    { id: 5, title: 'Stripe tax migration', status: 'todo', points: 34 }
  ] },
  { id: 'sso', name: 'Enterprise SSO', color: 'var(--mi-s)', due: 'Nov 28', weeksToDue: 3.5, owners: ['Mei Tanaka', 'Ravi Menon'], tasks: [
    { id: 6, title: 'SAML metadata upload', status: 'done', points: 5 },
    { id: 7, title: 'SCIM user provisioning', status: 'doing', points: 13 },
    { id: 8, title: 'Enforce SSO per domain', status: 'todo', points: 5 }
  ] },
  { id: 'mobile', name: 'Offline mobile editing', color: 'var(--mi-teal)', due: 'Jan 16', weeksToDue: 10.5, owners: ['Sofia Lindqvist'], tasks: [
    { id: 9, title: 'Local-first document store', status: 'doing', points: 21 },
    { id: 10, title: 'Conflict banner and merge view', status: 'todo', points: 13 },
    { id: 11, title: 'Background sync on reconnect', status: 'todo', points: 8 }
  ] }
])

const statsOf = (e: Epic): Stats => {
  const sum = (s: Status) => e.tasks.filter(t => t.status === s).reduce((n, t) => n + t.points, 0)
  const done = sum('done')
  const doing = sum('doing')
  const todo = sum('todo')
  const total = done + doing + todo || 1
  // Forecast: remaining points over velocity, rounded up to half weeks.
  const weeksLeft = Math.ceil(((doing + todo) / VELOCITY) * 2) / 2
  return { done, doing, todo, pct: Math.round((done / total) * 100), weeksLeft, weeksToDue: e.weeksToDue, risk: weeksLeft > e.weeksToDue ? 'late' : 'ok' }
}

const sorted = computed(() => {
  const list = epics.value.map(e => ({ ...e, stats: statsOf(e) }))
  return sortBy.value === 'progress'
    ? list.sort((a, b) => b.stats.pct - a.stats.pct)
    : list.sort((a, b) => (b.stats.weeksLeft - b.stats.weeksToDue) - (a.stats.weeksLeft - a.stats.weeksToDue))
})

function toggle(id: string) {
  const next = new Set(open.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  open.value = next
}
let seq = 100
function addTask(id: string) {
  const epic = epics.value.find(e => e.id === id)
  if (!epic) return
  epic.tasks.push({ id: ++seq, title: 'Untitled task', status: 'todo', points: 3 })
  open.value = new Set(open.value).add(id)
}
</script>
