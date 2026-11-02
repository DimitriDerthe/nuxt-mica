<template>
  <div class="ss-cq">
    <section class="ss" aria-labelledby="ss-title">
      <header class="ss__head">
        <div class="ss__headline">
          <span class="ss__live" :class="'ss__live--' + worst" aria-hidden="true"><i /></span>
          <div>
            <MiText id="ss-title" variant="title3" as="h2" weight="semibold">{{ summary }}</MiText>
            <MiText variant="footnote" tone="label2">Ledgerline platform · checked 40 s ago</MiText>
          </div>
        </div>
        <MiSegmented v-model="scope" label="Show services" :options="scopes" />
      </header>

      <ul class="ss__list" aria-label="Services">
        <li v-for="s in shown" :key="s.id" class="ss__row">
          <button
            type="button" class="ss__summary" :aria-expanded="open === s.id" :aria-controls="'ss-note-' + s.id"
            @click="open = open === s.id ? null : s.id"
          >
            <span class="ss__name">
              <MiText as="span" variant="subheadline" weight="semibold">{{ s.name }}</MiText>
              <MiText as="span" variant="caption" tone="label3">{{ s.scope }}</MiText>
            </span>

            <MiBadge v-bind="badge[s.status]" class="ss__badge">
              <MiSpinner v-if="s.status === 'deploying'" variant="arc" :size="11" label="" />
              {{ label[s.status] }}
            </MiBadge>

            <!-- 30-day ribbon: one tick per day, colored by the worst state of that day. -->
            <span class="ss__ribbon" role="img" :aria-label="`${s.uptime} uptime over 30 days, ${s.days.replace(/o/g, '').length} days with incidents`">
              <i v-for="(d, i) in s.days" :key="i" :class="'is-' + d" />
            </span>
            <MiText as="span" variant="caption" tone="label2" tabular class="ss__pct">{{ s.uptime }}</MiText>
            <MiIcon name="chevron-down" :size="16" class="ss__chev" />
          </button>

          <div v-show="open === s.id" :id="'ss-note-' + s.id" class="ss__note">
            <MiText variant="caption" tone="label3" weight="semibold">{{ s.noteTime }}</MiText>
            <MiText variant="footnote">{{ s.note }}</MiText>
          </div>
        </li>
      </ul>

      <footer class="ss__legend" aria-label="Legend">
        <span v-for="k in legend" :key="k" class="ss__key"><i :class="'is-' + k" />{{ legendLabel[k] }}</span>
        <MiText as="span" variant="caption" tone="label3" class="ss__range">30 days ago → today</MiText>
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

<style scoped>
.ss-cq { container-type: inline-size; }
.ss {
  display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
  --ok: var(--mi-green); --warn: var(--mi-orange); --bad: var(--mi-red); --plan: var(--mi-s);
}
.ss__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; }
.ss__headline { display: flex; align-items: center; gap: 12px; }

/* Live beacon: a static dot with a ring that scales and fades (transform + opacity only). */
.ss__live { position: relative; display: grid; place-items: center; flex: none; width: 28px; height: 28px; --c: var(--ok); }
.ss__live--outage { --c: var(--bad); } .ss__live--degraded { --c: var(--warn); }
.ss__live i, .ss__live::before { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: var(--c); }
.ss__live::before { content: ""; opacity: .45; animation: ss-ping 2.4s var(--mi-ease) infinite; }
@keyframes ss-ping { from { transform: scale(1); opacity: .45; } to { transform: scale(2.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ss__live::before { animation: none; } }

.ss__list { display: grid; margin: 0; padding: 0; list-style: none; }
.ss__row { border-top: 1px solid var(--mi-sep); }
.ss__summary {
  display: grid; grid-template-columns: minmax(0, 1fr) auto auto; grid-template-areas: "name badge chev" "ribbon ribbon pct";
  align-items: center; gap: 10px 12px; width: 100%; padding: 14px 4px; border: 0; background: none; color: inherit;
  font: inherit; text-align: start; cursor: pointer; border-radius: var(--mi-radius-s);
}
.ss__summary:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.ss__name { grid-area: name; display: grid; min-width: 0; }
.ss__badge { grid-area: badge; }
.ss__ribbon { grid-area: ribbon; display: flex; gap: 2px; height: 22px; }
.ss__pct { grid-area: pct; min-width: 48px; text-align: end; }
.ss__chev { grid-area: chev; color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.ss__summary[aria-expanded="true"] .ss__chev { transform: rotate(180deg); }

.ss__ribbon i, .ss__key i { flex: 1; border-radius: 2px; background: var(--ok); opacity: .8; }
.ss__ribbon i.is-d, .ss__key i.is-d { background: var(--warn); opacity: 1; }
.ss__ribbon i.is-x, .ss__key i.is-x { background: var(--bad); opacity: 1; }
.ss__ribbon i.is-m, .ss__key i.is-m { background: var(--plan); opacity: 1; }
.ss__ribbon i:last-child { box-shadow: 0 0 0 1.5px var(--mi-card), 0 0 0 3px var(--mi-label3); }

.ss__note { display: grid; gap: 2px; margin: 0 4px 14px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }

.ss__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding-top: 12px; border-top: 1px solid var(--mi-sep); font-size: 12px; color: var(--mi-label2); }
.ss__key { display: inline-flex; align-items: center; gap: 6px; }
.ss__key i { flex: none; width: 8px; height: 14px; }
.ss__range { margin-left: auto; }

@container (min-width: 720px) {
  .ss { padding: 24px 28px; }
  .ss__summary { grid-template-columns: minmax(160px, 1.1fr) 150px minmax(0, 2fr) 56px 16px; grid-template-areas: "name badge ribbon pct chev"; padding: 12px 4px; }
  .ss__badge { justify-self: start; }
}
</style>
