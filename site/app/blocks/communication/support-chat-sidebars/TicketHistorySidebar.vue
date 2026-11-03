<template>
  <section class="th" aria-labelledby="th-title">
    <div class="th__shell">
      <!-- Faux app canvas so the docked panel reads in context. -->
      <div class="th__app" aria-hidden="true">
        <span class="th__app-bar" />
        <span v-for="n in 3" :key="n" class="th__app-row" />
        <span class="th__app-tile" />
      </div>

      <aside class="th__panel" aria-labelledby="th-title">
        <header class="th__head">
          <MiIconButton v-if="openId" label="All conversations" variant="gray" size="small" @click="openId = null"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
          <div class="th__head-text">
            <MiText id="th-title" as="h2" variant="headline" weight="semibold" :lines="1">{{ ticket ? ticket.subject : 'Support' }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ ticket ? ticket.status + ' · #' + ticket.id : 'Your conversations with Ledgerly' }}</MiText>
          </div>
        </header>

        <div v-if="!ticket" class="th__list">
          <MiButton block @click="startNew">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            New conversation
          </MiButton>
          <template v-for="g in groups" :key="g.label">
            <h3 class="th__sec">{{ g.label }}</h3>
            <ul class="th__items">
              <li v-for="t in g.items" :key="t.id">
                <button type="button" class="th__item" @click="openId = t.id">
                  <span class="th__item-top">
                    <span class="th__item-subject">{{ t.subject }}</span>
                    <time>{{ t.updated }}</time>
                  </span>
                  <span class="th__item-last">{{ t.messages[t.messages.length - 1]?.text }}</span>
                  <MiRating v-if="t.rating" :model-value="t.rating" readonly size="sm" :label="'Rated ' + t.rating + ' of 5'" />
                </button>
              </li>
            </ul>
          </template>
        </div>

        <template v-else>
          <div class="th__log" role="log" :aria-label="'Conversation: ' + ticket.subject">
            <MiMessage v-for="m in ticket.messages" :key="m.id" :align="m.me ? 'end' : 'start'" :label="m.me ? 'You' : m.who" class="th__row" :class="{ 'is-end': m.me }">
              <template #avatar><MiAvatar v-if="!m.me" :name="m.who" size="xs" tone="auto" decorative /></template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'">{{ m.text }}</MiBubble>
              <template #footer>{{ m.me ? 'You' : m.who }} · {{ m.time }}</template>
            </MiMessage>

            <div v-if="ticket.status === 'Resolved'" class="th__rate">
              <MiText as="h3" variant="subheadline" weight="semibold">{{ ticket.rating ? 'Thanks for the feedback' : 'How did we do?' }}</MiText>
              <MiRating v-model="ticket.rating" size="lg" label="Rate this conversation" :readonly="ticket.rated" />
              <MiButton v-if="!ticket.rated" size="small" variant="tinted" :disabled="!ticket.rating" @click="ticket.rated = true">Send rating</MiButton>
            </div>
          </div>

          <form class="th__composer" @submit.prevent="send">
            <MiInputGroup v-model="draft" aria-label="Message support" :placeholder="ticket.status === 'Resolved' ? 'Reply to reopen' : 'Message support'">
              <template #trailing>
                <MiIconButton type="submit" label="Send" size="small" :disabled="!draft.trim()"><MiIcon name="arrow-up" :size="16" /></MiIconButton>
              </template>
            </MiInputGroup>
          </form>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Msg { id: string, who: string, text: string, time: string, me?: boolean }
interface Ticket { id: string, subject: string, status: 'Open' | 'Resolved', updated: string, rating: number, rated: boolean, messages: Msg[] }

// Sample history for the signed-in customer; swap for your helpdesk API.
const tickets = ref<Ticket[]>([
  {
    id: '8841', subject: 'Bank feed stopped syncing', status: 'Open', updated: '09:12', rating: 0, rated: false,
    messages: [
      { id: 'a1', who: 'You', me: true, time: '08:50', text: 'My Rabobank feed has not imported anything since Monday.' },
      { id: 'a2', who: 'Noa Peeters', time: '09:12', text: 'The bank renewed its consent screen. Reconnect under Settings → Banks and the backlog imports within an hour.' }
    ]
  },
  {
    id: '8790', subject: 'VAT return shows wrong period', status: 'Resolved', updated: 'Tue', rating: 0, rated: false,
    messages: [
      { id: 'b1', who: 'You', me: true, time: 'Tue 14:02', text: 'Q4 return pulls invoices from January too.' },
      { id: 'b2', who: 'Daan Smit', time: 'Tue 14:20', text: 'Your fiscal year was set to start in February. I corrected it and regenerated the Q4 draft.' },
      { id: 'b3', who: 'You', me: true, time: 'Tue 14:31', text: 'Numbers match my spreadsheet now, thank you.' }
    ]
  },
  {
    id: '8612', subject: 'Invite my accountant', status: 'Resolved', updated: 'Jan 12', rating: 5, rated: true,
    messages: [
      { id: 'c1', who: 'You', me: true, time: 'Jan 12', text: 'How do I give my accountant read access?' },
      { id: 'c2', who: 'Noa Peeters', time: 'Jan 12', text: 'Team → Invite → choose the Accountant role. They can export but not edit.' }
    ]
  }
])

const openId = ref<string | null>('8790')
const draft = ref('')
const ticket = computed(() => tickets.value.find(t => t.id === openId.value))
const groups = computed(() => [
  { label: 'Open', items: tickets.value.filter(t => t.status === 'Open') },
  { label: 'Resolved', items: tickets.value.filter(t => t.status === 'Resolved') }
].filter(g => g.items.length))

let seq = 0
function send() {
  const t = ticket.value
  const text = draft.value.trim()
  if (!t || !text) return
  t.messages.push({ id: 'n' + ++seq, who: 'You', me: true, time: 'Now', text })
  t.status = 'Open'
  t.updated = 'Now'
  draft.value = ''
}

function startNew() {
  const id = String(8900 + ++seq)
  tickets.value.unshift({ id, subject: 'New conversation', status: 'Open', updated: 'Now', rating: 0, rated: false, messages: [
    { id: id + '-w', who: 'Ledgerly', time: 'Now', text: 'Hi! Tell us what is going on and a specialist replies within 2 hours on weekdays.' }
  ] })
  openId.value = id
}
</script>

<style scoped>
.th { container-type: inline-size; height: 620px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.th__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.th__app { display: none; }
@container (min-width: 760px) {
  .th__shell { grid-template-columns: minmax(0, 1fr) 380px; }
  .th__app { display: grid; align-content: start; gap: 14px; padding: 28px; }
}
.th__app-bar { height: 28px; width: 40%; border-radius: 8px; background: var(--mi-fill3); }
.th__app-row { height: 52px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.th__app-tile { height: 180px; border-radius: var(--mi-radius-xl); background: linear-gradient(140deg, var(--mi-p-tint), var(--mi-s-tint)); }

.th__panel { display: flex; flex-direction: column; min-height: 0; background: var(--mi-card); border-left: 1px solid var(--mi-sep); }
.th__head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.th__head-text { flex: 1; min-width: 0; }

.th__list { flex: 1; min-height: 0; overflow-y: auto; padding: 16px; }
.th__sec { margin: 18px 4px 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label3); }
.th__items { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.th__item { display: grid; gap: 4px; width: 100%; padding: 12px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: var(--mi-page); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.th__item:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.th__item-top { display: flex; justify-content: space-between; gap: 8px; }
.th__item-subject { min-width: 0; font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th__item-top time { flex: none; font-size: 12px; color: var(--mi-label3); }
.th__item-last { font-size: 13px; color: var(--mi-label2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.th__log { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 12px; padding: 16px 14px; background: var(--mi-page); }
.th__row { max-width: 90%; }
.th__row.is-end { margin-inline-start: auto; }
.th__rate { display: grid; justify-items: center; gap: 10px; margin-top: 6px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); text-align: center; }
.th__composer { padding: 12px 14px 14px; border-top: 1px solid var(--mi-sep); }
</style>
