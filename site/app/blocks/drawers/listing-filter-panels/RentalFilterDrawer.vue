<template>
  <section class="rfd" aria-labelledby="rfd-title">
    <!-- Listing page: cards that stop matching fade back live while the drawer is open. -->
    <div class="rfd__page" :inert="open || undefined">
      <div class="rfd__page-head">
        <div>
          <MiText id="rfd-title" variant="title3" as="h2" weight="semibold">Rentals in Berlin</MiText>
          <MiText variant="footnote" tone="label2">{{ matches.length }} of {{ HOMES.length }} homes · long-term, unfurnished first</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="open = true">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Filters{{ activeCount ? ' · ' + activeCount : '' }}
        </MiButton>
      </div>
      <ul class="rfd__grid">
        <li v-for="h in shown" :key="h.id" class="rfd__home" :class="{ 'is-out': !ok(h) }">
          <span class="rfd__photo" :style="{ '--h1': h.c1, '--h2': h.c2 }" aria-hidden="true"><i /></span>
          <div class="rfd__home-text">
            <b>€{{ h.rent.toLocaleString('en-US') }} <small>/ month</small></b>
            <span>{{ h.rooms }} rooms · {{ h.size }} m² · {{ h.area }}</span>
            <span class="rfd__tags">{{ h.tags.slice(0, 3).join(' · ') }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="rfd__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="rfd__drawer" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline swipe-direction="left" title="Filters" :description="matches.length + ' homes match'">
        <div class="rfd__body">
          <MiSlider v-model="rent" label="Monthly rent" :min="600" :max="3000" :step="50" :format="v => (v >= 3000 ? '€3,000+' : '€' + v.toLocaleString('en-US'))" />

          <div class="rfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Rooms</MiText>
            <MiToggleGroup v-model="rooms" variant="outline" label="Rooms" :spacing="0" :options="[1, 2, 3, 4].map(n => ({ value: n, label: n + '+' }))" />
          </div>

          <MiSlider v-model="size" label="Minimum size" :min="20" :max="140" :step="5" unit=" m²" />

          <fieldset class="rfd__areas">
            <legend>Neighbourhood</legend>
            <div v-for="a in AREAS" :key="a" class="rfd__area">
              <MiCheckbox :model-value="areas.includes(a)" :label="a" @update:model-value="on => (areas = on ? [...areas, a] : areas.filter(x => x !== a))" />
              <span>{{ areaCount(a) }}</span>
            </div>
          </fieldset>

          <div class="rfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Must have</MiText>
            <div class="rfd__chips" role="group" aria-label="Must have">
              <MiChip
                v-for="t in TAGS" :key="t" selectable size="small" :label="t" :model-value="tags.includes(t)"
                @update:model-value="on => (tags = on ? [...tags, t] : tags.filter(x => x !== t))"
              />
            </div>
          </div>

          <div class="rfd__group">
            <MiText variant="footnote" weight="semibold" aria-hidden="true">Move in</MiText>
            <MiSegmented v-model="moveIn" label="Move in" :options="[{ value: 0, label: 'Any' }, { value: 1, label: 'By Dec' }, { value: 2, label: 'By Jan' }]" />
          </div>
        </div>

        <template #footer>
          <div class="rfd__foot">
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

<style scoped>
.rfd { container-type: inline-size; position: relative; display: grid; min-height: 720px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.rfd__page, .rfd__scrim, .rfd__drawer { grid-area: 1 / 1; }
.rfd__page { display: grid; align-content: start; gap: 14px; padding: 20px; }
.rfd__page-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.rfd__grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); margin: 0; padding: 0; list-style: none; }
.rfd__home {
  display: grid; border-radius: var(--mi-radius-l); overflow: hidden; background: var(--mi-card); box-shadow: var(--mi-sh1);
  transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring);
}
.rfd__home.is-out { opacity: .22; transform: scale(.96); }
/* Photo placeholder: sky, a facade and a window grid, tinted per listing. */
.rfd__photo { position: relative; aspect-ratio: 4 / 3; background: linear-gradient(160deg, color-mix(in srgb, var(--h1) 55%, var(--mi-card)), color-mix(in srgb, var(--h2) 70%, var(--mi-card))); }
.rfd__photo i {
  position: absolute; left: 22%; right: 22%; bottom: 0; height: 64%; border-radius: 4px 4px 0 0; background-color: color-mix(in srgb, var(--mi-card) 82%, var(--h2));
  background-image: radial-gradient(circle, color-mix(in srgb, var(--h2) 60%, var(--mi-card)) 0 30%, transparent 32%); background-size: 25% 22%;
}
.rfd__home-text { display: grid; gap: 2px; padding: 10px 12px 12px; font-size: 13px; min-width: 0; }
.rfd__home-text b { font-size: 16px; font-variant-numeric: tabular-nums; }
.rfd__home-text small { font-size: 12px; font-weight: 400; color: var(--mi-label2); }
.rfd__home-text span { color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rfd__home-text .rfd__tags { color: var(--mi-label3); font-size: 12px; }

/* A light scrim so the listing stays readable behind the drawer. */
.rfd__scrim { background: color-mix(in srgb, var(--mi-page) 30%, transparent); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.rfd__scrim.is-on { opacity: 1; pointer-events: auto; }
.rfd__drawer { justify-self: start; width: min(380px, calc(100% - 24px)); padding: 10px; transition: transform var(--mi-dur-4) var(--mi-spring); }
.rfd__drawer.is-closed { transform: translateX(-105%); }

.rfd__body { display: grid; gap: 20px; }
.rfd__group { display: grid; gap: 8px; }
.rfd__areas { display: grid; gap: 6px; margin: 0; padding: 0; border: 0; min-width: 0; }
.rfd__areas legend { padding: 0; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.rfd__area { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.rfd__area span { min-width: 24px; padding: 1px 7px; border-radius: 999px; background: var(--mi-fill4); color: var(--mi-label2); font-size: 12px; text-align: center; font-variant-numeric: tabular-nums; }
.rfd__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.rfd__foot { display: flex; justify-content: space-between; gap: 8px; }
</style>
