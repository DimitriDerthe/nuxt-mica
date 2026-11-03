<template>
  <section class="ffp" aria-labelledby="ffp-title">
    <div class="ffp__panel">
      <header class="ffp__head">
        <div>
          <MiText id="ffp-title" variant="headline" as="h2">Filters</MiText>
          <MiText variant="caption" tone="label2">Lisbon → Tokyo · 12–26 March · 1 adult</MiText>
        </div>
        <MiBadge v-if="activeCount" :label="`${activeCount} on`" />
      </header>

      <fieldset class="ffp__sec">
        <legend class="ffp__legend">Stops</legend>
        <MiRadioGroup v-model="stops" label="Stops" :options="stopOptions" />
      </fieldset>

      <fieldset class="ffp__sec">
        <legend class="ffp__legend">Departure time</legend>
        <MiSegmented v-model="leg" label="Flight leg" :options="[{ value: 'out', label: 'Outbound' }, { value: 'ret', label: 'Return' }]" />
        <!-- Each leg keeps its own window; the tiles show what is left for this leg. -->
        <div class="ffp__slots" role="group" :aria-label="`${leg === 'out' ? 'Outbound' : 'Return'} departure windows`">
          <button
            v-for="s in SLOTS" :key="s.id" type="button" class="ffp__slot" :aria-pressed="slots[legKey].includes(s.id)"
            @click="toggleSlot(s.id)"
          >
            <MiIcon :name="s.icon" :size="16" />
            <b>{{ s.label }}</b>
            <small>{{ s.range }} · {{ slotCount(s.id) }}</small>
          </button>
        </div>
      </fieldset>

      <fieldset class="ffp__sec">
        <legend class="ffp__legend">Airlines</legend>
        <ul class="ffp__airlines">
          <li v-for="a in AIRLINES" :key="a">
            <MiCheckbox :model-value="airlines.includes(a)" :label="a" @update:model-value="toggleAirline(a)" />
            <button type="button" class="ffp__only" :aria-label="`Only ${a}`" @click="airlines = [a]">Only</button>
            <span class="ffp__n">{{ airlineCount(a) }}</span>
          </li>
        </ul>
      </fieldset>

      <fieldset class="ffp__sec">
        <legend class="ffp__legend">Total travel time</legend>
        <MiSlider v-model="maxHours" :min="14" :max="32" aria-label="Maximum travel time" show-value :format="v => (v >= 32 ? 'Any length' : `Up to ${v} h`)" />
      </fieldset>

      <footer class="ffp__foot">
        <MiButton variant="plain" :disabled="!activeCount" @click="reset">Reset</MiButton>
        <MiButton :disabled="!results.length">{{ results.length ? `Show ${results.length} flights from €${cheapest}` : 'No flights match' }}</MiButton>
      </footer>
      <p class="ffp__sr" aria-live="polite">{{ results.length }} flights match</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Slot = 'morning' | 'afternoon' | 'evening' | 'night'
interface Flight { airline: string, stops: 0 | 1 | 2, out: number, ret: number, hours: number, price: number }

const SLOTS: { id: Slot, label: string, range: string, icon: 'sun' | 'moon' }[] = [
  { id: 'morning', label: 'Morning', range: '5–12', icon: 'sun' },
  { id: 'afternoon', label: 'Afternoon', range: '12–18', icon: 'sun' },
  { id: 'evening', label: 'Evening', range: '18–24', icon: 'moon' },
  { id: 'night', label: 'Night', range: '0–5', icon: 'moon' }
]
const AIRLINES = ['TAP Air Portugal', 'Lufthansa', 'Emirates', 'Turkish Airlines', 'Qatar Airways']
// Sample results: departure hours for each leg, total hours, price in euros.
const FLIGHTS: Flight[] = [
  { airline: 'TAP Air Portugal', stops: 1, out: 7, ret: 11, hours: 19, price: 812 },
  { airline: 'TAP Air Portugal', stops: 1, out: 14, ret: 22, hours: 21, price: 764 },
  { airline: 'Lufthansa', stops: 1, out: 6, ret: 13, hours: 17, price: 905 },
  { airline: 'Lufthansa', stops: 1, out: 19, ret: 10, hours: 18, price: 868 },
  { airline: 'Lufthansa', stops: 2, out: 11, ret: 16, hours: 26, price: 691 },
  { airline: 'Emirates', stops: 1, out: 21, ret: 2, hours: 22, price: 846 },
  { airline: 'Emirates', stops: 1, out: 9, ret: 23, hours: 24, price: 799 },
  { airline: 'Turkish Airlines', stops: 1, out: 1, ret: 18, hours: 20, price: 702 },
  { airline: 'Turkish Airlines', stops: 1, out: 16, ret: 1, hours: 23, price: 655 },
  { airline: 'Turkish Airlines', stops: 2, out: 22, ret: 8, hours: 30, price: 588 },
  { airline: 'Qatar Airways', stops: 1, out: 8, ret: 20, hours: 21, price: 934 },
  { airline: 'Qatar Airways', stops: 2, out: 13, ret: 4, hours: 28, price: 612 }
]

const stops = ref<string | number | boolean | null>('any')
const leg = ref<string | number | null>('out')
const slots = reactive<Record<'out' | 'ret', Slot[]>>({ out: [], ret: ['morning', 'afternoon'] })
const airlines = ref<string[]>([...AIRLINES])
const maxHours = ref(32)

const legKey = computed<'out' | 'ret'>(() => (leg.value === 'ret' ? 'ret' : 'out'))
const slotOf = (h: number): Slot => (h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening')

// Every filter as a predicate, so counts can skip their own section (true facets).
type Part = 'stops' | 'out' | 'ret' | 'airline' | 'hours'
const tests: Record<Part, (f: Flight) => boolean> = {
  stops: f => stops.value === 'any' || (stops.value === 0 ? f.stops === 0 : stops.value === 1 ? f.stops <= 1 : true),
  out: f => !slots.out.length || slots.out.includes(slotOf(f.out)),
  ret: f => !slots.ret.length || slots.ret.includes(slotOf(f.ret)),
  airline: f => airlines.value.includes(f.airline),
  hours: f => maxHours.value >= 32 || f.hours <= maxHours.value
}
const passing = (skip?: Part) => FLIGHTS.filter(f => (Object.keys(tests) as Part[]).every(k => k === skip || tests[k](f)))

const results = computed(() => passing())
const cheapest = computed(() => Math.min(...results.value.map(f => f.price)))
const stopOptions = computed(() => {
  const pool = passing('stops')
  const from = (max: number) => { const l = pool.filter(f => f.stops <= max); return l.length ? `from €${Math.min(...l.map(f => f.price))} · ${l.length} flights` : 'No flights' }
  return [
    { value: 'any', label: 'Any number of stops', description: from(2) },
    { value: 0, label: 'Nonstop only', description: from(0), disabled: !pool.some(f => f.stops === 0) },
    { value: 1, label: '1 stop or fewer', description: from(1) }
  ]
})
const slotCount = (s: Slot) => passing(legKey.value).filter(f => slotOf(f[legKey.value]) === s).length
const airlineCount = (a: string) => passing('airline').filter(f => f.airline === a).length
const activeCount = computed(() => [stops.value !== 'any', slots.out.length > 0, slots.ret.length > 0, airlines.value.length < AIRLINES.length, maxHours.value < 32].filter(Boolean).length)

function toggleSlot(s: Slot) {
  const list = slots[legKey.value]
  slots[legKey.value] = list.includes(s) ? list.filter(x => x !== s) : [...list, s]
}
function toggleAirline(a: string) {
  airlines.value = airlines.value.includes(a) ? airlines.value.filter(x => x !== a) : [...airlines.value, a]
}
function reset() {
  stops.value = 'any'
  slots.out = []
  slots.ret = []
  airlines.value = [...AIRLINES]
  maxHours.value = 32
}
</script>

<style scoped>
.ffp { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ffp__panel { display: grid; gap: 4px; max-width: 420px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 760px) {
  .ffp__panel { max-width: none; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
  .ffp__head, .ffp__foot { grid-column: 1 / -1; }
}
.ffp__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding-bottom: 10px; }
.ffp__sec { display: grid; gap: 10px; min-width: 0; margin: 0; padding: 14px 0; border: 0; border-top: 1px solid var(--mi-sep); }
.ffp__legend { float: left; width: 100%; padding: 0; font-size: 13px; font-weight: 600; }

.ffp__slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ffp__slot {
  display: grid; justify-items: start; gap: 2px; padding: 10px; border: 0; border-radius: var(--mi-radius-m); cursor: pointer;
  background: var(--mi-fill4); color: inherit; font: inherit; text-align: start; transition: transform var(--mi-dur-2) var(--mi-ease);
}
.ffp__slot:active { transform: scale(.97); }
.ffp__slot :deep(svg) { color: var(--mi-label2); }
.ffp__slot b { font-size: 13px; }
.ffp__slot small { font-size: 11px; color: var(--mi-label2); }
.ffp__slot[aria-pressed="true"] { background: var(--mi-p-tint); box-shadow: inset 0 0 0 1.5px var(--mi-p); }
.ffp__slot[aria-pressed="true"] :deep(svg) { color: var(--mi-p-text); }
.ffp__slot:focus-visible, .ffp__only:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 45%, transparent); outline-offset: 1px; }

.ffp__airlines { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.ffp__airlines li { display: grid; grid-template-columns: minmax(0, 1fr) auto 24px; align-items: center; gap: 8px; }
.ffp__only { padding: 2px 8px; border: 0; border-radius: 999px; background: transparent; color: var(--mi-p-text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.ffp__airlines li:hover .ffp__only, .ffp__only:focus-visible { opacity: 1; }
.ffp__n { font-size: 12px; text-align: end; color: var(--mi-label3); font-variant-numeric: tabular-nums; }

.ffp__foot { display: flex; justify-content: space-between; gap: 10px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.ffp__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); margin: 0; }
@media (hover: none) { .ffp__only { opacity: 1; } }
</style>
