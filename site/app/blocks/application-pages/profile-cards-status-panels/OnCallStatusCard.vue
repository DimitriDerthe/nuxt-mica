<template>
  <section class="oc" aria-labelledby="oc-title">
    <MiText id="oc-title" as="h2" variant="title3" weight="semibold">On call · Checkout and payments</MiText>

    <div class="oc__grid">
      <article class="oc__now" aria-labelledby="oc-now-name">
        <div class="oc__who">
          <MiBadge dot-only :dot-size="12" placement="bottom-right" :ring-color="'var(--mi-card)'" :tone="presenceTone" :aria-label="presenceLabel">
            <template #target><MiAvatar name="Priya Natarajan" size="md" tone="primary" decorative /></template>
          </MiBadge>
          <div class="oc__who-text">
            <MiText id="oc-now-name" variant="headline" as="h3">Priya Natarajan</MiText>
            <MiText variant="footnote" tone="label2">Primary on-call · {{ presenceLabel }}</MiText>
          </div>
        </div>
        <MiSegmented v-model="presence" label="Your on-call status" :options="presences" />
        <MiAlert v-if="presence === 'away'" tone="warning" title="Pages route to Marcus while you’re away" message="Switch back to Available to take them again." />
        <MiMeter :value="15" :max="24" aria-label="Shift elapsed" caption="15 h of a 24 h shift" hint="Hands off Tue 09:00" />
        <dl class="oc__stats">
          <div><dt>Pages this shift</dt><dd>3<small> · {{ acked ? 3 : 2 }} acked</small></dd></div>
          <div><dt>Median time to ack</dt><dd>2m 10s</dd></div>
        </dl>
      </article>

      <div class="oc__side">
        <!-- The live page: acknowledging or escalating moves the chain below. -->
        <article class="oc__page" :class="{ 'is-acked': acked }" aria-labelledby="oc-page-title">
          <div class="oc__page-top">
            <MiBadge :tone="acked ? 'neutral' : 'danger'" variant="solid" label="SEV2" />
            <MiText variant="caption" tone="label2">Triggered 14:03 · {{ acked ? 'acknowledged' : '4 min unacknowledged' }}</MiText>
          </div>
          <MiText id="oc-page-title" variant="subheadline" weight="semibold" as="h3">Checkout API 5xx above 2% for 5 minutes</MiText>
          <p class="oc__live" aria-live="polite">{{ pageNote }}</p>
          <div v-if="!acked" class="oc__page-actions">
            <MiButton size="small" @click="acked = true">Acknowledge</MiButton>
            <MiButton variant="gray" size="small" :disabled="level >= chain.length - 1" @click="escalated++">Escalate</MiButton>
          </div>
        </article>

        <article class="oc__chain" aria-labelledby="oc-chain-title">
          <MiText id="oc-chain-title" variant="caption" weight="semibold" tone="label3" as="h3" class="oc__label">Escalation chain</MiText>
          <ol>
            <li v-for="(c, i) in chain" :key="c.name" :class="{ 'is-on': i === level, 'is-past': i < level }" :aria-current="i === level ? 'step' : undefined">
              <span class="oc__step" aria-hidden="true">{{ i + 1 }}</span>
              <div class="oc__chain-text">
                <MiText variant="subheadline" weight="medium" :lines="1">{{ c.name }}</MiText>
                <MiText variant="caption" tone="label2">{{ c.role }} · {{ c.after }}</MiText>
              </div>
            </li>
          </ol>
        </article>

        <article class="oc__next" aria-labelledby="oc-next-title">
          <MiAvatar name="Kenji Watanabe" size="sm" tone="auto" decorative />
          <div class="oc__next-text">
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
.oc { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.oc__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .oc__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }

.oc__now, .oc__page, .oc__chain, .oc__next { min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.oc__now { display: grid; gap: 14px; align-content: start; }
.oc__who { display: flex; align-items: center; gap: 12px; }
.oc__who-text { display: grid; gap: 2px; min-width: 0; }
.oc__stats { display: grid; grid-template-columns: 1fr 1fr; margin: 0; border-top: 1px solid var(--mi-sep); }
.oc__stats > div { display: grid; gap: 2px; padding-top: 12px; }
.oc__stats > div + div { padding-left: 14px; border-left: 1px solid var(--mi-sep); }
.oc__stats > div:first-child { padding-right: 14px; }
.oc__stats dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.oc__stats dd { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.oc__stats dd small { font-size: 13px; font-weight: 500; letter-spacing: 0; color: var(--mi-label2); }

.oc__side { display: grid; gap: 12px; align-content: start; }
.oc__page { display: grid; gap: 8px; box-shadow: var(--mi-sh1), inset 3px 0 0 var(--mi-red); }
.oc__page.is-acked { box-shadow: var(--mi-sh1), inset 3px 0 0 var(--mi-green); }
.oc__page-top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.oc__live { margin: 0; font-size: 13px; color: var(--mi-label2); }
.oc__page-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }

.oc__label { margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; }
.oc__chain ol { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.oc__chain li { display: grid; grid-template-columns: 26px minmax(0, 1fr); align-items: center; gap: 10px; padding: 8px; border-radius: var(--mi-radius-m); transition: opacity var(--mi-dur-3) var(--mi-ease); }
.oc__chain li.is-on { background: var(--mi-p-tint); }
.oc__chain li.is-past { opacity: .55; }
.oc__step { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: var(--mi-fill3); font-size: 12px; font-weight: 700; }
.oc__chain li.is-on .oc__step { background: var(--mi-p); color: var(--mi-p-on); }
.oc__chain-text { display: grid; min-width: 0; }

.oc__next { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px 12px; }
.oc__next-text { display: grid; min-width: 0; }
.oc__next > :last-child { grid-column: 1 / -1; justify-self: start; }
@container (min-width: 460px) { .oc__next { grid-template-columns: auto minmax(0, 1fr) auto; } .oc__next > :last-child { grid-column: auto; } }
</style>
