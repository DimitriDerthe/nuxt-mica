<template>
  <section class="iqb" aria-labelledby="iqb-title">
    <header class="iqb__head">
      <MiText id="iqb-title" variant="title3" as="h2" weight="semibold">Atlas · Issues</MiText>
      <MiSegmented v-model="match" label="Match" :options="[{ value: 'all', label: 'Match all' }, { value: 'any', label: 'Match any' }]" />
    </header>

    <div class="iqb__bar" role="group" aria-label="Issue filters">
      <MiSearch v-model="query" class="iqb__search" size="compact" placeholder="Search titles or ATL-…" :cancelable="false" />

      <div class="iqb__tokens">
        <!-- One token per field: field · operator (click to flip) · value (menu) · remove. -->
        <div v-for="t in tokens" :key="t.field" class="iqb__tok" :class="{ 'is-neg': t.neg }">
          <span class="iqb__tok-field">{{ FIELDS[t.field].label }}</span>
          <button type="button" class="iqb__tok-op" :aria-label="`${FIELDS[t.field].label}: switch to ${t.neg ? 'is' : 'is not'}`" @click="t.neg = !t.neg">
            {{ t.neg ? 'is not' : 'is' }}
          </button>
          <MiMenu v-model="t.value" variant="popup" :items="FIELDS[t.field].values.map(v => ({ value: v, label: v }))" :aria-label="FIELDS[t.field].label + ' value'">
            <template #trigger="{ props }">
              <button type="button" class="iqb__tok-val" v-bind="props">{{ t.value }}</button>
            </template>
          </MiMenu>
          <button type="button" class="iqb__tok-x" :aria-label="'Remove ' + FIELDS[t.field].label + ' filter'" @click="remove(t.field)">
            <MiIcon name="close" :size="12" :weight="2.4" />
          </button>
        </div>

        <MiMenu v-if="free.length" :items="free.map(k => ({ value: k, label: FIELDS[k].label }))" aria-label="Add filter" @select="i => add(String(i.value))">
          <template #trigger="{ props }">
            <button type="button" class="iqb__add" v-bind="props"><MiIcon name="plus" :size="14" :weight="2.2" />Filter</button>
          </template>
        </MiMenu>
        <MiButton v-if="tokens.length || query" variant="plain" size="small" @click="clear">Clear</MiButton>
      </div>
    </div>

    <p class="iqb__sentence" aria-live="polite">{{ sentence }}</p>

    <ul v-if="results.length" class="iqb__list">
      <li v-for="i in results" :key="i.id" class="iqb__row">
        <span class="iqb__prio" :class="'is-' + i.priority.toLowerCase()" role="img" :aria-label="i.priority + ' priority'"><i /><i /><i /></span>
        <span class="iqb__id">{{ i.id }}</span>
        <span class="iqb__title">{{ i.title }}</span>
        <span class="iqb__meta">
          <MiBadge variant="outline" tone="neutral" :label="i.label" />
          <span class="iqb__status" :class="'is-' + i.status.replace(/\s/g, '').toLowerCase()">{{ i.status }}</span>
          <MiAvatar :name="i.assignee" size="xs" tone="auto" />
        </span>
      </li>
    </ul>
    <MiEmptyState v-else icon="search" title="Nothing matches this query" description="Flip an operator or remove a filter to widen it." />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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

<style scoped>
.iqb { container-type: inline-size; display: grid; align-content: start; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }
.iqb__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.iqb__bar { display: grid; gap: 10px; padding: 10px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 720px) { .iqb__bar { grid-template-columns: 240px minmax(0, 1fr); align-items: center; } }
.iqb__tokens { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-width: 0; }

.iqb__tok { display: inline-flex; align-items: stretch; height: 30px; border-radius: 8px; background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep); font-size: 13px; overflow: hidden; }
.iqb__tok > * { display: inline-flex; align-items: center; }
.iqb__tok-field { padding: 0 8px; color: var(--mi-label2); }
.iqb__tok button { display: inline-flex; align-items: center; padding: 0 8px; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; }
.iqb__tok button:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; border-radius: 6px; }
.iqb__tok .iqb__tok-op { color: var(--mi-p-text); font-weight: 600; border-inline: 1px solid var(--mi-sep); }
.iqb__tok.is-neg .iqb__tok-op { color: var(--mi-red-t); }
.iqb__tok .iqb__tok-val { font-weight: 600; height: 100%; }
.iqb__tok .iqb__tok-x { border-left: 1px solid var(--mi-sep); color: var(--mi-label2); }
.iqb__tok .iqb__tok-x:hover, .iqb__tok .iqb__tok-op:hover, .iqb__tok .iqb__tok-val:hover { background: var(--mi-fill3); }
.iqb__add {
  display: inline-flex; align-items: center; gap: 4px; height: 30px; padding: 0 10px; border: 1px dashed var(--mi-label3); border-radius: 8px;
  background: none; color: var(--mi-label2); font: 500 13px var(--mi-font); cursor: pointer;
}
.iqb__add:hover { color: var(--mi-label); border-color: var(--mi-label2); }
.iqb__add:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.iqb__sentence { margin: 0 2px; font-size: 13px; color: var(--mi-label2); }
.iqb__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.iqb__row { display: grid; grid-template-columns: 18px auto minmax(0, 1fr); align-items: center; gap: 4px 10px; padding: 11px 14px; font-size: 14px; }
.iqb__row + .iqb__row { border-top: 1px solid var(--mi-sep); }
.iqb__id { color: var(--mi-label3); font-size: 12px; font-variant-numeric: tabular-nums; }
.iqb__title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.iqb__meta { grid-column: 2 / -1; display: flex; align-items: center; gap: 8px; }
@container (min-width: 640px) { .iqb__row { grid-template-columns: 18px 62px minmax(0, 1fr) auto; } .iqb__meta { grid-column: auto; } }

/* Priority as three bars; urgent fills all three in red. */
.iqb__prio { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
.iqb__prio i { width: 3px; height: 100%; border-radius: 1px; background: var(--mi-fill2); transform-origin: bottom; }
.iqb__prio i:nth-child(1) { transform: scaleY(.45); }
.iqb__prio i:nth-child(2) { transform: scaleY(.72); }
.iqb__prio.is-low i:nth-child(1), .iqb__prio.is-medium i:nth-child(-n+2), .iqb__prio.is-high i { background: var(--mi-label2); }
.iqb__prio.is-urgent i { background: var(--mi-red); }

.iqb__status { padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; white-space: nowrap; background: var(--mi-fill4); color: var(--mi-label2); }
.iqb__status.is-inprogress { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.iqb__status.is-inreview { background: var(--mi-p-tint); color: var(--mi-p-text); }
.iqb__status.is-done { background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
</style>
