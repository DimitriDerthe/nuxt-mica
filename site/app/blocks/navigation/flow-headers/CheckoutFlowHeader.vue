<template>
  <div class="cfh mi:@container mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:bg-page">
    <header class="cfh__header mi:bg-card mi:shadow-[inset_0_-1px_0_var(--mi-sep)]">
      <div class="cfh__bar mi:grid mi:grid-cols-[1fr_auto_1fr] mi:items-center mi:gap-2 mi:min-h-13 mi:py-1.5 mi:px-3.5 mi:@[860px]:py-2 mi:@[860px]:px-6 mi:@[860px]:min-h-15">
        <a href="#" class="cfh__back mi:inline-flex mi:items-center mi:gap-1 mi:justify-self-start mi:text-[14px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:rounded-[6px] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
          <MiIcon name="chevron-left" :size="16" /><span class="cfh__back-text mi:hidden mi:@[520px]:inline">Back to shop</span>
        </a>
        <span class="cfh__brand mi:text-[17px] mi:font-bold mi:tracking-[-.02em] mi:whitespace-nowrap">Kiln &amp; Clay</span>
        <span class="cfh__secure mi:inline-flex mi:items-center mi:gap-1.5 mi:justify-self-end mi:text-[12px] mi:font-semibold mi:text-green-t"><MiIcon name="lock" :size="14" /><span class="cfh__secure-text mi:hidden mi:@[520px]:inline">Secure checkout</span></span>
      </div>

      <!-- Steps as a trail: done steps link back, later ones are plain text. -->
      <nav class="cfh__trail" aria-label="Checkout steps">
        <ol class="mi:[.cfh__trail_ol&]:flex-wrap mi:[.cfh__trail_ol&]:pt-0 mi:[.cfh__trail_ol&]:px-3.5 mi:[.cfh__trail_ol&]:pb-3 mi:[.cfh__trail_ol&]:[list-style:none]">
          <li v-for="(s, i) in steps" :key="s" :class="{ 'is-done': i < step, 'is-now mi:[.cfh__trail_&]:font-semibold': i === step }">
            <a class="mi:[.cfh__trail_li.is-done_a&]:text-p-text mi:[.cfh__trail_li.is-done_a&]:font-medium mi:[.cfh__trail_li.is-done_a&]:[text-decoration:none] mi:[.cfh__trail_li.is-done_a&]:rounded-[4px] mi:[.cfh__trail_li.is-done_a&:hover]:[text-decoration:underline] mi:[.cfh__trail_a&:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:[.cfh__trail_a&:focus-visible]:outline-offset-[2px]" v-if="i < step" href="#" @click.prevent="step = i">{{ s }}</a>
            <span v-else :aria-current="i === step ? 'step' : undefined">{{ s }}</span>
            <MiIcon v-if="i < steps.length - 1" name="chevron-right" :size="12" class="cfh__sep mi:[.cfh__trail_ol&]:flex-wrap mi:[.cfh__trail_ol&]:pt-0 mi:[.cfh__trail_ol&]:px-3.5 mi:[.cfh__trail_ol&]:pb-3 mi:[.cfh__trail_ol&]:[list-style:none] mi:[.cfh__trail_li.is-done_a&]:text-p-text mi:[.cfh__trail_li.is-done_a&]:font-medium mi:[.cfh__trail_li.is-done_a&]:[text-decoration:none] mi:[.cfh__trail_li.is-done_a&]:rounded-[4px] mi:[.cfh__trail_li.is-done_a&:hover]:[text-decoration:underline] mi:text-label3 mi:[.cfh__trail_a&:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:[.cfh__trail_a&:focus-visible]:outline-offset-[2px]" />
          </li>
        </ol>
      </nav>

      <!-- Narrow: the order summary folds under the header behind its total. -->
      <button type="button" class="cfh__toggle mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2 mi:w-full mi:py-3 mi:px-3.5 mi:[border:0] mi:text-p-text mi:bg-fill4 mi:shadow-[inset_0_1px_0_var(--mi-sep)] mi:cursor-pointer mi:@[860px]:hidden" :aria-expanded="summary" aria-controls="cfh-summary" @click="summary = !summary">
        <MiIcon name="list-bullet" :size="16" />
        <span>{{ summary ? 'Hide' : 'Show' }} order summary</span>
        <MiIcon name="chevron-down" :size="14" class="cfh__chev mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
        <b class="cfh__total mi:ms-auto mi:text-[16px] mi:text-label mi:tabular-nums" aria-live="polite">{{ money(total) }}</b>
      </button>
    </header>

    <div class="cfh__body mi:grid mi:content-start mi:@[860px]:grid-cols-[minmax(0,_1fr)_340px]">
      <section id="cfh-summary" class="cfh__summary mi:hidden mi:gap-3 mi:py-4 mi:px-3.5 mi:bg-fill4 mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:[&.is-open]:grid mi:@[860px]:grid mi:@[860px]:content-start mi:@[860px]:col-[2] mi:@[860px]:row-[1] mi:@[860px]:min-h-full mi:@[860px]:py-7 mi:@[860px]:px-6 mi:@[860px]:shadow-[inset_1px_0_0_var(--mi-sep)] mi:@[860px]:animate-none mi:@[860px]:[&.is-open]:grid mi:@[860px]:[&.is-open]:content-start mi:@[860px]:[&.is-open]:col-[2] mi:@[860px]:[&.is-open]:row-[1] mi:@[860px]:[&.is-open]:min-h-full mi:@[860px]:[&.is-open]:py-7 mi:@[860px]:[&.is-open]:px-6 mi:@[860px]:[&.is-open]:shadow-[inset_1px_0_0_var(--mi-sep)]" :class="{ 'is-open': summary }" aria-labelledby="cfh-sum-title">
        <MiText id="cfh-sum-title" variant="headline" as="h3">Your order</MiText>
        <ul class="cfh__items mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="it in items" :key="it.name" class="cfh__item mi:flex mi:items-center mi:gap-3">
            <span class="cfh__swatch mi:relative mi:w-11 mi:h-11 mi:flex-[none] mi:rounded-[12px] mi:shadow-[inset_0_-10px_18px_color-mix(in_srgb,_var(--mi-label)_18%,_transparent)]" :style="{ background: `var(--mi-${it.glaze})` }" aria-hidden="true"><i class="mi:[.cfh__swatch_&]:absolute mi:[.cfh__swatch_&]:-top-1.5 mi:[.cfh__swatch_&]:-right-1.5 mi:[.cfh__swatch_&]:min-w-5 mi:[.cfh__swatch_&]:h-5 mi:[.cfh__swatch_&]:rounded-[10px] mi:[.cfh__swatch_&]:not-italic mi:[.cfh__swatch_&]:font-bold mi:[.cfh__swatch_&]:bg-label2">{{ it.qty }}</i></span>
            <span class="cfh__item-name mi:grid mi:flex-1 mi:min-w-0"><MiText as="span" variant="footnote" weight="semibold">{{ it.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ it.detail }}</MiText></span>
            <MiText as="span" variant="footnote" tabular>{{ money(it.price * it.qty) }}</MiText>
          </li>
        </ul>
        <dl class="cfh__sums mi:grid mi:gap-1.5 mi:m-0 mi:pt-3 mi:shadow-[inset_0_1px_0_var(--mi-sep)] mi:text-[14px]">
          <div><dt>Subtotal</dt><dd class="mi:[.cfh__sums_&]:tabular-nums">{{ money(subtotal) }}</dd></div>
          <div><dt>Shipping</dt><dd class="mi:[.cfh__sums_&]:tabular-nums">{{ shippingCost ? money(shippingCost) : 'Free' }}</dd></div>
          <div class="is-total mi:[.cfh__sums_&]:pt-1.5 mi:[.cfh__sums_&]:text-[17px] mi:[.cfh__sums_&]:font-bold"><dt class="mi:[.cfh__sums_.is-total_&]:text-label">Total</dt><dd class="mi:[.cfh__sums_&]:tabular-nums">{{ money(total) }}</dd></div>
        </dl>
      </section>

      <main class="cfh__main mi:grid mi:content-start mi:gap-2.5 mi:w-full mi:max-w-140 mi:my-0 mi:mx-auto mi:pt-6 mi:px-3.5 mi:pb-9 mi:@[860px]:col-[1] mi:@[860px]:row-[1] mi:@[860px]:py-9 mi:@[860px]:px-7" aria-labelledby="cfh-title">
        <template v-if="step === 2">
          <MiText id="cfh-title" variant="title2" as="h2" weight="bold">How should it travel?</MiText>
          <MiText variant="callout" tone="label2">Every piece is wrapped by hand. The total in the header follows your pick.</MiText>
          <MiRadioGroup v-model="shipping" :options="shippingOptions" label="Shipping method" class="cfh__radios mi:mt-2" />
        </template>
        <template v-else>
          <MiText id="cfh-title" variant="title2" as="h2" weight="bold">{{ steps[step] }}</MiText>
          <MiText variant="callout" tone="label2">{{ notes[step] }}</MiText>
        </template>
        <div class="cfh__nav mi:flex mi:justify-between mi:gap-2.5 mi:pt-4">
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
.cfh__trail ol { display: flex; justify-content: center; gap: 4px; margin: 0; font-size: 13px; }
.cfh__trail li { display: inline-flex; align-items: center; gap: 4px; color: var(--mi-label3); }
.cfh__trail li.is-now { color: var(--mi-label); }

.cfh__toggle { font: inherit; font-size: 14px; font-weight: 500;
}
.cfh__toggle[aria-expanded="true"] .cfh__chev { transform: rotate(180deg); }
.cfh__summary.is-open { animation: cfh-in var(--mi-dur-3) var(--mi-spring); }
@keyframes cfh-in { from { opacity: 0; transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .cfh__summary.is-open { animation: none; } }
.cfh__swatch i { display: grid; place-items: center; font-size: 11px; color: var(--mi-card); }
.cfh__sums div { display: flex; justify-content: space-between; gap: 12px; }
.cfh__sums dt { color: var(--mi-label2); }
.cfh__sums dd { margin: 0; }
@container (min-width: 860px) {
  .cfh__summary.is-open { animation: none; }
}
</style>
