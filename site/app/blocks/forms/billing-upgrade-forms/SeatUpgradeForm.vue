<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:font-mi mi:text-label mi:@[840px]:grid-cols-[minmax(0,_1fr)_320px] mi:@[840px]:items-start" aria-labelledby="suf-title">
      <form class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0" novalidate @submit.prevent="confirm">
        <header class="mi:grid mi:gap-3 mi:@[560px]:flex mi:@[560px]:flex-wrap mi:@[560px]:[align-items:flex-end] mi:@[560px]:justify-between">
          <div>
            <MiText id="suf-title" variant="title3" as="h2" weight="semibold">Change plan</MiText>
            <MiText variant="footnote" tone="label2">Northwind Studio is on Team, monthly, with {{ CURRENT.seats }} seats</MiText>
          </div>
          <MiSegmented v-model="cycle" label="Billing cycle" variant="tinted" :options="[{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly · save 20%' }]" />
        </header>

        <fieldset class="mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0 mi:grid-cols-[minmax(0,_1fr)] mi:@[520px]:grid-cols-2">
          <legend class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)]">Plan</legend>
          <label v-for="p in PLANS" :key="p.id" class="mi:relative mi:grid mi:gap-2 mi:content-start mi:p-4 mi:rounded-lg mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:[&:has(:focus-visible)]:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:[&:has(:focus-visible)]:outline-offset-[2px]" :class="plan === p.id ? 'mi:shadow-[0_0_0_2px_var(--mi-p)] mi:[background:color-mix(in_srgb,_var(--mi-p)_5%,_transparent)]' : 'mi:shadow-[0_0_0_1px_var(--mi-sep)]'">
            <input v-model="plan" type="radio" name="suf-plan" :value="p.id" class="mi:absolute mi:opacity-0 mi:pointer-events-none">
            <span class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:text-[16px]">
              <b>{{ p.name }}</b>
              <MiBadge v-if="p.id === CURRENT.plan" tone="neutral" label="Current" />
              <MiBadge v-else-if="p.popular" tone="primary" label="Most teams" />
            </span>
            <span class="mi:text-[13px] mi:text-label2"><b class="mi:text-label mi:tabular-nums mi:text-[24px] mi:font-bold mi:tracking-[-.03em]">${{ seatPrice(p) }}</b> per seat / month</span>
            <ul class="mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px] mi:text-label2">
              <li v-for="f in p.perks" :key="f" class="mi:flex mi:items-center mi:gap-1.5"><MiIcon name="check" :size="14" :weight="2.4" class="mi:text-green mi:flex-[none]" />{{ f }}</li>
            </ul>
          </label>
        </fieldset>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:pt-3.5 mi:px-0 mi:pb-0 mi:border-t mi:border-t-sep">
          <div>
            <MiText id="suf-seats" variant="subheadline" weight="semibold">Seats</MiText>
            <MiText variant="caption" tone="label2">{{ CURRENT.members }} people already use a seat</MiText>
          </div>
          <MiStepper v-model="seats" variant="field" :min="CURRENT.members" :max="250" label="Seats" />
        </div>
        <MiCheckbox v-model="storage" label="Extra storage, 1 TB" description="$20 per month, shared by the workspace" />
      </form>

      <aside class="mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[840px]:sticky mi:@[840px]:top-4" aria-labelledby="suf-sum-title">
        <MiText id="suf-sum-title" variant="headline" as="h3">Summary</MiText>

        <!-- Where today sits in the current cycle: the unused part becomes a credit. -->
        <div class="mi:grid mi:gap-1.5">
          <div class="mi:relative mi:h-2.5 mi:rounded-[5px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="img" :aria-label="`${LEFT} of ${DAYS} days left in this billing cycle`">
            <span class="mi:absolute mi:inset-0 mi:origin-right mi:rounded-[inherit] mi:[background:repeating-linear-gradient(135deg,_var(--mi-p)_0_6px,_color-mix(in_srgb,_var(--mi-p)_70%,_transparent)_6px_12px)]" :style="{ transform: `scaleX(${LEFT / DAYS})` }" />
          </div>
          <div class="mi:flex mi:justify-between mi:gap-1.5 mi:text-[11px] mi:text-label3"><span class="mi:[&:nth-child(2)]:font-semibold">14 Oct</span><span class="mi:text-p-text mi:[&:nth-child(2)]:font-semibold">Today · {{ LEFT }} days left</span><span class="mi:[&:nth-child(2)]:font-semibold">13 Nov</span></div>
        </div>

        <dl class="mi:grid mi:gap-2 mi:m-0 mi:text-[13px]">
          <div class="mi:flex mi:gap-3 mi:justify-between"><dt class="mi:text-label2">{{ planObj.name }} × {{ seats }} seats, {{ cycle === 'year' ? '12 months' : '1 month' }}</dt><dd class="mi:m-0 mi:tabular-nums mi:whitespace-nowrap">{{ money(base) }}</dd></div>
          <div class="mi:flex mi:gap-3 mi:justify-between" v-if="storage"><dt class="mi:text-label2">Extra storage</dt><dd class="mi:m-0 mi:tabular-nums mi:whitespace-nowrap">{{ money(extra) }}</dd></div>
          <div class="mi:flex mi:gap-3 mi:justify-between"><dt class="mi:text-label2">Unused Team time ({{ LEFT }} days)</dt><dd class="mi:m-0 mi:tabular-nums mi:text-green-t mi:whitespace-nowrap">−{{ money(credit) }}</dd></div>
          <div class="mi:flex mi:gap-3 mi:justify-between"><dt class="mi:text-label2">VAT 20%</dt><dd class="mi:m-0 mi:tabular-nums mi:whitespace-nowrap">{{ money(vat) }}</dd></div>
          <div class="mi:flex mi:gap-3 mi:justify-between mi:pt-2.5 mi:border-t mi:border-t-sep mi:text-[16px] mi:font-bold"><dt class="mi:text-label">Due today</dt><dd class="mi:m-0 mi:tabular-nums mi:whitespace-nowrap">{{ money(due) }}</dd></div>
        </dl>
        <MiText variant="caption" tone="label2">
          Then {{ money(recurring) }} every {{ cycle === 'year' ? 'year' : 'month' }} from 13 Nov{{ cycle === 'year' ? ', 2027' : '' }}, before VAT.
          <template v-if="cycle === 'year'">You save {{ money(saving) }} a year against monthly.</template>
        </MiText>

        <MiAlert v-if="state === 'done'" tone="success" title="Plan updated" :message="`You are on ${planObj.name} with ${seats} seats. The receipt is in Billing › Invoices.`" />
        <MiButton v-else block :disabled="!changed" :loading="state === 'busy'" @click="confirm">
          {{ changed ? `Pay ${money(due)} and switch` : 'No changes yet' }}
        </MiButton>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

const DAYS = 30
const LEFT = 12
const CURRENT = { plan: 'team', seats: 10, members: 8 }
const PLANS = [
  { id: 'team', name: 'Team', monthly: 12, popular: false, perks: ['Unlimited projects', 'Guests for free', '30-day history'] },
  { id: 'business', name: 'Business', monthly: 24, popular: true, perks: ['Everything in Team', 'SSO and audit log', 'Unlimited history'] }
]

const plan = ref('business')
const cycle = ref<string | number | null>('year')
const seats = ref(12)
const storage = ref(false)
const state = ref<'idle' | 'busy' | 'done'>('idle')

const planObj = computed(() => PLANS.find(p => p.id === plan.value) ?? PLANS[0]!)
const yearly = computed(() => cycle.value === 'year')
const seatPrice = (p: typeof PLANS[number]) => (yearly.value ? +(p.monthly * 0.8).toFixed(2) : p.monthly)
const months = computed(() => (yearly.value ? 12 : 1))

const base = computed(() => seatPrice(planObj.value) * seats.value * months.value)
const extra = computed(() => (storage.value ? 20 * months.value : 0))
const credit = computed(() => +(PLANS[0]!.monthly * CURRENT.seats * LEFT / DAYS).toFixed(2))
const vat = computed(() => Math.max(0, base.value + extra.value - credit.value) * 0.2)
const due = computed(() => Math.max(0, base.value + extra.value - credit.value) + vat.value)
const recurring = computed(() => base.value + extra.value)
const saving = computed(() => planObj.value.monthly * seats.value * 12 * 0.2)

const changed = computed(() => plan.value !== CURRENT.plan || seats.value !== CURRENT.seats || yearly.value || storage.value)
watch([plan, cycle, seats, storage], () => { state.value = 'idle' })

function confirm() {
  if (!changed.value || state.value !== 'idle') return
  state.value = 'busy'
  later(() => { state.value = 'done' }, 900)
}
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
</script>
