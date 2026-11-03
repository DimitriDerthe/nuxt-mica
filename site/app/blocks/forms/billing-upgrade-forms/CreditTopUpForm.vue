<template>
  <section class="ctu" aria-labelledby="ctu-title">
    <form class="ctu__card" novalidate @submit.prevent="pay">
      <header class="ctu__head">
        <div>
          <MiText id="ctu-title" variant="title3" as="h2" weight="semibold">Add API credits</MiText>
          <MiText variant="footnote" tone="label2">Quillstack · production project</MiText>
        </div>
        <div class="ctu__bal">
          <MiText variant="caption" tone="label2">Balance</MiText>
          <b :class="{ 'is-low': RUNWAY_NOW < 7 }">{{ money(BALANCE) }}</b>
        </div>
      </header>

      <!-- Runway: how many days of usage the balance covers, now and after this top-up. -->
      <div class="ctu__runway">
        <div class="ctu__runway-top">
          <MiText variant="subheadline" weight="semibold">{{ runway }} days of usage</MiText>
          <MiText variant="caption" tone="label2">At {{ money(BURN) }} a day, the 30-day average</MiText>
        </div>
        <div class="ctu__track" role="meter" aria-label="Days of usage covered" aria-valuemin="0" :aria-valuemax="SCALE" :aria-valuenow="Math.min(runway, SCALE)" :aria-valuetext="`${runway} days, ${RUNWAY_NOW} today`">
          <span class="ctu__after" :style="{ transform: `scaleX(${Math.min(runway, SCALE) / SCALE})` }" />
          <span class="ctu__now" :style="{ transform: `scaleX(${RUNWAY_NOW / SCALE})` }" />
        </div>
        <div class="ctu__scale"><span>Today</span><span>{{ SCALE / 2 }} days</span><span>{{ SCALE }}+ days</span></div>
      </div>

      <div class="ctu__amount">
        <div class="ctu__presets" role="group" aria-label="Quick amounts">
          <MiChip v-for="p in PRESETS" :key="p" selectable :label="money(p)" :model-value="amount === p" @update:model-value="amount = p" />
        </div>
        <MiSlider v-model="amount" :min="50" :max="1000" :step="50" label="Amount" :format="money" />
        <p class="ctu__bonus" aria-live="polite">
          <MiIcon name="star" :size="14" filled />
          <span v-if="bonus">{{ bonusRate * 100 }}% bonus: you get {{ money(credits) }} in credits</span>
          <span v-else>Add {{ money(nextTier - amount) }} more for a 5% bonus</span>
        </p>
      </div>

      <div class="ctu__auto">
        <div class="ctu__auto-row">
          <div>
            <MiText id="ctu-auto" variant="subheadline" weight="semibold">Auto-recharge</MiText>
            <MiText variant="caption" tone="label2">{{ auto ? `Adds ${money(amount)} when the balance drops under ${money(threshold)}` : 'Off: calls fail with a 402 once the balance hits zero' }}</MiText>
          </div>
          <MiSwitch v-model="auto" aria-labelledby="ctu-auto" />
        </div>
        <div v-if="auto" class="ctu__auto-row">
          <MiText variant="footnote" tone="label2">Recharge below, in dollars</MiText>
          <MiStepper v-model="threshold" variant="field" :min="10" :max="200" :step="10" label="Recharge threshold in dollars" />
        </div>
      </div>

      <div class="ctu__method">
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
.ctu { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ctu__card { display: grid; gap: 20px; max-width: 620px; margin-inline: auto; padding: 22px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 560px) { .ctu__card { padding: 28px; } }
.ctu__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.ctu__bal { display: grid; justify-items: end; }
.ctu__bal b { font-size: 22px; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.ctu__bal b.is-low { color: var(--mi-orange-t); }

.ctu__runway { display: grid; gap: 8px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.ctu__runway-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
.ctu__track { position: relative; height: 12px; border-radius: 6px; background: var(--mi-fill3); overflow: hidden; }
.ctu__track span { position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.ctu__after { background: repeating-linear-gradient(135deg, var(--mi-p) 0 6px, color-mix(in srgb, var(--mi-p) 65%, transparent) 6px 12px); }
.ctu__now { background: var(--mi-orange); }
.ctu__scale { display: flex; justify-content: space-between; font-size: 11px; color: var(--mi-label3); }

.ctu__amount { display: grid; gap: 14px; }
.ctu__presets { display: flex; flex-wrap: wrap; gap: 8px; }
.ctu__bonus { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 13px; color: var(--mi-p-text); }

.ctu__method { display: grid; gap: 10px; }
.ctu__auto { display: grid; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep); }
.ctu__auto-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; }
.ctu__auto-row > div { flex: 1; min-width: 180px; }
.ctu__auto-row + .ctu__auto-row { border-top: 1px solid var(--mi-sep); }
</style>
