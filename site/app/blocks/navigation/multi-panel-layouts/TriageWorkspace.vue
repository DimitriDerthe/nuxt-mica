<template>
  <div ref="root" class="mi:@container mi:h-160 mi:font-mi mi:text-label mi:[background:var(--mi-card)]">
    <!-- Wide: three resizable panels. Narrow: the same panels as a slide stack (queue → thread → customer). -->
    <component :is="narrow ? PanelStack : Resizable" v-model="sizes" class="mi:h-full! mi:rounded-none! mi:shadow-none!" :min-sizes="[22, 32, 18]" with-handle handle-label="Resize panel">
      <template #panel-0>
        <section class="mi:flex mi:flex-col mi:h-full mi:min-w-0 mi:box-border mi:[background:var(--mi-side)]" :class="paneClass(0)" aria-labelledby="tw-queue-title">
          <header class="mi:flex mi:items-center mi:gap-2.5 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep mi:flex-wrap mi:justify-between">
            <div class="mi:grid">
              <MiText id="tw-queue-title" variant="headline" as="h2">Queue</MiText>
              <MiText variant="caption" tone="label2" tabular>{{ openCount }} open · {{ breached }} breached</MiText>
            </div>
            <MiSegmented v-model="filter" label="Ticket status" :options="[{ value: 'open', label: 'Open' }, { value: 'solved', label: 'Solved' }]" />
          </header>
          <ul class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:m-0 mi:p-2 mi:[list-style:none] mi:grid mi:content-start mi:gap-1">
            <li v-for="t in shown" :key="t.id">
              <button type="button" class="mi:relative mi:flex mi:gap-2.5 mi:w-full mi:pt-2.5 mi:pr-5 mi:pb-2.5 mi:pl-2.5 mi:[border:0] mi:rounded-md mi:text-inherit mi:[font:inherit] mi:text-left mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="t.id === activeId ? 'mi:bg-card mi:shadow-1' : 'mi:[background:none] mi:hover:bg-fill4'" :aria-current="t.id === activeId ? 'true' : undefined" @click="openTicket(t.id)">
                <span class="mi:flex-[none] mi:w-1 mi:self-stretch mi:rounded-[2px]" :class="t.priority === 'urgent' ? 'mi:bg-red' : t.priority === 'high' ? 'mi:bg-orange' : t.priority === 'normal' ? 'mi:bg-p' : 'mi:[background:var(--mi-fill)]'" :aria-label="t.priority + ' priority'" />
                <span class="mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
                  <span class="mi:flex mi:justify-between mi:gap-2">
                    <span class="mi:text-[13px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ t.customer.name }}</span>
                    <span class="mi:flex-[none] mi:text-[11px] mi:font-semibold mi:tabular-nums" :class="t.sla.slice(0, 8) === 'Breached' ? 'mi:text-red-t' : 'mi:text-label2'">{{ t.status === 'solved' ? 'Solved' : t.sla }}</span>
                  </span>
                  <span class="mi:text-[13px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ t.subject }}</span>
                  <span class="mi:text-[12px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ t.messages[t.messages.length - 1]?.text }}</span>
                </span>
                <span v-if="t.unread" class="mi:absolute mi:bottom-3 mi:right-2 mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--mi-p)]" aria-label="Unread" />
              </button>
            </li>
          </ul>
          <MiText v-if="!shown.length" variant="footnote" tone="label2" class="mi:p-4">Nothing solved yet today.</MiText>
        </section>
      </template>

      <template #panel-1>
        <section class="mi:flex mi:flex-col mi:h-full mi:min-w-0 mi:box-border mi:[background:var(--mi-card)]" :class="paneClass(1)" aria-labelledby="tw-thread-title">
          <header class="mi:flex mi:items-center mi:gap-2.5 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep mi:flex-wrap">
            <MiIconButton v-if="narrow" label="Back to queue" variant="gray" size="small" @click="pane = 0"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
            <div class="mi:grid mi:flex-[1_1_160px] mi:min-w-0">
              <MiText variant="caption" tone="label2" tabular>#{{ ticket.id }} · {{ ticket.channel }}</MiText>
              <MiText id="tw-thread-title" variant="headline" as="h3" :lines="1">{{ ticket.subject }}</MiText>
            </div>
            <MiButton v-if="narrow" variant="gray" size="small" @click="pane = 2">Customer</MiButton>
            <MiButton :variant="ticket.status === 'solved' ? 'gray' : 'tinted'" size="small" @click="toggleSolved">
              {{ ticket.status === 'solved' ? 'Reopen' : 'Mark solved' }}
            </MiButton>
          </header>
          <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-3.5 mi:py-4.5 mi:px-4" aria-live="polite">
            <div v-for="(m, i) in ticket.messages" :key="i" class="mi:grid mi:gap-1 mi:max-w-[86%]" :class="m.agent ? 'mi:justify-self-end mi:justify-items-end' : 'mi:justify-items-start'">
              <MiText variant="caption2" tone="label2">{{ m.agent ? 'Sofia · Kilnworks' : ticket.customer.name }} · {{ m.time }}</MiText>
              <MiBubble :variant="m.agent ? 'default' : 'muted'" :align="m.agent ? 'end' : 'start'">{{ m.text }}</MiBubble>
            </div>
          </div>
          <form class="mi:grid mi:gap-2 mi:pt-3 mi:px-4 mi:pb-3.5 mi:border-t mi:border-t-sep" @submit.prevent="send">
            <MiTextarea v-model="draft" :rows="2" :max-rows="5" size="sm" aria-label="Reply to customer" :placeholder="'Reply to ' + ticket.customer.name.split(' ')[0] + '…'" />
            <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
              <div class="mi:flex mi:gap-1.5 mi:min-w-0 mi:overflow-x-auto mi:[scrollbar-width:none]">
                <MiButton v-for="mac in macros" :key="mac.label" variant="gray" size="mini" @click="draft = mac.text">{{ mac.label }}</MiButton>
              </div>
              <MiButton type="submit" size="small" :disabled="!draft.trim()">Send</MiButton>
            </div>
          </form>
        </section>
      </template>

      <template #panel-2>
        <aside class="mi:flex mi:flex-col mi:h-full mi:min-w-0 mi:box-border mi:[background:var(--mi-card)]" :class="paneClass(2)" aria-labelledby="tw-ctx-title">
          <header class="mi:flex mi:items-center mi:gap-2.5 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
            <MiIconButton v-if="narrow" label="Back to conversation" variant="gray" size="small" @click="pane = 1"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
            <MiText id="tw-ctx-title" variant="headline" as="h3">Customer</MiText>
          </header>
          <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-4 mi:p-4">
            <div class="mi:flex mi:items-center mi:gap-3">
              <MiAvatar :name="ticket.customer.name" size="md" tone="auto" decorative />
              <div>
                <MiText variant="subheadline" weight="semibold">{{ ticket.customer.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ ticket.customer.place }} · since {{ ticket.customer.since }}</MiText>
              </div>
            </div>
            <div class="mi:grid mi:grid-cols-3 mi:rounded-md mi:[background:var(--mi-fill4)]">
              <div class="mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3 mi:min-w-0"><MiText class="mi:text-[16px]! mi:font-bold! mi:tracking-[-.02em]! mi:tabular-nums mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis" variant="caption2" tone="label2">Orders</MiText><p class="mi:m-0 mi:text-[16px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ ticket.customer.orders }}</p></div>
              <div class="mi:border-l mi:border-l-sep mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3 mi:min-w-0"><MiText class="mi:text-[16px]! mi:font-bold! mi:tracking-[-.02em]! mi:tabular-nums mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis" variant="caption2" tone="label2">Spent</MiText><p class="mi:m-0 mi:text-[16px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ ticket.customer.spent }}</p></div>
              <div class="mi:border-l mi:border-l-sep mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3 mi:min-w-0"><MiText class="mi:text-[16px]! mi:font-bold! mi:tracking-[-.02em]! mi:tabular-nums mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis" variant="caption2" tone="label2">CSAT</MiText><p class="mi:m-0 mi:text-[16px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis">{{ ticket.customer.csat }}</p></div>
            </div>
            <div class="mi:flex mi:flex-wrap mi:gap-1.5"><MiBadge v-for="tag in ticket.customer.tags" :key="tag" :label="tag" variant="outline" tone="neutral" /></div>
            <section class="mi:grid mi:gap-1 mi:p-3.5 mi:rounded-md mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" aria-label="Latest order">
              <MiText variant="caption2" tone="label2" weight="semibold" class="mi:tracking-[.06em]! mi:uppercase">Latest order</MiText>
              <MiText variant="subheadline" weight="medium">{{ ticket.customer.order.item }}</MiText>
              <MiText variant="caption" tone="label2">{{ ticket.customer.order.meta }}</MiText>
              <MiSteps :model-value="ticket.customer.order.step" :steps="orderSteps" orientation="horizontal" :clickable="false" aria-label="Order progress" class="mi:mt-2.5!" />
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
    return () => h('div', { class: 'mi:relative mi:h-full mi:overflow-hidden' }, [0, 1, 2].map(i => slots[`panel-${i}`]?.()))
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

const paneClass = (i: number) => !narrow.value
  ? ''
  : i === pane.value
    ? 'mi:absolute mi:inset-0 mi:transform-none mi:opacity-100 mi:visible mi:z-1 mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_opacity_var(--mi-dur-3)_var(--mi-ease)]'
    : i < pane.value
      ? 'mi:absolute mi:inset-0 mi:transform-[translateX(-24%)] mi:opacity-0 mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_opacity_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)]'
      : 'mi:absolute mi:inset-0 mi:transform-[translateX(100%)] mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_opacity_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)]'

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

