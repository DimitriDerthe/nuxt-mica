<template>
  <section class="upc" aria-labelledby="upc-title">
    <header class="upc__head">
      <div class="upc__intro">
        <MiText id="upc-title" as="h2" variant="title2" weight="bold" balance>Pay for what you track</MiText>
        <MiText variant="subheadline" tone="label2">Signalbox bills events, editors and replay storage separately. Rates drop as volume grows.</MiText>
      </div>
      <div class="upc__presets" role="group" aria-label="Start from a typical team">
        <button v-for="p in presets" :key="p.label" type="button" class="upc__preset" :aria-pressed="isPreset(p)" @click="apply(p)">{{ p.label }}</button>
      </div>
    </header>

    <div class="upc__layout">
      <div class="upc__inputs">
        <div v-for="l in lines" :key="l.id" class="upc__input">
          <MiSlider
            v-model="model[l.id]" :min="0" :max="l.max" :step="l.step" :label="l.label" :format="l.fmt"
            :tone="l.id === 'seats' ? 'secondary' : 'primary'"
          />
          <!-- Tier rail: bands and breakpoints where the rate changes, aligned with the slider track. -->
          <div class="upc__rail" aria-hidden="true">
            <span
              v-for="(t, i) in l.tiers" :key="t.text" class="upc__band" :class="{ 'is-current': tierIndex(l) === i }"
              :style="{ left: pct(t.from, l.max), right: pct(l.max - (t.to ?? l.max), l.max) }"
            />
            <span
              v-for="t in l.tiers.slice(1)" :key="t.from" class="upc__mark" :class="{ 'is-passed': val(l.id) >= t.from, 'is-edge': t.from / l.max < 0.08 }"
              :style="{ left: pct(t.from, l.max) }"
            ><span>{{ l.unit(t.from) }}</span></span>
          </div>
          <p class="upc__rates">
            <span v-for="(t, i) in l.tiers" :key="t.text" :class="{ 'is-current': tierIndex(l) === i }">{{ t.text }}</span>
          </p>
        </div>
      </div>

      <aside class="upc__estimate" aria-labelledby="upc-est-title">
        <MiText id="upc-est-title" as="h3" variant="subheadline" weight="semibold" tone="label2">Estimated monthly bill</MiText>
        <p class="upc__total" aria-live="polite"><span>{{ eur(total) }}</span><small>/ month, excl. VAT</small></p>

        <div class="upc__compare">
          <div class="upc__bar-row">
            <span class="upc__bar-label">Usage</span>
            <span class="upc__track" role="img" :aria-label="`Usage pricing ${eur(total)}`">
              <span
                v-for="s in segments" :key="s.id" class="upc__seg" :style="{ '--upc-c': s.color, transform: `translateX(${s.offset * 100}%) scaleX(${s.share})` }"
              />
            </span>
            <span class="upc__bar-val">{{ eur(total) }}</span>
          </div>
          <div class="upc__bar-row">
            <span class="upc__bar-label">Growth</span>
            <span class="upc__track" role="img" :aria-label="`Growth flat plan ${eur(flat.price)}`">
              <span class="upc__seg is-flat" :class="{ 'is-over': overFlat.length }" :style="{ transform: `scaleX(${flat.price / scale})` }" />
            </span>
            <span class="upc__bar-val is-muted">{{ eur(flat.price) }}</span>
          </div>
        </div>

        <ul class="upc__lines">
          <li v-for="c in costs" :key="c.id">
            <span class="upc__dot" :style="{ background: c.color }" aria-hidden="true" />
            <span class="upc__line-main">
              <span class="upc__line-name">{{ c.label }}</span>
              <span class="upc__line-how">{{ c.how }}</span>
            </span>
            <span class="upc__line-cost">{{ eur(c.cost) }}</span>
          </li>
        </ul>

        <div class="upc__verdict" :class="verdict.tone" aria-live="polite">
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
.upc { container: upc / inline-size; display: grid; align-content: start; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.upc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px 24px; }
.upc__intro { display: grid; gap: 6px; max-width: 540px; }
.upc__presets { display: flex; flex-wrap: wrap; gap: 4px; padding: 3px; border-radius: 12px; background: var(--mi-fill4); }
.upc__preset {
  padding: 6px 11px; border: 0; border-radius: 9px; font: inherit; font-size: 12px; font-weight: 600; color: var(--mi-label2); background: transparent; cursor: pointer;
}
.upc__preset:hover { color: var(--mi-label); }
.upc__preset[aria-pressed="true"] { color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.upc__preset:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

.upc__layout { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container upc (min-width: 740px) { .upc__layout { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 20px; } }

.upc__inputs { display: grid; gap: 4px; padding: 8px 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.upc__input { display: grid; gap: 6px; padding: 16px 0 18px; }
.upc__input + .upc__input { border-top: 1px solid var(--mi-sep); }
.upc__rail { position: relative; height: 26px; margin: 2px 0 0; }
.upc__band { position: absolute; top: 0; height: 4px; border-radius: 2px; background: var(--mi-fill3); }
.upc__band + .upc__band { margin-left: 2px; }
.upc__band.is-current { background: color-mix(in srgb, var(--mi-p) 50%, transparent); }
.upc__mark { position: absolute; top: 0; bottom: 0; width: 0; }
.upc__mark::before { content: ""; position: absolute; top: -3px; left: -1px; width: 2px; height: 10px; border-radius: 1px; background: var(--mi-label3); }
.upc__mark.is-passed::before { background: var(--mi-p); }
.upc__mark span {
  position: absolute; top: 12px; left: 0; transform: translateX(-50%); white-space: nowrap;
  font-size: 11px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums;
}
.upc__mark.is-edge span { transform: translateX(-3px); }
.upc__mark.is-passed span { color: var(--mi-label2); }
.upc__rates { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.upc__rates span { display: inline-flex; align-items: center; gap: 6px; }
.upc__rates span.is-current { font-weight: 600; color: var(--mi-p-text); }
.upc__rates span.is-current::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--mi-p); }

.upc__estimate {
  position: relative; display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-card); box-shadow: var(--mi-sh2);
}
.upc__estimate::before {
  content: ""; position: absolute; inset: -45% -35% auto auto; width: 75%; aspect-ratio: 1; z-index: -1; border-radius: 50%;
  background: radial-gradient(closest-side, var(--mi-p-tint), transparent);
}
.upc__total { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin: -6px 0 0; }
.upc__total span { font-size: clamp(40px, 8cqi, 56px); font-weight: 750; line-height: 1; letter-spacing: -.045em; font-variant-numeric: tabular-nums; }
.upc__total small { font-size: 13px; color: var(--mi-label2); }

.upc__compare { display: grid; gap: 8px; }
.upc__bar-row { display: grid; grid-template-columns: 52px minmax(0, 1fr) 44px; align-items: center; gap: 10px; }
.upc__bar-val { font-size: 12px; font-weight: 650; text-align: end; font-variant-numeric: tabular-nums; }
.upc__bar-val.is-muted { font-weight: 500; color: var(--mi-label2); }
.upc__bar-label { font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.upc__track { position: relative; height: 14px; border-radius: 7px; background: var(--mi-fill4); overflow: hidden; }
.upc__seg {
  position: absolute; inset: 0; background: var(--upc-c); transform-origin: left;
  transition: transform var(--mi-dur-4) var(--mi-spring);
}
.upc__seg.is-flat { background: repeating-linear-gradient(135deg, var(--mi-fill), var(--mi-fill) 4px, var(--mi-fill2) 4px, var(--mi-fill2) 8px); }
.upc__seg.is-over { opacity: .45; }

.upc__lines { display: grid; margin: 0; padding: 0; list-style: none; }
.upc__lines li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: baseline; gap: 10px; padding: 9px 0; }
.upc__lines li + li { border-top: 1px solid var(--mi-sep); }
.upc__dot { width: 8px; height: 8px; border-radius: 3px; transform: translateY(-1px); }
.upc__line-main { display: grid; gap: 1px; min-width: 0; }
.upc__line-name { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.upc__line-how { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.upc__line-cost { font-size: 15px; font-weight: 650; font-variant-numeric: tabular-nums; }

.upc__verdict { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.upc__verdict :deep(svg) { flex: none; margin-top: 1px; }
.upc__verdict.is-good { background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.upc__verdict.is-good :deep(svg) { color: var(--mi-green-t); }
.upc__verdict.is-warn { background: color-mix(in srgb, var(--mi-orange) 12%, transparent); }
.upc__verdict.is-warn :deep(svg) { color: var(--mi-orange-t); }
.upc__verdict.is-info :deep(svg) { color: var(--mi-p-text); }
@media (prefers-reduced-motion: reduce) { .upc__seg { transition: none; } }
</style>
