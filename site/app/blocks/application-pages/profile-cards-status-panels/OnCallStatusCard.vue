<template>
  <section class="oc mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="oc-title">
    <MiText id="oc-title" as="h2" variant="title3" weight="semibold">On call · Checkout and payments</MiText>

    <div class="oc__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)]">
      <article class="oc__now mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:gap-3.5 mi:content-start" aria-labelledby="oc-now-name">
        <div class="oc__who mi:flex mi:items-center mi:gap-3">
          <MiBadge dot-only :dot-size="12" placement="bottom-right" :ring-color="'var(--mi-card)'" :tone="presenceTone" :aria-label="presenceLabel">
            <template #target><MiAvatar name="Priya Natarajan" size="md" tone="primary" decorative /></template>
          </MiBadge>
          <div class="oc__who-text mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText id="oc-now-name" variant="headline" as="h3">Priya Natarajan</MiText>
            <MiText variant="footnote" tone="label2">Primary on-call · {{ presenceLabel }}</MiText>
          </div>
        </div>
        <MiSegmented v-model="presence" label="Your on-call status" :options="presences" />
        <MiAlert v-if="presence === 'away'" tone="warning" title="Pages route to Marcus while you’re away" message="Switch back to Available to take them again." />
        <MiMeter :value="15" :max="24" aria-label="Shift elapsed" caption="15 h of a 24 h shift" hint="Hands off Tue 09:00" />
        <dl class="oc__stats mi:grid mi:grid-cols-[1fr_1fr] mi:m-0 mi:border-t mi:border-t-sep">
          <div class="mi:[.oc__stats>&]:grid mi:[.oc__stats>&]:gap-0.5 mi:[.oc__stats>&]:pt-3 mi:[.oc__stats>&:first-child]:pr-3.5"><dt class="mi:[.oc__stats_&]:text-[12px] mi:[.oc__stats_&]:text-label2">Pages this shift</dt><dd class="mi:[.oc__stats_&]:text-[22px] mi:[.oc__stats_&]:tabular-nums">3<small> · {{ acked ? 3 : 2 }} acked</small></dd></div>
          <div class="mi:[.oc__stats>&]:grid mi:[.oc__stats>&]:gap-0.5 mi:[.oc__stats>&]:pt-3 mi:[.oc__stats>&:first-child]:pr-3.5"><dt class="mi:[.oc__stats_&]:text-[12px] mi:[.oc__stats_&]:text-label2">Median time to ack</dt><dd class="mi:[.oc__stats_&]:text-[22px] mi:[.oc__stats_&]:tabular-nums">2m 10s</dd></div>
        </dl>
      </article>

      <div class="oc__side mi:grid mi:gap-3 mi:content-start">
        <!-- The live page: acknowledging or escalating moves the chain below. -->
        <article class="oc__page mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:gap-2 mi:shadow-[var(--mi-sh1),_inset_3px_0_0_var(--mi-red)] mi:[&.is-acked]:shadow-[var(--mi-sh1),_inset_3px_0_0_var(--mi-green)]" :class="{ 'is-acked': acked }" aria-labelledby="oc-page-title">
          <div class="oc__page-top mi:flex mi:flex-wrap mi:items-center mi:gap-2">
            <MiBadge :tone="acked ? 'neutral' : 'danger'" variant="solid" label="SEV2" />
            <MiText variant="caption" tone="label2">Triggered 14:03 · {{ acked ? 'acknowledged' : '4 min unacknowledged' }}</MiText>
          </div>
          <MiText id="oc-page-title" variant="subheadline" weight="semibold" as="h3">Checkout API 5xx above 2% for 5 minutes</MiText>
          <p class="oc__live mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ pageNote }}</p>
          <div v-if="!acked" class="oc__page-actions mi:flex mi:flex-wrap mi:gap-2 mi:mt-1">
            <MiButton size="small" @click="acked = true">Acknowledge</MiButton>
            <MiButton variant="gray" size="small" :disabled="level >= chain.length - 1" @click="escalated++">Escalate</MiButton>
          </div>
        </article>

        <article class="oc__chain mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="oc-chain-title">
          <MiText id="oc-chain-title" variant="caption" weight="semibold" tone="label3" as="h3" class="oc__label mi:[.oc__chain_ol&]:[list-style:none] mi:[.oc__chain_li&]:grid-cols-[26px_minmax(0,_1fr)] mi:[.oc__chain_li&]:items-center mi:[.oc__chain_li&]:rounded-md mi:[.oc__chain_li&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]">Escalation chain</MiText>
          <ol class="mi:[.oc__chain_ol&]:[list-style:none]">
            <li class="mi:[.oc__chain_li&]:grid-cols-[26px_minmax(0,_1fr)] mi:[.oc__chain_li&]:items-center mi:[.oc__chain_li&]:rounded-md mi:[.oc__chain_li&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" v-for="(c, i) in chain" :key="c.name" :class="{ 'is-on mi:[.oc__chain_&]:bg-p-tint': i === level, 'is-past mi:[.oc__chain_&]:opacity-55': i < level }" :aria-current="i === level ? 'step' : undefined">
              <span class="oc__step mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[50%] mi:bg-fill3 mi:text-[12px] mi:font-bold mi:[.oc__chain_li.is-on_&]:bg-p mi:[.oc__chain_li.is-on_&]:text-p-on" aria-hidden="true">{{ i + 1 }}</span>
              <div class="oc__chain-text mi:grid mi:min-w-0">
                <MiText class="mi:[.oc__chain_ol&]:[list-style:none] mi:[.oc__chain_li&]:grid-cols-[26px_minmax(0,_1fr)] mi:[.oc__chain_li&]:items-center mi:[.oc__chain_li&]:rounded-md mi:[.oc__chain_li&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" variant="subheadline" weight="medium" :lines="1">{{ c.name }}</MiText>
                <MiText class="mi:[.oc__chain_ol&]:[list-style:none] mi:[.oc__chain_li&]:grid-cols-[26px_minmax(0,_1fr)] mi:[.oc__chain_li&]:items-center mi:[.oc__chain_li&]:rounded-md mi:[.oc__chain_li&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" variant="caption" tone="label2">{{ c.role }} · {{ c.after }}</MiText>
              </div>
            </li>
          </ol>
        </article>

        <article class="oc__next mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-2.5 mi:gap-x-3 mi:@[460px]:grid-cols-[auto_minmax(0,_1fr)_auto]" aria-labelledby="oc-next-title">
          <MiAvatar name="Kenji Watanabe" size="sm" tone="auto" decorative />
          <div class="oc__next-text mi:grid mi:min-w-0">
            <MiText id="oc-next-title" variant="subheadline" weight="medium" as="h3">Next: Kenji Watanabe</MiText>
            <MiText variant="caption" tone="label2">Takes over Tue 09:00 for 7 days</MiText>
          </div>
          <MiButton variant="tinted" size="small" :disabled="swap" @click="swap = true">{{ swap ? 'Swap requested' : 'Request swap' }}</MiButton>
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

<style scoped>
.oc__stats > div + div { padding-left: 14px; border-left: 1px solid var(--mi-sep); }
.oc__stats dt { font-weight: 500; }
.oc__stats dd { margin: 0; font-weight: 700; letter-spacing: -.03em; }
.oc__stats dd small { font-size: 13px; font-weight: 500; letter-spacing: 0; color: var(--mi-label2); }

.oc__label { margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; }
.oc__chain ol { display: grid; gap: 2px; margin: 0; padding: 0; }
.oc__chain li { display: grid; gap: 10px; padding: 8px; }
.oc__next > :last-child { grid-column: 1 / -1; justify-self: start; }
@container (min-width: 460px) { .oc__next > :last-child { grid-column: auto; } }
</style>
