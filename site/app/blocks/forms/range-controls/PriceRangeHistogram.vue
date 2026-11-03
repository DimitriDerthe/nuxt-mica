<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="prh-title">
    <header class="mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
      <div>
        <MiText id="prh-title" variant="title3" as="h2" weight="semibold">Stays in Porto</MiText>
        <MiText variant="footnote" tone="label2">12 – 16 March · 2 guests</MiText>
      </div>
      <MiButton variant="plain" size="small" :disabled="isDefault" @click="reset">Reset</MiButton>
    </header>

    <div class="mi:grid mi:gap-5.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1.5fr)_minmax(0,_1fr)] mi:@[760px]:gap-8">
      <!-- Price: histogram of what is left after the other filters, with the selected band lit. -->
      <fieldset class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
        <legend class="mi:p-0 mi:mb-1 mi:text-[15px] mi:font-semibold">Nightly price</legend>
        <div class="mi:flex mi:[align-items:flex-end] mi:gap-0.5 mi:h-18 mi:py-0 mi:px-2.5 mi:-mb-2" aria-hidden="true">
          <span class="mi:flex-1 mi:h-full mi:rounded-[3px_3px_0_0] mi:bg-fill2 mi:origin-bottom mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)]"
            v-for="b in bins" :key="b.from" :class="b.from + STEP > low && b.from < high ? 'mi:bg-p mi:opacity-100' : 'mi:opacity-55'"
            :style="{ transform: `scaleY(${Math.max(0.04, b.count / peak)})` }"
          />
        </div>
        <MiSlider v-model="price" :min="MIN" :max="MAX" :step="10" aria-label="Nightly price range" :format="money" />
        <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)_14px_minmax(0,_1fr)] mi:items-end mi:gap-2">
          <MiField label="Minimum">
            <MiInput v-model="lowText" prefix="$" inputmode="numeric" @blur="commit" @keydown.enter.prevent="commit" />
          </MiField>
          <span class="mi:h-px mi:mb-4.5 mi:bg-label3" aria-hidden="true" />
          <MiField label="Maximum">
            <MiInput v-model="highText" prefix="$" inputmode="numeric" @blur="commit" @keydown.enter.prevent="commit" />
          </MiField>
        </div>
        <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Price presets">
          <MiChip
            v-for="p in presets" :key="p.label" selectable size="small" tone="neutral" :label="p.label"
            :model-value="low === p.range[0] && high === p.range[1]" @update:model-value="price = [p.range[0], p.range[1]]"
          />
        </div>
      </fieldset>

      <div class="mi:grid mi:gap-5.5 mi:content-start mi:@[760px]:pl-8 mi:@[760px]:border-l mi:@[760px]:border-l-sep">
        <fieldset class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
          <legend class="mi:p-0 mi:mb-1 mi:text-[15px] mi:font-semibold">Walk to Ribeira</legend>
          <MiSlider v-model="distance" :min="0.5" :max="6" :step="0.5" aria-label="Maximum distance" :format="v => (v >= 6 ? 'Any distance' : 'Within ' + v + ' km')" show-value />
          <div class="mi:flex mi:justify-between mi:-mt-1.5 mi:text-[11px] mi:text-label3" aria-hidden="true"><span>0.5 km</span><span>Any</span></div>
        </fieldset>
        <fieldset class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
          <legend class="mi:p-0 mi:mb-1 mi:text-[15px] mi:font-semibold">Guest rating</legend>
          <MiSlider v-model="rating" :min="6" :max="9.5" :step="0.5" aria-label="Minimum guest rating" :format="v => v.toFixed(1) + ' or higher · ' + ratingWord(v)" show-value />
          <div class="mi:flex mi:justify-between mi:-mt-1.5 mi:text-[11px] mi:text-label3" aria-hidden="true"><span>6.0</span><span>9.5</span></div>
        </fieldset>
      </div>
    </div>

    <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:pt-3.5 mi:border-t mi:border-t-sep">
      <p class="mi:m-0 mi:text-[14px] mi:text-label2 mi:tabular-nums" aria-live="polite">
        <b class="mi:text-label mi:text-[17px]">{{ matches.length }}</b> of {{ stays.length }} stays
        <span v-if="matches.length">· median {{ money(median) }} a night</span>
      </p>
      <MiButton :disabled="!matches.length">{{ matches.length ? `Show ${matches.length} stays` : 'No stays match' }}</MiButton>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const MIN = 40
const MAX = 520
const STEP = 20

// Deterministic sample of 260 stays: skewed prices, distances and ratings.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(42)
const stays = Array.from({ length: 260 }, () => {
  const skew = Math.pow(rand(), 1.9)
  const km = Math.round((0.3 + rand() * 5.8) * 10) / 10
  return {
    price: Math.round((MIN + 10 + skew * (MAX - MIN - 20)) / 5) * 5,
    km,
    rating: Math.round((9.8 - rand() * 3.6 - km * 0.08) * 10) / 10
  }
})

const price = ref<number | [number, number]>([90, 220])
const distance = ref<number | [number, number]>(3)
const rating = ref<number | [number, number]>(8)

const low = computed(() => (Array.isArray(price.value) ? price.value[0] : MIN))
const high = computed(() => (Array.isArray(price.value) ? price.value[1] : MAX))
const km = computed(() => (typeof distance.value === 'number' ? distance.value : 6))
const minRating = computed(() => (typeof rating.value === 'number' ? rating.value : 6))

// The histogram reacts to distance and rating, so the price band shows what is actually bookable.
const pool = computed(() => stays.filter(s => (km.value >= 6 || s.km <= km.value) && s.rating >= minRating.value))
const matches = computed(() => pool.value.filter(s => s.price >= low.value && s.price <= high.value))
const bins = computed(() => Array.from({ length: (MAX - MIN) / STEP }, (_, i) => {
  const from = MIN + i * STEP
  return { from, count: pool.value.filter(s => s.price >= from && s.price < from + STEP).length }
}))
const peak = computed(() => Math.max(1, ...bins.value.map(b => b.count)))
const median = computed(() => {
  const sorted = matches.value.map(s => s.price).sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
})

const presets: { label: string, range: [number, number] }[] = [
  { label: 'Under $100', range: [MIN, 100] },
  { label: '$100 – 200', range: [100, 200] },
  { label: '$200 – 350', range: [200, 350] },
  { label: 'Splurge', range: [350, MAX] }
]

// Typed fields mirror the slider and commit on blur or Return, clamped and kept in order.
const lowText = ref(String(low.value))
const highText = ref(String(high.value))
watch([low, high], ([l, h]) => {
  lowText.value = String(l)
  highText.value = String(h)
})
function commit() {
  const l = Number(lowText.value.replace(/\D/g, '')) || MIN
  const h = Number(highText.value.replace(/\D/g, '')) || MAX
  const a = Math.min(MAX, Math.max(MIN, Math.min(l, h)))
  const b = Math.min(MAX, Math.max(MIN, Math.max(l, h)))
  price.value = [a, b]
  lowText.value = String(a)
  highText.value = String(b)
}

const money = (v: number) => (v >= MAX ? '$' + MAX + '+' : '$' + v)
const ratingWord = (v: number) => (v >= 9 ? 'Exceptional' : v >= 8 ? 'Excellent' : v >= 7 ? 'Very good' : 'Good')
const isDefault = computed(() => low.value === 90 && high.value === 220 && km.value === 3 && minRating.value === 8)
function reset() {
  price.value = [90, 220]
  distance.value = 3
  rating.value = 8
}
</script>
