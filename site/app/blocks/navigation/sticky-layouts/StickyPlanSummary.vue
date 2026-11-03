<template>
  <section class="sps mi:@container mi:font-mi mi:text-label" aria-labelledby="sps-title">
    <!-- The frame scrolls on its own so the sticky layers work inside the preview. -->
    <div class="sps__frame mi:[--bar:60px] mi:h-150 mi:overflow-y-auto mi:overscroll-contain mi:bg-page mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" tabindex="0" aria-label="Plan configuration">
      <header class="sps__bar mi:sticky mi:top-0 mi:z-3 mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-0.5 mi:gap-x-3 mi:h-(--bar) mi:box-border mi:pt-4.5 mi:px-5 mi:pb-0 mi:overflow-hidden mi:bg-mat mi:border-b mi:border-b-sep">
        <MiText id="sps-title" variant="headline" as="h2">Upgrade to Team</MiText>
        <MiText variant="caption" tone="label2">Northwind Studio · currently on Starter</MiText>
      </header>

      <div class="sps__layout mi:grid mi:gap-5 mi:p-5 mi:@[760px]:grid-cols-[minmax(0,_1fr)_300px] mi:@[760px]:items-start mi:@[760px]:gap-7 mi:@[760px]:p-6">
        <div class="sps__main mi:grid mi:gap-7 mi:pb-30 mi:@[760px]:pb-60">
          <section class="sps__group mi:grid mi:gap-3.5" aria-labelledby="sps-seats">
            <MiText id="sps-seats" variant="footnote" weight="semibold" as="h3" class="sps__sticky mi:sticky mi:top-(--bar) mi:z-2 mi:py-2.5 mi:px-5 mi:bg-page mi:@[760px]:px-6">1 · Seats</MiText>
            <div class="sps__row mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-3.5 mi:px-4 mi:rounded-lg mi:bg-card mi:shadow-1">
              <div>
                <MiText variant="subheadline" weight="medium">Team members</MiText>
                <MiText variant="footnote" tone="label2">{{ fmt(seatPrice) }} per seat per month</MiText>
              </div>
              <MiStepper v-model="seats" :min="3" :max="200" label="Seats" show-value />
            </div>
            <MiText variant="footnote" tone="label2">You have 9 members today. Guests stay free and are not counted.</MiText>
          </section>

          <section class="sps__group mi:grid mi:gap-3.5" aria-labelledby="sps-billing">
            <MiText id="sps-billing" variant="footnote" weight="semibold" as="h3" class="sps__sticky mi:sticky mi:top-(--bar) mi:z-2 mi:py-2.5 mi:px-5 mi:bg-page mi:@[760px]:px-6">2 · Billing cycle</MiText>
            <MiSegmented v-model="cycle" label="Billing cycle" :options="cycles" />
            <MiText variant="footnote" tone="label2">Yearly billing takes 20% off every line, add-ons included.</MiText>
          </section>

          <section class="sps__group mi:grid mi:gap-3.5" aria-labelledby="sps-addons">
            <MiText id="sps-addons" variant="footnote" weight="semibold" as="h3" class="sps__sticky mi:sticky mi:top-(--bar) mi:z-2 mi:py-2.5 mi:px-5 mi:bg-page mi:@[760px]:px-6">3 · Add-ons</MiText>
            <div v-for="a in addons" :key="a.id" class="sps__row mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-3.5 mi:px-4 mi:rounded-lg mi:bg-card mi:shadow-1">
              <div>
                <MiText :id="'sps-addon-' + a.id" variant="subheadline" weight="medium">{{ a.name }}</MiText>
                <MiText variant="footnote" tone="label2">{{ a.note }} · {{ a.perSeat ? fmt(a.price) + ' per seat' : fmt(a.price) + ' flat' }}</MiText>
              </div>
              <MiSwitch v-model="picked[a.id]" :aria-labelledby="'sps-addon-' + a.id" />
            </div>
          </section>

          <section class="sps__group mi:grid mi:gap-3.5" aria-labelledby="sps-region">
            <MiText id="sps-region" variant="footnote" weight="semibold" as="h3" class="sps__sticky mi:sticky mi:top-(--bar) mi:z-2 mi:py-2.5 mi:px-5 mi:bg-page mi:@[760px]:px-6">4 · Data residency</MiText>
            <MiSegmented v-model="residency" label="Data residency" :options="residencies" />
            <MiText variant="footnote" tone="label2">Files, backups and logs stay in the region you pick. You can move once per year.</MiText>
          </section>
        </div>

        <!-- Sticks to the top beside the form on wide screens, to the bottom of the frame on phones. -->
        <aside class="sps__summary mi:sticky mi:bottom-0 mi:z-2 mi:grid mi:gap-3 mi:mt-0 mi:-mx-5 mi:-mb-5 mi:py-3.5 mi:px-5 mi:bg-card mi:border-t mi:border-t-sep mi:shadow-2 mi:@[760px]:top-[calc(var(--bar)_+_20px)] mi:@[760px]:bottom-auto mi:@[760px]:m-0 mi:@[760px]:p-4.5 mi:@[760px]:[border:0] mi:@[760px]:rounded-xl mi:@[760px]:shadow-1" aria-labelledby="sps-sum-title">
          <MiText id="sps-sum-title" variant="footnote" weight="semibold" as="h3" class="sps__sum-head">Summary</MiText>
          <ul class="sps__lines mi:hidden mi:gap-2 mi:m-0 mi:pt-0 mi:px-0 mi:pb-3 mi:[list-style:none] mi:border-b mi:border-b-sep mi:text-[14px] mi:@[760px]:grid">
            <li class="mi:[.sps__lines_&]:justify-between mi:[.sps__lines_&]:gap-3" v-for="l in lines" :key="l.label"><span class="mi:[.sps__lines_li_&:last-child]:tabular-nums mi:[.sps__lines_li_&:last-child]:text-label2">{{ l.label }}</span><span class="mi:[.sps__lines_li_&:last-child]:tabular-nums mi:[.sps__lines_li_&:last-child]:text-label2">{{ fmt(l.amount) }}</span></li>
            <li v-if="cycle === 'year'" class="is-save mi:[.sps__lines_&]:justify-between mi:[.sps__lines_&]:gap-3"><span class="mi:[.sps__lines_li_&:last-child]:tabular-nums mi:[.sps__lines_li_&:last-child]:text-label2 mi:[.sps__lines_.is-save_&]:text-green-t">Yearly discount</span><span class="mi:[.sps__lines_li_&:last-child]:tabular-nums mi:[.sps__lines_li_&:last-child]:text-label2 mi:[.sps__lines_.is-save_&]:text-green-t">−{{ fmt(discount) }}</span></li>
          </ul>
          <div class="sps__total mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:@[760px]:grid mi:@[760px]:justify-stretch">
            <div aria-live="polite">
              <p class="sps__amount mi:m-0 mi:text-[28px] mi:leading-[1.1] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ fmt(total) }}</p>
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
/* Layer 1: frosted header. */
.sps__bar { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
}
.sps__bar h2 { margin: 0; }

/* Layer 2: each section heading pins under the header until the next one pushes it out. */
.sps__sticky { margin: 0 -20px; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; color: var(--mi-label2);
}
.sps__sum-head { display: none; }
.sps__sum-head { margin: 0; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; color: var(--mi-label2); }
.sps__lines li { display: flex; }

@container (min-width: 760px) {
  .sps__sticky { margin: 0 -24px; }
  .sps__sum-head { display: grid; }
}
</style>
