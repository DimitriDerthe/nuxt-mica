<template>
  <section class="ktb" aria-labelledby="ktb-title">
    <header class="ktb__head">
      <div class="ktb__intro">
        <MiText id="ktb-title" variant="title3" as="h2" weight="semibold">Unit economics against plan</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · weeks 28 to 39 · bands are the FY26 targets set by finance</MiText>
      </div>
      <div class="ktb__key" aria-hidden="true">
        <span><i class="ktb__key-band" />Target band</span>
        <span><i class="ktb__key-dot is-good" />Better than band</span>
        <span><i class="ktb__key-dot is-bad" />Off target</span>
      </div>
    </header>

    <div class="ktb__grid" :class="{ 'has-open': open !== null }">
      <article
        v-for="(m, i) in view" :key="m.id" class="ktb__card" :class="{ 'is-open': open === i }"
        :aria-labelledby="`ktb-btn-${m.id}`"
      >
        <button
          :id="`ktb-btn-${m.id}`" type="button" class="ktb__toggle" :aria-expanded="open === i"
          :aria-controls="`ktb-panel-${m.id}`" @click="toggle(i)"
        >
          <span class="ktb__label">{{ m.label }}</span>
          <span class="ktb__top">
            <span class="ktb__value">{{ m.now }}</span>
            <span class="ktb__status" :class="`is-${m.tone}`">{{ m.status }}</span>
          </span>
          <span class="ktb__sub">
            <span>Target {{ m.bandText }}</span>
            <span class="ktb__weeks">{{ m.weeksIn }} of {{ weeks.length }} weeks in band</span>
          </span>
          <MiIcon name="chevron-down" :size="16" class="ktb__chev" />
        </button>

        <!-- Compact view: the sparkline over its target band. -->
        <div v-if="open !== i" class="ktb__spark" role="img" :aria-label="m.summary">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" :y="m.bandY" width="100" :height="m.bandH" class="ktb__band" />
            <line x1="0" x2="100" :y1="m.bandY" :y2="m.bandY" class="ktb__edge" />
            <line x1="0" x2="100" :y1="m.bandY + m.bandH" :y2="m.bandY + m.bandH" class="ktb__edge" />
            <path :d="m.path" class="ktb__line" />
          </svg>
          <i
            v-for="p in m.outside" :key="p.i" class="ktb__pt" :class="p.good ? 'is-good' : 'is-bad'"
            :style="{ left: p.left + '%', top: p.top + '%' }"
          />
          <i class="ktb__pt is-now" :style="{ left: '100%', top: m.lastTop + '%' }" />
        </div>

        <!-- Expanded view: the same picture, larger, with the segment breakdown. -->
        <Transition name="ktb-reveal">
          <div v-if="open === i" :id="`ktb-panel-${m.id}`" class="ktb__panel">
            <figure class="ktb__big">
              <div class="ktb__plot" role="img" :aria-label="m.summary">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                  <line v-for="g in [10, 20, 30]" :key="g" x1="0" x2="100" :y1="g" :y2="g" class="ktb__grid-line" />
                  <rect x="0" :y="m.bandY" width="100" :height="m.bandH" class="ktb__band" />
                  <line x1="0" x2="100" :y1="m.bandY" :y2="m.bandY" class="ktb__edge" />
                  <line x1="0" x2="100" :y1="m.bandY + m.bandH" :y2="m.bandY + m.bandH" class="ktb__edge" />
                  <path :d="m.area" class="ktb__area" />
                  <path :d="m.path" class="ktb__line is-big" />
                </svg>
                <span class="ktb__edge-label" :style="{ top: m.bandY * 2.5 + '%' }">{{ m.bandTop }}</span>
                <span class="ktb__edge-label" :style="{ top: (m.bandY + m.bandH) * 2.5 + '%' }">{{ m.bandBottom }}</span>
                <i
                  v-for="p in m.outside" :key="p.i" class="ktb__pt is-big" :class="p.good ? 'is-good' : 'is-bad'"
                  :style="{ left: p.left + '%', top: p.top + '%' }"
                />
                <i class="ktb__pt is-now is-big" :style="{ left: '100%', top: m.lastTop + '%' }" />
              </div>
              <figcaption class="ktb__axis" aria-hidden="true">
                <span v-for="w in [0, 4, 8, 11]" :key="w" :style="{ left: (w / 11) * 100 + '%' }">{{ weeks[w] }}</span>
              </figcaption>
            </figure>

            <div class="ktb__side">
              <MiText variant="footnote" weight="semibold" as="h3">By segment, week 39</MiText>
              <ul class="ktb__segs">
                <li v-for="s in m.segs" :key="s.label" class="ktb__seg">
                  <span class="ktb__seg-name">{{ s.label }}</span>
                  <span class="ktb__seg-val" :class="`is-${s.tone}`">{{ s.text }}</span>
                  <span class="ktb__range" aria-hidden="true">
                    <span class="ktb__range-band" :style="{ left: m.segBand[0] + '%', right: 100 - m.segBand[1] + '%' }" />
                    <i class="ktb__range-dot" :class="`is-${s.tone}`" :style="{ left: s.pos + '%' }" />
                  </span>
                </li>
              </ul>
              <MiText variant="footnote" tone="label2" class="ktb__note">{{ m.note }}</MiText>
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
.ktb { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.ktb__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 10px 20px; }
.ktb__intro { display: grid; gap: 2px; }
.ktb__key { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; color: var(--mi-label2); }
.ktb__key span { display: inline-flex; align-items: center; gap: 6px; }
.ktb__key-band { width: 16px; height: 10px; border-radius: 3px; background: color-mix(in srgb, var(--mi-p) 16%, transparent); box-shadow: inset 0 1px 0 color-mix(in srgb, var(--mi-p) 45%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--mi-p) 45%, transparent); }
.ktb__key-dot { width: 8px; height: 8px; border-radius: 50%; }
.ktb__key-dot.is-good, .ktb__pt.is-good { background: var(--mi-green); }
.ktb__key-dot.is-bad, .ktb__pt.is-bad { background: var(--mi-orange); }

.ktb__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) {
  .ktb__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-flow: row dense; }
  .ktb__grid.has-open { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ktb__card.is-open { grid-column: 1 / -1; }
}
@container (min-width: 960px) {
  .ktb__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

.ktb__card {
  position: relative; display: grid; gap: 14px; align-content: start; min-width: 0; padding: 16px 16px 18px;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
/* Hover lift drawn by a pre-rendered shadow layer, faded with opacity only. */
.ktb__card::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; box-shadow: var(--mi-sh2);
  opacity: 0; transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.ktb__card:not(.is-open):hover::after { opacity: 1; }
.ktb__card.is-open { gap: 18px; padding: 18px 18px 20px; }
.ktb__card.is-open .ktb__chev { top: 20px; right: 18px; }

.ktb__toggle {
  display: grid; gap: 4px; justify-items: start; position: static; width: 100%; margin: 0; padding: 0 28px 0 0; border: 0;
  background: none; color: inherit; font: inherit; text-align: start; cursor: pointer; border-radius: var(--mi-radius-m);
}
.ktb__card:not(.is-open) .ktb__toggle::before { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: var(--mi-radius-xl); }
.ktb__toggle:focus-visible { outline: none; }
.ktb__toggle:focus-visible::before { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: var(--mi-radius-xl); box-shadow: 0 0 0 2px var(--mi-p); }
.ktb__chev { position: absolute; top: 18px; right: 16px; color: var(--mi-label3); transition: transform var(--mi-dur-3) var(--mi-ease); }
.ktb__card.is-open .ktb__chev { transform: rotate(180deg); color: var(--mi-label2); }

.ktb__top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 10px; margin-top: 6px; }
.ktb__label { max-width: 100%; font-size: 13px; font-weight: 600; color: var(--mi-label2); letter-spacing: -.005em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ktb__status { position: relative; top: -4px; padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 600; line-height: 16px; }
.ktb__status.is-in { color: var(--mi-p-text); background: var(--mi-p-tint); }
.ktb__status.is-good { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.ktb__status.is-bad { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 16%, transparent); }
.ktb__value { font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.ktb__card.is-open .ktb__value { font-size: 40px; }
.ktb__sub { display: grid; gap: 2px; margin-top: 6px; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.ktb__weeks { color: var(--mi-label2); opacity: .85; }
.ktb__card.is-open .ktb__sub { display: flex; flex-wrap: wrap; gap: 2px 14px; }

.ktb__spark { position: relative; height: 54px; margin: 0 3px; }
.ktb__spark svg, .ktb__plot svg { display: block; width: 100%; height: 100%; overflow: visible; }
.ktb__band { fill: color-mix(in srgb, var(--mi-p) 13%, transparent); }
.ktb__edge { stroke: color-mix(in srgb, var(--mi-p) 42%, transparent); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.ktb__line { fill: none; stroke: var(--mi-label); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.ktb__line.is-big { stroke-width: 2; }
.ktb__area { fill: color-mix(in srgb, var(--mi-label) 5%, transparent); }
.ktb__grid-line { stroke: var(--mi-sep); stroke-width: 1; vector-effect: non-scaling-stroke; }
.ktb__pt { position: absolute; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px; border-radius: 50%; box-shadow: 0 0 0 2px var(--mi-card); }
.ktb__pt.is-now { width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; background: var(--mi-p); }
.ktb__pt.is-big { width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; }
.ktb__pt.is-now.is-big { width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; }

.ktb__panel { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .ktb__panel { grid-template-columns: minmax(0, 1fr) minmax(240px, 300px); gap: 28px; } }
.ktb__big { display: grid; gap: 8px; margin: 0; min-width: 0; }
.ktb__plot { position: relative; height: 168px; margin-right: 52px; }
.ktb__edge-label {
  position: absolute; left: calc(100% + 10px); transform: translateY(-50%); font-size: 11px; font-weight: 600; color: var(--mi-p-text);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.ktb__axis { position: relative; height: 14px; margin-right: 52px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.ktb__axis span { position: absolute; top: 0; transform: translateX(-50%); }
.ktb__axis span:first-child { transform: none; }
.ktb__axis span:last-child { transform: translateX(-100%); }

.ktb__side { display: grid; gap: 12px; align-content: start; padding-top: 2px; }
@container (min-width: 760px) { .ktb__side { padding-left: 24px; border-left: 1px solid var(--mi-sep); } }
.ktb__segs { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.ktb__seg { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px 12px; align-items: baseline; }
.ktb__seg-name { font-size: 13px; color: var(--mi-label2); }
.ktb__seg-val { font-size: 14px; font-weight: 650; font-variant-numeric: tabular-nums; }
.ktb__seg-val.is-good { color: var(--mi-green-t); }
.ktb__seg-val.is-bad { color: var(--mi-orange-t); }
.ktb__range { position: relative; grid-column: 1 / -1; height: 6px; border-radius: 3px; background: var(--mi-fill3); }
.ktb__range-band { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: color-mix(in srgb, var(--mi-p) 30%, transparent); }
.ktb__range-dot { position: absolute; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%; background: var(--mi-label); box-shadow: 0 0 0 2px var(--mi-card); }
.ktb__range-dot.is-in { background: var(--mi-p); }
.ktb__range-dot.is-good { background: var(--mi-green); }
.ktb__range-dot.is-bad { background: var(--mi-orange); }
.ktb__note { padding-top: 12px; border-top: 1px solid var(--mi-sep); text-wrap: pretty; }

.ktb-reveal-enter-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.ktb-reveal-enter-from { opacity: 0; transform: translateY(6px); }
@media (prefers-reduced-motion: reduce) { .ktb-reveal-enter-active, .ktb__chev, .ktb__card::after { transition: none; } }
</style>
