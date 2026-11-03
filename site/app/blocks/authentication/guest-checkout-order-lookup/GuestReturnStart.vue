<template>
  <section class="grs mi:@container mi:grid mi:content-start mi:grid-cols-[minmax(0,_1fr)] mi:justify-items-center mi:font-mi mi:text-label" aria-labelledby="grs-title">
    <div class="grs__card mi:grid mi:gap-5 mi:w-full mi:max-w-140 mi:py-5.5 mi:px-4.5 mi:box-border mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:@[520px]:py-7 mi:@[520px]:px-7.5">
      <header class="grs__head mi:grid mi:gap-1">
        <MiText id="grs-title" as="h2" variant="title3" weight="bold">Return an order</MiText>
        <MiText variant="footnote" tone="label2">No account needed. Harbor &amp; Pine accepts returns within 30 days.</MiText>
      </header>

      <MiSteps v-model="step" :steps="steps" orientation="horizontal" :clickable="false" aria-label="Return progress" />

      <!-- Step 1: find the order with the email it was placed with. -->
      <form v-if="step === 0" class="grs__form mi:grid mi:gap-4" novalidate @submit.prevent="find">
        <MiField label="Email used at checkout" :error="tried && !emailOk ? 'Enter the email from your order confirmation.' : ''">
          <MiInput v-model="email" type="email" />
        </MiField>
        <MiField label="Order number" hint="Starts with HP-, printed on your packing slip." :error="notFound">
          <MiInput v-model="orderNo" />
        </MiField>
        <MiText variant="caption" tone="label3">Sample: lea.fontaine@mailbox.org · HP-48213</MiText>
        <MiButton type="submit" size="large" block>Find my order</MiButton>
      </form>

      <!-- Step 2: pick items, a reason for each, and how to be refunded. -->
      <div v-else-if="step === 1" class="grs__pick mi:grid mi:gap-4">
        <ul class="grs__items mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:border mi:border-sep mi:rounded-lg" aria-label="Items in order HP-48213">
          <li v-for="item in items" :key="item.id" class="grs__item mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:py-3 mi:px-3.5 mi:[.grs__item+&]:border-t mi:[.grs__item+&]:border-t-sep mi:[&.is-on]:[background:color-mix(in_srgb,_var(--mi-p)_5%,_transparent)] mi:@[520px]:grid-cols-[auto_minmax(0,_1fr)_auto]" :class="{ 'is-on': picked[item.id] }">
            <span class="grs__swatch mi:w-9 mi:h-11 mi:rounded-[8px] mi:[background:linear-gradient(160deg,_color-mix(in_srgb,_var(--grs-tone)_70%,_var(--mi-card)),_color-mix(in_srgb,_var(--grs-tone)_30%,_var(--mi-card)))] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" :style="{ '--grs-tone': item.tone }" aria-hidden="true" />
            <MiCheckbox
              v-model="picked[item.id]" :label="item.name" :description="item.variant + ' · ' + money(item.price)" :disabled="item.finalSale"
            />
            <MiBadge v-if="item.finalSale" tone="neutral" variant="outline" label="Final sale" class="grs__end" />
            <MiNativeSelect
              v-else-if="picked[item.id]" v-model="reasons[item.id]" size="sm" :options="reasonOptions" placeholder="Reason" class="grs__end"
              :aria-label="'Reason for returning ' + item.name"
            />
          </li>
        </ul>

        <MiRadioGroup v-model="method" label="Refund method" :options="methodOptions" />

        <div class="grs__total mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:pt-3 mi:border-t mi:border-t-sep" aria-live="polite">
          <MiText variant="subheadline" tone="label2">Refund</MiText>
          <MiText as="p" variant="title2" weight="bold" tabular>{{ money(refund) }}</MiText>
        </div>
        <div class="grs__actions mi:flex mi:[justify-content:flex-end] mi:gap-2">
          <MiButton variant="plain" @click="step = 0">Back</MiButton>
          <MiButton :disabled="!ready" @click="step = 2">Create return</MiButton>
        </div>
      </div>

      <!-- Step 3: a drop-off code instead of a label to print. -->
      <div v-else class="grs__done mi:grid mi:gap-4">
        <div class="grs__code mi:grid mi:justify-items-center mi:gap-2 mi:p-5 mi:rounded-lg mi:[background:repeating-linear-gradient(-45deg,_var(--mi-p-tint)_0_10px,_transparent_10px_20px),_var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" role="group" aria-labelledby="grs-code-label">
          <MiText id="grs-code-label" variant="caption" tone="label2" weight="medium">Show this code at any Relay point</MiText>
          <p class="grs__code-value mi:m-0 mi:text-[clamp(28px,_8cqi,_40px)] mi:font-extrabold mi:tracking-[.08em] mi:tabular-nums mi:text-p-text">{{ dropCode }}</p>
          <MiCopyButton :value="dropCode" label="Copy code" />
        </div>
        <MiDetails :items="summary" label-width="120px" />
        <MiButton variant="plain" @click="reset">Return another order</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Item { id: string, name: string, variant: string, price: number, tone: string, finalSale?: boolean }

const steps = [{ label: 'Find order' }, { label: 'Choose items' }, { label: 'Drop off' }]
const items: Item[] = [
  { id: 'shirt', name: 'Linen overshirt', variant: 'Sage · M', price: 68, tone: 'var(--mi-green)' },
  { id: 'mugs', name: 'Stoneware mug set', variant: 'Set of 4 · Sand', price: 42, tone: 'var(--mi-orange)' },
  { id: 'throw', name: 'Merino throw', variant: 'Charcoal', price: 129, tone: 'var(--mi-label2)', finalSale: true }
]
const reasonOptions = [
  { value: 'size', label: 'Wrong size' },
  { value: 'damaged', label: 'Arrived damaged' },
  { value: 'different', label: 'Not as pictured' },
  { value: 'changed', label: 'Changed my mind' }
]
const methodOptions = [
  { value: 'card', label: 'Original card', description: 'Visa •••• 4417 · 3 to 5 business days' },
  { value: 'credit', label: 'Store credit +10%', description: 'Instant, valid for 12 months' }
]

const step = ref(0)
const email = ref('')
const orderNo = ref('')
const tried = ref(false)
const notFound = ref('')
const picked = reactive<Record<string, boolean>>({})
const reasons = reactive<Record<string, string | number | null>>({})
const method = ref<string | number | boolean | null>('card')

const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))
const chosen = computed(() => items.filter(i => picked[i.id]))
const ready = computed(() => chosen.value.length > 0 && chosen.value.every(i => reasons[i.id]))
const refund = computed(() => {
  const sum = chosen.value.reduce((s, i) => s + i.price, 0)
  return method.value === 'credit' ? sum * 1.1 : sum
})
const dropCode = 'R7K-48213'
const summary = computed(() => [
  { key: 'items', label: 'Items', value: chosen.value.map(i => i.name).join(', ') },
  { key: 'refund', label: 'Refund', value: money(refund.value) + (method.value === 'credit' ? ' store credit' : ' to Visa') },
  { key: 'by', label: 'Drop off by', value: 'Friday 21 November' }
])

const money = (n: number) => '€' + n.toFixed(2)

function find() {
  tried.value = true
  notFound.value = ''
  if (!emailOk.value) return
  if (orderNo.value.trim().toUpperCase() !== 'HP-48213' || email.value.trim().toLowerCase() !== 'lea.fontaine@mailbox.org') {
    notFound.value = 'No order matches this email and number.'
    return
  }
  step.value = 1
}
function reset() {
  for (const i of items) { picked[i.id] = false; reasons[i.id] = null }
  email.value = ''; orderNo.value = ''; tried.value = false; step.value = 0
}
</script>

<style scoped>
.grs__end { grid-column: 2; justify-self: start; }
@container (min-width: 520px) {
  .grs__end { grid-column: auto; justify-self: end; }
}
.grs__total p { margin: 0; }
</style>
