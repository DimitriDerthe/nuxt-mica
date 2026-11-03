<template>
  <section class="upc mi:@container/upc mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="upc-title">
    <header class="upc__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3.5 mi:gap-x-6">
      <div class="upc__intro mi:grid mi:gap-1.5 mi:max-w-135">
        <MiText id="upc-title" as="h2" variant="title2" weight="bold" balance>Pay for what you track</MiText>
        <MiText variant="subheadline" tone="label2">Signalbox bills events, editors and replay storage separately. Rates drop as volume grows.</MiText>
      </div>
      <div class="upc__presets mi:flex mi:flex-wrap mi:gap-1 mi:p-[3px] mi:rounded-[12px] mi:[background:var(--mi-fill4)]" role="group" aria-label="Start from a typical team">
        <button v-for="p in presets" :key="p.label" type="button" class="upc__preset mi:py-1.5 mi:px-[11px] mi:[border:0] mi:rounded-[9px] mi:text-label2 mi:[background:transparent] mi:cursor-pointer mi:aria-pressed:[background:var(--mi-card)] mi:aria-pressed:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :aria-pressed="isPreset(p)" @click="apply(p)">{{ p.label }}</button>
      </div>
    </header>

    <div class="upc__layout mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[740px]/upc:grid-cols-[minmax(0,_1.15fr)_minmax(0,_1fr)] mi:@[740px]/upc:gap-5">
      <div class="upc__inputs mi:grid mi:gap-1 mi:py-2 mi:px-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div v-for="l in lines" :key="l.id" class="upc__input mi:grid mi:gap-1.5 mi:pt-4 mi:px-0 mi:pb-4.5 mi:[.upc__input+&]:border-t mi:[.upc__input+&]:border-t-sep">
          <MiSlider
            v-model="model[l.id]" :min="0" :max="l.max" :step="l.step" :label="l.label" :format="l.fmt"
            :tone="l.id === 'seats' ? 'secondary' : 'primary'"
          />
          <!-- Tier rail: bands and breakpoints where the rate changes, aligned with the slider track. -->
          <div class="upc__rail mi:relative mi:h-6.5 mi:mt-0.5 mi:mx-0 mi:mb-0" aria-hidden="true">
            <span
              v-for="(t, i) in l.tiers" :key="t.text" class="upc__band mi:absolute mi:top-0 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:[.upc__band+&]:ml-0.5 mi:[&.is-current]:[background:color-mix(in_srgb,_var(--mi-p)_50%,_transparent)]" :class="{ 'is-current mi:[.upc__rates_&]:before:w-1.5 mi:[.upc__rates_&]:before:h-1.5 mi:[.upc__rates_&]:before:rounded-[50%] mi:[.upc__rates_&]:before:[background:var(--mi-p)]': tierIndex(l) === i }"
              :style="{ left: pct(t.from, l.max), right: pct(l.max - (t.to ?? l.max), l.max) }"
            />
            <span
              v-for="t in l.tiers.slice(1)" :key="t.from" class="upc__mark mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:before:content-[''] mi:before:absolute mi:before:top-[-3px] mi:before:-left-px mi:before:w-0.5 mi:before:h-2.5 mi:before:rounded-[1px] mi:before:[background:var(--mi-label3)] mi:[&.is-passed]:before:[background:var(--mi-p)]" :class="{ 'is-passed': val(l.id) >= t.from, 'is-edge': t.from / l.max < 0.08 }"
              :style="{ left: pct(t.from, l.max) }"
            ><span class="mi:[.upc__mark_&]:absolute mi:[.upc__mark_&]:top-3 mi:[.upc__mark_&]:left-0 mi:[.upc__mark_&]:transform-[translateX(-50%)] mi:[.upc__mark_&]:whitespace-nowrap mi:[.upc__mark_&]:text-[11px] mi:[.upc__mark_&]:tabular-nums mi:[.upc__mark.is-edge_&]:transform-[translateX(-3px)]">{{ l.unit(t.from) }}</span></span>
          </div>
          <p class="upc__rates mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5 mi:m-0 mi:text-[12px] mi:text-label2 mi:tabular-nums">
            <span v-for="(t, i) in l.tiers" :key="t.text" :class="{ 'is-current mi:[.upc__rates_&]:before:w-1.5 mi:[.upc__rates_&]:before:h-1.5 mi:[.upc__rates_&]:before:rounded-[50%] mi:[.upc__rates_&]:before:[background:var(--mi-p)]': tierIndex(l) === i }">{{ t.text }}</span>
          </p>
        </div>
      </div>

      <aside class="upc__estimate mi:relative mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-2 mi:before:content-[''] mi:before:absolute mi:before:top-[-45%] mi:before:right-[-35%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[75%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)]" aria-labelledby="upc-est-title">
        <MiText id="upc-est-title" as="h3" variant="subheadline" weight="semibold" tone="label2">Estimated monthly bill</MiText>
        <p class="upc__total mi:flex mi:flex-wrap mi:items-baseline mi:gap-2 mi:-mt-1.5 mi:mx-0 mi:mb-0" aria-live="polite"><span class="mi:[.upc__total_&]:leading-none mi:[.upc__total_&]:tracking-[-.045em] mi:[.upc__total_&]:tabular-nums">{{ eur(total) }}</span><small>/ month, excl. VAT</small></p>

        <div class="upc__compare mi:grid mi:gap-2">
          <div class="upc__bar-row mi:grid mi:grid-cols-[52px_minmax(0,_1fr)_44px] mi:items-center mi:gap-2.5">
            <span class="upc__bar-label mi:text-[12px] mi:font-semibold mi:text-label2">Usage</span>
            <span class="upc__track mi:relative mi:h-3.5 mi:rounded-[7px] mi:[background:var(--mi-fill4)] mi:overflow-hidden" role="img" :aria-label="`Usage pricing ${eur(total)}`">
              <span
                v-for="s in segments" :key="s.id" class="upc__seg mi:absolute mi:inset-0 mi:[background:var(--upc-c)] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[&.is-flat]:[background:repeating-linear-gradient(135deg,_var(--mi-fill),_var(--mi-fill)_4px,_var(--mi-fill2)_4px,_var(--mi-fill2)_8px)] mi:[&.is-over]:opacity-45 mi:motion-reduce:[transition:none]" :style="{ '--upc-c': s.color, transform: `translateX(${s.offset * 100}%) scaleX(${s.share})` }"
              />
            </span>
            <span class="upc__bar-val mi:text-[12px] mi:font-650 mi:text-end mi:tabular-nums">{{ eur(total) }}</span>
          </div>
          <div class="upc__bar-row mi:grid mi:grid-cols-[52px_minmax(0,_1fr)_44px] mi:items-center mi:gap-2.5">
            <span class="upc__bar-label mi:text-[12px] mi:font-semibold mi:text-label2">Growth</span>
            <span class="upc__track mi:relative mi:h-3.5 mi:rounded-[7px] mi:[background:var(--mi-fill4)] mi:overflow-hidden" role="img" :aria-label="`Growth flat plan ${eur(flat.price)}`">
              <span class="upc__seg is-flat mi:absolute mi:inset-0 mi:[background:var(--upc-c)] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[&.is-flat]:[background:repeating-linear-gradient(135deg,_var(--mi-fill),_var(--mi-fill)_4px,_var(--mi-fill2)_4px,_var(--mi-fill2)_8px)] mi:[&.is-over]:opacity-45 mi:motion-reduce:[transition:none]" :class="{ 'is-over': overFlat.length }" :style="{ transform: `scaleX(${flat.price / scale})` }" />
            </span>
            <span class="upc__bar-val is-muted mi:text-[12px] mi:font-650 mi:text-end mi:tabular-nums">{{ eur(flat.price) }}</span>
          </div>
        </div>

        <ul class="upc__lines mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li class="mi:[.upc__lines_&]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[.upc__lines_&]:py-[9px] mi:[.upc__lines_&]:px-0" v-for="c in costs" :key="c.id">
            <span class="upc__dot mi:w-2 mi:h-2 mi:rounded-[3px] mi:transform-[translateY(-1px)]" :style="{ background: c.color }" aria-hidden="true" />
            <span class="upc__line-main mi:grid mi:gap-px mi:min-w-0">
              <span class="upc__line-name mi:text-[14px] mi:font-semibold mi:tabular-nums">{{ c.label }}</span>
              <span class="upc__line-how mi:text-[12px] mi:text-label2 mi:tabular-nums">{{ c.how }}</span>
            </span>
            <span class="upc__line-cost mi:text-[15px] mi:font-650 mi:tabular-nums">{{ eur(c.cost) }}</span>
          </li>
        </ul>

        <div class="upc__verdict mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-md mi:[background:var(--mi-fill4)] mi:[&.is-good]:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)] mi:[&.is-warn]:[background:color-mix(in_srgb,_var(--mi-orange)_12%,_transparent)]" :class="verdict.tone" aria-live="polite">
          <MiIcon :name="verdict.icon" :size="18" />
          <MiText as="span" variant="footnote">{{ verdict.text }}</MiText>
        </div>
        <MiButton block>Start with usage pricing</MiButton>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

type LineId = 'events' | 'seats' | 'storage'
interface Tier { from: number, to?: number, rate: number, label: string, text: string }
interface Line { id: LineId, label: string, max: number, step: number, color: string, fmt: (v: number) => string, unit: (v: number) => string, tiers: Tier[] }

const millions = (v: number) => `${Number.isInteger(v) ? v : v.toFixed(1)}M`
const lines: Line[] = [
  { id: 'events', label: 'Tracked events per month', max: 40, step: 0.5, color: 'var(--mi-p)',
    fmt: v => `${millions(v)} events`, unit: millions,
    tiers: [
      { from: 0, to: 1, rate: 0, label: 'Free', text: 'First 1M free' },
      { from: 1, to: 10, rate: 18, label: '€18 / M', text: '€18 per M to 10M' },
      { from: 10, rate: 11, label: '€11 / M', text: '€11 per M above' }
    ] },
  { id: 'seats', label: 'Editors', max: 60, step: 1, color: 'var(--mi-s)',
    fmt: v => `${v} ${v === 1 ? 'editor' : 'editors'}`, unit: v => `${v}`,
    tiers: [
      { from: 0, to: 5, rate: 0, label: 'Free', text: 'First 5 free' },
      { from: 5, rate: 8, label: '€8', text: '€8 per editor after' }
    ] },
  { id: 'storage', label: 'Session replay storage', max: 1000, step: 10, color: 'color-mix(in srgb, var(--mi-p) 40%, var(--mi-fill3))',
    fmt: v => `${v} GB`, unit: v => `${v} GB`,
    tiers: [
      { from: 0, to: 50, rate: 0, label: 'Free', text: 'First 50 GB free' },
      { from: 50, to: 500, rate: 0.14, label: '€0.14 / GB', text: '€0.14 per GB to 500 GB' },
      { from: 500, rate: 0.09, label: '€0.09 / GB', text: '€0.09 per GB above' }
    ] }
]
const flat = { name: 'Growth', price: 390, limits: { events: 15, seats: 25, storage: 500 } as Record<LineId, number> }

const model = reactive<Record<LineId, number | [number, number]>>({ events: 12.5, seats: 14, storage: 320 })
const val = (id: LineId) => { const v = model[id]; return Array.isArray(v) ? v[0] : v }

const presets = [
  { label: 'Side project', v: { events: 0.5, seats: 2, storage: 20 } },
  { label: 'Seed startup', v: { events: 12.5, seats: 14, storage: 320 } },
  { label: 'Scale-up', v: { events: 32, seats: 46, storage: 820 } }
]
const isPreset = (p: typeof presets[number]) => (Object.keys(p.v) as LineId[]).every(k => val(k) === p.v[k])
const apply = (p: typeof presets[number]) => Object.assign(model, p.v)

const pct = (v: number, max: number) => `${(v / max) * 100}%`
const tierIndex = (l: Line) => { const v = val(l.id); const i = l.tiers.findIndex(t => v <= (t.to ?? Infinity)); return i === -1 ? l.tiers.length - 1 : i }

// Tiered cost: each band is billed at its own rate.
function price(l: Line, v: number) {
  const parts: string[] = []
  let cost = 0
  for (const t of l.tiers) {
    const units = Math.max(0, Math.min(v, t.to ?? Infinity) - t.from)
    if (!units) continue
    cost += units * t.rate
    parts.push(t.rate ? `${l.unit(units)} × ${t.label}` : `${l.unit(units)} free`)
  }
  return { cost, how: parts.join(' + ') || 'Nothing used' }
}
const costs = computed(() => lines.map((l) => {
  const v = val(l.id)
  const p = price(l, v)
  return { id: l.id, label: l.fmt(v), color: l.color, cost: p.cost, how: p.how }
}))
const total = computed(() => costs.value.reduce((s, c) => s + c.cost, 0))
const scale = computed(() => Math.max(total.value, flat.price) * 1.04)
const segments = computed(() => {
  let offset = 0
  return costs.value.map((c) => {
    const share = c.cost / scale.value
    const seg = { id: c.id, color: c.color, offset, share }
    offset += share
    return seg
  })
})

const overFlat = computed(() => lines.filter(l => val(l.id) > flat.limits[l.id]))
const verdict = computed(() => {
  if (overFlat.value.length) {
    const l = overFlat.value[0]!
    return { tone: 'is-info', icon: 'info-circle' as const, text: `Growth caps ${l.label.toLowerCase()} at ${l.fmt(flat.limits[l.id])}, so usage pricing is the only fit here.` }
  }
  const diff = flat.price - total.value
  if (diff >= 0) return { tone: 'is-good', icon: 'check-circle' as const, text: `${eur(diff)} a month less than the Growth flat plan (${eur(flat.price)}).` }
  return { tone: 'is-warn', icon: 'warning' as const, text: `Growth flat is ${eur(-diff)} cheaper at this volume. We will suggest it on your first invoice.` }
})

const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const eur = (v: number) => fmt.format(Math.round(v))
</script>

<style scoped>
.upc__preset { font: inherit; font-size: 12px; font-weight: 600;
}
.upc__preset:hover { color: var(--mi-label); }
.upc__preset[aria-pressed="true"] { color: var(--mi-label); }
.upc__mark span { font-weight: 600; color: var(--mi-label3);
}
.upc__mark.is-passed span { color: var(--mi-label2); }
.upc__rates span { display: inline-flex; align-items: center; gap: 6px; }
.upc__rates span.is-current { font-weight: 600; color: var(--mi-p-text); }
.upc__rates span.is-current::before { content: ""; }
.upc__total span { font-size: clamp(40px, 8cqi, 56px); font-weight: 750; }
.upc__total small { font-size: 13px; color: var(--mi-label2); }
.upc__bar-val.is-muted { font-weight: 500; color: var(--mi-label2); }
.upc__lines li { display: grid; align-items: baseline; gap: 10px; }
.upc__lines li + li { border-top: 1px solid var(--mi-sep); }
.upc__verdict :deep(svg) { flex: none; margin-top: 1px; }
.upc__verdict.is-good :deep(svg) { color: var(--mi-green-t); }
.upc__verdict.is-warn :deep(svg) { color: var(--mi-orange-t); }
.upc__verdict.is-info :deep(svg) { color: var(--mi-p-text); }
</style>
