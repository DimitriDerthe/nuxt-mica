<template>
  <section class="olj mi:@container mi:font-mi mi:text-label" aria-labelledby="olj-title">
    <div class="olj__in mi:grid mi:gap-4 mi:@[820px]:grid-cols-[300px_minmax(0,_1fr)] mi:@[820px]:items-start">
    <form class="olj__lookup mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" novalidate @submit.prevent="lookup">
      <div class="olj__lookup-head mi:grid mi:gap-1">
        <MiText id="olj-title" as="h2" variant="title3" weight="bold">Track an order</MiText>
        <MiText variant="footnote" tone="label2">No account needed. Use the number from your confirmation email.</MiText>
      </div>
      <MiField label="Order number" :error="errors.number" hint="Starts with FH-, e.g. FH-20418">
        <template #default="{ id, describedBy }">
          <MiInput :id="id" v-model="number" :aria-describedby="describedBy" autocomplete="off" @update:model-value="errors.number = ''" />
        </template>
      </MiField>
      <MiField label="Email or postcode" :error="errors.contact">
        <template #default="{ id, describedBy }">
          <MiInput :id="id" v-model="contact" :aria-describedby="describedBy" @update:model-value="errors.contact = ''" />
        </template>
      </MiField>
      <MiButton type="submit" block :loading="busy">Find my order</MiButton>
      <MiText variant="caption" tone="label3">Try FH-20418 or FH-19977 with postcode 69002.</MiText>
    </form>

    <div class="olj__result" aria-live="polite">
      <article v-if="order" :key="order.id" class="olj__order mi:grid mi:gap-5.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <header class="olj__order-head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
          <div>
            <MiText variant="caption" tone="label2" weight="medium">Order {{ order.id }} · {{ order.placed }}</MiText>
            <MiText as="h3" variant="title2" weight="bold" class="olj__eta">{{ order.headline }}</MiText>
          </div>
          <MiBadge :tone="order.stage === 3 ? 'success' : 'primary'" :label="order.status" dot />
        </header>

        <!-- The journey: four stops on a rail, the fill is a scaled bar. -->
        <ol class="olj__rail mi:relative mi:grid mi:gap-4.5 mi:m-0 mi:pt-0 mi:pr-0 mi:pb-0 mi:pl-7 mi:[list-style:none] mi:before:content-[''] mi:before:absolute mi:before:left-[7px] mi:before:top-2 mi:before:bottom-2 mi:before:w-0.5 mi:before:rounded-[1px] mi:before:[background:var(--mi-fill3)] mi:after:content-[''] mi:after:absolute mi:after:left-[7px] mi:after:top-2 mi:after:bottom-2 mi:after:w-0.5 mi:after:rounded-[1px] mi:after:origin-top mi:after:transform-[scaleY(var(--olj-fill))] mi:after:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:@[560px]:grid-cols-4 mi:@[560px]:gap-2.5 mi:@[560px]:pt-7 mi:@[560px]:px-0 mi:@[560px]:pb-0 mi:@[560px]:before:left-2 mi:@[560px]:before:right-[calc(25%_-_16px)] mi:@[560px]:before:top-[7px] mi:@[560px]:before:bottom-auto mi:@[560px]:before:w-auto mi:@[560px]:before:h-0.5 mi:@[560px]:after:left-2 mi:@[560px]:after:right-[calc(25%_-_16px)] mi:@[560px]:after:top-[7px] mi:@[560px]:after:bottom-auto mi:@[560px]:after:w-auto mi:@[560px]:after:h-0.5 mi:@[560px]:after:origin-left mi:@[560px]:after:transform-[scaleX(var(--olj-fill))]" :style="{ '--olj-fill': order.stage / 3 }" aria-label="Delivery progress">
          <li class="mi:[.olj__rail_li&]:relative mi:[.olj__rail_li&]:gap-px" v-for="(stop, i) in order.stops" :key="stop.label" :class="{ 'is-done': i <= order.stage, 'is-now': i === order.stage }">
            <span class="olj__dot mi:absolute mi:-left-7 mi:top-0.5 mi:z-1 mi:w-4 mi:h-4 mi:box-border mi:rounded-[50%] mi:[background:var(--mi-card)] mi:border-2 mi:border-fill mi:[.olj__rail_li.is-done_&]:border-p mi:[.olj__rail_li.is-done_&]:[background:var(--mi-p)] mi:[.olj__rail_li.is-done_&]:shadow-[inset_0_0_0_3px_var(--mi-card)] mi:[.olj__rail_li.is-now_&]:shadow-[inset_0_0_0_3px_var(--mi-card),_0_0_0_5px_var(--mi-p-tint)] mi:@[560px]:left-0 mi:@[560px]:-top-7" aria-hidden="true" />
            <MiText class="mi:[.olj__rail_li&]:relative mi:[.olj__rail_li&]:gap-px" as="span" variant="footnote" weight="semibold">{{ stop.label }}</MiText>
            <MiText class="mi:[.olj__rail_li&]:relative mi:[.olj__rail_li&]:gap-px" as="span" variant="caption2" tone="label2">{{ stop.when }}</MiText>
            <span v-if="i === order.stage" class="olj__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">(current step)</span>
          </li>
        </ol>

        <div class="olj__body mi:grid mi:gap-4.5 mi:@[1000px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.1fr)]">
          <ul class="olj__items mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Items">
            <li v-for="item in order.items" :key="item.name" class="olj__item mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
              <span class="olj__thumb mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:rounded-[14px] mi:[background:var(--mi-fill4)]" :class="'olj__thumb--' + item.glaze" aria-hidden="true"><span class="mi:[.olj__thumb_&]:w-8.5 mi:[.olj__thumb_&]:h-5.5 mi:[.olj__thumb_&]:rounded-[4px_4px_17px_17px] mi:[.olj__thumb_&]:shadow-[inset_0_3px_0_color-mix(in_srgb,_var(--mi-label)_12%,_transparent)]" /></span>
              <div class="olj__item-text mi:grid mi:min-w-0">
                <MiText variant="subheadline" weight="semibold" :lines="1">{{ item.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ item.variant }} · Qty {{ item.qty }}</MiText>
              </div>
              <MiText variant="subheadline" weight="medium" tabular>{{ item.price }}</MiText>
            </li>
          </ul>
          <MiDetails :items="order.details" label-width="112px" class="olj__details" />
        </div>

        <footer class="olj__claim mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:py-3.5 mi:px-4 mi:rounded-lg mi:[background:var(--mi-p-tint)]">
          <div>
            <MiText variant="subheadline" weight="semibold">Keep every order in one place</MiText>
            <MiText variant="caption" tone="label2">Create a password and we'll attach this order to a new account.</MiText>
          </div>
          <MiButton variant="tinted" size="small">Save to an account</MiButton>
        </footer>
      </article>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, shallowRef, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

interface Order {
  id: string, placed: string, headline: string, status: string, stage: number, postcode: string
  stops: { label: string, when: string }[]
  items: { name: string, variant: string, qty: number, price: string, glaze: 'celadon' | 'ash' | 'rust' }[]
  details: { key: string, label: string, value: string }[]
}

const orders: Record<string, Order> = {
  'FH-20418': {
    id: 'FH-20418', placed: 'placed 9 Nov', headline: 'Arriving Thursday, 14 Nov', status: 'In transit', stage: 2, postcode: '69002',
    stops: [{ label: 'Packed', when: 'Mon 11 Nov' }, { label: 'Left the studio', when: 'Tue 12 Nov' }, { label: 'Lyon hub', when: 'Wed 13 Nov, 06:40' }, { label: 'Delivered', when: 'Expected Thu' }],
    items: [
      { name: 'Tidal serving bowl', variant: 'Celadon, 28 cm', qty: 1, price: '€86.00', glaze: 'celadon' },
      { name: 'Ember espresso cups', variant: 'Set of 4, rust', qty: 1, price: '€54.00', glaze: 'rust' }
    ],
    details: [
      { key: 'carrier', label: 'Carrier', value: 'Colissimo, signature on delivery' },
      { key: 'track', label: 'Tracking', value: '6A 2984 1170 3FR' },
      { key: 'ship', label: 'Ship to', value: 'C. Moreau, 14 rue Mercière, 69002 Lyon' },
      { key: 'total', label: 'Total paid', value: '€148.90 incl. shipping' }
    ]
  },
  'FH-19977': {
    id: 'FH-19977', placed: 'placed 28 Oct', headline: 'Delivered Saturday, 2 Nov', status: 'Delivered', stage: 3, postcode: '69002',
    stops: [{ label: 'Packed', when: 'Tue 29 Oct' }, { label: 'Left the studio', when: 'Wed 30 Oct' }, { label: 'Lyon hub', when: 'Fri 1 Nov' }, { label: 'Delivered', when: 'Sat 2 Nov, 11:12' }],
    items: [{ name: 'Ash dinner plates', variant: 'Set of 6, speckled', qty: 1, price: '€132.00', glaze: 'ash' }],
    details: [
      { key: 'carrier', label: 'Carrier', value: 'Colissimo' },
      { key: 'track', label: 'Tracking', value: '6A 2971 0042 8FR' },
      { key: 'ship', label: 'Ship to', value: 'C. Moreau, 14 rue Mercière, 69002 Lyon' },
      { key: 'total', label: 'Total paid', value: '€140.90 incl. shipping' }
    ]
  }
}

const number = ref('FH-20418')
const contact = ref('69002')
const busy = ref(false)
const errors = reactive({ number: '', contact: '' })
const order = shallowRef<Order | null>(orders['FH-20418'] ?? null)

function lookup() {
  const id = number.value.trim().toUpperCase()
  errors.number = /^FH-\d{5}$/.test(id) ? '' : 'Use the format FH- followed by five digits.'
  errors.contact = contact.value.trim() ? '' : 'Add the email or postcode used at checkout.'
  if (errors.number || errors.contact) return
  busy.value = true
  later(() => {
    busy.value = false
    const found = orders[id]
    const c = contact.value.trim().toLowerCase()
    if (!found || (c !== found.postcode && !c.includes('@'))) {
      errors.number = "We couldn't match that order with these details."
      return
    }
    order.value = found
  }, 600)
}
</script>

<style scoped>
.olj__order { animation: olj-in var(--mi-dur-4) var(--mi-spring); }
@keyframes olj-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .olj__order { animation: none; } }
.olj__eta { margin-top: 2px; letter-spacing: -.02em; }
.olj__rail::after { background: var(--mi-fill3); }
.olj__rail::after { background: linear-gradient(var(--mi-p), var(--mi-s)); }
.olj__rail li { display: grid; }
.olj__rail li:not(.is-done) { color: var(--mi-label2); }
.olj__thumb--celadon span { background: linear-gradient(160deg, color-mix(in srgb, var(--mi-teal) 70%, var(--mi-card)), var(--mi-mint)); }
.olj__thumb--rust span { background: linear-gradient(160deg, var(--mi-orange), color-mix(in srgb, var(--mi-red) 70%, var(--mi-label))); }
.olj__thumb--ash span { background: radial-gradient(circle at 30% 40%, var(--mi-label3) 1px, transparent 2px) 0 0 / 6px 6px, var(--mi-fill); }
.olj__details { min-width: 0; }
</style>
