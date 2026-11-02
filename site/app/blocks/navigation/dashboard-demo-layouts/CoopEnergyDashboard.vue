<template>
  <div class="ce">
    <div class="ce__shell">
      <!-- Sidebar (wide screens) -->
      <aside class="ce__side" aria-label="Vale Community Energy">
        <div class="ce__brand">
          <span class="ce__logo" aria-hidden="true"><MiIcon :svg="glyph.sun" :size="18" /></span>
          <MiText variant="subheadline" weight="bold">Vale Energy</MiText>
        </div>
        <nav class="ce__nav" aria-label="Sections">
          <button
            v-for="n in nav" :key="n.id" type="button" class="ce__nav-item" :class="{ 'is-active': n.id === section }"
            :aria-current="n.id === section ? 'page' : undefined" @click="section = n.id"
          >
            <MiIcon :name="n.glyph" :size="18" />{{ n.label }}
            <MiBadge v-if="n.badge" class="ce__nav-badge" :count="n.badge" tone="primary" />
          </button>
        </nav>
        <div class="ce__member">
          <MiText variant="caption2" tone="label2" weight="semibold">Your share</MiText>
          <MiText variant="title3" weight="bold" tabular>40 shares</MiText>
          <MiText variant="caption" tone="label2">Next payout €61.20 on 1 April</MiText>
        </div>
      </aside>

      <div class="ce__body">
        <header class="ce__top">
          <span class="ce__logo ce__logo--top" aria-hidden="true"><MiIcon :svg="glyph.sun" :size="16" /></span>
          <div class="ce__top-title">
            <MiText variant="caption" tone="label2">Vale Community Energy</MiText>
            <MiText id="ce-title" variant="title3" as="h2" weight="bold">{{ current.label }}</MiText>
          </div>
          <!-- Narrow: search is an icon button that opens a full-width field under the bar. -->
          <MiIconButton class="ce__search-btn" label="Search" variant="gray" size="regular" :pressed="searchOpen" aria-controls="ce-search" :aria-expanded="searchOpen" @click="searchOpen = !searchOpen">
            <MiIcon name="search" :size="18" />
          </MiIconButton>
          <MiSearch id="ce-search" v-model="query" class="ce__search" :class="{ 'is-open': searchOpen }" size="compact" placeholder="Search sites, members" shortcut="⌘K" aria-label="Search sites and members" />
          <MiBadge :count="3" placement="top-right" :offset="2" aria-label="3 unread alerts">
            <template #target><MiIconButton label="Alerts" variant="gray" size="regular"><MiIcon name="bell" :size="18" /></MiIconButton></template>
          </MiBadge>
          <MiAvatar name="Gwen Pritchard" size="sm" tone="auto" />
        </header>

        <main class="ce__main" aria-labelledby="ce-title">
          <Transition name="ce-swap" mode="out-in">
            <!-- Overview -->
            <div v-if="section === 'overview'" key="overview" class="ce__grid">
              <section class="ce__sky" aria-labelledby="ce-sky-title">
                <div class="ce__sky-text">
                  <MiText variant="caption" tone="label2" weight="medium">Now · 13:20 · clear skies</MiText>
                  <MiText id="ce-sky-title" variant="title1" as="h3" weight="bold" tabular>412 kW</MiText>
                  <MiText variant="footnote" tone="label2">across 4 sites, 77% of peak capacity</MiText>
                  <div class="ce__battery" role="meter" aria-label="Community battery" aria-valuenow="78" aria-valuemin="0" aria-valuemax="100">
                    <span class="ce__battery-fill" :style="{ transform: 'scaleX(.78)' }" />
                    <MiText variant="caption" weight="semibold" class="ce__battery-label">Battery 78% · charging</MiText>
                  </div>
                </div>
                <!-- Sun path: a circular arc, so dash length and the sun position stay in step. -->
                <svg class="ce__arc" viewBox="0 0 320 124" role="img" aria-label="Sun position: a little past midday, sunset at 19:42">
                  <path d="M0 110H320" class="ce__horizon" />
                  <path :d="arc" class="ce__arc-track" pathLength="1" />
                  <path :d="arc" class="ce__arc-done" pathLength="1" :stroke-dasharray="`${sunT} 1`" />
                  <circle :cx="sun.x" :cy="sun.y" r="16" class="ce__sun-glow" />
                  <circle :cx="sun.x" :cy="sun.y" r="7" class="ce__sun" />
                  <text x="16" y="122" class="ce__arc-label">07:05</text>
                  <text x="304" y="122" text-anchor="end" class="ce__arc-label">19:42</text>
                </svg>
              </section>

              <MiStatTile v-for="s in stats" :key="s.label" v-bind="s" comparison="vs yesterday" />

              <section class="ce__card ce__chart" aria-labelledby="ce-chart-title">
                <div class="ce__card-head">
                  <MiText id="ce-chart-title" variant="headline" as="h3">Generation vs. demand</MiText>
                  <MiSegmented v-model="range" label="Range" :options="[{ value: 'day', label: 'Today' }, { value: 'week', label: '7 days' }]" />
                </div>
                <MiLineChart :key="String(range)" :categories="chart.categories" :series="chart.series" :card="false" :height="180" :unit="chart.unit" :toolbar="false" />
              </section>

              <section class="ce__card ce__sites" aria-labelledby="ce-sites-title">
                <MiText id="ce-sites-title" variant="headline" as="h3">Sites right now</MiText>
                <ul class="ce__site-list">
                  <li v-for="s in sites" :key="s.name" class="ce__site">
                    <div class="ce__site-top">
                      <MiText variant="subheadline" weight="medium" :lines="1">{{ s.name }}</MiText>
                      <MiText variant="footnote" tabular :tone="s.fault ? 'red' : 'label2'">{{ s.fault ? 'Inverter fault' : s.now + ' kW' }}</MiText>
                    </div>
                    <div class="ce__site-bar" aria-hidden="true"><span :style="{ transform: `scaleX(${s.now / s.peak})` }" /></div>
                  </li>
                </ul>
              </section>
            </div>

            <!-- Other sections: compact working views -->
            <div v-else-if="section === 'sites'" key="sites" class="ce__stack">
              <div class="ce__table-wrap">
                <table class="ce__table">
                  <caption class="ce__sr">Sites and their output today</caption>
                  <thead><tr><th scope="col">Site</th><th scope="col">Peak</th><th scope="col">Today</th><th scope="col">Status</th></tr></thead>
                  <tbody>
                    <tr v-for="s in sites" :key="s.name">
                      <th scope="row">{{ s.name }}</th><td>{{ s.peak }} kWp</td><td>{{ s.today }} kWh</td>
                      <td><MiBadge :label="s.fault ? 'Fault' : 'Online'" :tone="s.fault ? 'danger' : 'success'" dot /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="section === 'members'" key="members" class="ce__stack">
              <div class="ce__card ce__members">
                <MiText variant="headline" as="h3">412 members · 9 joined this month</MiText>
                <MiAvatarGroup :items="members" :max="6" size="md" />
                <MiProgress :value="412" :max="500" label="Towards the 500-member goal" value-text="412 / 500" />
              </div>
            </div>
            <div v-else-if="section === 'payouts'" key="payouts" class="ce__stack">
              <MiBarChart title="Dividends paid" subtitle="Per share, last 6 quarters" :data="payouts" unit="¢" value-labels="all" />
            </div>
            <div v-else key="settings" class="ce__stack">
              <div class="ce__card ce__prefs">
                <div v-for="p in prefs" :key="p.id" class="ce__pref">
                  <div><MiText :id="'ce-pref-' + p.id" variant="subheadline" weight="medium">{{ p.label }}</MiText><MiText variant="caption" tone="label2">{{ p.hint }}</MiText></div>
                  <MiSwitch v-model="p.on" :aria-labelledby="'ce-pref-' + p.id" />
                </div>
              </div>
            </div>
          </Transition>
        </main>

        <!-- Narrow screens: bottom tab bar -->
        <div class="ce__tabs">
          <MiTabBar :model-value="section" :items="nav.map(n => ({ id: n.id, label: n.short, icon: n.glyph, badge: n.badge }))" aria-label="Sections" @update:model-value="v => v && (section = v)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const glyph = { sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>' }

const nav = [
  { id: 'overview', label: 'Overview', short: 'Today', glyph: 'home' as const },
  { id: 'sites', label: 'Sites', short: 'Sites', glyph: 'grid' as const, badge: 1 },
  { id: 'members', label: 'Members', short: 'Members', glyph: 'people' as const },
  { id: 'payouts', label: 'Payouts', short: 'Payouts', glyph: 'billing' as const },
  { id: 'settings', label: 'Settings', short: 'Settings', glyph: 'settings' as const }
]
const section = ref('overview')
const searchOpen = ref(false)
const query = ref('')
const current = computed(() => nav.find(n => n.id === section.value) ?? nav[0]!)

// Sun path on a circle (centre 160,200, r 170) between the two horizon points.
const arc = 'M15.8 110A170 170 0 0 1 304.2 110'
const sunT = 0.52
const sun = computed(() => {
  const from = Math.PI - 0.5585
  const a = from - sunT * (from - 0.5585)
  return { x: +(160 + 170 * Math.cos(a)).toFixed(1), y: +(200 - 170 * Math.sin(a)).toFixed(1) }
})

const stats = [
  { label: 'Generated today', value: '2.84 MWh', delta: '11%', spark: [1.9, 2.1, 2.4, 2.2, 2.5, 2.6, 2.84] },
  { label: 'Used in the valley', value: '71%', delta: '4 pt', spark: [62, 64, 66, 65, 68, 70, 71] },
  { label: 'CO₂ avoided', value: '1.2 t', delta: '0.1 t', spark: [0.9, 1, 1, 1.1, 1.1, 1.15, 1.2] }
]

const range = ref<string | number | null>('day')
const charts = {
  day: {
    unit: ' kW', categories: ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h'],
    series: [{ name: 'Generation', data: [12, 120, 300, 405, 412, 330, 140, 8] }, { name: 'Demand', data: [180, 260, 240, 230, 250, 270, 340, 310] }]
  },
  week: {
    unit: ' MWh', categories: ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'],
    series: [{ name: 'Generation', data: [2.1, 2.4, 1.2, 1.8, 2.6, 2.56, 2.84] }, { name: 'Demand', data: [2.6, 2.7, 2.2, 2.0, 2.8, 2.7, 2.9] }]
  }
}
const chart = computed(() => charts[range.value === 'week' ? 'week' : 'day'])

const sites = [
  { name: 'Oakfield farm array', peak: 250, now: 214, today: 1480, fault: false },
  { name: 'Mill Lane school roof', peak: 120, now: 101, today: 690, fault: false },
  { name: 'Riverside bus depot', peak: 80, now: 62, today: 520, fault: false },
  { name: "St Anne's church hall", peak: 40, now: 0, today: 150, fault: true }
]

const members = [
  { name: 'Gwen Pritchard' }, { name: 'Rhys Morgan' }, { name: 'Anwen Lloyd' }, { name: 'Tomasz Nowak' },
  { name: 'Delyth Evans' }, { name: 'Sam Okoro' }, { name: 'Iolo Jenkins' }, { name: 'Bethan Hughes' }
]
const payouts = [
  { label: 'Q3 ’25', value: 118 }, { label: 'Q4 ’25', value: 92 }, { label: 'Q1 ’26', value: 104 },
  { label: 'Q2 ’26', value: 141 }, { label: 'Q3 ’26', value: 156 }, { label: 'Q4 ’26', value: 130 }
]
const prefs = reactive([
  { id: 'fault', label: 'Fault alerts by SMS', hint: 'Text the on-call volunteer when a site goes offline', on: true },
  { id: 'export', label: 'Export surplus to the grid', hint: 'When the battery is full and demand is low', on: true },
  { id: 'digest', label: 'Weekly members digest', hint: 'Sent on Monday at 08:00', on: false }
])
</script>

<style scoped>
.ce { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ce__shell { display: grid; grid-template-columns: minmax(0, 1fr); height: 700px; overflow: hidden; background: var(--mi-page); }
.ce__side { display: none; }
.ce__body { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; min-width: 0; min-height: 0; }

.ce__logo { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; color: var(--mi-p-on); background: linear-gradient(140deg, var(--mi-orange), var(--mi-p)); }
.ce__logo--top { flex: none; width: 30px; height: 30px; }

.ce__top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 16px; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); }
.ce__top-title { display: grid; flex: 1 1 0; min-width: 0; }
.ce__top-title > * { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ce__top > :not(.ce__top-title):not(.ce__search) { flex: none; }
/* Doubled class so it beats the display set by MiSearch itself. */
.ce__top .ce__search { display: none; width: 240px; }
.ce__top .ce__search.is-open { display: inline-flex; order: 5; flex: 1 1 100%; width: auto; }

.ce__main { min-height: 0; overflow-y: auto; padding: 16px; }
.ce__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
.ce__stack { display: grid; gap: 12px; }
.ce__card { display: grid; gap: 12px; align-content: start; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.ce__card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }

/* Sky hero */
.ce__sky { position: relative; display: grid; gap: 8px; padding: 18px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ce__sky::before { content: ""; position: absolute; inset: 0; z-index: -1; background: linear-gradient(180deg, color-mix(in srgb, var(--mi-orange) 12%, transparent), transparent 70%); }
.ce__sky-text { display: grid; gap: 4px; align-content: start; }
.ce__battery { position: relative; height: 26px; margin-top: 8px; border-radius: 8px; overflow: hidden; background: var(--mi-fill4); max-width: 280px; }
.ce__battery-fill { position: absolute; inset: 0; background: color-mix(in srgb, var(--mi-green) 32%, transparent); transform-origin: left; }
.ce__battery-label { position: relative; display: block; padding: 5px 10px; }
.ce__arc { width: 100%; height: auto; max-height: 150px; overflow: visible; }
.ce__horizon { stroke: var(--mi-sep); stroke-width: 1; }
.ce__arc-track { fill: none; stroke: var(--mi-fill); stroke-width: 2; stroke-dasharray: .012 .012; }
.ce__arc-done { fill: none; stroke: var(--mi-orange); stroke-width: 2.5; stroke-linecap: round; }
.ce__sun-glow { fill: color-mix(in srgb, var(--mi-orange) 22%, transparent); }
.ce__sun { fill: var(--mi-orange); }
.ce__arc-label { font: 600 9px var(--mi-font); fill: var(--mi-label2); }

/* Sites */
.ce__site-list { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.ce__site { display: grid; gap: 6px; }
.ce__site-top { display: flex; justify-content: space-between; gap: 10px; }
.ce__site-bar { height: 6px; border-radius: 3px; background: var(--mi-fill4); overflow: hidden; }
.ce__site-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--mi-orange), var(--mi-p)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

/* Sites table */
.ce__table-wrap { overflow-x: auto; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ce__table { width: 100%; min-width: 480px; border-collapse: collapse; font-size: 14px; }
.ce__table th, .ce__table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--mi-sep); white-space: nowrap; }
.ce__table thead th { font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.ce__table tbody th { font-weight: 500; }
.ce__table tbody tr:last-child > * { border-bottom: 0; }
.ce__table td { font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.ce__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.ce__members { gap: 16px; }
.ce__prefs { gap: 0; padding-block: 4px; }
.ce__pref { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; }
.ce__pref + .ce__pref { border-top: 1px solid var(--mi-sep); }

.ce__tabs { border-top: 1px solid var(--mi-sep); background: var(--mi-card); }

.ce-swap-enter-active, .ce-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ce-swap-enter-from { opacity: 0; transform: translateY(8px); }
.ce-swap-leave-to { opacity: 0; }

@container (min-width: 560px) {
  .ce__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ce__sky, .ce__chart, .ce__sites { grid-column: 1 / -1; }
  .ce__sky { grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); align-items: end; }
  .ce__main { padding: 20px; }
}

@container (min-width: 820px) {
  .ce__shell { grid-template-columns: 216px minmax(0, 1fr); }
  .ce__side { display: flex; flex-direction: column; gap: 22px; padding: 18px 12px 14px; background: var(--mi-side); border-right: 1px solid var(--mi-sep); }
  .ce__brand { display: flex; align-items: center; gap: 10px; padding: 0 6px; }
  .ce__nav { display: grid; gap: 2px; }
  .ce__nav-item { display: flex; align-items: center; gap: 10px; min-height: 36px; padding: 0 10px; border: 0; border-radius: 10px; background: none; color: var(--mi-label2); font: 500 14px/1 var(--mi-font); text-align: left; cursor: pointer; }
  .ce__nav-item:hover { color: var(--mi-label); background: var(--mi-fill4); }
  .ce__nav-item:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
  .ce__nav-item.is-active { color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1); font-weight: 600; }
  .ce__nav-badge { margin-left: auto; }
  .ce__member { display: grid; gap: 2px; margin-top: auto; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
  .ce__logo--top, .ce__tabs { display: none; }
  .ce__body { grid-template-rows: auto minmax(0, 1fr); }
  .ce__top { padding: 14px 24px; }
  .ce__main { padding: 24px; }
}

@container (min-width: 1040px) {
  .ce__top .ce__search { display: inline-flex; order: 0; flex: none; width: 240px; }
  .ce__top .ce__search-btn { display: none; }
  .ce__grid { grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 1.1fr); }
  .ce__sky { grid-column: 1 / 4; }
  .ce__sites { grid-column: 4; grid-row: 1 / span 3; }
  .ce__chart { grid-column: 1 / 4; }
}
</style>
