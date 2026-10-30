<template>
  <div class="st" :data-state="scenario">
    <div class="intro">
    <div class="topbar">
      <NuxtLink to="/showcase" class="back">
        <MiIcon name="chevron-left" :size="16" />
        Back to showcase
      </NuxtLink>
      <div class="demo" role="group" aria-labelledby="demo-label">
        <span id="demo-label" class="demo-label">Demo scenario</span>
        <MiSegmented v-model="scenario" :options="scenarios" label="Demo scenario" />
      </div>
    </div>

    <header class="brandbar">
      <a class="mbrand" href="#overview" aria-label="Meridian Cloud status, overview">
        <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="13" />
          <ellipse cx="16" cy="16" rx="5.4" ry="13" />
          <path d="M3.6 12h24.8M3.6 20h24.8" />
        </svg>
        <span class="brand-name">Meridian</span>
        <span class="brand-sub">Status</span>
      </a>
      <MiButton variant="tinted" size="small" href="#subscribe">Subscribe</MiButton>
    </header>

    <!-- Signature moment: the status hero -->
    <section id="overview" class="hero" aria-labelledby="hero-title">
      <div class="wash" aria-hidden="true">
        <i v-for="k in ['ok', 'partial', 'major']" :key="k" :class="['w', 'w-' + k, { on: scenario === k }]" />
      </div>

      <div class="hero-main">
        <div class="glyph" aria-hidden="true">
          <Transition name="pop" mode="out-in">
            <span :key="scenario" class="glyph-in">
              <span class="ring" />
              <span class="halo" />
              <span class="disk"><MiIcon :name="state.icon" :size="state.iconSize" :weight="2.6" /></span>
            </span>
          </Transition>
        </div>

        <div class="hero-copy">
          <p class="eyebrow">Current status</p>
          <div aria-live="polite">
            <Transition name="swap" mode="out-in">
              <div :key="scenario">
                <h1 id="hero-title" class="hero-title">{{ state.title }}</h1>
                <p class="hero-lede">{{ state.lede }}</p>
              </div>
            </Transition>
          </div>
          <p class="hero-meta">
            <span class="live-dot" aria-hidden="true" />
            <span>Updated <b class="num">{{ checkedAt }}</b> UTC</span>
            <span class="sep" aria-hidden="true" />
            <span>Checks every 60 seconds from 8 regions</span>
          </p>
        </div>
      </div>

      <div class="hero-fig">
        <p class="fig-label">90-day uptime</p>
        <p class="fig num">{{ overallUptime }}<span>%</span></p>
        <p class="fig-sub">Across 6 services and 8 regions, weighted by request volume.</p>
      </div>
    </section>

    <ul class="stats" aria-label="Summary">
      <li class="tile">
        <span class="tile-label">Uptime, last 30 days</span>
        <span class="tile-value num">{{ uptime30 }}<small>%</small></span>
        <span class="tile-sub">SLA target 99.95%</span>
      </li>
      <li class="tile">
        <span class="tile-label">Median latency</span>
        <span class="tile-value num" :class="{ warn: scenario !== 'ok' }">{{ medianNow }}<small> ms</small></span>
        <span class="tile-sub">p50, last hour, all regions</span>
      </li>
      <li class="tile">
        <span class="tile-label">Open incidents</span>
        <span class="tile-value num" :class="{ warn: scenario === 'partial', bad: scenario === 'major' }">{{ live.length }}</span>
        <span class="tile-sub">{{ state.incidentNote }}</span>
      </li>
      <li class="tile">
        <span class="tile-label">Regions online</span>
        <span class="tile-value num" :class="{ bad: regionsOnline < 8 }">{{ regionsOnline }}<small>/8</small></span>
        <span class="tile-sub">{{ state.regionNote }}</span>
      </li>
    </ul>
    </div>

    <!-- Services -->
    <section class="sec" aria-labelledby="h-services">
      <div class="sec-head">
        <div class="sec-title">
          <p class="eyebrow">Components</p>
          <h2 id="h-services" class="h2">Services</h2>
          <p class="sec-lede">Daily availability for the last 90 days. Hover or focus a bar, then use the arrow keys, to inspect a day.</p>
        </div>
        <div class="region">
          <label for="region-select" class="region-label">Region</label>
          <MiSelect id="region-select" v-model="region" :options="regions" size="sm" />
        </div>
      </div>

      <div class="groups">
        <div v-for="g in visibleGroups" :key="g.id" class="group">
          <div class="group-head">
            <h3 class="group-title">{{ g.name }}</h3>
            <span class="group-note" :class="g.tone">{{ g.note }}</span>
          </div>
          <ul class="svc-list">
            <li v-for="s in g.items" :key="s.id" class="svc">
              <div class="svc-top">
                <div class="svc-name">
                  <h4 class="svc-title">{{ s.name }}</h4>
                  <p class="svc-desc">{{ s.desc }}</p>
                </div>
                <div class="svc-right">
                  <span class="svc-up num">{{ s.uptime }}%</span>
                  <MiBadge :tone="tones[s.status].tone" variant="tint" shape="pill" dot :label="tones[s.status].label" />
                </div>
              </div>

              <div
                :class="['bars', { active: tip.id === s.id }]"
                tabindex="0"
                role="group"
                :aria-label="`${s.name}, 90 day history, ${s.uptime}% uptime. Use the arrow keys to inspect days.`"
                @pointermove="onMove($event, s)"
                @pointerleave="tip.id = ''"
                @focus="onFocus($event, s)"
                @blur="tip.id = ''"
                @keydown="onKey($event, s)"
              >
                <span
                  v-for="(d, i) in s.days"
                  :key="i"
                  :data-i="i"
                  :class="['d', 'c' + d, { on: tip.id === s.id && tip.i === i }]"
                />
                <div
                  v-if="tip.id === s.id"
                  class="tip"
                  :style="{ transform: `translateX(${tip.x}px)`, '--cx': tip.cx + 'px' }"
                  role="status"
                >
                  <span class="tip-date">{{ dayLabel(tip.i) }}</span>
                  <span class="tip-st"><i :class="'dot c' + s.days[tip.i]" />{{ dayStatus(s.days[tip.i]) }}</span>
                  <span class="tip-note">{{ dayNote(s, tip.i) }}</span>
                </div>
              </div>
              <div class="bar-foot">
                <span><span class="long">90 days ago</span><span class="short">45 days ago</span></span>
                <span class="rule" aria-hidden="true" />
                <span>Today</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="legend" aria-label="Legend">
        <span><i class="sw c0" />Operational</span>
        <span><i class="sw c1" />Degraded performance</span>
        <span><i class="sw c2" />Outage</span>
      </div>
    </section>

    <!-- Regions -->
    <section class="sec" aria-labelledby="h-regions">
      <div class="sec-head">
        <div class="sec-title">
          <p class="eyebrow">Network</p>
          <h2 id="h-regions" class="h2">Regions</h2>
          <p class="sec-lede">Round-trip latency from our probes to each region's edge, median over the last hour.</p>
        </div>
        <p class="region-count num">{{ regionsOnline }} of 8 online</p>
      </div>
      <ul class="reg-grid">
        <li
          v-for="r in regionTiles"
          :key="r.code"
          :class="['reg', 'reg-' + r.status, { dim: region !== 'all' && r.area !== region }]"
        >
          <div class="reg-top">
            <span class="reg-dot" :class="'c' + r.status" aria-hidden="true" />
            <span class="reg-code">{{ r.code }}</span>
            <span class="reg-state">{{ tones[r.status].label }}</span>
          </div>
          <div>
            <p class="reg-city">{{ r.city }}</p>
            <p class="reg-country">{{ r.country }}</p>
          </div>
          <div class="reg-foot">
            <p v-if="r.status < 2" class="reg-ms num">{{ r.ms }}<small> ms</small></p>
            <p v-else class="reg-ms down">Unreachable</p>
            <MiSparkline
              :values="r.trend"
              :width="72"
              :height="24"
              :stroke-width="1.6"
              stroke="var(--mi-label3)"
              :color="statusColor[r.status]"
              :animate="false"
            />
          </div>
        </li>
      </ul>
    </section>

    <!-- Response time -->
    <section class="sec" aria-labelledby="h-perf">
      <div class="perf">
        <div class="perf-head">
          <div class="sec-title">
            <p class="eyebrow">Performance</p>
            <h2 id="h-perf" class="h2">API response time</h2>
            <p class="sec-lede">Median and 95th percentile for {{ regionLabel }}, last {{ rangeLabel }}.</p>
          </div>
          <MiSegmented v-model="range" :options="ranges" label="Time range" />
        </div>
        <dl class="kpis">
          <div>
            <dt><i class="key key-p" />Median</dt>
            <dd class="num">{{ lastOf(0) }}<small> ms</small></dd>
          </div>
          <div>
            <dt><i class="key key-s" />p95</dt>
            <dd class="num">{{ lastOf(1) }}<small> ms</small></dd>
          </div>
          <div>
            <dt>Error rate</dt>
            <dd class="num" :class="{ warn: scenario === 'partial', bad: scenario === 'major' }">{{ state.errors }}<small>%</small></dd>
          </div>
        </dl>
        <MiLineChart
          class="chart"
          :categories="chart.cats"
          :series="chart.series"
          :card="false"
          unit=" ms"
          :height="248"
          area="first"
          category-label="Time"
          aria-label="API response time, median and p95"
        />
      </div>
    </section>

    <!-- Incidents, maintenance, subscribe -->
    <div class="two">
      <section class="sec" aria-labelledby="h-inc">
        <div class="sec-title">
          <p class="eyebrow">History</p>
          <h2 id="h-inc" class="h2">Incidents</h2>
        </div>

        <div class="timeline">
          <div v-for="m in incidentGroups" :key="m.label" class="month">
            <h3 class="month-label">{{ m.label }}</h3>
            <article
              v-for="inc in m.items"
              :key="inc.id"
              :class="['inc', 'inc-' + inc.impact, { 'inc-live': inc.live }]"
              :aria-labelledby="'inc-' + inc.id"
            >
              <div class="inc-date" aria-hidden="true">
                <span class="inc-day num">{{ inc.day }}</span>
                <span class="inc-mon">{{ inc.mon }}</span>
                <span class="inc-wd">{{ inc.wd }}</span>
              </div>
              <div class="inc-rail" aria-hidden="true"><span class="node" /></div>
              <div class="inc-body">
                <div class="inc-meta">
                  <MiBadge :tone="incTone[inc.state].tone" variant="tint" shape="pill" dot :label="incTone[inc.state].label" />
                  <span class="inc-impact">{{ inc.impact === 'major' ? 'Major impact' : 'Minor impact' }}</span>
                  <span class="inc-dur num">{{ inc.duration }}</span>
                </div>
                <h4 :id="'inc-' + inc.id" class="inc-title">{{ inc.title }}</h4>
                <p class="inc-when">{{ inc.when }}</p>
                <ul class="chips" aria-label="Affected services">
                  <li v-for="a in inc.affected" :key="a">{{ a }}</li>
                </ul>
                <ol class="updates">
                  <li
                    v-for="(u, ui) in inc.updates"
                    v-show="ui === 0 || inc.live || expanded[inc.id]"
                    :key="u.at"
                    :class="{ latest: ui === 0 }"
                  >
                    <div class="u-head">
                      <span class="u-stage">{{ u.stage }}</span>
                      <span class="u-at num">{{ u.at }} UTC</span>
                    </div>
                    <p class="u-text">{{ u.text }}</p>
                  </li>
                </ol>
                <button
                  v-if="!inc.live && inc.updates.length > 1"
                  type="button"
                  class="more"
                  :aria-expanded="!!expanded[inc.id]"
                  @click="expanded[inc.id] = !expanded[inc.id]"
                >
                  {{ expanded[inc.id] ? 'Hide earlier updates' : `Show ${inc.updates.length - 1} earlier ${inc.updates.length === 2 ? 'update' : 'updates'}` }}
                  <MiIcon :name="expanded[inc.id] ? 'chevron-up' : 'chevron-down'" :size="14" />
                </button>
              </div>
            </article>
          </div>
          <p class="tl-end">No other incidents in the last 90 days.</p>
        </div>
      </section>

      <div class="side">
        <section class="sec" aria-labelledby="h-mnt">
          <div class="sec-title">
            <p class="eyebrow">Upcoming</p>
            <h2 id="h-mnt" class="h2 h2-sm">Scheduled maintenance</h2>
          </div>
          <article class="card mnt" aria-labelledby="mnt-title">
            <div class="cal" aria-hidden="true">
              <span class="cal-mon">Nov</span>
              <span class="cal-day num">4</span>
              <span class="cal-wd">Wed</span>
            </div>
            <div class="mnt-body">
              <h3 id="mnt-title" class="card-title">Database cluster upgrade</h3>
              <p class="mnt-time num"><MiIcon name="calendar" :size="14" />Wed 4 Nov, 02:00 to 03:30 UTC</p>
              <p class="card-text">We are upgrading the storage engine on the Frankfurt and Amsterdam clusters. Writes may pause for up to 45 seconds while primaries fail over. No action is required.</p>
              <ul class="chips" aria-label="Affected">
                <li>Managed databases</li>
                <li>fra1</li>
                <li>ams1</li>
              </ul>
            </div>
            <div class="mnt-foot">
              <MiBadge tone="neutral" variant="outline" label="Scheduled" />
              <span class="mnt-in">Starts in 5 days, 90 minute window</span>
            </div>
          </article>
        </section>

        <section id="subscribe" class="sec" aria-labelledby="h-sub">
          <div class="card sub-card">
            <span class="sub-icon" aria-hidden="true"><MiIcon name="bell" :size="20" /></span>
            <p class="eyebrow">Stay informed</p>
            <h2 id="h-sub" class="card-title lg">Get incident updates by email</h2>
            <p class="card-text">One email when an incident is opened, one for each update and one when it is resolved. Maintenance notices arrive 48 hours ahead.</p>
            <form class="sub" novalidate @submit.prevent="subscribe">
              <MiField label="Work email" :error="emailError" for="sub-email">
                <MiInput id="sub-email" v-model="email" type="email" placeholder="you@company.com" autocomplete="email" :invalid="!!emailError || undefined" />
              </MiField>
              <MiButton type="submit" :loading="busy" block>Subscribe</MiButton>
            </form>
            <p class="fine">No marketing, ever. Unsubscribe from any email in one click. Also available as an RSS feed and a Slack app.</p>
          </div>
        </section>
      </div>
    </div>

    <footer class="foot">
      <div class="foot-brand">
        <svg class="mark sm" viewBox="0 0 32 32" aria-hidden="true">
          <circle cx="16" cy="16" r="13" />
          <ellipse cx="16" cy="16" rx="5.4" ry="13" />
          <path d="M3.6 12h24.8M3.6 20h24.8" />
        </svg>
        <span>Powered by <b>Meridian Status</b></span>
      </div>
      <p class="foot-meta">
        <span>All times in UTC</span>
        <span>Data refreshes every 60 seconds</span>
        <span>&copy; 2026 Meridian Cloud, Inc.</span>
      </p>
    </footer>

    <MiToaster position="bottom-center" />
  </div>
</template>

<script setup lang="ts">
type St = 0 | 1 | 2
type Scenario = 'ok' | 'partial' | 'major'
type Svc = { id: string, group: string, name: string, desc: string, regions: string[], seed: number, base: St[], today: Record<Scenario, St> }
type Incident = {
  id: string, state: 'investigating' | 'monitoring' | 'resolved', impact: 'minor' | 'major', live?: boolean
  date: number, title: string, when: string, duration: string, affected: string[]
  updates: { stage: string, at: string, text: string }[]
}

useHead({ title: 'Meridian Cloud status' })

const scenario = ref<Scenario>('ok')
const scenarios = [
  { value: 'ok', label: 'Operational' },
  { value: 'partial', label: 'Partial outage' },
  { value: 'major', label: 'Major outage' }
]
const region = ref('all')
const regions = [
  { value: 'all', label: 'All regions' },
  { value: 'na', label: 'North America' },
  { value: 'eu', label: 'Europe' },
  { value: 'ap', label: 'Asia Pacific' }
]
const regionLabel = computed(() => regions.find(r => r.value === region.value)?.label ?? 'All regions')
const checkedAt = '14:32'

const tones = {
  0: { tone: 'success', label: 'Operational' },
  1: { tone: 'warning', label: 'Degraded' },
  2: { tone: 'danger', label: 'Outage' }
} as const
const statusColor = { 0: 'var(--mi-green)', 1: 'var(--mi-orange)', 2: 'var(--mi-red)' } as const

const states = {
  ok: {
    icon: 'check', iconSize: 34, title: 'All systems operational',
    lede: 'Every Meridian service is running normally in all eight regions. The last incident was resolved six days ago.',
    incidentNote: 'Last one resolved 24 Oct', regionNote: 'All regions healthy', errors: '0.02'
  },
  partial: {
    icon: 'warning', iconSize: 32, title: 'Degraded performance on 2 services',
    lede: 'API requests through Frankfurt are slower than usual and some deployments time out. A fix is rolling out.',
    incidentNote: 'Monitoring since 13:48 UTC', regionNote: 'Frankfurt degraded', errors: '0.84'
  },
  major: {
    icon: 'close', iconSize: 34, title: 'Major outage',
    lede: 'The API and Dashboard are unreachable in North America and Europe. Engineers are engaged; next update by 14:41 UTC.',
    incidentNote: 'Investigating since 14:26 UTC', regionNote: 'Ashburn and Frankfurt down', errors: '38.6'
  }
} as const
const state = computed(() => states[scenario.value])

// Deterministic history so SSR and client agree.
function rng(seed: number) {
  let s = seed * 7919 + 104729
  const next = () => (s = (s * 16807) % 2147483647) / 2147483647
  next(); next()
  return next
}
function history(seed: number, bad: number, forced: Record<number, St> = {}): St[] {
  const r = rng(seed)
  return Array.from({ length: 90 }, (_, i) => {
    if (i in forced) return forced[i]!
    const v = r()
    if (i > 84) return 0
    return v < bad * 0.2 ? 2 : v < bad ? 1 : 0
  })
}
// Day index of a date (89 is today, 30 Oct 2026).
const NOW = Date.UTC(2026, 9, 30)
const idxOf = (d: number) => 89 - Math.round((NOW - d) / 864e5)
const D_OCT24 = Date.UTC(2026, 9, 24)
const D_OCT9 = Date.UTC(2026, 9, 9)
const D_SEP28 = Date.UTC(2026, 8, 28)

const defs: Svc[] = [
  { id: 'api', group: 'core', name: 'API', desc: 'REST, streaming and webhook delivery', regions: ['na', 'eu', 'ap'], seed: 11, base: history(11, 0.03, { [idxOf(D_OCT24)]: 1 }), today: { ok: 0, partial: 1, major: 2 } },
  { id: 'dash', group: 'core', name: 'Dashboard', desc: 'Web console, sign-in and account settings', regions: ['na', 'eu', 'ap'], seed: 23, base: history(23, 0.02, { [idxOf(D_SEP28)]: 2 }), today: { ok: 0, partial: 0, major: 2 } },
  { id: 'build', group: 'core', name: 'Deployments', desc: 'Build pipeline and release rollouts', regions: ['na', 'eu'], seed: 37, base: history(37, 0.04), today: { ok: 0, partial: 1, major: 1 } },
  { id: 'db', group: 'data', name: 'Managed databases', desc: 'Postgres and key-value clusters', regions: ['eu', 'ap'], seed: 41, base: history(41, 0.02), today: { ok: 0, partial: 0, major: 1 } },
  { id: 'store', group: 'data', name: 'Object storage', desc: 'Buckets, uploads and signed URLs', regions: ['na', 'eu', 'ap'], seed: 53, base: history(53, 0.015, { [idxOf(D_OCT9)]: 1 }), today: { ok: 0, partial: 0, major: 0 } },
  { id: 'edge', group: 'data', name: 'Edge network', desc: 'CDN, TLS termination and DNS', regions: ['na', 'ap'], seed: 67, base: history(67, 0.02), today: { ok: 0, partial: 0, major: 1 } }
]
const groupNames = { core: 'Core platform', data: 'Data and delivery' } as const
const dayPct = { 0: 100, 1: 99.7, 2: 98.1 } as const
const services = computed(() => defs.map((d) => {
  const days = d.base.slice() as St[]
  days[89] = d.today[scenario.value]
  const uptime = (days.reduce((a, v) => a + dayPct[v], 0) / 90).toFixed(2)
  return { ...d, days, status: days[89]!, uptime }
}))
type SvcRow = (typeof services.value)[number]
const visibleGroups = computed(() => (['core', 'data'] as const).map((g) => {
  const items = services.value.filter(s => s.group === g && (region.value === 'all' || s.regions.includes(region.value)))
  const bad = items.filter(s => s.status > 0).length
  const down = items.filter(s => s.status === 2).length
  return {
    id: g, name: groupNames[g], items,
    tone: down ? 'bad' : bad ? 'warn' : 'ok',
    note: down ? `${down} of ${items.length} down` : bad ? `${bad} of ${items.length} degraded` : `${items.length} of ${items.length} operational`
  }
}).filter(g => g.items.length))

const avg = (xs: number[]) => xs.reduce((a, v) => a + v, 0) / xs.length
const overallUptime = computed(() => avg(services.value.map(s => Number(s.uptime))).toFixed(2))
const uptime30 = computed(() => avg(services.value.map(s => avg(s.days.slice(60).map(d => dayPct[d])))).toFixed(2))

// Day tooltip: one delegated pointer handler per bar, the cell comes from the event target.
const tip = reactive({ id: '', i: 0, x: 0, cx: 0 })
const TIP_W = 216
const fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const dayLabel = (i: number) => fmt.format(NOW - (89 - i) * 864e5)
const dayStatus = (d: St | undefined) => ['No incidents', 'Degraded performance', 'Outage'][d ?? 0]
const incidentDays: Record<string, Record<number, string>> = {
  api: { [idxOf(D_OCT24)]: 'Delayed webhook delivery, 1 h 27 min' },
  dash: { [idxOf(D_SEP28)]: 'Dashboard sign-in failures, 25 min' },
  store: { [idxOf(D_OCT9)]: 'Elevated errors on uploads, 42 min' }
}
function dayNote(s: SvcRow, i: number) {
  const d = s.days[i] ?? 0
  if (i === 89 && d > 0) return scenario.value === 'partial' ? 'Ongoing: elevated latency in Europe' : 'Ongoing: API and Dashboard unreachable'
  const named = incidentDays[s.id]?.[i]
  if (named) return named
  if (d === 0) return i === 89 ? 'Running normally so far today' : '100% of checks passed'
  const mins = 8 + ((i * 37 + s.seed * 11) % 64)
  return d === 1 ? `Slow responses for ${mins} min` : `Unavailable for ${mins} min`
}
const minIndex = () => (window.matchMedia('(max-width: 639px)').matches ? 45 : 0)
function place(el: HTMLElement, i: number, s: SvcRow) {
  const cell = el.querySelector<HTMLElement>(`[data-i="${i}"]`)
  if (!cell) return
  const w = el.clientWidth
  const center = cell.offsetLeft + cell.offsetWidth / 2
  const x = Math.min(Math.max(center - TIP_W / 2, 0), Math.max(w - TIP_W, 0))
  tip.id = s.id; tip.i = i; tip.x = x; tip.cx = Math.min(Math.max(center - x, 12), TIP_W - 12)
}
function onMove(ev: PointerEvent, s: SvcRow) {
  const t = (ev.target as HTMLElement).closest<HTMLElement>('[data-i]')
  if (!t) return
  const i = Number(t.dataset.i)
  if (tip.id !== s.id || tip.i !== i) place(ev.currentTarget as HTMLElement, i, s)
}
function onFocus(ev: FocusEvent, s: SvcRow) { if (tip.id !== s.id) place(ev.currentTarget as HTMLElement, 89, s) }
function onKey(ev: KeyboardEvent, s: SvcRow) {
  const el = ev.currentTarget as HTMLElement
  const lo = minIndex()
  const cur = tip.id === s.id ? tip.i : 89
  const map: Record<string, number> = { ArrowLeft: cur - 1, ArrowRight: cur + 1, Home: lo, End: 89 }
  if (!(ev.key in map)) return
  ev.preventDefault()
  place(el, Math.min(89, Math.max(lo, map[ev.key]!)), s)
}

// Regions
const regionDefs = [
  { code: 'iad1', city: 'Ashburn', country: 'United States', area: 'na', ms: 18 },
  { code: 'pdx1', city: 'Portland', country: 'United States', area: 'na', ms: 24 },
  { code: 'yyz1', city: 'Toronto', country: 'Canada', area: 'na', ms: 21 },
  { code: 'fra1', city: 'Frankfurt', country: 'Germany', area: 'eu', ms: 16 },
  { code: 'ams1', city: 'Amsterdam', country: 'Netherlands', area: 'eu', ms: 14 },
  { code: 'par1', city: 'Paris', country: 'France', area: 'eu', ms: 15 },
  { code: 'sin1', city: 'Singapore', country: 'Singapore', area: 'ap', ms: 31 },
  { code: 'nrt1', city: 'Tokyo', country: 'Japan', area: 'ap', ms: 27 }
]
const regionImpact: Record<Scenario, Record<string, [St, number]>> = {
  ok: {},
  partial: { fra1: [1, 214] },
  major: { iad1: [2, 0], fra1: [2, 0], ams1: [1, 386], pdx1: [1, 241] }
}
const regionTiles = computed(() => regionDefs.map((r, k) => {
  const hit = regionImpact[scenario.value][r.code]
  const status: St = hit ? hit[0] : 0
  const ms = hit && hit[1] ? hit[1] : r.ms
  const rr = rng(101 + k * 7)
  const trend = Array.from({ length: 18 }, (_, i) => {
    const base = r.ms + Math.sin(i / 2.2 + k) * 2.2 + rr() * 2.5
    if (status === 0 || i < 14) return Math.round(base * 10) / 10
    return status === 2 ? Math.round(base * (2 + (i - 13) * 1.6)) : Math.round(base + (ms - r.ms) * ((i - 13) / 4))
  })
  return { ...r, status, ms, trend }
}))
const regionsOnline = computed(() => regionTiles.value.filter(r => r.status < 2).length)

// Response time
const range = ref<'24h' | '7d' | '30d'>('24h')
const ranges = [{ value: '24h', label: '24 hours' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]
const rangeLabel = computed(() => (ranges.find(r => r.value === range.value)?.label ?? '').toLowerCase())
const chart = computed(() => {
  const cats = range.value === '24h'
    ? Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, '0')}:00`)
    : range.value === '7d'
      ? Array.from({ length: 7 }, (_, i) => `${24 + i} Oct`)
      : Array.from({ length: 10 }, (_, i) => `${3 + i * 3} Oct`)
  const r = rng(range.value.length * 97 + region.value.length * 13 + 5)
  const off = ({ all: 0, na: -6, eu: 4, ap: 17 } as Record<string, number>)[region.value] ?? 0
  const bump = { ok: 0, partial: 150, major: 420 }[scenario.value]
  const last = cats.length - 1
  const p50 = cats.map((_, i) => Math.round(58 + off + Math.sin(i / 1.7) * 5 + r() * 4 + (i === last ? bump * 0.55 : i === last - 1 ? bump * 0.12 : 0)))
  const p95 = p50.map((v, i) => Math.round(v * 1.9 + 14 + r() * 12 + (i === last ? bump : i === last - 1 ? bump * 0.2 : 0)))
  return {
    cats,
    series: [
      { name: 'Median', data: p50, color: 'var(--mi-p)', area: true },
      { name: 'p95', data: p95, color: 'var(--mi-indigo)', area: false }
    ]
  }
})
const lastOf = (k: number) => chart.value.series[k]?.data.at(-1) ?? 0
const medianNow = computed(() => 61 + ({ ok: 0, partial: 83, major: 231 })[scenario.value])

// Incidents
const incTone = {
  investigating: { tone: 'danger', label: 'Investigating' },
  monitoring: { tone: 'warning', label: 'Monitoring' },
  resolved: { tone: 'success', label: 'Resolved' }
} as const
const past: Incident[] = [
  { id: 'i3', state: 'resolved', impact: 'minor', date: D_OCT24, title: 'Delayed webhook delivery', when: '18:21 to 19:48 UTC', duration: '1 h 27 min', affected: ['API', 'Webhooks'], updates: [
    { stage: 'Resolved', at: '19:48', text: 'The backlog has cleared and webhooks are delivered within the usual two seconds. No events were lost.' },
    { stage: 'Identified', at: '18:55', text: 'A stuck consumer in the queue worker pool stopped acknowledging messages. We are restarting the pool and replaying the backlog.' },
    { stage: 'Investigating', at: '18:21', text: 'Some customers see webhooks arriving more than ten minutes late. We are looking into the queue workers.' }
  ] },
  { id: 'i2', state: 'resolved', impact: 'minor', date: D_OCT9, title: 'Elevated errors on object uploads', when: '06:30 to 07:12 UTC', duration: '42 min', affected: ['Object storage', 'sin1'], updates: [
    { stage: 'Resolved', at: '07:12', text: 'A certificate rotation on one storage gateway was incomplete. The gateway was drained and the new certificate deployed. Upload error rates are back to baseline.' },
    { stage: 'Investigating', at: '06:30', text: 'Roughly 3% of upload requests in Asia Pacific are returning TLS errors.' }
  ] },
  { id: 'i1', state: 'resolved', impact: 'major', date: D_SEP28, title: 'Dashboard sign-in failures', when: '12:40 to 13:05 UTC', duration: '25 min', affected: ['Dashboard'], updates: [
    { stage: 'Resolved', at: '13:05', text: 'We rolled back a session service release that rejected valid cookies. Signing in works again for all accounts.' },
    { stage: 'Investigating', at: '12:40', text: 'Users are redirected back to the sign-in page after entering valid credentials.' }
  ] }
]
const live = computed<Incident[]>(() => scenario.value === 'ok'
  ? []
  : [scenario.value === 'partial'
      ? { id: 'live', live: true, state: 'monitoring', impact: 'minor', date: NOW, title: 'Elevated API latency in Europe', when: 'Since 13:48 UTC', duration: 'Ongoing, 44 min', affected: ['API', 'Deployments', 'fra1'], updates: [
          { stage: 'Monitoring', at: '14:20', text: 'A fix has been applied to the Frankfurt load balancers. Latency is recovering and we are watching error rates.' },
          { stage: 'Identified', at: '14:02', text: 'One load balancer pool in Frankfurt is saturated after a configuration change. We are shifting traffic and rolling the change back.' },
          { stage: 'Investigating', at: '13:48', text: 'Requests routed through Frankfurt take longer than usual and some deployments time out.' }
        ] }
      : { id: 'live', live: true, state: 'investigating', impact: 'major', date: NOW, title: 'API and Dashboard unreachable', when: 'Since 14:26 UTC', duration: 'Ongoing, 6 min', affected: ['API', 'Dashboard', 'Deployments', 'iad1', 'fra1'], updates: [
          { stage: 'Investigating', at: '14:26', text: 'Most requests are failing in North America and Europe. We have engaged the network and platform teams and will post an update every 15 minutes.' }
        ] }])
const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'UTC' })
const monFmt = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
const wdFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' })
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const incidentGroups = computed(() => {
  const out: { label: string, items: (Incident & { day: string, mon: string, wd: string })[] }[] = []
  for (const inc of [...live.value, ...past]) {
    const label = inc.live ? 'Today' : monthFmt.format(inc.date)
    let g = out.find(x => x.label === label)
    if (!g) out.push(g = { label, items: [] })
    g.items.push({ ...inc, day: dayFmt.format(inc.date), mon: monFmt.format(inc.date), wd: wdFmt.format(inc.date) })
  }
  return out
})
const expanded = reactive<Record<string, boolean>>({})

// Subscribe
const email = ref('')
const emailError = ref('')
const busy = ref(false)
const toast = useMiToast()
function subscribe() {
  const v = email.value.trim()
  if (!v) emailError.value = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) emailError.value = 'Enter a valid email address, for example name@company.com.'
  else emailError.value = ''
  if (emailError.value) return
  busy.value = true
  setTimeout(() => {
    busy.value = false
    toast.success('Subscribed to status updates', { description: `We sent a confirmation to ${v}.` })
    email.value = ''
  }, 600)
}
watch(email, () => { if (emailError.value) emailError.value = '' })
</script>

<style scoped>
/* State tone: drives the hero, glyph and accents. */
.st { --tone: var(--mi-green); --tone-t: var(--mi-green-t); --ok-day: color-mix(in oklab, var(--mi-green) 38%, var(--mi-card)); }
.st[data-state=partial] { --tone: var(--mi-orange); --tone-t: var(--mi-orange-t); }
.st[data-state=major] { --tone: var(--mi-red); --tone-t: var(--mi-red-t); }

.st {
  max-width: 1120px; margin: 0 auto; padding: 12px 16px 48px;
  display: grid; gap: 64px; min-width: 0; font-family: var(--mi-font); color: var(--mi-label);
}
.st > * { min-width: 0; }
.num { font-variant-numeric: tabular-nums; }
p, h1, h2, h3, h4, ul, ol, dl, dd { margin: 0; }

/* Top bar: back link and the demo switch (not part of the product) */
.intro { display: grid; gap: 12px; min-width: 0; }
.topbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; margin-bottom: 8px; }
.back { display: inline-flex; align-items: center; gap: 2px; color: var(--mi-p-text, var(--mi-label2)); font-size: 14px; text-decoration: none; border-radius: 6px; }
.back:hover { text-decoration: underline; }
.demo {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; max-width: 100%;
  padding: 6px 6px 6px 14px; border-radius: 14px; border: 1px dashed var(--mi-sep2); background: var(--mi-fill4);
}
.demo-label { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--mi-label2); }
.demo :deep([role=radiogroup]), .demo :deep([role=tablist]) { max-width: 100%; }

/* Brand bar */
.brandbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.mbrand { display: inline-flex; align-items: center; gap: 10px; color: var(--mi-label); text-decoration: none; border-radius: 8px; }
.mark { width: 28px; height: 28px; fill: none; stroke: var(--mi-p); stroke-width: 2; flex: none; }
.mark.sm { width: 18px; height: 18px; stroke-width: 2.4; }
.brand-name { font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
.brand-sub { font-size: 15px; color: var(--mi-label2); padding-left: 10px; border-left: 1px solid var(--mi-sep); }

/* Hero */
.hero {
  position: relative; isolation: isolate; overflow: hidden; border-radius: 28px;
  background: var(--mi-card); border: 1px solid var(--mi-sep);
  padding: 28px 22px 26px; display: grid; gap: 28px;
  box-shadow: var(--mi-sh1);
}
.wash { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.w { position: absolute; inset: 0; opacity: 0; transition: opacity var(--mi-dur-4) var(--mi-ease); }
.w.on { opacity: 1; }
.w-ok { --c: var(--mi-green); }
.w-partial { --c: var(--mi-orange); }
.w-major { --c: var(--mi-red); }
.w {
  background:
    radial-gradient(90% 120% at 0% 0%, color-mix(in oklab, var(--c) 20%, transparent), transparent 62%),
    radial-gradient(60% 80% at 100% 100%, color-mix(in oklab, var(--c) 8%, transparent), transparent 70%),
    linear-gradient(180deg, color-mix(in oklab, var(--c) 5%, transparent), transparent);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--c) 22%, transparent);
  border-radius: inherit;
}
.hero-main { display: grid; gap: 22px; align-content: start; }
.glyph { position: relative; width: 76px; height: 76px; margin: 14px 0 0 14px; }
.glyph-in { position: absolute; inset: 0; display: grid; place-items: center; }
.disk {
  position: relative; z-index: 1; width: 76px; height: 76px; border-radius: 50%;
  display: grid; place-items: center; background: var(--tone); color: var(--mi-card);
  box-shadow: 0 10px 30px -8px color-mix(in oklab, var(--tone) 60%, transparent), inset 0 1px 0 color-mix(in oklab, var(--mi-card) 35%, transparent);
}
.halo { position: absolute; inset: -12px; border-radius: 50%; background: color-mix(in oklab, var(--tone) 14%, transparent); }
.ring {
  position: absolute; inset: -12px; border-radius: 50%; border: 1.5px solid color-mix(in oklab, var(--tone) 55%, transparent);
  animation: ring 2.8s var(--mi-ease) infinite; opacity: 0;
}
@keyframes ring {
  0% { transform: scale(.82); opacity: .9; }
  70%, 100% { transform: scale(1.55); opacity: 0; }
}
.pop-enter-active, .pop-leave-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.pop-enter-from, .pop-leave-to { transform: scale(.7); opacity: 0; }
.swap-enter-active, .swap-leave-active { transition: transform var(--mi-dur-3) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease); }
.swap-enter-from { transform: translateY(8px); opacity: 0; }
.swap-leave-to { transform: translateY(-6px); opacity: 0; }

.eyebrow { font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--mi-label2); }
.hero .eyebrow { color: var(--tone-t); }
.hero-copy { display: grid; gap: 12px; min-width: 0; }
.hero-title {
  font-size: clamp(36px, 6.4vw, 64px); line-height: 1.02; font-weight: 700; letter-spacing: -.035em;
  text-wrap: balance; max-width: 15ch;
}
.hero-lede { margin-top: 14px; font-size: clamp(16px, 1.6vw, 19px); line-height: 1.5; color: var(--mi-label2); max-width: 56ch; text-wrap: pretty; }
.hero-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin-top: 6px; font-size: 13px; color: var(--mi-label2); }
.hero-meta b { font-weight: 600; color: var(--mi-label); }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--tone); box-shadow: 0 0 0 3px color-mix(in oklab, var(--tone) 22%, transparent); }
.sep { display: none; width: 3px; height: 3px; border-radius: 50%; background: var(--mi-label3); }

.hero-fig { display: grid; gap: 4px; align-content: end; padding-top: 22px; border-top: 1px solid var(--mi-sep); }
.fig-label { font-size: 13px; font-weight: 600; color: var(--mi-label2); }
.fig { font-size: clamp(44px, 5.4vw, 60px); font-weight: 650; letter-spacing: -.04em; line-height: 1; }
.fig span { font-size: .5em; letter-spacing: 0; margin-left: 2px; color: var(--mi-label2); font-weight: 600; }
.fig-sub { font-size: 13px; line-height: 1.45; color: var(--mi-label2); max-width: 30ch; margin-top: 6px; }

/* Summary tiles */
.stats { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.tile {
  display: grid; gap: 6px; align-content: start; padding: 16px 16px 15px; border-radius: 18px;
  background: var(--mi-card); border: 1px solid var(--mi-sep);
}
.tile-label { font-size: 12.5px; font-weight: 500; color: var(--mi-label2); }
.tile-value { font-size: 28px; font-weight: 650; letter-spacing: -.03em; line-height: 1.05; }
.tile-value small, .kpis small, .reg-ms small { font-size: .52em; font-weight: 600; letter-spacing: 0; color: var(--mi-label2); }
.tile-sub { font-size: 12px; line-height: 1.35; color: var(--mi-label2); }
.warn { color: var(--mi-orange-t); }
.bad { color: var(--mi-red-t); }

/* Sections */
.sec { display: grid; gap: 22px; align-content: start; min-width: 0; }
.sec-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 24px; }
.sec-title { display: grid; gap: 8px; min-width: 0; }
.h2 { font-size: clamp(26px, 3.4vw, 34px); font-weight: 700; letter-spacing: -.028em; line-height: 1.1; text-wrap: balance; }
.h2-sm { font-size: clamp(22px, 2.4vw, 26px); }
.sec-lede { font-size: 15px; line-height: 1.5; color: var(--mi-label2); max-width: 62ch; }
.region { display: flex; align-items: center; gap: 10px; }
.region-label { font-size: 13px; color: var(--mi-label2); }
.region-count { font-size: 13px; color: var(--mi-label2); }

/* Services */
.groups { display: grid; gap: 14px; }
.group { background: var(--mi-card); border: 1px solid var(--mi-sep); border-radius: 22px; overflow: visible; }
.group-head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
  padding: 14px 16px 12px; border-bottom: 1px solid var(--mi-sep);
}
.group-title { font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--mi-label2); }
.group-note { font-size: 12.5px; color: var(--mi-label2); }
.group-note.warn { color: var(--mi-orange-t); }
.group-note.bad { color: var(--mi-red-t); }
.svc-list { list-style: none; padding: 0; }
.svc { padding: 18px 16px 14px; display: grid; gap: 12px; }
.svc + .svc { border-top: 1px solid var(--mi-sep); }
.svc-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.svc-name { min-width: 0; display: grid; gap: 3px; }
.svc-title { font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
.svc-desc { font-size: 13px; color: var(--mi-label2); line-height: 1.35; }
.svc-right { display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 6px; flex: none; }
.svc-up { font-size: 13px; color: var(--mi-label2); }

.bars {
  position: relative; display: grid; grid-template-columns: repeat(45, minmax(0, 1fr)); gap: 2px;
  height: 30px; align-items: end; border-radius: 6px; outline-offset: 5px; touch-action: pan-y; cursor: crosshair;
}
.d { height: 62%; border-radius: 1.5px; background: var(--ok-day); transition: opacity var(--mi-dur-1) var(--mi-ease); }
.d:nth-child(-n+45) { display: none; }
.d.c1 { height: 100%; background: var(--mi-orange); }
.d.c2 { height: 100%; background: var(--mi-red); }
.bars.active .d { opacity: .45; }
.bars.active .d.on { opacity: 1; }
.tip {
  position: absolute; top: calc(100% + 10px); left: 0; width: 216px; padding: 10px 12px; border-radius: 12px;
  background: var(--mi-elev); color: var(--mi-label); box-shadow: var(--mi-sh3); border: 1px solid var(--mi-sep);
  display: grid; gap: 3px; font-size: 12.5px; pointer-events: none; z-index: 5;
}
.tip::before {
  content: ''; position: absolute; top: -6px; left: calc(var(--cx) - 5px); width: 10px; height: 10px;
  background: var(--mi-elev); border-left: 1px solid var(--mi-sep); border-top: 1px solid var(--mi-sep); transform: rotate(45deg);
}
.tip-date { font-weight: 600; }
.tip-st { display: inline-flex; align-items: center; gap: 6px; color: var(--mi-label); }
.tip-note { color: var(--mi-label2); line-height: 1.35; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); }
.dot.c1 { background: var(--mi-orange); }
.dot.c2 { background: var(--mi-red); }
.bar-foot { display: flex; align-items: center; gap: 10px; font-size: 11.5px; color: var(--mi-label3); }
.rule { flex: 1; height: 1px; background: var(--mi-sep); }
.long { display: none; }
.legend { display: flex; flex-wrap: wrap; gap: 6px 20px; font-size: 12.5px; color: var(--mi-label2); padding: 0 4px; }
.legend span { display: inline-flex; align-items: center; gap: 8px; }
.sw { width: 4px; height: 12px; border-radius: 1.5px; display: inline-block; background: var(--ok-day); }
.sw.c0 { height: 8px; }
.sw.c1 { background: var(--mi-orange); }
.sw.c2 { background: var(--mi-red); }

/* Regions */
.reg-grid { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.reg {
  position: relative; display: grid; gap: 14px; padding: 14px 14px 12px; border-radius: 18px;
  background: var(--mi-card); border: 1px solid var(--mi-sep);
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.reg.dim { opacity: .38; }
.reg-1 { background: color-mix(in oklab, var(--mi-orange) 7%, var(--mi-card)); border-color: color-mix(in oklab, var(--mi-orange) 30%, var(--mi-sep)); }
.reg-2 { background: color-mix(in oklab, var(--mi-red) 7%, var(--mi-card)); border-color: color-mix(in oklab, var(--mi-red) 30%, var(--mi-sep)); }
.reg-top { display: flex; align-items: center; gap: 7px; min-width: 0; }
.reg-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mi-green); flex: none; box-shadow: 0 0 0 3px color-mix(in oklab, var(--mi-green) 18%, transparent); }
.reg-dot.c1 { background: var(--mi-orange); box-shadow: 0 0 0 3px color-mix(in oklab, var(--mi-orange) 20%, transparent); }
.reg-dot.c2 { background: var(--mi-red); box-shadow: 0 0 0 3px color-mix(in oklab, var(--mi-red) 20%, transparent); }
.reg-code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 11.5px; color: var(--mi-label2); }
.reg-state { margin-left: auto; font-size: 11px; color: var(--mi-label3); white-space: nowrap; }
.reg-1 .reg-state { color: var(--mi-orange-t); }
.reg-2 .reg-state { color: var(--mi-red-t); }
.reg-city { font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
.reg-country { font-size: 12.5px; color: var(--mi-label2); margin-top: 1px; }
.reg-foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; min-width: 0; }
.reg-foot :deep(svg) { flex: none; max-width: 46%; }
.reg-ms { font-size: 22px; font-weight: 650; letter-spacing: -.03em; line-height: 1; }
.reg-ms.down { font-size: 14px; font-weight: 600; letter-spacing: 0; color: var(--mi-red-t); }

/* Performance card */
.perf {
  display: grid; gap: 22px; padding: 20px 16px 16px; border-radius: 24px;
  background: var(--mi-card); border: 1px solid var(--mi-sep);
}
.perf-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 24px; }
.kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--mi-sep); border-bottom: 1px solid var(--mi-sep); }
.kpis > div { padding: 14px 0 14px 14px; display: grid; gap: 4px; }
.kpis > div:first-child { padding-left: 0; }
.kpis > div + div { border-left: 1px solid var(--mi-sep); }
.kpis dt { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--mi-label2); }
.kpis dd { font-size: 24px; font-weight: 650; letter-spacing: -.03em; line-height: 1.05; }
.key { width: 10px; height: 3px; border-radius: 2px; }
.key-p { background: var(--mi-p); }
.key-s { background: var(--mi-indigo); }
.chart { min-width: 0; }

/* Two column area */
.two { display: grid; gap: 64px; }
.side { display: grid; gap: 40px; align-content: start; }

/* Timeline */
.timeline { display: grid; }
.month { display: grid; }
.month-label {
  font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--mi-label3);
  padding: 14px 0 14px 34px; position: relative;
}
.month + .month .month-label::before { content: ''; position: absolute; top: 0; bottom: 0; left: 10.25px; width: 1.5px; background: var(--mi-sep); }
.inc { display: grid; grid-template-columns: 22px minmax(0, 1fr); column-gap: 12px; }
.inc-date { display: none; }
.inc-rail { position: relative; display: flex; justify-content: center; }
.inc-rail::before { content: ''; position: absolute; top: 0; bottom: 0; left: 50%; width: 1.5px; margin-left: -.75px; background: var(--mi-sep); }
.month:first-child .inc:first-of-type .inc-rail::before { top: 8px; }
.node {
  position: relative; z-index: 1; margin-top: 4px; width: 13px; height: 13px; border-radius: 50%;
  background: var(--mi-page); border: 2px solid var(--mi-green);
}
.inc-major .node { border-color: var(--mi-red); }
.inc-minor .node { border-color: var(--mi-orange); }
.inc:not(.inc-live) .node { border-color: color-mix(in oklab, var(--mi-label3) 80%, transparent); }
.inc-live .node { background: var(--tone); border-color: var(--tone); box-shadow: 0 0 0 5px color-mix(in oklab, var(--tone) 22%, transparent); }
.inc-live .inc-rail::before { background: linear-gradient(var(--tone), var(--mi-sep)); }
.inc-body { display: grid; gap: 8px; padding-bottom: 34px; min-width: 0; }
.inc-live .inc-body {
  padding: 16px 16px 18px; margin-bottom: 30px; border-radius: 18px;
  background: color-mix(in oklab, var(--tone) 6%, var(--mi-card)); border: 1px solid color-mix(in oklab, var(--tone) 28%, var(--mi-sep));
}
.inc-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; font-size: 12.5px; color: var(--mi-label2); }
.inc-impact::before, .inc-dur::before { content: ''; display: inline-block; width: 3px; height: 3px; border-radius: 50%; background: var(--mi-label3); margin-right: 10px; vertical-align: middle; }
.inc-title { font-size: 19px; font-weight: 650; letter-spacing: -.02em; line-height: 1.25; margin-top: 2px; text-wrap: balance; }
.inc-when { font-size: 13px; color: var(--mi-label2); }
.chips { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.chips li { font-size: 12px; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--mi-sep); color: var(--mi-label2); background: var(--mi-fill4); }
.updates { list-style: none; padding: 0; display: grid; gap: 14px; margin-top: 6px; }
.updates li { display: grid; gap: 4px; padding-left: 14px; border-left: 2px solid var(--mi-sep); }
.updates li.latest { border-left-color: color-mix(in oklab, var(--mi-label) 30%, transparent); }
.inc-live .updates li.latest { border-left-color: var(--tone); }
.u-head { display: flex; align-items: baseline; gap: 8px; }
.u-stage { font-size: 13.5px; font-weight: 600; }
.u-at { font-size: 12px; color: var(--mi-label3); }
.u-text { font-size: 14px; line-height: 1.55; color: var(--mi-label2); max-width: 64ch; }
.more {
  justify-self: start; display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; padding: 4px 0;
  font: inherit; font-size: 13px; font-weight: 500; color: var(--mi-p-text, var(--mi-p)); background: none; border: 0; cursor: pointer; border-radius: 6px;
}
.more:hover { text-decoration: underline; }
.more:focus-visible, .back:focus-visible, .mbrand:focus-visible, .bars:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.bars:focus-visible { outline-offset: 5px; }
.tl-end { padding-left: 34px; font-size: 13px; color: var(--mi-label2); }

/* Cards on the side */
.card { border-radius: 22px; background: var(--mi-card); border: 1px solid var(--mi-sep); padding: 18px; }
.card-title { font-size: 17px; font-weight: 650; letter-spacing: -.015em; line-height: 1.25; }
.card-title.lg { font-size: 21px; letter-spacing: -.022em; text-wrap: balance; }
.card-text { font-size: 14px; line-height: 1.55; color: var(--mi-label2); }
.mnt { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 16px; }
.cal {
  width: 64px; height: 74px; border-radius: 14px; overflow: hidden; display: grid; grid-template-rows: 22px 1fr auto;
  justify-items: center; background: var(--mi-elev); border: 1px solid var(--mi-sep); box-shadow: var(--mi-sh1); padding-bottom: 7px;
}
.cal-mon { width: 100%; text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; line-height: 22px; background: var(--mi-p); color: var(--mi-p-on); }
.cal-day { font-size: 28px; font-weight: 700; letter-spacing: -.03em; line-height: 1.15; align-self: center; }
.cal-wd { font-size: 11px; color: var(--mi-label2); line-height: 1; }
.mnt-body { display: grid; gap: 8px; min-width: 0; }
.mnt-time { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--mi-label); font-weight: 500; }
.mnt-foot { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.mnt-in { font-size: 12.5px; color: var(--mi-label2); }

.sub-card {
  display: grid; gap: 10px; position: relative; overflow: hidden;
  background:
    radial-gradient(120% 70% at 100% 0%, color-mix(in oklab, var(--mi-p) 12%, transparent), transparent 70%),
    var(--mi-card);
}
.sub-icon { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: var(--mi-p-tint); color: var(--mi-p-text, var(--mi-p)); margin-bottom: 6px; }
.sub { display: grid; gap: 12px; margin-top: 8px; }
.fine { font-size: 12px; line-height: 1.5; color: var(--mi-label2); }

/* Footer */
.foot { display: grid; gap: 14px; padding-top: 24px; border-top: 1px solid var(--mi-sep); font-size: 13px; color: var(--mi-label2); }
.foot-brand { display: inline-flex; align-items: center; gap: 8px; }
.foot-brand b { color: var(--mi-label); font-weight: 600; }
.foot-meta { display: flex; flex-wrap: wrap; gap: 6px 18px; color: var(--mi-label2); font-size: 12.5px; }

/* Dark: inner top highlight on raised surfaces */
:global(:root[data-theme=dark]) .st { --ok-day: color-mix(in oklab, var(--mi-green) 52%, var(--mi-elev)); }
:global(:root[data-theme=dark]) .tile,
:global(:root[data-theme=dark]) .group,
:global(:root[data-theme=dark]) .reg,
:global(:root[data-theme=dark]) .perf,
:global(:root[data-theme=dark]) .card,
:global(:root[data-theme=dark]) .hero { box-shadow: inset 0 1px 0 color-mix(in oklab, var(--mi-label) 7%, transparent); }

@media (prefers-reduced-motion: reduce) {
  .ring { animation: none; opacity: 0; }
  .swap-enter-from, .swap-leave-to { transform: none; }
  .pop-enter-from, .pop-leave-to { transform: none; }
}

@media (min-width: 640px) {
  .bars { grid-template-columns: repeat(90, minmax(0, 1fr)); gap: 3px; }
  .d:nth-child(-n+45) { display: block; }
  .long { display: inline; }
  .short { display: none; }
  .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .reg-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .inc { grid-template-columns: 56px 22px minmax(0, 1fr); column-gap: 16px; }
  .inc-date { display: grid; justify-items: end; align-content: start; gap: 1px; text-align: right; }
  .inc-day { font-size: 26px; font-weight: 700; letter-spacing: -.03em; line-height: 1; }
  .inc-mon { font-size: 11.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--mi-label2); margin-top: 4px; }
  .inc-wd { font-size: 11.5px; color: var(--mi-label3); }
  .month-label, .tl-end { padding-left: 110px; }
  .month + .month .month-label::before { left: 82.25px; }
}

@media (min-width: 768px) {
  .st { padding: 20px 32px 64px; gap: 104px; }
  .topbar { margin-bottom: 20px; }
  .brandbar { margin-bottom: 16px; }
  .hero { padding: 48px 48px 44px; gap: 36px; border-radius: 32px; }
  .hero-main { grid-template-columns: auto minmax(0, 1fr); gap: 32px; align-items: start; }
  .glyph { margin: 12px 0 0 12px; }
  .sep { display: block; }
  .hero-fig { margin-left: 120px; }
  .stats { gap: 12px; }
  .tile { padding: 20px 20px 18px; border-radius: 20px; }
  .tile-value { font-size: 32px; }
  .svc { padding: 20px 24px 16px; }
  .group-head { padding: 16px 24px 14px; }
  .perf { padding: 28px 28px 20px; border-radius: 28px; }
  .kpis > div { padding-left: 24px; }
  .kpis dd { font-size: 28px; }
  .reg { padding: 16px 16px 14px; }
  .card { padding: 22px; }
}

@media (min-width: 1024px) {
  .hero { padding: 64px 64px 56px; grid-template-columns: minmax(0, 1fr) auto; gap: 48px; }
  .hero-fig { margin-left: 0; padding-top: 0; border-top: 0; padding-left: 40px; border-left: 1px solid var(--mi-sep); min-width: 220px; }
  .glyph, .disk { width: 96px; height: 96px; }
  .glyph { margin: 16px 0 0 16px; }
  .halo, .ring { inset: -16px; }
  .two { grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 56px; }
}
</style>
