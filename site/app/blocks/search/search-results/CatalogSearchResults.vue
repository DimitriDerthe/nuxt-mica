<template>
  <section class="csr" aria-labelledby="csr-title">
    <header class="csr__head">
      <MiSearch v-model="query" placeholder="Search the shop" aria-label="Search products" :cancelable="false" />
      <!-- Typo correction: the shop searched the fixed spelling, with a way back to the literal one. -->
      <MiText v-if="corrected" variant="footnote" tone="label2" class="csr__fix">
        Showing results for <strong>{{ corrected }}</strong>.
        <a href="#" @click.prevent="literal = query">Search instead for {{ query }}</a>
      </MiText>
    </header>

    <div class="csr__layout">
      <aside class="csr__facets" aria-label="Filters">
        <MiSlider v-model="price" :min="40" :max="240" :step="10" label="Price" :format="dollars" />
        <div class="csr__facet" role="group" aria-labelledby="csr-brand">
          <MiText id="csr-brand" variant="footnote" weight="semibold" tone="label2">Brand</MiText>
          <div class="csr__chips">
            <MiChip v-for="b in brands" :key="b" v-model="brandOn[b]" selectable size="small" tone="neutral" :label="`${b} · ${brandCount(b)}`" />
          </div>
        </div>
        <MiCheckbox v-model="inStock" label="In stock near me" description="Pick up today at Lyon Part-Dieu" />
        <MiButton v-if="filtered" size="small" variant="plain" @click="clearAll">Clear filters</MiButton>
      </aside>

      <div class="csr__main">
        <div class="csr__bar">
          <MiText id="csr-title" variant="headline" as="h2" aria-live="polite">{{ results.length }} results for “{{ term }}”</MiText>
          <MiNativeSelect v-model="sort" :options="sorts" size="sm" aria-label="Sort by" />
        </div>

        <ul v-if="results.length" class="csr__grid">
          <li v-for="p in results" :key="p.id" class="csr__card">
            <a href="#" class="csr__link" @click.prevent>
              <span class="csr__art" :style="{ '--a': p.hue }" aria-hidden="true">
                <svg viewBox="0 0 120 60" class="csr__shoe"><path d="M8 44c10 0 18-4 26-14l10-12c4-4 10-4 12 2 3 8 12 12 26 14 14 2 30 4 30 14v4H8z" /></svg>
                <MiBadge v-if="p.tag" :label="p.tag" :tone="p.tag === 'Sale' ? 'danger' : 'primary'" variant="solid" class="csr__tag" />
              </span>
              <span class="csr__brand">{{ p.brand }}</span>
              <span class="csr__name">{{ p.name }}</span>
              <span class="csr__rate"><MiIcon name="star" filled :size="13" />{{ p.rating }} <small>({{ p.reviews }})</small></span>
              <span class="csr__price">
                <strong>${{ p.price }}</strong>
                <s v-if="p.was">${{ p.was }}</s>
                <small v-if="p.stock < 4 && p.stock > 0" class="csr__low">Only {{ p.stock }} left</small>
              </span>
            </a>
          </li>
        </ul>
        <MiEmptyState v-else icon="search" title="No shoes match every filter" description="Widen the price range or drop a brand to see more." primary-label="Clear filters" @primary="clearAll" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Product { id: number, brand: string, name: string, price: number, was?: number, rating: number, reviews: number, stock: number, hue: string, tag?: string, keywords: string }

const query = ref('trial running shoes')
const literal = ref('') // set when the shopper asks for their exact spelling
const price = ref<number | [number, number]>([60, 200])
const inStock = ref(false)
const sort = ref<string | number | null>('relevance')
const sorts = [{ value: 'relevance', label: 'Best match' }, { value: 'price', label: 'Price: low to high' }, { value: 'rating', label: 'Top rated' }]

// A tiny spelling fix for the demo; a real shop would ask its search engine.
const fixes: Record<string, string> = { trial: 'trail', runing: 'running', shose: 'shoes' }
const term = computed(() => {
  const words = query.value.trim().toLowerCase().split(/\s+/)
  return literal.value === query.value ? words.join(' ') : words.map(w => fixes[w] ?? w).join(' ')
})
const corrected = computed(() => (term.value !== query.value.trim().toLowerCase() ? term.value : ''))

// Sample catalogue; swap for your search API.
const products: Product[] = [
  { id: 1, brand: 'Ridgeline', name: 'Summit Grip 3 trail running shoe', price: 145, rating: 4.7, reviews: 812, stock: 12, hue: 'var(--mi-p)', tag: 'New', keywords: 'trail running shoes' },
  { id: 2, brand: 'Northpace', name: 'Scree Runner GTX waterproof', price: 168, rating: 4.5, reviews: 304, stock: 2, hue: 'var(--mi-teal)', keywords: 'trail running shoes waterproof' },
  { id: 3, brand: 'Ridgeline', name: 'Fell Light racing trail shoe', price: 119, was: 149, rating: 4.4, reviews: 158, stock: 6, hue: 'var(--mi-orange)', tag: 'Sale', keywords: 'trail running shoes race' },
  { id: 4, brand: 'Kestrel', name: 'Mudlark 2 grip running shoe', price: 98, rating: 4.2, reviews: 97, stock: 0, hue: 'var(--mi-green)', keywords: 'trail running shoes mud' },
  { id: 5, brand: 'Northpace', name: 'Contour Ultra cushioned trail', price: 189, rating: 4.8, reviews: 1204, stock: 9, hue: 'var(--mi-s)', keywords: 'trail running shoes ultra' },
  { id: 6, brand: 'Kestrel', name: 'Pathfinder everyday trail running shoe', price: 79, rating: 4.1, reviews: 431, stock: 3, hue: 'var(--mi-purple)', keywords: 'trail running shoes hiking' }
]
const dollars = (v: number): string => `$${v}`
const brands = [...new Set(products.map(p => p.brand))]
const brandOn = reactive<Record<string, boolean>>(Object.fromEntries(brands.map(b => [b, false])))

const range = computed<[number, number]>(() => (Array.isArray(price.value) ? price.value : [40, price.value]))
const matching = computed(() => {
  const words = term.value.split(' ').filter(Boolean)
  return products.filter(p => words.every(w => p.keywords.includes(w) || p.name.toLowerCase().includes(w)))
})
const passes = (p: Product, skipBrand = false): boolean =>
  p.price >= range.value[0] && p.price <= range.value[1] && (!inStock.value || p.stock > 0)
  && (skipBrand || !brands.some(b => brandOn[b]) || !!brandOn[p.brand])

// Brand counts ignore the brand filter itself, so you can see what adding one would bring.
const brandCount = (b: string): number => matching.value.filter(p => p.brand === b && passes(p, true)).length
const results = computed<Product[]>(() => {
  const list = matching.value.filter(p => passes(p))
  if (sort.value === 'price') return [...list].sort((a, b) => a.price - b.price)
  if (sort.value === 'rating') return [...list].sort((a, b) => b.rating - a.rating)
  return list
})
const filtered = computed(() => inStock.value || brands.some(b => brandOn[b]) || range.value[0] > 40 || range.value[1] < 240)

function clearAll() {
  price.value = [40, 240]
  inStock.value = false
  for (const b of brands) brandOn[b] = false
}
</script>

<style scoped>
.csr { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.csr__head { display: grid; gap: 8px; }
.csr__fix a { color: var(--mi-p-text); }
.csr__layout { display: grid; gap: 20px; }

.csr__facets { display: grid; align-content: start; gap: 18px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.csr__facet { display: grid; gap: 8px; }
.csr__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.csr__facets > :deep(button) { justify-self: start; }

.csr__main { display: grid; align-content: start; gap: 14px; min-width: 0; }
.csr__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.csr__bar h2 { margin: 0; }
.csr__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }

.csr__link { display: grid; gap: 4px; height: 100%; padding: 10px 10px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); color: inherit; text-decoration: none; }
.csr__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.csr__link:hover .csr__shoe { transform: translateY(-3px) rotate(-3deg); }
.csr__art { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; margin-bottom: 6px; border-radius: var(--mi-radius-m); background: radial-gradient(90% 90% at 30% 20%, color-mix(in srgb, var(--a) 28%, transparent), transparent 70%), var(--mi-fill4); }
.csr__shoe { width: 72%; fill: var(--a); transition: transform var(--mi-dur-3) var(--mi-spring); }
.csr__tag { position: absolute; top: 8px; left: 8px; }
.csr__brand { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--mi-label2); }
.csr__name { font-size: 14px; font-weight: 600; line-height: 1.3; }
.csr__rate { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--mi-orange-t); }
.csr__rate small { font-weight: 400; color: var(--mi-label2); }
.csr__price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; margin-top: 2px; }
.csr__price strong { font-size: 16px; font-variant-numeric: tabular-nums; }
.csr__price s { font-size: 13px; color: var(--mi-label3); }
.csr__low { font-size: 12px; font-weight: 600; color: var(--mi-red-t); }

@container (min-width: 760px) {
  .csr__layout { grid-template-columns: 240px minmax(0, 1fr); align-items: start; }
  .csr__grid { grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); }
}
</style>
