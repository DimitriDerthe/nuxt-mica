<template>
  <section class="fd" aria-labelledby="fd-title">
    <header class="fd__head">
      <div>
        <MiText id="fd-title" variant="title3" as="h2" weight="semibold">Fulfillment week</MiText>
        <MiText variant="footnote" tone="label2">Tilburg warehouse · week 44 · pick a day to drill in</MiText>
      </div>
      <MiBadge :tone="weekOnTime >= 95 ? 'success' : 'warning'" :label="`${weekOnTime}% shipped on time this week`" dot />
    </header>

    <!-- The week strip is the selector: every chart below redraws for the chosen day. -->
    <div class="fd__week" role="group" aria-label="Day">
      <button
        v-for="d in days" :key="d.id" type="button" class="fd__day" :class="{ 'is-on': day.id === d.id, 'is-late': d.onTime < 0.95 }"
        :aria-pressed="day.id === d.id" :aria-label="`${d.label} ${d.date}, ${d.orders} orders, ${pct(d.onTime)} on time`" @click="dayId = d.id"
      >
        <span class="fd__day-bar" aria-hidden="true"><i :style="{ transform: `scaleY(${d.orders / peakOrders})` }" /></span>
        <span class="fd__day-label">{{ d.label }}</span>
        <span class="fd__day-num">{{ d.orders.toLocaleString('en-US') }}</span>
      </button>
    </div>

    <div class="fd__grid">
      <article class="fd__card fd__flow">
        <div class="fd__card-head">
          <MiText variant="headline" as="h3">Packed and shipped by hour</MiText>
          <MiText variant="footnote" tone="label2">{{ day.label }} {{ day.date }} · {{ day.orders.toLocaleString('en-US') }} orders</MiText>
        </div>
        <MiLineChart
          :key="day.id" :categories="hours" :series="flow" :card="false" :height="200" :ticks="3" :toggle="false"
          :aria-label="`Orders packed and shipped per hour on ${day.label}`"
        />
      </article>

      <article class="fd__card">
        <MiText variant="headline" as="h3">Carrier mix</MiText>
        <MiStackedBar :segments="carriers" :height="22" :legend-columns="2" :aria-label="`Parcels by carrier on ${day.label}`" />
      </article>

      <article class="fd__card">
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
.fd { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.fd__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.fd__week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; padding: 8px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.fd__day {
  display: grid; justify-items: center; gap: 4px; min-width: 0; padding: 8px 2px; border: 0; border-radius: var(--mi-radius-m);
  background: transparent; color: inherit; font: inherit; cursor: pointer; transition: background-color var(--mi-dur-2) var(--mi-ease);
}
.fd__day:hover { background: var(--mi-fill4); }
.fd__day.is-on { background: var(--mi-p-tint); }
.fd__day:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.fd__day-bar { display: flex; align-items: flex-end; width: 14px; height: 44px; border-radius: 4px; background: var(--mi-fill4); overflow: hidden; }
.fd__day-bar i { display: block; width: 100%; height: 100%; border-radius: inherit; background: color-mix(in srgb, var(--mi-p) 55%, var(--mi-card)); transform-origin: bottom; }
.fd__day.is-on .fd__day-bar i { background: var(--mi-p); }
.fd__day.is-late .fd__day-bar i { background: var(--mi-orange); }
.fd__day-label { font-size: 13px; font-weight: 600; }
.fd__day-num { font-size: 11px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
@container (max-width: 420px) { .fd__day-num { display: none; } }

.fd__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 620px) { .fd__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fd__flow { grid-column: span 2; } }
@container (min-width: 980px) { .fd__grid { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); } .fd__flow { grid-column: auto; grid-row: span 2; } }
.fd__card { display: grid; gap: 12px; align-content: start; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.fd__card-head { display: grid; gap: 2px; }
</style>
