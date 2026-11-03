<template>
  <div class="mi:@container mi:grid mi:grid-rows-[auto_1fr] mi:min-h-full mi:font-mi mi:text-label mi:bg-page">
    <header class="mi:bg-card mi:shadow-[inset_0_-1px_0_var(--mi-sep)]">
      <div class="mi:grid mi:grid-cols-[1fr_auto_1fr] mi:items-center mi:gap-2 mi:min-h-13 mi:py-1.5 mi:px-3.5 mi:@[860px]:py-2 mi:@[860px]:px-6 mi:@[860px]:min-h-15">
        <a href="#" class="mi:inline-flex mi:items-center mi:gap-1 mi:justify-self-start mi:text-[14px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:rounded-[6px] mi:hover:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
          <MiIcon name="chevron-left" :size="16" /><span class="mi:hidden mi:@[520px]:inline">Back to shop</span>
        </a>
        <span class="mi:text-[17px] mi:font-bold mi:tracking-[-.02em] mi:whitespace-nowrap">Kiln &amp; Clay</span>
        <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:justify-self-end mi:text-[12px] mi:font-semibold mi:text-green-t"><MiIcon name="lock" :size="14" /><span class="mi:hidden mi:@[520px]:inline">Secure checkout</span></span>
      </div>

      <!-- Steps as a trail: done steps link back, later ones are plain text. -->
      <nav aria-label="Checkout steps">
        <ol class="mi:flex mi:justify-center mi:gap-1 mi:m-0 mi:text-[13px] mi:flex-wrap mi:pt-0 mi:px-3.5 mi:pb-3 mi:[list-style:none]">
          <li v-for="(s, i) in steps" :key="s" class="mi:inline-flex mi:items-center mi:gap-1" :class="i === step ? 'mi:font-semibold mi:text-label' : 'mi:text-label3'">
            <a class="mi:text-p-text mi:font-medium mi:[text-decoration:none] mi:rounded-[4px] mi:hover:[text-decoration:underline] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" v-if="i < step" href="#" @click.prevent="step = i">{{ s }}</a>
            <span v-else :aria-current="i === step ? 'step' : undefined">{{ s }}</span>
            <MiIcon v-if="i < steps.length - 1" name="chevron-right" :size="12" class="mi:text-label3" />
          </li>
        </ol>
      </nav>

      <!-- Narrow: the order summary folds under the header behind its total. -->
      <button type="button" class="mi:[font:inherit] mi:text-[14px] mi:font-medium mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:flex mi:items-center mi:gap-2 mi:w-full mi:py-3 mi:px-3.5 mi:[border:0] mi:text-p-text mi:bg-fill4 mi:shadow-[inset_0_1px_0_var(--mi-sep)] mi:cursor-pointer mi:@[860px]:hidden" :aria-expanded="summary" aria-controls="cfh-summary" @click="summary = !summary">
        <MiIcon name="list-bullet" :size="16" />
        <span>{{ summary ? 'Hide' : 'Show' }} order summary</span>
        <MiIcon name="chevron-down" :size="14" class="mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="summary ? 'mi:transform-[rotate(180deg)]' : ''" />
        <b class="mi:ms-auto mi:text-[16px] mi:text-label mi:tabular-nums" aria-live="polite">{{ money(total) }}</b>
      </button>
    </header>

    <div class="mi:grid mi:content-start mi:@[860px]:grid-cols-[minmax(0,_1fr)_340px]">
      <section id="cfh-summary" class="mi:gap-3 mi:py-4 mi:px-3.5 mi:bg-fill4 mi:shadow-[inset_0_-1px_0_var(--mi-sep)] mi:@[860px]:grid mi:@[860px]:content-start mi:@[860px]:col-[2] mi:@[860px]:row-[1] mi:@[860px]:min-h-full mi:@[860px]:py-7 mi:@[860px]:px-6 mi:@[860px]:shadow-[inset_1px_0_0_var(--mi-sep)] mi:@[860px]:animate-none" :class="summary ? 'mi:grid mi:[--mi-in-y:-6px] mi:animate-[in_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:animate-none' : 'mi:hidden'" aria-labelledby="cfh-sum-title">
        <MiText id="cfh-sum-title" variant="headline" as="h3">Your order</MiText>
        <ul class="mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="it in items" :key="it.name" class="mi:flex mi:items-center mi:gap-3">
            <span class="mi:relative mi:w-11 mi:h-11 mi:flex-[none] mi:rounded-[12px] mi:shadow-[inset_0_-10px_18px_color-mix(in_srgb,_var(--mi-label)_18%,_transparent)]" :style="{ background: `var(--mi-${it.glaze})` }" aria-hidden="true"><i class="mi:grid mi:place-items-center mi:text-[11px] mi:text-card mi:absolute mi:-top-1.5 mi:-right-1.5 mi:min-w-5 mi:h-5 mi:rounded-[10px] mi:not-italic mi:font-bold mi:bg-label2">{{ it.qty }}</i></span>
            <span class="mi:grid mi:flex-1 mi:min-w-0"><MiText as="span" variant="footnote" weight="semibold">{{ it.name }}</MiText><MiText as="span" variant="caption" tone="label2">{{ it.detail }}</MiText></span>
            <MiText as="span" variant="footnote" tabular>{{ money(it.price * it.qty) }}</MiText>
          </li>
        </ul>
        <dl class="mi:grid mi:gap-1.5 mi:m-0 mi:pt-3 mi:shadow-[inset_0_1px_0_var(--mi-sep)] mi:text-[14px]">
          <div class="mi:flex mi:justify-between mi:gap-3"><dt class="mi:text-label2">Subtotal</dt><dd class="mi:m-0 mi:tabular-nums">{{ money(subtotal) }}</dd></div>
          <div class="mi:flex mi:justify-between mi:gap-3"><dt class="mi:text-label2">Shipping</dt><dd class="mi:m-0 mi:tabular-nums">{{ shippingCost ? money(shippingCost) : 'Free' }}</dd></div>
          <div class="mi:flex mi:justify-between mi:gap-3 mi:pt-1.5 mi:text-[17px] mi:font-bold"><dt class="mi:text-label">Total</dt><dd class="mi:m-0 mi:tabular-nums">{{ money(total) }}</dd></div>
        </dl>
      </section>

      <main class="mi:grid mi:content-start mi:gap-2.5 mi:w-full mi:max-w-140 mi:my-0 mi:mx-auto mi:pt-6 mi:px-3.5 mi:pb-9 mi:@[860px]:col-[1] mi:@[860px]:row-[1] mi:@[860px]:py-9 mi:@[860px]:px-7" aria-labelledby="cfh-title">
        <template v-if="step === 2">
          <MiText id="cfh-title" variant="title2" as="h2" weight="bold">How should it travel?</MiText>
          <MiText variant="callout" tone="label2">Every piece is wrapped by hand. The total in the header follows your pick.</MiText>
          <MiRadioGroup v-model="shipping" :options="shippingOptions" label="Shipping method" class="mi:mt-2" />
        </template>
        <template v-else>
          <MiText id="cfh-title" variant="title2" as="h2" weight="bold">{{ steps[step] }}</MiText>
          <MiText variant="callout" tone="label2">{{ notes[step] }}</MiText>
        </template>
        <div class="mi:flex mi:justify-between mi:gap-2.5 mi:pt-4">
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
