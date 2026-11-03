<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-3.5 mi:font-mi mi:text-label mi:@[760px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[760px]:items-start mi:@[760px]:gap-4" aria-labelledby="ac-title">
      <div class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[760px]:py-6 mi:@[760px]:px-6.5">
        <header>
          <MiText id="ac-title" variant="title3" as="h2" weight="semibold">Who gets the pricing notice?</MiText>
          <MiText variant="footnote" tone="label2">Pick chips to shape the audience; the estimate updates as you go.</MiText>
        </header>

        <fieldset class="mi:grid mi:gap-2 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
          <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold">Plan <span class="mi:ml-1.5 mi:font-medium mi:text-label3">any of</span></legend>
          <div class="mi:flex mi:flex-wrap mi:gap-1.5">
            <MiChip v-for="p in plans" :key="p.id" v-model="plan[p.id]" selectable :label="p.label" />
          </div>
        </fieldset>

        <fieldset class="mi:grid mi:gap-2 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
          <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold">Region <span class="mi:ml-1.5 mi:font-medium mi:text-label3">any of</span></legend>
          <div class="mi:flex mi:flex-wrap mi:gap-1.5">
            <MiChip v-for="r in regions" :key="r.id" v-model="region[r.id]" selectable tone="secondary" :label="r.label" />
          </div>
        </fieldset>

        <fieldset class="mi:grid mi:gap-2 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
          <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold">Behaviour <span class="mi:ml-1.5 mi:font-medium mi:text-label3">all of</span></legend>
          <TransitionGroup tag="div" move-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" class="mi:flex mi:flex-wrap mi:gap-1.5">
            <MiChip
              v-for="s in signals" :key="s" :label="s" tone="neutral" removable :remove-label="'Remove ' + s" @remove="removeSignal(s)"
            />
            <button v-for="s in suggestions" :key="'add-' + s" type="button" class="mi:[font:inherit] mi:text-[13px] mi:inline-flex mi:items-center mi:gap-1 mi:h-8 mi:py-0 mi:px-3 mi:[border:1px_dashed_var(--mi-sep)] mi:rounded-[999px] mi:text-label2 mi:[background:none] mi:cursor-pointer mi:hover:text-label mi:hover:border-label3 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="signals.push(s)">
              <MiIcon name="plus" :size="13" :weight="2.4" /> {{ s }}
            </button>
          </TransitionGroup>
        </fieldset>

        <fieldset class="mi:grid mi:gap-2 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
          <legend class="mi:p-0 mi:mb-2 mi:text-[13px] mi:font-semibold">Exclude tags</legend>
          <MiTagInput v-model="excluded" placeholder="Type a tag, press Return" :max="6" remove-label="Stop excluding" />
        </fieldset>
      </div>

      <!-- Summary: the chips read back as one sentence, with the estimate. -->
      <aside class="mi:relative mi:grid mi:content-start mi:gap-2 mi:p-5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:top-[-50%] mi:before:right-[-40%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[80%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-s-tint),_transparent)]" aria-labelledby="ac-sum-title">
        <MiText id="ac-sum-title" variant="caption" tone="label2" weight="semibold" as="h3">Estimated audience</MiText>
        <p class="mi:m-0 mi:text-[44px] mi:font-bold mi:leading-none mi:tracking-[-.04em] mi:tabular-nums" aria-live="polite">{{ estimate.toLocaleString('en-US') }}</p>
        <div class="mi:h-1.5 mi:rounded-[3px] mi:overflow-hidden mi:[background:var(--mi-fill3)]" role="meter" aria-label="Share of all customers" :aria-valuenow="estimate" aria-valuemin="0" :aria-valuemax="TOTAL">
          <span class="mi:block mi:h-full mi:rounded-[inherit] mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${estimate / TOTAL})` }" />
        </div>
        <MiText variant="caption" tone="label3" tabular>{{ share }}% of {{ TOTAL.toLocaleString('en-US') }} customers</MiText>
        <p class="mi:mt-1.5 mi:mx-0 mi:mb-2 mi:py-3 mi:px-3.5 mi:rounded-md mi:text-[14px] mi:leading-normal mi:text-label mi:[background:var(--mi-fill4)]">{{ sentence }}</p>
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
