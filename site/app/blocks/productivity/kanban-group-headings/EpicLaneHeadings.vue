<template>
  <section class="elh" aria-labelledby="elh-title">
    <header class="elh__head">
      <div>
        <MiText id="elh-title" variant="title3" as="h2" weight="semibold">Q4 roadmap by epic</MiText>
        <MiText variant="footnote" tone="label2">Team velocity {{ VELOCITY }} pt per week · today is November 3</MiText>
      </div>
      <MiSegmented v-model="sortBy" label="Sort epics by" :options="sorts" />
    </header>

    <!-- One horizontal heading per lane: progress split by status, a forecast against the due date, owners, add. -->
    <div class="elh__lanes">
      <section v-for="e in sorted" :key="e.id" class="elh__lane" :style="{ '--c': e.color }" :aria-labelledby="'elh-' + e.id">
        <div class="elh__bar">
          <h3 class="elh__name">
            <button :id="'elh-' + e.id" type="button" class="elh__toggle" :aria-expanded="open.has(e.id)" @click="toggle(e.id)">
              <MiIcon name="chevron-right" :size="14" class="elh__chev" :class="{ 'is-open': open.has(e.id) }" />
              <span class="elh__swatch" aria-hidden="true" />
              <span class="elh__label">{{ e.name }}</span>
            </button>
          </h3>

          <div class="elh__progress">
            <div class="elh__track" role="img" :aria-label="`${e.stats.done} done, ${e.stats.doing} in progress, ${e.stats.todo} to do, in points`">
              <span class="is-done" :style="{ flexGrow: e.stats.done }" /><span class="is-doing" :style="{ flexGrow: e.stats.doing }" /><span class="is-todo" :style="{ flexGrow: e.stats.todo }" />
            </div>
            <span class="elh__pct">{{ e.stats.pct }}%</span>
          </div>

          <span class="elh__forecast" :class="'is-' + e.stats.risk">
            <MiIcon :name="e.stats.risk === 'late' ? 'warning' : 'calendar'" :size="13" />
            {{ e.stats.risk === 'late' ? `${e.stats.weeksLeft} wk needed, ${e.stats.weeksToDue} left` : 'Due ' + e.due }}
          </span>

          <div class="elh__end">
            <MiAvatarGroup :items="members(e.owners)" :max="2" size="xs" />
            <MiIconButton size="small" variant="plain" :label="'Add task to ' + e.name" @click="addTask(e.id)"><MiIcon name="plus" :size="16" /></MiIconButton>
          </div>
        </div>

        <ul v-if="open.has(e.id)" class="elh__tasks">
          <li v-for="t in e.tasks" :key="t.id" class="elh__task">
            <span class="elh__dot" :class="'is-' + t.status" aria-hidden="true" />
            <span class="elh__task-title">{{ t.title }}</span>
            <span class="elh__task-meta">{{ statusLabel[t.status] }} · {{ t.points }} pt</span>
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

<style scoped>
.elh { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.elh__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.elh__lanes { display: grid; gap: 10px; }
.elh__lane { border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: inset 3px 0 0 var(--c), var(--mi-sh1); overflow: hidden; }

/* Mobile: name and actions on the first line, progress and forecast below. */
.elh__bar { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "name end" "prog prog" "fc fc"; align-items: center; gap: 8px 12px; padding: 10px 12px 12px 14px; }
.elh__name { grid-area: name; margin: 0; min-width: 0; }
.elh__toggle { display: flex; align-items: center; gap: 8px; max-width: 100%; padding: 4px 0; border: 0; background: transparent; font: inherit; color: inherit; cursor: pointer; text-align: start; }
.elh__toggle:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.elh__chev { flex: none; color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.elh__chev.is-open { transform: rotate(90deg); }
.elh__swatch { flex: none; width: 10px; height: 10px; border-radius: 3px; background: var(--c); }
.elh__label { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.elh__progress { grid-area: prog; display: flex; align-items: center; gap: 10px; }
.elh__track { display: flex; flex: 1; gap: 2px; height: 8px; }
.elh__track span { flex-basis: 0; min-width: 0; border-radius: 3px; }
.elh__track .is-done { background: var(--c); }
.elh__track .is-doing { background: color-mix(in srgb, var(--c) 45%, transparent); }
.elh__track .is-todo { background: var(--mi-fill3); }
.elh__pct { min-width: 36px; font-size: 13px; font-weight: 600; text-align: end; font-variant-numeric: tabular-nums; }

.elh__forecast { grid-area: fc; display: inline-flex; align-items: center; gap: 6px; justify-self: start; font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.elh__forecast.is-late { padding: 3px 8px; border-radius: 999px; background: color-mix(in srgb, var(--mi-red) 12%, transparent); color: var(--mi-red-t); font-weight: 600; }
.elh__end { grid-area: end; display: flex; align-items: center; gap: 6px; }

.elh__tasks { display: grid; margin: 0; padding: 0 12px 10px 14px; list-style: none; }
.elh__task { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 9px 4px 9px 26px; border-top: 1px solid var(--mi-sep); font-size: 13px; }
.elh__task-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.elh__task-meta { color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.elh__dot { width: 8px; height: 8px; border-radius: 50%; }
.elh__dot.is-done { background: var(--c); }
.elh__dot.is-doing { box-shadow: inset 0 0 0 2px var(--c); }
.elh__dot.is-todo { box-shadow: inset 0 0 0 2px var(--mi-label3); }

@container (min-width: 760px) {
  .elh__bar { grid-template-columns: minmax(160px, 1.1fr) minmax(160px, 1.2fr) auto auto; grid-template-areas: "name prog fc end"; gap: 16px; }
}
</style>
