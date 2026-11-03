<template>
  <section class="lqd" aria-labelledby="lqd-title">
    <!-- Log viewer behind: applied conditions filter it once the drawer closes. -->
    <div class="lqd__page" :inert="open || undefined">
      <div class="lqd__page-head">
        <div>
          <MiText id="lqd-title" variant="title3" as="h2" weight="semibold">Logs · production</MiText>
          <MiText variant="footnote" tone="label2">{{ visible.length }} of {{ LOGS.length }} lines · last 15 minutes</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="edit">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Query{{ applied.length ? ' · ' + applied.length : '' }}
        </MiButton>
      </div>
      <code v-if="applied.length" class="lqd__applied">{{ toQuery(applied, appliedMatch) }}</code>
      <ol class="lqd__logs">
        <li v-for="l in visible" :key="l.id" class="lqd__log">
          <span class="lqd__time">{{ l.time }}</span>
          <span class="lqd__level" :class="'is-' + l.level">{{ l.level }}</span>
          <span class="lqd__msg"><b>{{ l.service }}</b> {{ l.status }} {{ l.path }} · {{ l.msg }}</span>
        </li>
      </ol>
    </div>

    <div class="lqd__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="lqd__drawer" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline show-swipe-handle title="Build a query" :description="draftCount + ' lines match the draft'">
        <div class="lqd__body">
          <div class="lqd__presets" role="group" aria-label="Saved queries">
            <MiChip v-for="p in PRESETS" :key="p.name" :label="p.name" tone="neutral" size="small" selectable :model-value="activePreset === p.name" @update:model-value="load(p)" />
          </div>

          <div class="lqd__match">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Match</MiText>
            <MiSegmented v-model="match" label="Match conditions" :options="[{ value: 'all', label: 'All conditions' }, { value: 'any', label: 'Any condition' }]" />
          </div>

          <ol class="lqd__rows" aria-label="Conditions">
            <li v-for="(c, i) in draft" :key="c.id" class="lqd__row">
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

          <code class="lqd__preview" aria-label="Query preview">{{ draft.length ? toQuery(draft, match) : 'No conditions: every line is shown' }}</code>
        </div>

        <template #footer>
          <div class="lqd__foot">
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
.lqd { container-type: inline-size; position: relative; display: grid; min-height: 660px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.lqd__page, .lqd__scrim, .lqd__drawer { grid-area: 1 / 1; }
.lqd__page { display: grid; align-content: start; gap: 12px; padding: 20px; }
.lqd__page-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.lqd__applied, .lqd__preview { display: block; padding: 8px 12px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; overflow-wrap: anywhere; }
.lqd__preview { background: var(--mi-fill4); color: var(--mi-label2); }
.lqd__logs { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.lqd__log { display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: baseline; gap: 10px; padding: 8px 14px; }
.lqd__log + .lqd__log { border-top: 1px solid var(--mi-sep); }
.lqd__time { color: var(--mi-label3); }
.lqd__level { width: 44px; font-weight: 700; text-transform: uppercase; color: var(--mi-label2); }
.lqd__level.is-error { color: var(--mi-red-t); }
.lqd__level.is-warn { color: var(--mi-orange-t); }
.lqd__msg { overflow-wrap: anywhere; }
.lqd__msg b { font-weight: 600; }

.lqd__scrim { background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.lqd__scrim.is-on { opacity: 1; pointer-events: auto; }
.lqd__drawer { align-self: end; padding: 10px; transition: transform var(--mi-dur-4) var(--mi-spring); }
.lqd__drawer.is-closed { transform: translateY(105%); }

.lqd__body { display: grid; gap: 14px; }
.lqd__presets { display: flex; flex-wrap: wrap; gap: 6px; }
.lqd__match { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.lqd__rows { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.lqd__row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 6px; align-items: center; padding: 8px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.lqd__row > :nth-child(3) { grid-column: 1 / 3; }
.lqd__row > :nth-child(4) { grid-column: 3; grid-row: 1; }
.lqd__foot { display: flex; justify-content: flex-end; gap: 8px; }

@container (min-width: 640px) {
  .lqd__drawer { justify-self: center; width: min(720px, 100%); }
  .lqd__row { grid-template-columns: 130px 110px minmax(0, 1fr) auto; }
  .lqd__row > :nth-child(3), .lqd__row > :nth-child(4) { grid-column: auto; grid-row: auto; }
}
</style>
