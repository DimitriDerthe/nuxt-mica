<template>
  <section class="mm" aria-labelledby="mm-title">
    <header class="mm__head">
      <div>
        <MiText id="mm-title" variant="title3" as="h2" weight="semibold">Plan the marketing mix</MiText>
        <MiText variant="footnote" tone="label2">Q1 demand budget per month · drag a channel, the others rebalance</MiText>
      </div>
      <MiSegmented v-model="budget" label="Monthly budget" :options="budgets" />
    </header>

    <div class="mm__grid">
      <div class="mm__chart">
        <div class="mm__donut">
          <MiDonutChart
            :data="slices" :card="false" :legend="false" :toggle="false" :animate="false" :size="220" :thickness="30"
            :active="active" :format-value="(v) => money(v)" :aria-label="`Budget split across ${channels.length} channels, ${money(Number(budget))} a month`"
            @update:active="active = $event"
          >
            <template #center="{ active: a }">
              <div class="mm__center">
                <span class="mm__center-label">{{ a ? a.label : 'Per month' }}</span>
                <span class="mm__center-value">{{ a ? a.text : money(Number(budget)) }}</span>
                <span class="mm__center-sub">{{ a ? shares[a.index] + '% of budget' : channels.length + ' channels' }}</span>
              </div>
            </template>
          </MiDonutChart>
        </div>

        <article class="mm__forecast" aria-live="polite">
          <MiText variant="caption" tone="label2" weight="medium" as="h3">Projected pipeline</MiText>
          <p class="mm__big">{{ money(pipeline) }}</p>
          <MiBadge :tone="lift >= 0 ? 'success' : 'warning'" :label="`${lift >= 0 ? '+' : '−'}${Math.abs(lift).toFixed(1)}% vs current plan`" dot />
          <MiText variant="footnote" tone="label2">Your next $5k returns most in <strong>{{ best }}</strong>.</MiText>
        </article>
      </div>

      <div class="mm__controls">
        <div v-for="(c, i) in channels" :key="c.name" class="mm__channel" @mouseenter="active = i" @mouseleave="active = -1">
          <span class="mm__swatch" :style="{ background: c.color }" aria-hidden="true" />
          <MiSlider
            :model-value="shares[i]" :label="c.name" :min="0" :max="100" :format="(v) => `${v}% · ${money(spendOf(v))}`"
            @update:model-value="setShare(i, typeof $event === 'number' ? $event : $event[0])"
          />
        </div>
        <MiButton variant="gray" size="small" :disabled="isPlan" @click="shares = [...plan]">Back to current plan</MiButton>
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

<style scoped>
.mm { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.mm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.mm__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 800px) { .mm__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); } }

.mm__chart { display: grid; gap: 16px; align-items: center; min-width: 0; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 520px) and (max-width: 799px) { .mm__chart { grid-template-columns: 220px minmax(0, 1fr); } }
.mm__donut { width: 100%; max-width: 220px; justify-self: center; }
.mm__center { display: grid; justify-items: center; gap: 2px; text-align: center; }
.mm__center-label { max-width: 120px; font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.mm__center-value { font-size: 24px; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.mm__center-sub { font-size: 11px; font-weight: 600; color: var(--mi-label2); }

.mm__forecast { display: grid; justify-items: start; gap: 6px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); }
.mm__big { margin: 0; font-size: clamp(28px, 6cqi, 36px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }

.mm__controls { display: grid; gap: 4px; align-content: start; min-width: 0; padding: 14px 18px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mm__controls > :last-child { justify-self: start; margin-top: 8px; }
.mm__channel { display: grid; grid-template-columns: 10px minmax(0, 1fr); align-items: center; gap: 12px; padding: 8px 0; }
.mm__channel + .mm__channel { border-top: 1px solid var(--mi-sep); }
.mm__swatch { width: 10px; height: 10px; border-radius: 3px; }
</style>
