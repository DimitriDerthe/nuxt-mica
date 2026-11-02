<template>
  <section class="sqd" aria-labelledby="sqd-title">
    <div class="sqd__in">
      <!-- Shell: an icon rail on wide screens; the live status band carries the page header. -->
      <nav class="sqd__rail" aria-label="Support desk">
        <span class="sqd__logo" aria-hidden="true" />
        <a v-for="r in rail" :key="r.label" href="#" class="sqd__rail-link" :aria-label="r.label" :aria-current="r.current ? 'page' : undefined" @click.prevent>
          <MiIcon :name="r.icon" :size="20" />
        </a>
      </nav>

      <div class="sqd__main">
        <header class="sqd__band">
          <div class="sqd__band-title">
            <MiText id="sqd-title" as="h2" variant="title3" weight="bold">Queue</MiText>
            <span class="sqd__live"><i aria-hidden="true" />Live</span>
          </div>
          <dl class="sqd__stats">
            <div><dt>Open</dt><dd>{{ tickets.length + 38 }}</dd></div>
            <div><dt>Unassigned</dt><dd>{{ unassigned }}</dd></div>
            <div><dt>Median first reply</dt><dd>3m 40s</dd></div>
            <div :class="{ 'is-warn': atRisk > 0 }"><dt>At risk, next 15 min</dt><dd>{{ atRisk }}</dd></div>
          </dl>
        </header>

        <div class="sqd__body">
          <section class="sqd__queue" aria-labelledby="sqd-queue">
            <div class="sqd__queue-head">
              <MiText id="sqd-queue" as="h3" variant="headline" weight="semibold">By priority</MiText>
              <MiText variant="caption" tone="label2">First-response SLA · urgent 15 min, high 1 h, normal 8 h</MiText>
            </div>
            <MiSegmented v-model="lane" class="sqd__lane-pick" label="Priority" :options="lanes.map(l => ({ value: l.id, label: `${l.label} ${byLane(l.id).length}` }))" />

            <div class="sqd__lanes">
              <div v-for="l in lanes" :key="l.id" class="sqd__lane" :class="{ 'is-shown': lane === l.id }" role="region" :aria-labelledby="`sqd-lane-${l.id}`">
                <div class="sqd__lane-head">
                  <span class="sqd__lane-dot" :class="'is-' + l.id" aria-hidden="true" />
                  <MiText :id="`sqd-lane-${l.id}`" as="h4" variant="subheadline" weight="semibold">{{ l.label }}</MiText>
                  <span class="sqd__lane-count">{{ byLane(l.id).length }}</span>
                  <span class="sqd__lane-next">{{ nextDue(l.id) ? `next due ${clock(nextDue(l.id))}` : 'all breached' }}</span>
                </div>
                <ul class="sqd__cards">
                  <li v-for="t in byLane(l.id)" :key="t.id" class="sqd__card" :class="{ 'is-mine': t.owner === ME }">
                    <div class="sqd__card-top">
                      <MiText variant="caption2" tone="label3" tabular>{{ t.id }} · {{ t.channel }}</MiText>
                      <span
                        class="sqd__sla" :class="'is-' + state(t)" role="timer"
                        :aria-label="state(t) === 'breached' ? `SLA breached ${clock(t)} ago` : `${clock(t)} left on SLA`"
                      >
                        <MiIcon v-if="state(t) === 'breached'" name="exclamation-circle" :size="12" />
                        {{ state(t) === 'breached' ? '+' : '' }}{{ clock(t) }}
                        <b aria-hidden="true"><i :style="{ transform: `scaleX(${ratio(t)})` }" /></b>
                      </span>
                    </div>
                    <MiText variant="footnote" weight="semibold" class="sqd__subject">{{ t.subject }}</MiText>
                    <div class="sqd__card-foot">
                      <MiText variant="caption" tone="label2" :lines="1">{{ t.customer }}</MiText>
                      <MiAvatar v-if="t.owner" :name="t.owner" size="xs" tone="auto" />
                      <MiButton v-else variant="tinted" size="mini" :aria-label="`Take ${t.id}`" @click="t.owner = ME">Take</MiButton>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <aside class="sqd__side">
            <section class="sqd__panel" aria-labelledby="sqd-agents">
              <div class="sqd__panel-head">
                <MiText id="sqd-agents" as="h3" variant="headline" weight="semibold">Agents</MiText>
                <MiText variant="caption" tone="label2">{{ agents.filter(a => a.presence === 'online').length }} available</MiText>
              </div>
              <ul class="sqd__agents">
                <li v-for="a in agentRows" :key="a.name">
                  <span class="sqd__who">
                    <MiAvatar :name="a.name" size="sm" tone="auto" decorative />
                    <i class="sqd__presence" :class="'is-' + a.presence" />
                  </span>
                  <span class="sqd__agent-text">
                    <span class="sqd__agent-name">{{ a.name }}<em v-if="a.name === ME"> (you)</em></span>
                    <span class="sqd__agent-sub">{{ a.note }}</span>
                  </span>
                  <span class="sqd__load" role="meter" :aria-label="`${a.name} load`" :aria-valuenow="a.load" aria-valuemin="0" :aria-valuemax="CAP" :aria-valuetext="`${a.load} of ${CAP} conversations`">
                    <span class="sqd__load-num">{{ a.load }}/{{ CAP }}</span>
                    <span class="sqd__load-track"><i :class="loadTone(a.load)" :style="{ transform: `scaleX(${a.load / CAP})` }" /></span>
                  </span>
                </li>
              </ul>
            </section>

            <section class="sqd__panel" aria-labelledby="sqd-csat">
              <div class="sqd__panel-head">
                <MiText id="sqd-csat" as="h3" variant="headline" weight="semibold">CSAT</MiText>
                <MiText variant="caption" tone="label2">Last 14 days</MiText>
              </div>
              <div class="sqd__csat-top">
                <span class="sqd__csat-big">94.2%</span>
                <MiBadge tone="success" label="+1.8 pt" />
              </div>
              <MiText variant="caption" tone="label2" tabular>412 rated · 25 unhappy · 31% response rate</MiText>
              <MiLineChart
                :categories="csatDays" :series="[{ name: 'CSAT', data: csat }]" unit="%" :min="88" :max="98" :ticks="2" :height="120"
                :card="false" :toolbar="false" :toggle="false" :end-labels="false" aria-label="CSAT over the last 14 days, from 91.4% to 94.2%"
              />
            </section>
          </aside>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

type Lane = 'urgent' | 'high' | 'normal'
interface Ticket { id: string, lane: Lane, subject: string, customer: string, channel: string, left: number, owner?: string }

const ME = 'Maya Okonkwo'
const CAP = 6
const WINDOW: Record<Lane, number> = { urgent: 900, high: 3600, normal: 28800 }

const rail = [
  { label: 'Queue', icon: 'tray' as const, current: true },
  { label: 'Conversations', icon: 'chat' as const },
  { label: 'Customers', icon: 'people' as const },
  { label: 'Reports', icon: 'grid' as const },
  { label: 'Settings', icon: 'settings' as const }
]
const lanes = [{ id: 'urgent' as const, label: 'Urgent' }, { id: 'high' as const, label: 'High' }, { id: 'normal' as const, label: 'Normal' }]
const lane = ref<string | number | null>('urgent')

// `left` is the SLA time remaining in seconds when the page opened; sample data.
const tickets = reactive<Ticket[]>([
  { id: 'PC-48201', lane: 'urgent', subject: 'Locked out after a password reset, payroll due today', customer: 'Mei Takahashi', channel: 'Phone', left: -38, owner: 'Jakub Nowak' },
  { id: 'PC-48213', lane: 'urgent', subject: 'Card declined abroad, stranded at Lisbon airport', customer: 'Ana Ribeiro', channel: 'Chat', left: 154 },
  { id: 'PC-48209', lane: 'urgent', subject: 'Charged twice for a €1,240 rent transfer', customer: 'Tomás Lindqvist', channel: 'Email', left: 432 },
  { id: 'PC-48188', lane: 'high', subject: 'Payout to N26 stuck in pending since Friday', customer: 'Oskar Brandt', channel: 'Email', left: 590 },
  { id: 'PC-48176', lane: 'high', subject: 'ID check rejected three times, passport is valid', customer: 'Leila Haddad', channel: 'Chat', left: 1270, owner: 'Inès Moreau' },
  { id: 'PC-48170', lane: 'high', subject: 'Freeze card button is greyed out in the app', customer: 'Dmitri Volkov', channel: 'Chat', left: 2410 },
  { id: 'PC-48152', lane: 'normal', subject: 'Export statements as CSV for my accountant', customer: 'Priya Raman', channel: 'Email', left: 15120 },
  { id: 'PC-48149', lane: 'normal', subject: 'Update billing address after moving to Ghent', customer: 'Joris De Smet', channel: 'Email', left: 24000, owner: 'Sofía Herrera' },
  { id: 'PC-48141', lane: 'normal', subject: 'Add a virtual card for streaming subscriptions', customer: 'Hannah Clarke', channel: 'Chat', left: 25500 }
])

// One clock for the whole page: a single interval, started on mount and cleared on unmount.
const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { elapsed.value++ }, 1000) })
onBeforeUnmount(() => clearInterval(timer))

const remaining = (t: Ticket) => t.left - elapsed.value
const byLane = (id: Lane) => tickets.filter(t => t.lane === id).sort((a, b) => a.left - b.left)
function state(t: Ticket) {
  const s = remaining(t)
  return s < 0 ? 'breached' : s < 300 ? 'critical' : s < 900 ? 'soon' : 'ok'
}
const ratio = (t: Ticket) => Math.max(0, Math.min(1, remaining(t) / WINDOW[t.lane]))
function clock(t?: Ticket) {
  if (!t) return '—'
  const s = Math.abs(remaining(t))
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
const nextDue = (id: Lane) => byLane(id).find(t => remaining(t) >= 0)
const unassigned = computed(() => tickets.filter(t => !t.owner).length + 4)
const atRisk = computed(() => tickets.filter(t => { const s = remaining(t); return s >= 0 && s < 900 }).length)

const agents = [
  { name: ME, presence: 'online', base: 3, note: 'Billing, cards' },
  { name: 'Inès Moreau', presence: 'online', base: 4, note: 'Identity checks' },
  { name: 'Jakub Nowak', presence: 'busy', base: 5, note: 'On a call · 12 min' },
  { name: 'Sofía Herrera', presence: 'online', base: 1, note: 'Accounts, Spanish' },
  { name: 'Arjun Mehta', presence: 'away', base: 4, note: 'Back at 14:30' },
  { name: 'Lena Vogel', presence: 'offline', base: 0, note: 'Shift starts 16:00' }
] as const
// Loads follow the queue: taking a ticket adds it to your bar.
const agentRows = computed(() => agents.map(a => ({ ...a, load: Math.min(CAP, a.base + tickets.filter(t => t.owner === a.name).length) })))
const loadTone = (n: number) => (n >= CAP ? 'is-full' : n / CAP >= 0.8 ? 'is-high' : '')

const csatDays = ['Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29', 'Oct 30', 'Oct 31', 'Nov 1', 'Nov 2']
const csat = [91.4, 92.1, 90.8, 92.6, 93.0, 92.2, 93.4, 93.1, 94.0, 92.9, 93.8, 94.5, 93.9, 94.2]
</script>

<style scoped>
.sqd { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.sqd__in { display: grid; min-height: 100%; }

.sqd__rail { display: none; }
.sqd__main { display: grid; align-content: start; min-width: 0; }

/* Live band */
.sqd__band { display: grid; gap: 14px; padding: 16px; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); }
.sqd__band-title { display: flex; align-items: center; gap: 10px; }
.sqd__live { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.sqd__live i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); animation: sqd-pulse 2s var(--mi-ease-in-out) infinite; }
@keyframes sqd-pulse { 50% { opacity: .35; transform: scale(.8); } }
.sqd__stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; margin: 0; }
.sqd__stats div { display: grid; gap: 2px; min-width: 0; }
.sqd__stats dt { font-size: 11.5px; color: var(--mi-label2); }
.sqd__stats dd { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.sqd__stats .is-warn dd { color: var(--mi-orange-t); }

.sqd__body { display: grid; gap: 16px; padding: 16px; min-width: 0; }

/* Queue */
.sqd__queue { display: grid; gap: 12px; min-width: 0; }
.sqd__queue-head { display: grid; gap: 2px; }
.sqd__lanes { display: grid; gap: 12px; }
.sqd__lane { display: none; align-content: start; gap: 10px; min-width: 0; padding: 12px; border-radius: var(--mi-radius-xl); background: var(--mi-fill4); }
.sqd__lane.is-shown { display: grid; }
.sqd__lane-head { display: flex; align-items: center; gap: 8px; padding: 2px 4px; }
.sqd__lane-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.sqd__lane-dot.is-urgent { background: var(--mi-red); }
.sqd__lane-dot.is-high { background: var(--mi-orange); }
.sqd__lane-dot.is-normal { background: var(--mi-label3); }
.sqd__lane-count { font-size: 12px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.sqd__lane-next { margin-left: auto; font-size: 11.5px; color: var(--mi-label3); white-space: nowrap; font-variant-numeric: tabular-nums; }
.sqd__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.sqd__card { display: grid; gap: 8px; padding: 12px 13px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); transition: transform var(--mi-dur-2) var(--mi-ease); }
.sqd__card:hover { transform: translateY(-1px); }
.sqd__card.is-mine { box-shadow: var(--mi-sh1), inset 3px 0 0 var(--mi-p); }
.sqd__card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sqd__subject { text-wrap: pretty; }
.sqd__card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 26px; }

/* SLA chip: a countdown with a draining hairline underneath. */
.sqd__sla { position: relative; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px 5px; border-radius: 7px; font-size: 12px; font-weight: 650; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--mi-label2); background: var(--mi-fill3); overflow: hidden; }
.sqd__sla b { position: absolute; left: 6px; right: 6px; bottom: 2px; height: 2px; border-radius: 1px; background: color-mix(in srgb, currentColor 18%, transparent); overflow: hidden; }
.sqd__sla b i { display: block; height: 100%; background: currentColor; transform-origin: left; transition: transform 1s linear; }
.sqd__sla.is-soon { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.sqd__sla.is-critical { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.sqd__sla.is-critical b i { animation: sqd-blink 1s steps(2, jump-none) infinite; }
.sqd__sla.is-breached { color: var(--mi-p-on); background: var(--mi-red); }
.sqd__sla.is-breached b { display: none; }
@keyframes sqd-blink { 50% { opacity: .35; } }
@media (prefers-reduced-motion: reduce) { .sqd__live i, .sqd__sla.is-critical b i { animation: none; } }

/* Side panels */
.sqd__side { display: grid; gap: 16px; align-content: start; min-width: 0; }
.sqd__panel { display: grid; align-content: start; gap: 12px; min-width: 0; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sqd__panel-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.sqd__agents { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.sqd__agents li { display: grid; grid-template-columns: auto minmax(0, 1fr) 72px; align-items: center; gap: 10px; }
.sqd__who { position: relative; display: block; }
.sqd__presence { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 2px var(--mi-card); background: var(--mi-label3); }
.sqd__presence.is-online { background: var(--mi-green); }
.sqd__presence.is-busy { background: var(--mi-red); }
.sqd__presence.is-away { background: var(--mi-orange); }
.sqd__agent-text { display: grid; min-width: 0; }
.sqd__agent-name { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sqd__agent-name em { font-style: normal; font-weight: 400; color: var(--mi-label2); }
.sqd__agent-sub { font-size: 12px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sqd__load { display: grid; gap: 4px; justify-items: end; }
.sqd__load-num { font-size: 11.5px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.sqd__load-track { width: 100%; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.sqd__load-track i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.sqd__load-track i.is-high { background: var(--mi-orange); }
.sqd__load-track i.is-full { background: var(--mi-red); }
.sqd__csat-top { display: flex; align-items: center; gap: 10px; }
.sqd__csat-big { font-size: 32px; font-weight: 700; letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums; }

@container (min-width: 600px) {
  .sqd__band { grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 24px; padding: 18px 20px; }
  .sqd__stats { grid-template-columns: repeat(4, auto); justify-content: end; gap: 0; }
  .sqd__stats div { padding: 0 18px; border-left: 1px solid var(--mi-sep); }
  .sqd__stats div:last-child { padding-right: 0; }
  .sqd__body { padding: 20px; }
}
@container (min-width: 720px) {
  .sqd__lane-pick { display: none; }
  .sqd__lanes { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .sqd__lane, .sqd__lane.is-shown { display: grid; }
  .sqd__side { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (min-width: 960px) {
  .sqd__in { grid-template-columns: 64px minmax(0, 1fr); }
  .sqd__rail { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 0; background: var(--mi-card); border-right: 1px solid var(--mi-sep); }
  .sqd__logo { position: relative; width: 30px; height: 30px; margin-bottom: 14px; border-radius: 10px; background: var(--mi-p); }
  .sqd__logo::after { content: ""; position: absolute; inset: 8px 7px 9px; border-radius: 6px 6px 6px 2px; border: 2px solid var(--mi-p-on); }
  .sqd__rail-link { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; color: var(--mi-label2); transition: transform var(--mi-dur-2) var(--mi-ease); }
  .sqd__rail-link:hover { color: var(--mi-label); background: var(--mi-fill4); }
  .sqd__rail-link:active { transform: scale(.94); }
  .sqd__rail-link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
  .sqd__rail-link[aria-current="page"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
}
@container (min-width: 1080px) {
  .sqd__body { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; padding: 24px; gap: 20px; }
  .sqd__side { grid-template-columns: minmax(0, 1fr); }
}
</style>
