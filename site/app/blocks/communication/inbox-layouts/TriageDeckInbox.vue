<template>
  <section class="td mi:@container mi:relative mi:min-h-150 mi:font-mi mi:text-label mi:bg-page" aria-labelledby="td-title">
    <div class="td__shell mi:grid mi:gap-5 mi:py-5 mi:px-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[820px]:p-7 mi:@[820px]:gap-7">
      <div class="td__main mi:grid mi:content-start mi:gap-3.5 mi:min-w-0">
        <header class="td__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div>
            <MiText id="td-title" as="h2" variant="title3" weight="semibold">Morning triage</MiText>
            <MiText variant="footnote" tone="label2">{{ done }} of {{ mails.length }} sorted · one decision per email</MiText>
          </div>
          <MiButton variant="gray" size="small" :disabled="!history.length" @click="undo">
            <template #leading><MiIcon name="arrow-left" :size="14" /></template>
            Undo
          </MiButton>
        </header>
        <div class="td__bar mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden" role="progressbar" aria-label="Triage progress" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="mails.length">
          <span class="mi:[.td__bar_&]:block mi:[.td__bar_&]:h-full mi:[.td__bar_&]:bg-p mi:[.td__bar_&]:origin-left mi:[.td__bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${done / mails.length})` }" />
        </div>

        <Transition name="td-card" mode="out-in">
          <article
            v-if="current" :key="current.id" class="td__card mi:grid mi:gap-3 mi:min-h-65 mi:content-start mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px]" tabindex="0"
            :aria-label="'Email from ' + current.from + ': ' + current.subject" @keydown="onKey"
          >
            <header class="td__from mi:flex mi:items-center mi:gap-3">
              <MiAvatar :name="current.from" size="md" tone="auto" decorative />
              <div class="td__from-text mi:flex-1 mi:min-w-0">
                <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ current.from }}</MiText>
                <MiText variant="caption" tone="label2" :lines="1">{{ current.address }} · {{ current.time }}</MiText>
              </div>
              <MiBadge v-if="current.vip" tone="warning" label="Important" />
            </header>
            <MiText variant="title3" weight="semibold" as="p" class="td__subject">{{ current.subject }}</MiText>
            <p v-for="(p, i) in current.body" :key="i" class="td__p mi:m-0 mi:text-[15px] mi:leading-[1.6] mi:text-label2">{{ p }}</p>
          </article>
          <MiEmptyState
            v-else key="empty" icon="inbox" title="Inbox sorted" card
            :description="`${counts.archive} archived, ${counts.later} for later, ${counts.reply} to reply.`"
            secondary-label="Start over" @secondary="reset"
          />
        </Transition>

        <div v-if="current" class="td__acts mi:grid mi:grid-cols-3 mi:gap-2" role="group" aria-label="Decide">
          <button v-for="a in actions" :key="a.id" type="button" class="td__act mi:flex mi:flex-col mi:items-center mi:gap-1.5 mi:py-3 mi:px-2 mi:border mi:border-sep mi:rounded-lg mi:bg-card mi:text-label mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:active:transform-[scale(.97)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:[&.is-archive]:text-label2 mi:[&.is-later]:text-orange-t mi:[&.is-reply]:text-p-text mi:@[520px]:flex-row mi:@[520px]:justify-center" :class="'is-' + a.id" @click="decide(a.id)">
            <MiIcon :name="a.icon" :size="18" />
            <span>{{ a.label }}</span>
            <MiKbd>{{ a.key }}</MiKbd>
          </button>
        </div>
      </div>

      <aside class="td__side mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:content-start mi:gap-2.5" aria-labelledby="td-next-title">
        <MiText id="td-next-title" as="h3" variant="subheadline" weight="semibold">Up next</MiText>
        <ol class="td__queue mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-1.5">
          <li v-for="m in upcoming" :key="m.id" class="td__q mi:flex mi:items-center mi:gap-2.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-card">
            <MiAvatar :name="m.from" size="xs" tone="auto" decorative />
            <span class="td__q-text mi:min-w-0 mi:text-[13px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap"><strong>{{ m.from }}</strong> {{ m.subject }}</span>
          </li>
        </ol>
        <p v-if="!upcoming.length" class="td__none mi:m-0 mi:text-[13px] mi:text-label3">Nothing left after this one.</p>
        <dl class="td__counts mi:grid mi:grid-cols-3 mi:gap-px mi:mt-2 mi:mx-0 mi:mb-0 mi:rounded-lg mi:bg-sep mi:overflow-hidden">
          <div class="mi:[.td__counts_&]:py-2.5 mi:[.td__counts_&]:px-3 mi:[.td__counts_&]:bg-card" v-for="a in actions" :key="a.id"><dt class="mi:[.td__counts_&]:text-[12px]">{{ a.label }}</dt><dd class="mi:[.td__counts_&]:text-[20px] mi:[.td__counts_&]:tabular-nums">{{ counts[a.id] }}</dd></div>
        </dl>
      </aside>
    </div>
    <p class="td__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status">{{ status }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Decision = 'archive' | 'later' | 'reply'
interface Mail { id: string, from: string, address: string, time: string, subject: string, body: string[], vip?: boolean }

const actions: { id: Decision, label: string, key: string, icon: 'archive' | 'bookmark' | 'chat' }[] = [
  { id: 'archive', label: 'Archive', key: 'E', icon: 'archive' },
  { id: 'later', label: 'Later', key: 'L', icon: 'bookmark' },
  { id: 'reply', label: 'Reply', key: 'R', icon: 'chat' }
]

// Sample unread emails; swap for your mail API.
const mails: Mail[] = [
  { id: 'm1', from: 'Elena Petrova', address: 'elena@harbourline.io', time: '07:42', vip: true, subject: 'Signed MSA attached, one question on clause 9', body: ['Legal signed this morning. Before we countersign the order form: does the 99.9% uptime credit apply per region or account-wide?', 'Our CFO wants it in writing by Friday.'] },
  { id: 'm2', from: 'GitHub', address: 'noreply@github.com', time: '06:15', subject: '[ledger-api] 3 pull requests awaiting your review', body: ['#482 Move rate limiter to Redis, #485 Bump pg to 8.12, #487 Fix rounding in VAT export.'] },
  { id: 'm3', from: 'Marcus Lee', address: 'marcus@lee.studio', time: 'Yesterday', subject: 'Brand refresh: second round of logo sketches', body: ['Narrowed it to three directions. The monogram works best at favicon size; the wordmark feels the most like you.', 'No rush, but feedback by Wednesday keeps us on track for the March launch.'] },
  { id: 'm4', from: 'Lufthansa', address: 'booking@lufthansa.com', time: 'Yesterday', subject: 'Check-in open: FRA → OSL, Thursday 09:20', body: ['Seat 14A is confirmed. Online check-in closes 30 minutes before departure.'] },
  { id: 'm5', from: 'Sara Johansson', address: 'sara@teamfolk.se', time: 'Mon', subject: 'Can we move our 1:1 to Thursday?', body: ['Something came up Tuesday afternoon. Thursday 15:00 or Friday 10:00 both work for me.'] }
]

const decided = ref<Record<string, Decision>>({})
const history = ref<string[]>([])
const status = ref('')

const queue = computed(() => mails.filter(m => !decided.value[m.id]))
const current = computed(() => queue.value[0])
const upcoming = computed(() => queue.value.slice(1))
const done = computed(() => mails.length - queue.value.length)
const counts = computed(() => {
  const c: Record<Decision, number> = { archive: 0, later: 0, reply: 0 }
  for (const d of Object.values(decided.value)) c[d] += 1
  return c
})

function decide(d: Decision) {
  const m = current.value
  if (!m) return
  decided.value = { ...decided.value, [m.id]: d }
  history.value.push(m.id)
  status.value = `${m.subject}: ${actions.find(a => a.id === d)?.label}.`
}

function undo() {
  const id = history.value.pop()
  if (!id) return
  const next = { ...decided.value }
  delete next[id]
  decided.value = next
  status.value = 'Last decision undone.'
}

function reset() {
  decided.value = {}
  history.value = []
}

const keys: Record<string, Decision> = { e: 'archive', l: 'later', r: 'reply' }
function onKey(e: KeyboardEvent) {
  const d = keys[e.key.toLowerCase()]
  if (d && !e.metaKey && !e.ctrlKey) { e.preventDefault(); decide(d) }
}
</script>

<style scoped>
.td__subject { margin-top: 4px; }

.td-card-enter-active, .td-card-leave-active { transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-3) var(--mi-ease); }
.td-card-enter-from { transform: translateY(12px) scale(.98); opacity: 0; }
.td-card-leave-to { transform: translateX(-24px); opacity: 0; }
.td__act { font: inherit; font-size: 14px; font-weight: 600; }
.td__q-text strong { color: var(--mi-label); font-weight: 600; margin-right: 4px; }
.td__counts dt { color: var(--mi-label2); }
.td__counts dd { margin: 2px 0 0; font-weight: 700; }

@media (prefers-reduced-motion: reduce) { .td-card-enter-active, .td-card-leave-active { transition: none; } }
</style>
