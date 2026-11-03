<template>
  <section class="sca" aria-labelledby="sca-title">
    <header class="sca__head">
      <div class="sca__intro">
        <MiText id="sca-title" variant="title3" as="h2" weight="semibold">Sign-ups by first-touch channel</MiText>
        <MiText variant="footnote" tone="label2">Driftwood · trials started, Nov 2025 to Oct 2026</MiText>
      </div>
      <MiSegmented v-model="mode" label="Scale" :options="modes" />
    </header>

    <div class="sca__grid">
      <article class="sca__panel">
        <div class="sca__now">
          <p class="sca__big">{{ total(idx).toLocaleString('en-US') }}</p>
          <MiText variant="footnote" tone="label2" tabular>
            sign-ups in {{ monthsLong[idx] }}<template v-if="idx > 0">, {{ growth >= 0 ? '+' : '−' }}{{ Math.abs(growth).toFixed(1) }}% on November</template>
          </MiText>
        </div>
        <div class="sca__chart">
          <div class="sca__yaxis" aria-hidden="true">
            <div class="sca__ticks" :class="{ 'is-shown': !isShare }">
              <span v-for="t in absTicks" :key="t" :style="{ top: (1 - t / absTop) * 100 + '%' }">{{ short(t) }}</span>
            </div>
            <div class="sca__ticks" :class="{ 'is-shown': isShare }">
              <span v-for="t in [0, 25, 50, 75, 100]" :key="t" :style="{ top: (100 - t) + '%' }">{{ t }}%</span>
            </div>
          </div>

          <div
            class="sca__plot" tabindex="0" role="slider" aria-label="Month" aria-valuemin="0" :aria-valuemax="months.length - 1"
            :aria-valuenow="idx" :aria-valuetext="valueText" aria-describedby="sca-summary" @keydown="onKey"
          >
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              <line v-for="t in [0, 75, 150, 225]" :key="t" x1="0" x2="1000" :y1="t" :y2="t" class="sca__gridline" />
              <!-- Both scales are drawn once; switching crossfades the layers. -->
              <g v-for="layer in layers" :key="layer.id" class="sca__layer" :class="{ 'is-shown': layer.id === (isShare ? 'share' : 'abs') }">
                <path
                  v-for="(d, c) in layer.paths" :key="c" :d="d" class="sca__band"
                  :class="{ 'is-dim': focus !== null && focus !== c }" :style="{ fill: channels[c]?.color }"
                />
              </g>
            </svg>
            <div class="sca__hits" aria-hidden="true">
              <span v-for="(m, i) in months" :key="m" @pointerenter="idx = i" />
            </div>
            <div class="sca__cursor" aria-hidden="true" :style="{ transform: `translateX(${(idx / (months.length - 1)) * 100}%)` }"><i /></div>
          </div>

          <div class="sca__xaxis" aria-hidden="true">
            <span v-for="(m, i) in months" :key="m" :class="{ 'is-on': i === idx, 'is-minor': i !== idx && (i % 2 === 1 || Math.abs(i - idx) === 1) }" :style="{ left: (i / (months.length - 1)) * 100 + '%' }">{{ m }}</span>
          </div>
        </div>
        <p id="sca-summary" class="sca__sr">{{ summary }}</p>
      </article>

      <aside class="sca__side" aria-labelledby="sca-side-title">
        <div class="sca__side-top">
          <MiText id="sca-side-title" variant="subheadline" weight="semibold" as="h3">Share in {{ monthsLong[idx] }}</MiText>
        </div>
        <ul class="sca__shares">
          <li v-for="r in rows" :key="r.name">
            <button
              type="button" class="sca__row" :class="{ 'is-on': focus === r.c }" :aria-pressed="pinned === r.c"
              @pointerenter="hoverCh = r.c" @pointerleave="hoverCh = null" @focus="hoverCh = r.c" @blur="hoverCh = null"
              @click="pinned = pinned === r.c ? null : r.c"
            >
              <i class="sca__sw" :style="{ background: r.color }" aria-hidden="true" />
              <span class="sca__name">{{ r.name }}</span>
              <span class="sca__share">{{ r.share.toFixed(1) }}%</span>
              <span class="sca__track" aria-hidden="true"><span :style="{ transform: `scaleX(${r.share / 50})`, background: r.color }" /></span>
              <span class="sca__shift" :class="r.shift >= 0 ? 'is-up' : 'is-down'">{{ r.shift >= 0 ? '+' : '−' }}{{ Math.abs(r.shift).toFixed(1) }} pt since Nov</span>
            </button>
          </li>
        </ul>
        <p class="sca__callout">
          <MiIcon name="info-circle" :size="15" />
          <span>Partner referrals went from {{ shareOf(0, 0).toFixed(1) }}% to {{ shareOf(0, months.length - 1).toFixed(1) }}% of sign-ups after the agency program opened in March.</span>
        </p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const modes = [{ value: 'abs', label: 'Absolute' }, { value: 'share', label: '100%' }]
const mode = ref<string | number | null>('abs')
const isShare = computed(() => mode.value === 'share')

const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const monthsLong = ['November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October']

// Bottom to top. The accent goes to the channel the story is about; context channels use a neutral ramp.
const channels = [
  { name: 'Partner referrals', color: 'var(--mi-p)', data: [210, 230, 260, 320, 380, 460, 540, 610, 690, 760, 820, 910] },
  { name: 'Organic search', color: 'color-mix(in srgb, var(--mi-label) 38%, var(--mi-card))', data: [1840, 1720, 1960, 2050, 2180, 2240, 2310, 2290, 2420, 2510, 2640, 2780] },
  { name: 'Direct', color: 'color-mix(in srgb, var(--mi-label) 27%, var(--mi-card))', data: [920, 880, 940, 980, 1010, 1040, 1080, 1060, 1110, 1150, 1190, 1240] },
  { name: 'Paid social', color: 'color-mix(in srgb, var(--mi-label) 18%, var(--mi-card))', data: [1200, 1350, 1280, 1180, 1100, 980, 1020, 1150, 1310, 1420, 1380, 1460] },
  { name: 'Email', color: 'color-mix(in srgb, var(--mi-label) 11%, var(--mi-card))', data: [380, 420, 360, 390, 410, 400, 420, 380, 430, 450, 470, 500] }
]

const v = (c: number, i: number) => channels[c]?.data[i] ?? 0
const total = (i: number) => channels.reduce((s, _, c) => s + v(c, i), 0)
const shareOf = (c: number, i: number) => (v(c, i) / total(i)) * 100
const short = (n: number) => n >= 1000 ? `${n / 1000}k` : String(n)

const absTop = computed(() => Math.ceil(Math.max(...months.map((_, i) => total(i))) / 2000) * 2000)
const absTicks = computed(() => [0, 1, 2, 3, 4].map(k => (absTop.value / 4) * k))

const stackPaths = (val: (c: number, i: number) => number, top: number) => {
  const x = (i: number) => ((i / (months.length - 1)) * 1000).toFixed(1)
  const y = (n: number) => (300 - (n / top) * 300).toFixed(1)
  const base = months.map(() => 0)
  return channels.map((_, c) => {
    const lower = [...base]
    const upper = base.map((b, i) => b + val(c, i))
    upper.forEach((u, i) => { base[i] = u })
    const fwd = upper.map((u, i) => `${x(i)} ${y(u)}`).join(' L')
    const back = lower.map((l, i) => `${x(i)} ${y(l)}`).reverse().join(' L')
    return `M${fwd} L${back} Z`
  })
}
const layers = computed(() => [
  { id: 'abs', paths: stackPaths(v, absTop.value) },
  { id: 'share', paths: stackPaths(shareOf, 100) }
])

const idx = ref(months.length - 1)
const hoverCh = ref<number | null>(null)
const pinned = ref<number | null>(null)
const focus = computed(() => hoverCh.value ?? pinned.value)

const rows = computed(() => channels.map((ch, c) => ({
  c, name: ch.name, color: ch.color, share: shareOf(c, idx.value), shift: shareOf(c, idx.value) - shareOf(c, 0)
})).reverse())

const growth = computed(() => (total(idx.value) / total(0) - 1) * 100)
const valueText = computed(() => `${monthsLong[idx.value]}: ${total(idx.value).toLocaleString('en-US')} sign-ups. `
  + rows.value.map(r => `${r.name} ${r.share.toFixed(1)}%`).join(', '))
const summary = computed(() => `Stacked ${isShare.value ? 'share' : 'count'} of monthly sign-ups by channel, ${months[0]} to ${months[months.length - 1]}. `
  + `Total grew from ${total(0).toLocaleString('en-US')} to ${total(months.length - 1).toLocaleString('en-US')}; partner referrals rose from ${shareOf(0, 0).toFixed(1)}% to ${shareOf(0, months.length - 1).toFixed(1)}% of the mix.`)

const onKey = (e: KeyboardEvent) => {
  const last = months.length - 1
  const next = { ArrowLeft: idx.value - 1, ArrowDown: idx.value - 1, ArrowRight: idx.value + 1, ArrowUp: idx.value + 1, Home: 0, End: last }[e.key]
  if (next === undefined) return
  e.preventDefault()
  idx.value = Math.min(last, Math.max(0, next))
}
</script>

<style scoped>
.sca { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.sca__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sca__intro { display: grid; gap: 2px; }
.sca__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 860px) { .sca__grid { grid-template-columns: minmax(0, 1fr) 300px; } }

.sca__panel, .sca__side { min-width: 0; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sca__panel { display: grid; gap: 18px; align-content: start; padding: 20px 20px 14px 12px; }
.sca__now { display: grid; gap: 4px; padding-left: 8px; }
.sca__big { margin: 0; font-size: clamp(30px, 6cqi, 40px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }

.sca__chart { display: grid; grid-template-columns: 38px minmax(0, 1fr); column-gap: 10px; }
.sca__yaxis { position: relative; height: 280px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.sca__ticks { position: absolute; inset: 0; opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.sca__ticks.is-shown { opacity: 1; }
.sca__ticks span { position: absolute; right: 0; transform: translateY(-50%); }
.sca__plot { position: relative; height: 280px; overflow-x: clip; border-radius: 4px; outline: none; touch-action: pan-y; }
.sca__plot:focus-visible { box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-p); }
.sca__plot svg { display: block; width: 100%; height: 100%; }
.sca__gridline { stroke: var(--mi-sep); stroke-width: 1; vector-effect: non-scaling-stroke; }
.sca__layer { opacity: 0; transition: opacity var(--mi-dur-4) var(--mi-ease); }
.sca__layer.is-shown { opacity: 1; }
.sca__band { stroke: var(--mi-card); stroke-width: 1.25; stroke-linejoin: round; vector-effect: non-scaling-stroke; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.sca__band.is-dim { opacity: .28; }

.sca__hits { position: absolute; inset: 0; display: flex; }
.sca__hits span { flex: 1 1 0; }
.sca__hits span:first-child, .sca__hits span:last-child { flex-grow: .5; }
.sca__cursor { position: absolute; inset: 0; pointer-events: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.sca__cursor i { position: absolute; left: -1px; top: 0; bottom: 0; width: 2px; border-radius: 1px; background: var(--mi-label); opacity: .7; }

.sca__xaxis { position: relative; grid-column: 2; height: 18px; margin-top: 8px; font-size: 11px; color: var(--mi-label3); }
.sca__xaxis span { position: absolute; top: 0; transform: translateX(-50%); }
.sca__xaxis span:first-child { transform: none; }
.sca__xaxis span:last-child { transform: translateX(-100%); }
.sca__xaxis span.is-on { color: var(--mi-label); font-weight: 650; }
.sca__xaxis span.is-minor:not(.is-on) { opacity: 0; }
@container (min-width: 620px) { .sca__xaxis span.is-minor:not(.is-on) { opacity: 1; } }

.sca__side { display: grid; gap: 14px; align-content: start; padding: 18px 18px 16px; }
.sca__side-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 10px; }
.sca__shares { display: grid; gap: 2px; margin: 0 -8px; padding: 0; list-style: none; }
@container (min-width: 560px) and (max-width: 859px) { .sca__shares { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; } }
.sca__row {
  display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; align-items: center; gap: 4px 10px; width: 100%; padding: 8px;
  border: 0; border-radius: var(--mi-radius-m); background: none; color: inherit; font: inherit; text-align: start; cursor: pointer;
}
.sca__row:hover, .sca__row.is-on { background: var(--mi-fill4); }
.sca__row[aria-pressed="true"] { background: var(--mi-p-tint); }
.sca__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.sca__sw { width: 10px; height: 10px; border-radius: 3px; box-shadow: inset 0 0 0 1px var(--mi-sep); }
.sca__name { font-size: 13px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sca__share { font-size: 15px; font-weight: 700; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
.sca__track { grid-column: 2 / -1; height: 4px; border-radius: 2px; background: var(--mi-fill4); overflow: hidden; }
.sca__track span { display: block; height: 100%; border-radius: inherit; transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.sca__shift { grid-column: 2 / -1; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.sca__shift.is-up { color: var(--mi-label2); }
.sca__callout { display: flex; gap: 8px; margin: 0; padding-top: 12px; border-top: 1px solid var(--mi-sep); font-size: 12px; line-height: 1.45; color: var(--mi-label2); text-wrap: pretty; }
.sca__callout :deep(svg) { flex: none; margin-top: 1px; color: var(--mi-p-text); }

.sca__sr { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) { .sca__ticks, .sca__layer, .sca__band, .sca__cursor, .sca__track span { transition: none; } }
</style>
