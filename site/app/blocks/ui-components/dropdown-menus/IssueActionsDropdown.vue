<template>
  <section class="iad" aria-labelledby="iad-title">
    <header class="iad__head">
      <div>
        <MiText id="iad-title" variant="title3" as="h2" weight="semibold">Row actions</MiText>
        <MiText variant="footnote" tone="label2">Platform squad · Cycle 31 · {{ issues.length }} open issues</MiText>
      </div>
      <MiMenu v-model="sort" variant="popup" :items="sortItems" aria-label="Sort issues" placement="bottom-end" />
    </header>

    <div class="iad__grid">
      <!-- Live list: every row owns a real pulldown whose entries follow the row's state. -->
      <ul class="iad__list" aria-label="Issues">
        <li v-for="issue in sorted" :key="issue.id" class="iad__row" :class="{ 'is-done': issue.done }">
          <span class="iad__prio" :data-level="issue.priority" :aria-label="'Priority ' + issue.priority" role="img">
            <i /><i /><i />
          </span>
          <div class="iad__main">
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
      <aside class="iad__shown" aria-label="Menu preview">
        <div class="iad__anchor">
          <MiText variant="caption" tone="label2" weight="medium">{{ first.id }} · menu open</MiText>
          <span class="iad__fake-trigger" aria-hidden="true"><MiIcon name="more" :size="18" /></span>
        </div>
        <MiContextMenu inline :items="pinnedItems" label="Issue actions" :width="248" highlighted="priority" @select="(id) => act(first.id, id)" />
      </aside>
    </div>

    <p class="iad__log" aria-live="polite">
      <MiIcon name="check-circle" :size="16" class="iad__log-icon" />
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
.iad { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.iad__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.iad__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 760px) { .iad__grid { grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr); } }

.iad__list { list-style: none; margin: 0; padding: 6px; display: grid; gap: 2px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.iad__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 12px; padding: 10px 8px 10px 12px; border-radius: var(--mi-radius-m); transition: opacity var(--mi-dur-2) var(--mi-ease); }
.iad__row:hover { background: var(--mi-fill4); }
.iad__row.is-done { opacity: .62; }
.iad__row.is-done .iad__name { text-decoration: line-through; text-decoration-color: var(--mi-label3); }
.iad__status { display: none; }
@container (min-width: 520px) { .iad__row { grid-template-columns: auto minmax(0, 1fr) auto auto auto; } .iad__status { display: inline-flex; } }
.iad__main { display: grid; min-width: 0; }
.iad__key { font-variant-numeric: tabular-nums; letter-spacing: .02em; }

/* Three-bar priority glyph: lit bars carry the level, the colour carries the urgency. */
.iad__prio { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; color: var(--mi-label2); }
.iad__prio i { width: 3px; border-radius: 1px; background: currentColor; opacity: .25; }
.iad__prio i:nth-child(1) { height: 6px; } .iad__prio i:nth-child(2) { height: 10px; } .iad__prio i:nth-child(3) { height: 14px; }
.iad__prio[data-level="low"] i:nth-child(1),
.iad__prio[data-level="high"] i:nth-child(-n+2),
.iad__prio[data-level="urgent"] i { opacity: 1; }
.iad__prio[data-level="urgent"] { color: var(--mi-red); }
.iad__prio[data-level="high"] { color: var(--mi-orange); }

.iad__shown { position: relative; display: grid; justify-items: end; gap: 8px; padding: 18px; border-radius: var(--mi-radius-xl); background: radial-gradient(120% 90% at 100% 0%, var(--mi-p-tint), transparent 60%), var(--mi-fill4); overflow: hidden; }
.iad__anchor { display: flex; align-items: center; gap: 10px; }
.iad__fake-trigger { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--mi-fill2); color: var(--mi-label); box-shadow: 0 0 0 3px var(--mi-p-tint); }
.iad__shown > * { max-width: 100%; }

.iad__log { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0; font-size: 13px; color: var(--mi-label2); }
.iad__log-icon { color: var(--mi-green); }
</style>
