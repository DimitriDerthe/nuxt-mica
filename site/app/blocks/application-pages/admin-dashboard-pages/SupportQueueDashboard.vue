<template>
  <section class="sqd mi:@container mi:min-h-full mi:font-mi mi:text-label mi:bg-page" aria-labelledby="sqd-title">
    <div class="sqd__in mi:grid mi:min-h-full mi:@[960px]:grid-cols-[64px_minmax(0,_1fr)]">
      <!-- Shell: an icon rail on wide screens; the live status band carries the page header. -->
      <nav class="sqd__rail mi:hidden mi:@[960px]:flex mi:@[960px]:flex-col mi:@[960px]:items-center mi:@[960px]:gap-1.5 mi:@[960px]:py-4 mi:@[960px]:px-0 mi:@[960px]:bg-card mi:@[960px]:border-r mi:@[960px]:border-r-sep" aria-label="Support desk">
        <span class="sqd__logo mi:@[960px]:relative mi:@[960px]:w-7.5 mi:@[960px]:h-7.5 mi:@[960px]:mb-3.5 mi:@[960px]:rounded-[10px] mi:@[960px]:bg-p mi:@[960px]:after:content-[''] mi:@[960px]:after:absolute mi:@[960px]:after:top-2 mi:@[960px]:after:right-[7px] mi:@[960px]:after:bottom-[9px] mi:@[960px]:after:left-[7px] mi:@[960px]:after:rounded-[6px_6px_6px_2px] mi:@[960px]:after:border-2 mi:@[960px]:after:border-p-on" aria-hidden="true" />
        <a v-for="r in rail" :key="r.label" href="#" class="sqd__rail-link mi:@[960px]:grid mi:@[960px]:place-items-center mi:@[960px]:w-10 mi:@[960px]:h-10 mi:@[960px]:rounded-[12px] mi:@[960px]:text-label2 mi:@[960px]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:@[960px]:active:transform-[scale(.94)] mi:@[960px]:focus-visible:[outline:2px_solid_var(--mi-p)] mi:@[960px]:focus-visible:outline-offset-[1px]" :aria-label="r.label" :aria-current="r.current ? 'page' : undefined" @click.prevent>
          <MiIcon :name="r.icon" :size="20" />
        </a>
      </nav>

      <div class="sqd__main mi:grid mi:content-start mi:min-w-0">
        <header class="sqd__band mi:grid mi:gap-3.5 mi:p-4 mi:bg-card mi:border-b mi:border-b-sep mi:@[600px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[600px]:items-center mi:@[600px]:gap-6 mi:@[600px]:py-4.5 mi:@[600px]:px-5">
          <div class="sqd__band-title mi:flex mi:items-center mi:gap-2.5">
            <MiText id="sqd-title" as="h2" variant="title3" weight="bold">Queue</MiText>
            <span class="sqd__live mi:inline-flex mi:items-center mi:gap-1.5 mi:pt-[3px] mi:pr-[9px] mi:pb-[3px] mi:pl-2 mi:rounded-[999px] mi:text-[11px] mi:font-650 mi:tracking-[.04em] mi:uppercase mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)]"><i class="mi:[.sqd__live_&]:w-[7px] mi:[.sqd__live_&]:h-[7px] mi:[.sqd__live_&]:rounded-[50%]" aria-hidden="true" />Live</span>
          </div>
          <dl class="sqd__stats mi:grid mi:grid-cols-2 mi:gap-y-2.5 mi:gap-x-4 mi:m-0 mi:@[600px]:grid-cols-[repeat(4,_auto)] mi:@[600px]:justify-end mi:@[600px]:gap-0">
            <div class="mi:[.sqd__stats_&]:gap-0.5 mi:[.sqd__stats_&]:min-w-0 mi:@[600px]:[.sqd__stats_&]:py-0 mi:@[600px]:[.sqd__stats_&]:px-4.5 mi:@[600px]:[.sqd__stats_&]:border-l mi:@[600px]:[.sqd__stats_&]:border-l-sep mi:@[600px]:[.sqd__stats_&:last-child]:pr-0"><dt class="mi:[.sqd__stats_&]:text-[11.5px]">Open</dt><dd class="mi:[.sqd__stats_&]:m-0 mi:[.sqd__stats_&]:text-[19px] mi:[.sqd__stats_&]:tracking-[-.02em] mi:[.sqd__stats_&]:tabular-nums">{{ tickets.length + 38 }}</dd></div>
            <div class="mi:[.sqd__stats_&]:gap-0.5 mi:[.sqd__stats_&]:min-w-0 mi:@[600px]:[.sqd__stats_&]:py-0 mi:@[600px]:[.sqd__stats_&]:px-4.5 mi:@[600px]:[.sqd__stats_&]:border-l mi:@[600px]:[.sqd__stats_&]:border-l-sep mi:@[600px]:[.sqd__stats_&:last-child]:pr-0"><dt class="mi:[.sqd__stats_&]:text-[11.5px]">Unassigned</dt><dd class="mi:[.sqd__stats_&]:m-0 mi:[.sqd__stats_&]:text-[19px] mi:[.sqd__stats_&]:tracking-[-.02em] mi:[.sqd__stats_&]:tabular-nums">{{ unassigned }}</dd></div>
            <div class="mi:[.sqd__stats_&]:gap-0.5 mi:[.sqd__stats_&]:min-w-0 mi:@[600px]:[.sqd__stats_&]:py-0 mi:@[600px]:[.sqd__stats_&]:px-4.5 mi:@[600px]:[.sqd__stats_&]:border-l mi:@[600px]:[.sqd__stats_&]:border-l-sep mi:@[600px]:[.sqd__stats_&:last-child]:pr-0"><dt class="mi:[.sqd__stats_&]:text-[11.5px]">Median first reply</dt><dd class="mi:[.sqd__stats_&]:m-0 mi:[.sqd__stats_&]:text-[19px] mi:[.sqd__stats_&]:tracking-[-.02em] mi:[.sqd__stats_&]:tabular-nums">3m 40s</dd></div>
            <div class="mi:[.sqd__stats_&]:gap-0.5 mi:[.sqd__stats_&]:min-w-0 mi:@[600px]:[.sqd__stats_&]:py-0 mi:@[600px]:[.sqd__stats_&]:px-4.5 mi:@[600px]:[.sqd__stats_&]:border-l mi:@[600px]:[.sqd__stats_&]:border-l-sep mi:@[600px]:[.sqd__stats_&:last-child]:pr-0" :class="{ 'is-warn': atRisk > 0 }"><dt class="mi:[.sqd__stats_&]:text-[11.5px]">At risk, next 15 min</dt><dd class="mi:[.sqd__stats_&]:m-0 mi:[.sqd__stats_&]:text-[19px] mi:[.sqd__stats_&]:tracking-[-.02em] mi:[.sqd__stats_&]:tabular-nums mi:[.sqd__stats_.is-warn_dd&]:text-orange-t">{{ atRisk }}</dd></div>
          </dl>
        </header>

        <div class="sqd__body mi:grid mi:gap-4 mi:p-4 mi:min-w-0 mi:@[600px]:p-5 mi:@[1080px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[1080px]:items-start mi:@[1080px]:p-6 mi:@[1080px]:gap-5">
          <section class="sqd__queue mi:grid mi:gap-3 mi:min-w-0" aria-labelledby="sqd-queue">
            <div class="sqd__queue-head mi:grid mi:gap-0.5">
              <MiText id="sqd-queue" as="h3" variant="headline" weight="semibold">By priority</MiText>
              <MiText variant="caption" tone="label2">First-response SLA · urgent 15 min, high 1 h, normal 8 h</MiText>
            </div>
            <MiSegmented v-model="lane" class="sqd__lane-pick" label="Priority" :options="lanes.map(l => ({ value: l.id, label: `${l.label} ${byLane(l.id).length}` }))" />

            <div class="sqd__lanes mi:grid mi:gap-3 mi:@[720px]:grid-cols-3">
              <div v-for="l in lanes" :key="l.id" class="sqd__lane mi:hidden mi:content-start mi:gap-2.5 mi:min-w-0 mi:p-3 mi:rounded-xl mi:bg-fill4 mi:@[720px]:grid" :class="{ 'is-shown': lane === l.id }" role="region" :aria-labelledby="`sqd-lane-${l.id}`">
                <div class="sqd__lane-head mi:flex mi:items-center mi:gap-2 mi:py-0.5 mi:px-1">
                  <span class="sqd__lane-dot mi:w-2 mi:h-2 mi:rounded-[50%] mi:flex-[none]" :class="'is-' + l.id" aria-hidden="true" />
                  <MiText :id="`sqd-lane-${l.id}`" as="h4" variant="subheadline" weight="semibold">{{ l.label }}</MiText>
                  <span class="sqd__lane-count mi:text-[12px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ byLane(l.id).length }}</span>
                  <span class="sqd__lane-next mi:ml-auto mi:text-[11.5px] mi:text-label3 mi:whitespace-nowrap mi:tabular-nums">{{ nextDue(l.id) ? `next due ${clock(nextDue(l.id))}` : 'all breached' }}</span>
                </div>
                <ul class="sqd__cards mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
                  <li v-for="t in byLane(l.id)" :key="t.id" class="sqd__card mi:grid mi:gap-2 mi:py-3 mi:px-[13px] mi:rounded-lg mi:bg-card mi:shadow-1 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:[&.is-mine]:shadow-[var(--mi-sh1),_inset_3px_0_0_var(--mi-p)]" :class="{ 'is-mine': t.owner === ME }">
                    <div class="sqd__card-top mi:flex mi:items-center mi:justify-between mi:gap-2">
                      <MiText variant="caption2" tone="label3" tabular>{{ t.id }} · {{ t.channel }}</MiText>
                      <span
                        class="sqd__sla mi:relative mi:inline-flex mi:items-center mi:gap-1 mi:pt-[3px] mi:px-2 mi:pb-[5px] mi:rounded-[7px] mi:text-[12px] mi:font-650 mi:leading-[1.1] mi:tabular-nums mi:whitespace-nowrap mi:text-label2 mi:bg-fill3 mi:overflow-hidden" :class="'is-' + state(t)" role="timer"
                        :aria-label="state(t) === 'breached' ? `SLA breached ${clock(t)} ago` : `${clock(t)} left on SLA`"
                      >
                        <MiIcon class="mi:[.sqd__stats_.is-warn_dd&]:text-orange-t mi:[.sqd__sla_b&]:absolute mi:[.sqd__sla_b&]:left-1.5 mi:[.sqd__sla_b&]:right-1.5 mi:[.sqd__sla_b&]:bottom-0.5" v-if="state(t) === 'breached'" name="exclamation-circle" :size="12" />
                        {{ state(t) === 'breached' ? '+' : '' }}{{ clock(t) }}
                        <b class="mi:[.sqd__sla_b&]:absolute mi:[.sqd__sla_b&]:left-1.5 mi:[.sqd__sla_b&]:right-1.5 mi:[.sqd__sla_b&]:bottom-0.5" aria-hidden="true"><i class="mi:[.sqd__sla_b_&]:origin-left mi:[.sqd__sla_b_&]:[transition:transform_1s_linear]" :style="{ transform: `scaleX(${ratio(t)})` }" /></b>
                      </span>
                    </div>
                    <MiText variant="footnote" weight="semibold" class="sqd__subject">{{ t.subject }}</MiText>
                    <div class="sqd__card-foot mi:flex mi:items-center mi:justify-between mi:gap-2 mi:min-h-6.5">
                      <MiText variant="caption" tone="label2" :lines="1">{{ t.customer }}</MiText>
                      <MiAvatar v-if="t.owner" :name="t.owner" size="xs" tone="auto" />
                      <MiButton v-else variant="tinted" size="mini" :aria-label="`Take ${t.id}`" @click="t.owner = ME">Take</MiButton>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <aside class="sqd__side mi:grid mi:gap-4 mi:content-start mi:min-w-0 mi:@[720px]:grid-cols-2 mi:@[1080px]:grid-cols-[minmax(0,_1fr)]">
            <section class="sqd__panel mi:grid mi:content-start mi:gap-3 mi:min-w-0 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="sqd-agents">
              <div class="sqd__panel-head mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                <MiText id="sqd-agents" as="h3" variant="headline" weight="semibold">Agents</MiText>
                <MiText variant="caption" tone="label2">{{ agents.filter(a => a.presence === 'online').length }} available</MiText>
              </div>
              <ul class="sqd__agents mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]">
                <li class="mi:[.sqd__agents_li&]:grid-cols-[auto_minmax(0,_1fr)_72px] mi:[.sqd__agents_li&]:gap-2.5" v-for="a in agentRows" :key="a.name">
                  <span class="sqd__who mi:relative mi:block">
                    <MiAvatar class="mi:[.sqd__agents_li&]:grid-cols-[auto_minmax(0,_1fr)_72px] mi:[.sqd__agents_li&]:gap-2.5" :name="a.name" size="sm" tone="auto" decorative />
                    <i class="sqd__presence mi:absolute mi:-right-px mi:-bottom-px mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:bg-label3" :class="'is-' + a.presence" />
                  </span>
                  <span class="sqd__agent-text mi:grid mi:min-w-0">
                    <span class="sqd__agent-name mi:text-[13.5px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ a.name }}<em class="mi:[.sqd__agent-name_&]:not-italic" v-if="a.name === ME"> (you)</em></span>
                    <span class="sqd__agent-sub mi:text-[12px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ a.note }}</span>
                  </span>
                  <span class="sqd__load mi:grid mi:gap-1 mi:justify-items-end" role="meter" :aria-label="`${a.name} load`" :aria-valuenow="a.load" aria-valuemin="0" :aria-valuemax="CAP" :aria-valuetext="`${a.load} of ${CAP} conversations`">
                    <span class="sqd__load-num mi:text-[11.5px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ a.load }}/{{ CAP }}</span>
                    <span class="sqd__load-track mi:w-full mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden"><i class="mi:[.sqd__load-track_&]:origin-left mi:[.sqd__load-track_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="loadTone(a.load)" :style="{ transform: `scaleX(${a.load / CAP})` }" /></span>
                  </span>
                </li>
              </ul>
            </section>

            <section class="sqd__panel mi:grid mi:content-start mi:gap-3 mi:min-w-0 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="sqd-csat">
              <div class="sqd__panel-head mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                <MiText id="sqd-csat" as="h3" variant="headline" weight="semibold">CSAT</MiText>
                <MiText variant="caption" tone="label2">Last 14 days</MiText>
              </div>
              <div class="sqd__csat-top mi:flex mi:items-center mi:gap-2.5">
                <span class="sqd__csat-big mi:text-[32px] mi:font-bold mi:tracking-[-.04em] mi:leading-none mi:tabular-nums">94.2%</span>
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
.sqd__live i { background: var(--mi-green); animation: sqd-pulse 2s var(--mi-ease-in-out) infinite; }
@keyframes sqd-pulse { 50% { opacity: .35; transform: scale(.8); } }
.sqd__stats div { display: grid; }
.sqd__stats dt { color: var(--mi-label2); }
.sqd__stats dd { font-weight: 700; }
.sqd__lane.is-shown { display: grid; }
.sqd__lane-dot.is-urgent { background: var(--mi-red); }
.sqd__lane-dot.is-high { background: var(--mi-orange); }
.sqd__lane-dot.is-normal { background: var(--mi-label3); }
.sqd__subject { text-wrap: pretty; }
.sqd__sla b { height: 2px; border-radius: 1px; background: color-mix(in srgb, currentColor 18%, transparent); overflow: hidden; }
.sqd__sla b i { display: block; height: 100%; background: currentColor; }
.sqd__sla.is-soon { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.sqd__sla.is-critical { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.sqd__sla.is-critical b i { animation: sqd-blink 1s steps(2, jump-none) infinite; }
.sqd__sla.is-breached { color: var(--mi-p-on); background: var(--mi-red); }
.sqd__sla.is-breached b { display: none; }
@keyframes sqd-blink { 50% { opacity: .35; } }
@media (prefers-reduced-motion: reduce) { .sqd__live i, .sqd__sla.is-critical b i { animation: none; } }
.sqd__agents li { display: grid; align-items: center; }
.sqd__presence.is-online { background: var(--mi-green); }
.sqd__presence.is-busy { background: var(--mi-red); }
.sqd__presence.is-away { background: var(--mi-orange); }
.sqd__agent-name em { font-weight: 400; color: var(--mi-label2); }
.sqd__load-track i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); }
.sqd__load-track i.is-high { background: var(--mi-orange); }
.sqd__load-track i.is-full { background: var(--mi-red); }
@container (min-width: 720px) {
  .sqd__lane-pick { display: none; }
  .sqd__lane.is-shown { display: grid; }
}
@container (min-width: 960px) {
  .sqd__rail-link:hover { color: var(--mi-label); background: var(--mi-fill4); }
  .sqd__rail-link[aria-current="page"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
}
</style>
