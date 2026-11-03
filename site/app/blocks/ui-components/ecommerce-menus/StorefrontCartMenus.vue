<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="scm-title">
    <header class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:pb-3.5 mi:[border-bottom:.5px_solid_var(--mi-sep)]">
      <MiText id="scm-title" variant="headline" as="h2" class="mi:tracking-[-.02em]!">Ferment <span class="mi:text-p-text mi:italic">&amp;</span> Field</MiText>
      <nav class="mi:flex mi:items-center mi:gap-1.5" aria-label="Store">
        <MiMenu :items="shopItems" aria-label="Shop categories" @select="(i) => browse(String(i.label))">
          <template #trigger="{ props: tp }">
            <MiButton v-bind="tp" variant="plain" size="small">Shop<template #trailing><MiIcon name="chevron-down" :size="14" /></template></MiButton>
          </template>
        </MiMenu>
        <MiMenu v-model="currency" variant="popup" :items="currencyItems" aria-label="Currency" placement="bottom-end" />
      </nav>
    </header>

    <div class="mi:grid mi:gap-5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[780px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[780px]:gap-7">
      <!-- Category menu, open in place: three aisles and one featured box. -->
      <div class="mi:grid mi:gap-y-4.5 mi:gap-x-6 mi:grid-cols-2 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:@[560px]:grid-cols-3" role="group" aria-label="Shop menu, shown open">
        <div v-for="aisle in aisles" :key="aisle.name">
          <MiText variant="caption" tone="label2" weight="semibold" as="h3" class="mi:uppercase mi:tracking-[.08em]!">{{ aisle.name }}</MiText>
          <ul class="mi:grid mi:[margin:6px_0_0] mi:gap-0.5 mi:p-0 mi:[list-style:none]">
            <li v-for="link in aisle.links" :key="link">
              <button type="button" class="mi:[font:inherit] mi:text-[14px] mi:[&[aria-current='page']]:font-semibold mi:w-full mi:py-1.5 mi:px-2 mi:-ms-2 mi:[border:0] mi:rounded-sm mi:[background:none] mi:text-label mi:text-start mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:[&[aria-current='page']]:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-current="browsing === link ? 'page' : undefined" @click="browse(link)">{{ link }}</button>
            </li>
          </ul>
        </div>
        <button type="button" class="mi:group/feat mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px] mi:col-span-full mi:flex mi:items-center mi:gap-3.5 mi:p-2.5 mi:[border:0] mi:rounded-lg mi:[background:var(--mi-fill4)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer" @click="browse('Autumn harvest box')">
          <span class="mi:relative mi:flex-[none] mi:w-18 mi:h-14 mi:rounded-[12px] mi:overflow-hidden mi:[background:linear-gradient(160deg,_color-mix(in_srgb,_var(--mi-orange)_35%,_var(--mi-card)),_color-mix(in_srgb,_var(--mi-p)_30%,_var(--mi-card)))]" aria-hidden="true"><i class="mi:group-hover/feat:transform-[translateY(-2px)] mi:absolute mi:bottom-2 mi:rounded-[50%_50%_6px_6px] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:nth-child(1)]:left-2 mi:[&:nth-child(1)]:w-4.5 mi:[&:nth-child(1)]:h-6.5 mi:[&:nth-child(1)]:[background:var(--mi-orange)] mi:[&:nth-child(2)]:left-7 mi:[&:nth-child(2)]:w-4 mi:[&:nth-child(2)]:h-8.5 mi:[&:nth-child(2)]:[background:var(--mi-p)] mi:[&:nth-child(2)]:delay-[30ms] mi:[&:nth-child(3)]:left-11.5 mi:[&:nth-child(3)]:w-4.5 mi:[&:nth-child(3)]:h-5.5 mi:[&:nth-child(3)]:[background:var(--mi-green)] mi:[&:nth-child(3)]:delay-[60ms]" /><i class="mi:group-hover/feat:transform-[translateY(-2px)] mi:absolute mi:bottom-2 mi:rounded-[50%_50%_6px_6px] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:nth-child(1)]:left-2 mi:[&:nth-child(1)]:w-4.5 mi:[&:nth-child(1)]:h-6.5 mi:[&:nth-child(1)]:[background:var(--mi-orange)] mi:[&:nth-child(2)]:left-7 mi:[&:nth-child(2)]:w-4 mi:[&:nth-child(2)]:h-8.5 mi:[&:nth-child(2)]:[background:var(--mi-p)] mi:[&:nth-child(2)]:delay-[30ms] mi:[&:nth-child(3)]:left-11.5 mi:[&:nth-child(3)]:w-4.5 mi:[&:nth-child(3)]:h-5.5 mi:[&:nth-child(3)]:[background:var(--mi-green)] mi:[&:nth-child(3)]:delay-[60ms]" /><i class="mi:group-hover/feat:transform-[translateY(-2px)] mi:absolute mi:bottom-2 mi:rounded-[50%_50%_6px_6px] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:[&:nth-child(1)]:left-2 mi:[&:nth-child(1)]:w-4.5 mi:[&:nth-child(1)]:h-6.5 mi:[&:nth-child(1)]:[background:var(--mi-orange)] mi:[&:nth-child(2)]:left-7 mi:[&:nth-child(2)]:w-4 mi:[&:nth-child(2)]:h-8.5 mi:[&:nth-child(2)]:[background:var(--mi-p)] mi:[&:nth-child(2)]:delay-[30ms] mi:[&:nth-child(3)]:left-11.5 mi:[&:nth-child(3)]:w-4.5 mi:[&:nth-child(3)]:h-5.5 mi:[&:nth-child(3)]:[background:var(--mi-green)] mi:[&:nth-child(3)]:delay-[60ms]" /></span>
          <span class="mi:grid mi:gap-0.5 mi:text-[14px]">
            <strong>Autumn harvest box</strong>
            <span class="mi:text-[12px] mi:text-label2">12 small-batch goods · ships Nov 18</span>
          </span>
        </button>
        <MiText variant="caption" tone="label3" class="mi:col-span-full" aria-live="polite">Browsing: {{ browsing }}</MiText>
      </div>

      <!-- Mini bag: quantities, threshold meter and totals all reprice with the currency. -->
      <MiPopover v-model="bagOpen" inline trigger="manual" :width="280" :arrow-offset="36" label="Your bag">
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

        <div class="mi:grid mi:gap-3.5">
          <div class="mi:grid mi:gap-1.5" aria-live="polite">
            <MiText variant="footnote" weight="medium">{{ shipText }}</MiText>
            <div class="mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Progress to free shipping" :aria-valuenow="Math.round(subtotal)" aria-valuemin="0" :aria-valuemax="threshold">
              <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="subtotal >= threshold ? 'mi:bg-green' : 'mi:bg-p'" :style="{ transform: `scaleX(${Math.min(1, subtotal / threshold)})` }" />
            </div>
          </div>

          <ul v-if="lines.length" class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li v-for="line in lines" :key="line.id" class="mi:grid mi:grid-cols-[40px_minmax(0,_1fr)_auto] mi:gap-2.5 mi:items-start">
              <span class="mi:w-10 mi:h-10 mi:rounded-[10px] mi:[background:radial-gradient(circle_at_30%_30%,_color-mix(in_srgb,_var(--a)_70%,_var(--mi-card)),_color-mix(in_srgb,_var(--a)_25%,_var(--mi-card)))]" :style="{ '--a': `var(--mi-${line.hue})` }" aria-hidden="true" />
              <div class="mi:grid mi:gap-px mi:min-w-0">
                <MiText variant="footnote" weight="semibold" :lines="1">{{ line.name }}</MiText>
                <MiText variant="caption2" tone="label2" :lines="1">{{ line.variant }}</MiText>
                <MiStepper v-model="line.qty" :min="0" :max="9" :label="'Quantity of ' + line.name" show-value class="mi:mt-1.5 mi:justify-self-start" />
              </div>
              <span class="mi:text-[13px] mi:font-semibold mi:tabular-nums">{{ price(line.price * line.qty) }}</span>
            </li>
          </ul>
          <MiText v-else variant="footnote" tone="label2" class="mi:py-2 mi:px-0">Your bag is empty.</MiText>

          <div class="mi:flex mi:justify-between mi:pt-3 mi:[border-top:.5px_solid_var(--mi-sep)] mi:text-[15px] mi:tabular-nums">
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
