<template>
  <section class="arb" aria-labelledby="arb-title">
    <div class="arb__grid">
      <form class="arb__form" novalidate @submit.prevent="save">
        <header class="arb__head">
          <div>
            <MiText id="arb-title" variant="title3" as="h2" weight="semibold">Routing rule</MiText>
            <MiText variant="footnote" tone="label2">Pipeline · New business EMEA</MiText>
          </div>
          <div class="arb__on">
            <MiText id="arb-on" variant="footnote" weight="medium">{{ enabled ? 'Active' : 'Paused' }}</MiText>
            <MiSwitch v-model="enabled" size="compact" tone="success" aria-labelledby="arb-on" />
          </div>
        </header>

        <div class="arb__step">
          <span class="arb__tag">When</span>
          <MiSelect v-model="trigger" :options="TRIGGERS" aria-label="Trigger" />
        </div>

        <div class="arb__step arb__step--if">
          <div class="arb__if-head">
            <span class="arb__tag">If</span>
            <MiSegmented v-model="match" label="Condition logic" :options="[{ value: 'all', label: 'All match' }, { value: 'any', label: 'Any matches' }]" />
          </div>
          <MiRepeater v-model="rows" :min="1" :max="4" :template="blank" label="Condition" add-label="Add condition" remove-label="Remove condition">
            <template #default="{ row, update }">
              <div class="arb__cond">
                <MiNativeSelect
                  :model-value="String(row.field)" size="sm" aria-label="Field" :options="FIELD_OPTIONS"
                  @update:model-value="update({ field: $event, op: FIELDS[fieldOf($event)].ops[0], value: '' })"
                />
                <MiNativeSelect
                  :model-value="String(row.op)" size="sm" aria-label="Operator" :options="FIELDS[fieldOf(row.field)].ops.map(o => ({ value: o, label: o }))"
                  @update:model-value="update({ op: $event })"
                />
                <MiInput
                  :model-value="String(row.value ?? '')" size="sm" aria-label="Value" :placeholder="FIELDS[fieldOf(row.field)].hint"
                  :invalid="tried && !String(row.value ?? '').trim()" @update:model-value="update({ value: $event })"
                />
              </div>
            </template>
          </MiRepeater>
        </div>

        <div class="arb__step">
          <span class="arb__tag">Then</span>
          <div class="arb__then">
            <MiSelect v-model="action" :options="ACTIONS" aria-label="Action" />
            <MiField :error="tried && !target.trim() ? 'Who or where should this go?' : ''">
              <MiInput v-model="target" :placeholder="actionHint" :aria-label="actionHint" />
            </MiField>
          </div>
        </div>

        <footer class="arb__foot">
          <MiText variant="caption" :tone="saved ? 'green' : 'label2'" aria-live="polite">{{ status }}</MiText>
          <MiButton type="submit">Save rule</MiButton>
        </footer>
      </form>

      <aside class="arb__side" aria-labelledby="arb-test-title">
        <MiText variant="caption" tone="label2" weight="semibold">In plain words</MiText>
        <p class="arb__sentence">{{ sentence }}</p>

        <div class="arb__test-head">
          <MiText id="arb-test-title" variant="subheadline" as="h3" weight="semibold">Dry run</MiText>
          <MiBadge :tone="hits ? 'success' : 'neutral'" :label="`${hits} of ${DEALS.length} recent deals`" />
        </div>
        <ul class="arb__deals">
          <li v-for="d in tested" :key="d.name" :class="{ 'is-hit': d.hit }">
            <MiIcon :name="d.hit ? 'check-circle-fill' : 'minus'" :size="16" />
            <span class="arb__deal-name">{{ d.name }}</span>
            <span class="arb__deal-meta">{{ d.country }} · €{{ d.amount.toLocaleString('en-US') }}</span>
          </li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type FieldId = 'amount' | 'country' | 'source' | 'seats'
interface Deal { name: string, amount: number, country: string, source: string, seats: number }
interface Cond { field: FieldId, op: string, value: string }

const FIELDS: Record<FieldId, { label: string, ops: string[], hint: string, num: boolean }> = {
  amount: { label: 'Amount (€)', ops: ['is more than', 'is less than'], hint: '20000', num: true },
  seats: { label: 'Seats', ops: ['is more than', 'is less than'], hint: '50', num: true },
  country: { label: 'Country', ops: ['is', 'is not'], hint: 'Germany', num: false },
  source: { label: 'Lead source', ops: ['is', 'is not', 'contains'], hint: 'Webinar', num: false }
}
const FIELD_OPTIONS = (Object.keys(FIELDS) as FieldId[]).map(id => ({ value: id, label: FIELDS[id].label }))
const TRIGGERS = [
  { value: 'created', label: 'A deal is created' },
  { value: 'stage', label: 'A deal moves to Proposal' },
  { value: 'quiet', label: 'A deal has no activity for 14 days' }
]
const ACTIONS = [
  { value: 'assign', label: 'Assign the deal to' },
  { value: 'slack', label: 'Post in Slack channel' },
  { value: 'tag', label: 'Add the tag' }
]
// Last eight deals, used for the dry run.
const DEALS: Deal[] = [
  { name: 'Brauhaus Logistik', amount: 48000, country: 'Germany', source: 'Webinar', seats: 120 },
  { name: 'Nordlys Energi', amount: 12500, country: 'Norway', source: 'Referral', seats: 30 },
  { name: 'Atelier Pélican', amount: 26000, country: 'France', source: 'Webinar replay', seats: 64 },
  { name: 'Kranich Medical', amount: 91000, country: 'Germany', source: 'Outbound', seats: 400 },
  { name: 'Vale Coffee Co.', amount: 6400, country: 'Portugal', source: 'Website', seats: 12 },
  { name: 'Huber & Söhne', amount: 22000, country: 'Austria', source: 'Webinar', seats: 55 },
  { name: 'Delft Acoustics', amount: 31000, country: 'Netherlands', source: 'Partner', seats: 80 },
  { name: 'Ostsee Freight', amount: 17800, country: 'Germany', source: 'Website', seats: 40 }
]

const enabled = ref(true)
const trigger = ref<string | number | null>('created')
const match = ref<string | number | null>('all')
const rows = ref<Record<string, unknown>[]>([
  { field: 'amount', op: 'is more than', value: '20000' },
  { field: 'source', op: 'contains', value: 'Webinar' }
])
const action = ref<string | number | null>('assign')
const target = ref('Lena Fischer')
const tried = ref(false)
const saved = ref(false)

const blank = () => ({ field: 'country', op: 'is', value: '' })
const fieldOf = (v: unknown): FieldId => (typeof v === 'string' && v in FIELDS ? v : 'amount') as FieldId
const conds = computed<Cond[]>(() => rows.value.map(r => ({ field: fieldOf(r.field), op: String(r.op), value: String(r.value ?? '').trim() })))
const ready = computed(() => conds.value.every(c => c.value) && !!target.value.trim())

function test(d: Deal, c: Cond) {
  if (!c.value) return false
  const v = d[c.field]
  if (typeof v === 'number') return c.op === 'is more than' ? v > Number(c.value) : v < Number(c.value)
  const a = v.toLowerCase(), b = c.value.toLowerCase()
  return c.op === 'is' ? a === b : c.op === 'is not' ? a !== b : a.includes(b)
}
const tested = computed(() => DEALS.map(d => ({ ...d, hit: match.value === 'all' ? conds.value.every(c => test(d, c)) : conds.value.some(c => test(d, c)) })))
const hits = computed(() => tested.value.filter(d => d.hit).length)

const actionHint = computed(() => ({ assign: 'Teammate name', slack: '#channel', tag: 'Tag name' })[String(action.value) as 'assign' | 'slack' | 'tag'])
const sentence = computed(() => {
  const when = TRIGGERS.find(t => t.value === trigger.value)?.label ?? ''
  const ifs = conds.value.map(c => `${FIELDS[c.field].label.replace(' (€)', '').toLowerCase()} ${c.op} ${c.value || '…'}`).join(match.value === 'all' ? ' and ' : ' or ')
  const then = ACTIONS.find(a => a.value === action.value)?.label.toLowerCase() ?? ''
  return `${when}, and ${ifs}: ${then} ${target.value.trim() || '…'}.`
})
const status = computed(() => saved.value ? `Saved · runs on new events${enabled.value ? '' : ' once resumed'}` : tried.value && !ready.value ? 'Fill the highlighted fields' : 'Unsaved changes')

watch([rows, trigger, match, action, target, enabled], () => { saved.value = false }, { deep: true })
function save() {
  tried.value = true
  if (ready.value) saved.value = true
}
</script>

<style scoped>
.arb { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.arb__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 880px) { .arb__grid { grid-template-columns: minmax(0, 1fr) 320px; align-items: start; } }
.arb__form { display: grid; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.arb__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.arb__on { display: flex; align-items: center; gap: 8px; }

/* Each step hangs off a rail so the rule reads top to bottom. */
.arb__step { position: relative; display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.arb__step + .arb__step::before { content: ""; position: absolute; left: 30px; top: -14px; width: 2px; height: 14px; background: var(--mi-sep); }
.arb__tag { justify-self: start; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; background: var(--mi-p-tint); color: var(--mi-p-text); }
.arb__if-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.arb__cond { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); flex: 1; min-width: 0; }
@container (min-width: 560px) { .arb__cond { grid-template-columns: 1.1fr 1fr 1fr; } }
.arb__then { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) { .arb__then { grid-template-columns: 1fr 1fr; align-items: start; } }
.arb__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-top: 6px; }

.arb__side { display: grid; gap: 10px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.arb__sentence { margin: 0 0 8px; padding: 12px 14px; border-left: 3px solid var(--mi-p); border-radius: 0 var(--mi-radius-m) var(--mi-radius-m) 0; background: var(--mi-fill4); font-size: 14px; line-height: 1.5; }
.arb__test-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.arb__deals { display: grid; margin: 0; padding: 0; list-style: none; }
.arb__deals li { display: grid; grid-template-columns: 16px minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 8px 0; font-size: 13px; color: var(--mi-label3); }
.arb__deals li + li { border-top: 1px solid var(--mi-sep); }
.arb__deals li.is-hit { color: var(--mi-label); }
.arb__deals li.is-hit :deep(svg) { color: var(--mi-green); }
.arb__deal-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.arb__deal-meta { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--mi-label2); }
</style>
