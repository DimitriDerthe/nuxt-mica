<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="mm-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="mm-title" variant="title3" as="h2" weight="semibold">Plan the marketing mix</MiText>
        <MiText variant="footnote" tone="label2">Q1 demand budget per month · drag a channel, the others rebalance</MiText>
      </div>
      <MiSegmented v-model="budget" label="Monthly budget" :options="budgets" />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[800px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.1fr)]">
      <div class="mi:grid mi:gap-4 mi:items-center mi:min-w-0 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:[@container_(min-width:_520px)_and_(max-width:_799px)]:grid-cols-[220px_minmax(0,_1fr)]">
        <div class="mi:w-full mi:max-w-55 mi:justify-self-center">
          <MiDonutChart
            :data="slices" :card="false" :legend="false" :toggle="false" :animate="false" :size="220" :thickness="30"
            :active="active" :format-value="(v) => money(v)" :aria-label="`Budget split across ${channels.length} channels, ${money(Number(budget))} a month`"
            @update:active="active = $event"
          >
            <template #center="{ active: a }">
              <div class="mi:grid mi:justify-items-center mi:gap-0.5 mi:text-center">
                <span class="mi:max-w-30 mi:text-[12px] mi:font-medium mi:text-label2">{{ a ? a.label : 'Per month' }}</span>
                <span class="mi:text-[24px] mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ a ? a.text : money(Number(budget)) }}</span>
                <span class="mi:text-[11px] mi:font-semibold mi:text-label2">{{ a ? shares[a.index] + '% of budget' : channels.length + ' channels' }}</span>
              </div>
            </template>
          </MiDonutChart>
        </div>

        <article class="mi:grid mi:justify-items-start mi:gap-1.5 mi:p-4 mi:rounded-lg mi:bg-p-tint" aria-live="polite">
          <MiText variant="caption" tone="label2" weight="medium" as="h3">Projected pipeline</MiText>
          <p class="mi:m-0 mi:text-[clamp(28px,_6cqi,_36px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ money(pipeline) }}</p>
          <MiBadge :tone="lift >= 0 ? 'success' : 'warning'" :label="`${lift >= 0 ? '+' : '−'}${Math.abs(lift).toFixed(1)}% vs current plan`" dot />
          <MiText variant="footnote" tone="label2">Your next $5k returns most in <strong>{{ best }}</strong>.</MiText>
        </article>
      </div>

      <div class="mi:grid mi:gap-1 mi:content-start mi:min-w-0 mi:pt-3.5 mi:px-4.5 mi:pb-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div v-for="(c, i) in channels" :key="c.name" class="mi:grid mi:grid-cols-[10px_minmax(0,_1fr)] mi:items-center mi:gap-3 mi:py-2 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep" @mouseenter="active = i" @mouseleave="active = -1">
          <span class="mi:w-2.5 mi:h-2.5 mi:rounded-[3px]" :style="{ background: c.color }" aria-hidden="true" />
          <MiSlider
            :model-value="shares[i]" :label="c.name" :min="0" :max="100" :format="(v) => `${v}% · ${money(spendOf(v))}`"
            @update:model-value="setShare(i, typeof $event === 'number' ? $event : $event[0])"
          />
        </div>
        <MiButton class="mi:justify-self-start mi:mt-2" variant="gray" size="small" :disabled="isPlan" @click="shares = [...plan]">Back to current plan</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Channel { name: string, color: string, yield: number }

const budgets = [{ value: 90, label: '$90k' }, { value: 120, label: '$120k' }, { value: 150, label: '$150k' }]
const budget = ref<string | number | null>(120)

// Sample yields: pipeline in $k per (spend in $k)^0.75, fitted from last year. Returns diminish with spend.
const channels: Channel[] = [
  { name: 'Paid search', color: 'var(--mi-p)', yield: 9 },
  { name: 'Paid social', color: 'var(--mi-s)', yield: 6 },
  { name: 'Content and SEO', color: 'var(--mi-teal)', yield: 7.5 },
  { name: 'Events', color: 'var(--mi-purple)', yield: 8 },
  { name: 'Partner co-marketing', color: 'var(--mi-yellow)', yield: 11 }
]
const plan = [34, 26, 18, 12, 10]
const shares = ref<number[]>([...plan])
const active = ref(-1)

const spendOf = (share: number) => (Number(budget.value ?? 120) * share) / 100
const returnOf = (yieldK: number, spend: number) => yieldK * spend ** 0.75
const pipelineOf = (s: number[]) => channels.reduce((n, c, i) => n + returnOf(c.yield, spendOf(s[i]!)), 0)

const slices = computed(() => channels.map((c, i) => ({ label: c.name, value: spendOf(shares.value[i]!), color: c.color })))
const pipeline = computed(() => pipelineOf(shares.value))
const lift = computed(() => (pipeline.value / pipelineOf(plan) - 1) * 100)
const isPlan = computed(() => shares.value.every((s, i) => s === plan[i]))
// Channel whose next $5k adds the most pipeline at the current split.
const best = computed(() => {
  const gain = channels.map((c, i) => returnOf(c.yield, spendOf(shares.value[i]!) + 5) - returnOf(c.yield, spendOf(shares.value[i]!)))
  return channels[gain.indexOf(Math.max(...gain))]!.name
})

// Set one share, scale the others to fill the rest, then push the rounding drift onto the largest other share.
function setShare (i: number, value: number) {
  const next = [...shares.value]
  const restOld = 100 - next[i]!
  const restNew = 100 - value
  const others = next.length - 1
  next[i] = value
  for (let j = 0; j < next.length; j++) {
    if (j !== i) next[j] = Math.round(restOld > 0 ? (next[j]! * restNew) / restOld : restNew / others)
  }
  const drift = 100 - next.reduce((a, b) => a + b, 0)
  const largest = next.reduce((k, s, j) => (j !== i && s > (next[k] ?? -1) ? j : k), i === 0 ? 1 : 0)
  next[largest] = Math.max(0, next[largest]! + drift)
  shares.value = next
}

const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(2)}M` : `$${Math.round(k * 10) / 10}k`)
</script>
