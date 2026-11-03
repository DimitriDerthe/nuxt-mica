<template>
  <section class="td" aria-labelledby="td-title">
    <div class="td__shell">
      <div class="td__main">
        <header class="td__head">
          <div>
            <MiText id="td-title" as="h2" variant="title3" weight="semibold">Morning triage</MiText>
            <MiText variant="footnote" tone="label2">{{ done }} of {{ mails.length }} sorted · one decision per email</MiText>
          </div>
          <MiButton variant="gray" size="small" :disabled="!history.length" @click="undo">
            <template #leading><MiIcon name="arrow-left" :size="14" /></template>
            Undo
          </MiButton>
        </header>
        <div class="td__bar" role="progressbar" aria-label="Triage progress" :aria-valuenow="done" aria-valuemin="0" :aria-valuemax="mails.length">
          <span :style="{ transform: `scaleX(${done / mails.length})` }" />
        </div>

        <Transition name="td-card" mode="out-in">
          <article
            v-if="current" :key="current.id" class="td__card" tabindex="0"
            :aria-label="'Email from ' + current.from + ': ' + current.subject" @keydown="onKey"
          >
            <header class="td__from">
              <MiAvatar :name="current.from" size="md" tone="auto" decorative />
              <div class="td__from-text">
                <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ current.from }}</MiText>
                <MiText variant="caption" tone="label2" :lines="1">{{ current.address }} · {{ current.time }}</MiText>
              </div>
              <MiBadge v-if="current.vip" tone="warning" label="Important" />
            </header>
            <MiText variant="title3" weight="semibold" as="p" class="td__subject">{{ current.subject }}</MiText>
            <p v-for="(p, i) in current.body" :key="i" class="td__p">{{ p }}</p>
          </article>
          <MiEmptyState
            v-else key="empty" icon="inbox" title="Inbox sorted" card
            :description="`${counts.archive} archived, ${counts.later} for later, ${counts.reply} to reply.`"
            secondary-label="Start over" @secondary="reset"
          />
        </Transition>

        <div v-if="current" class="td__acts" role="group" aria-label="Decide">
          <button v-for="a in actions" :key="a.id" type="button" class="td__act" :class="'is-' + a.id" @click="decide(a.id)">
            <MiIcon :name="a.icon" :size="18" />
            <span>{{ a.label }}</span>
            <MiKbd>{{ a.key }}</MiKbd>
          </button>
        </div>
      </div>

      <aside class="td__side" aria-labelledby="td-next-title">
        <MiText id="td-next-title" as="h3" variant="subheadline" weight="semibold">Up next</MiText>
        <ol class="td__queue">
          <li v-for="m in upcoming" :key="m.id" class="td__q">
            <MiAvatar :name="m.from" size="xs" tone="auto" decorative />
            <span class="td__q-text"><strong>{{ m.from }}</strong> {{ m.subject }}</span>
          </li>
        </ol>
        <p v-if="!upcoming.length" class="td__none">Nothing left after this one.</p>
        <dl class="td__counts">
          <div v-for="a in actions" :key="a.id"><dt>{{ a.label }}</dt><dd>{{ counts[a.id] }}</dd></div>
        </dl>
      </aside>
    </div>
    <p class="td__sr" role="status">{{ status }}</p>
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
.td { container-type: inline-size; position: relative; min-height: 600px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.td__shell { display: grid; gap: 20px; padding: 20px 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .td__shell { grid-template-columns: minmax(0, 1fr) 280px; padding: 28px; gap: 28px; } }

.td__main { display: grid; align-content: start; gap: 14px; min-width: 0; }
.td__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.td__bar { height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.td__bar span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.td__card { display: grid; gap: 12px; min-height: 260px; align-content: start; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
.td__card:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.td__from { display: flex; align-items: center; gap: 12px; }
.td__from-text { flex: 1; min-width: 0; }
.td__subject { margin-top: 4px; }
.td__p { margin: 0; font-size: 15px; line-height: 1.6; color: var(--mi-label2); }

.td-card-enter-active, .td-card-leave-active { transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-3) var(--mi-ease); }
.td-card-enter-from { transform: translateY(12px) scale(.98); opacity: 0; }
.td-card-leave-to { transform: translateX(-24px); opacity: 0; }

.td__acts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.td__act { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); background: var(--mi-card); color: var(--mi-label); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease); }
.td__act:hover { transform: translateY(-1px); }
.td__act:active { transform: scale(.97); }
.td__act:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.td__act.is-archive { color: var(--mi-label2); }
.td__act.is-later { color: var(--mi-orange-t); }
.td__act.is-reply { color: var(--mi-p-text); }
@container (min-width: 520px) { .td__act { flex-direction: row; justify-content: center; } }

.td__side { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 10px; }
.td__queue { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
.td__q { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-card); }
.td__q-text { min-width: 0; font-size: 13px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td__q-text strong { color: var(--mi-label); font-weight: 600; margin-right: 4px; }
.td__none { margin: 0; font-size: 13px; color: var(--mi-label3); }
.td__counts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; margin: 8px 0 0; border-radius: var(--mi-radius-l); background: var(--mi-sep); overflow: hidden; }
.td__counts div { padding: 10px 12px; background: var(--mi-card); }
.td__counts dt { font-size: 12px; color: var(--mi-label2); }
.td__counts dd { margin: 2px 0 0; font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
.td__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) { .td-card-enter-active, .td-card-leave-active { transition: none; } }
</style>
