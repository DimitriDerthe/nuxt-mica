<template>
  <section class="shp" aria-labelledby="shp-title">
    <header class="shp__head">
      <div>
        <MiText id="shp-title" variant="title3" as="h2" weight="semibold">Order #40318</MiText>
        <MiText variant="footnote" tone="label2">Placed 2 Jun · shipped in {{ PARCELS.length }} parcels to Glasgow G12</MiText>
      </div>
      <MiSegmented v-model="parcelId" label="Parcel" :options="parcelOptions" />
    </header>

    <article class="shp__card">
      <div class="shp__eta">
        <div>
          <MiText variant="caption" tone="label2" weight="medium">{{ parcel.delivered ? 'Delivered' : 'Estimated delivery' }}</MiText>
          <p class="shp__day">{{ parcel.eta }}</p>
          <MiText variant="footnote" tone="label2">{{ parcel.items }} · {{ parcel.carrier }}</MiText>
        </div>
        <MiCopyButton :value="parcel.tracking" :label="parcel.tracking" copied-label="Tracking number copied" variant="outline" />
      </div>

      <!-- Milestone track: the fill is one scaleX, stops are evenly spaced. -->
      <div class="shp__track">
        <span class="shp__line" aria-hidden="true"><i :style="{ transform: `scaleX(${parcel.stage / (MILESTONES.length - 1)})` }" /></span>
        <ol class="shp__stops" aria-label="Delivery progress">
          <li v-for="(m, i) in MILESTONES" :key="m" class="shp__stop" :class="{ 'is-done': i <= parcel.stage, 'is-now': i === parcel.stage }" :aria-current="i === parcel.stage ? 'step' : undefined">
            <span class="shp__dot" aria-hidden="true"><MiIcon v-if="i < parcel.stage || parcel.delivered" name="check" :size="10" /></span>
            <span class="shp__label">{{ m }}</span>
          </li>
        </ol>
      </div>
    </article>

    <div class="shp__log">
      <div class="shp__log-head">
        <MiText variant="headline" as="h3">Tracking history</MiText>
        <MiSegmented v-model="detail" label="History detail" :options="[{ value: 'key', label: 'Milestones' }, { value: 'all', label: 'All scans' }]" />
      </div>
      <MiTimeline :items="events" :aria-label="'Tracking history for ' + parcel.short" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Scan { title: string, description: string, time: string, key: boolean }
interface Parcel { id: string, short: string, items: string, carrier: string, tracking: string, eta: string, stage: number, delivered: boolean, scans: Scan[] }

const MILESTONES = ['Ordered', 'Packed', 'In transit', 'Out for delivery', 'Delivered']

const PARCELS: Parcel[] = [
  {
    id: 'p1', short: 'Parcel 1', items: 'Linen duvet set, 2 pillowcases', carrier: 'Royal Mail Tracked 48', tracking: 'RM 4471 0932 GB', eta: 'Thursday 6 June, 8:00–13:00', stage: 3, delivered: false,
    scans: [
      { title: 'Out for delivery', description: 'Glasgow West delivery office', time: 'Thu 06:52', key: true },
      { title: 'Sorted', description: 'Glasgow Mail Centre', time: 'Thu 02:10', key: false },
      { title: 'Arrived at hub', description: 'Glasgow Mail Centre', time: 'Wed 23:41', key: false },
      { title: 'In transit', description: 'Left Daventry national hub', time: 'Wed 14:05', key: true },
      { title: 'Collected from warehouse', description: 'Northampton fulfilment centre', time: 'Tue 17:30', key: false },
      { title: 'Packed', description: 'Weight 2.4 kg', time: 'Tue 11:12', key: true },
      { title: 'Order placed', description: 'Payment confirmed', time: 'Sun 21:08', key: true }
    ]
  },
  {
    id: 'p2', short: 'Parcel 2', items: 'Oak bedside lamp', carrier: 'DPD Next Day', tracking: 'DPD 1550 8821 3304', eta: 'Delivered Wednesday 5 June, 12:14', stage: 4, delivered: true,
    scans: [
      { title: 'Delivered', description: 'Left with neighbour at no. 14, photo taken', time: 'Wed 12:14', key: true },
      { title: 'Out for delivery', description: 'Driver Callum, 1-hour window 11:50–12:50', time: 'Wed 08:03', key: true },
      { title: 'At local depot', description: 'Glasgow depot', time: 'Wed 04:20', key: false },
      { title: 'In transit', description: 'Hinckley hub', time: 'Tue 22:15', key: true },
      { title: 'Packed', description: 'Weight 3.1 kg', time: 'Tue 10:40', key: true },
      { title: 'Order placed', description: 'Payment confirmed', time: 'Sun 21:08', key: true }
    ]
  }
]

const parcelOptions = PARCELS.map(p => ({ value: p.id, label: p.short }))
const parcelId = ref<string | number | null>('p1')
const detail = ref<string | number | null>('key')

const parcel = computed(() => PARCELS.find(p => p.id === parcelId.value) ?? PARCELS[0]!)
const events = computed(() => parcel.value.scans
  .filter(s => detail.value === 'all' || s.key)
  .map((s, i) => ({ title: s.title, description: s.description, time: s.time, status: i === 0 && !parcel.value.delivered ? 'current' as const : 'done' as const, tone: i === 0 ? 'primary' as const : 'neutral' as const })))
</script>

<style scoped>
.shp { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.shp__head, .shp__log-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.shp__card, .shp__log { display: grid; gap: 22px; padding: 20px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.shp__log { gap: 14px; }
.shp__eta { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.shp__day { margin: 2px 0 4px; font-size: clamp(20px, 5cqi, 28px); font-weight: 700; letter-spacing: -.025em; }

.shp__track { position: relative; }
.shp__stops { position: relative; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); margin: 0; padding: 0; list-style: none; }
.shp__line { position: absolute; inset: 9px 10% auto; height: 3px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.shp__line i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.shp__stop { position: relative; display: grid; justify-items: center; gap: 8px; text-align: center; }
.shp__dot { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--mi-card); box-shadow: inset 0 0 0 2px var(--mi-fill2); color: var(--mi-p-on); }
.shp__stop.is-done .shp__dot { background: var(--mi-p); box-shadow: none; }
.shp__stop.is-now:not(:last-child) .shp__dot { background: var(--mi-card); box-shadow: inset 0 0 0 6px var(--mi-p); }
.shp__label { font-size: 11px; line-height: 1.25; color: var(--mi-label3); }
.shp__stop.is-done .shp__label { color: var(--mi-label2); }
.shp__stop.is-now .shp__label { color: var(--mi-label); font-weight: 600; }

@container (min-width: 560px) {
  .shp__label { font-size: 13px; }
}
</style>
