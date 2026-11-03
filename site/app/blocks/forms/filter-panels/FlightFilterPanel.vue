<template>
  <section class="ffp mi:@container mi:font-mi mi:text-label" aria-labelledby="ffp-title">
    <div class="ffp__panel mi:grid mi:gap-1 mi:max-w-105 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[760px]:max-w-none mi:@[760px]:grid-cols-2 mi:@[760px]:gap-x-7">
      <header class="ffp__head mi:@[760px]:col-span-full mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2.5 mi:pb-2.5">
        <div>
          <MiText id="ffp-title" variant="headline" as="h2">Filters</MiText>
          <MiText variant="caption" tone="label2">Lisbon → Tokyo · 12–26 March · 1 adult</MiText>
        </div>
        <MiBadge v-if="activeCount" :label="`${activeCount} on`" />
      </header>

      <fieldset class="ffp__sec mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:py-3.5 mi:px-0">
        <legend class="ffp__legend mi:float-left mi:w-full mi:p-0 mi:text-[13px] mi:font-semibold">Stops</legend>
        <MiRadioGroup v-model="stops" label="Stops" :options="stopOptions" />
      </fieldset>

      <fieldset class="ffp__sec mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:py-3.5 mi:px-0">
        <legend class="ffp__legend mi:float-left mi:w-full mi:p-0 mi:text-[13px] mi:font-semibold">Departure time</legend>
        <MiSegmented v-model="leg" label="Flight leg" :options="[{ value: 'out', label: 'Outbound' }, { value: 'ret', label: 'Return' }]" />
        <!-- Each leg keeps its own window; the tiles show what is left for this leg. -->
        <div class="ffp__slots mi:grid mi:grid-cols-2 mi:gap-2" role="group" :aria-label="`${leg === 'out' ? 'Outbound' : 'Return'} departure windows`">
          <button
            v-for="s in SLOTS" :key="s.id" type="button" class="ffp__slot mi:grid mi:justify-items-start mi:gap-0.5 mi:p-2.5 mi:[border:0] mi:rounded-md mi:cursor-pointer mi:bg-fill4 mi:text-inherit mi:[font:inherit] mi:text-start mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.97)] mi:aria-pressed:bg-p-tint mi:aria-pressed:shadow-[inset_0_0_0_1.5px_var(--mi-p)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:focus-visible:outline-offset-[1px]" :aria-pressed="slots[legKey].includes(s.id)"
            @click="toggleSlot(s.id)"
          >
            <MiIcon class="mi:[.ffp__slot_b&]:text-[13px] mi:[.ffp__slot_small&]:text-[11px] mi:[.ffp__slot_small&]:text-label2" :name="s.icon" :size="16" />
            <b class="mi:[.ffp__slot_b&]:text-[13px]">{{ s.label }}</b>
            <small class="mi:[.ffp__slot_small&]:text-[11px] mi:[.ffp__slot_small&]:text-label2">{{ s.range }} · {{ slotCount(s.id) }}</small>
          </button>
        </div>
      </fieldset>

      <fieldset class="ffp__sec mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:py-3.5 mi:px-0">
        <legend class="ffp__legend mi:float-left mi:w-full mi:p-0 mi:text-[13px] mi:font-semibold">Airlines</legend>
        <ul class="ffp__airlines mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li class="mi:[.ffp__airlines_li&]:grid-cols-[minmax(0,_1fr)_auto_24px]" v-for="a in AIRLINES" :key="a">
            <MiCheckbox class="mi:[.ffp__airlines_li&]:grid-cols-[minmax(0,_1fr)_auto_24px]" :model-value="airlines.includes(a)" :label="a" @update:model-value="toggleAirline(a)" />
            <button type="button" class="ffp__only mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:focus-visible:outline-offset-[1px] mi:py-0.5 mi:px-2 mi:[border:0] mi:rounded-[999px] mi:bg-transparent mi:text-p-text mi:cursor-pointer mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.ffp__airlines_li:hover_&]:opacity-100 mi:focus-visible:opacity-100 mi:[@media_(hover:_none)]:opacity-100" :aria-label="`Only ${a}`" @click="airlines = [a]">Only</button>
            <span class="ffp__n mi:text-[12px] mi:text-end mi:text-label3 mi:tabular-nums">{{ airlineCount(a) }}</span>
          </li>
        </ul>
      </fieldset>

      <fieldset class="ffp__sec mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:py-3.5 mi:px-0">
        <legend class="ffp__legend mi:float-left mi:w-full mi:p-0 mi:text-[13px] mi:font-semibold">Total travel time</legend>
        <MiSlider v-model="maxHours" :min="14" :max="32" aria-label="Maximum travel time" show-value :format="v => (v >= 32 ? 'Any length' : `Up to ${v} h`)" />
      </fieldset>

      <footer class="ffp__foot mi:@[760px]:col-span-full mi:flex mi:justify-between mi:gap-2.5 mi:pt-3.5 mi:border-t mi:border-t-sep">
        <MiButton variant="plain" :disabled="!activeCount" @click="reset">Reset</MiButton>
        <MiButton :disabled="!results.length">{{ results.length ? `Show ${results.length} flights from €${cheapest}` : 'No flights match' }}</MiButton>
      </footer>
      <p class="ffp__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:m-0" aria-live="polite">{{ results.length }} flights match</p>
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
.ffp__sec { border: 0; border-top: 1px solid var(--mi-sep); }
.ffp__slot :deep(svg) { color: var(--mi-label2); }
.ffp__slot[aria-pressed="true"] :deep(svg) { color: var(--mi-p-text); }
.ffp__airlines li { display: grid; align-items: center; gap: 8px; }
.ffp__only { font: inherit; font-size: 12px; font-weight: 600; }
</style>
