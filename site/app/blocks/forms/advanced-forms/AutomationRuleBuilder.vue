<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="arb-title">
    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[880px]:grid-cols-[minmax(0,_1fr)_320px] mi:@[880px]:items-start">
      <form class="mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="save">
        <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
          <div>
            <MiText id="arb-title" variant="title3" as="h2" weight="semibold">Routing rule</MiText>
            <MiText variant="footnote" tone="label2">Pipeline · New business EMEA</MiText>
          </div>
          <div class="mi:flex mi:items-center mi:gap-2">
            <MiText id="arb-on" variant="footnote" weight="medium">{{ enabled ? 'Active' : 'Paused' }}</MiText>
            <MiSwitch v-model="enabled" size="compact" tone="success" aria-labelledby="arb-on" />
          </div>
        </header>

        <div class="mi:relative mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4 mi:not-first:before:content-[''] mi:not-first:before:absolute mi:not-first:before:left-7.5 mi:not-first:before:-top-3.5 mi:not-first:before:w-0.5 mi:not-first:before:h-3.5 mi:not-first:before:bg-sep">
          <span class="mi:justify-self-start mi:py-0.5 mi:px-2.5 mi:rounded-[999px] mi:text-[12px] mi:font-bold mi:tracking-[.04em] mi:uppercase mi:bg-p-tint mi:text-p-text">When</span>
          <MiSelect v-model="trigger" :options="TRIGGERS" aria-label="Trigger" />
        </div>

        <div class="mi:relative mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4 mi:not-first:before:content-[''] mi:not-first:before:absolute mi:not-first:before:left-7.5 mi:not-first:before:-top-3.5 mi:not-first:before:w-0.5 mi:not-first:before:h-3.5 mi:not-first:before:bg-sep">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
            <span class="mi:justify-self-start mi:py-0.5 mi:px-2.5 mi:rounded-[999px] mi:text-[12px] mi:font-bold mi:tracking-[.04em] mi:uppercase mi:bg-p-tint mi:text-p-text">If</span>
            <MiSegmented v-model="match" label="Condition logic" :options="[{ value: 'all', label: 'All match' }, { value: 'any', label: 'Any matches' }]" />
          </div>
          <MiRepeater v-model="rows" :min="1" :max="4" :template="blank" label="Condition" add-label="Add condition" remove-label="Remove condition">
            <template #default="{ row, update }">
              <div class="mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:flex-1 mi:min-w-0 mi:@[560px]:grid-cols-[1.1fr_1fr_1fr]">
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

        <div class="mi:relative mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4 mi:not-first:before:content-[''] mi:not-first:before:absolute mi:not-first:before:left-7.5 mi:not-first:before:-top-3.5 mi:not-first:before:w-0.5 mi:not-first:before:h-3.5 mi:not-first:before:bg-sep">
          <span class="mi:justify-self-start mi:py-0.5 mi:px-2.5 mi:rounded-[999px] mi:text-[12px] mi:font-bold mi:tracking-[.04em] mi:uppercase mi:bg-p-tint mi:text-p-text">Then</span>
          <div class="mi:grid mi:gap-2 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-[1fr_1fr] mi:@[560px]:items-start">
            <MiSelect v-model="action" :options="ACTIONS" aria-label="Action" />
            <MiField :error="tried && !target.trim() ? 'Who or where should this go?' : ''">
              <MiInput v-model="target" :placeholder="actionHint" :aria-label="actionHint" />
            </MiField>
          </div>
        </div>

        <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:pt-1.5">
          <MiText variant="caption" :tone="saved ? 'green' : 'label2'" aria-live="polite">{{ status }}</MiText>
          <MiButton type="submit">Save rule</MiButton>
        </footer>
      </form>

      <aside class="mi:grid mi:gap-2.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="arb-test-title">
        <MiText variant="caption" tone="label2" weight="semibold">In plain words</MiText>
        <p class="mi:mt-0 mi:mx-0 mi:mb-2 mi:py-3 mi:px-3.5 mi:border-l-3 mi:border-l-p mi:rounded-[0_var(--mi-radius-m)_var(--mi-radius-m)_0] mi:bg-fill4 mi:text-[14px] mi:leading-normal">{{ sentence }}</p>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
          <MiText id="arb-test-title" variant="subheadline" as="h3" weight="semibold">Dry run</MiText>
          <MiBadge :tone="hits ? 'success' : 'neutral'" :label="`${hits} of ${DEALS.length} recent deals`" />
        </div>
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li class="mi:grid mi:not-first:border-t mi:not-first:border-t-sep mi:grid-cols-[16px_minmax(0,_1fr)_auto] mi:items-center mi:gap-2 mi:py-2 mi:px-0 mi:text-[13px]" v-for="d in tested" :key="d.name" :class="d.hit ? 'mi:text-label mi:[&_svg]:text-green' : 'mi:text-label3'">
            <MiIcon :name="d.hit ? 'check-circle-fill' : 'minus'" :size="16" />
            <span class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ d.name }}</span>
            <span class="mi:text-[12px] mi:tabular-nums mi:text-label2">{{ d.country }} · €{{ d.amount.toLocaleString('en-US') }}</span>
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
