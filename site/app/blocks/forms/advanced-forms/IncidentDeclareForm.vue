<template>
  <section class="inc" aria-labelledby="inc-title" :style="{ '--inc-sev': sev.color }">
    <header class="inc__head">
      <div>
        <MiText id="inc-title" as="h2" variant="title3" weight="semibold">Declare an incident</MiText>
        <MiText variant="footnote" tone="label2">Ledgerline · Core API on-call rotation</MiText>
      </div>
      <span class="inc__sev-pill"><i aria-hidden="true" />{{ sev.short }} · {{ sev.name }}</span>
    </header>

    <!-- Success state replaces the form in place. -->
    <div v-if="declared" class="inc__done" role="status" aria-live="polite">
      <span class="inc__done-mark"><MiIcon name="check" :size="26" :weight="2.4" /></span>
      <MiText as="h3" variant="title2" weight="bold">{{ declared.id }} declared</MiText>
      <MiText variant="subheadline" tone="label2" align="center">
        {{ declared.commander }} is incident commander. {{ declared.actions }}
      </MiText>
      <div class="inc__done-actions">
        <MiButton variant="gray" @click="reset">Declare another</MiButton>
        <MiButton>Open war room</MiButton>
      </div>
    </div>

    <div v-else class="inc__grid">
      <form class="inc__form" novalidate @submit.prevent="submit">
        <MiField label="What is happening?" required :error="err('title')" hint="One line, written so a customer understands it.">
          <MiInput v-model="form.title" placeholder="Card payments failing for EU merchants" clearable />
        </MiField>

        <fieldset class="inc__set">
          <legend class="inc__legend">Severity</legend>
          <MiSegmented v-model="form.severity" label="Severity" :options="sevOptions" />
          <p class="inc__note"><i aria-hidden="true" />{{ sev.note }}</p>
        </fieldset>

        <MiField label="Affected services" required :error="err('services')">
          <MiCombobox
            v-model="form.services" :options="services" multiple clearable
            placeholder="Pick every service you have seen fail" search-placeholder="Filter services"
          />
        </MiField>

        <div class="inc__pair">
          <MiField label="Started at" required :error="err('started')">
            <MiDatePicker v-model="form.started" time :minute-step="1" date-style="medium" />
          </MiField>
          <MiField label="Incident commander" required :error="err('commander')">
            <MiSelect v-model="form.commander" :options="commanders" placeholder="Choose a commander" />
          </MiField>
        </div>

        <fieldset class="inc__set">
          <legend class="inc__legend">On declare</legend>
          <MiCheckboxGroup v-model="form.escalate" label="Escalation steps" :options="escalations" />
        </fieldset>

        <div class="inc__public">
          <div class="inc__public-row">
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

        <div class="inc__actions">
          <MiText variant="caption" tone="label2" aria-live="polite">
            {{ missing ? missing + ' required ' + (missing === 1 ? 'field' : 'fields') + ' left' : 'Ready to declare' }}
          </MiText>
          <MiButton type="submit" :loading="sending">Declare {{ sev.short }}</MiButton>
        </div>
      </form>

      <!-- Live preview of what customers will see, plus a readiness list. -->
      <aside class="inc__side" aria-label="Preview">
        <div class="inc__status" :class="{ 'is-muted': !form.isPublic }">
          <div class="inc__status-top">
            <span class="inc__brand"><i aria-hidden="true" />status.ledgerline.io</span>
            <MiText variant="caption2" tone="label3">Preview</MiText>
          </div>
          <template v-if="form.isPublic">
            <span class="inc__state">Investigating</span>
            <MiText as="h3" variant="headline" :lines="2">{{ form.title || 'Your one-line summary appears here' }}</MiText>
            <MiText variant="footnote" tone="label2" :lines="4">
              {{ form.message || 'Write the public message to see how it reads on the status page.' }}
            </MiText>
            <ul v-if="pickedServices.length" class="inc__chips" aria-label="Affected components">
              <li v-for="s in pickedServices" :key="s">{{ s }}</li>
            </ul>
            <MiText variant="caption2" tone="label3">Posted on declare · next update in 30 min</MiText>
          </template>
          <template v-else>
            <MiText as="h3" variant="headline">Internal only</MiText>
            <MiText variant="footnote" tone="label2">Nothing is posted publicly. Turn on the status page when customers notice.</MiText>
          </template>
        </div>

        <div class="inc__ready">
          <div class="inc__ready-head">
            <MiText as="h3" variant="subheadline" weight="semibold">Readiness</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ done }}/{{ checks.length }}</MiText>
          </div>
          <div class="inc__bar" role="meter" aria-label="Required fields complete" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="checks.length">
            <span :style="{ transform: `scaleX(${done / checks.length})` }" />
          </div>
          <ul class="inc__checks">
            <li v-for="c in checks" :key="c.label" :class="{ 'is-ok': c.ok }">
              <span class="inc__tick" aria-hidden="true"><MiIcon v-if="c.ok" name="check" :size="12" :weight="3" /></span>
              {{ c.label }}<span class="inc__sr">{{ c.ok ? ', done' : ', missing' }}</span>
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

<style scoped>
.inc { container: inc / inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.inc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 10px 16px; }
.inc__sev-pill {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600;
  background: color-mix(in srgb, var(--inc-sev) 14%, transparent); color: var(--mi-label);
}
.inc__sev-pill i { width: 8px; height: 8px; border-radius: 50%; background: var(--inc-sev); }

.inc__grid { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container inc (min-width: 820px) { .inc__grid { grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); } .inc__side { position: sticky; top: 12px; } }

.inc__form {
  container: incform / inline-size; position: relative; display: grid; gap: 18px; padding: 22px 20px 20px; overflow: hidden;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
/* Severity edge: the form wears the current severity on its top border. */
.inc__form::before { content: ""; position: absolute; inset: 0 0 auto; height: 3px; background: var(--inc-sev); }
.inc__set { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; min-width: 0; }
.inc__legend { padding: 0; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: var(--mi-label); }
.inc__note { display: flex; gap: 8px; align-items: baseline; margin: 0; font-size: 13px; line-height: 1.45; color: var(--mi-label2); }
.inc__note i { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--inc-sev); transform: translateY(-1px); }
.inc__pair { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); }
@container incform (min-width: 520px) { .inc__pair { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.inc__public { display: grid; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.inc__public-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.inc__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }

.inc__side { display: grid; gap: 12px; }
.inc__status {
  display: grid; gap: 8px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
  border-left: 3px solid var(--inc-sev); transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.inc__status.is-muted { border-left-color: var(--mi-sep); }
.inc__status-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
.inc__brand { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.inc__brand i { width: 10px; height: 10px; border-radius: 3px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.inc__state { justify-self: start; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label); background: color-mix(in srgb, var(--inc-sev) 18%, transparent); }
.inc__chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 2px 0; padding: 0; list-style: none; }
.inc__chips li { padding: 3px 9px; border-radius: 999px; font-size: 12px; background: var(--mi-fill3); color: var(--mi-label); }

.inc__ready { display: grid; gap: 10px; padding: 16px 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.inc__ready-head { display: flex; justify-content: space-between; align-items: baseline; }
.inc__bar { height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.inc__bar span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.inc__checks { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-label2); }
.inc__checks li { display: flex; align-items: center; gap: 10px; }
.inc__checks li.is-ok { color: var(--mi-label); }
.inc__tick { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--mi-sep); color: var(--mi-p-on); }
.is-ok .inc__tick { border-color: var(--mi-p); background: var(--mi-p); }
.inc__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.inc__done { display: grid; justify-items: center; gap: 10px; padding: 40px 20px; text-align: center; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.inc__done-mark { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; color: var(--mi-p-on); background: var(--mi-p); margin-bottom: 6px; }
.inc__done-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 8px; }
</style>
