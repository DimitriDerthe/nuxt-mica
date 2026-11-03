<template>
  <section class="grs" aria-labelledby="grs-title">
    <div class="grs__card">
      <header class="grs__head">
        <MiText id="grs-title" as="h2" variant="title3" weight="bold">Return an order</MiText>
        <MiText variant="footnote" tone="label2">No account needed. Harbor &amp; Pine accepts returns within 30 days.</MiText>
      </header>

      <MiSteps v-model="step" :steps="steps" orientation="horizontal" :clickable="false" aria-label="Return progress" />

      <!-- Step 1: find the order with the email it was placed with. -->
      <form v-if="step === 0" class="grs__form" novalidate @submit.prevent="find">
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
      <div v-else-if="step === 1" class="grs__pick">
        <ul class="grs__items" aria-label="Items in order HP-48213">
          <li v-for="item in items" :key="item.id" class="grs__item" :class="{ 'is-on': picked[item.id] }">
            <span class="grs__swatch" :style="{ '--grs-tone': item.tone }" aria-hidden="true" />
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

        <div class="grs__total" aria-live="polite">
          <MiText variant="subheadline" tone="label2">Refund</MiText>
          <MiText as="p" variant="title2" weight="bold" tabular>{{ money(refund) }}</MiText>
        </div>
        <div class="grs__actions">
          <MiButton variant="plain" @click="step = 0">Back</MiButton>
          <MiButton :disabled="!ready" @click="step = 2">Create return</MiButton>
        </div>
      </div>

      <!-- Step 3: a drop-off code instead of a label to print. -->
      <div v-else class="grs__done">
        <div class="grs__code" role="group" aria-labelledby="grs-code-label">
          <MiText id="grs-code-label" variant="caption" tone="label2" weight="medium">Show this code at any Relay point</MiText>
          <p class="grs__code-value">{{ dropCode }}</p>
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
.grs { container-type: inline-size; display: grid; align-content: start; grid-template-columns: minmax(0, 1fr); justify-items: center; font-family: var(--mi-font); color: var(--mi-label); }
.grs__card {
  display: grid; gap: 20px; width: 100%; max-width: 560px; padding: 22px 18px; box-sizing: border-box;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2);
}
@container (min-width: 520px) { .grs__card { padding: 28px 30px; } }
.grs__head { display: grid; gap: 4px; }
.grs__form, .grs__pick, .grs__done { display: grid; gap: 16px; }

.grs__items { display: grid; margin: 0; padding: 0; list-style: none; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); }
.grs__item { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px 12px; padding: 12px 14px; }
.grs__item + .grs__item { border-top: 1px solid var(--mi-sep); }
.grs__item.is-on { background: color-mix(in srgb, var(--mi-p) 5%, transparent); }
.grs__end { grid-column: 2; justify-self: start; }
@container (min-width: 520px) {
  .grs__item { grid-template-columns: auto minmax(0, 1fr) auto; }
  .grs__end { grid-column: auto; justify-self: end; }
}
/* Product thumbnail drawn with a token gradient: no image needed. */
.grs__swatch { width: 36px; height: 44px; border-radius: 8px; background: linear-gradient(160deg, color-mix(in srgb, var(--grs-tone) 70%, var(--mi-card)), color-mix(in srgb, var(--grs-tone) 30%, var(--mi-card))); box-shadow: inset 0 0 0 1px var(--mi-sep); }

.grs__total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.grs__total p { margin: 0; }
.grs__actions { display: flex; justify-content: flex-end; gap: 8px; }

.grs__code {
  display: grid; justify-items: center; gap: 8px; padding: 20px; border-radius: var(--mi-radius-l);
  background: repeating-linear-gradient(-45deg, var(--mi-p-tint) 0 10px, transparent 10px 20px), var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep);
}
.grs__code-value { margin: 0; font-size: clamp(28px, 8cqi, 40px); font-weight: 800; letter-spacing: .08em; font-variant-numeric: tabular-nums; color: var(--mi-p-text); }
</style>
