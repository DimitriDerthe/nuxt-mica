<template>
  <section class="spp" aria-labelledby="spp-title">
    <header class="spp__head">
      <div class="spp__intro">
        <MiText id="spp-title" as="h2" variant="title2" weight="bold" balance>Plans that grow with your crew</MiText>
        <MiText variant="subheadline" tone="label2">Every plan includes unlimited projects and offline field sync.</MiText>
      </div>
      <div class="spp__controls">
        <MiSegmented v-model="cycle" variant="tinted" label="Billing cycle" :options="cycles" />
        <MiText variant="caption" weight="semibold" :tone="cycle === 'year' ? 'green' : 'label2'">
          {{ cycle === 'year' ? '2 months free, applied' : 'Switch to yearly: 2 months free' }}
        </MiText>
      </div>
    </header>

    <div class="spp__seats">
      <MiSlider v-model="seats" :min="1" :max="120" label="Team size" :format="fmtSeats" class="spp__slider" />
    </div>

    <div class="spp__plans" role="radiogroup" aria-label="Plan">
      <button
        v-for="p in priced" :key="p.id" type="button" role="radio" class="spp__plan"
        :class="{ 'is-picked': picked === p.id, 'is-best': p.id === bestFit, 'is-off': !p.fits }"
        :aria-checked="picked === p.id" :aria-disabled="!p.fits || undefined" @click="p.fits && (picked = p.id)"
      >
        <span class="spp__plan-top">
          <span class="spp__name">{{ p.name }}</span>
          <MiBadge v-if="p.id === bestFit" tone="primary" variant="solid" label="Best fit" />
        </span>
        <span class="spp__blurb">{{ p.blurb }}</span>
        <span class="spp__price">
          <span class="spp__amount">{{ eur(p.perSeat) }}</span>
          <span class="spp__per">per seat / month</span>
        </span>
        <span class="spp__total">
          <template v-if="p.fits">{{ eur(p.total) }} billed {{ cycle === 'year' ? 'yearly' : 'monthly' }}<template v-if="cycle === 'year'"> · you save {{ eur(p.saving) }}</template></template>
          <template v-else>{{ p.limit }}</template>
        </span>
        <span class="spp__features">
          <span v-for="f in p.features" :key="f"><MiIcon name="check" :size="14" :weight="2.4" />{{ f }}</span>
        </span>
        <span class="spp__radio" aria-hidden="true" />
      </button>
    </div>

    <footer class="spp__foot" aria-live="polite">
      <MiText variant="subheadline">
        <strong>{{ current.name }}</strong> for {{ seats }} {{ seats === 1 ? 'seat' : 'seats' }}:
        <strong class="spp__sum">{{ eur(current.total) }}</strong> / {{ cycle === 'year' ? 'year' : 'month' }}, excl. VAT
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
.spp { container-type: inline-size; display: grid; align-content: start; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.spp__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; }
.spp__intro { display: grid; gap: 6px; max-width: 520px; }
.spp__controls { display: grid; justify-items: start; gap: 6px; }
@container (min-width: 720px) { .spp__controls { justify-items: end; } }
.spp__seats { padding: 16px 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.spp__plans { display: grid; gap: 12px; }
@container (min-width: 820px) { .spp__plans { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.spp__plan {
  position: relative; display: grid; align-content: start; gap: 10px; padding: 20px; border: 0; border-radius: var(--mi-radius-xl); text-align: start;
  font: inherit; color: var(--mi-label); background: var(--mi-card); box-shadow: inset 0 0 0 1px var(--mi-sep); cursor: pointer;
  transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-3) var(--mi-ease);
}
.spp__plan:hover:not(.is-off) { transform: translateY(-2px); }
.spp__plan:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.spp__plan.is-picked { box-shadow: inset 0 0 0 2px var(--mi-p), var(--mi-sh2); background: linear-gradient(170deg, var(--mi-p-tint), transparent 55%), var(--mi-card); }
.spp__plan.is-off { opacity: .55; cursor: not-allowed; }
.spp__plan-top { display: flex; align-items: center; gap: 8px; padding-right: 28px; }
.spp__name { font-size: 17px; font-weight: 700; letter-spacing: -.01em; }
.spp__blurb { font-size: 13px; color: var(--mi-label2); }
.spp__price { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; }
.spp__amount { font-size: 34px; font-weight: 750; letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.spp__per { font-size: 12px; color: var(--mi-label2); }
.spp__total { min-height: 18px; font-size: 12px; font-weight: 500; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.spp__plan.is-picked .spp__total { color: var(--mi-p-text); }
.spp__features { display: grid; gap: 6px; margin: 6px 0 0; padding: 12px 0 0; list-style: none; border-top: 1px solid var(--mi-sep); font-size: 13px; }
.spp__features > span { display: flex; align-items: center; gap: 8px; }
.spp__features :deep(svg) { color: var(--mi-p-text); flex: none; }
.spp__radio { position: absolute; top: 20px; right: 20px; width: 20px; height: 20px; box-sizing: border-box; border-radius: 50%; border: 2px solid var(--mi-fill); }
.spp__plan.is-picked .spp__radio { border: 6px solid var(--mi-p); }

.spp__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.spp__sum { font-variant-numeric: tabular-nums; }
</style>
