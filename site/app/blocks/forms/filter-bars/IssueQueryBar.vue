<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="iqb-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
      <MiText id="iqb-title" variant="title3" as="h2" weight="semibold">Atlas · Issues</MiText>
      <MiSegmented v-model="match" label="Match" :options="[{ value: 'all', label: 'Match all' }, { value: 'any', label: 'Match any' }]" />
    </header>

    <div class="mi:grid mi:gap-2.5 mi:p-2.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:@[720px]:grid-cols-[240px_minmax(0,_1fr)] mi:@[720px]:items-center" role="group" aria-label="Issue filters">
      <MiSearch v-model="query" size="compact" placeholder="Search titles or ATL-…" :cancelable="false" />

      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:min-w-0">
        <!-- One token per field: field · operator (click to flip) · value (menu) · remove. -->
        <div v-for="t in tokens" :key="t.field" class="mi:inline-flex mi:items-stretch mi:h-7.5 mi:rounded-[8px] mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:text-[13px] mi:overflow-hidden">
          <span class="mi:inline-flex mi:items-center mi:py-0 mi:px-2 mi:text-label2">{{ FIELDS[t.field].label }}</span>
          <button type="button" class="mi:inline-flex mi:items-center mi:py-0 mi:px-2 mi:[border:0] mi:[background:none] mi:[font:inherit] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-[6px] mi:font-semibold mi:[border-inline:1px_solid_var(--mi-sep)] mi:hover:[background:var(--mi-fill3)]" :class="t.neg ? 'mi:text-red-t' : 'mi:text-p-text'" :aria-label="`${FIELDS[t.field].label}: switch to ${t.neg ? 'is' : 'is not'}`" @click="t.neg = !t.neg">
            {{ t.neg ? 'is not' : 'is' }}
          </button>
          <MiMenu v-model="t.value" class="mi:inline-flex! mi:items-center" variant="popup" :items="FIELDS[t.field].values.map(v => ({ value: v, label: v }))" :aria-label="FIELDS[t.field].label + ' value'">
            <template #trigger="{ props }">
              <button type="button" class="mi:inline-flex mi:items-center mi:py-0 mi:px-2 mi:[border:0] mi:[background:none] mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-[6px] mi:font-semibold mi:h-full mi:hover:[background:var(--mi-fill3)]" v-bind="props">{{ t.value }}</button>
            </template>
          </MiMenu>
          <button type="button" class="mi:inline-flex mi:items-center mi:py-0 mi:px-2 mi:[border:0] mi:[background:none] mi:[font:inherit] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-[6px] mi:border-l mi:border-l-sep mi:text-label2 mi:hover:[background:var(--mi-fill3)]" :aria-label="'Remove ' + FIELDS[t.field].label + ' filter'" @click="remove(t.field)">
            <MiIcon name="close" :size="12" :weight="2.4" />
          </button>
        </div>

        <MiMenu v-if="free.length" :items="free.map(k => ({ value: k, label: FIELDS[k].label }))" aria-label="Add filter" @select="i => add(String(i.value))">
          <template #trigger="{ props }">
            <button type="button" class="mi:inline-flex mi:items-center mi:hover:text-label mi:hover:border-label2 mi:gap-1 mi:h-7.5 mi:py-0 mi:px-2.5 mi:[border:1px_dashed_var(--mi-label3)] mi:rounded-[8px] mi:[background:none] mi:text-label2 mi:[font:500_13px_var(--mi-font)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" v-bind="props"><MiIcon name="plus" :size="14" :weight="2.2" />Filter</button>
          </template>
        </MiMenu>
        <MiButton v-if="tokens.length || query" variant="plain" size="small" @click="clear">Clear</MiButton>
      </div>
    </div>

    <p class="mi:my-0 mi:mx-0.5 mi:text-[13px] mi:text-label2" aria-live="polite">{{ sentence }}</p>

    <ul v-if="results.length" class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden">
      <li v-for="i in results" :key="i.id" class="mi:grid mi:items-center mi:grid-cols-[18px_auto_minmax(0,_1fr)] mi:gap-y-1 mi:gap-x-2.5 mi:py-[11px] mi:px-3.5 mi:text-[14px] mi:not-first:border-t mi:not-first:border-t-sep mi:@[640px]:grid-cols-[18px_62px_minmax(0,_1fr)_auto]">
        <span class="mi:inline-flex mi:items-flex-end mi:gap-0.5 mi:h-3" role="img" :aria-label="i.priority + ' priority'"><i v-for="n in 3" :key="n" class="mi:w-[3px] mi:h-full mi:rounded-[1px] mi:origin-bottom" :class="prioBar(i.priority, n)" /></span>
        <span class="mi:text-label3 mi:text-[12px] mi:tabular-nums">{{ i.id }}</span>
        <span class="mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ i.title }}</span>
        <span class="mi:flex mi:items-center mi:col-[2_/_-1] mi:gap-2 mi:@[640px]:col-[auto]">
          <MiBadge variant="outline" tone="neutral" :label="i.label" />
          <span class="mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[12px] mi:font-medium mi:whitespace-nowrap " :class="STATUS_CLS[i.status] ?? 'mi:[background:var(--mi-fill4)] mi:text-label2'">{{ i.status }}</span>
          <MiAvatar :name="i.assignee" size="xs" tone="auto" />
        </span>
      </li>
    </ul>
    <MiEmptyState v-else icon="search" title="Nothing matches this query" description="Flip an operator or remove a filter to widen it." />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const STATUS_CLS: Record<string, string> = {
  'In progress': 'mi:bg-orange/16 mi:text-orange-t',
  'In review': 'mi:bg-p-tint mi:text-p-text',
  Done: 'mi:bg-green/16 mi:text-green-t'
}
// Priority as three bars: low fills one, medium two, high all three in grey, urgent all three in red.
const prioBar = (priority: string, n: number) => [
  n === 1 ? 'mi:transform-[scaleY(.45)]' : n === 2 ? 'mi:transform-[scaleY(.72)]' : '',
  priority === 'Urgent' ? 'mi:[background:var(--mi-red)]'
    : priority === 'High' ? 'mi:[background:var(--mi-label2)]'
      : (priority === 'Medium' && n <= 2) || (priority === 'Low' && n === 1) ? 'mi:bg-label2' : 'mi:bg-fill2'
].join(' ')

type FieldKey = 'status' | 'priority' | 'assignee' | 'label'
const FIELDS: Record<FieldKey, { label: string, values: string[] }> = {
  status: { label: 'Status', values: ['Backlog', 'Todo', 'In progress', 'In review', 'Done'] },
  priority: { label: 'Priority', values: ['Urgent', 'High', 'Medium', 'Low'] },
  assignee: { label: 'Assignee', values: ['Hana Sato', 'Yusuf Demir', 'Clara Mendes', 'Felix Brandt'] },
  label: { label: 'Label', values: ['Bug', 'Feature', 'Chore'] }
}

const ISSUES = [
  { id: 'ATL-142', title: 'Invite step blocks workspace setup on Safari 17', status: 'In progress', priority: 'Urgent', assignee: 'Hana Sato', label: 'Bug' },
  { id: 'ATL-139', title: 'Show seat usage in the invite dialog', status: 'In review', priority: 'High', assignee: 'Yusuf Demir', label: 'Feature' },
  { id: 'ATL-137', title: 'Empty state for projects without issues', status: 'Todo', priority: 'Medium', assignee: 'Clara Mendes', label: 'Feature' },
  { id: 'ATL-133', title: 'Rate limit on CSV import endpoint', status: 'In progress', priority: 'High', assignee: 'Felix Brandt', label: 'Chore' },
  { id: 'ATL-131', title: 'Avatar initials clip in compact rows', status: 'Backlog', priority: 'Low', assignee: 'Hana Sato', label: 'Bug' },
  { id: 'ATL-128', title: 'Keyboard shortcut to duplicate an issue', status: 'Todo', priority: 'Low', assignee: 'Yusuf Demir', label: 'Feature' },
  { id: 'ATL-126', title: 'Webhook retries never stop after 410', status: 'In progress', priority: 'Urgent', assignee: 'Felix Brandt', label: 'Bug' },
  { id: 'ATL-121', title: 'Migrate onboarding emails to new templates', status: 'Done', priority: 'Medium', assignee: 'Clara Mendes', label: 'Chore' },
  { id: 'ATL-118', title: 'Dark mode contrast on status pills', status: 'In review', priority: 'Medium', assignee: 'Hana Sato', label: 'Bug' },
  { id: 'ATL-112', title: 'Weekly digest of unassigned issues', status: 'Backlog', priority: 'Medium', assignee: 'Yusuf Demir', label: 'Feature' }
]

interface Token { field: FieldKey, neg: boolean, value: string | number | undefined }
const tokens = ref<Token[]>([
  { field: 'status', neg: true, value: 'Done' },
  { field: 'label', neg: false, value: 'Bug' }
])
const query = ref('')
const match = ref<string | number | null>('all')

const free = computed(() => (Object.keys(FIELDS) as FieldKey[]).filter(k => !tokens.value.some(t => t.field === k)))
function add(field: string) {
  const k = field as FieldKey
  tokens.value.push({ field: k, neg: false, value: FIELDS[k].values[0] })
}
const remove = (field: FieldKey) => { tokens.value = tokens.value.filter(t => t.field !== field) }
function clear() {
  tokens.value = []
  query.value = ''
}

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  return ISSUES.filter((i) => {
    if (q && !(i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))) return false
    if (!tokens.value.length) return true
    const hits = tokens.value.map(t => (i[t.field] === t.value) !== t.neg)
    return match.value === 'all' ? hits.every(Boolean) : hits.some(Boolean)
  })
})

// The query read back as a sentence, so "is not" and "any" are never ambiguous.
const sentence = computed(() => {
  const n = `${results.value.length} issue${results.value.length === 1 ? '' : 's'}`
  const parts = tokens.value.map(t => `${FIELDS[t.field].label.toLowerCase()} ${t.neg ? 'is not' : 'is'} ${t.value}`)
  const joined = parts.join(match.value === 'all' ? ' and ' : ' or ')
  const q = query.value.trim() ? ` matching “${query.value.trim()}”` : ''
  return parts.length ? `${n}${q} where ${joined}` : `${n}${q}, no filters`
})
</script>
