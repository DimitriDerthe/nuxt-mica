<template>
  <section class="ix mi:@container mi:h-165 mi:font-mi mi:text-label mi:bg-page" aria-labelledby="ix-title">
    <div class="ix__shell mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[720px]:grid-cols-[minmax(260px,_340px)_minmax(0,_1fr)] mi:@[1040px]:grid-cols-[220px_340px_minmax(0,_1fr)]" :class="{ 'is-reading': reading }">
      <!-- Lanes rail (wide only): the inbox is sorted by who owes the next move, not by folder. -->
      <nav class="ix__rail mi:hidden mi:@[1040px]:flex mi:flex-col mi:gap-0.5 mi:py-4.5 mi:px-3 mi:border-r mi:border-r-sep mi:bg-card mi:min-h-0" aria-label="Lanes">
        <div class="ix__me mi:flex mi:items-center mi:gap-2.5 mi:pt-1 mi:px-2 mi:pb-4 mi:min-w-0">
          <MiAvatar name="Inès Moreau" size="sm" tone="primary" decorative />
          <div class="ix__me-text mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="1">Inès Moreau</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Partnerships · Halden</MiText>
          </div>
        </div>
        <button
          v-for="l in lanes" :key="l.id" type="button" class="ix__lane mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[9px] mi:px-2.5 mi:[border:0] mi:rounded-md mi:bg-transparent mi:text-label2 mi:text-start mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-1)_var(--mi-ease)] mi:[&.is-on]:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-on': lane === l.id }"
          :aria-pressed="lane === l.id" @click="lane = l.id"
        >
          <span class="ix__lane-dot mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-fill" :data-lane="l.id" />
          <span class="ix__lane-name mi:flex-1 mi:min-w-0">{{ l.label }}</span>
          <span class="ix__lane-n mi:text-[12px] mi:tabular-nums mi:text-label3">{{ countOf(l.id) }}</span>
        </button>
        <p class="ix__rail-note mi:mt-auto mi:mx-2 mi:mb-0 mi:text-[12px] mi:leading-[1.45] mi:text-label3">Replying moves a thread to <strong>Waiting</strong>. The bar under each sender shows how long they have waited.</p>
      </nav>

      <div class="ix__list mi:[.ix__shell.is-reading_&]:hidden mi:@[720px]:[.ix__shell_&]:flex mi:@[720px]:[.ix__shell_&]:border-r mi:@[720px]:[.ix__shell_&]:border-r-sep mi:@[720px]:[.ix__shell.is-reading_&]:flex mi:@[720px]:[.ix__shell.is-reading_&]:border-r mi:@[720px]:[.ix__shell.is-reading_&]:border-r-sep mi:flex mi:flex-col mi:min-h-0 mi:min-w-0 mi:bg-card">
        <header class="ix__list-head mi:grid mi:gap-3 mi:pt-4.5 mi:px-4 mi:pb-3 mi:border-b mi:border-b-sep">
          <div>
            <MiText id="ix-title" as="h2" variant="title3" weight="bold">Inbox</MiText>
            <MiText variant="footnote" tone="label2" aria-live="polite">{{ owed }} {{ owed === 1 ? 'person is' : 'people are' }} waiting on you</MiText>
          </div>
          <MiSegmented v-model="lane" class="ix__seg" label="Lane" :options="laneOptions" />
        </header>
        <div class="ix__scroll mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-1 mi:px-2 mi:pb-4">
          <section v-for="g in groups" :key="g.id" :aria-labelledby="'ix-g-' + g.id">
            <h3 :id="'ix-g-' + g.id" class="ix__group mi:flex mi:items-center mi:gap-2 mi:mt-3.5 mi:mx-2 mi:mb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label2"><span class="ix__lane-dot mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-fill" :data-lane="g.id" />{{ g.label }}</h3>
            <ul class="ix__rows mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-0.5">
              <li v-for="t in g.items" :key="t.id">
                <button
                  type="button" class="ix__row mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:flex mi:gap-3 mi:w-full mi:py-3 mi:px-2.5 mi:[border:0] mi:rounded-lg mi:bg-transparent mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer" :class="{ 'is-on': t.id === activeId, 'is-unread': t.unread }"
                  :aria-current="t.id === activeId ? 'true' : undefined" @click="open(t.id)"
                >
                  <MiAvatar :name="t.from" size="sm" tone="auto" decorative />
                  <span class="ix__row-main mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
                    <span class="ix__row-top mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                      <span class="ix__from mi:text-[14px] mi:font-medium mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:[.ix__row.is-unread_&]:font-bold">{{ t.from }}</span>
                      <span class="ix__time mi:flex-[none] mi:text-[12px] mi:text-label3 mi:tabular-nums">{{ t.time }}</span>
                    </span>
                    <span class="ix__subj mi:[.ix__row.is-unread_&]:font-bold mi:text-[13.5px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ t.subject }}</span>
                    <span class="ix__prev mi:text-[13px] mi:leading-[1.4] mi:text-label2 mi:[display:-webkit-box] mi:[-webkit-line-clamp:2] mi:[-webkit-box-orient:vertical] mi:overflow-hidden">{{ t.preview }}</span>
                    <span v-if="t.lane === 'reply'" class="ix__age mi:flex mi:items-center mi:gap-2 mi:mt-1.5 mi:text-[11.5px] mi:font-medium mi:text-orange-t mi:tabular-nums mi:[&.is-hot]:text-red-t" :class="{ 'is-hot': t.waited >= 24 }">
                      <span class="ix__age-track mi:w-16 mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden"><span class="mi:[.ix__age-track_&]:h-full mi:[.ix__age-track_&]:rounded-[inherit] mi:[.ix__age-track_&]:origin-left mi:[.ix__age-track_&]:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]" :style="{ transform: `scaleX(${Math.min(t.waited / 48, 1)})` }" /></span>
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

      <article class="ix__read mi:hidden mi:[.ix__shell.is-reading_&]:flex mi:@[720px]:[.ix__shell_&]:flex mi:flex-col mi:min-h-0 mi:min-w-0" aria-labelledby="ix-subject">
        <header class="ix__read-head mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-5 mi:border-b mi:border-b-sep mi:bg-card">
          <MiIconButton class="ix__back" label="Back to inbox" variant="gray" size="regular" @click="reading = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="ix__read-title mi:flex-1 mi:min-w-0">
            <MiText id="ix-subject" as="h3" variant="headline" weight="semibold" :lines="2">{{ active.subject }}</MiText>
            <MiText variant="footnote" tone="label2">{{ active.company }} · {{ active.messages.length }} {{ active.messages.length === 1 ? 'message' : 'messages' }}</MiText>
          </div>
          <MiBadge :tone="laneMeta[active.lane].tone" :label="laneMeta[active.lane].short" dot />
        </header>

        <div class="ix__mails mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-3.5 mi:p-5">
          <article v-for="(m, i) in active.messages" :key="i" class="ix__mail mi:max-w-[64ch] mi:py-4 mi:px-4.5 mi:rounded-lg mi:bg-card mi:shadow-1 mi:[&.is-mine]:ml-auto mi:[&.is-mine]:bg-p-tint mi:[&.is-mine]:shadow-none" :class="{ 'is-mine': m.me }">
            <header class="ix__mail-head mi:flex mi:items-center mi:gap-2 mi:mb-2">
              <MiAvatar :name="m.me ? 'Inès Moreau' : active.from" size="xs" :tone="m.me ? 'primary' : 'auto'" decorative />
              <span class="ix__mail-from mi:flex-1 mi:text-[13px] mi:font-semibold">{{ m.me ? 'You' : active.from }}</span>
              <time class="ix__time mi:flex-[none] mi:text-[12px] mi:text-label3 mi:tabular-nums">{{ m.time }}</time>
            </header>
            <p v-for="(para, j) in m.body.split('\n\n')" :key="j" class="ix__mail-p mi:mt-0 mi:mx-0 mi:mb-2 mi:text-[14.5px] mi:leading-[1.55] mi:wrap-anywhere mi:last:mb-0">{{ para }}</p>
          </article>
        </div>

        <form class="ix__reply mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:bg-card" @submit.prevent="send">
          <MiInputGroup
            v-model="draft" multiline :rows="2" :aria-label="'Reply to ' + active.from" :placeholder="'Reply to ' + active.from.split(' ')[0] + '…'"
            @keydown.enter.meta.prevent="send" @keydown.enter.ctrl.prevent="send"
          >
            <template #block-end>
              <div class="ix__reply-bar mi:flex mi:items-center mi:justify-between mi:gap-2 mi:w-full">
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
@container (min-width: 720px) {
  .ix__back { display: none; }
}
@container (min-width: 1040px) {
  .ix__seg { display: none; }
}
.ix__lane { font: inherit; font-size: 14px; }
.ix__lane:hover { background: var(--mi-fill4); }
.ix__lane.is-on { background: var(--mi-p-tint); font-weight: 600; }
.ix__lane-dot[data-lane="reply"] { background: var(--mi-red); }
.ix__lane-dot[data-lane="waiting"] { background: var(--mi-p); }
.ix__lane-dot[data-lane="fyi"] { background: var(--mi-label3); }
.ix__row:hover { background: var(--mi-fill4); }
.ix__row.is-on { background: var(--mi-fill3); }
.ix__age-track span { display: block; background: currentColor; }
</style>
