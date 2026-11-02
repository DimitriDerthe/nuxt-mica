<template>
  <section class="tmt" aria-labelledby="tmt-title">
    <header class="tmt__head">
      <div class="tmt__amount-block">
        <div class="tmt__status-row">
          <MiBadge :tone="refunded > 0 ? 'warning' : 'success'" :label="statusLabel" dot />
          <MiText as="span" variant="caption" tone="label2">4 Nov 2026, 14:02</MiText>
        </div>
        <MiText id="tmt-title" as="h2" variant="largeTitle" weight="bold" class="tmt__amount" tabular>{{ eur(gross) }}</MiText>
        <MiText variant="footnote" tone="label2">From <strong class="tmt__strong">Camille Moreau</strong> for order FH-20431</MiText>
      </div>
      <div class="tmt__id">
        <code class="tmt__code">pay_sample_8Hq2LxV41c</code>
        <MiCopyButton value="pay_sample_8Hq2LxV41c" label="Copy ID" variant="outline" />
      </div>
    </header>

    <!-- Where the money went: gross split into net, fees and refunds, recomputed after each refund. -->
    <div class="tmt__split">
      <div class="tmt__split-head">
        <MiText as="h3" variant="headline" weight="semibold">Where it goes</MiText>
        <MiText variant="subheadline" weight="semibold" tabular>Net {{ eur(net) }}</MiText>
      </div>
      <MiStackedBar :key="refunded" :segments="segments" :height="18" :legend-columns="2" :format-share="share" aria-label="Breakdown of the payment" />
    </div>

    <div class="tmt__grid">
      <div class="tmt__card">
        <MiText as="h3" variant="headline" weight="semibold">Details</MiText>
        <MiDetails :items="details" label-width="120px" />
      </div>

      <div class="tmt__card">
        <MiText as="h3" variant="headline" weight="semibold">Lifecycle</MiText>
        <MiTimeline :items="events" aria-label="Payment lifecycle" />
      </div>
    </div>

    <form class="tmt__refund" novalidate @submit.prevent="refund">
      <div class="tmt__refund-text">
        <MiText as="h3" variant="headline" weight="semibold">Refund</MiText>
        <MiText variant="caption" tone="label2">{{ eur(refundable) }} still refundable. Fees are not returned by the card network.</MiText>
      </div>
      <div class="tmt__refund-fields">
        <MiField label="Amount" :error="error">
          <template #default="{ id, describedBy }">
            <MiInput :id="id" v-model="amount" prefix="€" inputmode="decimal" :aria-describedby="describedBy" :disabled="refundable <= 0" @update:model-value="error = ''" />
          </template>
        </MiField>
        <MiField label="Reason">
          <template #default="{ id }">
            <MiNativeSelect :id="id" v-model="reason" :options="reasons" :disabled="refundable <= 0" />
          </template>
        </MiField>
        <MiButton type="submit" variant="destructive" :loading="busy" :disabled="refundable <= 0" class="tmt__refund-btn">Refund</MiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const gross = 1248
const cardFee = Math.round((gross * 0.015 + 0.25) * 100) / 100
const platformFee = Math.round(gross * 0.01 * 100) / 100

const refunded = ref(0)
const refunds = ref<{ amount: number, reason: string }[]>([])
const amount = ref('140.00')
const reason = ref<string | number | null>('damaged')
const error = ref('')
const busy = ref(false)
const reasons = [{ value: 'damaged', label: 'Item arrived damaged' }, { value: 'duplicate', label: 'Duplicate charge' }, { value: 'request', label: 'Customer request' }]

const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })
const eur = (n: number) => fmt.format(n)
const share = (pct: number) => `${pct.toFixed(1)}%`

const refundable = computed(() => Math.round((gross - refunded.value) * 100) / 100)
const net = computed(() => gross - cardFee - platformFee - refunded.value)
const statusLabel = computed(() => (refunded.value >= gross ? 'Refunded' : refunded.value > 0 ? 'Partially refunded' : 'Succeeded'))
const segments = computed(() => [
  { label: 'Net to you', value: Math.max(0, net.value), color: 'var(--mi-p)' },
  { label: 'Card processing', value: cardFee, color: 'var(--mi-s)' },
  { label: 'Platform fee', value: platformFee, color: 'var(--mi-label3)' },
  ...(refunded.value ? [{ label: 'Refunded', value: refunded.value, color: 'var(--mi-orange)' }] : [])
])

const details = [
  { key: 'method', label: 'Method', value: 'Visa •••• 4242 · exp 08/28' },
  { key: '3ds', label: '3-D Secure', value: 'Passed, frictionless' },
  { key: 'risk', label: 'Risk', value: 'Low · score 12 of 100' },
  { key: 'desc', label: 'Statement', value: 'FERNHOUSE CERAMICS' },
  { key: 'where', label: 'Location', value: 'Lyon, FR · matches billing' }
]
const events = computed(() => [
  ...refunds.value.map(r => ({ title: `Refunded ${eur(r.amount)}`, description: r.reason, time: 'Just now', tone: 'warning' as const, status: 'done' as const })).reverse(),
  { title: 'Payout to bank', description: `${eur(Math.max(0, net.value))} to •••• 0147`, time: 'Expected 6 Nov', status: 'upcoming' as const },
  { title: 'Settled', description: 'Funds available in your balance', time: '5 Nov, 06:00', status: 'current' as const, tone: 'primary' as const },
  { title: 'Captured', time: '4 Nov, 14:02:12', status: 'done' as const, tone: 'success' as const },
  { title: 'Authorized', description: 'Issuer approved, code 00', time: '4 Nov, 14:02:11', status: 'done' as const, tone: 'success' as const }
])

function refund() {
  const v = Number(amount.value.replace(',', '.'))
  if (!Number.isFinite(v) || v <= 0) { error.value = 'Enter an amount above €0.'; return }
  if (v > refundable.value) { error.value = `You can refund up to ${eur(refundable.value)}.`; return }
  busy.value = true
  setTimeout(() => {
    busy.value = false
    refunded.value = Math.round((refunded.value + v) * 100) / 100
    refunds.value.push({ amount: v, reason: reasons.find(r => r.value === reason.value)?.label ?? '' })
    amount.value = ''
  }, 700)
}
</script>

<style scoped>
.tmt { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.tmt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tmt__amount-block { display: grid; gap: 4px; }
.tmt__status-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.tmt__amount { letter-spacing: -.04em; }
.tmt__strong { color: var(--mi-label); font-weight: 600; }
.tmt__id { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }
.tmt__code { padding: 5px 9px; border-radius: 8px; background: var(--mi-fill4); font: 500 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label2); overflow-wrap: anywhere; }

.tmt__split, .tmt__card, .tmt__refund { display: grid; align-content: start; gap: 14px; padding: 18px 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.tmt__split-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; }
.tmt__grid { display: grid; gap: 14px; }
@container (min-width: 800px) { .tmt__grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); } }

.tmt__refund { background: linear-gradient(120deg, color-mix(in srgb, var(--mi-orange) 8%, transparent), transparent 60%), var(--mi-card); }
.tmt__refund-fields { display: grid; gap: 12px; align-items: end; }
@container (min-width: 640px) { .tmt__refund-fields { grid-template-columns: 160px minmax(0, 1fr) auto; } }
@container (min-width: 1000px) { .tmt__refund { grid-template-columns: minmax(0, .8fr) minmax(0, 1.4fr); align-items: end; } }
</style>
