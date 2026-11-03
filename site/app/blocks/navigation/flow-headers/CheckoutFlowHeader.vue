<template>
  <div class="cfh">
    <header class="cfh__header">
      <div class="cfh__bar">
        <a href="#" class="cfh__back" @click.prevent>
          <MiIcon name="chevron-left" :size="16" /><span class="cfh__back-text">Back to shop</span>
        </a>
        <span class="cfh__brand">Kiln &amp; Clay</span>
        <span class="cfh__secure"><MiIcon name="lock" :size="14" /><span class="cfh__secure-text">Secure checkout</span></span>
      </div>

      <!-- Steps as a trail: done steps link back, later ones are plain text. -->
      <nav class="cfh__trail" aria-label="Checkout steps">
        <ol>
          <li v-for="(s, i) in steps" :key="s" :class="{ 'is-done': i < step, 'is-now': i === step }">
            <a v-if="i < step" href="#" @click.prevent="step = i">{{ s }}</a>
            <span v-else :aria-current="i === step ? 'step' : undefined">{{ s }}</span>
            <MiIcon v-if="i < steps.length - 1" name="chevron-right" :size="12" class="cfh__sep" />
          </li>
        </ol>
      </nav>

      <!-- Narrow: the order summary folds under the header behind its total. -->
      <button type="button" class="cfh__toggle" :aria-expanded="summary" aria-controls="cfh-summary" @click="summary = !summary">
        <MiIcon name="list-bullet" :size="16" />
        <span>{{ summary ? 'Hide' : 'Show' }} order summary</span>
        <MiIcon name="chevron-down" :size="14" class="cfh__chev" />
        <b class="cfh__total" aria-live="polite">{{ money(total) }}</b>
      </button>
    </header>

    <div class="cfh__body">
      <section id="cfh-summary" class="cfh__summary" :class="{ 'is-open': summary }" aria-labelledby="cfh-sum-title">
        <MiText id="cfh-sum-title" variant="headline" as="h3">Your order</MiText>
        <ul class="cfh__items">
          <li v-for="it in items" :key="it.name" class="cfh__item">
            <span class="cfh__swatch" :style="{ background: `var(--mi-${it.glaze})` }" aria-hidden="true"><i>{{ it.qty }}</i></span>
            <span class="cfh__item-name"><MiText as="span" variant="footnote" weight="semibold">{{ it.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ it.detail }}</MiText></span>
            <MiText as="span" variant="footnote" tabular>{{ money(it.price * it.qty) }}</MiText>
          </li>
        </ul>
        <dl class="cfh__sums">
          <div><dt>Subtotal</dt><dd>{{ money(subtotal) }}</dd></div>
          <div><dt>Shipping</dt><dd>{{ shippingCost ? money(shippingCost) : 'Free' }}</dd></div>
          <div class="is-total"><dt>Total</dt><dd>{{ money(total) }}</dd></div>
        </dl>
      </section>

      <main class="cfh__main" aria-labelledby="cfh-title">
        <template v-if="step === 2">
          <MiText id="cfh-title" variant="title2" as="h2" weight="bold">How should it travel?</MiText>
          <MiText variant="callout" tone="label2">Every piece is wrapped by hand. The total in the header follows your pick.</MiText>
          <MiRadioGroup v-model="shipping" :options="shippingOptions" label="Shipping method" class="cfh__radios" />
        </template>
        <template v-else>
          <MiText id="cfh-title" variant="title2" as="h2" weight="bold">{{ steps[step] }}</MiText>
          <MiText variant="callout" tone="label2">{{ notes[step] }}</MiText>
        </template>
        <div class="cfh__nav">
          <MiButton variant="gray" :disabled="step === 0" @click="step--">Back</MiButton>
          <MiButton :disabled="step === steps.length - 1" @click="step++">{{ step === steps.length - 2 ? 'Continue to payment' : 'Continue' }}</MiButton>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Glaze = 'teal' | 'orange' | 'indigo'
interface LineItem { name: string, detail: string, price: number, qty: number, glaze: Glaze }

const steps = ['Cart', 'Details', 'Shipping', 'Payment']
const notes = [
  'Three pieces in your cart, reserved for 20 minutes.',
  'Rosa Almeida · rosa.almeida@outlook.com · 14 Rua das Flores, Porto.',
  '',
  'Card details are collected by the payment provider on the next screen; nothing is stored here.'
]
const items: LineItem[] = [
  { name: 'Tidal mug', detail: 'Celadon glaze · 350 ml', price: 28, qty: 2, glaze: 'teal' },
  { name: 'Ember serving bowl', detail: 'Iron red · 24 cm', price: 54, qty: 1, glaze: 'orange' }
]
const rates: Record<string, number> = { standard: 0, express: 9.5, pickup: 0 }
const shippingOptions = [
  { value: 'standard', label: 'Standard · free', description: 'CTT, 4 to 6 working days' },
  { value: 'express', label: 'Express · €9.50', description: 'DPD, next working day before 18:00' },
  { value: 'pickup', label: 'Studio pickup · free', description: 'Porto, Tuesday to Saturday' }
]
const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })

const step = ref(2)
const summary = ref(false)
const shipping = ref<string | number | boolean | null>('express')

const subtotal = computed(() => items.reduce((s, it) => s + it.price * it.qty, 0))
const shippingCost = computed(() => rates[String(shipping.value)] ?? 0)
const total = computed(() => subtotal.value + shippingCost.value)

function money(n: number) { return fmt.format(n) }
</script>

<style scoped>
.cfh { container-type: inline-size; display: grid; grid-template-rows: auto 1fr; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.cfh__header { background: var(--mi-card); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.cfh__bar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px; min-height: 52px; padding: 6px 14px; }
.cfh__back { display: inline-flex; align-items: center; gap: 4px; justify-self: start; font-size: 14px; font-weight: 500; color: var(--mi-label2); text-decoration: none; border-radius: 6px; }
.cfh__back:hover { color: var(--mi-label); }
.cfh__back-text, .cfh__secure-text { display: none; }
.cfh__brand { font-size: 17px; font-weight: 700; letter-spacing: -.02em; white-space: nowrap; }
.cfh__secure { display: inline-flex; align-items: center; gap: 6px; justify-self: end; font-size: 12px; font-weight: 600; color: var(--mi-green-t); }

.cfh__trail ol { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px; margin: 0; padding: 0 14px 12px; list-style: none; font-size: 13px; }
.cfh__trail li { display: inline-flex; align-items: center; gap: 4px; color: var(--mi-label3); }
.cfh__trail li.is-done a { color: var(--mi-p-text); font-weight: 500; text-decoration: none; border-radius: 4px; }
.cfh__trail li.is-done a:hover { text-decoration: underline; }
.cfh__trail li.is-now { color: var(--mi-label); font-weight: 600; }
.cfh__sep { color: var(--mi-label3); }
.cfh__back:focus-visible, .cfh__trail a:focus-visible, .cfh__toggle:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.cfh__toggle {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 14px; border: 0; font: inherit; font-size: 14px; font-weight: 500;
  color: var(--mi-p-text); background: var(--mi-fill4); box-shadow: inset 0 1px 0 var(--mi-sep); cursor: pointer;
}
.cfh__chev { transition: transform var(--mi-dur-2) var(--mi-ease); }
.cfh__toggle[aria-expanded="true"] .cfh__chev { transform: rotate(180deg); }
.cfh__total { margin-inline-start: auto; font-size: 16px; color: var(--mi-label); font-variant-numeric: tabular-nums; }

.cfh__body { display: grid; align-content: start; }
.cfh__summary { display: none; gap: 12px; padding: 16px 14px; background: var(--mi-fill4); box-shadow: inset 0 -1px 0 var(--mi-sep); }
.cfh__summary.is-open { display: grid; animation: cfh-in var(--mi-dur-3) var(--mi-spring); }
@keyframes cfh-in { from { opacity: 0; transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .cfh__summary.is-open { animation: none; } }
.cfh__items { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.cfh__item { display: flex; align-items: center; gap: 12px; }
.cfh__swatch { position: relative; width: 44px; height: 44px; flex: none; border-radius: 12px; box-shadow: inset 0 -10px 18px color-mix(in srgb, var(--mi-label) 18%, transparent); }
.cfh__swatch i { position: absolute; top: -6px; right: -6px; display: grid; place-items: center; min-width: 20px; height: 20px; border-radius: 10px; font-size: 11px; font-style: normal; font-weight: 700; color: var(--mi-card); background: var(--mi-label2); }
.cfh__item-name { display: grid; flex: 1; min-width: 0; }
.cfh__sums { display: grid; gap: 6px; margin: 0; padding-top: 12px; box-shadow: inset 0 1px 0 var(--mi-sep); font-size: 14px; }
.cfh__sums div { display: flex; justify-content: space-between; gap: 12px; }
.cfh__sums dt { color: var(--mi-label2); }
.cfh__sums dd { margin: 0; font-variant-numeric: tabular-nums; }
.cfh__sums .is-total { padding-top: 6px; font-size: 17px; font-weight: 700; }
.cfh__sums .is-total dt { color: var(--mi-label); }

.cfh__main { display: grid; align-content: start; gap: 10px; width: 100%; max-width: 560px; margin: 0 auto; padding: 24px 14px 36px; }
.cfh__radios { margin-top: 8px; }
.cfh__nav { display: flex; justify-content: space-between; gap: 10px; padding-top: 16px; }

@container (min-width: 520px) { .cfh__back-text, .cfh__secure-text { display: inline; } }
@container (min-width: 860px) {
  .cfh__bar { padding: 8px 24px; min-height: 60px; }
  .cfh__toggle { display: none; }
  .cfh__body { grid-template-columns: minmax(0, 1fr) 340px; }
  .cfh__summary, .cfh__summary.is-open { display: grid; align-content: start; grid-column: 2; grid-row: 1; min-height: 100%; padding: 28px 24px; box-shadow: inset 1px 0 0 var(--mi-sep); animation: none; }
  .cfh__main { grid-column: 1; grid-row: 1; padding: 36px 28px; }
}
</style>
