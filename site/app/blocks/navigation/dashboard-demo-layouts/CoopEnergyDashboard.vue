<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:h-175 mi:overflow-hidden mi:[background:var(--mi-page)] mi:@[820px]:grid-cols-[216px_minmax(0,_1fr)]">
      <!-- Sidebar (wide screens) -->
      <aside class="mi:hidden mi:@[820px]:flex mi:@[820px]:flex-col mi:@[820px]:gap-5.5 mi:@[820px]:pt-4.5 mi:@[820px]:px-3 mi:@[820px]:pb-3.5 mi:@[820px]:[background:var(--mi-side)] mi:@[820px]:border-r mi:@[820px]:border-r-sep" aria-label="Vale Community Energy">
        <div class="mi:@[820px]:flex mi:@[820px]:items-center mi:@[820px]:gap-2.5 mi:@[820px]:py-0 mi:@[820px]:px-1.5">
          <span class="mi:w-8 mi:h-8 mi:grid mi:place-items-center mi:rounded-[10px] mi:text-p-on mi:[background:linear-gradient(140deg,_var(--mi-orange),_var(--mi-p))]" aria-hidden="true"><MiIcon :svg="glyph.sun" :size="18" /></span>
          <MiText variant="subheadline" weight="bold">Vale Energy</MiText>
        </div>
        <nav class="mi:@[820px]:grid mi:@[820px]:gap-0.5" aria-label="Sections">
          <button
            v-for="n in nav" :key="n.id" type="button" class="mi:@[820px]:flex mi:@[820px]:items-center mi:@[820px]:gap-2.5 mi:@[820px]:min-h-9 mi:@[820px]:py-0 mi:@[820px]:px-2.5 mi:@[820px]:[border:0] mi:@[820px]:rounded-[10px] mi:@[820px]:[font:500_14px/1_var(--mi-font)] mi:@[820px]:text-left mi:@[820px]:cursor-pointer mi:@[820px]:focus-visible:[outline:2px_solid_var(--mi-p)] mi:@[820px]:focus-visible:outline-offset-[-2px]" :class="n.id === section ? 'mi:@[820px]:shadow-1 mi:@[820px]:font-semibold mi:@[820px]:text-label mi:@[820px]:bg-card' : 'mi:@[820px]:[background:none] mi:@[820px]:text-label2 mi:@[820px]:hover:text-label mi:@[820px]:hover:bg-fill4'"
            :aria-current="n.id === section ? 'page' : undefined" @click="section = n.id"
          >
            <MiIcon :name="n.glyph" :size="18" />{{ n.label }}
            <MiBadge v-if="n.badge" class="mi:@[820px]:ml-auto" :count="n.badge" tone="primary" />
          </button>
        </nav>
        <div class="mi:@[820px]:grid mi:@[820px]:gap-0.5 mi:@[820px]:mt-auto mi:@[820px]:p-3.5 mi:@[820px]:rounded-lg mi:@[820px]:[background:var(--mi-card)] mi:@[820px]:shadow-1">
          <MiText variant="caption2" tone="label2" weight="semibold">Your share</MiText>
          <MiText variant="title3" weight="bold" tabular>40 shares</MiText>
          <MiText variant="caption" tone="label2">Next payout €61.20 on 1 April</MiText>
        </div>
      </aside>

      <div class="mi:grid mi:grid-rows-[auto_minmax(0,_1fr)_auto] mi:min-w-0 mi:min-h-0 mi:@[820px]:grid-rows-[auto_minmax(0,_1fr)]">
        <header class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5 mi:py-3 mi:px-4 mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:@[820px]:py-3.5 mi:@[820px]:px-6">
          <span class="mi:w-7.5 mi:h-7.5 mi:grid mi:place-items-center mi:rounded-[10px] mi:text-p-on mi:[background:linear-gradient(140deg,_var(--mi-orange),_var(--mi-p))] mi:flex-[none] mi:@[820px]:hidden" aria-hidden="true"><MiIcon :svg="glyph.sun" :size="16" /></span>
          <div class="mi:grid mi:flex-[1_1_0] mi:min-w-0">
            <MiText class="mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis" variant="caption" tone="label2">Vale Community Energy</MiText>
            <MiText class="mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis" id="ce-title" variant="title3" as="h2" weight="bold">{{ current.label }}</MiText>
          </div>
          <!-- Narrow: search is an icon button that opens a full-width field under the bar. -->
          <MiIconButton class="mi:flex-none mi:@[1040px]:hidden!" label="Search" variant="gray" size="regular" :pressed="searchOpen" aria-controls="ce-search" :aria-expanded="searchOpen" @click="searchOpen = !searchOpen">
            <MiIcon name="search" :size="18" />
          </MiIconButton>
          <MiSearch id="ce-search" v-model="query" class="mi:@[1040px]:inline-flex! mi:@[1040px]:order-0 mi:@[1040px]:flex-none mi:@[1040px]:w-60!" :class="searchOpen ? 'mi:inline-flex! mi:order-5 mi:flex-[1_1_100%] mi:w-auto!' : 'mi:hidden! mi:w-60!'" size="compact" placeholder="Search sites, members" shortcut="⌘K" aria-label="Search sites and members" />
          <MiBadge class="mi:flex-none" :count="3" placement="top-right" :offset="2" aria-label="3 unread alerts">
            <template #target><MiIconButton label="Alerts" variant="gray" size="regular"><MiIcon name="bell" :size="18" /></MiIconButton></template>
          </MiBadge>
          <MiAvatar class="mi:flex-none" name="Gwen Pritchard" size="sm" tone="auto" />
        </header>

        <main class="mi:overflow-y-auto mi:min-h-0 mi:p-4 mi:@[560px]:p-5 mi:@[820px]:p-6" aria-labelledby="ce-title">
          <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(8px)]" leave-to-class="mi:opacity-0">
            <!-- Overview -->
            <div v-if="section === 'overview'" key="overview" class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-3 mi:@[1040px]:grid-cols-[repeat(3,_minmax(0,_1fr))_minmax(0,_1.1fr)]">
              <section class="mi:overflow-hidden mi:relative mi:grid mi:gap-2 mi:p-4.5 mi:rounded-xl mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-orange)_12%,_transparent),_transparent_70%)] mi:@[560px]:col-span-full mi:@[560px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.3fr)] mi:@[560px]:items-end mi:@[1040px]:col-[1_/_4]" aria-labelledby="ce-sky-title">
                <div class="mi:grid mi:gap-1 mi:content-start">
                  <MiText variant="caption" tone="label2" weight="medium">Now · 13:20 · clear skies</MiText>
                  <MiText id="ce-sky-title" variant="title1" as="h3" weight="bold" tabular>412 kW</MiText>
                  <MiText variant="footnote" tone="label2">across 4 sites, 77% of peak capacity</MiText>
                  <div class="mi:overflow-hidden mi:relative mi:h-6.5 mi:mt-2 mi:rounded-[8px] mi:[background:var(--mi-fill4)] mi:max-w-70" role="meter" aria-label="Community battery" aria-valuenow="78" aria-valuemin="0" aria-valuemax="100">
                    <span class="mi:absolute mi:inset-0 mi:[background:color-mix(in_srgb,_var(--mi-green)_32%,_transparent)] mi:origin-left" :style="{ transform: 'scaleX(.78)' }" />
                    <MiText variant="caption" weight="semibold" class="mi:block mi:relative mi:py-[5px] mi:px-2.5">Battery 78% · charging</MiText>
                  </div>
                </div>
                <!-- Sun path: a circular arc, so dash length and the sun position stay in step. -->
                <svg class="mi:overflow-visible mi:w-full mi:h-auto mi:max-h-37.5" viewBox="0 0 320 124" role="img" aria-label="Sun position: a little past midday, sunset at 19:42">
                  <path d="M0 110H320" class="mi:stroke-sep mi:[stroke-width:1]" />
                  <path :d="arc" class="mi:fill-[color:none] mi:stroke-fill mi:[stroke-width:2] mi:[stroke-dasharray:.012_.012]" pathLength="1" />
                  <path :d="arc" class="mi:fill-[color:none] mi:stroke-orange mi:[stroke-width:2.5] mi:[stroke-linecap:round]" pathLength="1" :stroke-dasharray="`${sunT} 1`" />
                  <circle :cx="sun.x" :cy="sun.y" r="16" class="mi:fill-orange/22" />
                  <circle :cx="sun.x" :cy="sun.y" r="7" class="mi:fill-orange" />
                  <text x="16" y="122" class="mi:[font:600_9px_var(--mi-font)] mi:fill-label2">07:05</text>
                  <text x="304" y="122" text-anchor="end" class="mi:[font:600_9px_var(--mi-font)] mi:fill-label2">19:42</text>
                </svg>
              </section>

              <MiStatTile v-for="s in stats" :key="s.label" v-bind="s" comparison="vs yesterday" />

              <section class="mi:grid mi:gap-3 mi:content-start mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0 mi:@[560px]:col-span-full mi:@[1040px]:col-[1_/_4]" aria-labelledby="ce-chart-title">
                <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:flex-wrap">
                  <MiText id="ce-chart-title" variant="headline" as="h3">Generation vs. demand</MiText>
                  <MiSegmented v-model="range" label="Range" :options="[{ value: 'day', label: 'Today' }, { value: 'week', label: '7 days' }]" />
                </div>
                <MiLineChart :key="String(range)" :categories="chart.categories" :series="chart.series" :card="false" :height="180" :unit="chart.unit" :toolbar="false" />
              </section>

              <section class="mi:grid mi:gap-3 mi:content-start mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0 mi:@[560px]:col-span-full mi:@[1040px]:col-[4] mi:@[1040px]:row-[1_/_span_3]" aria-labelledby="ce-sites-title">
                <MiText id="ce-sites-title" variant="headline" as="h3">Sites right now</MiText>
                <ul class="mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
                  <li v-for="s in sites" :key="s.name" class="mi:grid mi:gap-1.5">
                    <div class="mi:flex mi:justify-between mi:gap-2.5">
                      <MiText variant="subheadline" weight="medium" :lines="1">{{ s.name }}</MiText>
                      <MiText variant="footnote" tabular :tone="s.fault ? 'red' : 'label2'">{{ s.fault ? 'Inverter fault' : s.now + ' kW' }}</MiText>
                    </div>
                    <div class="mi:overflow-hidden mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill4)]" aria-hidden="true"><span class="mi:block mi:h-full mi:rounded-[inherit] mi:[background:linear-gradient(90deg,_var(--mi-orange),_var(--mi-p))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${s.now / s.peak})` }" /></div>
                  </li>
                </ul>
              </section>
            </div>

            <!-- Other sections: compact working views -->
            <div v-else-if="section === 'sites'" key="sites" class="mi:grid mi:gap-3">
              <div class="mi:overflow-x-auto mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
                <table class="mi:w-full mi:min-w-120 mi:border-collapse mi:text-[14px]">
                  <caption class="mi:overflow-hidden mi:whitespace-nowrap mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Sites and their output today</caption>
                  <thead><tr><th v-for="h in ['Site', 'Peak', 'Today', 'Status']" :key="h" scope="col" class="mi:py-3 mi:px-4 mi:text-left mi:whitespace-nowrap mi:border-b mi:border-b-sep mi:text-[12px] mi:font-semibold mi:text-label2">{{ h }}</th></tr></thead>
                  <tbody>
                    <tr v-for="(s, i) in sites" :key="s.name" :class="i === sites.length - 1 ? '' : 'mi:*:border-b mi:*:border-b-sep'">
                      <th scope="row" class="mi:py-3 mi:px-4 mi:text-left mi:whitespace-nowrap mi:font-medium">{{ s.name }}</th><td class="mi:py-3 mi:px-4 mi:text-left mi:whitespace-nowrap mi:tabular-nums mi:text-label2">{{ s.peak }} kWp</td><td class="mi:py-3 mi:px-4 mi:text-left mi:whitespace-nowrap mi:tabular-nums mi:text-label2">{{ s.today }} kWh</td>
                      <td class="mi:py-3 mi:px-4 mi:text-left mi:whitespace-nowrap mi:tabular-nums mi:text-label2"><MiBadge :label="s.fault ? 'Fault' : 'Online'" :tone="s.fault ? 'danger' : 'success'" dot /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else-if="section === 'members'" key="members" class="mi:grid mi:gap-3">
              <div class="mi:grid mi:gap-4 mi:content-start mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
                <MiText variant="headline" as="h3">412 members · 9 joined this month</MiText>
                <MiAvatarGroup :items="members" :max="6" size="md" />
                <MiProgress :value="412" :max="500" label="Towards the 500-member goal" value-text="412 / 500" />
              </div>
            </div>
            <div v-else-if="section === 'payouts'" key="payouts" class="mi:grid mi:gap-3">
              <MiBarChart title="Dividends paid" subtitle="Per share, last 6 quarters" :data="payouts" unit="¢" value-labels="all" />
            </div>
            <div v-else key="settings" class="mi:grid mi:gap-3">
              <div class="mi:grid mi:gap-0 mi:content-start mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0 mi:py-1">
                <div v-for="p in prefs" :key="p.id" class="mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-3 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
                  <div><MiText :id="'ce-pref-' + p.id" variant="subheadline" weight="medium">{{ p.label }}</MiText><MiText variant="caption" tone="label2">{{ p.hint }}</MiText></div>
                  <MiSwitch v-model="p.on" :aria-labelledby="'ce-pref-' + p.id" />
                </div>
              </div>
            </div>
          </Transition>
        </main>

        <!-- Narrow screens: bottom tab bar -->
        <div class="mi:[background:var(--mi-card)] mi:@[820px]:hidden">
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

