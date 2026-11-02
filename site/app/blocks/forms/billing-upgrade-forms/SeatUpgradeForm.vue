<template>
  <div class="suf-cq">
    <section class="suf" aria-labelledby="suf-title">
      <form class="suf__form" novalidate @submit.prevent="confirm">
        <header class="suf__head">
          <div>
            <MiText id="suf-title" variant="title3" as="h2" weight="semibold">Change plan</MiText>
            <MiText variant="footnote" tone="label2">Northwind Studio is on Team, monthly, with {{ CURRENT.seats }} seats</MiText>
          </div>
          <MiSegmented v-model="cycle" label="Billing cycle" variant="tinted" :options="[{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly · save 20%' }]" />
        </header>

        <fieldset class="suf__plans">
          <legend class="suf__sr">Plan</legend>
          <label v-for="p in PLANS" :key="p.id" class="suf__plan" :class="{ 'is-on': plan === p.id }">
            <input v-model="plan" type="radio" name="suf-plan" :value="p.id" class="suf__radio">
            <span class="suf__plan-top">
              <b>{{ p.name }}</b>
              <MiBadge v-if="p.id === CURRENT.plan" tone="neutral" label="Current" />
              <MiBadge v-else-if="p.popular" tone="primary" label="Most teams" />
            </span>
            <span class="suf__price"><b>${{ seatPrice(p) }}</b> per seat / month</span>
            <ul>
              <li v-for="f in p.perks" :key="f"><MiIcon name="check" :size="14" :weight="2.4" />{{ f }}</li>
            </ul>
          </label>
        </fieldset>

        <div class="suf__seats">
          <div>
            <MiText id="suf-seats" variant="subheadline" weight="semibold">Seats</MiText>
            <MiText variant="caption" tone="label2">{{ CURRENT.members }} people already use a seat</MiText>
          </div>
          <MiStepper v-model="seats" variant="field" :min="CURRENT.members" :max="250" label="Seats" />
        </div>
        <MiCheckbox v-model="storage" label="Extra storage, 1 TB" description="$20 per month, shared by the workspace" />
      </form>

      <aside class="suf__sum" aria-labelledby="suf-sum-title">
        <MiText id="suf-sum-title" variant="headline" as="h3">Summary</MiText>

        <!-- Where today sits in the current cycle: the unused part becomes a credit. -->
        <div class="suf__cycle">
          <div class="suf__cycle-bar" role="img" :aria-label="`${LEFT} of ${DAYS} days left in this billing cycle`">
            <span :style="{ transform: `scaleX(${LEFT / DAYS})` }" />
          </div>
          <div class="suf__cycle-legend"><span>14 Oct</span><span>Today · {{ LEFT }} days left</span><span>13 Nov</span></div>
        </div>

        <dl class="suf__lines">
          <div><dt>{{ planObj.name }} × {{ seats }} seats, {{ cycle === 'year' ? '12 months' : '1 month' }}</dt><dd>{{ money(base) }}</dd></div>
          <div v-if="storage"><dt>Extra storage</dt><dd>{{ money(extra) }}</dd></div>
          <div class="is-credit"><dt>Unused Team time ({{ LEFT }} days)</dt><dd>−{{ money(credit) }}</dd></div>
          <div><dt>VAT 20%</dt><dd>{{ money(vat) }}</dd></div>
          <div class="is-total"><dt>Due today</dt><dd>{{ money(due) }}</dd></div>
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
import { computed, ref, watch } from 'vue'

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
  setTimeout(() => { state.value = 'done' }, 900)
}
const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
</script>

<style scoped>
.suf-cq { container-type: inline-size; }
.suf { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 840px) { .suf { grid-template-columns: minmax(0, 1fr) 320px; align-items: start; } }
.suf__form { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.suf__head { display: grid; gap: 12px; }
@container (min-width: 560px) { .suf__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; } }
.suf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.suf__plans { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; min-width: 0; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 520px) { .suf__plans { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.suf__plan {
  position: relative; display: grid; gap: 8px; align-content: start; padding: 16px; border-radius: var(--mi-radius-l); cursor: pointer;
  box-shadow: 0 0 0 1px var(--mi-sep); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.suf__plan:hover { transform: translateY(-1px); }
.suf__plan.is-on { box-shadow: 0 0 0 2px var(--mi-p); background: color-mix(in srgb, var(--mi-p) 5%, transparent); }
.suf__plan:has(:focus-visible) { outline: 3px solid color-mix(in srgb, var(--mi-p) 45%, transparent); outline-offset: 2px; }
.suf__radio { position: absolute; opacity: 0; pointer-events: none; }
.suf__plan-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 16px; }
.suf__price { font-size: 13px; color: var(--mi-label2); }
.suf__price b { font-size: 24px; font-weight: 700; letter-spacing: -.03em; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.suf__plan ul { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-label2); }
.suf__plan li { display: flex; align-items: center; gap: 6px; }
.suf__plan li :deep(svg) { color: var(--mi-green); flex: none; }

.suf__seats { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 0 0; border-top: 1px solid var(--mi-sep); }

.suf__sum { display: grid; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 840px) { .suf__sum { position: sticky; top: 16px; } }
.suf__cycle { display: grid; gap: 6px; }
.suf__cycle-bar { position: relative; height: 10px; border-radius: 5px; background: var(--mi-fill3); overflow: hidden; }
.suf__cycle-bar span { position: absolute; inset: 0; transform-origin: right; border-radius: inherit; background: repeating-linear-gradient(135deg, var(--mi-p) 0 6px, color-mix(in srgb, var(--mi-p) 70%, transparent) 6px 12px); }
.suf__cycle-legend { display: flex; justify-content: space-between; gap: 6px; font-size: 11px; color: var(--mi-label3); }
.suf__cycle-legend span:nth-child(2) { color: var(--mi-p-text); font-weight: 600; }

.suf__lines { display: grid; gap: 8px; margin: 0; font-size: 13px; }
.suf__lines div { display: flex; justify-content: space-between; gap: 12px; }
.suf__lines dt { color: var(--mi-label2); }
.suf__lines dd { margin: 0; font-variant-numeric: tabular-nums; white-space: nowrap; }
.suf__lines .is-credit dd { color: var(--mi-green-t); }
.suf__lines .is-total { padding-top: 10px; border-top: 1px solid var(--mi-sep); font-size: 16px; font-weight: 700; }
.suf__lines .is-total dt { color: var(--mi-label); }
</style>
