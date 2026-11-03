<template>
  <section class="lqd mi:@container mi:relative mi:grid mi:min-h-165 mi:rounded-xl mi:overflow-hidden mi:bg-page mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:font-mi mi:text-label" aria-labelledby="lqd-title">
    <!-- Log viewer behind: applied conditions filter it once the drawer closes. -->
    <div class="lqd__page mi:[grid-area:1_/_1] mi:grid mi:content-start mi:gap-3 mi:p-5" :inert="open || undefined">
      <div class="lqd__page-head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
        <div>
          <MiText id="lqd-title" variant="title3" as="h2" weight="semibold">Logs · production</MiText>
          <MiText variant="footnote" tone="label2">{{ visible.length }} of {{ LOGS.length }} lines · last 15 minutes</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="edit">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Query{{ applied.length ? ' · ' + applied.length : '' }}
        </MiButton>
      </div>
      <code v-if="applied.length" class="lqd__applied mi:block mi:py-2 mi:px-3 mi:rounded-md mi:bg-p-tint mi:text-p-text mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12px] mi:wrap-anywhere">{{ toQuery(applied, appliedMatch) }}</code>
      <ol class="lqd__logs mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:bg-card mi:shadow-1 mi:overflow-hidden mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12px]">
        <li v-for="l in visible" :key="l.id" class="lqd__log mi:grid mi:grid-cols-[auto_auto_minmax(0,_1fr)] mi:items-baseline mi:gap-2.5 mi:py-2 mi:px-3.5 mi:[.lqd__log+&]:border-t mi:[.lqd__log+&]:border-t-sep">
          <span class="lqd__time mi:text-label3">{{ l.time }}</span>
          <span class="lqd__level mi:w-11 mi:font-bold mi:uppercase mi:text-label2 mi:[&.is-error]:text-red-t mi:[&.is-warn]:text-orange-t" :class="'is-' + l.level">{{ l.level }}</span>
          <span class="lqd__msg mi:wrap-anywhere"><b class="mi:[.lqd__msg_&]:font-semibold">{{ l.service }}</b> {{ l.status }} {{ l.path }} · {{ l.msg }}</span>
        </li>
      </ol>
    </div>

    <div class="lqd__scrim mi:[grid-area:1_/_1] mi:bg-scrim mi:opacity-0 mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-on]:opacity-100 mi:[&.is-on]:pointer-events-auto" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="lqd__drawer mi:[grid-area:1_/_1] mi:self-end mi:p-2.5 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[&.is-closed]:transform-[translateY(105%)] mi:@[640px]:justify-self-center mi:@[640px]:w-[min(720px,_100%)]" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline show-swipe-handle title="Build a query" :description="draftCount + ' lines match the draft'">
        <div class="lqd__body mi:grid mi:gap-3.5">
          <div class="lqd__presets mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Saved queries">
            <MiChip v-for="p in PRESETS" :key="p.name" :label="p.name" tone="neutral" size="small" selectable :model-value="activePreset === p.name" @update:model-value="load(p)" />
          </div>

          <div class="lqd__match mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Match</MiText>
            <MiSegmented v-model="match" label="Match conditions" :options="[{ value: 'all', label: 'All conditions' }, { value: 'any', label: 'Any condition' }]" />
          </div>

          <ol class="lqd__rows mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Conditions">
            <li v-for="(c, i) in draft" :key="c.id" class="lqd__row mi:grid mi:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)_auto] mi:gap-1.5 mi:items-center mi:p-2 mi:rounded-md mi:bg-fill4 mi:@[640px]:grid-cols-[130px_110px_minmax(0,_1fr)_auto]">
              <MiNativeSelect v-model="c.field" size="sm" :aria-label="'Field of condition ' + (i + 1)" :options="FIELD_OPTIONS" />
              <MiNativeSelect v-model="c.op" size="sm" :aria-label="'Operator of condition ' + (i + 1)" :options="OP_OPTIONS" />
              <MiInput v-model="c.value" size="sm" :aria-label="'Value of condition ' + (i + 1)" placeholder="Value" />
              <MiIconButton :label="'Remove condition ' + (i + 1)" variant="gray" size="small" @click="draft.splice(i, 1)"><MiIcon name="close" :size="12" /></MiIconButton>
            </li>
          </ol>
          <MiButton variant="plain" size="small" :disabled="draft.length >= 5" @click="add">
            <template #leading><MiIcon name="plus" :size="14" /></template>
            Add condition
          </MiButton>

          <code class="lqd__preview mi:block mi:py-2 mi:px-3 mi:rounded-md mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12px] mi:wrap-anywhere" aria-label="Query preview">{{ draft.length ? toQuery(draft, match) : 'No conditions: every line is shown' }}</code>
        </div>

        <template #footer>
          <div class="lqd__foot mi:flex mi:[justify-content:flex-end] mi:gap-2">
            <MiButton variant="gray" @click="clear">Clear</MiButton>
            <MiButton @click="apply">Show {{ draftCount }} lines</MiButton>
          </div>
        </template>
      </MiDrawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Field = 'level' | 'service' | 'status' | 'path'
type Op = 'is' | 'not' | 'contains' | 'gte'
interface Log { id: number, time: string, level: 'error' | 'warn' | 'info', service: string, status: number, path: string, msg: string }
interface Cond { id: number, field: string | number | null, op: string | number | null, value: string }
type Clause = Omit<Cond, 'id'>
interface Preset { name: string, match: 'all' | 'any', conds: [Field, Op, string][] }

const FIELD_OPTIONS: { value: Field, label: string }[] = [{ value: 'level', label: 'Level' }, { value: 'service', label: 'Service' }, { value: 'status', label: 'Status' }, { value: 'path', label: 'Path' }]
const OP_OPTIONS: { value: Op, label: string }[] = [{ value: 'is', label: 'is' }, { value: 'not', label: 'is not' }, { value: 'contains', label: 'contains' }, { value: 'gte', label: '≥' }]
const SYMBOL: Record<string, string> = { is: '=', not: '!=', contains: '~', gte: '>=' }
const READ: Record<string, (l: Log) => string | number> = { level: l => l.level, service: l => l.service, status: l => l.status, path: l => l.path }

const PRESETS: Preset[] = [
  { name: 'Server errors', match: 'all', conds: [['status', 'gte', '500']] },
  { name: 'Checkout warnings', match: 'all', conds: [['service', 'is', 'checkout'], ['level', 'not', 'info']] },
  { name: 'Auth failures', match: 'all', conds: [['path', 'contains', '/auth'], ['status', 'gte', '400']] }
]

const LOGS: Log[] = [
  { id: 1, time: '14:02:11', level: 'error', service: 'checkout', status: 502, path: '/api/pay', msg: 'upstream timeout after 10s' },
  { id: 2, time: '14:02:09', level: 'info', service: 'catalog', status: 200, path: '/api/products', msg: '48 items in 31 ms' },
  { id: 3, time: '14:01:58', level: 'warn', service: 'auth', status: 401, path: '/auth/token', msg: 'expired refresh token' },
  { id: 4, time: '14:01:40', level: 'warn', service: 'checkout', status: 200, path: '/api/cart', msg: 'slow query 1.8s on cart_items' },
  { id: 5, time: '14:01:22', level: 'info', service: 'auth', status: 200, path: '/auth/login', msg: 'login ok' },
  { id: 6, time: '14:00:57', level: 'error', service: 'search', status: 500, path: '/api/search', msg: 'index shard 3 unavailable' },
  { id: 7, time: '14:00:31', level: 'warn', service: 'auth', status: 429, path: '/auth/login', msg: 'rate limit hit for 81.2.69.0/24' },
  { id: 8, time: '14:00:12', level: 'info', service: 'checkout', status: 201, path: '/api/orders', msg: 'order 40318 created' }
]

let nextId = 0
const cond = (field: Field, op: Op, value: string): Cond => ({ id: ++nextId, field, op, value })

const open = ref(true)
const draft = ref<Cond[]>([cond('service', 'is', 'checkout'), cond('level', 'not', 'info')])
const match = ref<string | number | null>('all')
const applied = ref<Cond[]>([])
const appliedMatch = ref<string | number | null>('all')

function test(l: Log, c: Cond) {
  const v = c.value.trim().toLowerCase()
  const read = READ[String(c.field)]
  if (!v || !read) return true
  const actual = String(read(l)).toLowerCase()
  if (c.op === 'not') return actual !== v
  if (c.op === 'contains') return actual.includes(v)
  if (c.op === 'gte') return Number(actual) >= Number(v)
  return actual === v
}
const run = (conds: Cond[], m: string | number | null) => LOGS.filter(l => !conds.length || (m === 'any' ? conds.some(c => test(l, c)) : conds.every(c => test(l, c))))
const toQuery = (conds: Clause[], m: string | number | null) => conds.map(c => `${c.field} ${SYMBOL[String(c.op)] ?? '='} "${c.value}"`).join(m === 'any' ? ' OR ' : ' AND ')
const clauses = (p: Preset): Clause[] => p.conds.map(([field, op, value]) => ({ field, op, value }))

const draftCount = computed(() => run(draft.value, match.value).length)
const visible = computed(() => run(applied.value, appliedMatch.value))
// A saved query is highlighted while the draft still equals it.
const activePreset = computed(() => PRESETS.find(p => p.match === match.value && toQuery(clauses(p), p.match) === toQuery(draft.value, match.value))?.name)

function load(p: Preset) {
  match.value = p.match
  draft.value = clauses(p).map(c => ({ ...c, id: ++nextId }))
}
function add() {
  draft.value.push(cond('level', 'is', ''))
}
function clear() {
  draft.value = []
}
function edit() {
  draft.value = applied.value.map(c => ({ ...c }))
  match.value = appliedMatch.value
  open.value = true
}
function apply() {
  applied.value = draft.value.map(c => ({ ...c }))
  appliedMatch.value = match.value
  open.value = false
}
</script>

<style scoped>
.lqd__preview { background: var(--mi-p-tint); color: var(--mi-p-text); }
.lqd__preview { background: var(--mi-fill4); color: var(--mi-label2); }
.lqd__row > :nth-child(3) { grid-column: 1 / 3; }
.lqd__row > :nth-child(4) { grid-column: 3; grid-row: 1; }

@container (min-width: 640px) {
  .lqd__row > :nth-child(3), .lqd__row > :nth-child(4) { grid-column: auto; grid-row: auto; }
}
</style>
