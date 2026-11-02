<template>
  <section class="ix" aria-labelledby="ix-title">
    <div class="ix__shell" :class="{ 'is-reading': reading }">
      <!-- Lanes rail (wide only): the inbox is sorted by who owes the next move, not by folder. -->
      <nav class="ix__rail" aria-label="Lanes">
        <div class="ix__me">
          <MiAvatar name="Inès Moreau" size="sm" tone="primary" decorative />
          <div class="ix__me-text">
            <MiText variant="subheadline" weight="semibold" :lines="1">Inès Moreau</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Partnerships · Halden</MiText>
          </div>
        </div>
        <button
          v-for="l in lanes" :key="l.id" type="button" class="ix__lane" :class="{ 'is-on': lane === l.id }"
          :aria-pressed="lane === l.id" @click="lane = l.id"
        >
          <span class="ix__lane-dot" :data-lane="l.id" />
          <span class="ix__lane-name">{{ l.label }}</span>
          <span class="ix__lane-n">{{ countOf(l.id) }}</span>
        </button>
        <p class="ix__rail-note">Replying moves a thread to <strong>Waiting</strong>. The bar under each sender shows how long they have waited.</p>
      </nav>

      <div class="ix__list">
        <header class="ix__list-head">
          <div>
            <MiText id="ix-title" as="h2" variant="title3" weight="bold">Inbox</MiText>
            <MiText variant="footnote" tone="label2" aria-live="polite">{{ owed }} {{ owed === 1 ? 'person is' : 'people are' }} waiting on you</MiText>
          </div>
          <MiSegmented v-model="lane" class="ix__seg" label="Lane" :options="laneOptions" />
        </header>
        <div class="ix__scroll">
          <section v-for="g in groups" :key="g.id" :aria-labelledby="'ix-g-' + g.id">
            <h3 :id="'ix-g-' + g.id" class="ix__group"><span class="ix__lane-dot" :data-lane="g.id" />{{ g.label }}</h3>
            <ul class="ix__rows">
              <li v-for="t in g.items" :key="t.id">
                <button
                  type="button" class="ix__row" :class="{ 'is-on': t.id === activeId, 'is-unread': t.unread }"
                  :aria-current="t.id === activeId ? 'true' : undefined" @click="open(t.id)"
                >
                  <MiAvatar :name="t.from" size="sm" tone="auto" decorative />
                  <span class="ix__row-main">
                    <span class="ix__row-top">
                      <span class="ix__from">{{ t.from }}</span>
                      <span class="ix__time">{{ t.time }}</span>
                    </span>
                    <span class="ix__subj">{{ t.subject }}</span>
                    <span class="ix__prev">{{ t.preview }}</span>
                    <span v-if="t.lane === 'reply'" class="ix__age" :class="{ 'is-hot': t.waited >= 24 }">
                      <span class="ix__age-track"><span :style="{ transform: `scaleX(${Math.min(t.waited / 48, 1)})` }" /></span>
                      waiting {{ t.waited }}h
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </section>
          <MiEmptyState v-if="!groups.length" title="Nothing here" description="Every thread in this lane is handled." />
        </div>
      </div>

      <article class="ix__read" aria-labelledby="ix-subject">
        <header class="ix__read-head">
          <MiIconButton class="ix__back" label="Back to inbox" variant="gray" size="regular" @click="reading = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="ix__read-title">
            <MiText id="ix-subject" as="h3" variant="headline" weight="semibold" :lines="2">{{ active.subject }}</MiText>
            <MiText variant="footnote" tone="label2">{{ active.company }} · {{ active.messages.length }} {{ active.messages.length === 1 ? 'message' : 'messages' }}</MiText>
          </div>
          <MiBadge :tone="laneMeta[active.lane].tone" :label="laneMeta[active.lane].short" dot />
        </header>

        <div class="ix__mails">
          <article v-for="(m, i) in active.messages" :key="i" class="ix__mail" :class="{ 'is-mine': m.me }">
            <header class="ix__mail-head">
              <MiAvatar :name="m.me ? 'Inès Moreau' : active.from" size="xs" :tone="m.me ? 'primary' : 'auto'" decorative />
              <span class="ix__mail-from">{{ m.me ? 'You' : active.from }}</span>
              <time class="ix__time">{{ m.time }}</time>
            </header>
            <p v-for="(para, j) in m.body.split('\n\n')" :key="j" class="ix__mail-p">{{ para }}</p>
          </article>
        </div>

        <form class="ix__reply" @submit.prevent="send">
          <MiInputGroup
            v-model="draft" multiline :rows="2" :aria-label="'Reply to ' + active.from" :placeholder="'Reply to ' + active.from.split(' ')[0] + '…'"
            @keydown.enter.meta.prevent="send" @keydown.enter.ctrl.prevent="send"
          >
            <template #block-end>
              <div class="ix__reply-bar">
                <MiText variant="caption" tone="label3">⌘ Enter to send</MiText>
                <MiButton type="submit" size="small" :disabled="!draft.trim()">Send reply</MiButton>
              </div>
            </template>
          </MiInputGroup>
        </form>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Lane = 'reply' | 'waiting' | 'fyi'
interface Mail { body: string, time: string, me?: boolean }
interface Thread { id: string, from: string, company: string, subject: string, preview: string, time: string, lane: Lane, waited: number, unread: boolean, messages: Mail[] }

const laneMeta: Record<Lane, { label: string, short: string, tone: 'danger' | 'primary' | 'neutral' }> = {
  reply: { label: 'Needs your reply', short: 'Your move', tone: 'danger' },
  waiting: { label: 'Waiting on them', short: 'Their move', tone: 'primary' },
  fyi: { label: 'For your info', short: 'FYI', tone: 'neutral' }
}
const lanes = [
  { id: 'all', label: 'Everything' },
  { id: 'reply', label: 'Needs your reply' },
  { id: 'waiting', label: 'Waiting on them' },
  { id: 'fyi', label: 'For your info' }
] as const
const laneOptions = [{ value: 'all', label: 'All' }, { value: 'reply', label: 'Reply' }, { value: 'waiting', label: 'Waiting' }]

// Sample threads; swap for your mail API.
const threads = ref<Thread[]>([
  {
    id: 't1', from: 'Kwame Asante', company: 'Lumen Freight', subject: 'Pilot scope: 3 depots or 5?', time: '09:12', lane: 'reply', waited: 31, unread: true,
    preview: 'Our ops lead wants all five depots live before peak season. Can your team…',
    messages: [
      { time: 'Mon 16:40', body: 'Hi Inès,\n\nOur ops lead wants all five depots live before peak season. Can your team support that, or should we phase it as three now and two in January?\n\nKwame' }
    ]
  },
  {
    id: 't2', from: 'Sofia Lindqvist', company: 'Norrsken Bikes', subject: 'Revised co-marketing budget', time: '08:47', lane: 'reply', waited: 9, unread: true,
    preview: 'Finance approved 18k instead of 25k. I would rather cut the print run than the…',
    messages: [
      { time: 'Tue 18:05', body: 'Quick heads-up: finance approved 18k instead of 25k.\n\nI would rather cut the print run than the launch event. Does that work on your side?' }
    ]
  },
  {
    id: 't3', from: 'Ravi Menon', company: 'Tidewater Health', subject: 'Security questionnaire, section 4', time: 'Yesterday', lane: 'waiting', waited: 0, unread: false,
    preview: 'You: Attached the SOC 2 bridge letter. Section 4.3 is answered inline.',
    messages: [
      { time: 'Mon 10:02', body: 'Could you send the latest SOC 2 report and fill section 4 of the attached questionnaire?' },
      { time: 'Mon 15:30', me: true, body: 'Attached the SOC 2 bridge letter. Section 4.3 is answered inline; 4.4 needs your IT team to confirm the SSO provider.' }
    ]
  },
  {
    id: 't4', from: 'Maya Okafor', company: 'Halden', subject: 'Q4 partner tiers are live', time: 'Mon', lane: 'fyi', waited: 0, unread: false,
    preview: 'New tier thresholds are in the handbook. Nothing to do unless a partner asks.',
    messages: [
      { time: 'Mon 09:00', body: 'New tier thresholds are in the handbook. Nothing to do unless a partner asks about the change.' }
    ]
  },
  {
    id: 't5', from: 'Diego Ferreira', company: 'Casa Prisma', subject: 'Reseller agreement redlines', time: 'Fri', lane: 'reply', waited: 52, unread: false,
    preview: 'Legal flagged clause 7.2 (exclusivity). Can we drop it for LATAM only?',
    messages: [
      { time: 'Fri 11:24', body: 'Legal flagged clause 7.2 on exclusivity.\n\nCan we drop it for LATAM only? Everything else is signed off.' }
    ]
  }
])

const lane = ref<string | number | null>('all')
const activeId = ref('t1')
const reading = ref(false)
const draft = ref('')

const active = computed(() => threads.value.find(t => t.id === activeId.value) ?? threads.value[0]!)
const owed = computed(() => threads.value.filter(t => t.lane === 'reply').length)
const countOf = (id: string) => (id === 'all' ? threads.value.length : threads.value.filter(t => t.lane === id).length)

const groups = computed(() => {
  const order: Lane[] = lane.value === 'all' || lane.value === null ? ['reply', 'waiting', 'fyi'] : [lane.value as Lane]
  return order
    .map(id => ({ id, label: laneMeta[id].label, items: threads.value.filter(t => t.lane === id).sort((a, b) => b.waited - a.waited) }))
    .filter(g => g.items.length)
})

function open(id: string) {
  activeId.value = id
  reading.value = true
  const t = threads.value.find(x => x.id === id)
  if (t) t.unread = false
}

function send() {
  const body = draft.value.trim()
  if (!body) return
  const t = active.value
  t.messages.push({ time: 'Just now', me: true, body })
  t.preview = 'You: ' + body
  t.time = 'Now'
  t.lane = 'waiting'
  t.waited = 0
  draft.value = ''
}
</script>

<style scoped>
.ix { container-type: inline-size; height: 660px; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.ix__shell { display: grid; height: 100%; grid-template-columns: minmax(0, 1fr); }
.ix__rail { display: none; }
.ix__read { display: none; }
.ix__shell.is-reading .ix__list { display: none; }
.ix__shell.is-reading .ix__read { display: flex; }

@container (min-width: 720px) {
  .ix__shell { grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); }
  .ix__shell .ix__list, .ix__shell.is-reading .ix__list { display: flex; border-right: 1px solid var(--mi-sep); }
  .ix__shell .ix__read { display: flex; }
  .ix__back { display: none; }
}
@container (min-width: 1040px) {
  .ix__shell { grid-template-columns: 220px 340px minmax(0, 1fr); }
  .ix__rail { display: flex; }
  .ix__seg { display: none; }
}

/* Rail */
.ix__rail { flex-direction: column; gap: 2px; padding: 18px 12px; border-right: 1px solid var(--mi-sep); background: var(--mi-card); min-height: 0; }
.ix__me { display: flex; align-items: center; gap: 10px; padding: 4px 8px 16px; min-width: 0; }
.ix__me-text { min-width: 0; }
.ix__lane { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; border: 0; border-radius: var(--mi-radius-m); background: transparent; color: var(--mi-label2); font: inherit; font-size: 14px; text-align: start; cursor: pointer; transition: opacity var(--mi-dur-1) var(--mi-ease); }
.ix__lane:hover { background: var(--mi-fill4); }
.ix__lane.is-on { background: var(--mi-p-tint); color: var(--mi-p-text); font-weight: 600; }
.ix__lane:focus-visible, .ix__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.ix__lane-name { flex: 1; min-width: 0; }
.ix__lane-n { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--mi-label3); }
.ix__lane-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--mi-fill); }
.ix__lane-dot[data-lane="reply"] { background: var(--mi-red); }
.ix__lane-dot[data-lane="waiting"] { background: var(--mi-p); }
.ix__lane-dot[data-lane="fyi"] { background: var(--mi-label3); }
.ix__rail-note { margin: auto 8px 0; font-size: 12px; line-height: 1.45; color: var(--mi-label3); }

/* List */
.ix__list { display: flex; flex-direction: column; min-height: 0; min-width: 0; background: var(--mi-card); }
.ix__list-head { display: grid; gap: 12px; padding: 18px 16px 12px; border-bottom: 1px solid var(--mi-sep); }
.ix__scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 8px 16px; }
.ix__group { display: flex; align-items: center; gap: 8px; margin: 14px 8px 6px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--mi-label2); }
.ix__rows { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.ix__row { display: flex; gap: 12px; width: 100%; padding: 12px 10px; border: 0; border-radius: var(--mi-radius-l); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.ix__row:hover { background: var(--mi-fill4); }
.ix__row.is-on { background: var(--mi-fill3); }
.ix__row-main { display: grid; gap: 2px; flex: 1; min-width: 0; }
.ix__row-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ix__from { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ix__row.is-unread .ix__from, .ix__row.is-unread .ix__subj { font-weight: 700; }
.ix__time { flex: none; font-size: 12px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.ix__subj { font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ix__prev { font-size: 13px; line-height: 1.4; color: var(--mi-label2); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ix__age { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 11.5px; font-weight: 500; color: var(--mi-orange-t); font-variant-numeric: tabular-nums; }
.ix__age.is-hot { color: var(--mi-red-t); }
.ix__age-track { width: 64px; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.ix__age-track span { display: block; height: 100%; border-radius: inherit; background: currentColor; transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-ease); }

/* Reading pane */
.ix__read { flex-direction: column; min-height: 0; min-width: 0; }
.ix__read-head { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.ix__read-title { flex: 1; min-width: 0; }
.ix__mails { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 14px; padding: 20px; }
.ix__mail { max-width: 64ch; padding: 16px 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ix__mail.is-mine { margin-left: auto; background: var(--mi-p-tint); box-shadow: none; }
.ix__mail-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ix__mail-from { flex: 1; font-size: 13px; font-weight: 600; }
.ix__mail-p { margin: 0 0 8px; font-size: 14.5px; line-height: 1.55; overflow-wrap: anywhere; }
.ix__mail-p:last-child { margin-bottom: 0; }
.ix__reply { padding: 12px 16px 16px; border-top: 1px solid var(--mi-sep); background: var(--mi-card); }
.ix__reply-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
</style>
