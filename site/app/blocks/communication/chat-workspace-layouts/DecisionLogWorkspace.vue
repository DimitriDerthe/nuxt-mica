<template>
  <section class="mi:@container mi:h-165 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="dw-title">
    <div class="mi:group mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[720px]:grid-cols-[236px_minmax(0,_1fr)] mi:@[1080px]:grid-cols-[236px_minmax(0,_1fr)_280px]" :data-open="inChannel || undefined">
      <nav class="mi:group-data-[open]:hidden mi:@[720px]:flex mi:@[720px]:group-data-[open]:flex mi:flex mi:flex-col mi:min-h-0 mi:[background:var(--mi-card)] mi:border-r mi:border-r-sep" aria-labelledby="dw-title">
        <header class="mi:flex mi:items-center mi:gap-2.5 mi:p-4 mi:border-b mi:border-b-sep">
          <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-8.5 mi:h-8.5 mi:rounded-[10px] mi:[background:linear-gradient(140deg,_var(--mi-p),_var(--mi-s))] mi:text-p-on mi:font-extrabold" aria-hidden="true">H</span>
          <div class="mi:min-w-0">
            <MiText id="dw-title" as="h2" variant="headline" weight="bold" :lines="1">Halden Studio</MiText>
            <MiText variant="caption" tone="label2">14 online</MiText>
          </div>
        </header>
        <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-2 mi:px-2 mi:pb-4">
          <template v-for="sec in sections" :key="sec.label">
            <h3 class="mi:mt-3.5 mi:mx-2.5 mi:mb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label3">{{ sec.label }}</h3>
            <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-px">
              <li v-for="c in sec.items" :key="c.id">
                <button
                  type="button" class="mi:[font:inherit] mi:text-[14.5px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-10 mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-md mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="c.id === activeId ? 'mi:bg-p-tint mi:text-p-text mi:font-semibold' : c.unread > 0 ? 'mi:bg-transparent mi:hover:bg-fill4 mi:text-label mi:font-semibold' : 'mi:bg-transparent mi:hover:bg-fill4 mi:text-label2'"
                  :aria-current="c.id === activeId ? 'page' : undefined" @click="openChannel(c.id)"
                >
                  <MiAvatar v-if="c.dm" :name="c.name" size="xs" tone="auto" decorative />
                  <MiIcon v-else :svg="icons.hash" :size="16" class="mi:text-label3" />
                  <span class="mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ c.name }}</span>
                  <span v-if="c.dm && c.online" class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:[background:var(--mi-green)]" aria-label="online" role="img" />
                  <MiBadge v-if="c.unread" :count="c.unread" tone="primary" variant="solid" />
                </button>
              </li>
            </ul>
          </template>
        </div>
      </nav>

      <div class="mi:hidden mi:group-data-[open]:flex mi:@[720px]:flex mi:flex-col mi:min-w-0 mi:min-h-0">
        <header class="mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-4 mi:border-b mi:border-b-sep mi:[background:var(--mi-card)]">
          <MiIconButton class="mi:@[720px]:hidden!" label="Back to channels" variant="gray" size="regular" @click="inChannel = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="mi:flex-1 mi:min-w-0">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ active.dm ? active.name : '#' + active.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ active.topic }}</MiText>
          </div>
          <button v-if="decisions.length" type="button" class="mi:[font:inherit] mi:text-[12.5px] mi:font-semibold mi:@[1080px]:hidden mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:inline-flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-p-tint)] mi:text-p-text mi:cursor-pointer" @click="jumpTo(decisions[decisions.length - 1]?.id)">
            <MiIcon name="check-circle" :size="15" />
            {{ decisions.length }} {{ decisions.length === 1 ? 'decision' : 'decisions' }}
          </button>
        </header>

        <MiMessageScroller :key="activeId" ref="scroller" class="mi:flex-1 mi:min-h-0" :label="'Messages in ' + active.name">
          <MiMarker variant="separator">Today</MiMarker>
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'dw-' + m.id">
            <MiMessage :align="m.me ? 'end' : 'start'" :label="m.who" class="mi:group/row mi:max-w-[min(88%,_40rem)]!" :class="m.me ? 'mi:ms-auto' : ''">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.me ? 'primary' : 'auto'" decorative /></template>
              <template #header><span class="mi:font-semibold mi:text-label">{{ m.me ? 'You' : m.who }} <time class="mi:ml-1.5 mi:font-normal mi:text-label3">{{ m.time }}</time></span></template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="mi:max-w-full!" :class="m.decision ? 'mi:rounded-[18px]! mi:shadow-[0_0_0_2px_var(--mi-p-tint2)]' : ''">{{ m.text }}</MiBubble>
              <template #footer>
                <span v-if="m.decision" class="mi:inline-flex mi:items-center mi:gap-1 mi:text-p-text mi:font-semibold"><MiIcon name="check-circle-fill" :size="14" />Decision</span>
                <button type="button" class="mi:[font:inherit] mi:text-[12px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:py-0.5 mi:px-1.5 mi:[border:0] mi:rounded-[6px] mi:[background:transparent] mi:text-label3 mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:text-label mi:hover:[background:var(--mi-fill4)] mi:can-hover:opacity-0 mi:can-hover:group-hover/row:opacity-100 mi:can-hover:focus-visible:opacity-100" @click="m.decision = !m.decision">
                  {{ m.decision ? 'Unmark' : 'Mark as decision' }}
                </button>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:[background:var(--mi-card)]" @submit.prevent="send">
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
      <aside class="mi:hidden mi:@[1080px]:flex mi:flex-col mi:gap-1 mi:min-h-0 mi:overflow-y-auto mi:py-4.5 mi:px-4 mi:border-l mi:border-l-sep mi:[background:var(--mi-card)]" aria-labelledby="dw-dec-title">
        <MiText id="dw-dec-title" as="h3" variant="subheadline" weight="semibold">Decision log</MiText>
        <MiText variant="caption" tone="label2">Marked in #{{ active.name }}. Select one to find it in the conversation.</MiText>
        <ol v-if="decisions.length" class="mi:[list-style:none] mi:mt-3 mi:mx-0 mi:mb-0 mi:p-0 mi:grid mi:gap-2">
          <li v-for="(d, i) in decisions" :key="d.id">
            <button type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:flex mi:gap-2.5 mi:w-full mi:p-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-page)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)]" @click="jumpTo(d.id)">
              <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:[background:var(--mi-p)] mi:text-p-on mi:text-[12px] mi:font-bold">{{ i + 1 }}</span>
              <span class="mi:grid mi:gap-1 mi:min-w-0">
                <span class="mi:text-[13.5px] mi:leading-[1.45]">{{ d.text }}</span>
                <span class="mi:text-[12px] mi:text-label3">{{ d.me ? 'You' : d.who }} · {{ d.time }}</span>
              </span>
            </button>
          </li>
        </ol>
        <p v-else class="mi:mt-3 mi:mx-0 mi:mb-0 mi:text-[13px] mi:leading-normal mi:text-label2">No decisions yet. Hover a message and choose “Mark as decision”.</p>
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
