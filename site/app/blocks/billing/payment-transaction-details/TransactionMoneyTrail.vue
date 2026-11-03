<template>
  <section class="tmt mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="tmt-title">
    <header class="tmt__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <div class="tmt__amount-block mi:grid mi:gap-1">
        <div class="tmt__status-row mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiBadge :tone="refunded > 0 ? 'warning' : 'success'" :label="statusLabel" dot />
          <MiText as="span" variant="caption" tone="label2">4 Nov 2026, 14:02</MiText>
        </div>
        <MiText id="tmt-title" as="h2" variant="largeTitle" weight="bold" class="tmt__amount" tabular>{{ eur(gross) }}</MiText>
        <MiText variant="footnote" tone="label2">From <strong class="tmt__strong mi:text-label mi:font-semibold">Camille Moreau</strong> for order FH-20431</MiText>
      </div>
      <div class="tmt__id mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:min-w-0">
        <code class="tmt__code mi:py-[5px] mi:px-[9px] mi:rounded-[8px] mi:[background:var(--mi-fill4)] mi:[font:500_12px/1.4_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-label2 mi:wrap-anywhere">pay_sample_8Hq2LxV41c</code>
        <MiCopyButton value="pay_sample_8Hq2LxV41c" label="Copy ID" variant="outline" />
      </div>
    </header>

    <!-- Where the money went: gross split into net, fees and refunds, recomputed after each refund. -->
    <div class="tmt__split mi:grid mi:content-start mi:gap-3.5 mi:py-4.5 mi:px-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
      <div class="tmt__split-head mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-2">
        <MiText as="h3" variant="headline" weight="semibold">Where it goes</MiText>
        <MiText variant="subheadline" weight="semibold" tabular>Net {{ eur(net) }}</MiText>
      </div>
      <MiStackedBar :key="refunded" :segments="segments" :height="18" :legend-columns="2" :format-share="share" aria-label="Breakdown of the payment" />
    </div>

    <div class="tmt__grid mi:grid mi:gap-3.5 mi:@[800px]:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)]">
      <div class="tmt__card mi:grid mi:content-start mi:gap-3.5 mi:py-4.5 mi:px-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
        <MiText as="h3" variant="headline" weight="semibold">Details</MiText>
        <MiDetails :items="details" label-width="120px" />
      </div>

      <div class="tmt__card mi:grid mi:content-start mi:gap-3.5 mi:py-4.5 mi:px-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
        <MiText as="h3" variant="headline" weight="semibold">Lifecycle</MiText>
        <MiTimeline :items="events" aria-label="Payment lifecycle" />
      </div>
    </div>

    <form class="tmt__refund mi:grid mi:content-start mi:gap-3.5 mi:py-4.5 mi:px-5 mi:rounded-xl mi:shadow-1 mi:min-w-0 mi:@[1000px]:grid-cols-[minmax(0,_.8fr)_minmax(0,_1.4fr)] mi:@[1000px]:items-end" novalidate @submit.prevent="refund">
      <div class="tmt__refund-text">
        <MiText as="h3" variant="headline" weight="semibold">Refund</MiText>
        <MiText variant="caption" tone="label2">{{ eur(refundable) }} still refundable. Fees are not returned by the card network.</MiText>
      </div>
      <div class="tmt__refund-fields mi:grid mi:gap-3 mi:items-end mi:@[640px]:grid-cols-[160px_minmax(0,_1fr)_auto]">
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
import { computed, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

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
  later(() => {
    busy.value = false
    refunded.value = Math.round((refunded.value + v) * 100) / 100
    refunds.value.push({ amount: v, reason: reasons.find(r => r.value === reason.value)?.label ?? '' })
    amount.value = ''
  }, 700)
}
</script>

<style scoped>
.tmt__amount { letter-spacing: -.04em; }

.tmt__refund { background: var(--mi-card); }

.tmt__refund { background: linear-gradient(120deg, color-mix(in srgb, var(--mi-orange) 8%, transparent), transparent 60%), var(--mi-card); }
</style>
