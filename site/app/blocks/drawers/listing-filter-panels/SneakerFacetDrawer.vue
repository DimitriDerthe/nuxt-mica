<template>
  <section class="sfd mi:@container mi:relative mi:grid mi:min-h-175 mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:font-mi mi:text-label" aria-labelledby="sfd-title">
    <!-- Product listing: applied facets show as removable chips above the grid. -->
    <div class="sfd__page mi:[grid-area:1_/_1] mi:grid mi:content-start mi:gap-3.5 mi:p-5" :inert="open || undefined">
      <div class="sfd__page-head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
        <div>
          <MiText id="sfd-title" variant="title3" as="h2" weight="semibold">Running shoes</MiText>
          <MiText variant="footnote" tone="label2" aria-live="polite">{{ results.length }} of {{ SHOES.length }} styles</MiText>
        </div>
        <MiButton variant="gray" size="small" @click="open = true">
          <template #leading><MiIcon name="sliders" :size="16" /></template>
          Filter{{ chips.length ? ' · ' + chips.length : '' }}
        </MiButton>
      </div>
      <div v-if="chips.length" class="sfd__chips mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Applied filters">
        <MiChip v-for="c in chips" :key="c.id" :label="c.label" size="small" removable :remove-label="'Remove ' + c.label" @remove="c.remove()" />
      </div>
      <ul class="sfd__grid mi:grid mi:grid-cols-2 mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[620px]:grid-cols-3 mi:@[960px]:grid-cols-4">
        <li v-for="s in results" :key="s.id" class="sfd__item mi:grid mi:gap-0.5 mi:p-2.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:text-[13px]">
          <span class="sfd__art mi:[.sfd__item_&:last-child]:text-label2 mi:grid mi:place-items-center mi:aspect-[4_/_3] mi:mb-2 mi:rounded-md mi:[background:radial-gradient(80%_60%_at_50%_80%,_color-mix(in_srgb,_var(--tone)_18%,_transparent),_var(--mi-fill4))]" :style="{ '--tone': COLORS[s.color] }" aria-hidden="true"><i class="mi:[.sfd__art_&]:w-[62%] mi:[.sfd__art_&]:h-[26%] mi:[.sfd__art_&]:rounded-[60%_40%_30%_30%_/_70%_60%_30%_30%] mi:[.sfd__art_&]:[background:linear-gradient(170deg,_color-mix(in_srgb,_var(--tone)_85%,_var(--mi-card)),_var(--tone))] mi:[.sfd__art_&]:shadow-[0_6px_0_-2px_var(--mi-card),_0_8px_0_-2px_var(--mi-sep)] mi:[.sfd__art_&]:transform-[rotate(-6deg)]" /></span>
          <b class="mi:[.sfd__item_&]:font-semibold">{{ s.name }}</b>
          <span class="mi:[.sfd__item_&:last-child]:text-label2">{{ s.brand }} · ${{ s.price }}</span>
        </li>
      </ul>
    </div>

    <div class="sfd__scrim mi:[grid-area:1_/_1] mi:[background:var(--mi-scrim)] mi:opacity-0 mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-on]:opacity-100 mi:[&.is-on]:pointer-events-auto" :class="{ 'is-on': open }" aria-hidden="true" @click="open = false" />

    <div class="sfd__drawer mi:[grid-area:1_/_1] mi:justify-self-end mi:self-stretch mi:w-[min(380px,_calc(100%_-_24px))] mi:p-2.5 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[&.is-closed]:transform-[translateX(105%)]" :class="{ 'is-closed': !open }" :inert="!open || undefined">
      <MiDrawer :model-value="true" inline swipe-direction="right" title="Filter" :description="results.length + ' styles match'">
        <MiAccordion v-model="openFacets" type="multiple" variant="plain">
          <MiAccordionItem value="size">
            <template #title>Size (EU){{ sizes.length ? ' · ' + sizes.length : '' }}</template>
            <div class="sfd__sizes mi:grid mi:grid-cols-[repeat(auto-fill,_minmax(52px,_1fr))] mi:gap-1.5" role="group" aria-label="Sizes">
              <button
                v-for="n in SIZES" :key="n" type="button" class="sfd__size mi:py-2 mi:px-0 mi:[border:0] mi:rounded-sm mi:[background:var(--mi-fill4)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:cursor-pointer mi:aria-pressed:[background:var(--mi-p)] mi:aria-pressed:shadow-none mi:aria-pressed:text-p-on mi:disabled:opacity-40 mi:disabled:[text-decoration:line-through] mi:disabled:cursor-default mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px]" :aria-pressed="sizes.includes(n)"
                :disabled="!stock.has(n)" @click="toggle(sizes, n)"
              >{{ n }}</button>
            </div>
          </MiAccordionItem>
          <MiAccordionItem value="color">
            <template #title>Colour{{ colors.length ? ' · ' + colors.length : '' }}</template>
            <div class="sfd__colors mi:flex mi:flex-wrap mi:gap-2.5" role="group" aria-label="Colours">
              <button
                v-for="(token, name) in COLORS" :key="name" type="button" class="sfd__color mi:w-8 mi:h-8 mi:[border:0] mi:rounded-[50%] mi:[background:var(--tone)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep2),_0_0_0_2px_var(--mi-card)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:aria-pressed:shadow-[inset_0_0_0_1px_var(--mi-sep2),_0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-p)] mi:aria-pressed:transform-[scale(1.06)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px]" :aria-pressed="colors.includes(name)"
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
            <div class="sfd__brands mi:grid mi:gap-2.5">
              <MiCheckbox
                v-for="b in BRANDS" :key="b" :label="b" :description="brandCount(b) + ' styles'"
                :model-value="brands.includes(b)" @update:model-value="toggle(brands, b)"
              />
            </div>
          </MiAccordionItem>
        </MiAccordion>

        <template #footer>
          <div class="sfd__foot mi:flex mi:[justify-content:flex-end] mi:gap-2">
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
.sfd__size { font: inherit; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>
