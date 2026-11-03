<template>
  <section class="scm" aria-labelledby="scm-title">
    <header class="scm__bar">
      <MiText id="scm-title" variant="headline" as="h2" class="scm__brand">Ferment <span>&amp;</span> Field</MiText>
      <nav class="scm__nav" aria-label="Store">
        <MiMenu :items="shopItems" aria-label="Shop categories" @select="(i) => browse(String(i.label))">
          <template #trigger="{ props: tp }">
            <MiButton v-bind="tp" variant="plain" size="small">Shop<template #trailing><MiIcon name="chevron-down" :size="14" /></template></MiButton>
          </template>
        </MiMenu>
        <MiMenu v-model="currency" variant="popup" :items="currencyItems" aria-label="Currency" placement="bottom-end" />
      </nav>
    </header>

    <div class="scm__body">
      <!-- Category menu, open in place: three aisles and one featured box. -->
      <div class="scm__mega" role="group" aria-label="Shop menu, shown open">
        <div v-for="aisle in aisles" :key="aisle.name" class="scm__aisle">
          <MiText variant="caption" tone="label2" weight="semibold" as="h3" class="scm__aisle-name">{{ aisle.name }}</MiText>
          <ul>
            <li v-for="link in aisle.links" :key="link">
              <button type="button" class="scm__link" :aria-current="browsing === link ? 'page' : undefined" @click="browse(link)">{{ link }}</button>
            </li>
          </ul>
        </div>
        <button type="button" class="scm__feature" @click="browse('Autumn harvest box')">
          <span class="scm__art" aria-hidden="true"><i /><i /><i /></span>
          <span class="scm__feature-text">
            <strong>Autumn harvest box</strong>
            <span>12 small-batch goods · ships Nov 18</span>
          </span>
        </button>
        <MiText variant="caption" tone="label3" class="scm__status" aria-live="polite">Browsing: {{ browsing }}</MiText>
      </div>

      <!-- Mini bag: quantities, threshold meter and totals all reprice with the currency. -->
      <MiPopover v-model="bagOpen" inline trigger="manual" :width="280" :arrow-offset="36" label="Your bag" class="scm__pop">
        <template #trigger="{ attrs, toggle }">
          <MiBadge :count="count" tone="primary" count-noun="items in bag">
            <template #target>
              <MiButton v-bind="attrs" variant="gray" size="small" @click="toggle">
                <template #leading><MiIcon :svg="bagSvg" :size="16" /></template>
                Bag
              </MiButton>
            </template>
          </MiBadge>
        </template>

        <div class="scm__bag">
          <div class="scm__ship" aria-live="polite">
            <MiText variant="footnote" weight="medium">{{ shipText }}</MiText>
            <div class="scm__meter" role="meter" aria-label="Progress to free shipping" :aria-valuenow="Math.round(subtotal)" aria-valuemin="0" :aria-valuemax="threshold">
              <span :class="{ 'is-full': subtotal >= threshold }" :style="{ transform: `scaleX(${Math.min(1, subtotal / threshold)})` }" />
            </div>
          </div>

          <ul v-if="lines.length" class="scm__lines">
            <li v-for="line in lines" :key="line.id" class="scm__line">
              <span class="scm__thumb" :style="{ '--a': `var(--mi-${line.hue})` }" aria-hidden="true" />
              <div class="scm__line-text">
                <MiText variant="footnote" weight="semibold" :lines="1">{{ line.name }}</MiText>
                <MiText variant="caption2" tone="label2" :lines="1">{{ line.variant }}</MiText>
                <MiStepper v-model="line.qty" :min="0" :max="9" :label="'Quantity of ' + line.name" show-value class="scm__step" />
              </div>
              <span class="scm__price">{{ price(line.price * line.qty) }}</span>
            </li>
          </ul>
          <MiText v-else variant="footnote" tone="label2" class="scm__empty">Your bag is empty.</MiText>

          <div class="scm__sum">
            <span>Subtotal</span><strong>{{ price(subtotal) }}</strong>
          </div>
          <MiButton block :disabled="!lines.length">Checkout</MiButton>
        </div>
      </MiPopover>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const bagSvg = '<path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>'

const aisles = [
  { name: 'Pantry', links: ['Salts & spices', 'Honey & preserves', 'Oils & vinegars'] },
  { name: 'Tea', links: ['Black & oolong', 'Green & white', 'Herbal blends'] },
  { name: 'Table', links: ['Mugs & cups', 'Plates', 'Linen'] }
]
const shopItems = aisles.flatMap(a => [{ heading: a.name }, ...a.links.map(l => ({ value: l, label: l }))])
const browsing = ref('Honey & preserves')
const browse = (label: string) => { browsing.value = label }

const rates = { EUR: { rate: 1, code: 'EUR' }, GBP: { rate: 0.86, code: 'GBP' }, USD: { rate: 1.08, code: 'USD' } } as const
const currencyItems = [{ value: 'EUR', label: '€ EUR' }, { value: 'GBP', label: '£ GBP' }, { value: 'USD', label: '$ USD' }]
const currency = ref<string | number | undefined>('EUR')
const cur = computed(() => rates[(currency.value ?? 'EUR') as keyof typeof rates])
const price = (eur: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur.value.code }).format(eur * cur.value.rate)

const bagOpen = ref(true)
const lines = ref([
  { id: 'salt', name: 'Smoked sea salt flakes', variant: '120 g · oak smoked', price: 9.5, qty: 2, hue: 'teal' },
  { id: 'mug', name: 'Stoneware mug', variant: 'Ash glaze · 330 ml', price: 34, qty: 1, hue: 'orange' },
  { id: 'tea', name: 'First flush Darjeeling', variant: '50 g tin · 2026 harvest', price: 18, qty: 1, hue: 'green' }
])
// A quantity stepped down to zero leaves the bag.
watch(() => lines.value.some(l => l.qty === 0), (empty) => { if (empty) lines.value = lines.value.filter(l => l.qty > 0) })

const count = computed(() => lines.value.reduce((s, l) => s + l.qty, 0))
const subtotal = computed(() => lines.value.reduce((s, l) => s + l.price * l.qty, 0))
const threshold = 80
const shipText = computed(() => subtotal.value >= threshold ? 'Free shipping unlocked' : `${price(threshold - subtotal.value)} away from free shipping`)
</script>

<style scoped>
.scm { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.scm__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 14px; border-bottom: .5px solid var(--mi-sep); }
.scm__brand { letter-spacing: -.02em; }
.scm__brand span { color: var(--mi-p-text); font-style: italic; }
.scm__nav { display: flex; align-items: center; gap: 6px; }

.scm__body { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); align-items: start; }
.scm__pop { order: -1; justify-self: start; }
@container (min-width: 780px) { .scm__body { grid-template-columns: minmax(0, 1fr) 280px; gap: 28px; } .scm__pop { order: 0; } }

.scm__mega { display: grid; gap: 18px 24px; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
@container (min-width: 560px) { .scm__mega { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.scm__aisle ul { display: grid; gap: 2px; margin: 6px 0 0; padding: 0; list-style: none; }
.scm__aisle-name { text-transform: uppercase; letter-spacing: .08em; }
.scm__link { width: 100%; padding: 6px 8px; margin-inline-start: -8px; border: 0; border-radius: var(--mi-radius-s); background: none; color: var(--mi-label); font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
.scm__link:hover { background: var(--mi-fill4); }
.scm__link[aria-current="page"] { color: var(--mi-p-text); font-weight: 600; }
.scm__link:focus-visible, .scm__feature:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

.scm__feature { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; padding: 10px; border: 0; border-radius: var(--mi-radius-l); background: var(--mi-fill4); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.scm__feature:hover .scm__art i { transform: translateY(-2px); }
.scm__art { position: relative; flex: none; width: 72px; height: 56px; border-radius: 12px; overflow: hidden; background: linear-gradient(160deg, color-mix(in srgb, var(--mi-orange) 35%, var(--mi-card)), color-mix(in srgb, var(--mi-p) 30%, var(--mi-card))); }
.scm__art i { position: absolute; bottom: 8px; border-radius: 50% 50% 6px 6px; transition: transform var(--mi-dur-2) var(--mi-spring); }
.scm__art i:nth-child(1) { left: 8px; width: 18px; height: 26px; background: var(--mi-orange); }
.scm__art i:nth-child(2) { left: 28px; width: 16px; height: 34px; background: var(--mi-p); transition-delay: 30ms; }
.scm__art i:nth-child(3) { left: 46px; width: 18px; height: 22px; background: var(--mi-green); transition-delay: 60ms; }
.scm__feature-text { display: grid; gap: 2px; font-size: 14px; }
.scm__feature-text span { font-size: 12px; color: var(--mi-label2); }
.scm__status { grid-column: 1 / -1; }

.scm__bag { display: grid; gap: 14px; }
.scm__ship { display: grid; gap: 6px; }
.scm__meter { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.scm__meter span { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.scm__meter span.is-full { background: var(--mi-green); }
.scm__lines { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.scm__line { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 10px; align-items: start; }
.scm__thumb { width: 40px; height: 40px; border-radius: 10px; background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--a) 70%, var(--mi-card)), color-mix(in srgb, var(--a) 25%, var(--mi-card))); }
.scm__line-text { display: grid; gap: 1px; min-width: 0; }
.scm__step { margin-top: 6px; justify-self: start; }
.scm__price { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.scm__empty { padding: 8px 0; }
.scm__sum { display: flex; justify-content: space-between; padding-top: 12px; border-top: .5px solid var(--mi-sep); font-size: 15px; font-variant-numeric: tabular-nums; }
</style>
