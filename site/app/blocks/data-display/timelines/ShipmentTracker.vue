<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="shp-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="shp-title" variant="title3" as="h2" weight="semibold">Order #40318</MiText>
        <MiText variant="footnote" tone="label2">Placed 2 Jun · shipped in {{ PARCELS.length }} parcels to Glasgow G12</MiText>
      </div>
      <MiSegmented v-model="parcelId" label="Parcel" :options="parcelOptions" />
    </header>

    <article class="mi:grid mi:gap-5.5 mi:p-5 mi:rounded-lg mi:bg-card mi:shadow-1">
      <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
        <div>
          <MiText variant="caption" tone="label2" weight="medium">{{ parcel.delivered ? 'Delivered' : 'Estimated delivery' }}</MiText>
          <p class="mi:mt-0.5 mi:mx-0 mi:mb-1 mi:text-[clamp(20px,_5cqi,_28px)] mi:font-bold mi:tracking-[-.025em]">{{ parcel.eta }}</p>
          <MiText variant="footnote" tone="label2">{{ parcel.items }} · {{ parcel.carrier }}</MiText>
        </div>
        <MiCopyButton :value="parcel.tracking" :label="parcel.tracking" copied-label="Tracking number copied" variant="outline" />
      </div>

      <!-- Milestone track: the fill is one scaleX, stops are evenly spaced. -->
      <div class="mi:relative">
        <span class="mi:absolute mi:top-[9px] mi:right-[10%] mi:bottom-auto mi:left-[10%] mi:h-[3px] mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden" aria-hidden="true"><i class="mi:block mi:h-full mi:bg-p mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${parcel.stage / (MILESTONES.length - 1)})` }" /></span>
        <ol class="mi:relative mi:grid mi:grid-cols-5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Delivery progress">
          <li v-for="(m, i) in MILESTONES" :key="m" class="mi:relative mi:grid mi:justify-items-center mi:gap-2 mi:text-center" :aria-current="i === parcel.stage ? 'step' : undefined">
            <span class="mi:grid mi:place-items-center mi:w-5 mi:h-5 mi:rounded-[50%] mi:text-p-on" :class="i === parcel.stage && i < MILESTONES.length - 1 ? 'mi:bg-card mi:shadow-[inset_0_0_0_6px_var(--mi-p)]' : i <= parcel.stage ? 'mi:bg-p mi:shadow-none' : 'mi:bg-card mi:shadow-[inset_0_0_0_2px_var(--mi-fill2)]'" aria-hidden="true"><MiIcon v-if="i < parcel.stage || parcel.delivered" name="check" :size="10" /></span>
            <span class="mi:text-[11px] mi:leading-tight mi:@[560px]:text-[13px]" :class="i === parcel.stage ? 'mi:text-label mi:font-semibold' : i <= parcel.stage ? 'mi:text-label2' : 'mi:text-label3'">{{ m }}</span>
          </li>
        </ol>
      </div>
    </article>

    <div class="mi:grid mi:gap-3.5 mi:p-5 mi:rounded-lg mi:bg-card mi:shadow-1">
      <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
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
