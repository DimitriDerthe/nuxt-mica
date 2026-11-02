<template>
  <header class="rb" aria-labelledby="rb-title">
    <div class="rb__inner">
      <div class="rb__top">
        <div class="rb__heading">
          <MiText as="p" variant="caption" tone="label2" weight="medium" class="rb__eyebrow">Storefront · Checkout</MiText>
          <MiText id="rb-title" as="h2" variant="title2" weight="bold">Revenue</MiText>
          <MiText as="p" variant="footnote" tone="label2" tabular class="rb__range" aria-live="polite">
            {{ dateLabel(a) }} – {{ dateLabel(b) }}, 2026 <span aria-hidden="true">·</span> {{ len }} days{{ preset === null ? ' · custom' : '' }}
          </MiText>
        </div>
        <div class="rb__actions">
          <MiSegmented :model-value="preset" label="Range preset" :options="presets" @update:model-value="applyPreset" />
          <MiIconButton size="toolbar" variant="plain" label="Export range"><MiIcon name="share" :size="17" /></MiIconButton>
        </div>
      </div>

      <!-- Figures follow the brushed range and compare with the period just before it. -->
      <dl class="rb__figs">
        <div v-for="f in figures" :key="f.label" class="rb__fig">
          <dt>{{ f.label }}</dt>
          <dd>
            <span class="rb__val">{{ f.value }}</span>
            <span v-if="f.delta" class="rb__delta" :class="f.good ? 'is-good' : 'is-bad'">
              <MiIcon :name="f.up ? 'arrow-up' : 'arrow-down'" :size="11" :weight="2.4" />{{ f.delta }}
            </span>
            <span v-else class="rb__delta is-none">no prior period</span>
          </dd>
        </div>
      </dl>

      <!-- Brush: drag the handles or the window; arrows nudge by a day, Page keys by a week. -->
      <div class="rb__brush">
        <div ref="trackEl" class="rb__track">
          <svg class="rb__chart" :viewBox="`0 0 ${N - 1} 100`" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <clipPath id="rb-clip"><rect :x="a" y="0" :width="Math.max(b - a, 0.01)" height="100" /></clipPath>
              <linearGradient id="rb-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style="stop-color: var(--mi-p); stop-opacity: .28" />
                <stop offset="1" style="stop-color: var(--mi-p); stop-opacity: 0" />
              </linearGradient>
            </defs>
            <path :d="areaPath" class="rb__area-muted" />
            <path :d="linePath" class="rb__line-muted" />
            <g clip-path="url(#rb-clip)">
              <path :d="areaPath" fill="url(#rb-fill)" />
              <path :d="linePath" class="rb__line" />
            </g>
          </svg>

          <div
            class="rb__win" :style="{ transform: `translateX(${(a / (N - 1)) * 100}%) scaleX(${(b - a) / (N - 1)})` }"
            role="slider" tabindex="0" aria-label="Move the whole range" :aria-valuemin="0" :aria-valuemax="N - 1 - (b - a)" :aria-valuenow="a"
            :aria-valuetext="`${dateLabel(a)} to ${dateLabel(b)}`" @pointerdown="start($event, 'win')" @keydown="nudge($event, 'win')"
          />
          <div v-for="h in (['a', 'b'] as const)" :key="h" class="rb__hpos" :style="{ transform: `translateX(${((h === 'a' ? a : b) / (N - 1)) * width}px)` }">
            <span
              class="rb__handle" role="slider" tabindex="0" :aria-label="h === 'a' ? 'Range start' : 'Range end'"
              :aria-valuemin="h === 'a' ? 0 : a + MIN - 1" :aria-valuemax="h === 'a' ? b - MIN + 1 : N - 1" :aria-valuenow="h === 'a' ? a : b"
              :aria-valuetext="dateLabel(h === 'a' ? a : b)" @pointerdown="start($event, h)" @keydown="nudge($event, h)"
            ><i /><i /></span>
          </div>
        </div>
        <ol class="rb__ticks" aria-hidden="true">
          <li v-for="t in ticks" :key="t.i" :style="{ left: (t.i / (N - 1)) * 100 + '%' }">{{ t.label }}</li>
        </ol>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// 120 days of checkout data ending Nov 1, 2026; deterministic so server and client agree.
const N = 120
const MIN = 3
const start0 = Date.UTC(2026, 6, 5)
const DAY = 86400000
let seed = 7
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
const days = Array.from({ length: N }, (_, i) => {
  const dow = new Date(start0 + i * DAY).getUTCDay()
  const weekly = dow === 0 || dow === 6 ? 1.18 : dow === 1 ? 0.92 : 1
  const season = 1 + i / N * 0.32 + (i > 96 && i < 104 ? 0.35 : 0)
  const sessions = Math.round(9800 * weekly * season * (0.9 + rand() * 0.2))
  const orders = Math.round(sessions * (0.026 + rand() * 0.006 + i / N * 0.004))
  const revenue = orders * (58 + rand() * 9 + i / N * 4)
  return { sessions, orders, revenue }
})

const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const dateLabel = (i: number) => fmtDate.format(new Date(start0 + i * DAY))
const ticks = Array.from({ length: N }, (_, i) => i).filter(i => i < N - 8 && new Date(start0 + i * DAY).getUTCDate() === 1)
  .map(i => ({ i, label: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(new Date(start0 + i * DAY)) }))

const a = ref(N - 30)
const b = ref(N - 1)
const len = computed(() => b.value - a.value + 1)

const presets = [{ value: 7, label: '7D' }, { value: 30, label: '30D' }, { value: 90, label: '90D' }, { value: N, label: 'All' }]
const preset = computed(() => (b.value === N - 1 && presets.some(p => p.value === len.value) ? len.value : null))
function applyPreset(v: string | number | null) {
  if (typeof v !== 'number') return
  b.value = N - 1
  a.value = N - v
}

// Chart paths in day units on x, 0-100 on y.
const max = Math.max(...days.map(d => d.revenue)) * 1.06
const min = Math.min(...days.map(d => d.revenue)) * 0.8
const pts = days.map((d, i) => `${i},${(100 - ((d.revenue - min) / (max - min)) * 100).toFixed(2)}`)
const linePath = `M${pts.join('L')}`
const areaPath = `${linePath}L${N - 1},100L0,100Z`

function sum(from: number, to: number) {
  let revenue = 0, orders = 0, sessions = 0
  for (let i = from; i <= to; i++) { revenue += days[i]!.revenue; orders += days[i]!.orders; sessions += days[i]!.sessions }
  return { revenue, orders, sessions, conv: orders / sessions, aov: revenue / orders }
}
const eur = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', notation: v >= 1e6 ? 'compact' : 'standard', maximumFractionDigits: v >= 1e6 ? 2 : 0 }).format(v)
const int = (v: number) => new Intl.NumberFormat('en-US').format(v)
const pct = (v: number) => `${(Math.abs(v) * 100).toFixed(1)}%`

const figures = computed(() => {
  const cur = sum(a.value, b.value)
  const pa = a.value - len.value
  const prev = pa >= 0 ? sum(pa, a.value - 1) : null
  const rel = (k: 'revenue' | 'orders' | 'aov') => (prev ? cur[k] / prev[k] - 1 : 0)
  const convPt = prev ? (cur.conv - prev.conv) * 100 : 0
  return [
    { label: 'Revenue', value: eur(cur.revenue), delta: prev ? pct(rel('revenue')) : '', up: rel('revenue') >= 0, good: rel('revenue') >= 0 },
    { label: 'Orders', value: int(cur.orders), delta: prev ? pct(rel('orders')) : '', up: rel('orders') >= 0, good: rel('orders') >= 0 },
    { label: 'Conversion', value: `${(cur.conv * 100).toFixed(2)}%`, delta: prev ? `${Math.abs(convPt).toFixed(2)} pt` : '', up: convPt >= 0, good: convPt >= 0 },
    { label: 'Avg. order', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(cur.aov), delta: prev ? pct(rel('aov')) : '', up: rel('aov') >= 0, good: rel('aov') >= 0 }
  ]
})

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
function set(which: 'a' | 'b' | 'win', v: number) {
  if (which === 'a') a.value = clamp(v, 0, b.value - MIN + 1)
  else if (which === 'b') b.value = clamp(v, a.value + MIN - 1, N - 1)
  else {
    const span = b.value - a.value
    a.value = clamp(v, 0, N - 1 - span)
    b.value = a.value + span
  }
}

// Track width comes from a ResizeObserver, so dragging never reads layout.
const trackEl = ref<HTMLElement>()
const width = ref(1)
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(([e]) => { width.value = Math.max(1, e?.contentRect.width ?? 1) })
  if (trackEl.value) ro.observe(trackEl.value)
})
onBeforeUnmount(() => ro?.disconnect())

function start(e: PointerEvent, which: 'a' | 'b' | 'win') {
  const el = e.currentTarget as HTMLElement
  el.setPointerCapture(e.pointerId)
  el.focus()
  const x0 = e.clientX
  const v0 = which === 'b' ? b.value : a.value
  const move = (ev: PointerEvent) => set(which, v0 + Math.round(((ev.clientX - x0) / width.value) * (N - 1)))
  const end = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', end); el.removeEventListener('pointercancel', end) }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', end)
  el.addEventListener('pointercancel', end)
}
function nudge(e: KeyboardEvent, which: 'a' | 'b' | 'win') {
  const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -7, PageUp: 7 }[e.key]
  if (!step) return
  e.preventDefault()
  set(which, (which === 'b' ? b.value : a.value) + step)
}
</script>

<style scoped>
.rb { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.rb__inner {
  display: grid; gap: 22px; padding: 18px 16px 14px; border-radius: 22px;
  background: var(--mi-card); box-shadow: var(--mi-sh2);
}

.rb__top { display: grid; gap: 14px; }
.rb__heading { display: grid; gap: 2px; min-width: 0; }
.rb__eyebrow { letter-spacing: .02em; }
.rb__range { margin-top: 2px; }
.rb__range span { padding: 0 3px; color: var(--mi-label3); }
.rb__actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

.rb__figs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; margin: 0; border-radius: 16px; box-shadow: inset 0 0 0 1px var(--mi-sep); }
.rb__fig { display: grid; gap: 6px; min-width: 0; padding: 12px 14px; }
.rb__fig:nth-child(n + 3) { border-top: 1px solid var(--mi-sep); }
.rb__fig:nth-child(even) { border-left: 1px solid var(--mi-sep); }
.rb__fig dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.rb__fig dd { display: grid; gap: 4px; margin: 0; }
.rb__val { font-size: 22px; font-weight: 700; line-height: 1.1; letter-spacing: -.03em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rb__delta { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.rb__delta.is-good { color: var(--mi-green-t); }
.rb__delta.is-bad { color: var(--mi-red-t); }
.rb__delta.is-none { color: var(--mi-label3); font-weight: 500; }

.rb__brush { display: grid; gap: 6px; padding: 2px 6px 0; }
.rb__track { position: relative; height: 72px; touch-action: none; }
.rb__chart { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.rb__area-muted { fill: var(--mi-fill4); }
.rb__line-muted { fill: none; stroke: var(--mi-label3); stroke-width: 1.25; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
.rb__line { fill: none; stroke: var(--mi-p); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-linejoin: round; }

.rb__win {
  position: absolute; inset: -4px 0; transform-origin: left; cursor: grab; outline: none;
  background: color-mix(in srgb, var(--mi-p) 7%, transparent);
  border-block: 1px solid color-mix(in srgb, var(--mi-p) 35%, transparent);
}
.rb__win:active { cursor: grabbing; }
.rb__win:focus-visible { background: color-mix(in srgb, var(--mi-p) 14%, transparent); }
.rb__hpos { position: absolute; top: -4px; bottom: -4px; left: 0; width: 0; pointer-events: none; }
.rb__handle {
  position: absolute; top: 50%; left: 0; display: flex; align-items: center; justify-content: center; gap: 2px;
  width: 12px; height: 34px; margin: -17px 0 0 -6px; border-radius: 6px; pointer-events: auto; cursor: ew-resize; touch-action: none;
  background: var(--mi-elev); box-shadow: var(--mi-sh2), inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 45%, transparent);
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.rb__handle::before { content: ""; position: absolute; inset: -10px -6px; }
.rb__handle i { width: 1.5px; height: 12px; border-radius: 1px; background: var(--mi-label3); }
.rb__handle:hover, .rb__handle:active { transform: scaleY(1.1); }
.rb__handle:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.rb__ticks { position: relative; height: 16px; margin: 0; padding: 0; list-style: none; }
.rb__ticks li { position: absolute; top: 0; padding-left: 5px; font-size: 11px; color: var(--mi-label3); border-left: 1px solid var(--mi-sep); line-height: 16px; }

@container (min-width: 620px) {
  .rb__inner { padding: 22px 24px 16px; }
  .rb__top { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
  .rb__actions { justify-content: flex-end; }
  .rb__figs { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .rb__fig:nth-child(n + 3) { border-top: 0; }
  .rb__fig + .rb__fig { border-left: 1px solid var(--mi-sep); }
  .rb__fig { padding: 14px 18px; }
  .rb__track { height: 84px; }
}
@container (min-width: 960px) {
  .rb__inner { padding: 26px 30px 18px; }
  .rb__val { font-size: 26px; }
  .rb__fig dd { grid-auto-flow: column; justify-content: start; align-items: baseline; gap: 10px; }
}
</style>
