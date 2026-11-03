<template>
  <section class="mi:@container mi:grid mi:grid-rows-[auto_minmax(0,_1fr)] mi:gap-3.5 mi:h-160 mi:p-4.5 mi:box-border mi:bg-page mi:font-mi mi:text-label" aria-labelledby="skb-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3 mi:@[900px]:px-1">
      <div>
        <MiText id="skb-title" variant="title3" as="h2" weight="semibold">Checkout revamp · Sprint 14</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ doneCount }} of {{ tasks.length }} done · {{ blockedCount }} blocked</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
        <MiSegmented v-model="groupBy" label="Group lanes by" :options="groupOptions" />
        <MiButton size="small" variant="gray" @click="toggleAll">{{ collapsed.size ? 'Expand all' : 'Collapse all' }}</MiButton>
      </div>
    </header>

    <!-- Lanes are rows, stages are columns; the board scrolls inside this frame on small screens. -->
    <div class="mi:overflow-auto mi:rounded-xl mi:bg-card mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" aria-label="Board">
      <div class="mi:min-w-205 mi:@[900px]:min-w-0">
        <div class="mi:grid mi:grid-cols-4 mi:sticky mi:top-0 mi:z-2 mi:bg-card mi:border-b mi:border-b-sep" aria-hidden="true">
          <span class="mi:py-3 mi:px-3.5 mi:text-[12px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label2" v-for="s in stages" :key="s.id">{{ s.label }} <b class="mi:ml-1 mi:font-semibold mi:text-label3 mi:tabular-nums">{{ countIn(s.id) }}</b></span>
        </div>

        <section v-for="lane in lanes" :key="lane.id" class="mi:[section+&]:border-t mi:[section+&]:border-t-sep" :aria-labelledby="'skb-lane-' + lane.id">
          <h3 class="mi:sticky mi:left-0 mi:m-0 mi:w-max mi:max-w-[100cqi]">
            <button
              :id="'skb-lane-' + lane.id" type="button" class="mi:flex mi:items-center mi:gap-2 mi:py-3 mi:px-3.5 mi:[border:0] mi:bg-transparent mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:text-start mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-md"
              :aria-expanded="!collapsed.has(lane.id)" @click="toggle(lane.id)"
            >
              <MiIcon name="chevron-right" :size="14" class="mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="collapsed.has(lane.id) ? '' : 'mi:transform-[rotate(90deg)]'" />
              <MiAvatar v-if="groupBy === 'owner'" :name="lane.label" tone="auto" size="xs" decorative />
              <span v-else class="mi:w-2.5 mi:h-2.5 mi:rounded-[3px]" :class="PRIO[lane.id]" aria-hidden="true" />
              <span class="mi:text-[14px] mi:font-semibold">{{ lane.label }}</span>
              <span class="mi:text-[12px] mi:font-normal mi:text-label2">{{ lane.tasks.length }} tasks · {{ lane.points }} pt</span>
            </button>
          </h3>

          <div v-if="!collapsed.has(lane.id)" class="mi:grid mi:grid-cols-4 mi:pt-0 mi:px-1.5 mi:pb-3">
            <ul v-for="s in stages" :key="s.id" class="mi:grid mi:content-start mi:gap-2 mi:min-h-16 mi:m-0 mi:p-1.5 mi:[list-style:none] mi:rounded-lg mi:odd:bg-fill4" :aria-label="lane.label + ', ' + s.label">
              <li v-for="t in lane.cells[s.id]" :key="t.id" class="mi:grid mi:gap-1 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-card" :class="t.blocked ? 'mi:shadow-[inset_3px_0_0_var(--mi-red),_var(--mi-sh1)]' : 'mi:shadow-1'">
                <span class="mi:text-[11px] mi:font-semibold mi:text-label3 mi:tabular-nums">{{ t.key }}</span>
                <span class="mi:text-[13px] mi:font-medium mi:leading-[1.35]" :class="t.stage === 'done' ? 'mi:text-label2' : ''">{{ t.title }}</span>
                <span class="mi:flex mi:items-center mi:justify-between mi:gap-1.5 mi:min-h-7">
                  <MiBadge v-if="t.blocked" tone="danger" label="Blocked" />
                  <span v-else class="mi:text-[12px] mi:text-label2 mi:tabular-nums">{{ t.points }} pt</span>
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
const PRIO: Record<string, string> = { urgent: 'mi:bg-red', high: 'mi:bg-orange', normal: 'mi:bg-label3' }
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
