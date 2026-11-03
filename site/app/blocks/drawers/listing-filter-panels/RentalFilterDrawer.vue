<template>
  <section class="mi:@container mi:relative mi:grid mi:min-h-180 mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:font-mi mi:text-label" aria-labelledby="rfd-title">
    <!-- Listing page: cards that stop matching fade back live while the drawer is open. -->
    <div class="mi:[grid-area:1_/_1] mi:grid mi:content-start mi:gap-3.5 mi:p-5" :inert="open || undefined">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
        <div>
          <MiText id="rfd-title" variant="title3" as="h2" weight="semibold">Rentals in Berlin</MiText>
          <MiText variant="footnote" tone="label2">{{ matches.length }} of {{ HOMES.length }} homes · long-term, unfurnished first</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="open = true">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Filters{{ activeCount ? ' · ' + activeCount : '' }}
        </MiButton>
      </div>
      <ul class="mi:grid mi:gap-3 mi:grid-cols-[repeat(auto-fill,_minmax(170px,_1fr))] mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="h in shown" :key="h.id" class="mi:grid mi:rounded-lg mi:overflow-hidden mi:[background:var(--mi-card)] mi:shadow-1 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" :class="ok(h) ? '' : 'mi:opacity-22 mi:transform-[scale(.96)]'">
          <span class="mi:relative mi:aspect-[4_/_3] mi:[background:linear-gradient(160deg,_color-mix(in_srgb,_var(--h1)_55%,_var(--mi-card)),_color-mix(in_srgb,_var(--h2)_70%,_var(--mi-card)))]" :style="{ '--h1': h.c1, '--h2': h.c2 }" aria-hidden="true"><i class="mi:absolute mi:left-[22%] mi:right-[22%] mi:bottom-0 mi:h-[64%] mi:rounded-[4px_4px_0_0] mi:bg-[color:color-mix(in_srgb,_var(--mi-card)_82%,_var(--h2))] mi:bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--h2)_60%,_var(--mi-card))_0_30%,_transparent_32%)] mi:[background-size:25%_22%]" /></span>
          <div class="mi:grid mi:gap-0.5 mi:pt-2.5 mi:px-3 mi:pb-3 mi:text-[13px] mi:min-w-0">
            <b class="mi:text-[16px] mi:tabular-nums">€{{ h.rent.toLocaleString('en-US') }} <small class="mi:text-[12px] mi:text-label2 mi:font-normal">/ month</small></b>
            <span class="mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ h.rooms }} rooms · {{ h.size }} m² · {{ h.area }}</span>
            <span class="mi:text-label3 mi:text-[12px] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ h.tags.slice(0, 3).join(' · ') }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="mi:[grid-area:1_/_1] mi:[background:color-mix(in_srgb,_var(--mi-page)_30%,_transparent)] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="open ? 'mi:opacity-100 mi:pointer-events-auto' : 'mi:opacity-0 mi:pointer-events-none'" aria-hidden="true" @click="open = false" />

    <div class="mi:[grid-area:1_/_1] mi:justify-self-start mi:w-[min(380px,_calc(100%_-_24px))] mi:p-2.5 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="open ? '' : 'mi:transform-[translateX(-105%)]'" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline swipe-direction="left" title="Filters" :description="matches.length + ' homes match'">
        <div class="mi:grid mi:gap-5">
          <MiSlider v-model="rent" label="Monthly rent" :min="600" :max="3000" :step="50" :format="v => (v >= 3000 ? '€3,000+' : '€' + v.toLocaleString('en-US'))" />

          <div class="mi:grid mi:gap-2">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Rooms</MiText>
            <MiToggleGroup v-model="rooms" variant="outline" label="Rooms" :spacing="0" :options="[1, 2, 3, 4].map(n => ({ value: n, label: n + '+' }))" />
          </div>

          <MiSlider v-model="size" label="Minimum size" :min="20" :max="140" :step="5" unit=" m²" />

          <fieldset class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold">Neighbourhood</legend>
            <div v-for="a in AREAS" :key="a" class="mi:flex mi:items-center mi:justify-between mi:gap-2">
              <MiCheckbox :model-value="areas.includes(a)" :label="a" @update:model-value="on => (areas = on ? [...areas, a] : areas.filter(x => x !== a))" />
              <span class="mi:min-w-6 mi:py-px mi:px-[7px] mi:rounded-[999px] mi:bg-fill4 mi:text-label2 mi:text-[12px] mi:text-center mi:tabular-nums">{{ areaCount(a) }}</span>
            </div>
          </fieldset>

          <div class="mi:grid mi:gap-2">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Must have</MiText>
            <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Must have">
              <MiChip
                v-for="t in TAGS" :key="t" selectable size="small" :label="t" :model-value="tags.includes(t)"
                @update:model-value="on => (tags = on ? [...tags, t] : tags.filter(x => x !== t))"
              />
            </div>
          </div>

          <div class="mi:grid mi:gap-2">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Move in</MiText>
            <MiSegmented v-model="moveIn" label="Move in" :options="[{ value: 0, label: 'Any' }, { value: 1, label: 'By Dec' }, { value: 2, label: 'By Jan' }]" />
          </div>
        </div>

        <template #footer>
          <div class="mi:flex mi:justify-between mi:gap-2">
            <MiButton variant="plain" :disabled="!activeCount" @click="clear">Clear all</MiButton>
            <MiButton :disabled="!matches.length" @click="open = false">{{ matches.length ? `Show ${matches.length} homes` : 'No homes match' }}</MiButton>
          </div>
        </template>
      </MiDrawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const AREAS = ['Kreuzberg', 'Neukölln', 'Friedrichshain', 'Prenzlauer Berg', 'Mitte', 'Wedding']
const TAGS = ['Balcony', 'Elevator', 'Pets allowed', 'Dishwasher', 'Bike storage', 'Furnished']
const HUES = [['var(--mi-teal)', 'var(--mi-indigo)'], ['var(--mi-orange)', 'var(--mi-pink)'], ['var(--mi-green)', 'var(--mi-teal)'], ['var(--mi-purple)', 'var(--mi-p)'], ['var(--mi-yellow)', 'var(--mi-orange)']]
const HOMES = [
  { rent: 1180, rooms: 2, size: 58, area: 'Neukölln', tags: ['Balcony', 'Bike storage'], avail: 1 },
  { rent: 1640, rooms: 3, size: 82, area: 'Kreuzberg', tags: ['Balcony', 'Elevator', 'Dishwasher'], avail: 2 },
  { rent: 890, rooms: 1, size: 34, area: 'Wedding', tags: ['Furnished'], avail: 0 },
  { rent: 2350, rooms: 4, size: 118, area: 'Prenzlauer Berg', tags: ['Balcony', 'Elevator', 'Pets allowed', 'Dishwasher'], avail: 2 },
  { rent: 1420, rooms: 2, size: 66, area: 'Friedrichshain', tags: ['Elevator', 'Dishwasher', 'Bike storage'], avail: 1 },
  { rent: 1990, rooms: 3, size: 91, area: 'Mitte', tags: ['Elevator', 'Furnished', 'Dishwasher'], avail: 0 },
  { rent: 1050, rooms: 2, size: 52, area: 'Wedding', tags: ['Pets allowed', 'Balcony'], avail: 1 },
  { rent: 1290, rooms: 2, size: 61, area: 'Kreuzberg', tags: ['Pets allowed', 'Bike storage'], avail: 2 },
  { rent: 2780, rooms: 4, size: 132, area: 'Mitte', tags: ['Balcony', 'Elevator', 'Dishwasher', 'Bike storage'], avail: 2 },
  { rent: 760, rooms: 1, size: 28, area: 'Neukölln', tags: ['Furnished', 'Bike storage'], avail: 0 },
  { rent: 1560, rooms: 3, size: 74, area: 'Friedrichshain', tags: ['Balcony', 'Pets allowed', 'Dishwasher'], avail: 1 },
  { rent: 1860, rooms: 3, size: 88, area: 'Prenzlauer Berg', tags: ['Balcony', 'Elevator', 'Bike storage'], avail: 1 }
].map((h, i) => ({ ...h, id: i, c1: HUES[i % HUES.length]![0]!, c2: HUES[i % HUES.length]![1]! }))
type Home = typeof HOMES[number]

const open = ref(true)
const rent = ref<number | [number, number]>([900, 2000])
const rooms = ref<string | number | (string | number)[] | null>(2)
const size = ref<number | [number, number]>(45)
const areas = ref<string[]>([])
const tags = ref<string[]>(['Balcony'])
const moveIn = ref<string | number | null>(0)

function ok(h: Home, skipArea = false) {
  const [lo, hi] = Array.isArray(rent.value) ? rent.value : [600, 3000]
  return h.rent >= lo && (hi >= 3000 || h.rent <= hi)
    && h.rooms >= Number(rooms.value ?? 1)
    && h.size >= (typeof size.value === 'number' ? size.value : 20)
    && (skipArea || !areas.value.length || areas.value.includes(h.area))
    && tags.value.every(t => h.tags.includes(t))
    && (!moveIn.value || h.avail <= Number(moveIn.value))
}
const matches = computed(() => HOMES.filter(h => ok(h)))
// While the drawer is open every card stays in place and non-matches fade; closed, only matches remain.
const shown = computed(() => (open.value ? HOMES : matches.value))
const areaCount = (a: string) => HOMES.filter(h => h.area === a && ok(h, true)).length

const activeCount = computed(() => {
  const r = Array.isArray(rent.value) && (rent.value[0] > 600 || rent.value[1] < 3000)
  return [r, Number(rooms.value ?? 1) > 1, typeof size.value === 'number' && size.value > 20, areas.value.length > 0, tags.value.length > 0, !!moveIn.value].filter(Boolean).length
})
function clear() {
  rent.value = [600, 3000]
  rooms.value = 1
  size.value = 20
  areas.value = []
  tags.value = []
  moveIn.value = 0
}
</script>
