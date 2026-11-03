<template>
  <section class="ask mi:@container/ask mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ask-title">
    <header class="ask__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="ask-title" as="h2" variant="title3" weight="semibold">New restricted key</MiText>
        <MiText variant="footnote" tone="label2">Grant only the scopes this integration needs. You can widen them later.</MiText>
      </div>
      <MiSegmented v-model="env" label="Environment" :options="envs" variant="tinted" />
    </header>

    <div v-if="created" class="ask__done mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:justify-items-start" role="status" aria-live="polite">
      <MiText as="h3" variant="headline">{{ created.name }} is ready</MiText>
      <MiText variant="footnote" tone="label2">Copy the secret now: it is shown once. {{ created.count }} scopes, expires {{ created.expires }}.</MiText>
      <div class="ask__secret mi:flex mi:flex-wrap mi:items-center mi:gap-2.5 mi:w-full mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)]">
        <code class="mi:[.ask__secret_code&]:min-w-0 mi:[.ask__secret_code&]:wrap-anywhere">{{ created.secret }}</code>
        <MiCopyButton class="mi:[.ask__secret_code&]:min-w-0 mi:[.ask__secret_code&]:wrap-anywhere" :value="created.secret" label="Copy secret" />
      </div>
      <MiButton variant="gray" @click="reset">Create another key</MiButton>
    </div>

    <form v-else class="ask__form mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" novalidate @submit.prevent="submit">
      <div class="ask__meta mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]/ask:grid-cols-[minmax(0,_1.6fr)_minmax(0,_1fr)]">
        <MiField label="Key name" required :error="err('name')" hint="Shown in logs, e.g. the service that uses it.">
          <MiInput v-model="name" placeholder="Shopify order sync" />
        </MiField>
        <MiField label="Expires" required :error="err('expires')">
          <MiSelect v-model="expires" :options="expiries" placeholder="Choose a lifetime" />
        </MiField>
      </div>

      <div class="ask__transfer mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[700px]/ask:grid-cols-[minmax(0,_1fr)_auto_minmax(0,_1fr)] mi:@[700px]/ask:items-stretch">
        <div v-for="side in sides" :key="side.id" class="ask__pane mi:grid mi:grid-rows-[auto_auto_1fr] mi:gap-2.5 mi:min-w-0 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)]" :class="'ask__pane--' + side.id">
          <div class="ask__pane-head mi:flex mi:items-baseline mi:justify-between mi:gap-2">
            <MiText :id="'ask-' + side.id + '-t'" as="h3" variant="subheadline" weight="semibold">{{ side.title }}</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ lists[side.id].length }}</MiText>
          </div>
          <MiSearch v-model="query[side.id]" size="compact" :placeholder="'Filter ' + side.title.toLowerCase()" :aria-label="'Filter ' + side.title.toLowerCase()" />
          <div class="ask__list mi:max-h-66 mi:overflow-y-auto mi:overscroll-contain mi:-mx-1 mi:px-1">
            <MiCheckboxGroup v-if="visible(side.id).length" v-model="pick[side.id]" :label="side.title">
              <MiCheckbox v-for="s in visible(side.id)" :key="s.id" :value="s.id" class="ask__row" @dblclick="move(side.id, [s.id])">
                <span class="ask__row-body mi:grid mi:gap-0.5 mi:min-w-0">
                  <span class="ask__row-top mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2">
                    <code class="ask__code mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[12.5px] mi:text-label">{{ s.id }}</code>
                    <span class="ask__lvl mi:py-px mi:px-1.5 mi:rounded-[5px] mi:text-[10.5px] mi:font-bold mi:tracking-[.04em] mi:uppercase" :class="'is-' + s.level">{{ s.level }}</span>
                  </span>
                  <span class="ask__desc mi:text-[12.5px] mi:leading-[1.4] mi:text-label2">{{ s.desc }}</span>
                </span>
              </MiCheckbox>
            </MiCheckboxGroup>
            <p v-else class="ask__empty mi:my-2 mi:mx-0.5 mi:text-[13px] mi:leading-[1.45] mi:text-label3">{{ side.id === 'granted' && !granted.length ? 'No scopes yet. Select some on the left and grant them.' : 'Nothing matches this filter.' }}</p>
          </div>
        </div>

        <div class="ask__moves mi:@[700px]/ask:order-2 mi:@[700px]/ask:flex-col mi:flex mi:flex-wrap mi:gap-2" role="group" aria-label="Move scopes">
          <MiButton variant="tinted" size="small" :disabled="!pick.avail.length" @click="move('avail', pick.avail)">
            Grant<template #trailing><MiIcon name="arrow-right" :size="14" class="ask__arrow" /></template>
          </MiButton>
          <MiButton variant="gray" size="small" :disabled="!pick.granted.length" @click="move('granted', pick.granted)">
            <template #leading><MiIcon name="arrow-left" :size="14" class="ask__arrow" /></template>Revoke
          </MiButton>
          <MiButton variant="plain" size="small" @click="grantReads">All read</MiButton>
        </div>
      </div>
      <MiText v-if="err('scopes')" variant="footnote" tone="red" role="alert">{{ err('scopes') }}</MiText>

      <!-- Risk readout: what this key can do, in plain words. -->
      <div class="ask__risk mi:grid mi:gap-2 mi:py-3.5 mi:px-4 mi:rounded-lg" :style="{ '--ask-risk': risk.color }">
        <div class="ask__risk-top mi:flex mi:items-baseline mi:justify-between mi:gap-2">
          <MiText as="h3" variant="subheadline" weight="semibold">Blast radius: {{ risk.label }}</MiText>
          <MiText variant="caption" tone="label2" tabular>{{ score }} / {{ maxScore }}</MiText>
        </div>
        <div class="ask__meter mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Key risk" :aria-valuenow="score" aria-valuemin="0" :aria-valuemax="maxScore" :aria-valuetext="risk.label">
          <span class="mi:[.ask__meter_&]:block mi:[.ask__meter_&]:h-full mi:[.ask__meter_&]:origin-left mi:[.ask__meter_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${Math.max(score / maxScore, 0.02)})` }" />
        </div>
        <MiText variant="footnote" tone="label2">{{ sentence }}</MiText>
        <MiCheckbox
          v-if="needsAck" v-model="ack" class="ask__ack"
          :label="`I understand this ${env === 'live' ? 'live ' : ''}key can manage the team and other keys`"
        />
        <MiText v-if="err('ack')" variant="caption" tone="red" role="alert">{{ err('ack') }}</MiText>
      </div>

      <div class="ask__actions mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2.5">
        <MiButton variant="gray" @click="reset">Cancel</MiButton>
        <MiButton type="submit" :loading="saving">Create {{ env === 'live' ? 'live' : 'test' }} key</MiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

type Val = string | number
type Side = 'avail' | 'granted'
type Level = 'read' | 'write' | 'admin'

const scopes: { id: string, level: Level, desc: string, verb: string }[] = [
  { id: 'payments:read', level: 'read', desc: 'View payments, refunds and balances', verb: 'read payments' },
  { id: 'payments:write', level: 'write', desc: 'Create charges and issue refunds', verb: 'charge and refund' },
  { id: 'customers:read', level: 'read', desc: 'View customer profiles and saved cards', verb: 'read customers' },
  { id: 'customers:write', level: 'write', desc: 'Create, update and delete customers', verb: 'edit customers' },
  { id: 'payouts:read', level: 'read', desc: 'View scheduled and past payouts', verb: 'read payouts' },
  { id: 'payouts:write', level: 'write', desc: 'Trigger instant payouts to bank accounts', verb: 'send payouts' },
  { id: 'reports:read', level: 'read', desc: 'Download settlement and tax reports', verb: 'read reports' },
  { id: 'disputes:write', level: 'write', desc: 'Submit evidence and accept disputes', verb: 'answer disputes' },
  { id: 'webhooks:write', level: 'write', desc: 'Add and rotate webhook endpoints', verb: 'change webhooks' },
  { id: 'team:admin', level: 'admin', desc: 'Invite and remove team members', verb: 'manage the team' },
  { id: 'keys:admin', level: 'admin', desc: 'Create and revoke other API keys', verb: 'manage keys' }
]
const weight: Record<Level, number> = { read: 1, write: 3, admin: 6 }
const maxScore = scopes.reduce((n, s) => n + weight[s.level], 0)

const envs = [{ value: 'test', label: 'Test' }, { value: 'live', label: 'Live' }]
const expiries = [
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days', description: 'Recommended' },
  { value: 365, label: '1 year' },
  { value: 0, label: 'Never', description: 'Not allowed for live keys with write access' }
]
const sides: { id: Side, title: string }[] = [{ id: 'avail', title: 'Available scopes' }, { id: 'granted', title: 'Granted to key' }]

const env = ref<Val | null>('test')
const name = ref('')
const expires = ref<Val | null>(90)
const granted = ref<string[]>(['payments:read', 'customers:read'])
const pick = reactive<Record<Side, Val[]>>({ avail: [], granted: [] })
const query = reactive<Record<Side, string>>({ avail: '', granted: '' })
const ack = ref(false)

const lists = computed<Record<Side, typeof scopes>>(() => ({
  avail: scopes.filter(s => !granted.value.includes(s.id)),
  granted: scopes.filter(s => granted.value.includes(s.id))
}))
const visible = (side: Side) => {
  const q = query[side].trim().toLowerCase()
  return q ? lists.value[side].filter(s => (s.id + ' ' + s.desc).toLowerCase().includes(q)) : lists.value[side]
}

function move(from: Side, ids: Val[]) {
  const set = new Set(ids.map(String))
  granted.value = from === 'avail'
    ? scopes.filter(s => granted.value.includes(s.id) || set.has(s.id)).map(s => s.id)
    : granted.value.filter(id => !set.has(id))
  pick[from] = []
}
const grantReads = () => move('avail', scopes.filter(s => s.level === 'read').map(s => s.id))

const grantedScopes = computed(() => lists.value.granted)
const score = computed(() => grantedScopes.value.reduce((n, s) => n + weight[s.level], 0))
const needsAck = computed(() => grantedScopes.value.some(s => s.level === 'admin'))
const risk = computed(() => {
  if (needsAck.value || score.value >= 12) return { label: 'High', color: 'var(--mi-red)' }
  if (grantedScopes.value.some(s => s.level === 'write')) return { label: 'Moderate', color: 'var(--mi-orange)' }
  return { label: 'Low', color: 'var(--mi-green)' }
})
const sentence = computed(() => {
  if (!grantedScopes.value.length) return 'This key cannot do anything yet.'
  const verbs = grantedScopes.value.map(s => s.verb)
  const list = verbs.length > 1 ? verbs.slice(0, -1).join(', ') + ' and ' + verbs[verbs.length - 1] : verbs[0]
  const money = grantedScopes.value.some(s => s.id === 'payments:write' || s.id === 'payouts:write')
  return `Whoever holds it can ${list}.${money ? ' It can move money.' : ''}`
})

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!name.value.trim()) e.name = 'Name the key so you can find it in logs.'
  if (expires.value === null) e.expires = 'Pick how long the key lives.'
  else if (expires.value === 0 && env.value === 'live' && risk.value.label !== 'Low') e.expires = 'Live keys with write access must expire.'
  if (!granted.value.length) e.scopes = 'Grant at least one scope.'
  if (needsAck.value && !ack.value) e.ack = 'Confirm before creating a key with admin scopes.'
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

const saving = ref(false)
const created = ref<{ name: string, secret: string, count: number, expires: string } | null>(null)

function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  saving.value = true
  later(() => {
    const tail = Math.random().toString(36).slice(2, 14)
    created.value = {
      name: name.value.trim(),
      secret: `rk_${env.value}_51Lg${tail}`,
      count: granted.value.length,
      expires: expiries.find(x => x.value === expires.value)?.label.replace('Never', 'never') ?? ''
    }
    if (created.value.expires !== 'never') created.value.expires = 'in ' + created.value.expires
    saving.value = false
  }, 600)
}

function reset() {
  name.value = ''
  expires.value = 90
  granted.value = ['payments:read', 'customers:read']
  pick.avail = []
  pick.granted = []
  ack.value = false
  submitted.value = false
  created.value = null
}
</script>

<style scoped>
@container ask (min-width: 700px) {
  .ask__pane--granted { order: 3; }
  .ask__moves { justify-content: center; }
}
.ask__pane--granted { background: color-mix(in srgb, var(--mi-p) 7%, var(--mi-fill4)); }
.ask__row { padding: 8px 6px; border-radius: 10px; }
.ask__row + .ask__row { border-top: 1px solid var(--mi-sep); }
.ask__lvl.is-read { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.ask__lvl.is-write { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 16%, transparent); }
.ask__lvl.is-admin { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.ask__moves { justify-content: center; }
.ask__arrow { transform: rotate(90deg); }
@container ask (min-width: 700px) { .ask__arrow { transform: none; } }

.ask__risk { border: 1px solid var(--mi-sep); border-left: 3px solid var(--ask-risk); }
.ask__meter span { border-radius: inherit; background: var(--ask-risk); }
.ask__ack { margin-top: 4px; }
.ask__secret code { flex: 1 1 200px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
</style>
