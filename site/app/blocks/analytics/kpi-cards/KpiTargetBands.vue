<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="ktb-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-2.5 mi:gap-x-5">
      <div class="mi:grid mi:gap-0.5">
        <MiText id="ktb-title" variant="title3" as="h2" weight="semibold">Unit economics against plan</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · weeks 28 to 39 · bands are the FY26 targets set by finance</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-4 mi:text-[12px] mi:text-label2" aria-hidden="true">
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-4 mi:h-2.5 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-p)_16%,_transparent)] mi:shadow-[inset_0_1px_0_color-mix(in_srgb,_var(--mi-p)_45%,_transparent),_inset_0_-1px_0_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)]" />Target band</span>
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-green" />Better than band</span>
        <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-orange" />Off target</span>
      </div>
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-flow-row-dense" :class="open !== null ? 'mi:@[560px]:grid-cols-3 mi:@[960px]:grid-cols-3' : 'mi:@[560px]:grid-cols-2 mi:@[960px]:grid-cols-4'">
      <article
        v-for="(m, i) in view" :key="m.id" class="mi:relative mi:grid mi:content-start mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-2 mi:after:opacity-0 mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:after:[transition:none]" :class="open === i ? 'mi:@[560px]:col-span-full mi:gap-4.5 mi:pt-4.5 mi:px-4.5 mi:pb-5' : 'mi:gap-3.5 mi:pt-4 mi:px-4 mi:pb-4.5 mi:hover:after:opacity-100'"
        :aria-labelledby="`ktb-btn-${m.id}`"
      >
        <button
          :id="`ktb-btn-${m.id}`" type="button" class="mi:grid mi:gap-1 mi:justify-items-start mi:static mi:w-full mi:m-0 mi:pt-0 mi:pr-7 mi:pb-0 mi:pl-0 mi:[border:0] mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:rounded-md mi:focus-visible:[outline:none] mi:focus-visible:before:content-[''] mi:focus-visible:before:absolute mi:focus-visible:before:inset-0 mi:focus-visible:before:z-1 mi:focus-visible:before:rounded-xl mi:focus-visible:before:shadow-[0_0_0_2px_var(--mi-p)]" :class="open !== i ? `mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:z-1 mi:before:rounded-xl` : ''" :aria-expanded="open === i"
          :aria-controls="`ktb-panel-${m.id}`" @click="toggle(i)"
        >
          <span class="mi:max-w-full mi:text-[13px] mi:font-semibold mi:text-label2 mi:tracking-[-.005em] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ m.label }}</span>
          <span class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1.5 mi:gap-x-2.5 mi:mt-1.5">
            <span class="mi:leading-none mi:font-bold mi:tracking-[-.035em] mi:tabular-nums" :class="open === i ? 'mi:text-[40px]' : 'mi:text-[30px]'">{{ m.now }}</span>
            <span class="mi:relative mi:-top-1 mi:py-0.5 mi:px-[7px] mi:rounded-[999px] mi:text-[11px] mi:font-semibold mi:leading-4" :class="m.tone === 'in' ? 'mi:text-p-text mi:bg-p-tint' : m.tone === 'good' ? 'mi:text-green-t mi:bg-green/14' : 'mi:text-orange-t mi:bg-orange/16'">{{ m.status }}</span>
          </span>
          <span class="mi:mt-1.5 mi:text-[12px] mi:text-label2 mi:tabular-nums" :class="open === i ? 'mi:flex mi:flex-wrap mi:gap-y-0.5 mi:gap-x-3.5' : 'mi:grid mi:gap-0.5'">
            <span>Target {{ m.bandText }}</span>
            <span class="mi:text-label2 mi:opacity-85">{{ m.weeksIn }} of {{ weeks.length }} weeks in band</span>
          </span>
          <MiIcon name="chevron-down" :size="16" class="mi:absolute mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]" :class="open === i ? 'mi:top-5 mi:right-4.5 mi:text-label2 mi:transform-[rotate(180deg)]' : 'mi:top-4.5 mi:right-4 mi:text-label3'" />
        </button>

        <!-- Compact view: the sparkline over its target band. -->
        <div v-if="open !== i" class="mi:relative mi:h-13.5 mi:my-0 mi:mx-[3px]" role="img" :aria-label="m.summary">
          <svg class="mi:block mi:w-full mi:h-full mi:overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" :y="m.bandY" width="100" :height="m.bandH" class="mi:fill-p/13" />
            <line x1="0" x2="100" :y1="m.bandY" :y2="m.bandY" class="mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
            <line x1="0" x2="100" :y1="m.bandY + m.bandH" :y2="m.bandY + m.bandH" class="mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
            <path :d="m.path" class="mi:fill-[color:none] mi:stroke-label mi:[stroke-width:1.6] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke]" />
          </svg>
          <i
            v-for="p in m.outside" :key="p.i" class="mi:absolute mi:w-[7px] mi:h-[7px] mi:mt-[-3.5px] mi:mr-0 mi:mb-0 mi:ml-[-3.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)]" :class="p.good ? 'mi:bg-green' : 'mi:bg-orange'"
            :style="{ left: p.left + '%', top: p.top + '%' }"
          />
          <i class="mi:absolute mi:w-[9px] mi:h-[9px] mi:mt-[-4.5px] mi:mr-0 mi:mb-0 mi:ml-[-4.5px] mi:rounded-[50%] mi:bg-p mi:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ left: '100%', top: m.lastTop + '%' }" />
        </div>

        <!-- Expanded view: the same picture, larger, with the segment breakdown. -->
        <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]" enter-from-class="mi:opacity-0 mi:transform-[translateY(6px)]">
          <div v-if="open === i" :id="`ktb-panel-${m.id}`" class="mi:grid mi:gap-5 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(240px,_300px)] mi:@[760px]:gap-7">
            <figure class="mi:grid mi:gap-2 mi:m-0 mi:min-w-0">
              <div class="mi:relative mi:h-42 mi:mr-13" role="img" :aria-label="m.summary">
                <svg class="mi:block mi:w-full mi:h-full mi:overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                  <line v-for="g in [10, 20, 30]" :key="g" x1="0" x2="100" :y1="g" :y2="g" class="mi:stroke-sep mi:[stroke-width:1] mi:[vector-effect:non-scaling-stroke]" />
                  <rect x="0" :y="m.bandY" width="100" :height="m.bandH" class="mi:fill-p/13" />
                  <line x1="0" x2="100" :y1="m.bandY" :y2="m.bandY" class="mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
                  <line x1="0" x2="100" :y1="m.bandY + m.bandH" :y2="m.bandY + m.bandH" class="mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
                  <path :d="m.area" class="mi:fill-label/5" />
                  <path :d="m.path" class="mi:fill-[color:none] mi:stroke-label mi:[stroke-width:2] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke]" />
                </svg>
                <span class="mi:absolute mi:left-[calc(100%_+_10px)] mi:transform-[translateY(-50%)] mi:text-[11px] mi:font-semibold mi:text-p-text mi:tabular-nums mi:whitespace-nowrap" :style="{ top: m.bandY * 2.5 + '%' }">{{ m.bandTop }}</span>
                <span class="mi:absolute mi:left-[calc(100%_+_10px)] mi:transform-[translateY(-50%)] mi:text-[11px] mi:font-semibold mi:text-p-text mi:tabular-nums mi:whitespace-nowrap" :style="{ top: (m.bandY + m.bandH) * 2.5 + '%' }">{{ m.bandBottom }}</span>
                <i
                  v-for="p in m.outside" :key="p.i" class="mi:absolute mi:w-[9px] mi:h-[9px] mi:mt-[-4.5px] mi:mr-0 mi:mb-0 mi:ml-[-4.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)]" :class="p.good ? 'mi:bg-green' : 'mi:bg-orange'"
                  :style="{ left: p.left + '%', top: p.top + '%' }"
                />
                <i class="mi:absolute mi:w-[11px] mi:h-[11px] mi:mt-[-5.5px] mi:mr-0 mi:mb-0 mi:ml-[-5.5px] mi:rounded-[50%] mi:bg-p mi:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ left: '100%', top: m.lastTop + '%' }" />
              </div>
              <figcaption class="mi:relative mi:h-3.5 mi:mr-13 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
                <span class="mi:absolute mi:top-0 mi:transform-[translateX(-50%)] mi:[&:first-child]:transform-none mi:[&:last-child]:transform-[translateX(-100%)]" v-for="w in [0, 4, 8, 11]" :key="w" :style="{ left: (w / 11) * 100 + '%' }">{{ weeks[w] }}</span>
              </figcaption>
            </figure>

            <div class="mi:grid mi:gap-3 mi:content-start mi:pt-0.5 mi:@[760px]:pl-6 mi:@[760px]:border-l mi:@[760px]:border-l-sep">
              <MiText variant="footnote" weight="semibold" as="h3">By segment, week 39</MiText>
              <ul class="mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
                <li v-for="s in m.segs" :key="s.label" class="mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:gap-y-1.5 mi:gap-x-3 mi:items-baseline">
                  <span class="mi:text-[13px] mi:text-label2">{{ s.label }}</span>
                  <span class="mi:text-[14px] mi:font-650 mi:tabular-nums" :class="s.tone === 'good' ? 'mi:text-green-t' : s.tone === 'bad' ? 'mi:text-orange-t' : ''">{{ s.text }}</span>
                  <span class="mi:relative mi:col-span-full mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)]" aria-hidden="true">
                    <span class="mi:absolute mi:top-0 mi:bottom-0 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-p)_30%,_transparent)]" :style="{ left: m.segBand[0] + '%', right: 100 - m.segBand[1] + '%' }" />
                    <i class="mi:absolute mi:top-1/2 mi:w-2.5 mi:h-2.5 mi:mt-[-5px] mi:mr-0 mi:mb-0 mi:ml-[-5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)]" :class="s.tone === 'in' ? 'mi:bg-p' : s.tone === 'good' ? 'mi:bg-green' : 'mi:bg-orange'" :style="{ left: s.pos + '%' }" />
                  </span>
                </li>
              </ul>
              <MiText variant="footnote" tone="label2" class="mi:pt-3 mi:border-t mi:border-t-sep mi:text-pretty">{{ m.note }}</MiText>
            </div>
          </div>
        </Transition>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Tone = 'in' | 'good' | 'bad'
interface Metric {
  id: string, label: string, unit: '%' | ' mo', better: 'up' | 'down', band: [number, number],
  values: number[], segments: { label: string, value: number }[], note: string
}

const weeks = ['W28', 'W29', 'W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38', 'W39']

// Sample data: twelve weekly readings per metric and the latest week split by segment.
const metrics: Metric[] = [
  {
    id: 'nrr', label: 'Net revenue retention', unit: '%', better: 'up', band: [104, 110],
    values: [103.2, 104.1, 105.0, 105.8, 106.4, 107.1, 106.8, 107.9, 108.6, 109.4, 110.3, 111.2],
    segments: [{ label: 'Self-serve', value: 98.4 }, { label: 'Mid-market', value: 109.2 }, { label: 'Enterprise', value: 118.6 }],
    note: 'Enterprise seat true-ups in weeks 36 to 38 carry the quarter. Self-serve still contracts.'
  },
  {
    id: 'cac', label: 'CAC payback', unit: ' mo', better: 'down', band: [12, 16],
    values: [15.1, 15.8, 16.4, 17.2, 17.9, 18.3, 18.0, 17.6, 17.1, 16.8, 16.6, 16.9],
    segments: [{ label: 'Self-serve', value: 11.2 }, { label: 'Mid-market', value: 15.9 }, { label: 'Enterprise', value: 23.4 }],
    note: 'Enterprise payback stretched after two field hires began ramping in week 31. Self-serve alone sits inside the band.'
  },
  {
    id: 'gm', label: 'Gross margin', unit: '%', better: 'up', band: [72, 76],
    values: [73.1, 73.4, 72.8, 73.9, 74.2, 74.0, 74.6, 75.1, 74.8, 75.3, 75.0, 75.4],
    segments: [{ label: 'Self-serve', value: 77.8 }, { label: 'Mid-market', value: 75.6 }, { label: 'Enterprise', value: 72.1 }],
    note: 'The hosting renegotiation in week 33 added about a point. Enterprise SSO support keeps that segment at the floor.'
  },
  {
    id: 'act', label: 'Trial activation', unit: '%', better: 'up', band: [38, 44],
    values: [36.2, 36.8, 37.5, 38.1, 37.9, 38.8, 39.6, 40.2, 39.8, 41.0, 41.6, 42.3],
    segments: [{ label: 'Self-serve', value: 46.1 }, { label: 'Mid-market', value: 41.3 }, { label: 'Enterprise', value: 33.0 }],
    note: 'The import wizard shipped in week 34 lifted self-serve. Enterprise trials wait on SCIM provisioning.'
  }
]

const open = ref<number | null>(1)
const toggle = (i: number) => { open.value = open.value === i ? null : i }

const fmt = (m: Metric, v: number) => `${v.toFixed(1)}${m.unit}`
const tone = (m: Metric, v: number): Tone => {
  if (v >= m.band[0] && v <= m.band[1]) return 'in'
  const above = v > m.band[1]
  return above === (m.better === 'up') ? 'good' : 'bad'
}
const statusOf = (m: Metric, v: number) => {
  const t = tone(m, v)
  if (t === 'in') return 'In band'
  return t === 'good' ? 'Ahead of plan' : 'Off target'
}

const view = computed(() => metrics.map((m) => {
  const n = m.values.length
  const lo = Math.min(...m.values, m.band[0])
  const hi = Math.max(...m.values, m.band[1])
  const pad = (hi - lo) * 0.22
  const d0 = lo - pad
  const d1 = hi + pad
  const y = (v: number) => 40 - ((v - d0) / (d1 - d0)) * 40
  const x = (i: number) => (i / (n - 1)) * 100
  const pts = m.values.map((v, i) => `${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
  const path = 'M' + pts.join(' L')
  const lastV = m.values[n - 1] ?? 0
  const t = tone(m, lastV)

  // Segment strip shares one scale across the three segments and the band.
  const sLo = Math.min(...m.segments.map(s => s.value), m.band[0])
  const sHi = Math.max(...m.segments.map(s => s.value), m.band[1])
  const sPad = (sHi - sLo) * 0.12
  const sx = (v: number) => ((v - (sLo - sPad)) / ((sHi + sPad) - (sLo - sPad))) * 100

  const weeksIn = m.values.filter(v => tone(m, v) === 'in').length
  return {
    id: m.id,
    label: m.label,
    note: m.note,
    now: fmt(m, lastV),
    tone: t,
    status: statusOf(m, lastV),
    weeksIn,
    bandText: `${m.band[0]}–${m.band[1]}${m.unit}`,
    bandTop: fmt(m, m.band[1]),
    bandBottom: fmt(m, m.band[0]),
    bandY: y(m.band[1]),
    bandH: y(m.band[0]) - y(m.band[1]),
    path,
    area: `${path} L100 40 L0 40 Z`,
    lastTop: (y(lastV) / 40) * 100,
    outside: m.values.map((v, i) => ({ i, v, t: tone(m, v) }))
      .filter(p => p.t !== 'in' && p.i < n - 1)
      .map(p => ({ i: p.i, good: p.t === 'good', left: x(p.i), top: (y(p.v) / 40) * 100 })),
    summary: `${m.label} over 12 weeks, from ${fmt(m, m.values[0] ?? 0)} to ${fmt(m, lastV)}, `
      + `${weeksIn} of ${n} weeks inside the ${m.band[0]} to ${m.band[1]}${m.unit} target band. ${statusOf(m, lastV)}.`,
    segBand: [sx(m.band[0]), sx(m.band[1])] as [number, number],
    segs: m.segments.map(s => ({ label: s.label, text: fmt(m, s.value), tone: tone(m, s.value), pos: sx(s.value) }))
  }
}))
</script>
