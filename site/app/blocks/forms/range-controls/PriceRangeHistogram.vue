<template>
  <section class="prh" aria-labelledby="prh-title">
    <header class="prh__head">
      <div>
        <MiText id="prh-title" variant="title3" as="h2" weight="semibold">Stays in Porto</MiText>
        <MiText variant="footnote" tone="label2">12 – 16 March · 2 guests</MiText>
      </div>
      <MiButton variant="plain" size="small" :disabled="isDefault" @click="reset">Reset</MiButton>
    </header>

    <div class="prh__body">
      <!-- Price: histogram of what is left after the other filters, with the selected band lit. -->
      <fieldset class="prh__group prh__price">
        <legend class="prh__legend">Nightly price</legend>
        <div class="prh__hist" aria-hidden="true">
          <span
            v-for="b in bins" :key="b.from" :class="{ 'is-in': b.from + STEP > low && b.from < high }"
            :style="{ transform: `scaleY(${Math.max(0.04, b.count / peak)})` }"
          />
        </div>
        <MiSlider v-model="price" :min="MIN" :max="MAX" :step="10" aria-label="Nightly price range" :format="money" />
        <div class="prh__inputs">
          <MiField label="Minimum">
            <MiInput v-model="lowText" prefix="$" inputmode="numeric" @blur="commit" @keydown.enter.prevent="commit" />
          </MiField>
          <span class="prh__dash" aria-hidden="true" />
          <MiField label="Maximum">
            <MiInput v-model="highText" prefix="$" inputmode="numeric" @blur="commit" @keydown.enter.prevent="commit" />
          </MiField>
        </div>
        <div class="prh__presets" role="group" aria-label="Price presets">
          <MiChip
            v-for="p in presets" :key="p.label" selectable size="small" tone="neutral" :label="p.label"
            :model-value="low === p.range[0] && high === p.range[1]" @update:model-value="price = [p.range[0], p.range[1]]"
          />
        </div>
      </fieldset>

      <div class="prh__side">
        <fieldset class="prh__group">
          <legend class="prh__legend">Walk to Ribeira</legend>
          <MiSlider v-model="distance" :min="0.5" :max="6" :step="0.5" aria-label="Maximum distance" :format="v => (v >= 6 ? 'Any distance' : 'Within ' + v + ' km')" show-value />
          <div class="prh__scale" aria-hidden="true"><span>0.5 km</span><span>Any</span></div>
        </fieldset>
        <fieldset class="prh__group">
          <legend class="prh__legend">Guest rating</legend>
          <MiSlider v-model="rating" :min="6" :max="9.5" :step="0.5" aria-label="Minimum guest rating" :format="v => v.toFixed(1) + ' or higher · ' + ratingWord(v)" show-value />
          <div class="prh__scale" aria-hidden="true"><span>6.0</span><span>9.5</span></div>
        </fieldset>
      </div>
    </div>

    <footer class="prh__foot">
      <p class="prh__count" aria-live="polite">
        <b>{{ matches.length }}</b> of {{ stays.length }} stays
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

<style scoped>
.prh { container-type: inline-size; display: grid; align-content: start; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.prh__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.prh__body { display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .prh__body { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 32px; } }
.prh__group { display: grid; gap: 12px; margin: 0; padding: 0; border: 0; min-width: 0; }
.prh__legend { padding: 0; margin-bottom: 4px; font-size: 15px; font-weight: 600; }
.prh__side { display: grid; gap: 22px; align-content: start; }
@container (min-width: 760px) { .prh__side { padding-left: 32px; border-left: 1px solid var(--mi-sep); } }

.prh__hist { display: flex; align-items: flex-end; gap: 2px; height: 72px; padding: 0 10px; margin-bottom: -8px; }
.prh__hist span {
  flex: 1; height: 100%; border-radius: 3px 3px 0 0; background: var(--mi-fill2); transform-origin: bottom;
  transition: transform var(--mi-dur-4) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); opacity: .55;
}
.prh__hist span.is-in { background: var(--mi-p); opacity: 1; }

.prh__inputs { display: grid; grid-template-columns: minmax(0, 1fr) 14px minmax(0, 1fr); align-items: end; gap: 8px; }
.prh__dash { height: 1px; margin-bottom: 18px; background: var(--mi-label3); }
.prh__presets { display: flex; flex-wrap: wrap; gap: 6px; }
.prh__scale { display: flex; justify-content: space-between; margin-top: -6px; font-size: 11px; color: var(--mi-label3); }

.prh__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.prh__count { margin: 0; font-size: 14px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.prh__count b { color: var(--mi-label); font-size: 17px; }
</style>
