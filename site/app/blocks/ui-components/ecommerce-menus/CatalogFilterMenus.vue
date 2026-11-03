<template>
  <section class="cfm" aria-labelledby="cfm-title">
    <header class="cfm__head">
      <div>
        <MiText variant="caption" tone="label2" weight="medium">Women · Knitwear</MiText>
        <MiText id="cfm-title" variant="title3" as="h2" weight="semibold">Merino and cashmere</MiText>
      </div>
      <MiMenu v-model="sort" variant="popup" :items="sortItems" aria-label="Sort products" placement="bottom-end" />
    </header>

    <div class="cfm__body">
      <!-- Filter popover, shown open in place; the wrapper owns its grid cell. -->
      <div class="cfm__filters">
        <MiPopover v-model="open" inline trigger="manual" :width="300" :arrow-offset="44" label="Filters">
          <template #trigger="{ attrs, toggle }">
            <MiButton v-bind="attrs" size="small" :variant="activeCount ? 'tinted' : 'gray'" @click="toggle">
              <template #leading><MiIcon name="sliders" :size="16" /></template>
              Filters<template v-if="activeCount"> · {{ activeCount }}</template>
            </MiButton>
          </template>

          <div class="cfm__panel">
            <MiSlider v-model="price" :min="40" :max="260" :step="10" label="Price" :format="v => '$' + v" />
            <div class="cfm__group">
              <MiText variant="footnote" weight="semibold" aria-hidden="true">Size</MiText>
              <MiToggleGroup v-model="sizes" multiple :options="sizeOptions" size="sm" variant="outline" label="Size" />
            </div>
            <MiSwatch v-model="color" :options="colors" label="Colour" />
            <div class="cfm__panel-foot">
              <MiButton size="small" variant="plain" :disabled="!activeCount" @click="reset">Reset</MiButton>
              <MiButton size="small" @click="open = false">Show {{ shown.length }} {{ shown.length === 1 ? 'item' : 'items' }}</MiButton>
            </div>
          </div>
        </MiPopover>
      </div>

      <ul class="cfm__grid" aria-label="Products" aria-live="polite">
        <li v-for="p in shown" :key="p.id" class="cfm__card">
          <span class="cfm__art" :style="{ '--tone': toneOf(p.color) }" aria-hidden="true"><i /></span>
          <div class="cfm__info">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2">{{ p.sizes.join(' · ') }}</MiText>
          </div>
          <span class="cfm__price">
            <s v-if="p.was" class="cfm__was">${{ p.was }}</s>${{ p.price }}
          </span>
        </li>
        <li v-if="!shown.length" class="cfm__empty"><MiText variant="footnote" tone="label2">Nothing in this range. Widen the price or clear a size.</MiText></li>
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

<style scoped>
.cfm { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.cfm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.cfm__body { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 760px) { .cfm__body { grid-template-columns: 300px minmax(0, 1fr); gap: 24px; } }
.cfm__filters { min-width: 0; }
.cfm__panel { display: grid; gap: 16px; }
.cfm__group { display: grid; gap: 8px; }
.cfm__panel-foot { display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid var(--mi-sep); padding-top: 12px; }

.cfm__grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; padding: 0; list-style: none; }
@container (min-width: 1000px) { .cfm__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.cfm__card { display: grid; gap: 8px; min-width: 0; padding: 8px 8px 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
/* Product art: a knit-like stripe pattern in the product colour, no images. */
.cfm__art { display: grid; place-items: center; aspect-ratio: 4 / 3; border-radius: var(--mi-radius-m); background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--tone) 22%, var(--mi-card)) 0 6px, color-mix(in srgb, var(--tone) 32%, var(--mi-card)) 6px 9px); }
.cfm__art i { width: 44%; aspect-ratio: 1; border-radius: 30% 30% 12% 12%; background: var(--tone); box-shadow: var(--mi-sh2); }
.cfm__info { display: grid; min-width: 0; padding-inline: 4px; }
.cfm__price { padding-inline: 4px; font-weight: 700; font-variant-numeric: tabular-nums; }
.cfm__was { margin-inline-end: 6px; font-weight: 500; color: var(--mi-label3); }
.cfm__empty { grid-column: 1 / -1; padding: 28px 12px; text-align: center; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
</style>
