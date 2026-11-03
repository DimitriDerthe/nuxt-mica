<template>
  <section class="sca mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="sca-title">
    <header class="sca__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div class="sca__intro mi:grid mi:gap-0.5">
        <MiText id="sca-title" variant="title3" as="h2" weight="semibold">Sign-ups by first-touch channel</MiText>
        <MiText variant="footnote" tone="label2">Driftwood · trials started, Nov 2025 to Oct 2026</MiText>
      </div>
      <MiSegmented v-model="mode" label="Scale" :options="modes" />
    </header>

    <div class="sca__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[860px]:grid-cols-[minmax(0,_1fr)_300px]">
      <article class="sca__panel mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:grid mi:gap-4.5 mi:content-start mi:pt-5 mi:pr-5 mi:pb-3.5 mi:pl-3">
        <div class="sca__now mi:grid mi:gap-1 mi:pl-2">
          <p class="sca__big mi:m-0 mi:text-[clamp(30px,_6cqi,_40px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ total(idx).toLocaleString('en-US') }}</p>
          <MiText variant="footnote" tone="label2" tabular>
            sign-ups in {{ monthsLong[idx] }}<template v-if="idx > 0">, {{ growth >= 0 ? '+' : '−' }}{{ Math.abs(growth).toFixed(1) }}% on November</template>
          </MiText>
        </div>
        <div class="sca__chart mi:grid mi:grid-cols-[38px_minmax(0,_1fr)] mi:gap-x-2.5">
          <div class="sca__yaxis mi:relative mi:h-70 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
            <div class="sca__ticks mi:absolute mi:inset-0 mi:opacity-0 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-shown]:opacity-100 mi:motion-reduce:[transition:none]" :class="{ 'is-shown': !isShare }">
              <span class="mi:[.sca__ticks_&]:right-0 mi:[.sca__ticks_&]:transform-[translateY(-50%)]" v-for="t in absTicks" :key="t" :style="{ top: (1 - t / absTop) * 100 + '%' }">{{ short(t) }}</span>
            </div>
            <div class="sca__ticks mi:absolute mi:inset-0 mi:opacity-0 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-shown]:opacity-100 mi:motion-reduce:[transition:none]" :class="{ 'is-shown': isShare }">
              <span class="mi:[.sca__ticks_&]:right-0 mi:[.sca__ticks_&]:transform-[translateY(-50%)]" v-for="t in [0, 25, 50, 75, 100]" :key="t" :style="{ top: (100 - t) + '%' }">{{ t }}%</span>
            </div>
          </div>

          <div
            class="sca__plot mi:relative mi:h-70 mi:overflow-x-clip mi:rounded-[4px] mi:[outline:none] mi:touch-pan-y mi:focus-visible:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-p)]" tabindex="0" role="slider" aria-label="Month" aria-valuemin="0" :aria-valuemax="months.length - 1"
            :aria-valuenow="idx" :aria-valuetext="valueText" aria-describedby="sca-summary" @keydown="onKey"
          >
            <svg class="mi:[.sca__plot_&]:block mi:[.sca__plot_&]:h-full" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              <line v-for="t in [0, 75, 150, 225]" :key="t" x1="0" x2="1000" :y1="t" :y2="t" class="sca__gridline mi:stroke-sep mi:[stroke-width:1] mi:[vector-effect:non-scaling-stroke]" />
              <!-- Both scales are drawn once; switching crossfades the layers. -->
              <g v-for="layer in layers" :key="layer.id" class="sca__layer mi:opacity-0 mi:[transition:opacity_var(--mi-dur-4)_var(--mi-ease)] mi:[&.is-shown]:opacity-100 mi:motion-reduce:[transition:none]" :class="{ 'is-shown': layer.id === (isShare ? 'share' : 'abs') }">
                <path
                  v-for="(d, c) in layer.paths" :key="c" :d="d" class="sca__band mi:stroke-card mi:[stroke-width:1.25] mi:[stroke-linejoin:round] mi:[vector-effect:non-scaling-stroke] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-dim]:opacity-28 mi:motion-reduce:[transition:none]"
                  :class="{ 'is-dim': focus !== null && focus !== c }" :style="{ fill: channels[c]?.color }"
                />
              </g>
            </svg>
            <div class="sca__hits mi:absolute mi:inset-0 mi:flex" aria-hidden="true">
              <span class="mi:[.sca__hits_&]:flex-[1_1_0]" v-for="(m, i) in months" :key="m" @pointerenter="idx = i" />
            </div>
            <div class="sca__cursor mi:absolute mi:inset-0 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" aria-hidden="true" :style="{ transform: `translateX(${(idx / (months.length - 1)) * 100}%)` }"><i class="mi:[.sca__cursor_&]:-left-px mi:[.sca__cursor_&]:top-0 mi:[.sca__cursor_&]:bottom-0 mi:[.sca__cursor_&]:rounded-[1px] mi:[.sca__cursor_&]:[background:var(--mi-label)] mi:[.sca__cursor_&]:opacity-70" /></div>
          </div>

          <div class="sca__xaxis mi:relative mi:col-[2] mi:h-4.5 mi:mt-2 mi:text-[11px] mi:text-label3" aria-hidden="true">
            <span class="mi:[.sca__xaxis_&]:top-0 mi:[.sca__xaxis_&]:transform-[translateX(-50%)] mi:[.sca__xaxis_&:first-child]:transform-none mi:[.sca__xaxis_&:last-child]:transform-[translateX(-100%)]" v-for="(m, i) in months" :key="m" :class="{ 'is-on': i === idx, 'is-minor mi:[.sca__xaxis_&:not(.is-on)]:opacity-0 mi:@[620px]:[.sca__xaxis_&:not(.is-on)]:opacity-100': i !== idx && (i % 2 === 1 || Math.abs(i - idx) === 1) }" :style="{ left: (i / (months.length - 1)) * 100 + '%' }">{{ m }}</span>
          </div>
        </div>
        <p id="sca-summary" class="sca__sr mi:absolute mi:w-px mi:h-px mi:m-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ summary }}</p>
      </article>

      <aside class="sca__side mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:grid mi:gap-3.5 mi:content-start mi:pt-4.5 mi:px-4.5 mi:pb-4" aria-labelledby="sca-side-title">
        <div class="sca__side-top mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-0.5 mi:gap-x-2.5">
          <MiText id="sca-side-title" variant="subheadline" weight="semibold" as="h3">Share in {{ monthsLong[idx] }}</MiText>
        </div>
        <ul class="sca__shares mi:grid mi:gap-0.5 mi:my-0 mi:-mx-2 mi:p-0 mi:[list-style:none] mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:grid-cols-2 mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:gap-x-4">
          <li v-for="r in rows" :key="r.name">
            <button
              type="button" class="sca__row mi:grid mi:grid-cols-[10px_minmax(0,_1fr)_auto] mi:items-center mi:gap-y-1 mi:gap-x-2.5 mi:w-full mi:p-2 mi:[border:0] mi:rounded-md mi:[background:none] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[&.is-on]:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-on': focus === r.c }" :aria-pressed="pinned === r.c"
              @pointerenter="hoverCh = r.c" @pointerleave="hoverCh = null" @focus="hoverCh = r.c" @blur="hoverCh = null"
              @click="pinned = pinned === r.c ? null : r.c"
            >
              <i class="sca__sw mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]" :style="{ background: r.color }" aria-hidden="true" />
              <span class="sca__name mi:text-[13px] mi:font-550 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ r.name }}</span>
              <span class="sca__share mi:text-[15px] mi:font-bold mi:tracking-[-.01em] mi:tabular-nums">{{ r.share.toFixed(1) }}%</span>
              <span class="sca__track mi:col-[2_/_-1] mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill4)] mi:overflow-hidden" aria-hidden="true"><span class="mi:[.sca__track_&]:block mi:[.sca__track_&]:h-full mi:[.sca__track_&]:rounded-[inherit] mi:[.sca__track_&]:origin-left mi:[.sca__track_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[.sca__track_&]:[transition:none]" :style="{ transform: `scaleX(${r.share / 50})`, background: r.color }" /></span>
              <span class="sca__shift mi:col-[2_/_-1] mi:text-[11px] mi:text-label3 mi:tabular-nums mi:[&.is-up]:text-label2" :class="r.shift >= 0 ? 'is-up' : 'is-down'">{{ r.shift >= 0 ? '+' : '−' }}{{ Math.abs(r.shift).toFixed(1) }} pt since Nov</span>
            </button>
          </li>
        </ul>
        <p class="sca__callout mi:flex mi:gap-2 mi:m-0 mi:pt-3 mi:border-t mi:border-t-sep mi:text-[12px] mi:leading-[1.45] mi:text-label2 mi:text-pretty">
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
.sca__ticks span { position: absolute; }
.sca__plot svg { width: 100%; }
.sca__hits span:first-child, .sca__hits span:last-child { flex-grow: .5; }
.sca__cursor i { position: absolute; width: 2px; }
.sca__xaxis span { position: absolute; }
.sca__xaxis span.is-on { color: var(--mi-label); font-weight: 650; }
.sca__row:hover { background: var(--mi-fill4); }
.sca__row[aria-pressed="true"] { background: var(--mi-p-tint); }
.sca__callout :deep(svg) { flex: none; margin-top: 1px; color: var(--mi-p-text); }
</style>
