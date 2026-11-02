<template>
  <div ref="root" class="tw">
    <!-- Wide: three resizable panels. Narrow: the same panels as a slide stack (queue → thread → customer). -->
    <component :is="narrow ? PanelStack : Resizable" v-model="sizes" class="tw__frame" :min-sizes="[22, 32, 18]" with-handle handle-label="Resize panel">
      <template #panel-0>
        <section class="tw__pane tw__queue" :class="paneClass(0)" aria-labelledby="tw-queue-title">
          <header class="tw__pane-head">
            <div class="tw__queue-top">
              <MiText id="tw-queue-title" variant="headline" as="h2">Queue</MiText>
              <MiText variant="caption" tone="label2" tabular>{{ openCount }} open · {{ breached }} breached</MiText>
            </div>
            <MiSegmented v-model="filter" label="Ticket status" :options="[{ value: 'open', label: 'Open' }, { value: 'solved', label: 'Solved' }]" />
          </header>
          <ul class="tw__tickets">
            <li v-for="t in shown" :key="t.id">
              <button type="button" class="tw__ticket" :class="{ 'is-active': t.id === activeId }" :aria-current="t.id === activeId ? 'true' : undefined" @click="openTicket(t.id)">
                <span class="tw__prio" :class="'is-' + t.priority" :aria-label="t.priority + ' priority'" />
                <span class="tw__ticket-body">
                  <span class="tw__ticket-top">
                    <span class="tw__ticket-who">{{ t.customer.name }}</span>
                    <span class="tw__sla" :class="{ 'is-late': t.sla.startsWith('Breached') }">{{ t.status === 'solved' ? 'Solved' : t.sla }}</span>
                  </span>
                  <span class="tw__ticket-subject">{{ t.subject }}</span>
                  <span class="tw__ticket-snippet">{{ t.messages[t.messages.length - 1]?.text }}</span>
                </span>
                <span v-if="t.unread" class="tw__unread" aria-label="Unread" />
              </button>
            </li>
          </ul>
          <MiText v-if="!shown.length" variant="footnote" tone="label2" class="tw__empty">Nothing solved yet today.</MiText>
        </section>
      </template>

      <template #panel-1>
        <section class="tw__pane tw__thread" :class="paneClass(1)" aria-labelledby="tw-thread-title">
          <header class="tw__pane-head tw__thread-head">
            <MiIconButton v-if="narrow" label="Back to queue" variant="gray" size="small" @click="pane = 0"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
            <div class="tw__thread-title">
              <MiText variant="caption" tone="label2" tabular>#{{ ticket.id }} · {{ ticket.channel }}</MiText>
              <MiText id="tw-thread-title" variant="headline" as="h3" :lines="1">{{ ticket.subject }}</MiText>
            </div>
            <MiButton v-if="narrow" variant="gray" size="small" @click="pane = 2">Customer</MiButton>
            <MiButton :variant="ticket.status === 'solved' ? 'gray' : 'tinted'" size="small" @click="toggleSolved">
              {{ ticket.status === 'solved' ? 'Reopen' : 'Mark solved' }}
            </MiButton>
          </header>
          <div class="tw__messages" aria-live="polite">
            <div v-for="(m, i) in ticket.messages" :key="i" class="tw__msg" :class="{ 'is-agent': m.agent }">
              <MiText variant="caption2" tone="label2">{{ m.agent ? 'Sofia · Kilnworks' : ticket.customer.name }} · {{ m.time }}</MiText>
              <MiBubble :variant="m.agent ? 'default' : 'muted'" :align="m.agent ? 'end' : 'start'">{{ m.text }}</MiBubble>
            </div>
          </div>
          <form class="tw__reply" @submit.prevent="send">
            <MiTextarea v-model="draft" :rows="2" :max-rows="5" size="sm" aria-label="Reply to customer" :placeholder="'Reply to ' + ticket.customer.name.split(' ')[0] + '…'" />
            <div class="tw__reply-bar">
              <div class="tw__macros">
                <MiButton v-for="mac in macros" :key="mac.label" variant="gray" size="mini" @click="draft = mac.text">{{ mac.label }}</MiButton>
              </div>
              <MiButton type="submit" size="small" :disabled="!draft.trim()">Send</MiButton>
            </div>
          </form>
        </section>
      </template>

      <template #panel-2>
        <aside class="tw__pane tw__ctx" :class="paneClass(2)" aria-labelledby="tw-ctx-title">
          <header class="tw__pane-head">
            <MiIconButton v-if="narrow" label="Back to conversation" variant="gray" size="small" @click="pane = 1"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
            <MiText id="tw-ctx-title" variant="headline" as="h3">Customer</MiText>
          </header>
          <div class="tw__ctx-body">
            <div class="tw__who">
              <MiAvatar :name="ticket.customer.name" size="md" tone="auto" decorative />
              <div>
                <MiText variant="subheadline" weight="semibold">{{ ticket.customer.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ ticket.customer.place }} · since {{ ticket.customer.since }}</MiText>
              </div>
            </div>
            <div class="tw__facts">
              <div><MiText variant="caption2" tone="label2">Orders</MiText><p>{{ ticket.customer.orders }}</p></div>
              <div><MiText variant="caption2" tone="label2">Spent</MiText><p>{{ ticket.customer.spent }}</p></div>
              <div><MiText variant="caption2" tone="label2">CSAT</MiText><p>{{ ticket.customer.csat }}</p></div>
            </div>
            <div class="tw__tags"><MiBadge v-for="tag in ticket.customer.tags" :key="tag" :label="tag" variant="outline" tone="neutral" /></div>
            <section class="tw__order" aria-label="Latest order">
              <MiText variant="caption2" tone="label2" weight="semibold" class="tw__eyebrow">Latest order</MiText>
              <MiText variant="subheadline" weight="medium">{{ ticket.customer.order.item }}</MiText>
              <MiText variant="caption" tone="label2">{{ ticket.customer.order.meta }}</MiText>
              <MiSteps :model-value="ticket.customer.order.step" :steps="orderSteps" orientation="horizontal" :clickable="false" aria-label="Order progress" class="tw__steps" />
            </section>
          </div>
        </aside>
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, resolveComponent } from 'vue'

const Resizable = resolveComponent('MiResizable')
/** Narrow-screen stand-in for MiResizable: renders the same three panel slots inside one sliding stack. */
const PanelStack = defineComponent({
  name: 'TriagePanelStack',
  // Same props as MiResizable so the shared bindings do not leak onto the element.
  props: { modelValue: Array, minSizes: Array, withHandle: Boolean, handleLabel: String },
  emits: ['update:modelValue'],
  setup(_, { slots }) {
    return () => h('div', { class: 'tw__stack' }, [0, 1, 2].map(i => slots[`panel-${i}`]?.()))
  }
})

const root = ref<HTMLElement>()
const narrow = ref(false)
const sizes = ref([28, 44, 28])
const pane = ref(0)
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([e]) => { if (e) narrow.value = e.contentRect.width < 760 })
  if (root.value) ro.observe(root.value)
})
onBeforeUnmount(() => ro?.disconnect())

const paneClass = (i: number) => (i === pane.value ? 'is-shown' : i < pane.value ? 'is-before' : 'is-after')

interface Msg { agent?: boolean, time: string, text: string }
interface Ticket {
  id: number, subject: string, channel: string, priority: 'urgent' | 'high' | 'normal' | 'low', sla: string, unread: boolean, status: 'open' | 'solved'
  customer: { name: string, place: string, since: string, orders: number, spent: string, csat: string, tags: string[], order: { item: string, meta: string, step: number } }
  messages: Msg[]
}

const tickets = reactive<Ticket[]>([
  {
    id: 4812, subject: 'Studio payout missing for May', channel: 'Seller email', priority: 'urgent', sla: 'Breached 12 min', unread: true, status: 'open',
    customer: { name: 'Terra Fina Studio', place: 'Porto', since: '2023', orders: 412, spent: '€38.2k sold', csat: '4.9', tags: ['Seller', 'Top 50'], order: { item: 'May payout · €4,180', meta: 'Batch PO-0531 · held by bank check', step: 1 } },
    messages: [
      { time: '08:02', text: 'Our May payout still has not arrived and the dashboard says "processing" since the 3rd. We pay our glaze supplier on Friday.' },
      { time: '08:40', text: 'Following up. Is there anything we need to send you?' }
    ]
  },
  {
    id: 4821, subject: 'Glaze crazing on a mug set', channel: 'Email', priority: 'high', sla: '18 min left', unread: true, status: 'open',
    customer: { name: 'Maren Holt', place: 'Bergen', since: '2022', orders: 9, spent: '€612', csat: '4.6', tags: ['Repeat buyer'], order: { item: 'Fjord mug set of 4 · celadon', meta: 'KW-77120 · delivered 6 days ago', step: 3 } },
    messages: [
      { time: '09:12', text: 'Two of the four mugs show fine cracks in the glaze after the first wash. Photos attached. Is this normal for celadon?' }
    ]
  },
  {
    id: 4819, subject: 'Parcel stuck in Rotterdam', channel: 'Chat', priority: 'normal', sla: '2 h left', unread: false, status: 'open',
    customer: { name: 'Joaquín Ibarra', place: 'Bilbao', since: '2024', orders: 3, spent: '€289', csat: '5.0', tags: ['Gift order'], order: { item: 'Speckled serving platter', meta: 'KW-77002 · in transit 9 days', step: 2 } },
    messages: [
      { time: 'Yesterday', text: 'Tracking has said "at hub, Rotterdam" for five days. It is a birthday gift for Saturday.' },
      { agent: true, time: 'Yesterday', text: 'I have opened a trace with the carrier and asked them to prioritise it. I will update you by noon tomorrow.' }
    ]
  },
  {
    id: 4801, subject: 'Broken lid on arrival', channel: 'Email', priority: 'high', sla: '3 h left', unread: false, status: 'open',
    customer: { name: 'Noor Haddad', place: 'Lyon', since: '2021', orders: 17, spent: '€1,940', csat: '4.8', tags: ['VIP', 'Collector'], order: { item: 'Lidded jar, ash glaze', meta: 'KW-76988 · delivered 2 days ago', step: 3 } },
    messages: [{ time: '07:55', text: 'The lid arrived in three pieces. The jar itself is fine. Could the studio make a replacement lid only?' }]
  },
  {
    id: 4809, subject: 'Can I gift-wrap a pre-order?', channel: 'Chat', priority: 'low', sla: '1 day left', unread: false, status: 'solved',
    customer: { name: 'Femi Adeyemi', place: 'London', since: '2025', orders: 1, spent: '€74', csat: '—', tags: ['New'], order: { item: 'Pre-order: moon jar, small', meta: 'Ships in March', step: 0 } },
    messages: [
      { time: 'Mon', text: 'Is gift wrapping available on pre-orders, and can I add a note?' },
      { agent: true, time: 'Mon', text: 'Yes to both. I have added wrapping and your note to the order at no charge.' }
    ]
  }
])

const filter = ref<string | number | null>('open')
const activeId = ref(4821)
const draft = ref('')
const orderSteps = [{ label: 'Paid' }, { label: 'Fired' }, { label: 'Shipped' }, { label: 'Delivered' }]
const macros = [
  { label: 'Ask for photos', text: 'Could you send a photo of the damage and of the packaging? It helps the studio prevent it next time.' },
  { label: 'Offer refund', text: 'I am sorry about this. I have issued a full refund; you will see it in 3 to 5 working days.' }
]

const shown = computed(() => tickets.filter(t => t.status === filter.value))
const openCount = computed(() => tickets.filter(t => t.status === 'open').length)
const breached = computed(() => tickets.filter(t => t.status === 'open' && t.sla.startsWith('Breached')).length)
const ticket = computed(() => tickets.find(t => t.id === activeId.value) ?? tickets[0]!)

function openTicket(id: number) {
  activeId.value = id
  const t = tickets.find(x => x.id === id)
  if (t) t.unread = false
  pane.value = 1
}
function send() {
  const text = draft.value.trim()
  if (!text) return
  ticket.value.messages.push({ agent: true, time: 'Now', text })
  draft.value = ''
}
function toggleSolved() {
  ticket.value.status = ticket.value.status === 'solved' ? 'open' : 'solved'
}
</script>

<style scoped>
.tw { container-type: inline-size; height: 640px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); }
.tw .tw__frame { height: 100%; border-radius: 0; box-shadow: none; }
.tw__pane { display: flex; flex-direction: column; height: 100%; min-width: 0; box-sizing: border-box; background: var(--mi-card); }
.tw__pane-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }

/* Narrow stack: panes slide over one another with transform only. */
.tw__stack { position: relative; height: 100%; overflow: hidden; }
.tw__stack > .tw__pane { position: absolute; inset: 0; transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3); }
.tw__stack > .is-shown { transform: none; opacity: 1; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-3) var(--mi-ease); z-index: 1; }
.tw__stack > .is-before { transform: translateX(-24%); opacity: 0; visibility: hidden; }
.tw__stack > .is-after { transform: translateX(100%); visibility: hidden; }

/* Queue */
.tw__queue { background: var(--mi-side); }
.tw__queue .tw__pane-head { flex-wrap: wrap; justify-content: space-between; }
.tw__queue-top { display: grid; }
.tw__tickets { flex: 1; min-height: 0; overflow-y: auto; margin: 0; padding: 8px; list-style: none; display: grid; align-content: start; gap: 4px; }
.tw__ticket { position: relative; display: flex; gap: 10px; width: 100%; padding: 10px 20px 10px 10px; border: 0; border-radius: var(--mi-radius-m); background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.tw__ticket:hover { background: var(--mi-fill4); }
.tw__ticket.is-active { background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tw__ticket:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.tw__prio { flex: none; width: 4px; align-self: stretch; border-radius: 2px; background: var(--mi-fill); }
.tw__prio.is-urgent { background: var(--mi-red); }
.tw__prio.is-high { background: var(--mi-orange); }
.tw__prio.is-normal { background: var(--mi-p); }
.tw__ticket-body { display: grid; gap: 2px; flex: 1; min-width: 0; }
.tw__ticket-top { display: flex; justify-content: space-between; gap: 8px; }
.tw__ticket-who { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw__sla { flex: none; font-size: 11px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.tw__sla.is-late { color: var(--mi-red-t); }
.tw__ticket-subject { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw__ticket-snippet { font-size: 12px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw__unread { position: absolute; bottom: 12px; right: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--mi-p); }
.tw__empty { padding: 16px; }

/* Thread */
.tw__thread-head { flex-wrap: wrap; }
.tw__thread-title { display: grid; flex: 1 1 160px; min-width: 0; }
.tw__messages { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 14px; padding: 18px 16px; }
.tw__msg { display: grid; justify-items: start; gap: 4px; max-width: 86%; }
.tw__msg.is-agent { justify-self: end; justify-items: end; }
.tw__reply { display: grid; gap: 8px; padding: 12px 16px 14px; border-top: 1px solid var(--mi-sep); }
.tw__reply-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tw__macros { display: flex; gap: 6px; min-width: 0; overflow-x: auto; scrollbar-width: none; }

/* Customer context */
.tw__ctx-body { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 16px; padding: 16px; }
.tw__who { display: flex; align-items: center; gap: 12px; }
.tw__facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.tw__facts > div { display: grid; gap: 2px; padding: 10px 12px; min-width: 0; }
.tw__facts > div + div { border-left: 1px solid var(--mi-sep); }
.tw__facts p { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tw__order { display: grid; gap: 4px; padding: 14px; border-radius: var(--mi-radius-m); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.tw__eyebrow { letter-spacing: .06em; text-transform: uppercase; }
.tw__steps { margin-top: 10px; }
</style>
