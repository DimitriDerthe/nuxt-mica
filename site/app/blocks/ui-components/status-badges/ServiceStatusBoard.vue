<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:font-mi mi:text-label mi:[background:var(--mi-card)] mi:shadow-1 mi:[--ok:var(--mi-green)] mi:[--warn:var(--mi-orange)] mi:[--bad:var(--mi-red)] mi:[--plan:var(--mi-s)] mi:@[720px]:py-6 mi:@[720px]:px-7" aria-labelledby="ss-title">
      <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-3 mi:gap-x-4">
        <div class="mi:flex mi:items-center mi:gap-3">
          <span class="mi:relative mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7 mi:before:[--mi-out-s:2.4] mi:before:animate-[out_2.4s_var(--mi-ease)_infinite] mi:motion-reduce:before:animate-none mi:before:absolute mi:before:w-3 mi:before:h-3 mi:before:rounded-[50%] mi:before:[background:var(--c)] mi:before:content-[''] mi:before:opacity-45" :class="worst === 'outage' ? 'mi:[--c:var(--bad)]' : worst === 'degraded' ? 'mi:[--c:var(--warn)]' : 'mi:[--c:var(--ok)]'" aria-hidden="true"><i class="mi:w-3 mi:h-3 mi:rounded-[50%] mi:bg-(--c) mi:absolute" /></span>
          <div>
            <MiText id="ss-title" variant="title3" as="h2" weight="semibold">{{ summary }}</MiText>
            <MiText variant="footnote" tone="label2">Ledgerline platform · checked 40 s ago</MiText>
          </div>
        </div>
        <MiSegmented v-model="scope" label="Show services" :options="scopes" />
      </header>

      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Services">
        <li v-for="s in shown" :key="s.id" class="mi:border-t mi:border-t-sep">
          <button
            type="button" class="mi:group mi:grid mi:grid-cols-[minmax(0,_1fr)_auto_auto] mi:[grid-template-areas:'name_badge_chev'_'ribbon_ribbon_pct'] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:w-full mi:py-3.5 mi:px-1 mi:[border:0] mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:rounded-sm mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[720px]:grid-cols-[minmax(160px,_1.1fr)_150px_minmax(0,_2fr)_56px_16px] mi:@[720px]:[grid-template-areas:'name_badge_ribbon_pct_chev'] mi:@[720px]:py-3 mi:@[720px]:px-1" :aria-expanded="open === s.id" :aria-controls="'ss-note-' + s.id"
            @click="open = open === s.id ? null : s.id"
          >
            <span class="mi:[grid-area:name] mi:grid mi:min-w-0">
              <MiText as="span" variant="subheadline" weight="semibold">{{ s.name }}</MiText>
              <MiText as="span" variant="caption" tone="label3">{{ s.scope }}</MiText>
            </span>

            <MiBadge v-bind="badge[s.status]" class="mi:[grid-area:badge] mi:@[720px]:justify-self-start">
              <MiSpinner v-if="s.status === 'deploying'" variant="arc" :size="11" label="" />
              {{ label[s.status] }}
            </MiBadge>

            <!-- 30-day ribbon: one tick per day, colored by the worst state of that day. -->
            <span class="mi:[grid-area:ribbon] mi:flex mi:gap-0.5 mi:h-5.5" role="img" :aria-label="`${s.uptime} uptime over 30 days, ${s.days.replace(/o/g, '').length} days with incidents`">
              <i class="mi:flex-1 mi:rounded-[2px] mi:last:shadow-[0_0_0_1.5px_var(--mi-card),_0_0_0_3px_var(--mi-label3)]" v-for="(d, i) in s.days" :key="i" :class="[d === 'd' ? 'mi:bg-(--warn) mi:opacity-100' : d === 'x' ? 'mi:bg-(--bad) mi:opacity-100' : d === 'm' ? 'mi:bg-(--plan) mi:opacity-100' : 'mi:bg-(--ok) mi:opacity-80']" />
            </span>
            <MiText as="span" variant="caption" tone="label2" tabular class="mi:[grid-area:pct] mi:min-w-12 mi:text-end">{{ s.uptime }}</MiText>
            <MiIcon name="chevron-down" :size="16" class="mi:[grid-area:chev] mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:group-aria-expanded:transform-[rotate(180deg)]" />
          </button>

          <div v-show="open === s.id" :id="'ss-note-' + s.id" class="mi:grid mi:gap-0.5 mi:mt-0 mi:mx-1 mi:mb-3.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)]">
            <MiText variant="caption" tone="label3" weight="semibold">{{ s.noteTime }}</MiText>
            <MiText variant="footnote">{{ s.note }}</MiText>
          </div>
        </li>
      </ul>

      <footer class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3.5 mi:pt-3 mi:border-t mi:border-t-sep mi:text-[12px] mi:text-label2" aria-label="Legend">
        <span v-for="k in legend" :key="k" class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:flex-none mi:w-2 mi:h-3.5 mi:rounded-[2px]" :class="[k === 'd' ? 'mi:bg-(--warn) mi:opacity-100' : k === 'x' ? 'mi:bg-(--bad) mi:opacity-100' : k === 'm' ? 'mi:bg-(--plan) mi:opacity-100' : 'mi:bg-(--ok) mi:opacity-80']" />{{ legendLabel[k] }}</span>
        <MiText as="span" variant="caption" tone="label3" class="mi:ml-auto!">30 days ago → today</MiText>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Status = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'deploying'
type Tone = 'primary' | 'secondary' | 'warning' | 'neutral' | 'danger' | 'success'

const badge: Record<Status, { tone: Tone, variant: 'tint' | 'solid' | 'outline', dot?: boolean }> = {
  operational: { tone: 'success', variant: 'tint', dot: true },
  degraded: { tone: 'warning', variant: 'tint', dot: true },
  outage: { tone: 'danger', variant: 'solid', dot: true },
  maintenance: { tone: 'secondary', variant: 'outline' },
  deploying: { tone: 'primary', variant: 'tint' }
}
const label: Record<Status, string> = {
  operational: 'Operational', degraded: 'Degraded', outage: 'Partial outage', maintenance: 'Maintenance', deploying: 'Deploying'
}

// Day codes: o operational, d degraded, x outage, m maintenance.
const services: { id: string, name: string, scope: string, status: Status, uptime: string, days: string, noteTime: string, note: string }[] = [
  { id: 'api', name: 'Payments API', scope: 'eu-west, us-east', status: 'operational', uptime: '99.99%', days: 'oooooooooooooodoooooooooooooooo'.slice(0, 30), noteTime: 'Oct 16 · resolved in 11 min', note: 'Elevated 502s on card authorisations from one load balancer node, drained and replaced.' },
  { id: 'payouts', name: 'Payouts', scope: 'SEPA, Faster Payments', status: 'degraded', uptime: '99.71%', days: 'ooooooooooooooooooooooooooodod', noteTime: 'Today 09:12 · investigating', note: 'SEPA payouts are confirmed up to 25 min late. Funds are safe; the partner bank queue is draining.' },
  { id: 'webhooks', name: 'Webhooks', scope: 'All regions', status: 'deploying', uptime: '99.97%', days: 'ooooooooooooooooooooomoooooooo', noteTime: 'Today 10:40 · rolling out', note: 'Retry scheduler v4 is rolling out to 3 of 9 workers. Deliveries continue during the rollout.' },
  { id: 'dashboard', name: 'Dashboard', scope: 'app.ledgerline.io', status: 'operational', uptime: '100%', days: 'oooooooooooooooooooooooooooooo', noteTime: 'No incidents in 30 days', note: 'Everything has been running normally for this service.' },
  { id: 'reports', name: 'Reporting exports', scope: 'Scheduled CSV and Excel', status: 'outage', uptime: '98.42%', days: 'oooooooooooomoooooooooooooooxx', noteTime: 'Today 07:55 · identified', note: 'Scheduled exports are failing for accounts in us-east. A fix is being tested; manual exports still work.' },
  { id: 'search', name: 'Transaction search', scope: 'Index rebuild', status: 'maintenance', uptime: '99.90%', days: 'ooooooooooooooooooooooooooooom', noteTime: 'Today 06:00 – 12:00 · planned', note: 'Search results may lag by up to 10 minutes while the index is rebuilt on new hardware.' }
]

const scopes = [{ value: 'all', label: 'All' }, { value: 'issues', label: 'Needs attention' }]
const scope = ref<string | number | null>('all')
const open = ref<string | null>('payouts')

const shown = computed(() => (scope.value === 'issues' ? services.filter(s => s.status !== 'operational') : services))

const rank: Status[] = ['outage', 'degraded', 'maintenance', 'deploying', 'operational']
const worst = computed(() => rank.find(r => services.some(s => s.status === r)) ?? 'operational')
const summary = computed(() => {
  const n = services.filter(s => s.status === 'outage' || s.status === 'degraded').length
  return n ? `${n} services need attention` : 'All systems operational'
})

const legend = ['o', 'd', 'x', 'm'] as const
const legendLabel = { o: 'Operational', d: 'Degraded', x: 'Outage', m: 'Maintenance' }
</script>

