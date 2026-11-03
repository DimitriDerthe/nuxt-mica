<template>
  <section class="cd mi:@container mi:font-mi mi:text-label" aria-labelledby="event-drawer-title">
    <MiText id="event-drawer-title" variant="title3" as="h2" weight="semibold" class="cd__sr mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Event details drawer</MiText>

    <div class="cd__stage mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(340px,_380px)] mi:@[760px]:items-start mi:@[760px]:gap-5">
      <!-- Faux calendar page behind the drawer; still clickable, so picking a row swaps the drawer content. -->
      <div class="cd__page mi:relative mi:grid mi:gap-3.5 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:[background:var(--mi-scrim)] mi:after:opacity-35 mi:after:pointer-events-none">
        <div class="cd__page-head mi:flex mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div>
            <MiText variant="caption" tone="label2" weight="semibold" as="p" class="cd__eyebrow">Thursday</MiText>
            <MiText variant="title2" as="h3" weight="bold">November 5</MiText>
          </div>
          <MiBadge tone="neutral" :label="agenda.length + ' events'" />
        </div>
        <ol class="cd__agenda mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="e in agenda" :key="e.id">
            <button type="button" class="cd__row mi:grid mi:grid-cols-[44px_3px_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-md mi:[background:transparent] mi:[font:inherit] mi:text-inherit mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-on': e.id === openId }" :aria-current="e.id === openId ? 'true' : undefined" @click="openId = e.id">
              <span class="cd__row-time mi:text-[13px] mi:font-semibold mi:tabular-nums mi:text-label2">{{ e.start }}</span>
              <span class="cd__row-bar mi:self-stretch mi:rounded-[2px] mi:[background:var(--c)]" :style="{ '--c': e.kind === 'video' ? 'var(--mi-s)' : 'var(--mi-p)' }" aria-hidden="true" />
              <span class="cd__row-text mi:grid mi:min-w-0">
                <span class="cd__row-title mi:text-[15px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ e.title }}</span>
                <span class="cd__row-where mi:text-[13px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ e.kind === 'video' ? 'Video call' : e.where }}</span>
              </span>
              <MiBadge v-if="rsvp[e.id] !== 'going'" :tone="rsvp[e.id] === 'maybe' ? 'warning' : 'danger'" :label="rsvp[e.id] === 'maybe' ? 'Maybe' : 'Declined'" variant="outline" />
            </button>
          </li>
        </ol>
      </div>

      <div class="cd__drawer">
        <MiDrawer :model-value="true" inline swipe-direction="right" :title="ev.title" :description="ev.start + ' – ' + ev.end + ' · ' + ev.where">
          <div class="cd__body mi:grid mi:gap-4.5">
            <!-- The one idea: work back from the start time to when you should leave. -->
            <div v-if="ev.travel" class="cd__trip mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-p-tint)]" role="group" aria-label="Getting there">
              <div class="cd__trip-top mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-2">
                <div>
                  <MiText variant="caption" tone="label2" weight="medium">Leave by</MiText>
                  <p class="cd__leave mi:m-0 mi:text-[34px] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums mi:text-p-text">{{ leaveBy }}</p>
                </div>
                <div class="cd__trip-mode mi:flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:font-medium mi:text-label2">
                  <MiIcon :svg="modeIcon[ev.travel.mode]" :size="18" />
                  <span>{{ ev.travel.line }} · {{ ev.travel.minutes }} min</span>
                </div>
              </div>
              <div class="cd__track mi:grid mi:gap-[3px] mi:h-2" :style="{ gridTemplateColumns: `${slack}fr ${ev.travel.minutes}fr 5fr` }" aria-hidden="true">
                <span class="cd__seg cd__seg--free mi:rounded-[4px] mi:[background:var(--mi-fill2)]" /><span class="cd__seg cd__seg--go mi:rounded-[4px] mi:[background:var(--mi-p)]" /><span class="cd__seg cd__seg--buf mi:rounded-[4px] mi:[background:var(--mi-orange)]" />
              </div>
              <div class="cd__track-legend mi:flex mi:justify-between mi:gap-2 mi:-mt-1">
                <MiText variant="caption2" tone="label2">{{ ev.prev }} {{ ev.prevLabel }} ends</MiText>
                <MiText variant="caption2" tone="label2">{{ ev.start }} start</MiText>
              </div>
              <MiText variant="footnote" tone="label2">{{ slack }} min free after {{ ev.prevLabel }}, plus a 5 minute buffer at the door.</MiText>
            </div>
            <div v-else class="cd__trip cd__trip--call mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-p-tint)] mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-start mi:gap-3 mi:text-p-text">
              <MiIcon :svg="modeIcon.video" :size="20" />
              <div>
                <MiText variant="subheadline" weight="semibold">{{ ev.where }}</MiText>
                <MiText variant="footnote" tone="label2">The join link unlocks 5 minutes before the start.</MiText>
              </div>
            </div>

            <div class="cd__section mi:grid mi:gap-2">
              <MiText variant="footnote" weight="semibold" tone="label2" as="h4">Your answer</MiText>
              <MiSegmented :model-value="rsvp[ev.id]" label="Your answer" :options="answers" @update:model-value="setRsvp" />
            </div>

            <MiList :header="ev.guests.length + 1 + ' guests'" class="cd__guests">
              <MiListItem v-for="g in guestsWithYou" :key="g.name" :title="g.name" :subtitle="g.role">
                <template #leading><MiAvatar :name="g.name" tone="auto" size="sm" decorative /></template>
                <template #trailing>
                  <span class="cd__status mi:text-[12px] mi:font-semibold mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:[background:var(--mi-fill3)] mi:text-label2 mi:[&.is-going]:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:[&.is-maybe]:[background:color-mix(in_srgb,_var(--mi-orange)_16%,_transparent)] mi:[&.is-no]:[background:color-mix(in_srgb,_var(--mi-red)_14%,_transparent)]" :class="'is-' + g.status">{{ statusText[g.status] }}</span>
                </template>
              </MiListItem>
            </MiList>

            <div class="cd__remind mi:flex mi:items-center mi:justify-between mi:gap-3">
              <div>
                <MiText id="event-drawer-remind" variant="subheadline" weight="medium">{{ ev.travel ? 'Ping me when it is time to leave' : 'Ping me 5 minutes before' }}</MiText>
                <MiText variant="footnote" tone="label2">{{ remind ? 'On · ' + (ev.travel ? leaveBy : minus(ev.start, 5)) : 'Off' }}</MiText>
              </div>
              <MiSwitch v-model="remind" aria-labelledby="event-drawer-remind" />
            </div>

            <div class="cd__notes mi:grid mi:gap-1.5 mi:py-3 mi:px-3.5 mi:rounded-md mi:[background:var(--mi-fill4)]">
              <MiText variant="footnote" weight="semibold" tone="label2" as="h4">Notes</MiText>
              <MiText variant="subheadline">{{ ev.notes }}</MiText>
            </div>
          </div>

          <template #footer>
            <div class="cd__foot mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2">
              <MiButton variant="gray" block>Message guests</MiButton>
              <MiButton block>{{ ev.kind === 'video' ? 'Join call' : 'Open in Maps' }}</MiButton>
            </div>
          </template>
        </MiDrawer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Status = 'going' | 'maybe' | 'no' | 'pending'
interface Guest { name: string, role: string, status: Status }
interface Ev {
  id: string, start: string, end: string, title: string, kind: 'video' | 'place', where: string, notes: string, guests: Guest[]
  prev?: string, prevLabel?: string, travel?: { mode: 'metro' | 'bike' | 'walk', line: string, minutes: number }
}

// Sample day; swap for your calendar API.
const agenda: Ev[] = [
  { id: 'standup', start: '09:00', end: '09:20', title: 'Standup', kind: 'video', where: 'Meet · product-daily', notes: 'Async updates in #product-daily before 08:55.', guests: [{ name: 'Ines Duarte', role: 'Design lead', status: 'going' }, { name: 'Tomás Ruiz', role: 'Engineering', status: 'going' }] },
  { id: 'planning', start: '10:00', end: '12:00', title: 'Quarterly planning', kind: 'place', where: 'Room Lumière, 3rd floor', prev: '09:20', prevLabel: 'Standup', travel: { mode: 'walk', line: 'Two floors up', minutes: 4 }, notes: 'Bring the Q1 bets doc. Each lead gets 10 minutes, then we stack-rank together.', guests: [{ name: 'Malik Osei', role: 'Head of product', status: 'going' }, { name: 'Carla Benoit', role: 'Sales', status: 'maybe' }, { name: 'Rosa Lind', role: 'Data', status: 'going' }] },
  { id: 'visit', start: '14:00', end: '15:00', title: 'Site visit: Brightwave HQ', kind: 'place', where: '52 rue de la Chaussée-d’Antin', prev: '12:00', prevLabel: 'Quarterly planning', travel: { mode: 'metro', line: 'Métro 7 to Chaussée d’Antin', minutes: 22 }, notes: 'Ask for Dana at reception. They want to see the bulk-import flow on real data, so bring the demo laptop.', guests: [{ name: 'Dana Whitfield', role: 'COO, Brightwave', status: 'going' }, { name: 'Carla Benoit', role: 'Account executive', status: 'going' }, { name: 'Owen Pryce', role: 'Solutions engineer', status: 'pending' }] },
  { id: 'interview', start: '16:30', end: '17:15', title: 'Interview: Yuki Tanaka', kind: 'video', where: 'Meet · loop-2240', notes: 'Product sense round. Scorecard in Ashby; use the onboarding case study.', guests: [{ name: 'Yuki Tanaka', role: 'Candidate, PM', status: 'going' }, { name: 'Hana Kobayashi', role: 'Shadow interviewer', status: 'going' }] },
  { id: 'dinner', start: '19:30', end: '21:30', title: 'Dinner with Sam', kind: 'place', where: 'Septime, 80 rue de Charonne', prev: '17:15', prevLabel: 'Interview', travel: { mode: 'bike', line: 'Vélib’ along Voltaire', minutes: 25 }, notes: 'Table for two under Duarte. Sam is vegetarian.', guests: [{ name: 'Sam Okafor', role: 'Friend', status: 'going' }] }
]

const openId = ref('visit')
const ev = computed(() => agenda.find(e => e.id === openId.value)!)
const rsvp = reactive<Record<string, Status>>(Object.fromEntries(agenda.map(e => [e.id, e.id === 'dinner' ? 'maybe' : 'going'])))
const remind = ref(true)
const setRsvp = (v: string | number | null) => { if (v) rsvp[ev.value.id] = v as Status }

const answers = [{ value: 'going', label: 'Going' }, { value: 'maybe', label: 'Maybe' }, { value: 'no', label: 'Decline' }]
const statusText: Record<Status, string> = { going: 'Going', maybe: 'Maybe', no: 'Declined', pending: 'Awaiting' }
const guestsWithYou = computed(() => [{ name: 'Ines Duarte', role: 'You', status: rsvp[ev.value.id] ?? 'going' }, ...ev.value.guests.filter(g => g.name !== 'Ines Duarte')])

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h! * 60 + m! }
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const minus = (t: string, m: number) => fmt(toMin(t) - m)
const leaveBy = computed(() => minus(ev.value.start, (ev.value.travel?.minutes ?? 0) + 5))
const slack = computed(() => Math.max(0, toMin(leaveBy.value) - toMin(ev.value.prev ?? leaveBy.value)))

const modeIcon = {
  metro: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9" cy="14" r=".6"/><circle cx="15" cy="14" r=".6"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7h-1M14 6h2"/>',
  walk: '<circle cx="13" cy="4.5" r="1.6"/><path d="M10 21l2-6-2-3 1-5 3 3 3 1M12 15l3 6M10 7l-3 3"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="M16 10.5l5-3v9l-5-3"/>'
}
</script>

<style scoped>
.cd__sr { overflow: hidden; white-space: nowrap; }
.cd__eyebrow { margin: 0; text-transform: uppercase; letter-spacing: .06em; }
.cd__row:hover { background: var(--mi-fill4); }
.cd__row.is-on { background: var(--mi-p-tint); }
.cd__trip--call :deep(p) { color: var(--mi-label); }
.cd__section h4, .cd__notes h4 { margin: 0; text-transform: uppercase; letter-spacing: .05em; font-size: 11px; }
.cd__status.is-going { color: var(--mi-green-t); }
.cd__status.is-maybe { color: var(--mi-orange-t); }
.cd__status.is-no { color: var(--mi-red-t); }
</style>
