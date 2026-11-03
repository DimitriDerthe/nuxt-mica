<template>
  <section class="spp mi:@container mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="spp-title">
    <header class="spp__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3.5">
      <div class="spp__intro mi:grid mi:gap-1.5 mi:max-w-130">
        <MiText id="spp-title" as="h2" variant="title2" weight="bold" balance>Plans that grow with your crew</MiText>
        <MiText variant="subheadline" tone="label2">Every plan includes unlimited projects and offline field sync.</MiText>
      </div>
      <div class="spp__controls mi:grid mi:justify-items-start mi:gap-1.5 mi:@[720px]:justify-items-end">
        <MiSegmented v-model="cycle" variant="tinted" label="Billing cycle" :options="cycles" />
        <MiText variant="caption" weight="semibold" :tone="cycle === 'year' ? 'green' : 'label2'">
          {{ cycle === 'year' ? '2 months free, applied' : 'Switch to yearly: 2 months free' }}
        </MiText>
      </div>
    </header>

    <div class="spp__seats mi:py-4 mi:px-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
      <MiSlider v-model="seats" :min="1" :max="120" label="Team size" :format="fmtSeats" class="spp__slider" />
    </div>

    <div class="spp__plans mi:grid mi:gap-3 mi:@[820px]:grid-cols-3" role="radiogroup" aria-label="Plan">
      <button
        v-for="p in priced" :key="p.id" type="button" role="radio" class="spp__plan mi:relative mi:grid mi:content-start mi:gap-2.5 mi:p-5 mi:[border:0] mi:rounded-xl mi:text-start mi:[font:inherit] mi:text-label mi:[background:var(--mi-card)] mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&:hover:not(.is-off)]:transform-[translateY(-2px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:[&.is-picked]:shadow-[inset_0_0_0_2px_var(--mi-p),_var(--mi-sh2)] mi:[&.is-picked]:[background:linear-gradient(170deg,_var(--mi-p-tint),_transparent_55%),_var(--mi-card)] mi:[&.is-off]:opacity-55 mi:[&.is-off]:cursor-not-allowed"
        :class="{ 'is-picked': picked === p.id, 'is-best': p.id === bestFit, 'is-off': !p.fits }"
        :aria-checked="picked === p.id" :aria-disabled="!p.fits || undefined" @click="p.fits && (picked = p.id)"
      >
        <span class="spp__plan-top mi:flex mi:items-center mi:gap-2 mi:pr-7">
          <span class="spp__name mi:text-[17px] mi:font-bold mi:tracking-[-.01em]">{{ p.name }}</span>
          <MiBadge v-if="p.id === bestFit" tone="primary" variant="solid" label="Best fit" />
        </span>
        <span class="spp__blurb mi:text-[13px] mi:text-label2">{{ p.blurb }}</span>
        <span class="spp__price mi:flex mi:items-baseline mi:gap-2 mi:mt-1.5">
          <span class="spp__amount mi:text-[34px] mi:font-750 mi:tracking-[-.04em] mi:leading-none mi:tabular-nums">{{ eur(p.perSeat) }}</span>
          <span class="spp__per mi:text-[12px] mi:text-label2">per seat / month</span>
        </span>
        <span class="spp__total mi:min-h-4.5 mi:text-[12px] mi:font-medium mi:text-label2 mi:tabular-nums">
          <template v-if="p.fits">{{ eur(p.total) }} billed {{ cycle === 'year' ? 'yearly' : 'monthly' }}<template v-if="cycle === 'year'"> · you save {{ eur(p.saving) }}</template></template>
          <template v-else>{{ p.limit }}</template>
        </span>
        <span class="spp__features mi:grid mi:gap-1.5 mi:mt-1.5 mi:mx-0 mi:mb-0 mi:pt-3 mi:px-0 mi:pb-0 mi:[list-style:none] mi:border-t mi:border-t-sep mi:text-[13px]">
          <span class="mi:[.spp__features>&]:flex mi:[.spp__features>&]:items-center mi:[.spp__features>&]:gap-2" v-for="f in p.features" :key="f"><MiIcon name="check" :size="14" :weight="2.4" />{{ f }}</span>
        </span>
        <span class="spp__radio mi:absolute mi:top-5 mi:right-5 mi:w-5 mi:h-5 mi:box-border mi:rounded-[50%] mi:border-2 mi:border-fill mi:[.spp__plan.is-picked_&]:border-6 mi:[.spp__plan.is-picked_&]:border-p" aria-hidden="true" />
      </button>
    </div>

    <footer class="spp__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:py-3.5 mi:px-4.5 mi:rounded-lg mi:[background:var(--mi-fill4)]" aria-live="polite">
      <MiText variant="subheadline">
        <strong>{{ current.name }}</strong> for {{ seats }} {{ seats === 1 ? 'seat' : 'seats' }}:
        <strong class="spp__sum mi:tabular-nums">{{ eur(current.total) }}</strong> / {{ cycle === 'year' ? 'year' : 'month' }}, excl. VAT
      </MiText>
      <MiButton>Continue with {{ current.name }}</MiButton>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const cycles = [{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly' }]
const plans = [
  { id: 'starter', name: 'Starter', blurb: 'For a single survey crew', monthly: 9, min: 1, max: 10, features: ['Up to 10 seats', 'Offline maps', 'Email support'] },
  { id: 'team', name: 'Team', blurb: 'For several crews and an office', monthly: 16, min: 3, max: 80, features: ['Shared templates', 'Approvals and audit log', 'Priority chat support'] },
  { id: 'scale', name: 'Scale', blurb: 'For regional operations', monthly: 27, min: 25, max: Infinity, features: ['SAML SSO and SCIM', 'Data residency in the EU', 'Named success manager'] }
]

const cycle = ref<string | number | null>('year')
const seats = ref<number | [number, number]>(18)
const picked = ref('team')

const n = computed(() => (Array.isArray(seats.value) ? seats.value[0] : seats.value))
// Yearly price = 10 months for 12, shown as the monthly equivalent per seat.
const priced = computed(() => plans.map((p) => {
  const yearly = cycle.value === 'year'
  const perSeat = yearly ? (p.monthly * 10) / 12 : p.monthly
  const fits = n.value >= p.min && n.value <= p.max
  return {
    ...p, perSeat, fits,
    total: yearly ? p.monthly * 10 * n.value : p.monthly * n.value,
    saving: p.monthly * 2 * n.value,
    limit: n.value > p.max ? `Up to ${p.max} seats` : `From ${p.min} seats`
  }
}))
const bestFit = computed(() => (n.value <= 6 ? 'starter' : n.value < 40 ? 'team' : 'scale'))
const current = computed(() => priced.value.find(p => p.id === picked.value) ?? priced.value[1]!)

// If the seat count rules out the chosen plan, move to the best fit.
watch(n, () => { if (!current.value.fits) picked.value = bestFit.value })

const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2, minimumFractionDigits: 0 })
const eur = (v: number) => fmt.format(Math.round(v * 100) / 100)
const fmtSeats = (v: number) => v + (v === 1 ? ' seat' : ' seats')
</script>

<style scoped>
.spp__plan.is-picked .spp__total { color: var(--mi-p-text); }
.spp__features :deep(svg) { color: var(--mi-p-text); flex: none; }
</style>
