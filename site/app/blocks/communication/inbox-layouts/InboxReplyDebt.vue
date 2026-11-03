<template>
  <section class="mi:@container mi:h-165 mi:font-mi mi:text-label mi:bg-page" aria-labelledby="ix-title">
    <div class="mi:grid mi:h-full mi:grid-cols-[minmax(0,_1fr)] mi:@[720px]:grid-cols-[minmax(260px,_340px)_minmax(0,_1fr)] mi:@[1040px]:grid-cols-[220px_340px_minmax(0,_1fr)]">
      <!-- Lanes rail (wide only): the inbox is sorted by who owes the next move, not by folder. -->
      <nav class="mi:hidden mi:@[1040px]:flex mi:flex-col mi:gap-0.5 mi:py-4.5 mi:px-3 mi:border-r mi:border-r-sep mi:bg-card mi:min-h-0" aria-label="Lanes">
        <div class="mi:flex mi:items-center mi:gap-2.5 mi:pt-1 mi:px-2 mi:pb-4 mi:min-w-0">
          <MiAvatar name="Inès Moreau" size="sm" tone="primary" decorative />
          <div class="mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="1">Inès Moreau</MiText>
            <MiText variant="caption" tone="label2" :lines="1">Partnerships · Halden</MiText>
          </div>
        </div>
        <button
          v-for="l in lanes" :key="l.id" type="button" class="mi:[font:inherit] mi:text-[14px] mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:py-[9px] mi:px-2.5 mi:[border:0] mi:rounded-md mi:text-start mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-1)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="lane === l.id ? 'mi:bg-p-tint mi:font-semibold mi:text-p-text' : 'mi:bg-transparent mi:hover:bg-fill4 mi:text-label2'"
          :aria-pressed="lane === l.id" @click="lane = l.id"
        >
          <span class="mi:data-[lane=reply]:bg-red mi:data-[lane=waiting]:bg-p mi:data-[lane=fyi]:bg-label3 mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-fill" :data-lane="l.id" />
          <span class="mi:flex-1 mi:min-w-0">{{ l.label }}</span>
          <span class="mi:text-[12px] mi:tabular-nums mi:text-label3">{{ countOf(l.id) }}</span>
        </button>
        <p class="mi:mt-auto mi:mx-2 mi:mb-0 mi:text-[12px] mi:leading-[1.45] mi:text-label3">Replying moves a thread to <strong>Waiting</strong>. The bar under each sender shows how long they have waited.</p>
      </nav>

      <div class="mi:@[720px]:flex mi:@[720px]:border-r mi:@[720px]:border-r-sep mi:flex-col mi:min-h-0 mi:min-w-0 mi:bg-card" :class="reading ? 'mi:hidden' : 'mi:flex'">
        <header class="mi:grid mi:gap-3 mi:pt-4.5 mi:px-4 mi:pb-3 mi:border-b mi:border-b-sep">
          <div>
            <MiText id="ix-title" as="h2" variant="title3" weight="bold">Inbox</MiText>
            <MiText variant="footnote" tone="label2" aria-live="polite">{{ owed }} {{ owed === 1 ? 'person is' : 'people are' }} waiting on you</MiText>
          </div>
          <MiSegmented v-model="lane" class="mi:@[1040px]:hidden!" label="Lane" :options="laneOptions" />
        </header>
        <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:pt-1 mi:px-2 mi:pb-4">
          <section v-for="g in groups" :key="g.id" :aria-labelledby="'ix-g-' + g.id">
            <h3 :id="'ix-g-' + g.id" class="mi:flex mi:items-center mi:gap-2 mi:mt-3.5 mi:mx-2 mi:mb-1.5 mi:text-[11px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label2"><span class="mi:data-[lane=reply]:bg-red mi:data-[lane=waiting]:bg-p mi:data-[lane=fyi]:bg-label3 mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-fill" :data-lane="g.id" />{{ g.label }}</h3>
            <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-0.5">
              <li v-for="t in g.items" :key="t.id">
                <button
                  type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:flex mi:gap-3 mi:w-full mi:py-3 mi:px-2.5 mi:[border:0] mi:rounded-lg mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer" :class="[t.id === activeId ? 'mi:bg-fill3' : 'mi:bg-transparent mi:hover:bg-fill4']"
                  :aria-current="t.id === activeId ? 'true' : undefined" @click="open(t.id)"
                >
                  <MiAvatar :name="t.from" size="sm" tone="auto" decorative />
                  <span class="mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
                    <span class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                      <span class="mi:text-[14px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap" :class="t.unread ? 'mi:font-bold' : 'mi:font-medium'">{{ t.from }}</span>
                      <span class="mi:flex-[none] mi:text-[12px] mi:text-label3 mi:tabular-nums">{{ t.time }}</span>
                    </span>
                    <span class="mi:text-[13.5px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap" :class="t.unread ? 'mi:font-bold' : ''">{{ t.subject }}</span>
                    <span class="mi:text-[13px] mi:leading-[1.4] mi:text-label2 mi:[display:-webkit-box] mi:[-webkit-line-clamp:2] mi:[-webkit-box-orient:vertical] mi:overflow-hidden">{{ t.preview }}</span>
                    <span v-if="t.lane === 'reply'" class="mi:flex mi:items-center mi:gap-2 mi:mt-1.5 mi:text-[11.5px] mi:font-medium mi:tabular-nums" :class="t.waited >= 24 ? 'mi:text-red-t' : 'mi:text-orange-t'">
                      <span class="mi:w-16 mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden"><span class="mi:block mi:bg-current mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]" :style="{ transform: `scaleX(${Math.min(t.waited / 48, 1)})` }" /></span>
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

      <article class="mi:@[720px]:flex mi:flex-col mi:min-h-0 mi:min-w-0" :class="reading ? 'mi:flex' : 'mi:hidden'" aria-labelledby="ix-subject">
        <header class="mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-5 mi:border-b mi:border-b-sep mi:bg-card">
          <MiIconButton class="mi:@[720px]:hidden!" label="Back to inbox" variant="gray" size="regular" @click="reading = false">
            <MiIcon name="chevron-left" />
          </MiIconButton>
          <div class="mi:flex-1 mi:min-w-0">
            <MiText id="ix-subject" as="h3" variant="headline" weight="semibold" :lines="2">{{ active.subject }}</MiText>
            <MiText variant="footnote" tone="label2">{{ active.company }} · {{ active.messages.length }} {{ active.messages.length === 1 ? 'message' : 'messages' }}</MiText>
          </div>
          <MiBadge :tone="laneMeta[active.lane].tone" :label="laneMeta[active.lane].short" dot />
        </header>

        <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-3.5 mi:p-5">
          <article v-for="(m, i) in active.messages" :key="i" class="mi:max-w-[64ch] mi:py-4 mi:px-4.5 mi:rounded-lg" :class="m.me ? 'mi:ml-auto mi:bg-p-tint mi:shadow-none' : 'mi:bg-card mi:shadow-1'">
            <header class="mi:flex mi:items-center mi:gap-2 mi:mb-2">
              <MiAvatar :name="m.me ? 'Inès Moreau' : active.from" size="xs" :tone="m.me ? 'primary' : 'auto'" decorative />
              <span class="mi:flex-1 mi:text-[13px] mi:font-semibold">{{ m.me ? 'You' : active.from }}</span>
              <time class="mi:flex-[none] mi:text-[12px] mi:text-label3 mi:tabular-nums">{{ m.time }}</time>
            </header>
            <p v-for="(para, j) in m.body.split('\n\n')" :key="j" class="mi:mt-0 mi:mx-0 mi:mb-2 mi:text-[14.5px] mi:leading-[1.55] mi:wrap-anywhere mi:last:mb-0">{{ para }}</p>
          </article>
        </div>

        <form class="mi:pt-3 mi:px-4 mi:pb-4 mi:border-t mi:border-t-sep mi:bg-card" @submit.prevent="send">
          <MiInputGroup
            v-model="draft" multiline :rows="2" :aria-label="'Reply to ' + active.from" :placeholder="'Reply to ' + active.from.split(' ')[0] + '…'"
            @keydown.enter.meta.prevent="send" @keydown.enter.ctrl.prevent="send"
          >
            <template #block-end>
              <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:w-full">
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

