<template>
  <section class="sfd" aria-labelledby="sfd-title">
    <!-- Product listing: applied facets show as removable chips above the grid. -->
    <div class="sfd__page" :inert="open || undefined">
      <div class="sfd__page-head">
        <div>
          <MiText id="sfd-title" variant="title3" as="h2" weight="semibold">Running shoes</MiText>
          <MiText variant="footnote" tone="label2" aria-live="polite">{{ results.length }} of {{ SHOES.length }} styles</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="open = true">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Filter{{ chips.length ? ' · ' + chips.length : '' }}
        </MiButton>
      </div>
      <div v-if="chips.length" class="sfd__chips" role="group" aria-label="Applied filters">
        <MiChip v-for="c in chips" :key="c.id" :label="c.label" size="small" removable :remove-label="'Remove ' + c.label" @remove="c.remove()" />
      </div>
      <ul class="sfd__grid">
        <li v-for="s in results" :key="s.id" class="sfd__item">
          <span class="sfd__art" :style="{ '--tone': COLORS[s.color] }" aria-hidden="true"><i /></span>
          <b>{{ s.name }}</b>
          <span>{{ s.brand }} · ${{ s.price }}</span>
        </li>
      </ul>
    </div>

    <div class="sfd__scrim" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="sfd__drawer" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline swipe-direction="right" title="Filter" :description="results.length + ' styles match'">
        <MiAccordion v-model="openFacets" type="multiple" variant="plain">
          <MiAccordionItem value="size">
            <template #title>Size (EU){{ sizes.length ? ' · ' + sizes.length : '' }}</template>
            <div class="sfd__sizes" role="group" aria-label="Sizes">
              <button
                v-for="n in SIZES" :key="n" type="button" class="sfd__size" :aria-pressed="sizes.includes(n)"
                :disabled="!stock.has(n)" @click="toggle(sizes, n)"
              >{{ n }}</button>
            </div>
          </MiAccordionItem>
          <MiAccordionItem value="color">
            <template #title>Colour{{ colors.length ? ' · ' + colors.length : '' }}</template>
            <div class="sfd__colors" role="group" aria-label="Colours">
              <button
                v-for="(token, name) in COLORS" :key="name" type="button" class="sfd__color" :aria-pressed="colors.includes(name)"
                :aria-label="name" :title="name" :style="{ '--tone': token }" @click="toggle(colors, name)"
              />
            </div>
          </MiAccordionItem>
          <MiAccordionItem value="price">
            <template #title>Price{{ priceSet ? ' · set' : '' }}</template>
            <MiSlider v-model="price" aria-label="Price range" :min="60" :max="220" :step="10" show-value :format="v => '$' + v" />
          </MiAccordionItem>
          <MiAccordionItem value="brand">
            <template #title>Brand{{ brands.length ? ' · ' + brands.length : '' }}</template>
            <div class="sfd__brands">
              <MiCheckbox
                v-for="b in BRANDS" :key="b" :label="b" :description="brandCount(b) + ' styles'"
                :model-value="brands.includes(b)" @update:model-value="toggle(brands, b)"
              />
            </div>
          </MiAccordionItem>
        </MiAccordion>

        <template #footer>
          <div class="sfd__foot">
            <MiButton variant="gray" :disabled="!chips.length" @click="clearAll">Clear all</MiButton>
            <MiButton :disabled="!results.length" @click="open = false">Show {{ results.length }} styles</MiButton>
          </div>
        </template>
      </MiDrawer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Color = 'Black' | 'White' | 'Red' | 'Green' | 'Orange' | 'Blue'
interface Shoe { id: number, name: string, brand: string, price: number, color: Color, sizes: number[] }
interface AppliedChip { id: string, label: string, remove: () => void }

const COLORS: Record<Color, string> = { Black: 'var(--mi-label)', White: 'var(--mi-fill3)', Red: 'var(--mi-red)', Green: 'var(--mi-green)', Orange: 'var(--mi-orange)', Blue: 'var(--mi-blue)' }
const SIZES = [38, 39, 40, 41, 42, 43, 44, 45, 46]
const BRANDS = ['Stride', 'Kinetic', 'Fellrun']

const SHOES: Shoe[] = [
  { id: 1, name: 'Tempo 4', brand: 'Stride', price: 140, color: 'Orange', sizes: [39, 40, 41, 42, 43] },
  { id: 2, name: 'Cloudline', brand: 'Kinetic', price: 180, color: 'White', sizes: [38, 40, 42, 44] },
  { id: 3, name: 'Ridge Trail GTX', brand: 'Fellrun', price: 165, color: 'Green', sizes: [41, 42, 43, 44, 45] },
  { id: 4, name: 'Daily Glide', brand: 'Stride', price: 95, color: 'Black', sizes: [38, 39, 40, 41, 42, 43, 44, 45] },
  { id: 5, name: 'Sprint Elite', brand: 'Kinetic', price: 220, color: 'Red', sizes: [40, 41, 42] },
  { id: 6, name: 'Scree Pro', brand: 'Fellrun', price: 150, color: 'Blue', sizes: [42, 43, 44, 45] },
  { id: 7, name: 'Recovery Knit', brand: 'Stride', price: 70, color: 'White', sizes: [38, 39, 40, 41] },
  { id: 8, name: 'Marathon Carbon', brand: 'Kinetic', price: 210, color: 'Black', sizes: [39, 40, 41, 42, 43, 44] }
]

const open = ref(true)
const openFacets = ref<string | string[] | null>(['size', 'color'])
const sizes = ref<number[]>([42])
const colors = ref<Color[]>([])
const price = ref<number | [number, number]>([60, 220])
const range = computed<[number, number]>(() => (Array.isArray(price.value) ? price.value : [60, price.value]))
const priceSet = computed(() => range.value[0] > 60 || range.value[1] < 220)
const brands = ref<string[]>([])

function toggle<T>(list: T[], v: T) {
  const i = list.indexOf(v)
  if (i < 0) list.push(v)
  else list.splice(i, 1)
}

const fits = (s: Shoe, skip?: 'brand') => (!sizes.value.length || sizes.value.some(n => s.sizes.includes(n)))
  && (!colors.value.length || colors.value.includes(s.color))
  && s.price >= range.value[0] && s.price <= range.value[1]
  && (skip === 'brand' || !brands.value.length || brands.value.includes(s.brand))
const results = computed(() => SHOES.filter(s => fits(s)))
// Sizes nobody stocks are disabled; brand counts ignore the brand facet itself.
const stock = new Set(SHOES.flatMap(s => s.sizes))
const brandCount = (b: string) => SHOES.filter(s => s.brand === b && fits(s, 'brand')).length

const chips = computed<AppliedChip[]>(() => [
  ...sizes.value.map(n => ({ id: 's' + n, label: 'EU ' + n, remove: () => toggle(sizes.value, n) })),
  ...colors.value.map(c => ({ id: 'c' + c, label: c, remove: () => toggle(colors.value, c) })),
  ...(priceSet.value ? [{ id: 'p', label: `$${range.value[0]}–$${range.value[1]}`, remove: () => { price.value = [60, 220] } }] : []),
  ...brands.value.map(b => ({ id: 'b' + b, label: b, remove: () => toggle(brands.value, b) }))
])

function clearAll() {
  sizes.value = []
  colors.value = []
  price.value = [60, 220]
  brands.value = []
}
</script>

<style scoped>
.sfd { container-type: inline-size; position: relative; display: grid; min-height: 700px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); font-family: var(--mi-font); color: var(--mi-label); }
.sfd__page, .sfd__scrim, .sfd__drawer { grid-area: 1 / 1; }
.sfd__page { display: grid; align-content: start; gap: 14px; padding: 20px; }
.sfd__page-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sfd__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sfd__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
.sfd__item { display: grid; gap: 2px; padding: 10px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 13px; }
.sfd__item b { font-weight: 600; }
.sfd__item span:last-child { color: var(--mi-label2); }
/* Product art: a tinted plinth and a soft shoe-like lozenge in the style colour. */
.sfd__art { display: grid; place-items: center; aspect-ratio: 4 / 3; margin-bottom: 8px; border-radius: var(--mi-radius-m); background: radial-gradient(80% 60% at 50% 80%, color-mix(in srgb, var(--tone) 18%, transparent), var(--mi-fill4)); }
.sfd__art i { width: 62%; height: 26%; border-radius: 60% 40% 30% 30% / 70% 60% 30% 30%; background: linear-gradient(170deg, color-mix(in srgb, var(--tone) 85%, var(--mi-card)), var(--tone)); box-shadow: 0 6px 0 -2px var(--mi-card), 0 8px 0 -2px var(--mi-sep); transform: rotate(-6deg); }

.sfd__scrim { background: var(--mi-scrim); opacity: 0; pointer-events: none; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.sfd__scrim.is-on { opacity: 1; pointer-events: auto; }
.sfd__drawer { justify-self: end; align-self: stretch; width: min(380px, calc(100% - 24px)); padding: 10px; transition: transform var(--mi-dur-4) var(--mi-spring); }
.sfd__drawer.is-closed { transform: translateX(105%); }

.sfd__sizes { display: grid; grid-template-columns: repeat(auto-fill, minmax(52px, 1fr)); gap: 6px; }
.sfd__size { padding: 8px 0; border: 0; border-radius: var(--mi-radius-s); background: var(--mi-fill4); box-shadow: inset 0 0 0 1px var(--mi-sep); color: inherit; font: inherit; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; cursor: pointer; }
.sfd__size[aria-pressed="true"] { background: var(--mi-p); box-shadow: none; color: var(--mi-p-on); }
.sfd__size:disabled { opacity: .4; text-decoration: line-through; cursor: default; }
.sfd__colors { display: flex; flex-wrap: wrap; gap: 10px; }
.sfd__color { width: 32px; height: 32px; border: 0; border-radius: 50%; background: var(--tone); box-shadow: inset 0 0 0 1px var(--mi-sep2), 0 0 0 2px var(--mi-card); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-spring); }
.sfd__color[aria-pressed="true"] { box-shadow: inset 0 0 0 1px var(--mi-sep2), 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-p); transform: scale(1.06); }
.sfd__size:focus-visible, .sfd__color:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.sfd__brands { display: grid; gap: 10px; }
.sfd__foot { display: flex; justify-content: flex-end; gap: 8px; }

@container (min-width: 620px) {
  .sfd__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@container (min-width: 960px) {
  .sfd__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
