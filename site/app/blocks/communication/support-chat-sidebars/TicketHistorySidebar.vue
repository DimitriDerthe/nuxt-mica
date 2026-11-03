<template>
  <section class="mi:@container mi:h-155 mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="th-title">
    <div class="mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_380px]">
      <!-- Faux app canvas so the docked panel reads in context. -->
      <div class="mi:hidden mi:@[760px]:grid mi:@[760px]:content-start mi:@[760px]:gap-3.5 mi:@[760px]:p-7" aria-hidden="true">
        <span class="mi:h-7 mi:w-[40%] mi:rounded-[8px] mi:[background:var(--mi-fill3)]" />
        <span v-for="n in 3" :key="n" class="mi:h-13 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" />
        <span class="mi:h-45 mi:rounded-xl mi:[background:linear-gradient(140deg,_var(--mi-p-tint),_var(--mi-s-tint))]" />
      </div>

      <aside class="mi:flex mi:flex-col mi:min-h-0 mi:[background:var(--mi-card)] mi:border-l mi:border-l-sep" aria-labelledby="th-title">
        <header class="mi:flex mi:items-center mi:gap-2.5 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
          <MiIconButton v-if="openId" label="All conversations" variant="gray" size="small" @click="openId = null"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
          <div class="mi:flex-1 mi:min-w-0">
            <MiText id="th-title" as="h2" variant="headline" weight="semibold" :lines="1">{{ ticket ? ticket.subject : 'Support' }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ ticket ? ticket.status + ' · #' + ticket.id : 'Your conversations with Ledgerly' }}</MiText>
          </div>
        </header>

        <div v-if="!ticket" class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:p-4">
          <MiButton block @click="startNew">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            New conversation
          </MiButton>
          <template v-for="g in groups" :key="g.label">
            <h3 class="mi:mt-4.5 mi:mx-1 mi:mb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label3">{{ g.label }}</h3>
            <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-1.5">
              <li v-for="t in g.items" :key="t.id">
                <button type="button" class="mi:grid mi:gap-1 mi:w-full mi:p-3 mi:border mi:border-sep mi:rounded-lg mi:[background:var(--mi-page)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="openId = t.id">
                  <span class="mi:flex mi:justify-between mi:gap-2">
                    <span class="mi:min-w-0 mi:font-semibold mi:text-[14px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ t.subject }}</span>
                    <time class="mi:flex-[none] mi:text-[12px] mi:text-label3">{{ t.updated }}</time>
                  </span>
                  <span class="mi:text-[13px] mi:text-label2 mi:[display:-webkit-box] mi:[-webkit-line-clamp:2] mi:[-webkit-box-orient:vertical] mi:overflow-hidden">{{ t.messages[t.messages.length - 1]?.text }}</span>
                  <MiRating v-if="t.rating" :model-value="t.rating" readonly size="sm" :label="'Rated ' + t.rating + ' of 5'" />
                </button>
              </li>
            </ul>
          </template>
        </div>

        <template v-else>
          <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-3 mi:py-4 mi:px-3.5 mi:[background:var(--mi-page)]" role="log" :aria-label="'Conversation: ' + ticket.subject">
            <MiMessage v-for="m in ticket.messages" :key="m.id" :align="m.me ? 'end' : 'start'" :label="m.me ? 'You' : m.who" class="mi:max-w-[90%]! " :class="m.me ? 'mi:ms-auto' : ''">
              <template #avatar><MiAvatar v-if="!m.me" :name="m.who" size="xs" tone="auto" decorative /></template>
              <MiBubble :align="m.me ? 'end' : 'start'" :variant="m.me ? 'default' : 'secondary'">{{ m.text }}</MiBubble>
              <template #footer>{{ m.me ? 'You' : m.who }} · {{ m.time }}</template>
            </MiMessage>

            <div v-if="ticket.status === 'Resolved'" class="mi:grid mi:justify-items-center mi:gap-2.5 mi:mt-1.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:text-center">
              <MiText as="h3" variant="subheadline" weight="semibold">{{ ticket.rating ? 'Thanks for the feedback' : 'How did we do?' }}</MiText>
              <MiRating v-model="ticket.rating" size="lg" label="Rate this conversation" :readonly="ticket.rated" />
              <MiButton v-if="!ticket.rated" size="small" variant="tinted" :disabled="!ticket.rating" @click="ticket.rated = true">Send rating</MiButton>
            </div>
          </div>

          <form class="mi:pt-3 mi:px-3.5 mi:pb-3.5 mi:border-t mi:border-t-sep" @submit.prevent="send">
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

