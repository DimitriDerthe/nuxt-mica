<template>
  <section class="fd mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="fd-title">
    <header class="fd__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="fd-title" variant="title3" as="h2" weight="semibold">Fulfillment week</MiText>
        <MiText variant="footnote" tone="label2">Tilburg warehouse · week 44 · pick a day to drill in</MiText>
      </div>
      <MiBadge :tone="weekOnTime >= 95 ? 'success' : 'warning'" :label="`${weekOnTime}% shipped on time this week`" dot />
    </header>

    <!-- The week strip is the selector: every chart below redraws for the chosen day. -->
    <div class="fd__week mi:grid mi:grid-cols-7 mi:gap-1.5 mi:p-2 mi:rounded-xl mi:bg-card mi:shadow-1" role="group" aria-label="Day">
      <button
        v-for="d in days" :key="d.id" type="button" class="fd__day mi:grid mi:justify-items-center mi:gap-1 mi:min-w-0 mi:py-2 mi:px-0.5 mi:[border:0] mi:rounded-md mi:bg-transparent mi:text-inherit mi:[font:inherit] mi:cursor-pointer mi:[transition:background-color_var(--mi-dur-2)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-on': day.id === d.id, 'is-late': d.onTime < 0.95 }"
        :aria-pressed="day.id === d.id" :aria-label="`${d.label} ${d.date}, ${d.orders} orders, ${pct(d.onTime)} on time`" @click="dayId = d.id"
      >
        <span class="fd__day-bar mi:flex mi:[align-items:flex-end] mi:w-3.5 mi:h-11 mi:rounded-[4px] mi:bg-fill4 mi:overflow-hidden" aria-hidden="true"><i class="mi:[.fd__day-bar_&]:block mi:[.fd__day-bar_&]:w-full mi:[.fd__day-bar_&]:h-full mi:[.fd__day-bar_&]:rounded-[inherit] mi:[.fd__day-bar_&]:[background:color-mix(in_srgb,_var(--mi-p)_55%,_var(--mi-card))] mi:[.fd__day-bar_&]:origin-bottom" :style="{ transform: `scaleY(${d.orders / peakOrders})` }" /></span>
        <span class="fd__day-label mi:text-[13px] mi:font-semibold">{{ d.label }}</span>
        <span class="fd__day-num mi:text-[11px] mi:text-label2 mi:tabular-nums mi:@max-[420px]:hidden">{{ d.orders.toLocaleString('en-US') }}</span>
      </button>
    </div>

    <div class="fd__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]:grid-cols-2 mi:@[980px]:grid-cols-[minmax(0,_1.6fr)_minmax(0,_1fr)]">
      <article class="fd__card fd__flow mi:@[620px]:col-[span_2] mi:@[980px]:col-[auto] mi:@[980px]:row-[span_2] mi:grid mi:gap-3 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="fd__card-head mi:grid mi:gap-0.5">
          <MiText variant="headline" as="h3">Packed and shipped by hour</MiText>
          <MiText variant="footnote" tone="label2">{{ day.label }} {{ day.date }} · {{ day.orders.toLocaleString('en-US') }} orders</MiText>
        </div>
        <MiLineChart
          :key="day.id" :categories="hours" :series="flow" :card="false" :height="200" :ticks="3" :toggle="false"
          :aria-label="`Orders packed and shipped per hour on ${day.label}`"
        />
      </article>

      <article class="fd__card mi:grid mi:gap-3 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <MiText variant="headline" as="h3">Carrier mix</MiText>
        <MiStackedBar :segments="carriers" :height="22" :legend-columns="2" :aria-label="`Parcels by carrier on ${day.label}`" />
      </article>

      <article class="fd__card mi:grid mi:gap-3 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <MiText variant="headline" as="h3">Service levels</MiText>
        <MiRings :rings="rings" :card="false" :size="132" :stroke-width="11" :aria-label="`Service levels on ${day.label}`" />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Day { id: string, label: string, date: string, orders: number, onTime: number, picked: number, accuracy: number, carriers: [number, number, number, number] }

// Sample week; swap for your WMS export. Carrier counts are PostNL, DHL, DPD, same-day courier.
const days: Day[] = [
  { id: 'mon', label: 'Mon', date: 'Oct 27', orders: 2140, onTime: 0.97, picked: 0.99, accuracy: 0.996, carriers: [980, 640, 380, 140] },
  { id: 'tue', label: 'Tue', date: 'Oct 28', orders: 1920, onTime: 0.98, picked: 0.99, accuracy: 0.997, carriers: [880, 590, 330, 120] },
  { id: 'wed', label: 'Wed', date: 'Oct 29', orders: 2310, onTime: 0.92, picked: 0.94, accuracy: 0.991, carriers: [1040, 720, 410, 140] },
  { id: 'thu', label: 'Thu', date: 'Oct 30', orders: 2050, onTime: 0.96, picked: 0.98, accuracy: 0.995, carriers: [930, 640, 350, 130] },
  { id: 'fri', label: 'Fri', date: 'Oct 31', orders: 2680, onTime: 0.93, picked: 0.95, accuracy: 0.993, carriers: [1190, 860, 450, 180] },
  { id: 'sat', label: 'Sat', date: 'Nov 1', orders: 1180, onTime: 0.99, picked: 1, accuracy: 0.998, carriers: [620, 330, 160, 70] },
  { id: 'sun', label: 'Sun', date: 'Nov 2', orders: 640, onTime: 0.99, picked: 1, accuracy: 0.999, carriers: [380, 170, 60, 30] }
]
const carrierNames = ['PostNL', 'DHL', 'DPD', 'Same-day']
const carrierColors = ['var(--mi-p)', 'var(--mi-s)', 'var(--mi-teal)', 'var(--mi-purple)']

const hours = ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']
// Share of the day's orders handled in each 2-hour slot; shipping trails packing by one truck run.
const packedShape = [0.06, 0.14, 0.17, 0.15, 0.16, 0.14, 0.1, 0.06, 0.02]
const shippedShape = [0.02, 0.09, 0.15, 0.16, 0.15, 0.15, 0.13, 0.1, 0.05]

const dayId = ref('wed')
const day = computed(() => days.find(d => d.id === dayId.value) ?? days[0]!)
const peakOrders = Math.max(...days.map(d => d.orders))
const weekOnTime = Math.round((days.reduce((n, d) => n + d.orders * d.onTime, 0) / days.reduce((n, d) => n + d.orders, 0)) * 100)

const flow = computed(() => [
  { name: 'Packed', data: packedShape.map(s => Math.round(s * day.value.orders)), color: 'var(--mi-p)', area: true },
  { name: 'Shipped', data: shippedShape.map(s => Math.round(s * day.value.orders * day.value.onTime)), color: 'var(--mi-s)' }
])
const carriers = computed(() => day.value.carriers.map((value, i) => ({ label: carrierNames[i]!, value, color: carrierColors[i] })))
const rings = computed(() => [
  { label: 'Shipped on time', sub: 'Target 95%', value: day.value.onTime, color: 'var(--mi-p)' },
  { label: 'Picked same day', sub: 'Target 97%', value: day.value.picked, color: 'var(--mi-s)' },
  { label: 'Order accuracy', sub: 'Target 99.5%', value: day.value.accuracy, color: 'var(--mi-teal)' }
])

const pct = (v: number) => Math.round(v * 100) + '%'
</script>

<style scoped>
.fd__day:hover { background: var(--mi-fill4); }
.fd__day.is-on { background: var(--mi-p-tint); }
.fd__day.is-on .fd__day-bar i { background: var(--mi-p); }
.fd__day.is-late .fd__day-bar i { background: var(--mi-orange); }
</style>
