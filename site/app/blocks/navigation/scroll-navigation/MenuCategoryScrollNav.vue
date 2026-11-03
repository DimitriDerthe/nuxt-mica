<template>
  <section class="mcs" aria-labelledby="mcs-title">
    <header class="mcs__head">
      <div>
        <MiText id="mcs-title" variant="title3" as="h2" weight="semibold">Order at the table</MiText>
        <MiText variant="footnote" tone="label2">Café Sorrel · table 14</MiText>
      </div>
      <MiButton variant="tinted" size="small" :aria-label="`Basket, ${basket} items`">
        <template #leading><MiIcon name="tray" :size="15" /></template>{{ basket }}
      </MiButton>
    </header>

    <div ref="pane" class="mcs__pane">
      <!-- Sticky chip bar: the chip of the category in view lights up and is kept centred in the strip. -->
      <nav ref="strip" class="mcs__strip" aria-label="Menu categories">
        <a
          v-for="c in categories" :key="c.id" :href="'#' + c.id" :data-id="c.id" class="mcs__chip"
          :aria-current="c.id === active ? 'true' : undefined" @click.prevent="go(c.id)"
        >{{ c.label }}<span class="mcs__n">{{ c.items.length }}</span></a>
      </nav>

      <section v-for="c in categories" :id="c.id" :key="c.id" class="mcs__section" :aria-labelledby="c.id + '-h'">
        <MiText :id="c.id + '-h'" variant="headline" as="h3">{{ c.label }}</MiText>
        <ul class="mcs__items">
          <li v-for="it in c.items" :key="it.name" class="mcs__item">
            <span class="mcs__plate" :style="{ '--a': `var(--mi-${c.hue})` }" aria-hidden="true" />
            <span class="mcs__text">
              <MiText as="span" variant="subheadline" weight="semibold">{{ it.name }}</MiText>
              <MiText as="span" variant="caption" tone="label2" :lines="2">{{ it.desc }}</MiText>
              <MiText as="span" variant="footnote" weight="semibold" tabular>£{{ it.price.toFixed(2) }}</MiText>
            </span>
            <MiIconButton :label="`Add ${it.name}`" variant="tinted" size="small" @click="basket++"><MiIcon name="plus" :size="14" /></MiIconButton>
          </li>
        </ul>
      </section>
      <p class="mcs__end">Kitchen closes at 15:30. Ask staff about allergens.</p>
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

<style scoped>
.mcs { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.mcs__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }

.mcs__pane { position: relative; height: 440px; overflow-y: auto; overscroll-behavior: contain; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1), inset 0 0 0 1px var(--mi-sep); }

.mcs__strip {
  position: sticky; top: 0; z-index: 1; display: flex; gap: 6px; padding: 10px 12px; overflow-x: auto; scrollbar-width: none;
  background: color-mix(in srgb, var(--mi-card) 88%, transparent); backdrop-filter: blur(12px); box-shadow: inset 0 -1px 0 var(--mi-sep);
}
.mcs__chip {
  display: inline-flex; align-items: center; gap: 6px; flex: none; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600;
  color: var(--mi-label2); text-decoration: none; background: var(--mi-fill4); transition: transform var(--mi-dur-2) var(--mi-spring);
}
.mcs__chip:active { transform: scale(.96); }
.mcs__chip[aria-current="true"] { color: var(--mi-p-on); background: var(--mi-p); }
.mcs__chip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.mcs__n { font-size: 11px; font-weight: 500; opacity: .7; font-variant-numeric: tabular-nums; }

.mcs__section { display: grid; gap: 4px; padding: 18px 14px 6px; }
.mcs__items { display: grid; margin: 0; padding: 0; list-style: none; }
.mcs__item { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
.mcs__item + .mcs__item { box-shadow: inset 0 1px 0 var(--mi-sep); }
.mcs__plate { width: 56px; height: 56px; flex: none; border-radius: 50%; background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--a) 55%, var(--mi-card)) 0 30%, var(--a) 31% 46%, var(--mi-fill3) 47%); }
.mcs__text { display: grid; gap: 2px; flex: 1; min-width: 0; }
.mcs__end { margin: 0; padding: 16px 14px 28px; font-size: 13px; color: var(--mi-label3); text-align: center; }

@container (min-width: 720px) {
  .mcs__pane { height: 480px; }
  .mcs__strip { padding: 12px 20px; }
  .mcs__section { padding: 22px 24px 6px; }
  .mcs__items { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
  .mcs__item + .mcs__item { box-shadow: none; }
  .mcs__item { box-shadow: inset 0 1px 0 var(--mi-sep); }
}
</style>
