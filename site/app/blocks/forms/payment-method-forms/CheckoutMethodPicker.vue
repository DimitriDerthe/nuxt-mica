<template>
  <section class="cmp mi:@container/cmp mi:font-mi mi:text-label" aria-labelledby="cmp-title">
    <form class="cmp__card mi:grid mi:gap-4.5 mi:max-w-140 mi:mx-auto mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1" novalidate @submit.prevent="pay">
      <header class="cmp__head mi:grid mi:gap-1">
        <MiText id="cmp-title" as="h2" variant="title3" weight="semibold">How would you like to pay?</MiText>
        <MiText variant="footnote" tone="label2">Order #SG-20931 · Linen duvet set and two pillowcases · <strong>{{ money(total) }}</strong></MiText>
      </header>

      <!-- Radio cards: each method reveals only the fields it needs. -->
      <MiRadioGroup v-model="method" label="Payment method" class="cmp__methods">
        <div v-for="m in methods" :key="m.id" class="cmp__method mi:rounded-lg mi:bg-fill4 mi:[outline:1px_solid_transparent] mi:[&.is-on]:bg-p-tint mi:[&.is-on]:outline-p/45" :class="{ 'is-on': method === m.id }">
          <div class="cmp__row mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2.5 mi:py-3.5 mi:px-4">
            <MiRadio :value="m.id" :label="m.label" :description="m.hint" />
            <MiBadge v-if="m.badge" tone="success" :label="m.badge" />
          </div>

          <div v-if="method === m.id && m.id === 'card'" class="cmp__panel mi:gap-3 mi:pt-0 mi:px-4 mi:pb-4 mi:@[420px]/cmp:ps-12">
            <MiField label="Saved card">
              <MiSelect v-model="card" :options="cards" />
            </MiField>
            <MiField label="Security code" hint="3 digits on the back" :error="cvcError">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="cvc" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123" :aria-describedby="describedBy" />
              </template>
            </MiField>
          </div>

          <div v-else-if="method === m.id && m.id === 'split'" class="cmp__panel mi:gap-3 mi:pt-0 mi:px-4 mi:pb-4 mi:@[420px]/cmp:ps-12">
            <ol class="cmp__plan mi:grid mi:grid-cols-2 mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[480px]/cmp:grid-cols-4" aria-label="Payment schedule">
              <li v-for="(p, i) in schedule" :key="p.date" class="cmp__step mi:grid mi:gap-0.5">
                <span class="cmp__dot mi:w-2.5 mi:h-2.5 mi:mb-1 mi:rounded-[50%] mi:border-2 mi:border-p mi:[&.is-now]:bg-p" :class="{ 'is-now': i === 0 }" aria-hidden="true" />
                <MiText variant="caption" tone="label2">{{ p.date }}</MiText>
                <MiText variant="subheadline" weight="semibold" tabular>{{ money(p.amount) }}</MiText>
              </li>
            </ol>
            <MiText variant="caption" tone="label3">0% interest, no fees when paid on time. A soft credit check does not affect your score.</MiText>
          </div>

          <div v-else-if="method === m.id && m.id === 'bank'" class="cmp__panel mi:gap-3 mi:pt-0 mi:px-4 mi:pb-4 mi:@[420px]/cmp:ps-12">
            <MiDetails :items="bankDetails" label-width="110px" />
            <div class="cmp__ref mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
              <MiText variant="caption" tone="label2">Use this reference so we can match your transfer.</MiText>
              <MiCopyButton :value="reference" label="Copy reference" variant="outline" />
            </div>
          </div>

          <MiText v-else-if="method === m.id && m.id === 'wallet'" variant="caption" tone="label2" class="cmp__panel mi:gap-3 mi:pt-0 mi:px-4 mi:pb-4 mi:@[420px]/cmp:ps-12">
            You confirm on your phone with Face ID or your passcode. Your card number is never shared with us.
          </MiText>
        </div>
      </MiRadioGroup>

      <footer class="cmp__foot mi:grid mi:gap-2.5">
        <p class="cmp__status mi:min-h-4.5 mi:m-0 mi:text-[13px] mi:text-green-t" role="status" aria-live="polite">{{ status }}</p>
        <MiButton type="submit" size="large" block>{{ cta }}</MiButton>
        <MiText variant="caption" tone="label3" align="center">
          <MiIcon name="lock" :size="12" /> Payments are encrypted. Sample data only, nothing is charged.
        </MiText>
      </footer>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type MethodId = 'wallet' | 'card' | 'split' | 'bank'
interface Method { id: MethodId, label: string, hint: string, badge?: string }
interface Installment { date: string, amount: number }

const total = 248
const methods: Method[] = [
  { id: 'wallet', label: 'Phone wallet', hint: 'Fastest, confirm on your device' },
  { id: 'card', label: 'Saved card', hint: 'Visa ending 4242 is your default' },
  { id: 'split', label: 'Pay in 4', hint: `${money(total / 4)} today, then every two weeks`, badge: '0% interest' },
  { id: 'bank', label: 'Bank transfer', hint: 'Ships once funds arrive, 1 to 2 business days' }
]
const cards = [
  { value: 'visa-4242', label: 'Visa ending 4242', description: 'Expires 08/27' },
  { value: 'mc-5100', label: 'Mastercard ending 5100', description: 'Expires 03/28' },
  { value: 'amex-0005', label: 'Amex ending 0005', description: 'Expired 01/26', disabled: true }
]
const schedule: Installment[] = ['Today', 'Nov 17', 'Dec 1', 'Dec 15'].map(date => ({ date, amount: total / 4 }))
const reference = 'SG-20931-QK7'
const bankDetails = [
  { key: 'name', label: 'Account', value: 'Saltgrove Home Ltd' },
  { key: 'iban', label: 'IBAN', value: 'GB33 BUKB 2020 1555 5555 55' },
  { key: 'ref', label: 'Reference', value: reference }
]

const method = ref<string | number | boolean | null>('card')
const card = ref<string | number | null>('visa-4242')
const cvc = ref('')
const tried = ref(false)
const status = ref('')

function money(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }

const cvcError = computed(() => tried.value && !/^\d{3,4}$/.test(cvc.value) ? 'Enter the 3 or 4 digit code.' : undefined)
const ctas: Record<MethodId, string> = {
  wallet: `Pay ${money(total)} with phone`,
  card: `Pay ${money(total)}`,
  split: `Pay ${money(total / 4)} today`,
  bank: 'Place order, pay by transfer'
}
const cta = computed(() => ctas[methods.find(m => m.id === method.value)?.id ?? 'card'])

function pay() {
  tried.value = method.value === 'card'
  if (method.value === 'card' && cvcError.value) { status.value = ''; return }
  status.value = method.value === 'bank'
    ? `Order reserved for 7 days. Transfer ${money(total)} with reference ${reference}.`
    : 'Payment authorised. A receipt is on its way to your inbox.'
}
</script>

<style scoped>
.cmp__methods { display: grid; gap: 10px; }
.cmp__panel { display: grid; animation: cmp-in var(--mi-dur-3) var(--mi-ease); }
@keyframes cmp-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .cmp__panel { animation: none; } }
</style>
