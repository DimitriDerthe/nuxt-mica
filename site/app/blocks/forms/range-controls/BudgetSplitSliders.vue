<template>
  <section class="mi:@container/bss mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="bss-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="bss-title" as="h2" variant="title3" weight="semibold">December ad budget</MiText>
        <MiText variant="footnote" tone="label2">Fernway Outdoor · {{ money(budget) }} to spread across channels</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Budget presets">
        <MiButton v-for="p in presets" :key="p.label" variant="gray" size="small" @click="apply(p.split)">{{ p.label }}</MiButton>
      </div>
    </header>

    <div class="mi:grid mi:gap-3.5 mi:@[780px]/bss:grid-cols-[minmax(0,_1fr)_300px] mi:@[780px]/bss:items-start">
      <ul class="mi:grid mi:m-0 mi:py-1 mi:px-4.5 mi:[list-style:none] mi:rounded-xl mi:bg-card mi:shadow-1">
        <li v-for="c in channels" :key="c.id" class="mi:grid mi:gap-2 mi:py-3.5 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <span class="mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[3px]" :style="{ background: c.color }" aria-hidden="true" />
            <MiText as="h3" variant="subheadline" weight="semibold">{{ c.label }}</MiText>
            <MiText variant="caption" tone="label2" tabular class="mi:ms-auto! mi:whitespace-nowrap">≈ {{ leadsOf(c) }} leads</MiText>
          </div>
          <MiSlider
            :model-value="c.spend" :min="0" :max="8000" :step="250" :aria-label="`${c.label} spend`"
            :format="money" show-value @update:model-value="set(c, $event)"
          />
        </li>
      </ul>

      <!-- Summary: the split as one bar, with whatever is left or over shown as its own slice. -->
      <aside class="mi:grid mi:gap-3.5 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="bss-sum">
        <MiText id="bss-sum" as="h3" variant="subheadline" weight="semibold">Allocation</MiText>
        <MiStackedBar :segments="segments" :height="18" :legend-columns="1" :animate="false" :format-share="(pct: number) => `${Math.round(pct)}%`" />
        <dl class="mi:grid mi:gap-2 mi:m-0">
          <div class="mi:flex mi:justify-between mi:gap-2 mi:text-[14px]"><dt class="mi:text-label2">Allocated</dt><dd class="mi:m-0 mi:font-semibold mi:tabular-nums">{{ money(allocated) }}</dd></div>
          <div class="mi:flex mi:justify-between mi:gap-2 mi:text-[14px]"><dt class="mi:text-label2">Projected leads</dt><dd class="mi:m-0 mi:font-semibold mi:tabular-nums">{{ totalLeads.toLocaleString('en-US') }}</dd></div>
          <div class="mi:flex mi:justify-between mi:gap-2 mi:text-[14px]"><dt class="mi:text-label2">Cost per lead</dt><dd class="mi:m-0 mi:font-semibold mi:tabular-nums">{{ totalLeads ? money(allocated / totalLeads) : '–' }}</dd></div>
        </dl>
        <p class="mi:m-0 mi:text-[13px]" :class="left < 0 ? 'mi:font-semibold mi:text-red-t' : 'mi:text-label2'" role="status" aria-live="polite">
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
