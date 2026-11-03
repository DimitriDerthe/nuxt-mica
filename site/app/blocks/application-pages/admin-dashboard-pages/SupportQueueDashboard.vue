<template>
  <section class="mi:@container mi:min-h-full mi:font-mi mi:text-label mi:bg-page" aria-labelledby="sqd-title">
    <div class="mi:grid mi:min-h-full mi:@[960px]:grid-cols-[64px_minmax(0,_1fr)]">
      <!-- Shell: an icon rail on wide screens; the live status band carries the page header. -->
      <nav class="mi:hidden mi:@[960px]:flex mi:@[960px]:flex-col mi:@[960px]:items-center mi:@[960px]:gap-1.5 mi:@[960px]:py-4 mi:@[960px]:px-0 mi:@[960px]:bg-card mi:@[960px]:border-r mi:@[960px]:border-r-sep" aria-label="Support desk">
        <span class="mi:@[960px]:relative mi:@[960px]:w-7.5 mi:@[960px]:h-7.5 mi:@[960px]:mb-3.5 mi:@[960px]:rounded-[10px] mi:@[960px]:bg-p mi:@[960px]:after:content-[''] mi:@[960px]:after:absolute mi:@[960px]:after:top-2 mi:@[960px]:after:right-[7px] mi:@[960px]:after:bottom-[9px] mi:@[960px]:after:left-[7px] mi:@[960px]:after:rounded-[6px_6px_6px_2px] mi:@[960px]:after:border-2 mi:@[960px]:after:border-p-on" aria-hidden="true" />
        <a v-for="r in rail" :key="r.label" href="#" class="mi:@[960px]:grid mi:@[960px]:place-items-center mi:@[960px]:w-10 mi:@[960px]:h-10 mi:@[960px]:rounded-[12px] mi:@[960px]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:@[960px]:active:transform-[scale(.94)] mi:@[960px]:focus-visible:[outline:2px_solid_var(--mi-p)] mi:@[960px]:focus-visible:outline-offset-[1px]" :class="r.current ? 'mi:@[960px]:text-p-text mi:@[960px]:bg-p-tint' : 'mi:@[960px]:text-label2 mi:@[960px]:hover:text-label mi:@[960px]:hover:bg-fill4'" :aria-label="r.label" :aria-current="r.current ? 'page' : undefined" @click.prevent>
          <MiIcon :name="r.icon" :size="20" />
        </a>
      </nav>

      <div class="mi:grid mi:content-start mi:min-w-0">
        <header class="mi:grid mi:gap-3.5 mi:p-4 mi:bg-card mi:border-b mi:border-b-sep mi:@[600px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[600px]:items-center mi:@[600px]:gap-6 mi:@[600px]:py-4.5 mi:@[600px]:px-5">
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <MiText id="sqd-title" as="h2" variant="title3" weight="bold">Queue</MiText>
            <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:pt-[3px] mi:pr-[9px] mi:pb-[3px] mi:pl-2 mi:rounded-[999px] mi:text-[11px] mi:font-[650] mi:tracking-[.04em] mi:uppercase mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)]"><i class="mi:bg-green mi:[--mi-beat:.8] mi:[--mi-beat-o:.35] mi:animate-[beat_2s_var(--mi-ease-in-out)_infinite] mi:motion-reduce:animate-none mi:w-[7px] mi:h-[7px] mi:rounded-[50%]" aria-hidden="true" />Live</span>
          </div>
          <dl class="mi:grid mi:grid-cols-2 mi:gap-y-2.5 mi:gap-x-4 mi:m-0 mi:@[600px]:grid-cols-[repeat(4,_auto)] mi:@[600px]:justify-end mi:@[600px]:gap-0">
            <div class="mi:grid mi:gap-0.5 mi:min-w-0 mi:@[600px]:py-0 mi:@[600px]:px-4.5 mi:@[600px]:border-l mi:@[600px]:border-l-sep mi:@[600px]:last:pr-0"><dt class="mi:text-label2 mi:text-[11.5px]">Open</dt><dd class="mi:font-bold mi:m-0 mi:text-[19px] mi:tracking-[-.02em] mi:tabular-nums">{{ tickets.length + 38 }}</dd></div>
            <div class="mi:grid mi:gap-0.5 mi:min-w-0 mi:@[600px]:py-0 mi:@[600px]:px-4.5 mi:@[600px]:border-l mi:@[600px]:border-l-sep mi:@[600px]:last:pr-0"><dt class="mi:text-label2 mi:text-[11.5px]">Unassigned</dt><dd class="mi:font-bold mi:m-0 mi:text-[19px] mi:tracking-[-.02em] mi:tabular-nums">{{ unassigned }}</dd></div>
            <div class="mi:grid mi:gap-0.5 mi:min-w-0 mi:@[600px]:py-0 mi:@[600px]:px-4.5 mi:@[600px]:border-l mi:@[600px]:border-l-sep mi:@[600px]:last:pr-0"><dt class="mi:text-label2 mi:text-[11.5px]">Median first reply</dt><dd class="mi:font-bold mi:m-0 mi:text-[19px] mi:tracking-[-.02em] mi:tabular-nums">3m 40s</dd></div>
            <div class="mi:grid mi:gap-0.5 mi:min-w-0 mi:@[600px]:py-0 mi:@[600px]:px-4.5 mi:@[600px]:border-l mi:@[600px]:border-l-sep mi:@[600px]:last:pr-0"><dt class="mi:text-label2 mi:text-[11.5px]">At risk, next 15 min</dt><dd class="mi:font-bold mi:m-0 mi:text-[19px] mi:tracking-[-.02em] mi:tabular-nums" :class="atRisk > 0 ? 'mi:text-orange-t' : ''">{{ atRisk }}</dd></div>
          </dl>
        </header>

        <div class="mi:grid mi:gap-4 mi:p-4 mi:min-w-0 mi:@[600px]:p-5 mi:@[1080px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[1080px]:items-start mi:@[1080px]:p-6 mi:@[1080px]:gap-5">
          <section class="mi:grid mi:gap-3 mi:min-w-0" aria-labelledby="sqd-queue">
            <div class="mi:grid mi:gap-0.5">
              <MiText id="sqd-queue" as="h3" variant="headline" weight="semibold">By priority</MiText>
              <MiText variant="caption" tone="label2">First-response SLA · urgent 15 min, high 1 h, normal 8 h</MiText>
            </div>
            <MiSegmented v-model="lane" class="mi:@[720px]:hidden!" label="Priority" :options="lanes.map(l => ({ value: l.id, label: `${l.label} ${byLane(l.id).length}` }))" />

            <div class="mi:grid mi:gap-3 mi:@[720px]:grid-cols-3">
              <div v-for="l in lanes" :key="l.id" class="mi:content-start mi:gap-2.5 mi:min-w-0 mi:p-3 mi:rounded-xl mi:bg-fill4 mi:@[720px]:grid" :class="lane === l.id ? 'mi:grid' : 'mi:hidden'" role="region" :aria-labelledby="`sqd-lane-${l.id}`">
                <div class="mi:flex mi:items-center mi:gap-2 mi:py-0.5 mi:px-1">
                  <span class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:flex-[none]" :class="[l.id === 'urgent' ? 'mi:bg-red' : l.id === 'high' ? 'mi:bg-orange' : 'mi:bg-label3']" aria-hidden="true" />
                  <MiText :id="`sqd-lane-${l.id}`" as="h4" variant="subheadline" weight="semibold">{{ l.label }}</MiText>
                  <span class="mi:text-[12px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ byLane(l.id).length }}</span>
                  <span class="mi:ml-auto mi:text-[11.5px] mi:text-label3 mi:whitespace-nowrap mi:tabular-nums">{{ nextDue(l.id) ? `next due ${clock(nextDue(l.id))}` : 'all breached' }}</span>
                </div>
                <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
                  <li v-for="t in byLane(l.id)" :key="t.id" class="mi:grid mi:gap-2 mi:py-3 mi:px-[13px] mi:rounded-lg mi:bg-card mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)]" :class="t.owner === ME ? 'mi:shadow-[var(--mi-sh1),_inset_3px_0_0_var(--mi-p)]' : 'mi:shadow-1'">
                    <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
                      <MiText variant="caption2" tone="label3" tabular>{{ t.id }} · {{ t.channel }}</MiText>
                      <span
                        class="mi:relative mi:inline-flex mi:items-center mi:gap-1 mi:pt-[3px] mi:px-2 mi:pb-[5px] mi:rounded-[7px] mi:text-[12px] mi:font-[650] mi:leading-[1.1] mi:tabular-nums mi:whitespace-nowrap mi:overflow-hidden" :class="[state(t) === 'soon' ? 'mi:text-orange-t mi:bg-orange/14' : state(t) === 'critical' ? 'mi:text-red-t mi:bg-red/14' : state(t) === 'breached' ? 'mi:text-p-on mi:bg-red' : 'mi:text-label2 mi:bg-fill3']" role="timer"
                        :aria-label="state(t) === 'breached' ? `SLA breached ${clock(t)} ago` : `${clock(t)} left on SLA`"
                      >
                        <MiIcon v-if="state(t) === 'breached'" name="exclamation-circle" :size="12" />
                        {{ state(t) === 'breached' ? '+' : '' }}{{ clock(t) }}
                        <b class="mi:h-0.5 mi:rounded-[1px] mi:bg-[color:color-mix(in_srgb,_currentColor_18%,_transparent)] mi:overflow-hidden mi:absolute mi:left-1.5 mi:right-1.5 mi:bottom-0.5" :class="state(t) === 'breached' ? 'mi:hidden' : ''" aria-hidden="true"><i class="mi:block mi:h-full mi:origin-left mi:[transition:transform_1s_linear] mi:bg-current mi:[--mi-blink:.35] mi:motion-reduce:animate-none" :class="state(t) === 'critical' ? 'mi:animate-[blink_1s_steps(2,jump-none)_infinite]' : ''" :style="{ transform: `scaleX(${ratio(t)})` }" /></b>
                      </span>
                    </div>
                    <MiText variant="footnote" weight="semibold" class="mi:text-pretty!">{{ t.subject }}</MiText>
                    <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:min-h-6.5">
                      <MiText variant="caption" tone="label2" :lines="1">{{ t.customer }}</MiText>
                      <MiAvatar v-if="t.owner" :name="t.owner" size="xs" tone="auto" />
                      <MiButton v-else variant="tinted" size="mini" :aria-label="`Take ${t.id}`" @click="t.owner = ME">Take</MiButton>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <aside class="mi:grid mi:gap-4 mi:content-start mi:min-w-0 mi:@[720px]:grid-cols-2 mi:@[1080px]:grid-cols-[minmax(0,_1fr)]">
            <section class="mi:grid mi:content-start mi:gap-3 mi:min-w-0 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="sqd-agents">
              <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                <MiText id="sqd-agents" as="h3" variant="headline" weight="semibold">Agents</MiText>
                <MiText variant="caption" tone="label2">{{ agents.filter(a => a.presence === 'online').length }} available</MiText>
              </div>
              <ul class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]">
                <li class="mi:grid mi:items-center mi:grid-cols-[auto_minmax(0,_1fr)_72px] mi:gap-2.5" v-for="a in agentRows" :key="a.name">
                  <span class="mi:relative mi:block">
                    <MiAvatar :name="a.name" size="sm" tone="auto" decorative />
                    <i class="mi:absolute mi:-right-px mi:-bottom-px mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)]" :class="[a.presence === 'online' ? 'mi:bg-green' : a.presence === 'busy' ? 'mi:bg-red' : a.presence === 'away' ? 'mi:bg-orange' : 'mi:bg-label3']" />
                  </span>
                  <span class="mi:grid mi:min-w-0">
                    <span class="mi:text-[13.5px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ a.name }}<em class="mi:font-normal mi:text-label2 mi:not-italic" v-if="a.name === ME"> (you)</em></span>
                    <span class="mi:text-[12px] mi:text-label2 mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ a.note }}</span>
                  </span>
                  <span class="mi:grid mi:gap-1 mi:justify-items-end" role="meter" :aria-label="`${a.name} load`" :aria-valuenow="a.load" aria-valuemin="0" :aria-valuemax="CAP" :aria-valuetext="`${a.load} of ${CAP} conversations`">
                    <span class="mi:text-[11.5px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ a.load }}/{{ CAP }}</span>
                    <span class="mi:w-full mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden"><i class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="a.load >= CAP ? 'mi:bg-red' : a.load / CAP >= 0.8 ? 'mi:bg-orange' : 'mi:bg-p'" :style="{ transform: `scaleX(${a.load / CAP})` }" /></span>
                  </span>
                </li>
              </ul>
            </section>

            <section class="mi:grid mi:content-start mi:gap-3 mi:min-w-0 mi:p-4 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="sqd-csat">
              <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2">
                <MiText id="sqd-csat" as="h3" variant="headline" weight="semibold">CSAT</MiText>
                <MiText variant="caption" tone="label2">Last 14 days</MiText>
              </div>
              <div class="mi:flex mi:items-center mi:gap-2.5">
                <span class="mi:text-[32px] mi:font-bold mi:tracking-[-.04em] mi:leading-none mi:tabular-nums">94.2%</span>
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

const csatDays = ['Oct 20', 'Oct 21', 'Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28', 'Oct 29', 'Oct 30', 'Oct 31', 'Nov 1', 'Nov 2']
const csat = [91.4, 92.1, 90.8, 92.6, 93.0, 92.2, 93.4, 93.1, 94.0, 92.9, 93.8, 94.5, 93.9, 94.2]
</script>
