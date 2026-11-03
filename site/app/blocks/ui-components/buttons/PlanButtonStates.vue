<template>
  <section class="pbs" aria-labelledby="pbs-title">
    <header class="pbs__head">
      <div>
        <MiText variant="caption" tone="label2" weight="medium">Billing · Ostrava Labs</MiText>
        <MiText id="pbs-title" variant="title3" as="h2" weight="semibold">{{ plan }} plan</MiText>
      </div>
      <MiBadge :tone="cancelled ? 'warning' : 'success'" :label="cancelled ? 'Ends Dec 1' : 'Active'" dot />
    </header>

    <div class="pbs__grid">
      <!-- Upgrade: an async primary that walks through idle, loading and done. -->
      <article class="pbs__card pbs__card--hero">
        <MiText variant="headline" as="h3">Move to Team</MiText>
        <MiText variant="footnote" tone="label2">Shared projects, SSO and audit logs for $24 per seat.</MiText>
        <div class="pbs__row">
          <MiButton size="large" :variant="plan === 'Team' ? 'tinted' : 'filled'" :loading="upgrading" :disabled="plan === 'Team'" class="pbs__grow" @click="upgrade">
            <template v-if="plan === 'Team'" #leading><MiIcon name="check" :size="18" /></template>
            {{ plan === 'Team' ? 'You are on Team' : upgrading ? 'Upgrading…' : 'Upgrade to Team' }}
          </MiButton>
          <MiButton size="large" variant="plain" brand="secondary" href="#" @click.prevent="note = 'Plan comparison opened.'">Compare plans</MiButton>
        </div>
      </article>

      <!-- Seats: icon buttons nudge, the save button explains why it is disabled. -->
      <article class="pbs__card">
        <MiText variant="headline" as="h3">Seats</MiText>
        <div class="pbs__seats">
          <MiIconButton size="regular" variant="gray" label="Remove a seat" :disabled="seats <= used" @click="seats--"><MiIcon name="minus" /></MiIconButton>
          <output class="pbs__count" aria-live="polite">{{ seats }}</output>
          <MiIconButton size="regular" variant="gray" label="Add a seat" @click="seats++"><MiIcon name="plus" /></MiIconButton>
        </div>
        <MiButton size="small" variant="bordered" :disabled="seats === savedSeats" aria-describedby="pbs-seat-hint" block @click="saveSeats">
          {{ seats === savedSeats ? 'Save seats' : `Save ${seats} seats` }}
        </MiButton>
        <MiText id="pbs-seat-hint" variant="caption" tone="label2">
          {{ seats === savedSeats ? `${used} of ${savedSeats} in use; change the count to save.` : `New total $${seats * price}/month from today.` }}
        </MiText>
      </article>

      <!-- Size ladder: mini to large, emphasis grows with the size of the export. -->
      <article class="pbs__card">
        <MiText variant="headline" as="h3">Download invoice</MiText>
        <div class="pbs__ladder">
          <MiButton v-for="s in sizes" :key="s.size" :size="s.size" variant="gray" @click="note = `INV-2611 downloaded as ${s.label}.`">
            <template #leading><MiIcon name="document" :size="s.size === 'mini' ? 13 : 16" /></template>
            {{ s.label }}
          </MiButton>
        </div>
        <div class="pbs__invoice">
          <MiText as="span" variant="footnote" tabular>INV-2611 · $192.00</MiText>
          <MiCopyButton value="INV-2611" label="Copy invoice number" copied-label="Invoice number copied" variant="ghost" icon-only />
        </div>
      </article>

      <!-- Destructive: a two-step confirm, the second step spells out the consequence. -->
      <article class="pbs__card pbs__card--danger">
        <MiText variant="headline" as="h3">Cancel subscription</MiText>
        <MiText variant="footnote" tone="label2">{{ cancelled ? 'Your plan stays active until Dec 1, then drops to Free.' : 'You keep access until the end of the billing period.' }}</MiText>
        <div v-if="cancelled" class="pbs__row">
          <MiButton size="small" variant="tinted" @click="cancelled = false; note = 'Subscription resumed.'">Resume plan</MiButton>
        </div>
        <div v-else-if="armed" class="pbs__row" role="group" aria-label="Confirm cancellation">
          <MiButton size="small" variant="gray" @click="armed = false">Keep my plan</MiButton>
          <MiButton size="small" variant="destructive" @click="cancel">Yes, cancel on Dec 1</MiButton>
        </div>
        <div v-else class="pbs__row">
          <MiButton size="small" variant="destructive" soft @click="armed = true">Cancel subscription</MiButton>
        </div>
      </article>
    </div>

    <p class="pbs__note" aria-live="polite">{{ note }}</p>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

type Size = 'mini' | 'small' | 'regular' | 'large'
const sizes: { size: Size, label: string }[] = [{ size: 'mini', label: 'CSV' }, { size: 'small', label: 'PDF' }, { size: 'regular', label: 'Receipt' }, { size: 'large', label: 'Full statement' }]
const price = 24
const used = 7

const plan = ref<'Pro' | 'Team'>('Pro')
const upgrading = ref(false)
const seats = ref(8)
const savedSeats = ref(8)
const armed = ref(false)
const cancelled = ref(false)
const note = ref('Every button here is live: try upgrading, changing seats or cancelling.')

let timer: ReturnType<typeof setTimeout> | undefined
function upgrade() {
  upgrading.value = true
  timer = setTimeout(() => {
    upgrading.value = false
    plan.value = 'Team'
    note.value = 'Upgraded to Team. Prorated charge: $41.60.'
  }, 1400)
}
onBeforeUnmount(() => clearTimeout(timer))

function saveSeats() {
  note.value = `${seats.value > savedSeats.value ? 'Added' : 'Removed'} ${Math.abs(seats.value - savedSeats.value)} seat${Math.abs(seats.value - savedSeats.value) === 1 ? '' : 's'}.`
  savedSeats.value = seats.value
}
function cancel() {
  armed.value = false
  cancelled.value = true
  note.value = 'Cancellation scheduled for Dec 1. You can resume any time before then.'
}
</script>

<style scoped>
.pbs { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.pbs__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.pbs__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 620px) { .pbs__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .pbs__card--hero { grid-column: span 2; } }
@container (min-width: 980px) { .pbs__grid { grid-template-columns: 1.3fr 1fr 1fr; } .pbs__card--hero { grid-column: auto; } .pbs__card--danger { grid-column: span 3; } }

.pbs__card { display: grid; align-content: start; gap: 10px; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.pbs__card--hero { position: relative; overflow: hidden; isolation: isolate; }
.pbs__card--hero::before { content: ""; position: absolute; inset: -50% -20% auto auto; width: 60%; aspect-ratio: 1; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, var(--mi-p-tint), transparent); }
.pbs__card--danger { background: color-mix(in srgb, var(--mi-red) 6%, var(--mi-card)); }
.pbs__row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px; }
.pbs__grow { flex: 1 1 200px; }

.pbs__seats { display: flex; align-items: center; justify-content: center; gap: 18px; padding: 4px 0; }
.pbs__count { min-width: 2ch; font-size: 34px; font-weight: 700; letter-spacing: -.03em; text-align: center; font-variant-numeric: tabular-nums; }

.pbs__ladder { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.pbs__invoice { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 6px 6px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }

.pbs__note { margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>
