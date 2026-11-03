<template>
  <header class="rb mi:@container mi:font-mi mi:text-label" aria-labelledby="rb-title">
    <div class="rb__inner mi:grid mi:gap-5.5 mi:pt-4.5 mi:px-4 mi:pb-3.5 mi:rounded-[22px] mi:bg-card mi:shadow-2 mi:@[620px]:pt-5.5 mi:@[620px]:px-6 mi:@[620px]:pb-4 mi:@[960px]:pt-6.5 mi:@[960px]:px-7.5 mi:@[960px]:pb-4.5">
      <div class="rb__top mi:grid mi:gap-3.5 mi:@[620px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[620px]:items-end">
        <div class="rb__heading mi:grid mi:gap-0.5 mi:min-w-0">
          <MiText as="p" variant="caption" tone="label2" weight="medium" class="rb__eyebrow">Storefront · Checkout</MiText>
          <MiText id="rb-title" as="h2" variant="title2" weight="bold">Revenue</MiText>
          <MiText as="p" variant="footnote" tone="label2" tabular class="rb__range" aria-live="polite">
            {{ dateLabel(a) }} – {{ dateLabel(b) }}, 2026 <span class="mi:[.rb__range_&]:py-0 mi:[.rb__range_&]:px-[3px]" aria-hidden="true">·</span> {{ len }} days{{ preset === null ? ' · custom' : '' }}
          </MiText>
        </div>
        <div class="rb__actions mi:flex mi:items-center mi:justify-between mi:gap-2 mi:@[620px]:[justify-content:flex-end]">
          <MiSegmented :model-value="preset" label="Range preset" :options="presets" @update:model-value="applyPreset" />
          <MiIconButton size="toolbar" variant="plain" label="Export range"><MiIcon name="share" :size="17" /></MiIconButton>
        </div>
      </div>

      <!-- Figures follow the brushed range and compare with the period just before it. -->
      <dl class="rb__figs mi:grid mi:grid-cols-2 mi:gap-0 mi:m-0 mi:rounded-[16px] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:@[620px]:grid-cols-4">
        <div v-for="f in figures" :key="f.label" class="rb__fig mi:grid mi:gap-1.5 mi:min-w-0 mi:py-3 mi:px-3.5 mi:[&:nth-child(n+3)]:border-t mi:[&:nth-child(n+3)]:border-t-sep mi:even:border-l mi:even:border-l-sep mi:@[620px]:[&:nth-child(n+3)]:[border-top:0] mi:@[620px]:[.rb__fig+&]:border-l mi:@[620px]:[.rb__fig+&]:border-l-sep mi:@[620px]:py-3.5 mi:@[620px]:px-4.5">
          <dt class="mi:[.rb__fig_dt&]:font-medium">{{ f.label }}</dt>
          <dd class="mi:[.rb__fig_dd&]:gap-1 mi:[.rb__fig_dd&]:m-0 mi:@[960px]:[.rb__fig_dd&]:grid-flow-col mi:@[960px]:[.rb__fig_dd&]:justify-start mi:@[960px]:[.rb__fig_dd&]:items-baseline mi:@[960px]:[.rb__fig_dd&]:gap-2.5">
            <span class="rb__val mi:text-[22px] mi:font-bold mi:leading-[1.1] mi:tracking-[-.03em] mi:tabular-nums mi:whitespace-nowrap mi:@[960px]:text-[26px]">{{ f.value }}</span>
            <span v-if="f.delta" class="rb__delta mi:inline-flex mi:items-center mi:gap-0.5 mi:text-[12px] mi:font-semibold mi:tabular-nums mi:[&.is-none]:font-medium" :class="f.good ? 'is-good' : 'is-bad'">
              <MiIcon class="mi:[.rb__fig_dt&]:font-medium mi:[.rb__fig_dd&]:gap-1 mi:[.rb__fig_dd&]:m-0 mi:@[960px]:[.rb__fig_dd&]:grid-flow-col mi:@[960px]:[.rb__fig_dd&]:justify-start mi:@[960px]:[.rb__fig_dd&]:items-baseline mi:@[960px]:[.rb__fig_dd&]:gap-2.5" :name="f.up ? 'arrow-up' : 'arrow-down'" :size="11" :weight="2.4" />{{ f.delta }}
            </span>
            <span v-else class="rb__delta is-none mi:inline-flex mi:items-center mi:gap-0.5 mi:text-[12px] mi:font-semibold mi:tabular-nums mi:[&.is-none]:font-medium">no prior period</span>
          </dd>
        </div>
      </dl>

      <!-- Brush: drag the handles or the window; arrows nudge by a day, Page keys by a week. -->
      <div class="rb__brush mi:grid mi:gap-1.5 mi:pt-0.5 mi:px-1.5 mi:pb-0">
        <div ref="trackEl" class="rb__track mi:relative mi:h-18 mi:touch-none mi:@[620px]:h-21">
          <svg class="rb__chart mi:absolute mi:inset-0 mi:w-full mi:h-full mi:overflow-visible" :viewBox="`0 0 ${N - 1} 100`" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <clipPath id="rb-clip"><rect :x="a" y="0" :width="Math.max(b - a, 0.01)" height="100" /></clipPath>
              <linearGradient id="rb-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style="stop-color: var(--mi-p); stop-opacity: .28" />
                <stop offset="1" style="stop-color: var(--mi-p); stop-opacity: 0" />
              </linearGradient>
            </defs>
            <path :d="areaPath" class="rb__area-muted mi:fill-fill4" />
            <path :d="linePath" class="rb__line-muted mi:fill-[color:none] mi:stroke-label3 mi:[stroke-width:1.25] mi:[vector-effect:non-scaling-stroke] mi:[stroke-linejoin:round]" />
            <g clip-path="url(#rb-clip)">
              <path :d="areaPath" fill="url(#rb-fill)" />
              <path :d="linePath" class="rb__line mi:fill-[color:none] mi:stroke-p mi:[stroke-width:2] mi:[vector-effect:non-scaling-stroke] mi:[stroke-linejoin:round]" />
            </g>
          </svg>

          <div
            class="rb__win mi:absolute mi:-inset-y-1 mi:inset-x-0 mi:origin-left mi:cursor-grab mi:[outline:none] mi:[background:color-mix(in_srgb,_var(--mi-p)_7%,_transparent)] mi:[border-block:1px_solid_color-mix(in_srgb,_var(--mi-p)_35%,_transparent)] mi:active:cursor-grabbing mi:focus-visible:[background:color-mix(in_srgb,_var(--mi-p)_14%,_transparent)]" :style="{ transform: `translateX(${(a / (N - 1)) * 100}%) scaleX(${(b - a) / (N - 1)})` }"
            role="slider" tabindex="0" aria-label="Move the whole range" :aria-valuemin="0" :aria-valuemax="N - 1 - (b - a)" :aria-valuenow="a"
            :aria-valuetext="`${dateLabel(a)} to ${dateLabel(b)}`" @pointerdown="start($event, 'win')" @keydown="nudge($event, 'win')"
          />
          <div v-for="h in (['a', 'b'] as const)" :key="h" class="rb__hpos mi:absolute mi:-top-1 mi:-bottom-1 mi:left-0 mi:w-0 mi:pointer-events-none" :style="{ transform: `translateX(${((h === 'a' ? a : b) / (N - 1)) * width}px)` }">
            <span
              class="rb__handle mi:absolute mi:top-1/2 mi:left-0 mi:flex mi:items-center mi:justify-center mi:gap-0.5 mi:w-3 mi:h-8.5 mi:mt-[-17px] mi:mr-0 mi:mb-0 mi:-ml-1.5 mi:rounded-[6px] mi:pointer-events-auto mi:cursor-ew-resize mi:touch-none mi:bg-elev mi:shadow-[var(--mi-sh2),_inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:before:content-[''] mi:before:absolute mi:before:-inset-y-2.5 mi:before:-inset-x-1.5 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" role="slider" tabindex="0" :aria-label="h === 'a' ? 'Range start' : 'Range end'"
              :aria-valuemin="h === 'a' ? 0 : a + MIN - 1" :aria-valuemax="h === 'a' ? b - MIN + 1 : N - 1" :aria-valuenow="h === 'a' ? a : b"
              :aria-valuetext="dateLabel(h === 'a' ? a : b)" @pointerdown="start($event, h)" @keydown="nudge($event, h)"
            ><i class="mi:[.rb__handle_&]:w-[1.5px] mi:[.rb__handle_&]:h-3 mi:[.rb__handle_&]:rounded-[1px] mi:[.rb__handle_&]:bg-label3" /><i class="mi:[.rb__handle_&]:w-[1.5px] mi:[.rb__handle_&]:h-3 mi:[.rb__handle_&]:rounded-[1px] mi:[.rb__handle_&]:bg-label3" /></span>
          </div>
        </div>
        <ol class="rb__ticks mi:relative mi:h-4 mi:m-0 mi:p-0 mi:[list-style:none]" aria-hidden="true">
          <li class="mi:[.rb__ticks_&]:absolute mi:[.rb__ticks_&]:top-0 mi:[.rb__ticks_&]:pl-[5px] mi:[.rb__ticks_&]:border-l mi:[.rb__ticks_&]:border-l-sep mi:[.rb__ticks_&]:leading-4" v-for="t in ticks" :key="t.i" :style="{ left: (t.i / (N - 1)) * 100 + '%' }">{{ t.label }}</li>
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
.rb__eyebrow { letter-spacing: .02em; }
.rb__range { margin-top: 2px; }
.rb__range span { color: var(--mi-label3); }
.rb__fig dt { font-size: 12px; color: var(--mi-label2); }
.rb__fig dd { display: grid; }
.rb__delta.is-good { color: var(--mi-green-t); }
.rb__delta.is-bad { color: var(--mi-red-t); }
.rb__delta.is-none { color: var(--mi-label3); }
.rb__handle:hover, .rb__handle:active { transform: scaleY(1.1); }
.rb__ticks li { font-size: 11px; color: var(--mi-label3); }
</style>
