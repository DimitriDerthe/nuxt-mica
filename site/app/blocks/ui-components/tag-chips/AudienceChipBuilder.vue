<template>
  <div class="ac-cq">
    <section class="ac" aria-labelledby="ac-title">
      <div class="ac__build">
        <header>
          <MiText id="ac-title" variant="title3" as="h2" weight="semibold">Who gets the pricing notice?</MiText>
          <MiText variant="footnote" tone="label2">Pick chips to shape the audience; the estimate updates as you go.</MiText>
        </header>

        <fieldset class="ac__group">
          <legend class="ac__legend">Plan <span>any of</span></legend>
          <div class="ac__chips">
            <MiChip v-for="p in plans" :key="p.id" v-model="plan[p.id]" selectable :label="p.label" />
          </div>
        </fieldset>

        <fieldset class="ac__group">
          <legend class="ac__legend">Region <span>any of</span></legend>
          <div class="ac__chips">
            <MiChip v-for="r in regions" :key="r.id" v-model="region[r.id]" selectable tone="secondary" :label="r.label" />
          </div>
        </fieldset>

        <fieldset class="ac__group">
          <legend class="ac__legend">Behaviour <span>all of</span></legend>
          <TransitionGroup tag="div" name="ac" class="ac__chips">
            <MiChip
              v-for="s in signals" :key="s" :label="s" tone="neutral" removable :remove-label="'Remove ' + s" @remove="removeSignal(s)"
            />
            <button v-for="s in suggestions" :key="'add-' + s" type="button" class="ac__suggest" @click="signals.push(s)">
              <MiIcon name="plus" :size="13" :weight="2.4" /> {{ s }}
            </button>
          </TransitionGroup>
        </fieldset>

        <fieldset class="ac__group">
          <legend class="ac__legend">Exclude tags</legend>
          <MiTagInput v-model="excluded" placeholder="Type a tag, press Return" :max="6" remove-label="Stop excluding" />
        </fieldset>
      </div>

      <!-- Summary: the chips read back as one sentence, with the estimate. -->
      <aside class="ac__sum" aria-labelledby="ac-sum-title">
        <MiText id="ac-sum-title" variant="caption" tone="label2" weight="semibold" as="h3">Estimated audience</MiText>
        <p class="ac__big" aria-live="polite">{{ estimate.toLocaleString('en-US') }}</p>
        <div class="ac__bar" role="meter" aria-label="Share of all customers" :aria-valuenow="estimate" aria-valuemin="0" :aria-valuemax="TOTAL">
          <span :style="{ transform: `scaleX(${estimate / TOTAL})` }" />
        </div>
        <MiText variant="caption" tone="label3" tabular>{{ share }}% of {{ TOTAL.toLocaleString('en-US') }} customers</MiText>
        <p class="ac__sentence">{{ sentence }}</p>
        <MiButton block :disabled="!estimate">Use this audience</MiButton>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const TOTAL = 12860
const plans = [
  { id: 'starter', label: 'Starter', count: 6120 },
  { id: 'growth', label: 'Growth', count: 4210 },
  { id: 'scale', label: 'Scale', count: 2140 },
  { id: 'enterprise', label: 'Enterprise', count: 390 }
]
const regions = [
  { id: 'eu', label: 'EU', share: 0.41 },
  { id: 'uk', label: 'UK', share: 0.17 },
  { id: 'na', label: 'North America', share: 0.3 },
  { id: 'apac', label: 'APAC', share: 0.12 }
]
// Share of customers that match each behaviour, assumed independent for the estimate.
const signalRate: Record<string, number> = {
  'Logged in this month': 0.64, 'Opened the last 3 emails': 0.38, 'Has an open invoice': 0.21, 'Trial ended': 0.12, 'Uses the API': 0.29
}
const excludeRate = 0.06

const plan = reactive<Record<string, boolean>>({ starter: false, growth: true, scale: true, enterprise: false })
const region = reactive<Record<string, boolean>>({ eu: true, uk: true, na: false, apac: false })
const signals = ref<string[]>(['Logged in this month'])
const excluded = ref<string[]>(['churn-risk', 'internal'])

const suggestions = computed(() => Object.keys(signalRate).filter(s => !signals.value.includes(s)))
const removeSignal = (s: string) => { signals.value = signals.value.filter(x => x !== s) }

const pickedPlans = computed(() => plans.filter(p => plan[p.id]))
const pickedRegions = computed(() => regions.filter(r => region[r.id]))

const estimate = computed(() => {
  const people = pickedPlans.value.reduce((n, p) => n + p.count, 0)
  const regionShare = pickedRegions.value.reduce((n, r) => n + r.share, 0)
  const behaviour = signals.value.reduce((n, s) => n * (signalRate[s] ?? 1), 1)
  return Math.round(people * regionShare * behaviour * (1 - excludeRate * excluded.value.length) / 10) * 10
})
const share = computed(() => ((estimate.value / TOTAL) * 100).toFixed(1))

const list = (xs: string[], joiner: string) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${joiner} ${xs.at(-1)}`)
const sentence = computed(() => {
  if (!pickedPlans.value.length || !pickedRegions.value.length) return 'Pick at least one plan and one region.'
  let s = `${list(pickedPlans.value.map(p => p.label), 'or')} customers in ${list(pickedRegions.value.map(r => r.label), 'or')}`
  if (signals.value.length) s += ` who ${list(signals.value.map(x => x[0]!.toLowerCase() + x.slice(1)), 'and')}`
  if (excluded.value.length) s += `, except those tagged ${list(excluded.value, 'or')}`
  return s + '.'
})
</script>

<style scoped>
.ac-cq { container-type: inline-size; }
.ac { display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.ac__build { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ac__group { display: grid; gap: 8px; min-width: 0; margin: 0; padding: 0; border: 0; }
.ac__legend { padding: 0; margin-bottom: 8px; font-size: 13px; font-weight: 600; }
.ac__legend span { margin-left: 6px; font-weight: 500; color: var(--mi-label3); }
.ac__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.ac__suggest {
  display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 12px; border: 1px dashed var(--mi-sep); border-radius: 999px;
  font: inherit; font-size: 13px; color: var(--mi-label2); background: none; cursor: pointer;
}
.ac__suggest:hover { color: var(--mi-label); border-color: var(--mi-label3); }
.ac__suggest:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.ac-move { transition: transform var(--mi-dur-3) var(--mi-spring); }

.ac__sum {
  position: relative; display: grid; align-content: start; gap: 8px; padding: 20px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.ac__sum::before { content: ""; position: absolute; inset: -50% -40% auto auto; width: 80%; aspect-ratio: 1; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, var(--mi-s-tint), transparent); }
.ac__big { margin: 0; font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.ac__bar { height: 6px; border-radius: 3px; overflow: hidden; background: var(--mi-fill3); }
.ac__bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.ac__sentence { margin: 6px 0 8px; padding: 12px 14px; border-radius: var(--mi-radius-m); font-size: 14px; line-height: 1.5; color: var(--mi-label); background: var(--mi-fill4); }

@container (min-width: 760px) {
  .ac { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; gap: 16px; }
  .ac__build { padding: 24px 26px; }
}
</style>
