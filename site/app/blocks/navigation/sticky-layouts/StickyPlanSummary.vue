<template>
  <section class="sps" aria-labelledby="sps-title">
    <!-- The frame scrolls on its own so the sticky layers work inside the preview. -->
    <div class="sps__frame" tabindex="0" aria-label="Plan configuration">
      <header class="sps__bar">
        <MiText id="sps-title" variant="headline" as="h2">Upgrade to Team</MiText>
        <MiText variant="caption" tone="label2">Northwind Studio · currently on Starter</MiText>
      </header>

      <div class="sps__layout">
        <div class="sps__main">
          <section class="sps__group" aria-labelledby="sps-seats">
            <MiText id="sps-seats" variant="footnote" weight="semibold" as="h3" class="sps__sticky">1 · Seats</MiText>
            <div class="sps__row">
              <div>
                <MiText variant="subheadline" weight="medium">Team members</MiText>
                <MiText variant="footnote" tone="label2">{{ fmt(seatPrice) }} per seat per month</MiText>
              </div>
              <MiStepper v-model="seats" :min="3" :max="200" label="Seats" show-value />
            </div>
            <MiText variant="footnote" tone="label2">You have 9 members today. Guests stay free and are not counted.</MiText>
          </section>

          <section class="sps__group" aria-labelledby="sps-billing">
            <MiText id="sps-billing" variant="footnote" weight="semibold" as="h3" class="sps__sticky">2 · Billing cycle</MiText>
            <MiSegmented v-model="cycle" label="Billing cycle" :options="cycles" />
            <MiText variant="footnote" tone="label2">Yearly billing takes 20% off every line, add-ons included.</MiText>
          </section>

          <section class="sps__group" aria-labelledby="sps-addons">
            <MiText id="sps-addons" variant="footnote" weight="semibold" as="h3" class="sps__sticky">3 · Add-ons</MiText>
            <div v-for="a in addons" :key="a.id" class="sps__row">
              <div>
                <MiText :id="'sps-addon-' + a.id" variant="subheadline" weight="medium">{{ a.name }}</MiText>
                <MiText variant="footnote" tone="label2">{{ a.note }} · {{ a.perSeat ? fmt(a.price) + ' per seat' : fmt(a.price) + ' flat' }}</MiText>
              </div>
              <MiSwitch v-model="picked[a.id]" :aria-labelledby="'sps-addon-' + a.id" />
            </div>
          </section>

          <section class="sps__group" aria-labelledby="sps-region">
            <MiText id="sps-region" variant="footnote" weight="semibold" as="h3" class="sps__sticky">4 · Data residency</MiText>
            <MiSegmented v-model="residency" label="Data residency" :options="residencies" />
            <MiText variant="footnote" tone="label2">Files, backups and logs stay in the region you pick. You can move once per year.</MiText>
          </section>
        </div>

        <!-- Sticks to the top beside the form on wide screens, to the bottom of the frame on phones. -->
        <aside class="sps__summary" aria-labelledby="sps-sum-title">
          <MiText id="sps-sum-title" variant="footnote" weight="semibold" as="h3" class="sps__sum-head">Summary</MiText>
          <ul class="sps__lines">
            <li v-for="l in lines" :key="l.label"><span>{{ l.label }}</span><span>{{ fmt(l.amount) }}</span></li>
            <li v-if="cycle === 'year'" class="is-save"><span>Yearly discount</span><span>−{{ fmt(discount) }}</span></li>
          </ul>
          <div class="sps__total">
            <div aria-live="polite">
              <p class="sps__amount">{{ fmt(total) }}</p>
              <MiText variant="caption" tone="label2">per month · {{ cycle === 'year' ? 'billed ' + fmt(total * 12) + ' yearly' : 'billed monthly' }}</MiText>
            </div>
            <MiButton>Confirm upgrade</MiButton>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Addon { id: 'sso' | 'audit' | 'support', name: string, note: string, price: number, perSeat: boolean }
interface Line { label: string, amount: number }

const seatPrice = 12
const seats = ref(12)
const cycles = [{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly −20%' }]
const cycle = ref<string | number | null>('year')
const residencies = [{ value: 'eu', label: 'EU · Frankfurt' }, { value: 'us', label: 'US · Virginia' }]
const residency = ref<string | number | null>('eu')

const addons: Addon[] = [
  { id: 'sso', name: 'SAML single sign-on', note: 'Okta, Entra ID, Google', price: 4, perSeat: true },
  { id: 'audit', name: 'Audit log export', note: '400 days, streamed to S3', price: 49, perSeat: false },
  { id: 'support', name: 'Priority support', note: '1 hour first reply', price: 99, perSeat: false }
]
const picked = reactive<Record<Addon['id'], boolean>>({ sso: true, audit: false, support: false })

const lines = computed<Line[]>(() => [
  { label: `${seats.value} seats`, amount: seats.value * seatPrice },
  ...addons.filter(a => picked[a.id]).map(a => ({ label: a.name, amount: a.perSeat ? a.price * seats.value : a.price }))
])
const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.amount, 0))
const discount = computed(() => (cycle.value === 'year' ? subtotal.value * 0.2 : 0))
const total = computed(() => subtotal.value - discount.value)

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
const fmt = (n: number): string => money.format(n)
</script>

<style scoped>
.sps { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.sps__frame { --bar: 60px; height: 600px; overflow-y: auto; overscroll-behavior: contain; background: var(--mi-page); }
.sps__frame:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

/* Layer 1: frosted header. */
.sps__bar {
  position: sticky; top: 0; z-index: 3; display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 12px;
  height: var(--bar); box-sizing: border-box; padding: 18px 20px 0; overflow: hidden;
  background: var(--mi-mat); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--mi-sep);
}
.sps__bar h2 { margin: 0; }

.sps__layout { display: grid; gap: 20px; padding: 20px; }
.sps__main { display: grid; gap: 28px; padding-bottom: 120px; }
.sps__group { display: grid; gap: 14px; }

/* Layer 2: each section heading pins under the header until the next one pushes it out. */
.sps__sticky {
  position: sticky; top: var(--bar); z-index: 2; margin: 0 -20px; padding: 10px 20px;
  background: var(--mi-page); text-transform: uppercase; letter-spacing: .06em; font-size: 11px; color: var(--mi-label2);
}
.sps__row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }

/* Layer 3: the summary. Mobile: a bar pinned to the bottom of the frame. */
.sps__summary {
  position: sticky; bottom: 0; z-index: 2; display: grid; gap: 12px; margin: 0 -20px -20px; padding: 14px 20px;
  background: var(--mi-card); border-top: 1px solid var(--mi-sep); box-shadow: var(--mi-sh2);
}
.sps__sum-head, .sps__lines { display: none; }
.sps__sum-head { margin: 0; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; color: var(--mi-label2); }
.sps__lines { gap: 8px; margin: 0; padding: 0 0 12px; list-style: none; border-bottom: 1px solid var(--mi-sep); font-size: 14px; }
.sps__lines li { display: flex; justify-content: space-between; gap: 12px; }
.sps__lines li span:last-child { font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.sps__lines .is-save span { color: var(--mi-green-t); }
.sps__total { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.sps__amount { margin: 0; font-size: 28px; line-height: 1.1; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }

@container (min-width: 760px) {
  .sps__layout { grid-template-columns: minmax(0, 1fr) 300px; align-items: start; gap: 28px; padding: 24px; }
  .sps__sticky { margin: 0 -24px; padding-inline: 24px; }
  .sps__main { padding-bottom: 240px; }
  .sps__summary { top: calc(var(--bar) + 20px); bottom: auto; margin: 0; padding: 18px; border: 0; border-radius: var(--mi-radius-xl); box-shadow: var(--mi-sh1); }
  .sps__sum-head, .sps__lines { display: grid; }
  .sps__total { display: grid; justify-content: stretch; }
}
</style>
