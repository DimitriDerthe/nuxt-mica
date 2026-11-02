<template>
  <section class="tdd" aria-labelledby="tdd-title">
    <!-- Faux inbox the drawer slides over; picking a row opens it. -->
    <div class="tdd__page" :inert="open || undefined">
      <div class="tdd__page-head">
        <MiText id="tdd-title" variant="title3" as="h2" weight="semibold">Support inbox</MiText>
        <MiText variant="footnote" tone="label2">{{ tickets.filter(t => t.status !== 'Solved').length }} open</MiText>
      </div>
      <ul class="tdd__list">
        <li v-for="t in tickets" :key="t.id">
          <button type="button" class="tdd__row" :class="{ 'is-on': t.id === currentId }" @click="show(t.id)">
            <MiAvatar :name="t.customer" size="sm" tone="auto" decorative />
            <span class="tdd__row-text">
              <b>{{ t.subject }}</b>
              <span>{{ t.customer }} · #{{ t.id }}</span>
            </span>
            <span class="tdd__row-sla" :class="'is-' + slaTone(t)">{{ t.status === 'Solved' ? 'Solved' : t.slaMin + 'm' }}</span>
          </button>
        </li>
      </ul>
    </div>

    <div class="tdd__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="tdd__drawer" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline swipe-direction="right" :title="'#' + cur.id + ' · ' + cur.subject" :description="'Opened ' + cur.opened + ' via ' + cur.channel">
        <div class="tdd__body">
          <div class="tdd__tools">
            <MiText variant="caption" tone="label2" tabular>Ticket {{ index + 1 }} of {{ tickets.length }}</MiText>
            <MiIconButton label="Previous ticket" variant="gray" size="small" :disabled="index === 0" @click="step(-1)"><MiIcon name="chevron-up" :size="14" /></MiIconButton>
            <MiIconButton label="Next ticket" variant="gray" size="small" :disabled="index === tickets.length - 1" @click="step(1)"><MiIcon name="chevron-down" :size="14" /></MiIconButton>
            <MiIconButton label="Close details" variant="gray" size="small" @click="open = false"><MiIcon name="close" :size="14" /></MiIconButton>
          </div>

          <!-- Who: the customer card answers "how much does this one matter" at a glance. -->
          <div class="tdd__who">
            <MiAvatar :name="cur.customer" size="md" tone="auto" />
            <div class="tdd__who-text">
              <MiText variant="headline">{{ cur.customer }}</MiText>
              <MiText variant="footnote" tone="label2">{{ cur.company }} · {{ cur.plan }} · {{ cur.city }}</MiText>
            </div>
            <MiBadge v-if="cur.vip" tone="secondary" label="Key account" />
          </div>

          <MiMeter
            v-if="cur.status !== 'Solved'" :value="Math.max(0, 120 - cur.slaMin)" :max="120" size="sm"
            :label="cur.slaMin <= 30 ? 'First reply due soon' : 'First reply'" :caption="cur.slaMin + ' min left'" hint="SLA 2 h"
            :color="slaTone(cur) === 'red' ? 'var(--mi-red)' : slaTone(cur) === 'orange' ? 'var(--mi-orange)' : 'var(--mi-green)'"
          />

          <div class="tdd__fields">
            <MiField label="Status"><MiNativeSelect v-model="cur.status" size="sm" :options="STATUSES" /></MiField>
            <MiField label="Assignee"><MiNativeSelect v-model="cur.assignee" size="sm" :options="AGENTS" /></MiField>
          </div>
          <div class="tdd__prio">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Priority</MiText>
            <MiSegmented v-model="cur.priority" label="Priority" :options="['Low', 'Normal', 'High'].map(p => ({ value: p, label: p }))" />
          </div>

          <MiText variant="footnote" weight="semibold" as="h3">Conversation</MiText>
          <MiTimeline :items="cur.events" aria-label="Ticket history" />
        </div>

        <template #footer>
          <MiTextarea v-model="reply" :rows="2" :max-rows="5" aria-label="Reply" :placeholder="'Reply to ' + cur.customer.split(' ')[0] + '…'" />
          <div class="tdd__send">
            <MiButton variant="gray" size="small" :disabled="!reply.trim()" @click="send(false)">Send</MiButton>
            <MiButton size="small" :disabled="!reply.trim()" @click="send(true)">Send and solve</MiButton>
          </div>
        </template>
      </MiDrawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
interface Ev { title: string, description?: string, time?: string, icon?: 'chat' | 'person' | 'check' | 'bell', tone?: Tone }
interface Ticket {
  id: number, subject: string, customer: string, company: string, plan: string, city: string, vip: boolean
  opened: string, channel: string, slaMin: number, status: string | number | null, assignee: string | number | null, priority: string | number | null, events: Ev[]
}

const STATUSES = ['Open', 'Pending', 'On hold', 'Solved'].map(s => ({ value: s, label: s }))
const AGENTS = ['Unassigned', 'Rosa Lindqvist', 'Omar Haddad', 'Mina Park'].map(s => ({ value: s, label: s }))

const tickets = ref<Ticket[]>([
  {
    id: 8812, subject: 'Refund not received after 10 days', customer: 'Dana Whitfield', company: 'Bramble & Co', plan: 'Business', city: 'Leeds', vip: true,
    opened: '2 h ago', channel: 'email', slaMin: 18, status: 'Open', assignee: 'Rosa Lindqvist', priority: 'High',
    events: [
      { title: 'Dana wrote', description: 'We cancelled the extra seats on the 21st and were told the refund would land in 5 days. Nothing yet.', time: '09:12', icon: 'chat' },
      { title: 'Auto-tagged billing, refund', time: '09:12', icon: 'bell', tone: 'info' },
      { title: 'Assigned to Rosa', time: '09:40', icon: 'person' }
    ]
  },
  {
    id: 8809, subject: 'SSO login loops back to the sign-in page', customer: 'Kwame Asante', company: 'Lumen Health', plan: 'Enterprise', city: 'Accra', vip: true,
    opened: '3 h ago', channel: 'chat', slaMin: 52, status: 'Pending', assignee: 'Omar Haddad', priority: 'High',
    events: [
      { title: 'Kwame wrote', description: 'Since this morning our Okta users get sent back to the login page.', time: '08:05', icon: 'chat' },
      { title: 'Omar asked for a HAR file', time: '08:31', icon: 'chat', tone: 'primary' }
    ]
  },
  {
    id: 8801, subject: 'How do I export invoices as CSV?', customer: 'Léa Fontaine', company: 'Atelier Fontaine', plan: 'Team', city: 'Lyon', vip: false,
    opened: '5 h ago', channel: 'email', slaMin: 96, status: 'Open', assignee: 'Unassigned', priority: 'Low',
    events: [{ title: 'Léa wrote', description: 'Our accountant needs last quarter in a spreadsheet.', time: '06:48', icon: 'chat' }]
  },
  {
    id: 8794, subject: 'Webhook signature mismatch', customer: 'Tariq Nasser', company: 'Parcelly', plan: 'Business', city: 'Dubai', vip: false,
    opened: 'yesterday', channel: 'API form', slaMin: 0, status: 'Solved', assignee: 'Mina Park', priority: 'Normal',
    events: [
      { title: 'Tariq wrote', time: 'Mon', icon: 'chat' },
      { title: 'Solved by Mina', description: 'The secret had a trailing newline.', time: 'Mon', icon: 'check', tone: 'success' }
    ]
  }
])

const open = ref(true)
const currentId = ref(8812)
const cur = computed(() => tickets.value.find(t => t.id === currentId.value) ?? tickets.value[0]!)
const reply = ref('')

const index = computed(() => tickets.value.findIndex(t => t.id === currentId.value))
const step = (d: number) => { const t = tickets.value[index.value + d]; if (t) show(t.id) }
const slaTone = (t: Ticket) => (t.status === 'Solved' ? 'done' : t.slaMin <= 30 ? 'red' : t.slaMin <= 60 ? 'orange' : 'green')
function show(id: number) {
  currentId.value = id
  reply.value = ''
  open.value = true
}
function send(solve: boolean) {
  const t = cur.value
  t.events.push({ title: 'You replied', description: reply.value.trim(), time: 'now', icon: 'chat', tone: 'primary' })
  if (solve) {
    t.status = 'Solved'
    t.events.push({ title: 'Marked solved', time: 'now', icon: 'check', tone: 'success' })
  }
  else if (t.status === 'Open') t.status = 'Pending'
  reply.value = ''
}
</script>

<style scoped>
.tdd { container-type: inline-size; position: relative; display: grid; min-height: 640px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.tdd__page, .tdd__scrim, .tdd__drawer { grid-area: 1 / 1; }
.tdd__page { display: grid; align-content: start; gap: 14px; padding: 20px; }
.tdd__page-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.tdd__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.tdd__list li + li { border-top: 1px solid var(--mi-sep); }
.tdd__row { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border: 0; background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.tdd__row:hover, .tdd__row.is-on { background: var(--mi-fill4); }
.tdd__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.tdd__row-text { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.tdd__row-text b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tdd__row-text span { font-size: 12px; color: var(--mi-label2); }
.tdd__row-sla { flex: none; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; background: var(--mi-fill4); color: var(--mi-label2); }
.tdd__row-sla.is-red { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }
.tdd__row-sla.is-orange { background: color-mix(in srgb, var(--mi-orange) 14%, transparent); color: var(--mi-orange-t); }
.tdd__row-sla.is-green { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }

.tdd__scrim { background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.tdd__scrim.is-on { opacity: 1; pointer-events: auto; }
.tdd__drawer { justify-self: end; align-self: stretch; width: min(420px, calc(100% - 24px)); padding: 10px; transition: transform var(--mi-dur-4) var(--mi-spring); }
.tdd__drawer.is-closed { transform: translateX(105%); }

.tdd__body { position: relative; display: grid; gap: 16px; }
.tdd__tools { display: flex; align-items: center; gap: 6px; padding-bottom: 12px; border-bottom: 1px solid var(--mi-sep); }
.tdd__tools > :first-child { flex: 1; }
.tdd__who { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.tdd__who-text { display: grid; flex: 1; min-width: 0; }
.tdd__fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.tdd__prio { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.tdd__send { display: flex; justify-content: flex-end; gap: 8px; }
</style>
