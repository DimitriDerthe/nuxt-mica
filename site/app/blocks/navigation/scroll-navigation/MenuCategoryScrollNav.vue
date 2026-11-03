<template>
  <section class="mcs mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="mcs-title">
    <header class="mcs__head mi:flex mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="mcs-title" variant="title3" as="h2" weight="semibold">Order at the table</MiText>
        <MiText variant="footnote" tone="label2">Café Sorrel · table 14</MiText>
      </div>
      <MiButton variant="tinted" size="small" :aria-label="`Basket, ${basket} items`">
        <template #leading><MiIcon name="tray" :size="15" /></template>{{ basket }}
      </MiButton>
    </header>

    <div ref="pane" class="mcs__pane mi:relative mi:h-110 mi:overflow-y-auto mi:overscroll-contain mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)] mi:@[720px]:h-120">
      <!-- Sticky chip bar: the chip of the category in view lights up and is kept centred in the strip. -->
      <nav ref="strip" class="mcs__strip mi:sticky mi:top-0 mi:z-1 mi:flex mi:gap-1.5 mi:py-2.5 mi:px-3 mi:overflow-x-auto mi:[scrollbar-width:none] mi:[background:color-mix(in_srgb,_var(--mi-card)_88%,_transparent)] mi:[backdrop-filter:blur(12px)] mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:@[720px]:py-3 mi:@[720px]:px-5" aria-label="Menu categories">
        <a
          v-for="c in categories" :key="c.id" :href="'#' + c.id" :data-id="c.id" class="mcs__chip mi:inline-flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:py-1.5 mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-semibold mi:text-label2 mi:[text-decoration:none] mi:[background:var(--mi-fill4)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:active:transform-[scale(.96)] mi:aria-current:text-p-on mi:aria-current:[background:var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
          :aria-current="c.id === active ? 'true' : undefined" @click.prevent="go(c.id)"
        >{{ c.label }}<span class="mcs__n mi:text-[11px] mi:font-medium mi:opacity-70 mi:tabular-nums">{{ c.items.length }}</span></a>
      </nav>

      <section v-for="c in categories" :id="c.id" :key="c.id" class="mcs__section mi:grid mi:gap-1 mi:pt-4.5 mi:px-3.5 mi:pb-1.5 mi:@[720px]:pt-5.5 mi:@[720px]:px-6 mi:@[720px]:pb-1.5" :aria-labelledby="c.id + '-h'">
        <MiText :id="c.id + '-h'" variant="headline" as="h3">{{ c.label }}</MiText>
        <ul class="mcs__items mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:@[720px]:grid-cols-2 mi:@[720px]:gap-x-7">
          <li v-for="it in c.items" :key="it.name" class="mcs__item mi:flex mi:items-center mi:gap-3 mi:py-3 mi:px-0 mi:[.mcs__item+&]:shadow-[inset_0_1px_0_var(--mi-sep)] mi:@[720px]:[.mcs__item+&]:shadow-none mi:@[720px]:shadow-[inset_0_1px_0_var(--mi-sep)]">
            <span class="mcs__plate mi:w-14 mi:h-14 mi:flex-[none] mi:rounded-[50%] mi:[background:radial-gradient(circle_at_40%_35%,_color-mix(in_srgb,_var(--a)_55%,_var(--mi-card))_0_30%,_var(--a)_31%_46%,_var(--mi-fill3)_47%)]" :style="{ '--a': `var(--mi-${c.hue})` }" aria-hidden="true" />
            <span class="mcs__text mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
              <MiText as="span" variant="subheadline" weight="semibold">{{ it.name }}</MiText>
              <MiText as="span" variant="caption" tone="label2" :lines="2">{{ it.desc }}</MiText>
              <MiText as="span" variant="footnote" weight="semibold" tabular>£{{ it.price.toFixed(2) }}</MiText>
            </span>
            <MiIconButton :label="`Add ${it.name}`" variant="tinted" size="small" @click="basket++"><MiIcon name="plus" :size="14" /></MiIconButton>
          </li>
        </ul>
      </section>
      <p class="mcs__end mi:m-0 mi:pt-4 mi:px-3.5 mi:pb-7 mi:text-[13px] mi:text-label3 mi:text-center">Kitchen closes at 15:30. Ask staff about allergens.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Hue = 'orange' | 'green' | 'pink' | 'teal' | 'indigo'
interface Dish { name: string, desc: string, price: number }
interface Category { id: string, label: string, hue: Hue, items: Dish[] }

const categories: Category[] = [
  { id: 'mcs-breakfast', label: 'Breakfast', hue: 'orange', items: [
    { name: 'Shakshuka', desc: 'Baked eggs, smoked paprika tomatoes, labneh, sourdough', price: 11.5 },
    { name: 'Buckwheat pancakes', desc: 'Poached pear, brown butter, crème fraîche', price: 9.8 },
    { name: 'Full Sorrel', desc: 'Two eggs, mushrooms, beans, greens, rye toast', price: 13 }
  ] },
  { id: 'mcs-bowls', label: 'Bowls', hue: 'green', items: [
    { name: 'Green goddess bowl', desc: 'Freekeh, charred broccoli, avocado, herb dressing', price: 12.5 },
    { name: 'Miso salmon bowl', desc: 'Brown rice, pickled radish, sesame greens', price: 14.2 }
  ] },
  { id: 'mcs-sandwiches', label: 'Sandwiches', hue: 'pink', items: [
    { name: 'Reuben', desc: 'Salt beef, sauerkraut, Swiss cheese, Russian dressing', price: 12 },
    { name: 'Halloumi flatbread', desc: 'Grilled halloumi, harissa, cucumber, mint', price: 10.5 },
    { name: 'Egg mayo bap', desc: 'Free-range eggs, cress, Dijon, soft white bap', price: 7.2 }
  ] },
  { id: 'mcs-cakes', label: 'Cakes', hue: 'indigo', items: [
    { name: 'Olive oil and lemon cake', desc: 'With a thyme syrup', price: 4.6 },
    { name: 'Cardamom bun', desc: 'Baked this morning', price: 3.8 }
  ] },
  { id: 'mcs-drinks', label: 'Drinks', hue: 'teal', items: [
    { name: 'Flat white', desc: 'Single-origin Huila, Colombia', price: 3.4 },
    { name: 'Rhubarb soda', desc: 'House-made, lightly sparkling', price: 3.9 },
    { name: 'Hojicha latte', desc: 'Roasted green tea, oat milk', price: 4.1 }
  ] }
]

const pane = ref<HTMLElement>()
const strip = ref<HTMLElement>()
const active = ref(categories[0]!.id)
const basket = ref(2)

const reduce = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Scroll the pane (never the page) so the section lands just under the sticky strip.
function go(id: string) {
  const el = pane.value?.querySelector<HTMLElement>('#' + id)
  if (!el || !pane.value || !strip.value) return
  active.value = id
  pane.value.scrollTo({ top: el.offsetTop - strip.value.offsetHeight - 8, behavior: reduce() ? 'auto' : 'smooth' })
}

// Keep the active chip centred in the strip as the reader scrolls.
watch(active, (id) => {
  const s = strip.value
  const chip = s?.querySelector<HTMLElement>(`[data-id="${id}"]`)
  if (!s || !chip) return
  s.scrollTo({ left: chip.offsetLeft - (s.clientWidth - chip.offsetWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' })
})

let io: IntersectionObserver | undefined
onMounted(() => {
  if (!pane.value) return
  const visible = new Set<string>()
  // A section is current while it crosses a thin band just under the strip.
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target.id)
      else visible.delete(e.target.id)
    }
    const first = categories.find(c => visible.has(c.id))
    if (first) active.value = first.id
  }, { root: pane.value, rootMargin: '-56px 0px -70% 0px' })
  pane.value.querySelectorAll('.mcs__section').forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())
</script>
