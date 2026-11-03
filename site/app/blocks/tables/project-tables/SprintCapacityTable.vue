<template>
  <section class="sct" aria-labelledby="sct-title">
    <header class="sct__head">
      <div>
        <MiText id="sct-title" variant="title3" as="h2" weight="semibold">Sprint 24 · Checkout revamp</MiText>
        <MiText variant="footnote" tone="label2">Nov 3 – Nov 14 · {{ donePoints }} of {{ totalPoints }} points done</MiText>
      </div>
      <MiBadge :tone="overloaded.length ? 'warning' : 'success'" :label="overloaded.length ? overloaded.length + ' over capacity' : 'Load balanced'" dot />
    </header>

    <!-- Capacity strip: reassigning a task below moves points between these bars. -->
    <ul class="sct__people" aria-label="Capacity per person">
      <li v-for="p in load" :key="p.name" class="sct__person" :class="{ 'is-over': p.points > p.capacity }">
        <MiAvatar :name="p.name" size="sm" tone="auto" decorative />
        <div class="sct__person-body">
          <div class="sct__person-top">
            <MiText as="span" variant="footnote" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText as="span" variant="caption" tabular :tone="p.points > p.capacity ? 'orange' : 'label2'">{{ p.points }}/{{ p.capacity }} pts</MiText>
          </div>
          <span class="sct__cap" role="meter" :aria-label="p.name + ' load'" :aria-valuenow="p.points" aria-valuemin="0" :aria-valuemax="p.capacity">
            <i :style="{ transform: `scaleX(${Math.min(1, p.points / p.capacity)})` }" />
          </span>
        </div>
      </li>
    </ul>

    <div class="sct__scroll">
      <table class="sct__table">
        <caption class="sct__sr">Sprint tasks grouped by status</caption>
        <thead>
          <tr><th scope="col">Task</th><th scope="col">Owner</th><th scope="col" class="sct__end">Points</th></tr>
        </thead>
        <tbody v-for="g in groups" :key="g.id">
          <tr class="sct__group">
            <th scope="rowgroup" colspan="3">
              <button type="button" class="sct__toggle" :aria-expanded="!collapsed.has(g.id)" @click="toggle(g.id)">
                <MiIcon name="chevron-down" :size="14" class="sct__chev" />
                <span class="sct__swatch" :data-group="g.id" aria-hidden="true" />
                {{ g.label }}
                <MiText as="span" variant="caption" tone="label2" tabular>{{ g.tasks.length }} tasks · {{ g.points }} pts</MiText>
              </button>
            </th>
          </tr>
          <template v-if="!collapsed.has(g.id)">
            <tr v-for="t in g.tasks" :key="t.id" class="sct__row">
              <td>
                <span class="sct__task">
                  <MiText as="span" variant="caption" tone="label3" tabular>{{ t.id }}</MiText>
                  <span class="sct__title">{{ t.title }}</span>
                </span>
              </td>
              <td>
                <MiMenu
                  :model-value="t.owner" variant="popup" :items="ownerItems" :aria-label="'Owner of ' + t.id"
                  @update:model-value="(v) => reassign(t, v)"
                />
              </td>
              <td class="sct__end"><span class="sct__pts">{{ t.points }}</span></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="sct__log" aria-live="polite">{{ log }}</p>
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

<style scoped>
.sct { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.sct__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sct__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.sct__people { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); margin: 0; padding: 0; list-style: none; }
@container (min-width: 520px) { .sct__people { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 900px) { .sct__people { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.sct__person { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sct__person-body { display: grid; gap: 6px; flex: 1; min-width: 0; }
.sct__person-top { display: flex; justify-content: space-between; gap: 8px; }
.sct__cap { display: block; height: 5px; border-radius: 3px; background: var(--mi-fill2); overflow: hidden; }
.sct__cap i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.sct__person.is-over .sct__cap i { background: var(--mi-orange); }

.sct__scroll { min-width: 0; overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sct__table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: 14px; }
.sct__table th, .sct__table td { padding: 8px 14px; text-align: start; }
.sct__table thead th { font-size: 12px; font-weight: 600; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); }
.sct__table .sct__end { text-align: end; }
.sct__group th { padding: 4px 6px; background: var(--mi-fill4); }
.sct__toggle { display: inline-flex; align-items: center; gap: 8px; padding: 6px 8px; border: 0; border-radius: var(--mi-radius-s); background: none; font: inherit; font-weight: 600; color: var(--mi-label); cursor: pointer; }
.sct__toggle:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.sct__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.sct__toggle[aria-expanded="false"] .sct__chev { transform: rotate(-90deg); }
.sct__swatch { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-p); }
.sct__swatch[data-group="review"] { background: var(--mi-s); }
.sct__swatch[data-group="todo"] { background: var(--mi-label3); }
.sct__swatch[data-group="done"] { background: var(--mi-green); }

.sct__row td { border-bottom: 1px solid var(--mi-sep); }
.sct__task { display: grid; line-height: 1.3; }
.sct__title { font-weight: 500; }
.sct__pts { display: inline-grid; place-items: center; min-width: 26px; height: 22px; padding: 0 6px; border-radius: 11px; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; background: var(--mi-fill3); }

.sct__log { margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>
