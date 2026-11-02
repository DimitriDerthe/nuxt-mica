<template>
  <section class="cd" aria-labelledby="event-drawer-title">
    <MiText id="event-drawer-title" variant="title3" as="h2" weight="semibold" class="cd__sr">Event details drawer</MiText>

    <div class="cd__stage">
      <!-- Faux calendar page behind the drawer; still clickable, so picking a row swaps the drawer content. -->
      <div class="cd__page">
        <div class="cd__page-head">
          <div>
            <MiText variant="caption" tone="label2" weight="semibold" as="p" class="cd__eyebrow">Thursday</MiText>
            <MiText variant="title2" as="h3" weight="bold">November 5</MiText>
          </div>
          <MiBadge tone="neutral" :label="agenda.length + ' events'" />
        </div>
        <ol class="cd__agenda">
          <li v-for="e in agenda" :key="e.id">
            <button type="button" class="cd__row" :class="{ 'is-on': e.id === openId }" :aria-current="e.id === openId ? 'true' : undefined" @click="openId = e.id">
              <span class="cd__row-time">{{ e.start }}</span>
              <span class="cd__row-bar" :style="{ '--c': e.kind === 'video' ? 'var(--mi-s)' : 'var(--mi-p)' }" aria-hidden="true" />
              <span class="cd__row-text">
                <span class="cd__row-title">{{ e.title }}</span>
                <span class="cd__row-where">{{ e.kind === 'video' ? 'Video call' : e.where }}</span>
              </span>
              <MiBadge v-if="rsvp[e.id] !== 'going'" :tone="rsvp[e.id] === 'maybe' ? 'warning' : 'danger'" :label="rsvp[e.id] === 'maybe' ? 'Maybe' : 'Declined'" variant="outline" />
            </button>
          </li>
        </ol>
      </div>

      <div class="cd__drawer">
        <MiDrawer :model-value="true" inline swipe-direction="right" :title="ev.title" :description="ev.start + ' – ' + ev.end + ' · ' + ev.where">
          <div class="cd__body">
            <!-- The one idea: work back from the start time to when you should leave. -->
            <div v-if="ev.travel" class="cd__trip" role="group" aria-label="Getting there">
              <div class="cd__trip-top">
                <div>
                  <MiText variant="caption" tone="label2" weight="medium">Leave by</MiText>
                  <p class="cd__leave">{{ leaveBy }}</p>
                </div>
                <div class="cd__trip-mode">
                  <MiIcon :svg="modeIcon[ev.travel.mode]" :size="18" />
                  <span>{{ ev.travel.line }} · {{ ev.travel.minutes }} min</span>
                </div>
              </div>
              <div class="cd__track" :style="{ gridTemplateColumns: `${slack}fr ${ev.travel.minutes}fr 5fr` }" aria-hidden="true">
                <span class="cd__seg cd__seg--free" /><span class="cd__seg cd__seg--go" /><span class="cd__seg cd__seg--buf" />
              </div>
              <div class="cd__track-legend">
                <MiText variant="caption2" tone="label2">{{ ev.prev }} {{ ev.prevLabel }} ends</MiText>
                <MiText variant="caption2" tone="label2">{{ ev.start }} start</MiText>
              </div>
              <MiText variant="footnote" tone="label2">{{ slack }} min free after {{ ev.prevLabel }}, plus a 5 minute buffer at the door.</MiText>
            </div>
            <div v-else class="cd__trip cd__trip--call">
              <MiIcon :svg="modeIcon.video" :size="20" />
              <div>
                <MiText variant="subheadline" weight="semibold">{{ ev.where }}</MiText>
                <MiText variant="footnote" tone="label2">The join link unlocks 5 minutes before the start.</MiText>
              </div>
            </div>

            <div class="cd__section">
              <MiText variant="footnote" weight="semibold" tone="label2" as="h4">Your answer</MiText>
              <MiSegmented :model-value="rsvp[ev.id]" label="Your answer" :options="answers" @update:model-value="setRsvp" />
            </div>

            <MiList :header="ev.guests.length + 1 + ' guests'" class="cd__guests">
              <MiListItem v-for="g in guestsWithYou" :key="g.name" :title="g.name" :subtitle="g.role">
                <template #leading><MiAvatar :name="g.name" tone="auto" size="sm" decorative /></template>
                <template #trailing>
                  <span class="cd__status" :class="'is-' + g.status">{{ statusText[g.status] }}</span>
                </template>
              </MiListItem>
            </MiList>

            <div class="cd__remind">
              <div>
                <MiText id="event-drawer-remind" variant="subheadline" weight="medium">{{ ev.travel ? 'Ping me when it is time to leave' : 'Ping me 5 minutes before' }}</MiText>
                <MiText variant="footnote" tone="label2">{{ remind ? 'On · ' + (ev.travel ? leaveBy : minus(ev.start, 5)) : 'Off' }}</MiText>
              </div>
              <MiSwitch v-model="remind" aria-labelledby="event-drawer-remind" />
            </div>

            <div class="cd__notes">
              <MiText variant="footnote" weight="semibold" tone="label2" as="h4">Notes</MiText>
              <MiText variant="subheadline">{{ ev.notes }}</MiText>
            </div>
          </div>

          <template #footer>
            <div class="cd__foot">
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
.cd { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cd__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.cd__stage { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .cd__stage { grid-template-columns: minmax(0, 1fr) minmax(340px, 380px); align-items: start; gap: 20px; } }

.cd__page {
  position: relative; display: grid; gap: 14px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
/* Faux scrim: the page reads as "behind" the drawer without hiding it. */
.cd__page::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--mi-scrim); opacity: .35; pointer-events: none; }
.cd__page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.cd__eyebrow { margin: 0; text-transform: uppercase; letter-spacing: .06em; }
.cd__agenda { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
.cd__row {
  display: grid; grid-template-columns: 44px 3px minmax(0, 1fr) auto; align-items: center; gap: 12px; width: 100%; padding: 10px 12px;
  border: 0; border-radius: var(--mi-radius-m); background: transparent; font: inherit; color: inherit; text-align: start; cursor: pointer;
}
.cd__row:hover { background: var(--mi-fill4); }
.cd__row.is-on { background: var(--mi-p-tint); }
.cd__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.cd__row-time { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.cd__row-bar { align-self: stretch; border-radius: 2px; background: var(--c); }
.cd__row-text { display: grid; min-width: 0; }
.cd__row-title { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cd__row-where { font-size: 13px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.cd__body { display: grid; gap: 18px; }
.cd__trip { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); }
.cd__trip--call { grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: 12px; color: var(--mi-p-text); }
.cd__trip--call :deep(p) { color: var(--mi-label); }
.cd__trip-top { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 8px; }
.cd__leave { margin: 0; font-size: 34px; line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; color: var(--mi-p-text); }
.cd__trip-mode { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: var(--mi-label2); }
.cd__track { display: grid; gap: 3px; height: 8px; }
.cd__seg { border-radius: 4px; }
.cd__seg--free { background: var(--mi-fill2); }
.cd__seg--go { background: var(--mi-p); }
.cd__seg--buf { background: var(--mi-orange); }
.cd__track-legend { display: flex; justify-content: space-between; gap: 8px; margin-top: -4px; }

.cd__section { display: grid; gap: 8px; }
.cd__section h4, .cd__notes h4 { margin: 0; text-transform: uppercase; letter-spacing: .05em; font-size: 11px; }
.cd__status { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--mi-fill3); color: var(--mi-label2); }
.cd__status.is-going { background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
.cd__status.is-maybe { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.cd__status.is-no { background: color-mix(in srgb, var(--mi-red) 14%, transparent); color: var(--mi-red-t); }

.cd__remind { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.cd__notes { display: grid; gap: 6px; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.cd__foot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
</style>
