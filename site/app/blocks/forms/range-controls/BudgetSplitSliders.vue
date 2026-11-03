<template>
  <section class="bss" aria-labelledby="bss-title">
    <header class="bss__head">
      <div>
        <MiText id="bss-title" as="h2" variant="title3" weight="semibold">December ad budget</MiText>
        <MiText variant="footnote" tone="label2">Fernway Outdoor · {{ money(budget) }} to spread across channels</MiText>
      </div>
      <div class="bss__presets" role="group" aria-label="Budget presets">
        <MiButton v-for="p in presets" :key="p.label" variant="gray" size="small" @click="apply(p.split)">{{ p.label }}</MiButton>
      </div>
    </header>

    <div class="bss__body">
      <ul class="bss__channels">
        <li v-for="c in channels" :key="c.id" class="bss__channel">
          <div class="bss__line">
            <span class="bss__swatch" :style="{ background: c.color }" aria-hidden="true" />
            <MiText as="h3" variant="subheadline" weight="semibold">{{ c.label }}</MiText>
            <MiText variant="caption" tone="label2" tabular class="bss__leads">≈ {{ leadsOf(c) }} leads</MiText>
          </div>
          <MiSlider
            :model-value="c.spend" :min="0" :max="8000" :step="250" :aria-label="`${c.label} spend`"
            :format="money" show-value @update:model-value="set(c, $event)"
          />
        </li>
      </ul>

      <!-- Summary: the split as one bar, with whatever is left or over shown as its own slice. -->
      <aside class="bss__summary" aria-labelledby="bss-sum">
        <MiText id="bss-sum" as="h3" variant="subheadline" weight="semibold">Allocation</MiText>
        <MiStackedBar :segments="segments" :height="18" :legend-columns="1" :animate="false" :format-share="(pct: number) => `${Math.round(pct)}%`" />
        <dl class="bss__totals">
          <div><dt>Allocated</dt><dd>{{ money(allocated) }}</dd></div>
          <div><dt>Projected leads</dt><dd>{{ totalLeads.toLocaleString('en-US') }}</dd></div>
          <div><dt>Cost per lead</dt><dd>{{ totalLeads ? money(allocated / totalLeads) : '–' }}</dd></div>
        </dl>
        <p class="bss__state" :class="{ 'is-over': left < 0 }" role="status" aria-live="polite">
          {{ left < 0 ? `${money(-left)} over budget. Trim a channel to save.` : left > 0 ? `${money(left)} still unallocated.` : 'Every dollar is assigned.' }}
        </p>
        <MiButton block :disabled="left < 0">Save split</MiButton>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

type ChannelId = 'search' | 'social' | 'video' | 'sponsor'
interface Channel { id: ChannelId, label: string, color: string, spend: number, rate: number }

const budget = 12000
// `rate` is leads at $1,000; returns flatten with spend (square-root curve).
const channels = reactive<Channel[]>([
  { id: 'search', label: 'Search ads', color: 'var(--mi-p)', spend: 4500, rate: 62 },
  { id: 'social', label: 'Social ads', color: 'var(--mi-s)', spend: 3000, rate: 48 },
  { id: 'video', label: 'Video pre-roll', color: 'var(--mi-orange)', spend: 1500, rate: 30 },
  { id: 'sponsor', label: 'Newsletter sponsorships', color: 'var(--mi-green)', spend: 1000, rate: 55 }
])
const presets: { label: string, split: Record<ChannelId, number> }[] = [
  { label: 'Even split', split: { search: 3000, social: 3000, video: 3000, sponsor: 3000 } },
  { label: 'Like November', split: { search: 5000, social: 3500, video: 2000, sponsor: 1500 } }
]

function money(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }
const leadsOf = (c: Channel) => Math.round(c.rate * Math.sqrt(c.spend / 1000))

const allocated = computed(() => channels.reduce((s, c) => s + c.spend, 0))
const left = computed(() => budget - allocated.value)
const totalLeads = computed(() => channels.reduce((s, c) => s + leadsOf(c), 0))
const segments = computed(() => [
  ...channels.map(c => ({ label: c.label, value: c.spend, color: c.color })),
  { label: left.value < 0 ? 'Over budget' : 'Unallocated', value: Math.abs(left.value), color: left.value < 0 ? 'var(--mi-red)' : 'var(--mi-fill2)' }
])

function set(c: Channel, v: number | [number, number]) { c.spend = Array.isArray(v) ? v[1] : v }
function apply(split: Record<ChannelId, number>) { for (const c of channels) c.spend = split[c.id] }
</script>

<style scoped>
.bss { container: bss / inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.bss__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.bss__presets { display: flex; flex-wrap: wrap; gap: 6px; }

.bss__body { display: grid; gap: 14px; }
@container bss (min-width: 780px) { .bss__body { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; } }

.bss__channels { display: grid; margin: 0; padding: 4px 18px; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bss__channel { display: grid; gap: 8px; padding: 14px 0; }
.bss__channel + .bss__channel { border-top: 1px solid var(--mi-sep); }
.bss__line { display: flex; align-items: center; gap: 10px; }
.bss__swatch { flex: none; width: 10px; height: 10px; border-radius: 3px; }
.bss__leads { margin-inline-start: auto; white-space: nowrap; }

.bss__summary { display: grid; gap: 14px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bss__totals { display: grid; gap: 8px; margin: 0; }
.bss__totals div { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; }
.bss__totals dt { color: var(--mi-label2); }
.bss__totals dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }
.bss__state { margin: 0; font-size: 13px; color: var(--mi-label2); }
.bss__state.is-over { font-weight: 600; color: var(--mi-red-t); }
</style>
