<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="pbs-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText variant="caption" tone="label2" weight="medium">Billing · Ostrava Labs</MiText>
        <MiText id="pbs-title" variant="title3" as="h2" weight="semibold">{{ plan }} plan</MiText>
      </div>
      <MiBadge :tone="cancelled ? 'warning' : 'success'" :label="cancelled ? 'Ends Dec 1' : 'Active'" dot />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[620px]:grid-cols-2 mi:@[980px]:grid-cols-[1.3fr_1fr_1fr]">
      <!-- Upgrade: an async primary that walks through idle, loading and done. -->
      <article class="mi:bg-card mi:@[620px]:col-[span_2] mi:@[980px]:col-[auto] mi:grid mi:content-start mi:gap-2.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:shadow-1 mi:relative mi:overflow-hidden mi:isolate mi:before:content-[''] mi:before:absolute mi:before:top-[-50%] mi:before:right-[-20%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[60%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)]">
        <MiText variant="headline" as="h3">Move to Team</MiText>
        <MiText variant="footnote" tone="label2">Shared projects, SSO and audit logs for $24 per seat.</MiText>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:mt-1">
          <MiButton size="large" :variant="plan === 'Team' ? 'tinted' : 'filled'" :loading="upgrading" :disabled="plan === 'Team'" class="mi:flex-[1_1_200px]" @click="upgrade">
            <template v-if="plan === 'Team'" #leading><MiIcon name="check" :size="18" /></template>
            {{ plan === 'Team' ? 'You are on Team' : upgrading ? 'Upgrading…' : 'Upgrade to Team' }}
          </MiButton>
          <MiButton size="large" variant="plain" brand="secondary" href="#" @click.prevent="note = 'Plan comparison opened.'">Compare plans</MiButton>
        </div>
      </article>

      <!-- Seats: icon buttons nudge, the save button explains why it is disabled. -->
      <article class="mi:bg-card mi:grid mi:content-start mi:gap-2.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:shadow-1">
        <MiText variant="headline" as="h3">Seats</MiText>
        <div class="mi:flex mi:items-center mi:justify-center mi:gap-4.5 mi:py-1 mi:px-0">
          <MiIconButton size="regular" variant="gray" label="Remove a seat" :disabled="seats <= used" @click="seats--"><MiIcon name="minus" /></MiIconButton>
          <output class="mi:min-w-[2ch] mi:text-[34px] mi:font-bold mi:tracking-[-.03em] mi:text-center mi:tabular-nums" aria-live="polite">{{ seats }}</output>
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
      <article class="mi:bg-card mi:grid mi:content-start mi:gap-2.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:shadow-1">
        <MiText variant="headline" as="h3">Download invoice</MiText>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiButton v-for="s in sizes" :key="s.size" :size="s.size" variant="gray" @click="note = `INV-2611 downloaded as ${s.label}.`">
            <template #leading><MiIcon name="document" :size="s.size === 'mini' ? 13 : 16" /></template>
            {{ s.label }}
          </MiButton>
        </div>
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-3 mi:rounded-md mi:[background:var(--mi-fill4)]">
          <MiText as="span" variant="footnote" tabular>INV-2611 · $192.00</MiText>
          <MiCopyButton value="INV-2611" label="Copy invoice number" copied-label="Invoice number copied" variant="ghost" icon-only />
        </div>
      </article>

      <!-- Destructive: a two-step confirm, the second step spells out the consequence. -->
      <article class="mi:[background-color:color-mix(in_srgb,_var(--mi-red)_6%,_var(--mi-card))] mi:@[980px]:col-[span_3] mi:grid mi:content-start mi:gap-2.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:shadow-1">
        <MiText variant="headline" as="h3">Cancel subscription</MiText>
        <MiText variant="footnote" tone="label2">{{ cancelled ? 'Your plan stays active until Dec 1, then drops to Free.' : 'You keep access until the end of the billing period.' }}</MiText>
        <div v-if="cancelled" class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:mt-1">
          <MiButton size="small" variant="tinted" @click="cancelled = false; note = 'Subscription resumed.'">Resume plan</MiButton>
        </div>
        <div v-else-if="armed" class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:mt-1" role="group" aria-label="Confirm cancellation">
          <MiButton size="small" variant="gray" @click="armed = false">Keep my plan</MiButton>
          <MiButton size="small" variant="destructive" @click="cancel">Yes, cancel on Dec 1</MiButton>
        </div>
        <div v-else class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:mt-1">
          <MiButton size="small" variant="destructive" soft @click="armed = true">Cancel subscription</MiButton>
        </div>
      </article>
    </div>

    <p class="mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ note }}</p>
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

