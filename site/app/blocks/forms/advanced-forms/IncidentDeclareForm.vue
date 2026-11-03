<template>
  <section class="mi:@container/inc mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="inc-title" :style="{ '--inc-sev': sev.color }">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-2.5 mi:gap-x-4">
      <div>
        <MiText id="inc-title" as="h2" variant="title3" weight="semibold">Declare an incident</MiText>
        <MiText variant="footnote" tone="label2">Ledgerline · Core API on-call rotation</MiText>
      </div>
      <span class="mi:inline-flex mi:items-center mi:gap-2 mi:py-1.5 mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-semibold mi:[background:color-mix(in_srgb,_var(--inc-sev)_14%,_transparent)] mi:text-label"><i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-(--inc-sev)" aria-hidden="true" />{{ sev.short }} · {{ sev.name }}</span>
    </header>

    <!-- Success state replaces the form in place. -->
    <div v-if="declared" class="mi:grid mi:justify-items-center mi:gap-2.5 mi:py-10 mi:px-5 mi:text-center mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" role="status" aria-live="polite">
      <span class="mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:rounded-[50%] mi:text-p-on mi:[background:var(--mi-p)] mi:mb-1.5"><MiIcon name="check" :size="26" :weight="2.4" /></span>
      <MiText as="h3" variant="title2" weight="bold">{{ declared.id }} declared</MiText>
      <MiText variant="subheadline" tone="label2" align="center">
        {{ declared.commander }} is incident commander. {{ declared.actions }}
      </MiText>
      <div class="mi:flex mi:flex-wrap mi:justify-center mi:gap-2.5 mi:mt-2">
        <MiButton variant="gray" @click="reset">Declare another</MiButton>
        <MiButton>Open war room</MiButton>
      </div>
    </div>

    <div v-else class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[820px]/inc:grid-cols-[minmax(0,_1.55fr)_minmax(0,_1fr)]">
      <form class="mi:@container/incform mi:relative mi:grid mi:gap-4.5 mi:pt-5.5 mi:px-5 mi:pb-5 mi:overflow-hidden mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-[3px] mi:before:[background:var(--inc-sev)]" novalidate @submit.prevent="submit">
        <MiField label="What is happening?" required :error="err('title')" hint="One line, written so a customer understands it.">
          <MiInput v-model="form.title" placeholder="Card payments failing for EU merchants" clearable />
        </MiField>

        <fieldset class="mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
          <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold mi:text-label">Severity</legend>
          <MiSegmented v-model="form.severity" label="Severity" :options="sevOptions" />
          <p class="mi:flex mi:gap-2 mi:items-baseline mi:m-0 mi:text-[13px] mi:leading-[1.45] mi:text-label2"><i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:bg-(--inc-sev) mi:flex-[none] mi:transform-[translateY(-1px)]" aria-hidden="true" />{{ sev.note }}</p>
        </fieldset>

        <MiField label="Affected services" required :error="err('services')">
          <MiCombobox
            v-model="form.services" :options="services" multiple clearable
            placeholder="Pick every service you have seen fail" search-placeholder="Filter services"
          />
        </MiField>

        <div class="mi:grid mi:gap-4.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[520px]/incform:grid-cols-2">
          <MiField label="Started at" required :error="err('started')">
            <MiDatePicker v-model="form.started" time :minute-step="1" date-style="medium" />
          </MiField>
          <MiField label="Incident commander" required :error="err('commander')">
            <MiSelect v-model="form.commander" :options="commanders" placeholder="Choose a commander" />
          </MiField>
        </div>

        <fieldset class="mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
          <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold mi:text-label">On declare</legend>
          <MiCheckboxGroup v-model="form.escalate" label="Escalation steps" :options="escalations" />
        </fieldset>

        <div class="mi:grid mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)]">
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-3.5">
            <div>
              <MiText id="inc-public-l" variant="subheadline" weight="semibold">Post to the public status page</MiText>
              <MiText variant="caption" tone="label2">Customers subscribed to these services get an email.</MiText>
            </div>
            <MiSwitch v-model="form.isPublic" aria-labelledby="inc-public-l" />
          </div>
          <MiField v-if="form.isPublic" label="Public message" required :error="err('message')">
            <MiTextarea
              v-model="form.message" :rows="3" :maxlength="280" counter
              placeholder="We are investigating failed card payments for some merchants in Europe. Next update in 30 minutes."
            />
          </MiField>
        </div>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:pt-4 mi:border-t mi:border-t-sep">
          <MiText variant="caption" tone="label2" aria-live="polite">
            {{ missing ? missing + ' required ' + (missing === 1 ? 'field' : 'fields') + ' left' : 'Ready to declare' }}
          </MiText>
          <MiButton type="submit" :loading="sending">Declare {{ sev.short }}</MiButton>
        </div>
      </form>

      <!-- Live preview of what customers will see, plus a readiness list. -->
      <aside class="mi:@[820px]/inc:sticky mi:@[820px]/inc:top-3 mi:grid mi:gap-3" aria-label="Preview">
        <div class="mi:grid mi:gap-2 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="form.isPublic ? 'mi:[border-left:3px_solid_var(--inc-sev)]' : 'mi:[border-left:3px_solid_var(--mi-sep)]'">
          <div class="mi:flex mi:justify-between mi:items-center mi:gap-2 mi:mb-1">
            <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[12px] mi:font-semibold mi:text-label2"><i class="mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:bg-[linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true" />status.ledgerline.io</span>
            <MiText variant="caption2" tone="label3">Preview</MiText>
          </div>
          <template v-if="form.isPublic">
            <span class="mi:justify-self-start mi:py-0.5 mi:px-2 mi:rounded-[6px] mi:text-[11px] mi:font-bold mi:tracking-[.04em] mi:uppercase mi:text-label mi:[background:color-mix(in_srgb,_var(--inc-sev)_18%,_transparent)]">Investigating</span>
            <MiText as="h3" variant="headline" :lines="2">{{ form.title || 'Your one-line summary appears here' }}</MiText>
            <MiText variant="footnote" tone="label2" :lines="4">
              {{ form.message || 'Write the public message to see how it reads on the status page.' }}
            </MiText>
            <ul v-if="pickedServices.length" class="mi:flex mi:flex-wrap mi:gap-1.5 mi:my-0.5 mi:mx-0 mi:p-0 mi:[list-style:none]" aria-label="Affected components">
              <li class="mi:rounded-[999px] mi:bg-fill3 mi:text-label mi:py-[3px] mi:px-[9px] mi:text-[12px]" v-for="s in pickedServices" :key="s">{{ s }}</li>
            </ul>
            <MiText variant="caption2" tone="label3">Posted on declare · next update in 30 min</MiText>
          </template>
          <template v-else>
            <MiText as="h3" variant="headline">Internal only</MiText>
            <MiText variant="footnote" tone="label2">Nothing is posted publicly. Turn on the status page when customers notice.</MiText>
          </template>
        </div>

        <div class="mi:grid mi:gap-2.5 mi:py-4 mi:px-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <div class="mi:flex mi:justify-between mi:items-baseline">
            <MiText as="h3" variant="subheadline" weight="semibold">Readiness</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ done }}/{{ checks.length }}</MiText>
          </div>
          <div class="mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Required fields complete" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="checks.length">
            <span class="mi:h-full mi:bg-p mi:block mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${done / checks.length})` }" />
          </div>
          <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px] mi:text-label2">
            <li class="mi:flex mi:items-center mi:gap-2.5 mi:group" v-for="c in checks" :key="c.label" :class="c.ok ? 'mi:text-label' : ''" :data-ok="c.ok || undefined">
              <span class="mi:grid mi:place-items-center mi:w-4.5 mi:h-4.5 mi:rounded-[50%] mi:border-[1.5px] mi:border-sep mi:text-p-on mi:group-data-[ok]:border-p mi:group-data-[ok]:bg-p" aria-hidden="true"><MiIcon v-if="c.ok" name="check" :size="12" :weight="3" /></span>
              {{ c.label }}<span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ c.ok ? ', done' : ', missing' }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

type Val = string | number

const severities = {
  sev1: { short: 'SEV1', name: 'Critical', color: 'var(--mi-red)', note: 'Core product down for most customers. Pages on-call and leadership immediately.' },
  sev2: { short: 'SEV2', name: 'Major', color: 'var(--mi-orange)', note: 'A key feature is broken for many customers. Pages on-call.' },
  sev3: { short: 'SEV3', name: 'Minor', color: 'var(--mi-yellow)', note: 'Partial degradation with a workaround. Handled in business hours.' },
  sev4: { short: 'SEV4', name: 'Low', color: 'var(--mi-label3)', note: 'Cosmetic or internal issue with no customer impact.' }
} as const
type SevKey = keyof typeof severities
const sevOptions = (Object.keys(severities) as SevKey[]).map(k => ({ value: k, label: severities[k].short }))

const services = [
  { value: 'checkout', label: 'Checkout API', group: 'Customer facing' },
  { value: 'cards', label: 'Card payments', group: 'Customer facing' },
  { value: 'payouts', label: 'Payouts', group: 'Customer facing' },
  { value: 'dashboard', label: 'Merchant dashboard', group: 'Customer facing' },
  { value: 'webhooks', label: 'Webhook delivery', group: 'Customer facing' },
  { value: 'ledger', label: 'Ledger writer', group: 'Internal' },
  { value: 'fraud', label: 'Fraud scoring', group: 'Internal' },
  { value: 'exports', label: 'Nightly exports', group: 'Internal' }
]
const commanders = [
  { value: 'priya', label: 'Priya Raman', description: 'On call until 18:00' },
  { value: 'tomas', label: 'Tomás Ibarra', description: 'Secondary' },
  { value: 'lena', label: 'Lena Hoffmann', description: 'Engineering manager' },
  { value: 'kwame', label: 'Kwame Mensah', description: 'SRE lead' }
]

const blank = () => ({
  title: '',
  severity: 'sev2' as Val | null,
  services: [] as Val | Val[] | null,
  started: null as Date | null,
  commander: 'priya' as Val | null,
  escalate: ['page', 'room'] as Val[],
  isPublic: true,
  message: ''
})
const form = reactive(blank())

const sev = computed(() => severities[(form.severity ?? 'sev2') as SevKey])
const escalations = computed(() => [
  { value: 'page', label: 'Page the on-call engineer', description: 'Required for SEV1 and SEV2', disabled: form.severity === 'sev1' || form.severity === 'sev2' },
  { value: 'room', label: 'Open #inc channel and a war room call' },
  { value: 'am', label: 'Notify account managers of top 50 merchants' }
])
// SEV1/SEV2 always page: keep the box checked while it is locked.
watch(() => form.severity, (s) => {
  if ((s === 'sev1' || s === 'sev2') && !form.escalate.includes('page')) form.escalate = ['page', ...form.escalate]
})

const pickedIds = computed<Val[]>(() => (Array.isArray(form.services) ? form.services : []))
const pickedServices = computed(() => pickedIds.value.map(v => services.find(s => s.value === v)?.label ?? String(v)))

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (form.title.trim().length < 8) e.title = form.title.trim() ? 'Add a little more detail (8 characters minimum).' : 'Describe the incident in one line.'
  if (!pickedIds.value.length) e.services = 'Pick at least one affected service.'
  if (!form.started) e.started = 'When did it start? An estimate is fine.'
  else if (form.started.getTime() > Date.now()) e.started = 'Start time cannot be in the future.'
  if (!form.commander) e.commander = 'Every incident needs a commander.'
  if (form.isPublic && form.message.trim().length < 20) e.message = 'Write at least a sentence for customers (20 characters).'
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

const checks = computed(() => [
  { label: 'Summary', ok: !errors.value.title },
  { label: 'Affected services', ok: !errors.value.services },
  { label: 'Start time', ok: !errors.value.started },
  { label: 'Commander', ok: !errors.value.commander },
  { label: 'Public message', ok: !errors.value.message }
])
const done = computed(() => checks.value.filter(c => c.ok).length)
const missing = computed(() => checks.value.length - done.value)

const sending = ref(false)
const declared = ref<{ id: string, commander: string, actions: string } | null>(null)
let nextId = 2318

function submit() {
  submitted.value = true
  if (missing.value) return
  sending.value = true
  later(() => {
    const steps = form.escalate.length
    declared.value = {
      id: `INC-${nextId++}`,
      commander: commanders.find(c => c.value === form.commander)?.label ?? 'The on-call engineer',
      actions: `${steps} escalation ${steps === 1 ? 'step' : 'steps'} started${form.isPublic ? ' and the status page is live.' : '.'}`
    }
    sending.value = false
  }, 700)
}

function reset() {
  Object.assign(form, blank())
  submitted.value = false
  declared.value = null
}
</script>
