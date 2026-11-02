<template>
  <section class="olj" aria-labelledby="olj-title">
    <div class="olj__in">
    <form class="olj__lookup" novalidate @submit.prevent="lookup">
      <div class="olj__lookup-head">
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
      <article v-if="order" :key="order.id" class="olj__order">
        <header class="olj__order-head">
          <div>
            <MiText variant="caption" tone="label2" weight="medium">Order {{ order.id }} · {{ order.placed }}</MiText>
            <MiText as="h3" variant="title2" weight="bold" class="olj__eta">{{ order.headline }}</MiText>
          </div>
          <MiBadge :tone="order.stage === 3 ? 'success' : 'primary'" :label="order.status" dot />
        </header>

        <!-- The journey: four stops on a rail, the fill is a scaled bar. -->
        <ol class="olj__rail" :style="{ '--olj-fill': order.stage / 3 }" aria-label="Delivery progress">
          <li v-for="(stop, i) in order.stops" :key="stop.label" :class="{ 'is-done': i <= order.stage, 'is-now': i === order.stage }">
            <span class="olj__dot" aria-hidden="true" />
            <MiText as="span" variant="footnote" weight="semibold">{{ stop.label }}</MiText>
            <MiText as="span" variant="caption2" tone="label2">{{ stop.when }}</MiText>
            <span v-if="i === order.stage" class="olj__sr">(current step)</span>
          </li>
        </ol>

        <div class="olj__body">
          <ul class="olj__items" aria-label="Items">
            <li v-for="item in order.items" :key="item.name" class="olj__item">
              <span class="olj__thumb" :class="'olj__thumb--' + item.glaze" aria-hidden="true"><span /></span>
              <div class="olj__item-text">
                <MiText variant="subheadline" weight="semibold" :lines="1">{{ item.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ item.variant }} · Qty {{ item.qty }}</MiText>
              </div>
              <MiText variant="subheadline" weight="medium" tabular>{{ item.price }}</MiText>
            </li>
          </ul>
          <MiDetails :items="order.details" label-width="112px" class="olj__details" />
        </div>

        <footer class="olj__claim">
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
import { reactive, ref, shallowRef } from 'vue'

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
  setTimeout(() => {
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
.olj { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.olj__in { display: grid; gap: 16px; }
@container (min-width: 820px) { .olj__in { grid-template-columns: 300px minmax(0, 1fr); align-items: start; } }

.olj__lookup { display: grid; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.olj__lookup-head { display: grid; gap: 4px; }

.olj__order { display: grid; gap: 22px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); animation: olj-in var(--mi-dur-4) var(--mi-spring); }
@keyframes olj-in { from { opacity: 0; transform: translateY(8px); } }
@media (prefers-reduced-motion: reduce) { .olj__order { animation: none; } }
.olj__order-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; }
.olj__eta { margin-top: 2px; letter-spacing: -.02em; }

/* Rail: vertical on narrow widths, horizontal once there is room. */
.olj__rail { position: relative; display: grid; gap: 18px; margin: 0; padding: 0 0 0 28px; list-style: none; }
.olj__rail::before, .olj__rail::after { content: ""; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; border-radius: 1px; background: var(--mi-fill3); }
.olj__rail::after { background: linear-gradient(var(--mi-p), var(--mi-s)); transform-origin: top; transform: scaleY(var(--olj-fill)); transition: transform var(--mi-dur-4) var(--mi-spring); }
.olj__rail li { position: relative; display: grid; gap: 1px; }
.olj__dot { position: absolute; left: -28px; top: 2px; z-index: 1; width: 16px; height: 16px; box-sizing: border-box; border-radius: 50%; background: var(--mi-card); border: 2px solid var(--mi-fill); }
.olj__rail li.is-done .olj__dot { border-color: var(--mi-p); background: var(--mi-p); box-shadow: inset 0 0 0 3px var(--mi-card); }
.olj__rail li.is-now .olj__dot { box-shadow: inset 0 0 0 3px var(--mi-card), 0 0 0 5px var(--mi-p-tint); }
.olj__rail li:not(.is-done) { color: var(--mi-label2); }
.olj__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@container (min-width: 560px) {
  .olj__rail { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; padding: 28px 0 0; }
  .olj__rail::before, .olj__rail::after { left: 8px; right: calc(25% - 16px); top: 7px; bottom: auto; width: auto; height: 2px; }
  .olj__rail::after { transform-origin: left; transform: scaleX(var(--olj-fill)); }
  .olj__dot { left: 0; top: -28px; }
}

.olj__body { display: grid; gap: 18px; }
@container (min-width: 1000px) { .olj__body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); } }
.olj__items { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.olj__item { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.olj__item-text { display: grid; min-width: 0; }
/* Product thumbnails: glazes painted with token gradients. */
.olj__thumb { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; background: var(--mi-fill4); }
.olj__thumb span { width: 34px; height: 22px; border-radius: 4px 4px 17px 17px; box-shadow: inset 0 3px 0 color-mix(in srgb, var(--mi-label) 12%, transparent); }
.olj__thumb--celadon span { background: linear-gradient(160deg, color-mix(in srgb, var(--mi-teal) 70%, var(--mi-card)), var(--mi-mint)); }
.olj__thumb--rust span { background: linear-gradient(160deg, var(--mi-orange), color-mix(in srgb, var(--mi-red) 70%, var(--mi-label))); }
.olj__thumb--ash span { background: radial-gradient(circle at 30% 40%, var(--mi-label3) 1px, transparent 2px) 0 0 / 6px 6px, var(--mi-fill); }
.olj__details { min-width: 0; }

.olj__claim { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); }
</style>
