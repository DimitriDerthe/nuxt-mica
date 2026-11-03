<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <div class="mi:group/rail mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:h-165 mi:overflow-hidden mi:[background:var(--mi-page)] mi:@[768px]:grid-cols-[252px_minmax(0,_1fr)]" :data-rail="rail || undefined" :class="rail ? 'mi:@[900px]:grid-cols-[72px_minmax(0,_1fr)]' : ''" @keydown.esc="open = false">
      <!-- Sidebar: static column from 768px, off-canvas panel below (slides with transform). -->
      <aside id="psb-side" class="mi:absolute mi:top-0 mi:right-auto mi:bottom-0 mi:left-0 mi:z-3 mi:w-[min(288px,_86%)] mi:flex mi:flex-col mi:gap-3.5 mi:pt-4 mi:px-3 mi:pb-3 mi:[background:var(--mi-side)] mi:shadow-3 mi:box-border mi:@[768px]:relative mi:@[768px]:inset-auto mi:@[768px]:w-auto mi:@[768px]:transform-none mi:@[768px]:visible mi:@[768px]:[transition:none] mi:@[768px]:shadow-none mi:@[768px]:border-r mi:@[768px]:border-r-sep mi:@[900px]:group-data-[rail]/rail:px-2.5 mi:@[900px]:group-data-[rail]/rail:items-stretch" :class="open ? 'mi:transform-none mi:visible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]' : 'mi:transform-[translateX(-104%)] mi:invisible mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)]'" aria-label="Spoke & Dock">
        <div class="mi:flex mi:items-center mi:gap-2.5 mi:py-0 mi:px-1 mi:@[900px]:group-data-[rail]/rail:justify-center mi:@[900px]:group-data-[rail]/rail:p-0">
          <span class="mi:flex-[none] mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-[10px] mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true"><MiIcon :svg="glyph.bike" :size="18" /></span>
          <div class="mi:@[900px]:group-data-[rail]/rail:hidden mi:grid mi:min-w-0 mi:flex-1">
            <MiText variant="subheadline" weight="semibold">Spoke &amp; Dock</MiText>
            <MiText variant="caption2" tone="label2">Lisbon network · 412 docks</MiText>
          </div>
          <MiIconButton class="mi:ml-auto mi:@[768px]:hidden!" label="Close navigation" variant="gray" size="small" @click="open = false">
            <MiIcon name="close" :size="14" />
          </MiIconButton>
        </div>

        <MiSearch v-model="query" class="mi:my-0! mi:mx-0.5! mi:@[900px]:group-data-[rail]/rail:hidden!" size="compact" placeholder="Jump to…" aria-label="Filter navigation" />

        <nav class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:grid mi:content-start mi:gap-3.5 mi:[scrollbar-width:thin]" aria-label="Sections">
          <section v-for="g in visibleGroups" :key="g.id" class="mi:grid mi:gap-0.5 mi:@[900px]:group-data-[rail]/rail:not-first:pt-2.5 mi:@[900px]:group-data-[rail]/rail:not-first:border-t mi:@[900px]:group-data-[rail]/rail:not-first:border-t-sep">
            <button
              v-if="g.label" type="button" class="mi:[font:inherit] mi:text-[11px] mi:font-semibold mi:@[900px]:group-data-[rail]/rail:hidden mi:flex mi:items-center mi:justify-between mi:py-1.5 mi:px-2.5 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label2 mi:tracking-[.06em] mi:uppercase mi:cursor-pointer mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-expanded="isOpen(g.id)"
              :aria-controls="'psb-g-' + g.id" @click="closed[g.id] = !closed[g.id]"
            >
              <span>{{ g.label }}</span>
              <MiIcon name="chevron-down" :size="12" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="isOpen(g.id) ? '' : 'mi:transform-[rotate(-90deg)]'" />
            </button>
            <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(-4px)]" leave-to-class="mi:opacity-0 mi:transform-[translateY(-4px)]">
              <ul v-show="isOpen(g.id)" :id="'psb-g-' + g.id" class="mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
                <li v-for="it in g.items" :key="it.id">
                  <button
                    type="button" class="mi:[font:inherit] mi:text-[14px] mi:relative mi:flex mi:items-center mi:gap-2.5 mi:w-full mi:min-h-9 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[10px] mi:[background:none] mi:text-label mi:text-left mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:before:content-[''] mi:before:absolute mi:before:left-[3px] mi:before:top-2.5 mi:before:bottom-2.5 mi:before:w-[3px] mi:before:rounded-[2px] mi:before:[background:var(--mi-p)] mi:before:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:@[900px]:group-data-[rail]/rail:justify-center mi:@[900px]:group-data-[rail]/rail:p-0" :class="it.id === current ? 'mi:bg-card mi:font-semibold mi:shadow-1 mi:before:transform-[scaleY(1)]' : 'mi:hover:bg-fill4 mi:before:transform-[scaleY(0)]'"
                    :aria-current="it.id === current ? 'page' : undefined" :title="rail ? it.label : undefined" @click="select(it.id)"
                  >
                    <span v-if="it.dot" class="mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:my-0 mi:mx-1 mi:rounded-[3px]" :style="{ background: `var(--mi-${it.dot})` }" aria-hidden="true" />
                    <MiIcon v-else v-bind="it.icon" :size="18" class="mi:flex-none!" :class="it.id === current ? 'mi:text-p-text' : 'mi:text-label2'" />
                    <span class="mi:flex-1 mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:@[900px]:group-data-[rail]/rail:absolute mi:@[900px]:group-data-[rail]/rail:w-px mi:@[900px]:group-data-[rail]/rail:h-px mi:@[900px]:group-data-[rail]/rail:overflow-hidden mi:@[900px]:group-data-[rail]/rail:[clip-path:inset(50%)] mi:@[900px]:group-data-[rail]/rail:whitespace-nowrap">{{ it.label }}</span>
                    <span v-if="it.pulse" class="mi:inline-flex mi:items-center mi:gap-[5px] mi:flex-[none] mi:text-[11px] mi:font-semibold mi:tabular-nums mi:@[900px]:group-data-[rail]/rail:absolute mi:@[900px]:group-data-[rail]/rail:top-1.5 mi:@[900px]:group-data-[rail]/rail:right-2.5" :class="PULSE[it.pulse.tone].text">
                      <i class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:motion-reduce:animate-none!" :class="PULSE[it.pulse.tone].dot" aria-hidden="true" /><span class="mi:@[900px]:group-data-[rail]/rail:absolute mi:@[900px]:group-data-[rail]/rail:w-px mi:@[900px]:group-data-[rail]/rail:h-px mi:@[900px]:group-data-[rail]/rail:overflow-hidden mi:@[900px]:group-data-[rail]/rail:[clip-path:inset(50%)] mi:@[900px]:group-data-[rail]/rail:whitespace-nowrap">{{ it.pulse.text }}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </Transition>
          </section>
          <MiText v-if="!visibleGroups.length" variant="footnote" tone="label2" class="mi:py-1.5 mi:px-2.5">No section matches “{{ query }}”.</MiText>
        </nav>

        <footer class="mi:flex mi:items-center mi:gap-2.5 mi:pt-2.5 mi:px-1.5 mi:pb-0.5 mi:border-t mi:border-t-sep mi:@[900px]:group-data-[rail]/rail:flex-col mi:@[900px]:group-data-[rail]/rail:px-0">
          <MiAvatar name="Inês Carvalho" size="sm" tone="auto" decorative />
          <div class="mi:@[900px]:group-data-[rail]/rail:hidden mi:grid mi:flex-1 mi:min-w-0">
            <MiText variant="footnote" weight="semibold">Inês Carvalho</MiText>
            <MiText variant="caption2" tone="label2">Ops lead · on shift</MiText>
          </div>
          <MiIconButton
            class="mi:hidden! mi:@[900px]:inline-flex! mi:ml-auto mi:@[900px]:group-data-[rail]/rail:m-0" :label="rail ? 'Expand sidebar' : 'Collapse sidebar to icons'" variant="gray" size="small"
            :pressed="rail" @click="rail = !rail"
          >
            <MiIcon name="sidebar" :size="15" />
          </MiIconButton>
        </footer>
      </aside>

      <div class="mi:absolute mi:inset-0 mi:z-2 mi:[background:var(--mi-scrim)] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:@[768px]:hidden" :class="open ? 'mi:opacity-100 mi:pointer-events-auto' : 'mi:opacity-0 mi:pointer-events-none'" aria-hidden="true" @click="open = false" />

      <!-- Faux content: every sidebar item swaps the page. -->
      <main class="mi:min-w-0 mi:overflow-y-auto mi:p-4 mi:grid mi:content-start mi:gap-4 mi:@[560px]:p-6 mi:@[768px]:py-7 mi:@[768px]:px-8" aria-labelledby="psb-title">
        <header class="mi:flex mi:items-center mi:gap-3">
          <MiIconButton
            class="mi:@[768px]:hidden!" label="Open navigation" variant="gray" size="regular" aria-controls="psb-side"
            :aria-expanded="open" @click="open = true"
          >
            <MiIcon :svg="glyph.burger" :size="18" />
          </MiIconButton>
          <div class="mi:grid mi:flex-1 mi:min-w-0">
            <MiText variant="caption" tone="label2" weight="medium">{{ page.kicker }}</MiText>
            <MiText id="psb-title" variant="title3" as="h2" weight="bold">{{ page.title }}</MiText>
          </div>
          <MiBadge tone="success" label="Live" dot />
        </header>

        <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateY(6px)]" leave-to-class="mi:opacity-0">
          <div :key="current" class="mi:grid mi:gap-4">
            <MiText variant="callout" tone="label2" class="mi:max-w-[60ch]">{{ page.lede }}</MiText>
            <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-3">
              <MiStatTile v-for="s in page.stats" :key="s.label" v-bind="s" comparison="vs yesterday" />
            </div>
            <section class="mi:grid mi:gap-2 mi:p-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="psb-panel-title">
              <MiText id="psb-panel-title" variant="headline" as="h3">{{ page.panel }}</MiText>
              <ul class="mi:m-0 mi:p-0 mi:[list-style:none]">
                <li v-for="r in page.rows" :key="r[0]" class="mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
                  <span class="mi:grid mi:min-w-0">
                    <MiText variant="subheadline" weight="medium" :lines="1">{{ r[0] }}</MiText>
                    <MiText variant="caption" tone="label2" :lines="1">{{ r[1] }}</MiText>
                  </span>
                  <MiText variant="subheadline" weight="semibold" tabular>{{ r[2] }}</MiText>
                </li>
              </ul>
            </section>
          </div>
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const glyph = {
  burger: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9 8.5 6H6.5M14 6h2.5"/>',
  pin: '<path d="M12 21s-6-5.6-6-10.5a6 6 0 1 1 12 0C18 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2"/>',
  bars: '<path d="M6 19v-7M12 19V5M18 19v-10"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2.5"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>'
}

type Tone = 'good' | 'warn' | 'bad'
const PULSE: Record<Tone, { text: string, dot: string }> = {
  good: { text: 'mi:text-label2', dot: 'mi:bg-green' },
  warn: { text: 'mi:text-orange-t', dot: 'mi:bg-orange mi:[--mi-beat:1.6] mi:[--mi-beat-o:.5] mi:animate-[beat_1.6s_var(--mi-ease)_infinite]' },
  bad: { text: 'mi:text-red-t', dot: 'mi:bg-red' }
}
interface Item { id: string, label: string, icon?: { name?: 'home' | 'grid' | 'people', svg?: string }, dot?: string, pulse?: { text: string, tone: Tone } }
interface Group { id: string, label?: string, items: Item[] }

const groups: Group[] = [
  {
    id: 'operate',
    items: [
      { id: 'overview', label: 'Overview', icon: { name: 'home' } },
      { id: 'map', label: 'Live map', icon: { svg: glyph.pin }, pulse: { text: '1,186', tone: 'good' } },
      { id: 'stations', label: 'Stations', icon: { name: 'grid' }, pulse: { text: '3 empty', tone: 'warn' } },
      { id: 'fleet', label: 'Fleet', icon: { svg: glyph.bike }, pulse: { text: '41 in repair', tone: 'bad' } },
      { id: 'riders', label: 'Riders', icon: { name: 'people' }, pulse: { text: '+128', tone: 'good' } }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'revenue', label: 'Revenue', icon: { svg: glyph.bars } },
      { id: 'ride-time', label: 'Ride time', icon: { svg: glyph.clock } },
      { id: 'maintenance', label: 'Maintenance', icon: { svg: glyph.wrench } }
    ]
  },
  {
    id: 'views',
    label: 'Saved views',
    items: [
      { id: 'alfama', label: 'Alfama hills rebalancing', dot: 'orange' },
      { id: 'night', label: 'Night rides over 30 min', dot: 'indigo' },
      { id: 'airport', label: 'Airport corridor', dot: 'teal' }
    ]
  }
]

type Stat = { label: string, value: string, delta: string, trend?: 'up' | 'down', tone?: 'good' | 'bad' | 'neutral', spark: number[] }
interface Page { kicker: string, title: string, lede: string, stats: Stat[], panel: string, rows: [string, string, string][] }

const pages: Record<string, Page> = {
  overview: {
    kicker: 'Operate', title: 'Network overview', lede: 'Morning commute peak cleared at 9:40. Rebalancing vans are back at the depot.',
    stats: [
      { label: 'Rides today', value: '8,412', delta: '6.1%', spark: [5, 7, 6, 8, 9, 8, 11] },
      { label: 'Bikes on street', value: '1,186', delta: '2.4%', spark: [9, 10, 10, 11, 11, 12, 12] },
      { label: 'Docks full', value: '17', delta: '4', trend: 'down', spark: [24, 22, 21, 20, 19, 18, 17] }
    ],
    panel: 'Needs attention',
    rows: [['Cais do Sodré', '0 bikes · 24 docks', 'Empty'], ['Praça do Comércio', '31 of 32 docks taken', 'Full'], ['Santa Apolónia', 'Lock fault on dock 7', '1 fault'], ['Campo de Ourique', 'Van ETA 12 min', 'Rebalancing']]
  },
  map: {
    kicker: 'Operate', title: 'Live map', lede: 'Bikes in motion right now, grouped by parish. Riverside lanes carry 38% of traffic.',
    stats: [
      { label: 'Moving now', value: '642', delta: '9.0%', spark: [3, 4, 6, 5, 7, 8, 9] },
      { label: 'Avg. speed', value: '14.2 km/h', delta: '0.3', spark: [13, 14, 14, 13, 14, 14, 14] },
      { label: 'Hill climbs', value: '211', delta: '12%', spark: [4, 5, 5, 6, 6, 7, 8] }
    ],
    panel: 'Busiest parishes',
    rows: [['Santa Maria Maior', '182 bikes moving', '28%'], ['Misericórdia', '121 bikes moving', '19%'], ['Arroios', '96 bikes moving', '15%'], ['Belém', '74 bikes moving', '12%']]
  },
  stations: {
    kicker: 'Operate', title: 'Stations', lede: 'Three stations are empty and two are about to fill. Suggested moves are ready.',
    stats: [
      { label: 'Online', value: '409 / 412', delta: '1', trend: 'down', tone: 'bad', spark: [412, 412, 411, 410, 410, 409, 409] },
      { label: 'Empty', value: '3', delta: '2', trend: 'down', spark: [7, 6, 6, 5, 4, 4, 3] },
      { label: 'Fill rate', value: '61%', delta: '3 pt', spark: [55, 56, 58, 57, 59, 60, 61] }
    ],
    panel: 'Suggested moves',
    rows: [['Rossio → Cais do Sodré', '9 bikes · van 2', '14 min'], ['Marquês → Saldanha', '6 bikes · van 1', '9 min'], ['Belém → Alcântara', '4 bikes · cargo bike', '11 min'], ['Graça → Martim Moniz', '5 bikes · downhill', '6 min']]
  },
  fleet: {
    kicker: 'Operate', title: 'Fleet health', lede: '41 bikes are in the workshop. Brake pads drive most tickets this week.',
    stats: [
      { label: 'In service', value: '1,245', delta: '0.8%', spark: [8, 8, 9, 9, 9, 10, 10] },
      { label: 'In repair', value: '41', delta: '6', tone: 'bad', spark: [30, 32, 33, 36, 38, 40, 41] },
      { label: 'Avg. battery', value: '72%', delta: '4 pt', trend: 'down', tone: 'bad', spark: [80, 79, 77, 76, 74, 73, 72] }
    ],
    panel: 'Workshop queue',
    rows: [['LX-0412 · e-bike', 'Brake pads, rear', 'Today'], ['LX-1187 · classic', 'Chain slipped', 'Today'], ['LX-0090 · e-bike', 'Battery swell check', 'Tomorrow'], ['LX-0733 · cargo', 'Dock latch bent', 'Thu']]
  },
  riders: {
    kicker: 'Operate', title: 'Riders', lede: '128 new riders signed up today, most of them from the Parque das Nações campaign.',
    stats: [
      { label: 'Active riders', value: '23,904', delta: '1.9%', spark: [6, 7, 7, 8, 8, 9, 9] },
      { label: 'New today', value: '128', delta: '31%', spark: [2, 3, 3, 4, 3, 5, 7] },
      { label: 'Day passes', value: '1,040', delta: '4.2%', spark: [5, 6, 6, 7, 7, 7, 8] }
    ],
    panel: 'Top sign-up sources',
    rows: [['Parque das Nações poster', 'QR code at 6 stations', '54'], ['Referral from a friend', '1 free week each', '38'], ['App store search', 'Organic', '22'], ['Tourist office', 'Day pass bundle', '14']]
  },
  revenue: {
    kicker: 'Reports', title: 'Revenue', lede: 'Passes outsell single rides two to one since the spring price change.',
    stats: [
      { label: 'Today', value: '€9,840', delta: '5.6%', spark: [6, 7, 7, 8, 8, 9, 10] },
      { label: 'Month to date', value: '€182k', delta: '11%', spark: [3, 4, 5, 6, 7, 8, 9] },
      { label: 'Refunds', value: '€212', delta: '18%', tone: 'bad', spark: [2, 2, 3, 3, 4, 4, 5] }
    ],
    panel: 'By product',
    rows: [['Annual pass', '9,120 holders', '€71k'], ['Monthly pass', '4,388 holders', '€58k'], ['Single ride', '31,200 rides', '€39k'], ['Day pass', '2,904 sold', '€14k']]
  },
  'ride-time': {
    kicker: 'Reports', title: 'Ride time', lede: 'Median ride is 11 minutes. Weekend rides run twice as long along the river.',
    stats: [
      { label: 'Median ride', value: '11 min', delta: '0.4', spark: [10, 11, 10, 11, 11, 11, 11] },
      { label: 'Over 30 min', value: '6.2%', delta: '0.9 pt', tone: 'neutral', spark: [5, 5, 6, 6, 6, 6, 6] },
      { label: 'Peak hour', value: '8–9 am', delta: '0', tone: 'neutral', spark: [8, 8, 8, 8, 8, 8, 8] }
    ],
    panel: 'Longest corridors',
    rows: [['Belém ↔ Cais do Sodré', 'Riverside lane', '24 min'], ['Oriente ↔ Santa Apolónia', 'Eastern waterfront', '21 min'], ['Benfica ↔ Marquês', 'Uphill most of the way', '19 min'], ['Alvalade ↔ Saldanha', 'Avenida da República', '12 min']]
  },
  maintenance: {
    kicker: 'Reports', title: 'Maintenance', lede: 'Mean time to repair dropped below a day for the first time this year.',
    stats: [
      { label: 'Time to repair', value: '21 h', delta: '3 h', trend: 'down', spark: [30, 28, 27, 25, 24, 22, 21] },
      { label: 'Tickets opened', value: '58', delta: '7', tone: 'bad', spark: [40, 44, 46, 50, 52, 55, 58] },
      { label: 'Parts on hand', value: '92%', delta: '2 pt', spark: [86, 88, 89, 90, 90, 91, 92] }
    ],
    panel: 'Most common fixes',
    rows: [['Brake pads', '19 tickets', '33%'], ['Tyre puncture', '14 tickets', '24%'], ['Dock latch', '9 tickets', '16%'], ['Battery contacts', '7 tickets', '12%']]
  },
  alfama: {
    kicker: 'Saved view', title: 'Alfama hills rebalancing', lede: 'Riders roll downhill and leave the top stations empty by noon.',
    stats: [
      { label: 'Uphill gap', value: '37 bikes', delta: '5', trend: 'down', spark: [48, 46, 44, 42, 40, 39, 37] },
      { label: 'Van trips', value: '6', delta: '1', tone: 'neutral', spark: [5, 6, 5, 6, 6, 5, 6] },
      { label: 'Uphill bonus', value: '212 claims', delta: '22%', spark: [100, 120, 140, 160, 180, 200, 212] }
    ],
    panel: 'Top of the hill',
    rows: [['Castelo', '2 bikes · 18 docks', 'Low'], ['Graça', '4 bikes · 20 docks', 'Low'], ['Senhora do Monte', '1 bike · 12 docks', 'Empty'], ['São Vicente', '7 bikes · 16 docks', 'OK']]
  },
  night: {
    kicker: 'Saved view', title: 'Night rides over 30 min', lede: 'Long rides after midnight, flagged for lighting and safety checks.',
    stats: [
      { label: 'Rides', value: '84', delta: '9%', tone: 'neutral', spark: [70, 72, 75, 77, 80, 82, 84] },
      { label: 'Light faults', value: '3', delta: '2', trend: 'down', spark: [8, 7, 6, 5, 5, 4, 3] },
      { label: 'Support calls', value: '1', delta: '1', trend: 'down', spark: [3, 2, 2, 2, 1, 2, 1] }
    ],
    panel: 'Flagged rides',
    rows: [['01:12 · Bairro Alto → Belém', '46 min · lights OK', 'Review'], ['02:40 · Cais do Sodré → Algés', '38 min · rear light off', 'Fault'], ['00:55 · Intendente → Oriente', '33 min · lights OK', 'Review'], ['03:05 · Santos → Alcântara', '31 min · lights OK', 'Review']]
  },
  airport: {
    kicker: 'Saved view', title: 'Airport corridor', lede: 'Travellers ride from Oriente to the terminal; returns cluster after 6 pm.',
    stats: [
      { label: 'Corridor rides', value: '316', delta: '14%', spark: [200, 220, 240, 260, 280, 300, 316] },
      { label: 'Luggage racks used', value: '71%', delta: '6 pt', spark: [55, 58, 60, 64, 66, 69, 71] },
      { label: 'Terminal docks free', value: '9', delta: '3', trend: 'down', tone: 'bad', spark: [14, 13, 12, 12, 11, 10, 9] }
    ],
    panel: 'Corridor stations',
    rows: [['Aeroporto T1', '9 docks free', 'Watch'], ['Encarnação', '14 bikes', 'OK'], ['Oriente', '22 bikes', 'OK'], ['Moscavide', '6 bikes', 'Low']]
  }
}

const current = ref('overview')
const open = ref(false)
const rail = ref(false)
const query = ref('')
const closed = reactive<Record<string, boolean>>({ views: false })

const page = computed(() => pages[current.value] ?? pages.overview!)
const visibleGroups = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return groups
  return groups.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) })).filter(g => g.items.length)
})
/** A filter or the icon rail always shows every row, whatever the section state. */
const isOpen = (id: string) => !closed[id] || !!query.value || rail.value

function select(id: string) {
  current.value = id
  open.value = false
}
</script>
