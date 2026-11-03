<template>
  <section class="iad mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="iad-title">
    <header class="iad__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="iad-title" variant="title3" as="h2" weight="semibold">Row actions</MiText>
        <MiText variant="footnote" tone="label2">Platform squad · Cycle 31 · {{ issues.length }} open issues</MiText>
      </div>
      <MiMenu v-model="sort" variant="popup" :items="sortItems" aria-label="Sort issues" placement="bottom-end" />
    </header>

    <div class="iad__grid mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]:grid-cols-[minmax(0,_1.5fr)_minmax(260px,_1fr)]">
      <!-- Live list: every row owns a real pulldown whose entries follow the row's state. -->
      <ul class="iad__list mi:[list-style:none] mi:m-0 mi:p-1.5 mi:grid mi:gap-0.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-label="Issues">
        <li v-for="issue in sorted" :key="issue.id" class="iad__row mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto_auto] mi:items-center mi:gap-3 mi:pt-2.5 mi:pr-2 mi:pb-2.5 mi:pl-3 mi:rounded-md mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:[background:var(--mi-fill4)] mi:[&.is-done]:opacity-62 mi:@[520px]:grid-cols-[auto_minmax(0,_1fr)_auto_auto_auto]" :class="{ 'is-done': issue.done }">
          <span class="iad__prio mi:inline-flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-3.5 mi:text-label2" :data-level="issue.priority" :aria-label="'Priority ' + issue.priority" role="img">
            <i class="mi:[.iad__prio_&]:w-[3px] mi:[.iad__prio_&]:rounded-[1px] mi:[.iad__prio_&]:[background:currentColor] mi:[.iad__prio_&]:opacity-25 mi:[.iad__prio_&:nth-child(1)]:h-1.5 mi:[.iad__prio_&:nth-child(2)]:h-2.5 mi:[.iad__prio_&:nth-child(3)]:h-3.5 mi:[.iad__prio[data-level='low']_&:nth-child(1)]:opacity-100 mi:[.iad__prio[data-level='high']_&:nth-child(-n+2)]:opacity-100 mi:[.iad__prio[data-level='urgent']_&]:opacity-100" /><i class="mi:[.iad__prio_&]:w-[3px] mi:[.iad__prio_&]:rounded-[1px] mi:[.iad__prio_&]:[background:currentColor] mi:[.iad__prio_&]:opacity-25 mi:[.iad__prio_&:nth-child(1)]:h-1.5 mi:[.iad__prio_&:nth-child(2)]:h-2.5 mi:[.iad__prio_&:nth-child(3)]:h-3.5 mi:[.iad__prio[data-level='low']_&:nth-child(1)]:opacity-100 mi:[.iad__prio[data-level='high']_&:nth-child(-n+2)]:opacity-100 mi:[.iad__prio[data-level='urgent']_&]:opacity-100" /><i class="mi:[.iad__prio_&]:w-[3px] mi:[.iad__prio_&]:rounded-[1px] mi:[.iad__prio_&]:[background:currentColor] mi:[.iad__prio_&]:opacity-25 mi:[.iad__prio_&:nth-child(1)]:h-1.5 mi:[.iad__prio_&:nth-child(2)]:h-2.5 mi:[.iad__prio_&:nth-child(3)]:h-3.5 mi:[.iad__prio[data-level='low']_&:nth-child(1)]:opacity-100 mi:[.iad__prio[data-level='high']_&:nth-child(-n+2)]:opacity-100 mi:[.iad__prio[data-level='urgent']_&]:opacity-100" />
          </span>
          <div class="iad__main mi:grid mi:min-w-0">
            <MiText variant="caption" tone="label3" weight="medium" class="iad__key">{{ issue.id }}</MiText>
            <MiText variant="subheadline" weight="medium" :lines="1" class="iad__name">{{ issue.title }}</MiText>
          </div>
          <MiBadge :tone="issue.done ? 'success' : 'neutral'" :label="issue.done ? 'Done' : 'In progress'" dot class="iad__status" />
          <MiAvatar :name="issue.assignee" size="xs" tone="auto" />
          <MiMenu :items="menuFor(issue)" :aria-label="'Actions for ' + issue.id" placement="bottom-end" @select="(item) => act(issue.id, item.value)">
            <template #trigger="{ props: tp }">
              <MiIconButton v-bind="tp" :label="'Actions for ' + issue.id" variant="plain" size="small">
                <MiIcon name="more" :size="18" />
              </MiIconButton>
            </template>
          </MiMenu>
        </li>
      </ul>

      <!-- The same menu, pinned open next to its trigger so the anatomy is visible at a glance. -->
      <aside class="iad__shown mi:relative mi:grid mi:justify-items-end mi:gap-2 mi:p-4.5 mi:rounded-xl mi:[background:radial-gradient(120%_90%_at_100%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-fill4)] mi:overflow-hidden" aria-label="Menu preview">
        <div class="iad__anchor mi:flex mi:items-center mi:gap-2.5">
          <MiText variant="caption" tone="label2" weight="medium">{{ first.id }} · menu open</MiText>
          <span class="iad__fake-trigger mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[50%] mi:[background:var(--mi-fill2)] mi:text-label mi:shadow-[0_0_0_3px_var(--mi-p-tint)]" aria-hidden="true"><MiIcon name="more" :size="18" /></span>
        </div>
        <MiContextMenu inline :items="pinnedItems" label="Issue actions" :width="248" highlighted="priority" @select="(id) => act(first.id, id)" />
      </aside>
    </div>

    <p class="iad__log mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">
      <MiIcon name="check-circle" :size="16" class="iad__log-icon mi:text-green" />
      <span>{{ log }}</span>
      <MiButton v-if="undo" variant="plain" size="mini" @click="restore">Undo</MiButton>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Priority = 'urgent' | 'high' | 'low'
interface Issue { id: string, title: string, priority: Priority, done: boolean, assignee: string }

const issues = ref<Issue[]>([
  { id: 'ENG-412', title: 'Webhook retries ignore the Retry-After header', priority: 'urgent', done: false, assignee: 'Inès Haddad' },
  { id: 'ENG-418', title: 'Invoice PDF clips long company names', priority: 'high', done: false, assignee: 'Tomás Reyes' },
  { id: 'ENG-421', title: 'Search index lags 40 s behind writes on eu-west', priority: 'high', done: true, assignee: 'Mei Lin Zhao' },
  { id: 'ENG-427', title: 'Rotate the staging Postgres credentials', priority: 'low', done: false, assignee: 'Oskar Lund' }
])

const sortItems = [
  { heading: 'Sort by' },
  { value: 'priority', label: 'Priority' },
  { value: 'key', label: 'Issue key' },
  { value: 'status', label: 'Status' }
]
const sort = ref<string | number | undefined>('priority')
const rank: Record<Priority, number> = { urgent: 0, high: 1, low: 2 }
const sorted = computed(() => [...issues.value].sort((a, b) =>
  sort.value === 'key' ? a.id.localeCompare(b.id)
    : sort.value === 'status' ? Number(a.done) - Number(b.done)
      : rank[a.priority] - rank[b.priority]))
const first = computed(() => sorted.value[0] ?? issues.value[0]!)

const menuFor = (i: Issue) => [
  { value: 'done', label: i.done ? 'Reopen' : 'Mark as done', shortcut: '⌘↵' },
  { value: 'assign', label: i.assignee === 'You' ? 'Unassign me' : 'Assign to me', shortcut: '⌘I' },
  { value: 'dup', label: 'Duplicate', shortcut: '⌘D' },
  { separator: true },
  { heading: 'Priority' },
  { value: 'p-urgent', label: 'Urgent', checked: i.priority === 'urgent' },
  { value: 'p-high', label: 'High', checked: i.priority === 'high' },
  { value: 'p-low', label: 'Low', checked: i.priority === 'low' },
  { separator: true },
  { value: 'archive', label: 'Archive', destructive: true, shortcut: '⌘⌫' }
]

const pinnedItems = computed(() => {
  const i = first.value
  return [
    { id: 'done', label: i.done ? 'Reopen' : 'Mark as done', icon: 'check' as const, shortcut: '⌘↵' },
    { id: 'assign', label: i.assignee === 'You' ? 'Unassign me' : 'Assign to me', icon: 'pencil' as const, shortcut: '⌘I' },
    { id: 'dup', label: 'Duplicate', icon: 'duplicate' as const, shortcut: '⌘D' },
    {
      id: 'priority', label: 'Priority', icon: 'warning' as const,
      children: (['urgent', 'high', 'low'] as const).map(p => ({ id: 'p-' + p, label: p[0]!.toUpperCase() + p.slice(1), type: 'checkbox' as const, checked: i.priority === p }))
    },
    { id: 'sep', type: 'separator' as const },
    { id: 'archive', label: 'Archive', icon: 'trash' as const, destructive: true, shortcut: '⌘⌫' }
  ]
})

const log = ref('Pick an action from any row, or from the open menu.')
const undo = ref<{ issue: Issue, index: number } | null>(null)
let copies = 0

function act(id: string, value: string | number | undefined) {
  const index = issues.value.findIndex(i => i.id === id)
  const issue = issues.value[index]
  if (!issue || value === undefined) return
  undo.value = null
  const v = String(value)
  if (v === 'done') { issue.done = !issue.done; log.value = `${id} ${issue.done ? 'marked as done' : 'reopened'}.` }
  else if (v === 'assign') { issue.assignee = issue.assignee === 'You' ? 'Inès Haddad' : 'You'; log.value = `${id} assigned to ${issue.assignee === 'You' ? 'you' : issue.assignee}.` }
  else if (v === 'dup') {
    copies += 1
    const copy = { ...issue, id: `ENG-${430 + copies}`, done: false, title: issue.title + ' (copy)' }
    issues.value.splice(index + 1, 0, copy)
    log.value = `${id} duplicated as ${copy.id}.`
  }
  else if (v.startsWith('p-')) { issue.priority = v.slice(2) as Priority; log.value = `${id} priority set to ${issue.priority}.` }
  else if (v === 'archive') { issues.value.splice(index, 1); undo.value = { issue, index }; log.value = `${id} archived.` }
}

function restore() {
  if (!undo.value) return
  issues.value.splice(undo.value.index, 0, undo.value.issue)
  log.value = `${undo.value.issue.id} restored.`
  undo.value = null
}
</script>

<style scoped>
.iad__row.is-done .iad__name { text-decoration: line-through; text-decoration-color: var(--mi-label3); }
.iad__status { display: none; }
@container (min-width: 520px) { .iad__status { display: inline-flex; } }
.iad__key { font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.iad__prio[data-level="urgent"] { color: var(--mi-red); }
.iad__prio[data-level="high"] { color: var(--mi-orange); }
.iad__shown > * { max-width: 100%; }
</style>
