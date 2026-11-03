<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="sct-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="sct-title" variant="title3" as="h2" weight="semibold">Sprint 24 · Checkout revamp</MiText>
        <MiText variant="footnote" tone="label2">Nov 3 – Nov 14 · {{ donePoints }} of {{ totalPoints }} points done</MiText>
      </div>
      <MiBadge :tone="overloaded.length ? 'warning' : 'success'" :label="overloaded.length ? overloaded.length + ' over capacity' : 'Load balanced'" dot />
    </header>

    <!-- Capacity strip: reassigning a task below moves points between these bars. -->
    <ul class="mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]:grid-cols-2 mi:@[900px]:grid-cols-4" aria-label="Capacity per person">
      <li v-for="p in load" :key="p.name" class="mi:flex mi:items-center mi:gap-2.5 mi:py-2.5 mi:px-3 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <MiAvatar :name="p.name" size="sm" tone="auto" decorative />
        <div class="mi:grid mi:gap-1.5 mi:flex-1 mi:min-w-0">
          <div class="mi:flex mi:justify-between mi:gap-2">
            <MiText as="span" variant="footnote" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText as="span" variant="caption" tabular :tone="p.points > p.capacity ? 'orange' : 'label2'">{{ p.points }}/{{ p.capacity }} pts</MiText>
          </div>
          <span class="mi:block mi:h-[5px] mi:rounded-[3px] mi:[background:var(--mi-fill2)] mi:overflow-hidden" role="meter" :aria-label="p.name + ' load'" :aria-valuenow="p.points" aria-valuemin="0" :aria-valuemax="p.capacity">
            <i class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="p.points > p.capacity ? 'mi:[background:var(--mi-orange)]' : 'mi:[background:var(--mi-p)]'" :style="{ transform: `scaleX(${Math.min(1, p.points / p.capacity)})` }" />
          </span>
        </div>
      </li>
    </ul>

    <div class="mi:min-w-0 mi:overflow-x-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <table class="mi:w-full mi:min-w-140 mi:border-collapse mi:text-[14px]">
        <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Sprint tasks grouped by status</caption>
        <thead>
          <tr><th class="mi:py-2 mi:px-3.5 mi:text-start mi:border-b mi:border-b-sep mi:text-[12px] mi:font-semibold mi:text-label2" scope="col">Task</th><th class="mi:py-2 mi:px-3.5 mi:text-start mi:border-b mi:border-b-sep mi:text-[12px] mi:font-semibold mi:text-label2" scope="col">Owner</th><th scope="col" class="mi:py-2 mi:px-3.5 mi:text-end mi:border-b mi:border-b-sep mi:text-[12px] mi:font-semibold mi:text-label2">Points</th></tr>
        </thead>
        <tbody v-for="g in groups" :key="g.id">
          <tr>
            <th class="mi:py-1 mi:px-1.5 mi:text-start mi:[background:var(--mi-fill4)]" scope="rowgroup" colspan="3">
              <button type="button" class="mi:[font:inherit] mi:font-semibold mi:inline-flex mi:items-center mi:gap-2 mi:py-1.5 mi:px-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-expanded="!collapsed.has(g.id)" @click="toggle(g.id)">
                <MiIcon name="chevron-down" :size="14" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="collapsed.has(g.id) ? 'mi:transform-[rotate(-90deg)]' : ''" />
                <span class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-p)] mi:data-[group=review]:bg-s mi:data-[group=todo]:bg-label3 mi:data-[group=done]:bg-green" :data-group="g.id" aria-hidden="true" />
                {{ g.label }}
                <MiText as="span" variant="caption" tone="label2" tabular>{{ g.tasks.length }} tasks · {{ g.points }} pts</MiText>
              </button>
            </th>
          </tr>
          <template v-if="!collapsed.has(g.id)">
            <tr v-for="t in g.tasks" :key="t.id">
              <td class="mi:py-2 mi:px-3.5 mi:text-start mi:border-b mi:border-b-sep">
                <span class="mi:grid mi:leading-[1.3]">
                  <MiText as="span" variant="caption" tone="label3" tabular>{{ t.id }}</MiText>
                  <span class="mi:font-medium">{{ t.title }}</span>
                </span>
              </td>
              <td class="mi:py-2 mi:px-3.5 mi:text-start mi:border-b mi:border-b-sep">
                <MiMenu
                  :model-value="t.owner" variant="popup" :items="ownerItems" :aria-label="'Owner of ' + t.id"
                  @update:model-value="(v) => reassign(t, v)"
                />
              </td>
              <td class="mi:py-2 mi:px-3.5 mi:text-end mi:border-b mi:border-b-sep"><span class="mi:inline-grid mi:place-items-center mi:min-w-6.5 mi:h-5.5 mi:py-0 mi:px-1.5 mi:rounded-[11px] mi:text-[12px] mi:font-bold mi:tabular-nums mi:[background:var(--mi-fill3)]">{{ t.points }}</span></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ log }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'progress' | 'review' | 'todo' | 'done'
interface Task { id: string, title: string, owner: string, points: number, status: Status }

const people = [
  { name: 'Aiko Tanaka', capacity: 13 }, { name: 'Rafael Mendes', capacity: 10 },
  { name: 'Leila Haddad', capacity: 13 }, { name: 'Jonas Becker', capacity: 8 }
]
const ownerItems = people.map(p => ({ value: p.name, label: p.name }))

const tasks = ref<Task[]>([
  { id: 'CHK-201', title: 'Single-page checkout layout', owner: 'Aiko Tanaka', points: 8, status: 'progress' },
  { id: 'CHK-204', title: 'Apple Pay and Google Pay buttons', owner: 'Rafael Mendes', points: 5, status: 'progress' },
  { id: 'CHK-207', title: 'Address autocomplete with postcode lookup', owner: 'Jonas Becker', points: 5, status: 'review' },
  { id: 'CHK-209', title: 'Promo code field validation', owner: 'Leila Haddad', points: 3, status: 'review' },
  { id: 'CHK-212', title: 'Order summary sticky on mobile', owner: 'Jonas Becker', points: 5, status: 'todo' },
  { id: 'CHK-215', title: 'Track checkout drop-off per step', owner: 'Leila Haddad', points: 3, status: 'todo' },
  { id: 'CHK-216', title: 'Guest checkout without account', owner: 'Aiko Tanaka', points: 8, status: 'todo' },
  { id: 'CHK-198', title: 'Remove legacy cart modal', owner: 'Rafael Mendes', points: 2, status: 'done' }
])

const groupDefs: { id: Status, label: string }[] = [
  { id: 'progress', label: 'In progress' }, { id: 'review', label: 'In review' }, { id: 'todo', label: 'To do' }, { id: 'done', label: 'Done' }
]
const collapsed = ref(new Set<Status>(['done']))
const log = ref('Change an owner to rebalance the sprint.')

const groups = computed(() => groupDefs.map((g) => {
  const list = tasks.value.filter(t => t.status === g.id)
  return { ...g, tasks: list, points: list.reduce((s, t) => s + t.points, 0) }
}))
// Done work no longer weighs on capacity.
const load = computed(() => people.map(p => ({
  ...p, points: tasks.value.filter(t => t.owner === p.name && t.status !== 'done').reduce((s, t) => s + t.points, 0)
})))
const overloaded = computed(() => load.value.filter(p => p.points > p.capacity))
const totalPoints = computed(() => tasks.value.reduce((s, t) => s + t.points, 0))
const donePoints = computed(() => groups.value.find(g => g.id === 'done')?.points ?? 0)

function toggle(id: Status) {
  const next = new Set(collapsed.value)
  if (!next.delete(id)) next.add(id)
  collapsed.value = next
}
function reassign(t: Task, owner: string | number | undefined) {
  if (typeof owner !== 'string' || owner === t.owner) return
  t.owner = owner
  const p = load.value.find(l => l.name === owner)
  log.value = `${t.id} moved to ${owner}${p && p.points > p.capacity ? `, now ${p.points - p.capacity} pts over capacity` : ''}.`
}
</script>
