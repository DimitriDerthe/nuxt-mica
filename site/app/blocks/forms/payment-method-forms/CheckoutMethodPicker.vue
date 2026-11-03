<template>
  <section class="cmp" aria-labelledby="cmp-title">
    <form class="cmp__card" novalidate @submit.prevent="pay">
      <header class="cmp__head">
        <MiText id="cmp-title" as="h2" variant="title3" weight="semibold">How would you like to pay?</MiText>
        <MiText variant="footnote" tone="label2">Order #SG-20931 · Linen duvet set and two pillowcases · <strong>{{ money(total) }}</strong></MiText>
      </header>

      <!-- Radio cards: each method reveals only the fields it needs. -->
      <MiRadioGroup v-model="method" label="Payment method" class="cmp__methods">
        <div v-for="m in methods" :key="m.id" class="cmp__method" :class="{ 'is-on': method === m.id }">
          <div class="cmp__row">
            <MiRadio :value="m.id" :label="m.label" :description="m.hint" />
            <MiBadge v-if="m.badge" tone="success" :label="m.badge" />
          </div>

          <div v-if="method === m.id && m.id === 'card'" class="cmp__panel">
            <MiField label="Saved card">
              <MiSelect v-model="card" :options="cards" />
            </MiField>
            <MiField label="Security code" hint="3 digits on the back" :error="cvcError">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="cvc" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123" :aria-describedby="describedBy" />
              </template>
            </MiField>
          </div>

          <div v-else-if="method === m.id && m.id === 'split'" class="cmp__panel">
            <ol class="cmp__plan" aria-label="Payment schedule">
              <li v-for="(p, i) in schedule" :key="p.date" class="cmp__step">
                <span class="cmp__dot" :class="{ 'is-now': i === 0 }" aria-hidden="true" />
                <MiText variant="caption" tone="label2">{{ p.date }}</MiText>
                <MiText variant="subheadline" weight="semibold" tabular>{{ money(p.amount) }}</MiText>
              </li>
            </ol>
            <MiText variant="caption" tone="label3">0% interest, no fees when paid on time. A soft credit check does not affect your score.</MiText>
          </div>

          <div v-else-if="method === m.id && m.id === 'bank'" class="cmp__panel">
            <MiDetails :items="bankDetails" label-width="110px" />
            <div class="cmp__ref">
              <MiText variant="caption" tone="label2">Use this reference so we can match your transfer.</MiText>
              <MiCopyButton :value="reference" label="Copy reference" variant="outline" />
            </div>
          </div>

          <MiText v-else-if="method === m.id && m.id === 'wallet'" variant="caption" tone="label2" class="cmp__panel">
            You confirm on your phone with Face ID or your passcode. Your card number is never shared with us.
          </MiText>
        </div>
      </MiRadioGroup>

      <footer class="cmp__foot">
        <p class="cmp__status" role="status" aria-live="polite">{{ status }}</p>
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
.cmp { container: cmp / inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.cmp__card { display: grid; gap: 18px; max-width: 560px; margin-inline: auto; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cmp__head { display: grid; gap: 4px; }

.cmp__methods { display: grid; gap: 10px; }
.cmp__method { border-radius: var(--mi-radius-l); background: var(--mi-fill4); outline: 1px solid transparent; }
.cmp__method.is-on { background: var(--mi-p-tint); outline-color: color-mix(in srgb, var(--mi-p) 45%, transparent); }
.cmp__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding: 14px 16px; }
.cmp__panel { display: grid; gap: 12px; padding: 0 16px 16px; animation: cmp-in var(--mi-dur-3) var(--mi-ease); }
@container cmp (min-width: 420px) { .cmp__panel { padding-inline-start: 48px; } }

.cmp__plan { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
@container cmp (min-width: 480px) { .cmp__plan { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.cmp__step { display: grid; gap: 2px; }
.cmp__dot { width: 10px; height: 10px; margin-bottom: 4px; border-radius: 50%; border: 2px solid var(--mi-p); }
.cmp__dot.is-now { background: var(--mi-p); }
.cmp__ref { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }

.cmp__foot { display: grid; gap: 10px; }
.cmp__status { min-height: 18px; margin: 0; font-size: 13px; color: var(--mi-green-t); }
@keyframes cmp-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .cmp__panel { animation: none; } }
</style>
