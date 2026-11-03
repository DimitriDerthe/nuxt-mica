<template>
  <section class="cfm mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="cfm-title">
    <header class="cfm__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText variant="caption" tone="label2" weight="medium">Women · Knitwear</MiText>
        <MiText id="cfm-title" variant="title3" as="h2" weight="semibold">Merino and cashmere</MiText>
      </div>
      <MiMenu v-model="sort" variant="popup" :items="sortItems" aria-label="Sort products" placement="bottom-end" />
    </header>

    <div class="cfm__body mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[760px]:gap-6">
      <!-- Filter popover, shown open in place; the wrapper owns its grid cell. -->
      <div class="cfm__filters mi:min-w-0">
        <MiPopover v-model="open" inline trigger="manual" :width="300" :arrow-offset="44" label="Filters">
          <template #trigger="{ attrs, toggle }">
            <MiButton v-bind="attrs" size="small" :variant="activeCount ? 'tinted' : 'gray'" @click="toggle">
              <template #leading><MiIcon name="sliders" :size="16" /></template>
              Filters<template v-if="activeCount"> · {{ activeCount }}</template>
            </MiButton>
          </template>

          <div class="cfm__panel mi:grid mi:gap-4">
            <MiSlider v-model="price" :min="40" :max="260" :step="10" label="Price" :format="v => '$' + v" />
            <div class="cfm__group mi:grid mi:gap-2">
              <MiText variant="footnote" weight="semibold" aria-hidden="true">Size</MiText>
              <MiToggleGroup v-model="sizes" multiple :options="sizeOptions" size="sm" variant="outline" label="Size" />
            </div>
            <MiSwatch v-model="color" :options="colors" label="Colour" />
            <div class="cfm__panel-foot mi:flex mi:justify-between mi:gap-2 mi:border-t mi:border-t-sep mi:pt-3">
              <MiButton size="small" variant="plain" :disabled="!activeCount" @click="reset">Reset</MiButton>
              <MiButton size="small" @click="open = false">Show {{ shown.length }} {{ shown.length === 1 ? 'item' : 'items' }}</MiButton>
            </div>
          </div>
        </MiPopover>
      </div>

      <ul class="cfm__grid mi:grid mi:gap-3 mi:grid-cols-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[1000px]:grid-cols-3" aria-label="Products" aria-live="polite">
        <li v-for="p in shown" :key="p.id" class="cfm__card mi:grid mi:gap-2 mi:min-w-0 mi:pt-2 mi:px-2 mi:pb-3 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <span class="cfm__art mi:grid mi:place-items-center mi:aspect-[4_/_3] mi:rounded-md mi:[background:repeating-linear-gradient(90deg,_color-mix(in_srgb,_var(--tone)_22%,_var(--mi-card))_0_6px,_color-mix(in_srgb,_var(--tone)_32%,_var(--mi-card))_6px_9px)]" :style="{ '--tone': toneOf(p.color) }" aria-hidden="true"><i class="mi:[.cfm__art_&]:w-[44%] mi:[.cfm__art_&]:aspect-[1] mi:[.cfm__art_&]:rounded-[30%_30%_12%_12%] mi:[.cfm__art_&]:[background:var(--tone)] mi:[.cfm__art_&]:shadow-2" /></span>
          <div class="cfm__info mi:grid mi:min-w-0 mi:px-1">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2">{{ p.sizes.join(' · ') }}</MiText>
          </div>
          <span class="cfm__price mi:px-1 mi:font-bold mi:tabular-nums">
            <s v-if="p.was" class="cfm__was mi:me-1.5 mi:font-medium mi:text-label3">${{ p.was }}</s>${{ p.price }}
          </span>
        </li>
        <li v-if="!shown.length" class="cfm__empty mi:col-span-full mi:py-7 mi:px-3 mi:text-center mi:rounded-lg mi:[background:var(--mi-fill4)]"><MiText variant="footnote" tone="label2">Nothing in this range. Widen the price or clear a size.</MiText></li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'
interface Product { id: number, name: string, price: number, was?: number, color: string, sizes: Size[], added: number, sold: number }

const colors = [
  { value: 'oat', name: 'Oat', color: 'color-mix(in srgb, var(--mi-orange) 35%, var(--mi-card))' },
  { value: 'forest', name: 'Forest', color: 'var(--mi-green)' },
  { value: 'navy', name: 'Navy', color: 'var(--mi-indigo)' },
  { value: 'rust', name: 'Rust', color: 'var(--mi-red)' }
]
const products: Product[] = [
  { id: 1, name: 'Ribbed merino crew', price: 89, color: 'oat', sizes: ['XS', 'S', 'M', 'L'], added: 6, sold: 412 },
  { id: 2, name: 'Cashmere V-neck', price: 189, was: 229, color: 'navy', sizes: ['S', 'M', 'L'], added: 3, sold: 168 },
  { id: 3, name: 'Fisherman cardigan', price: 145, color: 'forest', sizes: ['M', 'L', 'XL'], added: 1, sold: 97 },
  { id: 4, name: 'Fine-gauge turtleneck', price: 79, color: 'rust', sizes: ['XS', 'S', 'M'], added: 9, sold: 530 },
  { id: 5, name: 'Cashmere hoodie', price: 245, color: 'oat', sizes: ['S', 'M', 'L', 'XL'], added: 2, sold: 74 },
  { id: 6, name: 'Merino polo knit', price: 69, was: 85, color: 'navy', sizes: ['M', 'L', 'XL'], added: 12, sold: 286 }
]

const sortItems = [{ value: 'popular', label: 'Most popular' }, { value: 'new', label: 'Newest' }, { value: 'low', label: 'Price: low to high' }, { value: 'high', label: 'Price: high to low' }]
const sizeOptions = (['XS', 'S', 'M', 'L', 'XL'] as const).map(s => ({ value: s, label: s }))

const sort = ref<string | number | undefined>('popular')
const open = ref(true)
const price = ref<number | [number, number]>([40, 200])
const sizes = ref<string | number | (string | number)[] | null>(['M'])
const color = ref<string | null>(null)

const range = computed<[number, number]>(() => (Array.isArray(price.value) ? price.value : [40, price.value]))
const sizeList = computed(() => (Array.isArray(sizes.value) ? sizes.value.map(String) : []))
const activeCount = computed(() => sizeList.value.length + (color.value ? 1 : 0) + (range.value[0] > 40 || range.value[1] < 260 ? 1 : 0))

const shown = computed(() => {
  const [lo, hi] = range.value
  const list = products.filter(p => p.price >= lo && p.price <= hi
    && (!sizeList.value.length || p.sizes.some(s => sizeList.value.includes(s)))
    && (!color.value || p.color === color.value))
  const by: Record<string, (a: Product, b: Product) => number> = {
    popular: (a, b) => b.sold - a.sold, new: (a, b) => a.added - b.added, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price
  }
  return list.sort(by[String(sort.value)] ?? by.popular)
})

const toneOf = (c: string) => colors.find(x => x.value === c)?.color ?? 'var(--mi-fill2)'
function reset() { price.value = [40, 260]; sizes.value = []; color.value = null }
</script>
