<template>
  <div class="bs">
    <!-- Top-navigation shell: no sidebar, the venue and the view live in one bar. -->
    <header class="bs__top">
      <div class="bs__brand">
        <span class="bs__logo" aria-hidden="true">O</span>
        <div class="bs__venue">
          <MiText as="span" variant="caption2" tone="label2" weight="semibold">Osteria Lume</MiText>
          <MiNativeSelect v-model="venue" size="sm" :options="venueOptions" aria-label="Venue" />
        </div>
      </div>
      <nav class="bs__tabs" aria-label="Views">
        <button
          v-for="t in tabs" :key="t.id" type="button" class="bs__tab" :aria-current="t.id === view ? 'page' : undefined" @click="view = t.id"
        >{{ t.label }}</button>
      </nav>
      <span class="bs__live"><i aria-hidden="true" />Service live · 20:40</span>
    </header>

    <main class="bs__main" aria-labelledby="bs-title">
      <div class="bs__head">
        <MiText id="bs-title" variant="title2" as="h2" weight="bold">{{ heading }}</MiText>
        <MiText variant="footnote" tone="label2">Tuesday 2 November · {{ data.name }} · {{ seatedCount }} of {{ tables.length }} tables occupied</MiText>
      </div>

      <template v-if="view === 'tonight'">
        <div class="bs__kpis">
          <MiStatTile v-for="k in data.kpis" :key="k.label" v-bind="k" comparison="vs last Tuesday" />
        </div>
        <div class="bs__split">
          <MiBarChart :data="data.covers" title="Covers by hour" subtitle="Booked and walk-ins" :height="220" />
          <section class="bs__card" aria-labelledby="bs-next">
            <MiText id="bs-next" variant="headline" as="h3">Arriving next</MiText>
            <ul class="bs__list">
              <li v-for="b in upcoming.slice(0, 4)" :key="b.id" class="bs__row">
                <MiText as="span" variant="footnote" weight="semibold" tabular class="bs__time">{{ b.time }}</MiText>
                <span class="bs__who"><MiText as="span" variant="subheadline" :lines="1">{{ b.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ b.size }} guests · {{ b.note }}</MiText></span>
                <MiButton variant="tinted" size="small" :aria-label="`Seat ${b.name}`" @click="seat(b.id)">Seat</MiButton>
              </li>
            </ul>
          </section>
        </div>
      </template>

      <section v-else-if="view === 'bookings'" class="bs__card" aria-label="All bookings tonight">
        <MiSegmented v-model="filter" :options="filters" label="Filter bookings" />
        <ul class="bs__list">
          <li v-for="b in filtered" :key="b.id" class="bs__row">
            <MiText as="span" variant="footnote" weight="semibold" tabular class="bs__time">{{ b.time }}</MiText>
            <span class="bs__who"><MiText as="span" variant="subheadline" :lines="1">{{ b.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ b.size }} guests · {{ b.note }}</MiText></span>
            <MiBadge v-if="b.seated" tone="success" label="Seated" dot />
            <MiButton v-else variant="tinted" size="small" :aria-label="`Seat ${b.name}`" @click="seat(b.id)">Seat</MiButton>
          </li>
        </ul>
      </section>

      <!-- Floor plan: each table cycles free → seated → dessert → free when tapped. -->
      <section v-else class="bs__card" aria-label="Floor plan">
        <div class="bs__legend" aria-hidden="true"><span v-for="(l, s) in stateLabel" :key="s" :class="'is-' + s">{{ l }}</span></div>
        <div class="bs__floor">
          <button
            v-for="t in tables" :key="t.id" type="button" class="bs__table" :class="['is-' + t.state, { 'is-round': t.seats <= 2 }]"
            :aria-label="`Table ${t.id}, ${t.seats} seats, ${stateLabel[t.state]}`" @click="cycle(t)"
          >
            <b>{{ t.id }}</b><small>{{ t.seats }}p</small>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type View = 'tonight' | 'bookings' | 'floor'
type TableState = 'free' | 'seated' | 'dessert'
interface Kpi { label: string, value: string, delta: string, trend?: 'up' | 'down', tone?: 'good' | 'bad' | 'neutral', spark: number[] }
interface Venue { name: string, kpis: Kpi[], covers: { label: string, value: number }[] }
interface Booking { id: number, time: string, name: string, size: number, note: string, seated: boolean }
interface Table { id: number, seats: number, state: TableState }

const tabs: { id: View, label: string }[] = [{ id: 'tonight', label: 'Tonight' }, { id: 'bookings', label: 'Bookings' }, { id: 'floor', label: 'Floor' }]
const titles: Record<View, string> = { tonight: 'Tonight at a glance', bookings: 'Bookings', floor: 'Floor plan' }
const stateLabel: Record<TableState, string> = { free: 'Free', seated: 'Seated', dessert: 'On dessert' }
const nextState: Record<TableState, TableState> = { free: 'seated', seated: 'dessert', dessert: 'free' }
const filters = [{ value: 'all', label: 'All' }, { value: 'waiting', label: 'Waiting' }, { value: 'seated', label: 'Seated' }]

const venues: Record<'canal' | 'market', Venue> = {
  canal: {
    name: 'Canal Street',
    kpis: [
      { label: 'Covers', value: '118', delta: '9%', spark: [72, 80, 86, 94, 101, 108, 118] },
      { label: 'Avg. spend', value: '£46.20', delta: '£1.80', spark: [41, 43, 42, 44, 45, 44, 46] },
      { label: 'Table turns', value: '1.8', delta: '0.2', spark: [1.4, 1.5, 1.5, 1.6, 1.7, 1.7, 1.8] },
      { label: 'Ticket time', value: '14 min', delta: '2 min', trend: 'up', tone: 'bad', spark: [11, 11, 12, 12, 13, 13, 14] }
    ],
    covers: [{ label: '17h', value: 8 }, { label: '18h', value: 22 }, { label: '19h', value: 38 }, { label: '20h', value: 31 }, { label: '21h', value: 14 }, { label: '22h', value: 5 }]
  },
  market: {
    name: 'Market Hall',
    kpis: [
      { label: 'Covers', value: '84', delta: '4%', trend: 'down', tone: 'bad', spark: [92, 90, 88, 89, 86, 85, 84] },
      { label: 'Avg. spend', value: '£38.90', delta: '£0.60', spark: [37, 38, 38, 37, 38, 39, 39] },
      { label: 'Table turns', value: '2.3', delta: '0.1', spark: [2.0, 2.1, 2.1, 2.2, 2.2, 2.2, 2.3] },
      { label: 'Ticket time', value: '11 min', delta: '1 min', trend: 'down', tone: 'good', spark: [13, 12, 12, 12, 11, 11, 11] }
    ],
    covers: [{ label: '17h', value: 12 }, { label: '18h', value: 19 }, { label: '19h', value: 24 }, { label: '20h', value: 17 }, { label: '21h', value: 9 }, { label: '22h', value: 3 }]
  }
}
const venueOptions = [{ value: 'canal', label: 'Canal Street' }, { value: 'market', label: 'Market Hall' }]

const view = ref<View>('tonight')
const venue = ref<string | number | null>('canal')
const filter = ref<string | number | null>('all')

const bookings = reactive<Booking[]>([
  { id: 1, time: '20:45', name: 'Priya Raman', size: 4, note: 'Birthday, cake at 22:00', seated: false },
  { id: 2, time: '20:50', name: 'Tomás Herrera', size: 2, note: 'Window if possible', seated: false },
  { id: 3, time: '21:00', name: 'Greta Lindqvist', size: 6, note: 'One gluten free', seated: false },
  { id: 4, time: '21:15', name: 'Kwame Asante', size: 3, note: 'Regular, likes table 7', seated: false },
  { id: 5, time: '21:30', name: 'Hélène Marchal', size: 2, note: 'Wine pairing', seated: false },
  { id: 6, time: '19:30', name: 'Daniel Kim', size: 5, note: 'Seated at table 12', seated: true }
])
const tables = reactive<Table[]>([
  { id: 1, seats: 2, state: 'seated' }, { id: 2, seats: 2, state: 'free' }, { id: 3, seats: 4, state: 'dessert' }, { id: 4, seats: 4, state: 'seated' },
  { id: 5, seats: 6, state: 'seated' }, { id: 6, seats: 2, state: 'free' }, { id: 7, seats: 4, state: 'free' }, { id: 8, seats: 2, state: 'dessert' },
  { id: 9, seats: 4, state: 'seated' }, { id: 10, seats: 8, state: 'free' }, { id: 11, seats: 2, state: 'seated' }, { id: 12, seats: 6, state: 'seated' }
])

const data = computed(() => venues[venue.value === 'market' ? 'market' : 'canal'])
const heading = computed(() => titles[view.value])
const upcoming = computed(() => bookings.filter(b => !b.seated))
const filtered = computed(() => filter.value === 'all' ? bookings : bookings.filter(b => b.seated === (filter.value === 'seated')))
const seatedCount = computed(() => tables.filter(t => t.state !== 'free').length)

function seat(id: number) {
  const b = bookings.find(x => x.id === id)
  if (!b) return
  b.seated = true
  const free = tables.find(t => t.state === 'free' && t.seats >= b.size)
  if (free) free.state = 'seated'
}
function cycle(t: Table) { t.state = nextState[t.state] }
</script>

<style scoped>
.bs { container-type: inline-size; display: grid; grid-template-rows: auto 1fr; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }

.bs__top { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px 12px; padding: 10px 14px; background: var(--mi-card); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.bs__brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.bs__logo { display: grid; place-items: center; width: 34px; height: 34px; flex: none; border-radius: 50%; font-weight: 800; color: var(--mi-p-on); background: radial-gradient(circle at 30% 30%, var(--mi-s), var(--mi-p)); }
.bs__venue { display: grid; gap: 2px; min-width: 0; }
.bs__live { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--mi-green-t); white-space: nowrap; }
.bs__live i { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-green) 25%, transparent); }
.bs__tabs { grid-column: 1 / -1; display: flex; gap: 4px; padding: 3px; border-radius: 11px; background: var(--mi-fill4); }
.bs__tab { flex: 1; padding: 7px 10px; border: 0; border-radius: 8px; font: inherit; font-size: 13px; font-weight: 600; color: var(--mi-label2); background: transparent; cursor: pointer; }
.bs__tab[aria-current="page"] { color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bs__tab:focus-visible, .bs__table:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.bs__main { display: grid; align-content: start; gap: 16px; padding: 18px 14px 28px; }
.bs__head { display: grid; gap: 2px; }
.bs__kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.bs__split { display: grid; gap: 12px; }
.bs__card { display: grid; align-content: start; gap: 12px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.bs__list { display: grid; margin: 0; padding: 0; list-style: none; }
.bs__row { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
.bs__row + .bs__row { box-shadow: inset 0 1px 0 var(--mi-sep); }
.bs__time { width: 44px; flex: none; color: var(--mi-p-text); }
.bs__who { display: grid; flex: 1; min-width: 0; }

.bs__legend { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: var(--mi-label2); }
.bs__legend span::before { content: ""; display: inline-block; width: 9px; height: 9px; margin-inline-end: 6px; border-radius: 3px; background: var(--tone); }
.bs__floor { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 10px; }
.is-free { --tone: var(--mi-fill2); }
.is-seated { --tone: var(--mi-p); }
.is-dessert { --tone: var(--mi-orange); }
.bs__table {
  display: grid; place-content: center; gap: 2px; aspect-ratio: 1.3; border: 0; border-radius: 12px; font: inherit; cursor: pointer;
  color: var(--mi-label); background: color-mix(in srgb, var(--tone) 18%, var(--mi-card)); box-shadow: inset 0 0 0 1.5px var(--tone);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.bs__table:active { transform: scale(.96); }
.bs__table.is-round { aspect-ratio: 1; border-radius: 50%; }
.bs__table b { font-size: 16px; }
.bs__table small { font-size: 11px; color: var(--mi-label2); }

@container (min-width: 720px) {
  .bs__top { display: flex; padding: 10px 20px; }
  .bs__tabs { flex: 0 1 340px; margin-inline: auto; }
  .bs__main { padding: 24px 24px 36px; }
  .bs__kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container (min-width: 960px) { .bs__split { grid-template-columns: 1.4fr 1fr; } }
</style>
