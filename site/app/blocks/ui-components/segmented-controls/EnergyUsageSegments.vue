<template>
  <div class="mi:@container mi:font-mi mi:text-label">
    <section class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[720px]:py-6 mi:@[720px]:px-7" aria-labelledby="eus-title">
      <header class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-y-3 mi:gap-x-4">
        <div>
          <MiText id="eus-title" variant="title3" as="h2" weight="semibold">Home energy</MiText>
          <MiText variant="footnote" tone="label2">12 Rue des Lilas · smart meter synced 2 min ago</MiText>
        </div>
        <MiSegmented v-model="unit" variant="tinted" label="Unit" :options="units" />
      </header>

      <div class="mi:grid mi:gap-2.5 mi:@[720px]:flex mi:@[720px]:flex-wrap mi:@[720px]:items-center mi:@[720px]:justify-between mi:@[720px]:gap-3">
        <MiSegmented v-model="range" label="Period" :options="ranges" />
        <!-- Circuit filter: same segmented idea, as a button group for longer labels. -->
        <div class="mi:overflow-x-auto mi:[scrollbar-width:none]">
          <MiButtonGroup v-model="circuit" variant="segmented" label="Circuit" :options="circuits" />
        </div>
      </div>

      <div class="mi:grid mi:gap-4 mi:@[720px]:grid-cols-[220px_minmax(0,_1fr)] mi:@[720px]:gap-7 mi:@[720px]:items-end">
        <div class="mi:grid mi:content-start mi:gap-1" aria-live="polite">
          <MiText variant="caption" tone="label2" weight="medium">{{ circuitLabel }} · {{ period.caption }}</MiText>
          <p class="mi:my-0.5 mi:mx-0 mi:text-[clamp(34px,_8cqi,_48px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ format(total) }}</p>
          <MiText variant="footnote" :tone="delta <= 0 ? 'green' : 'red'" weight="semibold">
            {{ delta <= 0 ? '▼' : '▲' }} {{ Math.abs(delta) }}% vs previous {{ range }}
          </MiText>
          <MiText variant="caption" tone="label3">Peak at {{ peak.label }} · off-peak rate after 22:00</MiText>
        </div>

        <MiBarChart
          :data="bars" :card="false" :height="200" :max-bar-width="28" :format-value="v => format(v)"
          :aria-label="`${circuitLabel} usage per ${period.step}, ${period.caption}`" class="mi:min-w-0"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type RangeId = 'day' | 'week' | 'month'
interface Period { caption: string, step: string, labels: string[], kwh: number[], previous: number }

const units = [{ value: 'kwh', label: 'kWh' }, { value: 'cost', label: 'Cost' }]
const ranges = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]
const circuits = [
  { value: 'all', label: 'Whole home' }, { value: 'heat', label: 'Heat pump' },
  { value: 'ev', label: 'EV charger' }, { value: 'kitchen', label: 'Kitchen' }
]

const unit = ref<string | number | null>('kwh')
const range = ref<string | number | null>('week')
const circuit = ref<string | number | undefined>('all')

// Whole-home readings; each circuit takes a share of every bucket.
const periods: Record<RangeId, Period> = {
  day: { caption: 'today', step: '3 hours', labels: ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h'], kwh: [2.1, 1.4, 3.8, 2.6, 2.2, 2.4, 5.9, 4.1], previous: 26.8 },
  week: { caption: 'this week', step: 'day', labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], kwh: [21.4, 19.8, 23.1, 18.6, 20.2, 31.5, 28.9], previous: 171.2 },
  month: { caption: 'October', step: 'week', labels: ['Wk 40', 'Wk 41', 'Wk 42', 'Wk 43', 'Wk 44'], kwh: [128, 141, 156, 163, 92], previous: 611 }
}
const share: Record<string, number> = { all: 1, heat: 0.46, ev: 0.29, kitchen: 0.12 }
const rate = 0.2516

const period = computed(() => periods[range.value === 'day' || range.value === 'month' ? range.value : 'week'])
const factor = computed(() => (share[String(circuit.value ?? 'all')] ?? 1) * (unit.value === 'cost' ? rate : 1))
const bars = computed(() => period.value.labels.map((label, i) => ({ label, value: Math.round(period.value.kwh[i]! * factor.value * 10) / 10 })))
const total = computed(() => bars.value.reduce((s, b) => s + b.value, 0))
const peak = computed(() => bars.value.reduce((a, b) => (b.value > a.value ? b : a)))
const delta = computed(() => {
  const now = period.value.kwh.reduce((s, v) => s + v, 0)
  return Math.round((now - period.value.previous) / period.value.previous * 100)
})
const circuitLabel = computed(() => circuits.find(c => c.value === circuit.value)?.label ?? 'Whole home')

function format(v: number): string {
  return unit.value === 'cost' ? `€${v.toFixed(2)}` : `${v.toFixed(1)} kWh`
}
</script>
