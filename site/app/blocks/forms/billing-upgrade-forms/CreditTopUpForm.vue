<template>
  <section class="ctu mi:@container mi:font-mi mi:text-label" aria-labelledby="ctu-title">
    <form class="ctu__card mi:grid mi:gap-5 mi:max-w-155 mi:mx-auto mi:py-5.5 mi:px-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:p-7" novalidate @submit.prevent="pay">
      <header class="ctu__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
        <div>
          <MiText id="ctu-title" variant="title3" as="h2" weight="semibold">Add API credits</MiText>
          <MiText variant="footnote" tone="label2">Quillstack · production project</MiText>
        </div>
        <div class="ctu__bal mi:grid mi:justify-items-end">
          <MiText variant="caption" tone="label2">Balance</MiText>
          <b :class="{ 'is-low mi:[.ctu__bal_&]:text-orange-t': RUNWAY_NOW < 7 }">{{ money(BALANCE) }}</b>
        </div>
      </header>

      <!-- Runway: how many days of usage the balance covers, now and after this top-up. -->
      <div class="ctu__runway mi:grid mi:gap-2 mi:p-4 mi:rounded-lg mi:[background:var(--mi-fill4)]">
        <div class="ctu__runway-top mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3">
          <MiText variant="subheadline" weight="semibold">{{ runway }} days of usage</MiText>
          <MiText variant="caption" tone="label2">At {{ money(BURN) }} a day, the 30-day average</MiText>
        </div>
        <div class="ctu__track mi:relative mi:h-3 mi:rounded-[6px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Days of usage covered" aria-valuemin="0" :aria-valuemax="SCALE" :aria-valuenow="Math.min(runway, SCALE)" :aria-valuetext="`${runway} days, ${RUNWAY_NOW} today`">
          <span class="ctu__after mi:[.ctu__track_&]:absolute mi:[.ctu__track_&]:inset-0 mi:[.ctu__track_&]:rounded-[inherit] mi:[.ctu__track_&]:origin-left mi:[.ctu__track_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[background:repeating-linear-gradient(135deg,_var(--mi-p)_0_6px,_color-mix(in_srgb,_var(--mi-p)_65%,_transparent)_6px_12px)]" :style="{ transform: `scaleX(${Math.min(runway, SCALE) / SCALE})` }" />
          <span class="ctu__now mi:[.ctu__track_&]:absolute mi:[.ctu__track_&]:inset-0 mi:[.ctu__track_&]:rounded-[inherit] mi:[.ctu__track_&]:origin-left mi:[.ctu__track_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[background:var(--mi-orange)]" :style="{ transform: `scaleX(${RUNWAY_NOW / SCALE})` }" />
        </div>
        <div class="ctu__scale mi:flex mi:justify-between mi:text-[11px] mi:text-label3"><span>Today</span><span>{{ SCALE / 2 }} days</span><span>{{ SCALE }}+ days</span></div>
      </div>

      <div class="ctu__amount mi:grid mi:gap-3.5">
        <div class="ctu__presets mi:flex mi:flex-wrap mi:gap-2" role="group" aria-label="Quick amounts">
          <MiChip v-for="p in PRESETS" :key="p" selectable :label="money(p)" :model-value="amount === p" @update:model-value="amount = p" />
        </div>
        <MiSlider v-model="amount" :min="50" :max="1000" :step="50" label="Amount" :format="money" />
        <p class="ctu__bonus mi:flex mi:items-center mi:gap-1.5 mi:m-0 mi:text-[13px] mi:text-p-text" aria-live="polite">
          <MiIcon name="star" :size="14" filled />
          <span v-if="bonus">{{ bonusRate * 100 }}% bonus: you get {{ money(credits) }} in credits</span>
          <span v-else>Add {{ money(nextTier - amount) }} more for a 5% bonus</span>
        </p>
      </div>

      <div class="ctu__auto mi:grid mi:rounded-lg mi:border mi:border-sep">
        <div class="ctu__auto-row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-3.5 mi:[.ctu__auto-row+&]:border-t mi:[.ctu__auto-row+&]:border-t-sep">
          <div>
            <MiText id="ctu-auto" variant="subheadline" weight="semibold">Auto-recharge</MiText>
            <MiText variant="caption" tone="label2">{{ auto ? `Adds ${money(amount)} when the balance drops under ${money(threshold)}` : 'Off: calls fail with a 402 once the balance hits zero' }}</MiText>
          </div>
          <MiSwitch v-model="auto" aria-labelledby="ctu-auto" />
        </div>
        <div v-if="auto" class="ctu__auto-row mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:py-3 mi:px-3.5 mi:[.ctu__auto-row+&]:border-t mi:[.ctu__auto-row+&]:border-t-sep">
          <MiText variant="footnote" tone="label2">Recharge below, in dollars</MiText>
          <MiStepper v-model="threshold" variant="field" :min="10" :max="200" :step="10" label="Recharge threshold in dollars" />
        </div>
      </div>

      <div class="ctu__method mi:grid mi:gap-2.5">
        <MiText variant="subheadline" weight="semibold">Charge to</MiText>
        <MiRadioGroup v-model="method" label="Charge to" :options="METHODS" />
      </div>

      <MiAlert v-if="done" tone="success" title="Credits added" :message="`${money(credits)} is in your balance. Receipt sent to billing@quillstack.dev.`" />
      <MiButton v-else type="submit" block size="large" :loading="busy">Pay {{ money(amount) }}</MiButton>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const BALANCE = 42.1
const BURN = 9.8
const SCALE = 90
const RUNWAY_NOW = Math.floor(BALANCE / BURN)
const PRESETS = [100, 250, 500]
// Saved methods only; card details are never typed here.
const METHODS = [
  { value: 'visa', label: 'Visa ending 4242', description: 'Expires 08/28 · default' },
  { value: 'sepa', label: 'SEPA debit ending 8811', description: 'Takes 2 business days to clear' }
]

const amount = ref(250)
const auto = ref(true)
const threshold = ref(30)
const method = ref<string | number | boolean | null>('visa')
const busy = ref(false)
const done = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const bonusRate = computed(() => (amount.value >= 500 ? 0.1 : amount.value >= 250 ? 0.05 : 0))
const bonus = computed(() => amount.value * bonusRate.value)
const credits = computed(() => amount.value + bonus.value)
const nextTier = computed(() => (amount.value < 250 ? 250 : 500))
const runway = computed(() => Math.floor((BALANCE + credits.value) / BURN))

watch([amount, method], () => { done.value = false })
function pay() {
  if (busy.value) return
  busy.value = true
  timer = setTimeout(() => { busy.value = false; done.value = true }, 900)
}
onBeforeUnmount(() => clearTimeout(timer))
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
</script>

<style scoped>
.ctu__bal b { font-size: 22px; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.ctu__auto-row > div { flex: 1; min-width: 180px; }
</style>
