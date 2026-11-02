<template>
  <section class="dw" aria-labelledby="dw-title">
    <div class="dw__shell" :class="{ 'is-open': inChannel }">
      <nav class="dw__side" aria-labelledby="dw-title">
        <header class="dw__ws">
          <span class="dw__ws-mark" aria-hidden="true">H</span>
          <div class="dw__ws-text">
            <MiText id="dw-title" as="h2" variant="headline" weight="bold" :lines="1">Halden Studio</MiText>
            <MiText variant="caption" tone="label2">14 online</MiText>
          </div>
        </header>
        <div class="dw__side-scroll">
          <template v-for="sec in sections" :key="sec.label">
            <h3 class="dw__sec">{{ sec.label }}</h3>
            <ul class="dw__chans">
              <li v-for="c in sec.items" :key="c.id">
                <button
                  type="button" class="dw__chan" :class="{ 'is-on': c.id === activeId, 'is-unread': c.unread > 0 }"
                  :aria-current="c.id === activeId ? 'page' : undefined" @click="openChannel(c.id)"
                >
                  <MiAvatar v-if="c.dm" :name="c.name" size="xs" tone="auto" decorative />
                  <MiIcon v-else :svg="icons.hash" :size="16" class="dw__hash" />
                  <span class="dw__chan-name">{{ c.name }}</span>
                  <span v-if="c.dm && c.online" class="dw__online" aria-label="online" role="img" />
                  <MiBadge v-if="c.unread" :count="c.unread" tone="primary" variant="solid" />
                </button>
              </li>
            </ul>
          </template>
        </div>
      </nav>

      <div class="dw__main">
        <header class="dw__head">
          <MiIconButton class="dw__back" label="Back to channels" variant="gray" size="regular" @click="inChannel = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="dw__head-text">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ active.dm ? active.name : '#' + active.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ active.topic }}</MiText>
          </div>
          <button v-if="decisions.length" type="button" class="dw__dchip" @click="jumpTo(decisions[decisions.length - 1]?.id)">
            <MiIcon name="check-circle" :size="15" />
            {{ decisions.length }} {{ decisions.length === 1 ? 'decision' : 'decisions' }}
          </button>
        </header>

        <MiMessageScroller :key="activeId" ref="scroller" class="dw__log" :label="'Messages in ' + active.name">
          <MiMarker variant="separator">Today</MiMarker>
          <MiMessageScrollerItem v-for="m in active.messages" :key="m.id" :message-id="'dw-' + m.id">
            <MiMessage :align="m.me ? 'end' : 'start'" :label="m.who" class="dw__row" :class="{ 'is-end': m.me, 'is-decision': m.decision }">
              <template #avatar><MiAvatar :name="m.who" size="sm" :tone="m.me ? 'primary' : 'auto'" decorative /></template>
              <template #header><span class="dw__who">{{ m.me ? 'You' : m.who }} <time>{{ m.time }}</time></span></template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'" class="dw__bub">{{ m.text }}</MiBubble>
              <template #footer>
                <span v-if="m.decision" class="dw__flag"><MiIcon name="check-circle-fill" :size="14" />Decision</span>
                <button type="button" class="dw__mark" @click="m.decision = !m.decision">
                  {{ m.decision ? 'Unmark' : 'Mark as decision' }}
                </button>
              </template>
            </MiMessage>
          </MiMessageScrollerItem>
        </MiMessageScroller>

        <form class="dw__composer" @submit.prevent="send">
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
      <aside class="dw__log-panel" aria-labelledby="dw-dec-title">
        <MiText id="dw-dec-title" as="h3" variant="subheadline" weight="semibold">Decision log</MiText>
        <MiText variant="caption" tone="label2">Marked in #{{ active.name }}. Select one to find it in the conversation.</MiText>
        <ol v-if="decisions.length" class="dw__decs">
          <li v-for="(d, i) in decisions" :key="d.id">
            <button type="button" class="dw__dec" @click="jumpTo(d.id)">
              <span class="dw__dec-n">{{ i + 1 }}</span>
              <span class="dw__dec-body">
                <span class="dw__dec-text">{{ d.text }}</span>
                <span class="dw__dec-meta">{{ d.me ? 'You' : d.who }} · {{ d.time }}</span>
              </span>
            </button>
          </li>
        </ol>
        <p v-else class="dw__empty">No decisions yet. Hover a message and choose “Mark as decision”.</p>
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
.dw { container-type: inline-size; height: 660px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.dw__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.dw__main, .dw__log-panel { display: none; }
.dw__shell.is-open .dw__side { display: none; }
.dw__shell.is-open .dw__main { display: flex; }

@container (min-width: 720px) {
  .dw__shell { grid-template-columns: 236px minmax(0, 1fr); }
  .dw__shell .dw__side, .dw__shell.is-open .dw__side { display: flex; }
  .dw__shell .dw__main { display: flex; }
  .dw__back { display: none; }
}
@container (min-width: 1080px) {
  .dw__shell { grid-template-columns: 236px minmax(0, 1fr) 280px; }
  .dw__log-panel { display: flex; }
  .dw__head .dw__dchip { display: none; }
}

/* Sidebar */
.dw__side { display: flex; flex-direction: column; min-height: 0; background: var(--mi-card); border-right: 1px solid var(--mi-sep); }
.dw__ws { display: flex; align-items: center; gap: 10px; padding: 16px; border-bottom: 1px solid var(--mi-sep); }
.dw__ws-mark { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(140deg, var(--mi-p), var(--mi-s)); color: var(--mi-p-on); font-weight: 800; }
.dw__ws-text { min-width: 0; }
.dw__side-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 8px 16px; }
.dw__sec { margin: 14px 10px 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label3); }
.dw__chans { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; }
.dw__chan { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 40px; padding: 6px 10px; border: 0; border-radius: var(--mi-radius-m); background: transparent; color: var(--mi-label2); font: inherit; font-size: 14.5px; text-align: start; cursor: pointer; }
.dw__chan:hover { background: var(--mi-fill4); }
.dw__chan.is-on { background: var(--mi-p-tint); color: var(--mi-p-text); font-weight: 600; }
.dw__chan.is-unread { color: var(--mi-label); font-weight: 600; }
.dw__chan:focus-visible, .dw__dec:focus-visible, .dw__mark:focus-visible, .dw__dchip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.dw__hash { color: var(--mi-label3); }
.dw__chan-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dw__online { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-green); }

/* Conversation */
.dw__main { flex-direction: column; min-width: 0; min-height: 0; }
.dw__head { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.dw__head-text { flex: 1; min-width: 0; }
.dw__dchip { display: inline-flex; align-items: center; gap: 6px; flex: none; padding: 6px 10px; border: 0; border-radius: 999px; background: var(--mi-p-tint); color: var(--mi-p-text); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.dw__log { flex: 1; min-height: 0; }
.dw__row { max-width: min(88%, 40rem); }
.dw__row.is-end { margin-inline-start: auto; }
.dw .dw__bub { max-width: 100%; }
.dw__row.is-decision .dw__bub { box-shadow: 0 0 0 2px var(--mi-p-tint2); border-radius: 18px; }
.dw__who { font-weight: 600; color: var(--mi-label); }
.dw__who time { margin-left: 6px; font-weight: 400; color: var(--mi-label3); }
.dw__flag { display: inline-flex; align-items: center; gap: 4px; color: var(--mi-p-text); font-weight: 600; }
.dw__mark { padding: 2px 6px; border: 0; border-radius: 6px; background: transparent; color: var(--mi-label3); font: inherit; font-size: 12px; cursor: pointer; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.dw__mark:hover { color: var(--mi-label); background: var(--mi-fill4); }
@media (hover: hover) {
  .dw__mark { opacity: 0; }
  .dw__row:hover .dw__mark, .dw__mark:focus-visible { opacity: 1; }
}
.dw__composer { padding: 12px 16px 16px; border-top: 1px solid var(--mi-sep); background: var(--mi-card); }

/* Decision log */
.dw__log-panel { flex-direction: column; gap: 4px; min-height: 0; overflow-y: auto; padding: 18px 16px; border-left: 1px solid var(--mi-sep); background: var(--mi-card); }
.dw__decs { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 8px; }
.dw__dec { display: flex; gap: 10px; width: 100%; padding: 12px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: var(--mi-page); color: inherit; font: inherit; text-align: start; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.dw__dec:hover { transform: translateY(-1px); }
.dw__dec-n { display: grid; place-items: center; flex: none; width: 22px; height: 22px; border-radius: 50%; background: var(--mi-p); color: var(--mi-p-on); font-size: 12px; font-weight: 700; }
.dw__dec-body { display: grid; gap: 4px; min-width: 0; }
.dw__dec-text { font-size: 13.5px; line-height: 1.45; }
.dw__dec-meta { font-size: 12px; color: var(--mi-label3); }
.dw__empty { margin: 12px 0 0; font-size: 13px; line-height: 1.5; color: var(--mi-label2); }
</style>
