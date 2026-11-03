<template>
  <section class="ktb mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="ktb-title">
    <header class="ktb__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-2.5 mi:gap-x-5">
      <div class="ktb__intro mi:grid mi:gap-0.5">
        <MiText id="ktb-title" variant="title3" as="h2" weight="semibold">Unit economics against plan</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · weeks 28 to 39 · bands are the FY26 targets set by finance</MiText>
      </div>
      <div class="ktb__key mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-4 mi:text-[12px] mi:text-label2" aria-hidden="true">
        <span class="mi:[.ktb__key_&]:inline-flex mi:[.ktb__key_&]:items-center mi:[.ktb__key_&]:gap-1.5"><i class="ktb__key-band mi:w-4 mi:h-2.5 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-p)_16%,_transparent)] mi:shadow-[inset_0_1px_0_color-mix(in_srgb,_var(--mi-p)_45%,_transparent),_inset_0_-1px_0_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)]" />Target band</span>
        <span class="mi:[.ktb__key_&]:inline-flex mi:[.ktb__key_&]:items-center mi:[.ktb__key_&]:gap-1.5"><i class="ktb__key-dot is-good mi:w-2 mi:h-2 mi:rounded-[50%] mi:[&.is-good]:[background:var(--mi-green)] mi:[&.is-bad]:[background:var(--mi-orange)]" />Better than band</span>
        <span class="mi:[.ktb__key_&]:inline-flex mi:[.ktb__key_&]:items-center mi:[.ktb__key_&]:gap-1.5"><i class="ktb__key-dot is-bad mi:w-2 mi:h-2 mi:rounded-[50%] mi:[&.is-good]:[background:var(--mi-green)] mi:[&.is-bad]:[background:var(--mi-orange)]" />Off target</span>
      </div>
    </header>

    <div class="ktb__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-2 mi:@[560px]:grid-flow-row-dense mi:@[560px]:[&.has-open]:grid-cols-3 mi:@[960px]:grid-cols-4" :class="{ 'has-open': open !== null }">
      <article
        v-for="(m, i) in view" :key="m.id" class="ktb__card mi:@[560px]:[&.is-open]:col-span-full mi:relative mi:grid mi:gap-3.5 mi:content-start mi:min-w-0 mi:pt-4 mi:px-4 mi:pb-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-2 mi:after:opacity-0 mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:not(.is-open):hover]:after:opacity-100 mi:[&.is-open]:gap-4.5 mi:[&.is-open]:pt-4.5 mi:[&.is-open]:px-4.5 mi:[&.is-open]:pb-5 mi:motion-reduce:after:[transition:none]" :class="{ 'is-open': open === i }"
        :aria-labelledby="`ktb-btn-${m.id}`"
      >
        <button
          :id="`ktb-btn-${m.id}`" type="button" class="ktb__toggle mi:grid mi:gap-1 mi:justify-items-start mi:static mi:w-full mi:m-0 mi:pt-0 mi:pr-7 mi:pb-0 mi:pl-0 mi:[border:0] mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:rounded-md mi:[.ktb__card:not(.is-open)_&]:before:content-[''] mi:[.ktb__card:not(.is-open)_&]:before:absolute mi:[.ktb__card:not(.is-open)_&]:before:inset-0 mi:[.ktb__card:not(.is-open)_&]:before:z-1 mi:[.ktb__card:not(.is-open)_&]:before:rounded-xl mi:focus-visible:[outline:none] mi:focus-visible:before:content-[''] mi:focus-visible:before:absolute mi:focus-visible:before:inset-0 mi:focus-visible:before:z-1 mi:focus-visible:before:rounded-xl mi:focus-visible:before:shadow-[0_0_0_2px_var(--mi-p)]" :aria-expanded="open === i"
          :aria-controls="`ktb-panel-${m.id}`" @click="toggle(i)"
        >
          <span class="ktb__label mi:max-w-full mi:text-[13px] mi:font-semibold mi:text-label2 mi:tracking-[-.005em] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ m.label }}</span>
          <span class="ktb__top mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1.5 mi:gap-x-2.5 mi:mt-1.5">
            <span class="ktb__value mi:text-[30px] mi:leading-none mi:font-bold mi:tracking-[-.035em] mi:tabular-nums mi:[.ktb__card.is-open_&]:text-[40px]">{{ m.now }}</span>
            <span class="ktb__status mi:relative mi:-top-1 mi:py-0.5 mi:px-[7px] mi:rounded-[999px] mi:text-[11px] mi:font-semibold mi:leading-4" :class="`is-${m.tone}`">{{ m.status }}</span>
          </span>
          <span class="ktb__sub mi:grid mi:gap-0.5 mi:mt-1.5 mi:text-[12px] mi:text-label2 mi:tabular-nums mi:[.ktb__card.is-open_&]:flex mi:[.ktb__card.is-open_&]:flex-wrap mi:[.ktb__card.is-open_&]:gap-y-0.5 mi:[.ktb__card.is-open_&]:gap-x-3.5">
            <span>Target {{ m.bandText }}</span>
            <span class="ktb__weeks mi:text-label2 mi:opacity-85">{{ m.weeksIn }} of {{ weeks.length }} weeks in band</span>
          </span>
          <MiIcon name="chevron-down" :size="16" class="ktb__chev mi:[.ktb__card.is-open_&]:top-5 mi:[.ktb__card.is-open_&]:right-4.5 mi:absolute mi:top-4.5 mi:right-4 mi:text-label3 mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:[.ktb__card.is-open_&]:text-label2 mi:motion-reduce:[transition:none]" />
        </button>

        <!-- Compact view: the sparkline over its target band. -->
        <div v-if="open !== i" class="ktb__spark mi:relative mi:h-13.5 mi:my-0 mi:mx-[3px]" role="img" :aria-label="m.summary">
          <svg class="mi:[.ktb__spark_&]:block mi:[.ktb__spark_&]:w-full mi:[.ktb__spark_&]:h-full mi:[.ktb__spark_&]:overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" :y="m.bandY" width="100" :height="m.bandH" class="ktb__band mi:fill-p/13" />
            <line x1="0" x2="100" :y1="m.bandY" :y2="m.bandY" class="ktb__edge mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
            <line x1="0" x2="100" :y1="m.bandY + m.bandH" :y2="m.bandY + m.bandH" class="ktb__edge mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
            <path :d="m.path" class="ktb__line mi:fill-[color:none] mi:stroke-label mi:[stroke-width:1.6] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[&.is-big]:[stroke-width:2]" />
          </svg>
          <i
            v-for="p in m.outside" :key="p.i" class="ktb__pt mi:absolute mi:w-[7px] mi:h-[7px] mi:mt-[-3.5px] mi:mr-0 mi:mb-0 mi:ml-[-3.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:[&.is-now]:[background:var(--mi-p)]" :class="p.good ? 'is-good' : 'is-bad'"
            :style="{ left: p.left + '%', top: p.top + '%' }"
          />
          <i class="ktb__pt is-now mi:absolute mi:w-[7px] mi:h-[7px] mi:mt-[-3.5px] mi:mr-0 mi:mb-0 mi:ml-[-3.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:[&.is-now]:[background:var(--mi-p)]" :style="{ left: '100%', top: m.lastTop + '%' }" />
        </div>

        <!-- Expanded view: the same picture, larger, with the segment breakdown. -->
        <Transition name="ktb-reveal">
          <div v-if="open === i" :id="`ktb-panel-${m.id}`" class="ktb__panel mi:grid mi:gap-5 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(240px,_300px)] mi:@[760px]:gap-7">
            <figure class="ktb__big mi:grid mi:gap-2 mi:m-0 mi:min-w-0">
              <div class="ktb__plot mi:relative mi:h-42 mi:mr-13" role="img" :aria-label="m.summary">
                <svg class="mi:[.ktb__plot_&]:block mi:[.ktb__plot_&]:w-full mi:[.ktb__plot_&]:h-full mi:[.ktb__plot_&]:overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                  <line v-for="g in [10, 20, 30]" :key="g" x1="0" x2="100" :y1="g" :y2="g" class="ktb__grid-line mi:stroke-sep mi:[stroke-width:1] mi:[vector-effect:non-scaling-stroke]" />
                  <rect x="0" :y="m.bandY" width="100" :height="m.bandH" class="ktb__band mi:fill-p/13" />
                  <line x1="0" x2="100" :y1="m.bandY" :y2="m.bandY" class="ktb__edge mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
                  <line x1="0" x2="100" :y1="m.bandY + m.bandH" :y2="m.bandY + m.bandH" class="ktb__edge mi:stroke-p/42 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
                  <path :d="m.area" class="ktb__area mi:fill-label/5" />
                  <path :d="m.path" class="ktb__line is-big mi:fill-[color:none] mi:stroke-label mi:[stroke-width:1.6] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[&.is-big]:[stroke-width:2]" />
                </svg>
                <span class="ktb__edge-label mi:absolute mi:left-[calc(100%_+_10px)] mi:transform-[translateY(-50%)] mi:text-[11px] mi:font-semibold mi:text-p-text mi:tabular-nums mi:whitespace-nowrap" :style="{ top: m.bandY * 2.5 + '%' }">{{ m.bandTop }}</span>
                <span class="ktb__edge-label mi:absolute mi:left-[calc(100%_+_10px)] mi:transform-[translateY(-50%)] mi:text-[11px] mi:font-semibold mi:text-p-text mi:tabular-nums mi:whitespace-nowrap" :style="{ top: (m.bandY + m.bandH) * 2.5 + '%' }">{{ m.bandBottom }}</span>
                <i
                  v-for="p in m.outside" :key="p.i" class="ktb__pt is-big mi:absolute mi:w-[7px] mi:h-[7px] mi:mt-[-3.5px] mi:mr-0 mi:mb-0 mi:ml-[-3.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:[&.is-now]:[background:var(--mi-p)]" :class="p.good ? 'is-good' : 'is-bad'"
                  :style="{ left: p.left + '%', top: p.top + '%' }"
                />
                <i class="ktb__pt is-now is-big mi:absolute mi:w-[7px] mi:h-[7px] mi:mt-[-3.5px] mi:mr-0 mi:mb-0 mi:ml-[-3.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:[&.is-now]:[background:var(--mi-p)]" :style="{ left: '100%', top: m.lastTop + '%' }" />
              </div>
              <figcaption class="ktb__axis mi:relative mi:h-3.5 mi:mr-13 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
                <span class="mi:[.ktb__axis_&]:absolute mi:[.ktb__axis_&]:top-0 mi:[.ktb__axis_&]:transform-[translateX(-50%)] mi:[.ktb__axis_&:first-child]:transform-none mi:[.ktb__axis_&:last-child]:transform-[translateX(-100%)]" v-for="w in [0, 4, 8, 11]" :key="w" :style="{ left: (w / 11) * 100 + '%' }">{{ weeks[w] }}</span>
              </figcaption>
            </figure>

            <div class="ktb__side mi:grid mi:gap-3 mi:content-start mi:pt-0.5 mi:@[760px]:pl-6 mi:@[760px]:border-l mi:@[760px]:border-l-sep">
              <MiText variant="footnote" weight="semibold" as="h3">By segment, week 39</MiText>
              <ul class="ktb__segs mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
                <li v-for="s in m.segs" :key="s.label" class="ktb__seg mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:gap-y-1.5 mi:gap-x-3 mi:items-baseline">
                  <span class="ktb__seg-name mi:text-[13px] mi:text-label2">{{ s.label }}</span>
                  <span class="ktb__seg-val mi:text-[14px] mi:font-650 mi:tabular-nums" :class="`is-${s.tone}`">{{ s.text }}</span>
                  <span class="ktb__range mi:relative mi:col-span-full mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)]" aria-hidden="true">
                    <span class="ktb__range-band mi:absolute mi:top-0 mi:bottom-0 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-p)_30%,_transparent)]" :style="{ left: m.segBand[0] + '%', right: 100 - m.segBand[1] + '%' }" />
                    <i class="ktb__range-dot mi:absolute mi:top-1/2 mi:w-2.5 mi:h-2.5 mi:mt-[-5px] mi:mr-0 mi:mb-0 mi:ml-[-5px] mi:rounded-[50%] mi:[background:var(--mi-label)] mi:shadow-[0_0_0_2px_var(--mi-card)]" :class="`is-${s.tone}`" :style="{ left: s.pos + '%' }" />
                  </span>
                </li>
              </ul>
              <MiText variant="footnote" tone="label2" class="ktb__note mi:pt-3 mi:border-t mi:border-t-sep">{{ m.note }}</MiText>
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

<style scoped>
.ktb__pt.is-good { background: var(--mi-green); }
.ktb__pt.is-bad { background: var(--mi-orange); }
.ktb__card.is-open .ktb__chev { transform: rotate(180deg); }
.ktb__status.is-in { color: var(--mi-p-text); background: var(--mi-p-tint); }
.ktb__status.is-good { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.ktb__status.is-bad { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 16%, transparent); }
.ktb__pt.is-now { width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; }
.ktb__pt.is-big { width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; }
.ktb__pt.is-now.is-big { width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; }
.ktb__seg-val.is-good { color: var(--mi-green-t); }
.ktb__seg-val.is-bad { color: var(--mi-orange-t); }
.ktb__range-dot.is-in { background: var(--mi-p); }
.ktb__range-dot.is-good { background: var(--mi-green); }
.ktb__range-dot.is-bad { background: var(--mi-orange); }
.ktb__note { text-wrap: pretty; }

.ktb-reveal-enter-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.ktb-reveal-enter-from { opacity: 0; transform: translateY(6px); }
@media (prefers-reduced-motion: reduce) { .ktb-reveal-enter-active { transition: none; } }
</style>
