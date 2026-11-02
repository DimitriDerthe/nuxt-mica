<template>
  <div class="psb">
    <div class="psb__shell" :class="{ 'is-rail': rail }" @keydown.esc="open = false">
      <!-- Sidebar: static column from 768px, off-canvas panel below (slides with transform). -->
      <aside id="psb-side" class="psb__side" :class="{ 'is-open': open }" aria-label="Spoke & Dock">
        <div class="psb__brand">
          <span class="psb__mark" aria-hidden="true"><MiIcon :svg="glyph.bike" :size="18" /></span>
          <div class="psb__brand-text psb__hide-rail">
            <MiText variant="subheadline" weight="semibold">Spoke &amp; Dock</MiText>
            <MiText variant="caption2" tone="label2">Lisbon network · 412 docks</MiText>
          </div>
          <MiIconButton class="psb__close" label="Close navigation" variant="gray" size="small" @click="open = false">
            <MiIcon name="close" :size="14" />
          </MiIconButton>
        </div>

        <MiSearch v-model="query" class="psb__search psb__hide-rail" size="compact" placeholder="Jump to…" aria-label="Filter navigation" />

        <nav class="psb__nav" aria-label="Sections">
          <section v-for="g in visibleGroups" :key="g.id" class="psb__group">
            <button
              v-if="g.label" type="button" class="psb__group-head psb__hide-rail" :aria-expanded="isOpen(g.id)"
              :aria-controls="'psb-g-' + g.id" @click="closed[g.id] = !closed[g.id]"
            >
              <span>{{ g.label }}</span>
              <MiIcon name="chevron-down" :size="12" class="psb__chev" :class="{ 'is-closed': !isOpen(g.id) }" />
            </button>
            <Transition name="psb-fold">
              <ul v-show="isOpen(g.id)" :id="'psb-g-' + g.id" class="psb__list">
                <li v-for="it in g.items" :key="it.id">
                  <button
                    type="button" class="psb__item" :class="{ 'is-active': it.id === current }"
                    :aria-current="it.id === current ? 'page' : undefined" :title="rail ? it.label : undefined" @click="select(it.id)"
                  >
                    <span v-if="it.dot" class="psb__swatch" :style="{ background: `var(--mi-${it.dot})` }" aria-hidden="true" />
                    <MiIcon v-else v-bind="it.icon" :size="18" class="psb__icon" />
                    <span class="psb__label">{{ it.label }}</span>
                    <span v-if="it.pulse" class="psb__pulse" :class="'is-' + it.pulse.tone">
                      <i aria-hidden="true" /><span class="psb__pulse-text">{{ it.pulse.text }}</span>
                    </span>
                  </button>
                </li>
              </ul>
            </Transition>
          </section>
          <MiText v-if="!visibleGroups.length" variant="footnote" tone="label2" class="psb__none">No section matches “{{ query }}”.</MiText>
        </nav>

        <footer class="psb__foot">
          <MiAvatar name="Inês Carvalho" size="sm" tone="auto" decorative />
          <div class="psb__who psb__hide-rail">
            <MiText variant="footnote" weight="semibold">Inês Carvalho</MiText>
            <MiText variant="caption2" tone="label2">Ops lead · on shift</MiText>
          </div>
          <MiIconButton
            class="psb__rail-btn" :label="rail ? 'Expand sidebar' : 'Collapse sidebar to icons'" variant="gray" size="small"
            :pressed="rail" @click="rail = !rail"
          >
            <MiIcon name="sidebar" :size="15" />
          </MiIconButton>
        </footer>
      </aside>

      <div class="psb__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

      <!-- Faux content: every sidebar item swaps the page. -->
      <main class="psb__main" aria-labelledby="psb-title">
        <header class="psb__top">
          <MiIconButton
            class="psb__burger" label="Open navigation" variant="gray" size="regular" aria-controls="psb-side"
            :aria-expanded="open" @click="open = true"
          >
            <MiIcon :svg="glyph.burger" :size="18" />
          </MiIconButton>
          <div class="psb__title">
            <MiText variant="caption" tone="label2" weight="medium">{{ page.kicker }}</MiText>
            <MiText id="psb-title" variant="title3" as="h2" weight="bold">{{ page.title }}</MiText>
          </div>
          <MiBadge class="psb__live" tone="success" label="Live" dot />
        </header>

        <Transition name="psb-swap" mode="out-in">
          <div :key="current" class="psb__page">
            <MiText variant="callout" tone="label2" class="psb__lede">{{ page.lede }}</MiText>
            <div class="psb__stats">
              <MiStatTile v-for="s in page.stats" :key="s.label" v-bind="s" comparison="vs yesterday" />
            </div>
            <section class="psb__panel" aria-labelledby="psb-panel-title">
              <MiText id="psb-panel-title" variant="headline" as="h3">{{ page.panel }}</MiText>
              <ul class="psb__rows">
                <li v-for="r in page.rows" :key="r[0]" class="psb__row">
                  <span class="psb__row-main">
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

<style scoped>
.psb { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.psb__shell { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); height: 660px; overflow: hidden; background: var(--mi-page); }

/* Sidebar */
.psb__side {
  position: absolute; inset: 0 auto 0 0; z-index: 3; width: min(288px, 86%); display: flex; flex-direction: column; gap: 14px;
  padding: 16px 12px 12px; background: var(--mi-side); box-shadow: var(--mi-sh3); box-sizing: border-box;
  transform: translateX(-104%); visibility: hidden;
  transition: transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3);
}
.psb__side.is-open { transform: none; visibility: visible; transition: transform var(--mi-dur-3) var(--mi-ease); }
.psb__scrim { position: absolute; inset: 0; z-index: 2; background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.psb__scrim.is-on { opacity: 1; pointer-events: auto; }

.psb__brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
.psb__mark { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.psb__brand-text { display: grid; min-width: 0; flex: 1; }
.psb__close { margin-left: auto; }
.psb__search { margin: 0 2px; }

.psb__nav { flex: 1; min-height: 0; overflow-y: auto; display: grid; align-content: start; gap: 14px; scrollbar-width: thin; }
.psb__group { display: grid; gap: 2px; }
.psb__group-head {
  display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border: 0; border-radius: var(--mi-radius-s);
  background: none; color: var(--mi-label2); font: inherit; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; cursor: pointer;
}
.psb__group-head:hover { color: var(--mi-label); }
.psb__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.psb__chev.is-closed { transform: rotate(-90deg); }
.psb__list { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }

.psb__item {
  position: relative; display: flex; align-items: center; gap: 10px; width: 100%; min-height: 36px; padding: 0 10px; border: 0; border-radius: 10px;
  background: none; color: var(--mi-label); font: inherit; font-size: 14px; text-align: left; cursor: pointer;
}
.psb__item:hover { background: var(--mi-fill4); }
.psb__item:focus-visible, .psb__group-head:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.psb__item.is-active { background: var(--mi-card); box-shadow: var(--mi-sh1); font-weight: 600; }
/* Active marker: a brand tick that grows in with transform. */
.psb__item::before { content: ""; position: absolute; left: 3px; top: 10px; bottom: 10px; width: 3px; border-radius: 2px; background: var(--mi-p); transform: scaleY(0); transition: transform var(--mi-dur-2) var(--mi-spring); }
.psb__item.is-active::before { transform: scaleY(1); }
.psb__icon { flex: none; color: var(--mi-label2); }
.psb__item.is-active .psb__icon { color: var(--mi-p-text); }
.psb__swatch { flex: none; width: 10px; height: 10px; margin: 0 4px; border-radius: 3px; }
.psb__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Live pulse: a tiny status stat living in the nav row. */
.psb__pulse { display: inline-flex; align-items: center; gap: 5px; flex: none; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.psb__pulse i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.psb__pulse.is-good i { background: var(--mi-green); }
.psb__pulse.is-warn { color: var(--mi-orange-t); }
.psb__pulse.is-warn i { background: var(--mi-orange); animation: psb-beat 1.6s var(--mi-ease) infinite; }
.psb__pulse.is-bad { color: var(--mi-red-t); }
.psb__pulse.is-bad i { background: var(--mi-red); }
@keyframes psb-beat { 50% { transform: scale(1.6); opacity: .5; } }
@media (prefers-reduced-motion: reduce) { .psb__pulse i { animation: none !important; } }

.psb__none { padding: 6px 10px; }
.psb__foot { display: flex; align-items: center; gap: 10px; padding: 10px 6px 2px; border-top: 1px solid var(--mi-sep); }
.psb__who { display: grid; flex: 1; min-width: 0; }
.psb__rail-btn { display: none; margin-left: auto; }

/* Main */
.psb__main { min-width: 0; overflow-y: auto; padding: 16px; display: grid; align-content: start; gap: 16px; }
.psb__top { display: flex; align-items: center; gap: 12px; }
.psb__title { display: grid; flex: 1; min-width: 0; }
.psb__page { display: grid; gap: 16px; }
.psb__lede { max-width: 60ch; }
.psb__stats { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
.psb__panel { display: grid; gap: 8px; padding: 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.psb__rows { margin: 0; padding: 0; list-style: none; }
.psb__row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; }
.psb__row + .psb__row { border-top: 1px solid var(--mi-sep); }
.psb__row-main { display: grid; min-width: 0; }

.psb-fold-enter-active, .psb-fold-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.psb-fold-enter-from, .psb-fold-leave-to { opacity: 0; transform: translateY(-4px); }
.psb-swap-enter-active, .psb-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.psb-swap-enter-from { opacity: 0; transform: translateY(6px); }
.psb-swap-leave-to { opacity: 0; }

@container (min-width: 560px) {
  .psb__stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .psb__main { padding: 24px; }
}

@container (min-width: 768px) {
  .psb__shell { grid-template-columns: 252px minmax(0, 1fr); }
  .psb__side { position: relative; inset: auto; width: auto; transform: none; visibility: visible; transition: none; box-shadow: none; border-right: 1px solid var(--mi-sep); }
  .psb__close, .psb__burger, .psb__scrim { display: none; }
  .psb__main { padding: 28px 32px; }
}

/* Icon rail: a denser layout for wide screens; rows keep their names for screen readers. */
@container (min-width: 900px) {
  .psb__rail-btn { display: inline-flex; }
  .psb__shell.is-rail { grid-template-columns: 72px minmax(0, 1fr); }
  .is-rail .psb__hide-rail { display: none; }
  .is-rail .psb__side { padding-inline: 10px; align-items: stretch; }
  .is-rail .psb__brand { justify-content: center; padding: 0; }
  .is-rail .psb__item { justify-content: center; padding: 0; }
  .is-rail .psb__label, .is-rail .psb__pulse-text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .is-rail .psb__pulse { position: absolute; top: 6px; right: 10px; }
  .is-rail .psb__group + .psb__group { padding-top: 10px; border-top: 1px solid var(--mi-sep); }
  .is-rail .psb__foot { flex-direction: column; padding-inline: 0; }
  .is-rail .psb__rail-btn { margin: 0; }
}
</style>
