<template>
  <div class="mi:@container mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <!-- Top-navigation shell: no sidebar, the venue and the view live in one bar. -->
    <header class="mi:grid mi:grid-cols-[1fr_auto] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:py-2.5 mi:px-3.5 mi:[background:var(--mi-card)] mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:@[720px]:flex mi:@[720px]:py-2.5 mi:@[720px]:px-5">
      <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
        <span class="mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:flex-[none] mi:rounded-[50%] mi:font-extrabold mi:text-p-on mi:[background:radial-gradient(circle_at_30%_30%,_var(--mi-s),_var(--mi-p))]" aria-hidden="true">O</span>
        <div class="mi:grid mi:gap-0.5 mi:min-w-0">
          <MiText as="span" variant="caption2" tone="label2" weight="semibold">Osteria Lume</MiText>
          <MiNativeSelect v-model="venue" size="sm" :options="venueOptions" aria-label="Venue" />
        </div>
      </div>
      <nav class="mi:col-span-full mi:flex mi:gap-1 mi:p-[3px] mi:rounded-[11px] mi:[background:var(--mi-fill4)] mi:@[720px]:flex-[0_1_340px] mi:@[720px]:mx-auto" aria-label="Views">
        <button
          v-for="t in tabs" :key="t.id" type="button" class="mi:[font:inherit] mi:text-[13px] mi:font-semibold mi:flex-1 mi:py-[7px] mi:px-2.5 mi:[border:0] mi:rounded-[8px] mi:text-label2 mi:[background:transparent] mi:cursor-pointer mi:[&[aria-current='page']]:text-label mi:[&[aria-current='page']]:[background:var(--mi-card)] mi:[&[aria-current='page']]:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-current="t.id === view ? 'page' : undefined" @click="view = t.id"
        >{{ t.label }}</button>
      </nav>
      <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[12px] mi:font-semibold mi:text-green-t mi:whitespace-nowrap"><i class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--mi-green)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-green)_25%,_transparent)]" aria-hidden="true" />Service live · 20:40</span>
    </header>

    <main class="mi:grid mi:content-start mi:gap-4 mi:pt-4.5 mi:px-3.5 mi:pb-7 mi:@[720px]:pt-6 mi:@[720px]:px-6 mi:@[720px]:pb-9" aria-labelledby="bs-title">
      <div class="mi:grid mi:gap-0.5">
        <MiText id="bs-title" variant="title2" as="h2" weight="bold">{{ heading }}</MiText>
        <MiText variant="footnote" tone="label2">Tuesday 2 November · {{ data.name }} · {{ seatedCount }} of {{ tables.length }} tables occupied</MiText>
      </div>

      <template v-if="view === 'tonight'">
        <div class="mi:grid mi:grid-cols-2 mi:gap-2.5 mi:@[720px]:grid-cols-4">
          <MiStatTile v-for="k in data.kpis" :key="k.label" v-bind="k" comparison="vs last Tuesday" />
        </div>
        <div class="mi:grid mi:gap-3 mi:@[960px]:grid-cols-[1.4fr_1fr]">
          <MiBarChart :data="data.covers" title="Covers by hour" subtitle="Booked and walk-ins" :height="220" />
          <section class="mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="bs-next">
            <MiText id="bs-next" variant="headline" as="h3">Arriving next</MiText>
            <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="b in upcoming.slice(0, 4)" :key="b.id" class="mi:flex mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:shadow-[inset_0_1px_0_var(--mi-sep)]">
                <MiText as="span" variant="footnote" weight="semibold" tabular class="mi:text-p-text! mi:w-11 mi:flex-[none]">{{ b.time }}</MiText>
                <span class="mi:grid mi:flex-1 mi:min-w-0"><MiText as="span" variant="subheadline" :lines="1">{{ b.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ b.size }} guests · {{ b.note }}</MiText></span>
                <MiButton variant="tinted" size="small" :aria-label="`Seat ${b.name}`" @click="seat(b.id)">Seat</MiButton>
              </li>
            </ul>
          </section>
        </div>
      </template>

      <section v-else-if="view === 'bookings'" class="mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-label="All bookings tonight">
        <MiSegmented v-model="filter" :options="filters" label="Filter bookings" />
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="b in filtered" :key="b.id" class="mi:flex mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:not-first:shadow-[inset_0_1px_0_var(--mi-sep)]">
            <MiText as="span" variant="footnote" weight="semibold" tabular class="mi:text-p-text! mi:w-11 mi:flex-[none]">{{ b.time }}</MiText>
            <span class="mi:grid mi:flex-1 mi:min-w-0"><MiText as="span" variant="subheadline" :lines="1">{{ b.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ b.size }} guests · {{ b.note }}</MiText></span>
            <MiBadge v-if="b.seated" tone="success" label="Seated" dot />
            <MiButton v-else variant="tinted" size="small" :aria-label="`Seat ${b.name}`" @click="seat(b.id)">Seat</MiButton>
          </li>
        </ul>
      </section>

      <!-- Floor plan: each table cycles free → seated → dessert → free when tapped. -->
      <section v-else class="mi:grid mi:content-start mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-label="Floor plan">
        <div class="mi:flex mi:flex-wrap mi:gap-3.5 mi:text-[12px] mi:text-label2" aria-hidden="true"><span class="mi:before:content-[''] mi:before:inline-block mi:before:w-[9px] mi:before:h-[9px] mi:before:me-1.5 mi:before:rounded-[3px] mi:before:[background:var(--tone)]" v-for="(l, s) in stateLabel" :key="s" :class="[s === 'free' ? 'mi:[--tone:var(--mi-fill2)]' : s === 'seated' ? 'mi:[--tone:var(--mi-p)]' : 'mi:[--tone:var(--mi-orange)]']">{{ l }}</span></div>
        <div class="mi:grid mi:grid-cols-[repeat(auto-fill,_minmax(72px,_1fr))] mi:gap-2.5">
          <button
            v-for="t in tables" :key="t.id" type="button" class="mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:place-content-center mi:gap-0.5 mi:[border:0] mi:[font:inherit] mi:cursor-pointer mi:text-label mi:[background:color-mix(in_srgb,_var(--tone)_18%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1.5px_var(--tone)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:active:transform-[scale(.96)]" :class="[t.state === 'free' ? 'mi:[--tone:var(--mi-fill2)]' : t.state === 'seated' ? 'mi:[--tone:var(--mi-p)]' : 'mi:[--tone:var(--mi-orange)]', t.seats <= 2 ? 'mi:aspect-[1] mi:rounded-[50%]' : 'mi:aspect-[1.3] mi:rounded-[12px]']"
            :aria-label="`Table ${t.id}, ${t.seats} seats, ${stateLabel[t.state]}`" @click="cycle(t)"
          >
            <b class="mi:text-[16px]">{{ t.id }}</b><small class="mi:text-[11px] mi:text-label2">{{ t.seats }}p</small>
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

