<template>
  <section class="skb" aria-labelledby="skb-title">
    <header class="skb__head">
      <div>
        <MiText id="skb-title" variant="title3" as="h2" weight="semibold">Checkout revamp · Sprint 14</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ doneCount }} of {{ tasks.length }} done · {{ blockedCount }} blocked</MiText>
      </div>
      <div class="skb__tools">
        <MiSegmented v-model="groupBy" label="Group lanes by" :options="groupOptions" />
        <MiButton size="small" variant="gray" @click="toggleAll">{{ collapsed.size ? 'Expand all' : 'Collapse all' }}</MiButton>
      </div>
    </header>

    <!-- Lanes are rows, stages are columns; the board scrolls inside this frame on small screens. -->
    <div class="skb__frame" tabindex="0" aria-label="Board">
      <div class="skb__board">
        <div class="skb__stages" aria-hidden="true">
          <span v-for="s in stages" :key="s.id">{{ s.label }} <b>{{ countIn(s.id) }}</b></span>
        </div>

        <section v-for="lane in lanes" :key="lane.id" class="skb__lane" :aria-labelledby="'skb-lane-' + lane.id">
          <h3 class="skb__lane-head">
            <button
              :id="'skb-lane-' + lane.id" type="button" class="skb__lane-btn"
              :aria-expanded="!collapsed.has(lane.id)" @click="toggle(lane.id)"
            >
              <MiIcon name="chevron-right" :size="14" class="skb__chev" :class="{ 'is-open': !collapsed.has(lane.id) }" />
              <MiAvatar v-if="groupBy === 'owner'" :name="lane.label" tone="auto" size="xs" decorative />
              <span v-else class="skb__prio" :class="'is-' + lane.id" aria-hidden="true" />
              <span class="skb__lane-name">{{ lane.label }}</span>
              <span class="skb__lane-count">{{ lane.tasks.length }} tasks · {{ lane.points }} pt</span>
            </button>
          </h3>

          <div v-if="!collapsed.has(lane.id)" class="skb__cells">
            <ul v-for="s in stages" :key="s.id" class="skb__cell" :aria-label="lane.label + ', ' + s.label">
              <li v-for="t in lane.cells[s.id]" :key="t.id" class="skb__card" :class="{ 'is-blocked': t.blocked, 'is-done': t.stage === 'done' }">
                <span class="skb__key">{{ t.key }}</span>
                <span class="skb__title">{{ t.title }}</span>
                <span class="skb__foot">
                  <MiBadge v-if="t.blocked" tone="danger" label="Blocked" />
                  <span v-else class="skb__pts">{{ t.points }} pt</span>
                  <MiIconButton
                    v-if="t.stage !== 'done'" size="small" variant="plain" :label="'Move ' + t.key + ' to ' + nextLabel(t.stage)"
                    :disabled="t.blocked" @click="advance(t)"
                  >
                    <MiIcon name="arrow-right" :size="14" />
                  </MiIconButton>
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type StageId = 'todo' | 'doing' | 'review' | 'done'
type Priority = 'urgent' | 'high' | 'normal'
interface Task { id: number, key: string, title: string, owner: string, priority: Priority, stage: StageId, points: number, blocked?: boolean }
interface Lane { id: string, label: string, tasks: Task[], cells: Record<StageId, Task[]>, points: number }

const stages: { id: StageId, label: string }[] = [
  { id: 'todo', label: 'To do' }, { id: 'doing', label: 'In progress' }, { id: 'review', label: 'Review' }, { id: 'done', label: 'Done' }
]
const groupOptions = [{ value: 'owner', label: 'Assignee' }, { value: 'priority', label: 'Priority' }]
const groupBy = ref<string | number | null>('owner')
const collapsed = ref(new Set<string>())

// Sample sprint; swap for your issue tracker.
const tasks = ref<Task[]>([
  { id: 1, key: 'CHK-201', title: 'Apple Pay button on the cart sheet', owner: 'Mei Tanaka', priority: 'high', stage: 'doing', points: 5 },
  { id: 2, key: 'CHK-204', title: 'Address autocomplete for EU postcodes', owner: 'Mei Tanaka', priority: 'normal', stage: 'todo', points: 3 },
  { id: 3, key: 'CHK-198', title: 'Fix double charge on retry after 3DS timeout', owner: 'Omar Haddad', priority: 'urgent', stage: 'review', points: 3 },
  { id: 4, key: 'CHK-210', title: 'Move tax lookup to the edge worker', owner: 'Omar Haddad', priority: 'high', stage: 'todo', points: 8, blocked: true },
  { id: 5, key: 'CHK-190', title: 'Order summary skeleton while pricing loads', owner: 'Lena Brooks', priority: 'normal', stage: 'done', points: 2 },
  { id: 6, key: 'CHK-207', title: 'Gift card field with live balance check', owner: 'Lena Brooks', priority: 'high', stage: 'doing', points: 5 },
  { id: 7, key: 'CHK-212', title: 'Copy pass on payment error messages', owner: 'Lena Brooks', priority: 'normal', stage: 'review', points: 1 },
  { id: 8, key: 'CHK-195', title: 'Alert on checkout conversion drop over 5%', owner: 'Omar Haddad', priority: 'urgent', stage: 'done', points: 2 }
])

const priorities: Priority[] = ['urgent', 'high', 'normal']
const priorityLabel: Record<Priority, string> = { urgent: 'Urgent', high: 'High', normal: 'Normal' }

const lanes = computed<Lane[]>(() => {
  const keys = groupBy.value === 'priority'
    ? priorities.map(p => ({ id: p, label: priorityLabel[p], match: (t: Task) => t.priority === p }))
    : [...new Set(tasks.value.map(t => t.owner))].map(o => ({ id: o.toLowerCase().replace(/\s+/g, '-'), label: o, match: (t: Task) => t.owner === o }))
  return keys.map((k) => {
    const list = tasks.value.filter(k.match)
    const cells: Record<StageId, Task[]> = { todo: [], doing: [], review: [], done: [] }
    for (const t of list) cells[t.stage].push(t)
    return { id: k.id, label: k.label, tasks: list, cells, points: list.reduce((sum, t) => sum + t.points, 0) }
  })
})

const doneCount = computed(() => tasks.value.filter(t => t.stage === 'done').length)
const blockedCount = computed(() => tasks.value.filter(t => t.blocked).length)
const countIn = (s: StageId): number => tasks.value.filter(t => t.stage === s).length
const nextStage = (s: StageId): StageId => stages[Math.min(stages.findIndex(x => x.id === s) + 1, stages.length - 1)]!.id
const nextLabel = (s: StageId): string => stages.find(x => x.id === nextStage(s))?.label ?? ''

function advance(t: Task) {
  t.stage = nextStage(t.stage)
}
function toggle(id: string) {
  const next = new Set(collapsed.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsed.value = next
}
function toggleAll() {
  collapsed.value = collapsed.value.size ? new Set() : new Set(lanes.value.map(l => l.id))
}
</script>

<style scoped>
.skb { container-type: inline-size; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 14px; height: 640px; padding: 18px; box-sizing: border-box; background: var(--mi-page); font-family: var(--mi-font); color: var(--mi-label); }
.skb__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.skb__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.skb__frame { overflow: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.skb__frame:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.skb__board { min-width: 820px; }
.skb__stages, .skb__cells { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Stage names stay visible while lanes scroll under them. */
.skb__stages { position: sticky; top: 0; z-index: 2; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); }
.skb__stages span { padding: 12px 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--mi-label2); }
.skb__stages b { margin-left: 4px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }

.skb__lane + .skb__lane { border-top: 1px solid var(--mi-sep); }
.skb__lane-head { position: sticky; left: 0; margin: 0; width: max-content; max-width: 100cqi; }
.skb__lane-btn { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border: 0; background: transparent; font: inherit; color: inherit; cursor: pointer; text-align: start; }
.skb__lane-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; border-radius: var(--mi-radius-m); }
.skb__chev { color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.skb__chev.is-open { transform: rotate(90deg); }
.skb__lane-name { font-size: 14px; font-weight: 600; }
.skb__lane-count { font-size: 12px; font-weight: 400; color: var(--mi-label2); }
.skb__prio { width: 10px; height: 10px; border-radius: 3px; }
.skb__prio.is-urgent { background: var(--mi-red); }
.skb__prio.is-high { background: var(--mi-orange); }
.skb__prio.is-normal { background: var(--mi-label3); }

.skb__cells { padding: 0 6px 12px; }
.skb__cell { display: grid; align-content: start; gap: 8px; min-height: 64px; margin: 0; padding: 6px; list-style: none; border-radius: var(--mi-radius-l); }
.skb__cell:nth-child(odd) { background: var(--mi-fill4); }
.skb__card { display: grid; gap: 4px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.skb__card.is-blocked { box-shadow: inset 3px 0 0 var(--mi-red), var(--mi-sh1); }
.skb__card.is-done .skb__title { color: var(--mi-label2); }
.skb__key { font-size: 11px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.skb__title { font-size: 13px; font-weight: 500; line-height: 1.35; }
.skb__foot { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-height: 28px; }
.skb__pts { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

@container (min-width: 900px) { .skb__board { min-width: 0; } .skb__head { padding-inline: 4px; } }
</style>
