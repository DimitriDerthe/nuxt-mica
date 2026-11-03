<template>
  <section class="arc mi:@container mi:grid mi:grid-rows-[auto_minmax(0,_1fr)] mi:min-h-full mi:font-mi mi:text-label mi:bg-page" aria-labelledby="arc-title">
    <header class="arc__bar mi:flex mi:flex-wrap mi:items-center mi:gap-3 mi:py-3.5 mi:px-4.5 mi:border-b mi:border-b-sep mi:bg-card">
      <MiOrb :state="orb" size="md" :paused="phase === 'denied' || phase === 'stopped'" label="" />
      <div class="arc__bar-text mi:flex-[1_1_220px] mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText id="arc-title" as="h2" variant="headline" weight="semibold" :lines="1">Send the new renewal notice to Q1 renewals</MiText>
        <div class="arc__status mi:text-[13px] mi:text-label2" aria-live="polite">
          <MiShimmerText :text="status" :paused="phase !== 'sending'" />
        </div>
      </div>
      <MiBadge class="arc__run" tone="neutral" variant="outline" label="Run 7f3a · Billing agent" />
    </header>

    <div class="arc__in mi:grid mi:gap-3.5 mi:content-start mi:p-4 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[220px_minmax(0,_1fr)] mi:@[1080px]:grid-cols-[240px_minmax(0,_1fr)_260px]">
      <aside class="arc__plan mi:grid mi:gap-1.5 mi:content-start mi:min-w-0 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1" aria-labelledby="arc-plan-title">
        <MiText id="arc-plan-title" as="h3" variant="caption" weight="semibold" tone="label3" class="arc__label">Plan</MiText>
        <MiTrace :steps="steps" label="Agent plan and progress" />
      </aside>

      <div class="arc__main mi:grid mi:gap-3.5 mi:content-start mi:min-w-0">
        <!-- The agent pauses before anything irreversible and hands the decision to a person. -->
        <article class="arc__ask mi:grid mi:gap-3.5 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-[var(--mi-sh1),_inset_0_0_0_1.5px_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)]" :class="'is-' + phase" aria-labelledby="arc-ask-title">
          <div class="arc__ask-head mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-3 mi:items-start">
            <span class="arc__ask-icon mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-[10px] mi:bg-p-tint mi:text-p-text mi:[.arc__ask.is-sending_&]:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]" aria-hidden="true"><MiIcon :name="phase === 'review' ? 'lock' : phase === 'sending' ? 'check-circle' : 'exclamation-circle'" :size="18" /></span>
            <div>
              <MiText id="arc-ask-title" as="h3" variant="headline">Send {{ recipients }} emails through Postmark</MiText>
              <MiText variant="footnote" tone="label2">{{ askNote }}</MiText>
            </div>
          </div>

          <div class="arc__who mi:flex mi:flex-wrap mi:items-center mi:gap-2.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-fill4">
            <MiAvatarGroup :items="sample" :max="3" size="sm" :label="`Recipients include ${sample.map(s => s.name).join(', ')}`" />
            <MiText variant="footnote" tone="label2">Northwind Labs, Fernhill Clinics, Brightpath and {{ recipients - 3 }} more account owners</MiText>
          </div>

          <MiCheckbox
            v-model="annualOnly" :disabled="phase !== 'review'" label="Only accounts on annual plans"
            description="88 accounts. Monthly plans get the in-app banner instead."
          />

          <div v-if="phase === 'review'" class="arc__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
            <MiButton @click="phase = 'sending'">Approve and send</MiButton>
            <MiButton variant="gray" @click="phase = 'denied'">Decline</MiButton>
          </div>
          <div v-else-if="phase === 'sending'" class="arc__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
            <MiProgressRing variant="stop" stoppable :size="32" label="Stop sending" @stop="phase = 'stopped'" />
            <MiText variant="footnote" tone="label2">Sending in batches of 50. Stop to cancel the rest.</MiText>
          </div>
          <div v-else class="arc__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
            <MiButton variant="tinted" size="small" @click="phase = 'review'">Reset the demo</MiButton>
          </div>
        </article>

        <MiCodeBlock :code="diff" filename="templates/renewal-notice.mjml" size="sm" :line-numbers="false" />
      </div>

      <aside class="arc__facts mi:@[760px]:col-[2] mi:@[1080px]:col-[auto] mi:grid mi:gap-1.5 mi:content-start mi:min-w-0 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1" aria-labelledby="arc-facts-title">
        <MiText id="arc-facts-title" as="h3" variant="caption" weight="semibold" tone="label3" class="arc__label">Run details</MiText>
        <MiDetails :items="facts" label-width="96px" />
        <MiTextLink href="#arc-audit" @click.prevent>Open the audit log</MiTextLink>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Phase = 'review' | 'sending' | 'denied' | 'stopped'
type StepStatus = 'done' | 'running' | 'error' | 'pending'
interface Step { title: string, description?: string, status: StepStatus, duration?: number, detail?: string }

const phase = ref<Phase>('review')
const annualOnly = ref(false)
const recipients = computed(() => (annualOnly.value ? 88 : 214))

const orb = computed(() => (phase.value === 'sending' ? 'working' : phase.value === 'review' ? 'listening' : 'idle'))
const status = computed(() => ({
  review: 'Waiting for your approval',
  sending: `Sending ${recipients.value} emails`,
  denied: 'Declined. Nothing was sent.',
  stopped: 'Stopped by you. 50 emails went out before the stop.'
})[phase.value])
const askNote = computed(() => ({
  review: 'Emails can’t be recalled once sent. Review the change and the audience first.',
  sending: 'Approved by you just now. The agent posts a summary when it finishes.',
  denied: 'You declined this step. The agent will skip it and report back.',
  stopped: 'The remaining emails were cancelled. Resend from Postmark if needed.'
})[phase.value])

const sendStep = computed<Step>(() => ({
  review: { title: 'Send to customers', description: 'Needs approval', status: 'pending' as const },
  sending: { title: 'Send to customers', description: `${recipients.value} recipients`, status: 'running' as const },
  denied: { title: 'Send to customers', description: 'Skipped: declined', status: 'error' as const },
  stopped: { title: 'Send to customers', description: 'Stopped after 50', status: 'error' as const }
})[phase.value])

const steps = computed<Step[]>(() => [
  { title: 'Read ticket BILL-482', description: 'Brief from finance', status: 'done', duration: 1200 },
  { title: 'Query renewing accounts', description: '214 rows', status: 'done', duration: 3400, detail: 'Accounts with a renewal date between Jan 1 and Mar 31 and an active billing contact.' },
  { title: 'Update the template', description: '1 file changed', status: 'done', duration: 5800 },
  { title: 'Send a test email', description: 'finance-ops inbox', status: 'done', duration: 2100 },
  sendStep.value,
  { title: 'Post a summary in #billing-ops', status: 'pending' }
])

// Avatars only use initials; these are sample account owners.
const sample = [{ name: 'Lena Fischer' }, { name: 'Omar Haddad' }, { name: 'Grace Okafor' }, { name: 'Tomás Rivera' }]

const diff = `- <mj-text>Your plan renews soon.</mj-text>
+ <mj-text>Your {{plan}} plan renews on {{renewal_date}}.</mj-text>
+ <mj-text>Lock in this year’s price: renew before {{price_lock_date}}.</mj-text>
  <mj-button href="{{billing_url}}">Review your plan</mj-button>`

const facts = [
  { key: 'model', label: 'Model', value: 'Billing agent v3' },
  { key: 'tools', label: 'Tools', value: 'Postgres, Git, Postmark' },
  { key: 'tokens', label: 'Tokens', value: '48.2k of 200k' },
  { key: 'cost', label: 'Cost', value: '$0.41' },
  { key: 'started', label: 'Started', value: 'Today, 10:14' },
  { key: 'owner', label: 'Requested by', value: 'Priya Natarajan' }
]
</script>

<style scoped>
.arc__run { display: none; }
@container (min-width: 640px) { .arc__run { display: inline-flex; } }

.arc__label { margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; }
.arc__facts > :last-child { margin-top: 6px; }
.arc__ask.is-sending { box-shadow: var(--mi-sh1), inset 0 0 0 1.5px color-mix(in srgb, var(--mi-green) 45%, transparent); }
.arc__ask.is-denied, .arc__ask.is-stopped { box-shadow: var(--mi-sh1), inset 0 0 0 1px var(--mi-sep); }
.arc__ask.is-sending .arc__ask-icon { color: var(--mi-green-t); }
.arc__ask.is-denied .arc__ask-icon, .arc__ask.is-stopped .arc__ask-icon { background: var(--mi-fill4); color: var(--mi-label2); }
.arc__who > :last-child { flex: 1 1 200px; min-width: 0; }
</style>
