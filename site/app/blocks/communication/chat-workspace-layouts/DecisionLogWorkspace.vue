<template>
  <section class="dw mi:@container mi:h-165 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="dw-title">
    <div class="dw__shell mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[720px]:grid-cols-[236px_minmax(0,_1fr)] mi:@[1080px]:grid-cols-[236px_minmax(0,_1fr)_280px]" :class="{ 'is-open': inChannel }">
      <nav class="dw__side mi:[.dw__shell.is-open_&]:hidden mi:@[720px]:[.dw__shell_&]:flex mi:@[720px]:[.dw__shell.is-open_&]:flex mi:flex mi:flex-col mi:min-h-0 mi:[background:var(--mi-card)] mi:border-r mi:border-r-sep" aria-labelledby="dw-title">
        <header class="dw__ws mi:flex mi:items-center mi:gap-2.5 mi:p-4 mi:border-b mi:border-b-sep">
          <span class="dw__ws-mark mi:grid mi:place-items-center mi:flex-[none] mi:w-8.5 mi:h-8.5 mi:rounded-[10px] mi:[background:linear-gradient(140deg,_var(--mi-p),_var(--mi-s))] mi:text-p-on mi:font-extrabold" aria-hidden="true">H</span>
          <div class="dw__ws-text mi:min-w-0">
            <MiText id="dw-title" as="h2" variant="headline" weight="bold" :lines="1">Halden Studio</MiText>
            <MiText variant="caption" tone="label2">14 online</MiText>
          </div>
        </header>
        <div class="dw__side-scroll mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-2 mi:px-2 mi:pb-4">
          <template v-for="sec in sections" :key="sec.label">
            <h3 class="dw__sec mi:mt-3.5 mi:mx-2.5 mi:mb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label3">{{ sec.label }}</h3>
            <ul class="dw__chans mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-px">
              <li v-for="c in sec.items" :key="c.id">
                <button
                  type="button" class="dw__chan mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-10 mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-md mi:[background:transparent] mi:text-label2 mi:text-start mi:cursor-pointer mi:[&.is-on]:text-p-text mi:[&.is-unread]:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-on': c.id === activeId, 'is-unread': c.unread > 0 }"
                  :aria-current="c.id === activeId ? 'page' : undefined" @click="openChannel(c.id)"
                >
                  <MiAvatar v-if="c.dm" :name="c.name" size="xs" tone="auto" decorative />
                  <MiIcon v-else :svg="icons.hash" :size="16" class="dw__hash mi:text-label3" />
                  <span class="dw__chan-name mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ c.name }}</span>
                  <span v-if="c.dm && c.online" class="dw__online mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-green)]" aria-label="online" role="img" />
                  <MiBadge v-if="c.unread" :count="c.unread" tone="primary" variant="solid" />
                </button>
              </li>
            </ul>
          </template>
        </div>
      </nav>

      <div class="dw__main mi:hidden mi:[.dw__shell.is-open_&]:flex mi:@[720px]:[.dw__shell_&]:flex mi:flex-col mi:min-w-0 mi:min-h-0">
        <header class="dw__head mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-4 mi:border-b mi:border-b-sep mi:[background:var(--mi-card)]">
          <MiIconButton class="dw__back" label="Back to channels" variant="gray" size="regular" @click="inChannel = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="dw__head-text mi:flex-1 mi:min-w-0">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ active.dm ? active.name : '#' + active.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ active.topic }}</MiText>
          </div>
          <button v-if="decisions.length" type="button" class="dw__dchip mi:@[1080px]:[.dw__head_&]:hidden mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:inline-flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-p-tint)] mi:text-p-text mi:cursor-pointer" @click="jumpTo(decisions[decisions.length - 1]?.id)">
            <MiIcon name="check-circle" :size="15" />
            {{ decisions.length }} {{ decisions.length === 1 ? 'decision' : 'decisions' }}
          </button>
        </header>

        <MiMessageScroller :key="activeId" ref="scroller" class="dw__log" :label="'Messages in ' + active.name">
          <MiMarker variant="separator">Today</MiMarker>
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'dw-' + m.id">
            <MiMessage :align="m.me ? 'end' : 'start'" :label="m.who" class="dw__row mi:[&.is-end]:ms-auto" :class="{ 'is-end': m.me, 'is-decision': m.decision }">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.me ? 'primary' : 'auto'" decorative /></template>
              <template #header><span class="dw__who mi:font-semibold mi:text-label">{{ m.me ? 'You' : m.who }} <time class="mi:[.dw__who_&]:ml-1.5 mi:[.dw__who_&]:font-normal mi:[.dw__who_&]:text-label3">{{ m.time }}</time></span></template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="dw__bub mi:[.dw__row.is-decision_&]:shadow-[0_0_0_2px_var(--mi-p-tint2)]">{{ m.text }}</MiBubble>
              <template #footer>
                <span v-if="m.decision" class="dw__flag mi:inline-flex mi:items-center mi:gap-1 mi:text-p-text mi:font-semibold"><MiIcon name="check-circle-fill" :size="14" />Decision</span>
                <button type="button" class="dw__mark mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:py-0.5 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:[background:transparent] mi:text-label3 mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:text-label mi:hover:[background:var(--mi-fill4)] mi:can-hover:opacity-0 mi:can-hover:[.dw__row:hover_&]:opacity-100 mi:can-hover:focus-visible:opacity-100" @click="m.decision = !m.decision">
                  {{ m.decision ? 'Unmark' : 'Mark as decision' }}
                </button>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="dw__composer mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:[background:var(--mi-card)]" @submit.prevent="send">
          <MiInputGroup v-model="draft" :aria-label="'Message ' + active.name" :placeholder="'Message ' + (active.dm ? active.name.split(' ')[0] : '#' + active.name)">
            <template #trailing>
              <MiIconButton type="submit" label="Send message" size="small" :disabled="!draft.trim()">
                <MiIcon :svg="icons.send" :size="16" />
              </MiIconButton>
            </template>
          </MiInputGroup>
        </form>
      </div>

      <!-- Decision log: anything marked in the conversation is collected here, newest last. -->
      <aside class="dw__log-panel mi:hidden mi:@[1080px]:flex mi:flex-col mi:gap-1 mi:min-h-0 mi:overflow-y-auto mi:py-4.5 mi:px-4 mi:border-l mi:border-l-sep mi:[background:var(--mi-card)]" aria-labelledby="dw-dec-title">
        <MiText id="dw-dec-title" as="h3" variant="subheadline" weight="semibold">Decision log</MiText>
        <MiText variant="caption" tone="label2">Marked in #{{ active.name }}. Select one to find it in the conversation.</MiText>
        <ol v-if="decisions.length" class="dw__decs mi:[list-style:none] mi:mt-3 mi:mx-0 mi:mb-0 mi:p-0 mi:grid mi:gap-2">
          <li v-for="(d, i) in decisions" :key="d.id">
            <button type="button" class="dw__dec mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:flex mi:gap-2.5 mi:w-full mi:p-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-page)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)]" @click="jumpTo(d.id)">
              <span class="dw__dec-n mi:grid mi:place-items-center mi:flex-[none] mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:[background:var(--mi-p)] mi:text-p-on mi:text-[12px] mi:font-bold">{{ i + 1 }}</span>
              <span class="dw__dec-body mi:grid mi:gap-1 mi:min-w-0">
                <span class="dw__dec-text mi:text-[13.5px] mi:leading-[1.45]">{{ d.text }}</span>
                <span class="dw__dec-meta mi:text-[12px] mi:text-label3">{{ d.me ? 'You' : d.who }} · {{ d.time }}</span>
              </span>
            </button>
          </li>
        </ol>
        <p v-else class="dw__empty mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[13px] mi:leading-normal mi:text-label2">No decisions yet. Hover a message and choose “Mark as decision”.</p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Msg { id: string, who: string, time: string, text: string, me?: boolean, decision?: boolean }
interface Channel { id: string, name: string, topic: string, dm?: boolean, online?: boolean, unread: number, messages: Msg[] }

const icons = {
  hash: '<path d="M9.5 4 8 20M16 4l-1.5 16M4.5 9h15M4 15h15"/>',
  send: '<path d="M5 12h13M13 6l6 6-6 6"/>'
}

// Sample workspace; swap for your realtime API.
const channels = ref<Channel[]>([
  {
    id: 'launch', name: 'launch-week', topic: 'Spring collection goes live Thursday 10:00 CET', unread: 0,
    messages: [
      { id: 'l1', who: 'Amara Diallo', time: '09:02', text: 'Inventory sync finished overnight. 412 SKUs live in staging, 9 still missing photos.' },
      { id: 'l2', who: 'Tomás Ruiz', time: '09:06', text: 'The 9 are all from the linen line. Studio can reshoot tomorrow morning.' },
      { id: 'l3', who: 'Léa Fontaine', time: '09:11', me: true, text: 'Then we launch with 403 and add linen on Friday. Not worth slipping the date.', decision: true },
      { id: 'l4', who: 'Amara Diallo', time: '09:14', text: 'Agreed. I will hide the linen category until the photos land.' },
      { id: 'l5', who: 'Yuki Tanaka', time: '09:20', text: 'Newsletter goes out at 10:15, fifteen minutes after launch, so the links resolve.' },
      { id: 'l6', who: 'Tomás Ruiz', time: '09:23', text: 'Free shipping threshold stays at 80 € for launch week, back to 100 € on Monday.', decision: true }
    ]
  },
  {
    id: 'crit', name: 'design-crit', topic: 'Async critique, Tuesdays and Thursdays', unread: 3,
    messages: [
      { id: 'c1', who: 'Yuki Tanaka', time: '08:40', text: 'Posted the new product page. The size guide is now a sheet instead of a modal.' },
      { id: 'c2', who: 'Noah Becker', time: '08:52', text: 'Love the sheet. The sticky add-to-bag covers the last review on small phones though.' },
      { id: 'c3', who: 'Yuki Tanaka', time: '08:58', text: 'Good catch, I will add bottom padding equal to the bar height.' }
    ]
  },
  {
    id: 'esc', name: 'support-escalations', topic: 'Anything a customer has waited 24h+ for', unread: 1,
    messages: [
      { id: 'e1', who: 'Priya Raman', time: '07:55', text: 'Order #48213 shows delivered but the customer has nothing. Carrier photo is of the wrong door.' },
      { id: 'e2', who: 'Priya Raman', time: '07:56', text: 'Refund or reship? It is a 240 € coat.' }
    ]
  },
  {
    id: 'amara', name: 'Amara Diallo', topic: 'Ops lead · Lisbon', dm: true, online: true, unread: 0,
    messages: [
      { id: 'a1', who: 'Amara Diallo', time: '08:15', text: 'Can you review the courier contract before noon? Two clauses changed since March.' }
    ]
  },
  {
    id: 'tomas', name: 'Tomás Ruiz', topic: 'Merchandising · Madrid', dm: true, unread: 0,
    messages: [
      { id: 't1', who: 'Tomás Ruiz', time: 'Yesterday', text: 'Sent you the linen shot list. Twelve looks, about two hours of studio time.' }
    ]
  }
])

const sections = computed(() => [
  { label: 'Channels', items: channels.value.filter(c => !c.dm) },
  { label: 'Direct messages', items: channels.value.filter(c => c.dm) }
])

const activeId = ref('launch')
const inChannel = ref(false)
const draft = ref('')
const scroller = ref<{ scrollToMessage: (id: string, o?: { behavior?: ScrollBehavior }) => boolean } | null>(null)

const active = computed(() => channels.value.find(c => c.id === activeId.value) ?? channels.value[0]!)
const decisions = computed(() => active.value.messages.filter(m => m.decision))

function openChannel(id: string) {
  activeId.value = id
  inChannel.value = true
  const c = channels.value.find(x => x.id === id)
  if (c) c.unread = 0
}

function jumpTo(id?: string) {
  if (id) scroller.value?.scrollToMessage('dw-' + id, { behavior: 'smooth' })
}

let seq = 0
function send() {
  const text = draft.value.trim()
  if (!text) return
  active.value.messages.push({ id: 'n' + ++seq, who: 'Léa Fontaine', time: 'Now', me: true, text })
  draft.value = ''
}
</script>

<style scoped>
@container (min-width: 720px) {
  .dw__back { display: none; }
}
.dw__chan { font: inherit; font-size: 14.5px; }
.dw__chan:hover { background: var(--mi-fill4); }
.dw__chan.is-on { background: var(--mi-p-tint); font-weight: 600; }
.dw__chan.is-unread { font-weight: 600; }
.dw__dchip { font: inherit; font-size: 12.5px; font-weight: 600; }
.dw__log { flex: 1; min-height: 0; }
.dw__row { max-width: min(88%, 40rem); }
.dw .dw__bub { max-width: 100%; }
.dw__row.is-decision .dw__bub { border-radius: 18px; }
.dw__mark { font: inherit; font-size: 12px; }
</style>
