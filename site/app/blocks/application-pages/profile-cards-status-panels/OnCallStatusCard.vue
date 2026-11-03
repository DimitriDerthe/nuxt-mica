<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="oc-title">
    <MiText id="oc-title" as="h2" variant="title3" weight="semibold">On call · Checkout and payments</MiText>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
      <article class="mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:gap-3.5 mi:content-start" aria-labelledby="oc-now-name">
        <div class="mi:flex mi:items-center mi:gap-3">
          <MiBadge dot-only :dot-size="12" placement="bottom-right" :ring-color="'var(--mi-card)'" :tone="presenceTone" :aria-label="presenceLabel">
            <template #target><MiAvatar name="Priya Natarajan" size="md" tone="primary" decorative /></template>
          </MiBadge>
          <div class="mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText id="oc-now-name" variant="headline" as="h3">Priya Natarajan</MiText>
            <MiText variant="footnote" tone="label2">Primary on-call · {{ presenceLabel }}</MiText>
          </div>
        </div>
        <MiSegmented v-model="presence" label="Your on-call status" :options="presences" />
        <MiAlert v-if="presence === 'away'" tone="warning" title="Pages route to Marcus while you’re away" message="Switch back to Available to take them again." />
        <MiMeter :value="15" :max="24" aria-label="Shift elapsed" caption="15 h of a 24 h shift" hint="Hands off Tue 09:00" />
        <dl class="mi:grid mi:grid-cols-[1fr_1fr] mi:m-0 mi:border-t mi:border-t-sep">
          <div class="mi:grid mi:gap-0.5 mi:pt-3 mi:[&:first-child]:pr-3.5"><dt class="mi:font-medium mi:text-[12px] mi:text-label2">Pages this shift</dt><dd class="mi:m-0 mi:font-bold mi:tracking-[-.03em] mi:text-[22px] mi:tabular-nums">3<small class="mi:text-[13px] mi:font-medium mi:tracking-[0] mi:text-label2"> · {{ acked ? 3 : 2 }} acked</small></dd></div>
          <div class="mi:pl-3.5 mi:border-l mi:border-l-sep mi:grid mi:gap-0.5 mi:pt-3 mi:[&:first-child]:pr-3.5"><dt class="mi:font-medium mi:text-[12px] mi:text-label2">Median time to ack</dt><dd class="mi:m-0 mi:font-bold mi:tracking-[-.03em] mi:text-[22px] mi:tabular-nums">2m 10s</dd></div>
        </dl>
      </article>

      <div class="mi:grid mi:gap-3 mi:content-start">
        <!-- The live page: acknowledging or escalating moves the chain below. -->
        <article class="mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:grid mi:gap-2" :class="acked ? 'mi:shadow-[var(--mi-sh1),_inset_3px_0_0_var(--mi-green)]' : 'mi:shadow-[var(--mi-sh1),_inset_3px_0_0_var(--mi-red)]'" aria-labelledby="oc-page-title">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
            <MiBadge :tone="acked ? 'neutral' : 'danger'" variant="solid" label="SEV2" />
            <MiText variant="caption" tone="label2">Triggered 14:03 · {{ acked ? 'acknowledged' : '4 min unacknowledged' }}</MiText>
          </div>
          <MiText id="oc-page-title" variant="subheadline" weight="semibold" as="h3">Checkout API 5xx above 2% for 5 minutes</MiText>
          <p class="mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ pageNote }}</p>
          <div v-if="!acked" class="mi:flex mi:flex-wrap mi:gap-2 mi:mt-1">
            <MiButton size="small" @click="acked = true">Acknowledge</MiButton>
            <MiButton variant="gray" size="small" :disabled="level >= chain.length - 1" @click="escalated++">Escalate</MiButton>
          </div>
        </article>

        <article class="mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="oc-chain-title">
          <MiText id="oc-chain-title" variant="caption" weight="semibold" tone="label3" as="h3" class="mi:mb-2! mi:uppercase! mi:tracking-[.06em]!">Escalation chain</MiText>
          <ol class="mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li class="mi:grid mi:gap-2.5 mi:p-2 mi:grid-cols-[26px_minmax(0,_1fr)] mi:items-center mi:rounded-md mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" v-for="(c, i) in chain" :key="c.name" :class="[i === level ? 'mi:bg-p-tint' : '', i < level ? 'mi:opacity-55' : '']" :aria-current="i === level ? 'step' : undefined">
              <span class="mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[50%] mi:text-[12px] mi:font-bold" :class="i === level ? 'mi:bg-p mi:text-p-on' : 'mi:bg-fill3'" aria-hidden="true">{{ i + 1 }}</span>
              <div class="mi:grid mi:min-w-0">
                <MiText variant="subheadline" weight="medium" :lines="1">{{ c.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ c.role }} · {{ c.after }}</MiText>
              </div>
            </li>
          </ol>
        </article>

        <article class="mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:@[460px]:grid-cols-[auto_minmax(0,_1fr)_auto]" aria-labelledby="oc-next-title">
          <MiAvatar name="Kenji Watanabe" size="sm" tone="auto" decorative />
          <div class="mi:grid mi:min-w-0">
            <MiText id="oc-next-title" variant="subheadline" weight="medium" as="h3">Next: Kenji Watanabe</MiText>
            <MiText variant="caption" tone="label2">Takes over Tue 09:00 for 7 days</MiText>
          </div>
          <MiButton variant="tinted" size="small" class="mi:col-span-full! mi:justify-self-start! mi:@[460px]:col-auto!" :disabled="swap" @click="swap = true">{{ swap ? 'Swap requested' : 'Request swap' }}</MiButton>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Presence = 'available' | 'responding' | 'away'
interface Responder { name: string, role: string, after: string }

const presences = [{ value: 'available', label: 'Available' }, { value: 'responding', label: 'Responding' }, { value: 'away', label: 'Away' }]
const presence = ref<string | number | null>('available')
const acked = ref(false)
const escalated = ref(0)
const swap = ref(false)

// Sample rota; swap for your paging tool.
const chain: Responder[] = [
  { name: 'Priya Natarajan', role: 'Primary', after: 'paged first' },
  { name: 'Marcus Bell', role: 'Secondary', after: 'after 10 min' },
  { name: 'Sofia Lindqvist', role: 'Engineering manager', after: 'after 25 min' }
]

// Narrow the segmented value (string | number | null) to a known presence.
const status = computed<Presence>(() => (presence.value === 'responding' || presence.value === 'away' ? presence.value : 'available'))
const presenceTone = computed(() => ({ available: 'success', responding: 'warning', away: 'neutral' } as const)[status.value])
const presenceLabel = computed(() => ({ available: 'Available', responding: 'Responding to a page', away: 'Away' })[status.value])
// Being away hands pages to the next responder; each escalation moves one step further.
const level = computed(() => Math.min(chain.length - 1, escalated.value + (presence.value === 'away' ? 1 : 0)))
const pageNote = computed(() => {
  if (acked.value) return `Acknowledged by ${chain[level.value]!.name} at 14:07. Status page drafted.`
  if (level.value === 0) return 'Priya has 6 minutes to acknowledge before Marcus is paged.'
  return `Now paging ${chain[level.value]!.name}.`
})
</script>
