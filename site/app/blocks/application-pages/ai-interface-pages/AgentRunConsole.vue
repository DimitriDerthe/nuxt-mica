<template>
  <section class="arc" aria-labelledby="arc-title">
    <header class="arc__bar">
      <MiOrb :state="orb" size="md" :paused="phase === 'denied' || phase === 'stopped'" label="" />
      <div class="arc__bar-text">
        <MiText id="arc-title" as="h2" variant="headline" weight="semibold" :lines="1">Send the new renewal notice to Q1 renewals</MiText>
        <div class="arc__status" aria-live="polite">
          <MiShimmerText :text="status" :paused="phase !== 'sending'" />
        </div>
      </div>
      <MiBadge class="arc__run" tone="neutral" variant="outline" label="Run 7f3a · Billing agent" />
    </header>

    <div class="arc__in">
      <aside class="arc__plan" aria-labelledby="arc-plan-title">
        <MiText id="arc-plan-title" as="h3" variant="caption" weight="semibold" tone="label3" class="arc__label">Plan</MiText>
        <MiTrace :steps="steps" label="Agent plan and progress" />
      </aside>

      <div class="arc__main">
        <!-- The agent pauses before anything irreversible and hands the decision to a person. -->
        <article class="arc__ask" :class="'is-' + phase" aria-labelledby="arc-ask-title">
          <div class="arc__ask-head">
            <span class="arc__ask-icon" aria-hidden="true"><MiIcon :name="phase === 'review' ? 'lock' : phase === 'sending' ? 'check-circle' : 'exclamation-circle'" :size="18" /></span>
            <div>
              <MiText id="arc-ask-title" as="h3" variant="headline">Send {{ recipients }} emails through Postmark</MiText>
              <MiText variant="footnote" tone="label2">{{ askNote }}</MiText>
            </div>
          </div>

          <div class="arc__who">
            <MiAvatarGroup :items="sample" :max="3" size="sm" :label="`Recipients include ${sample.map(s => s.name).join(', ')}`" />
            <MiText variant="footnote" tone="label2">Northwind Labs, Fernhill Clinics, Brightpath and {{ recipients - 3 }} more account owners</MiText>
          </div>

          <MiCheckbox
            v-model="annualOnly" :disabled="phase !== 'review'" label="Only accounts on annual plans"
            description="88 accounts. Monthly plans get the in-app banner instead."
          />

          <div v-if="phase === 'review'" class="arc__actions">
            <MiButton @click="phase = 'sending'">Approve and send</MiButton>
            <MiButton variant="gray" @click="phase = 'denied'">Decline</MiButton>
          </div>
          <div v-else-if="phase === 'sending'" class="arc__actions">
            <MiProgressRing variant="stop" stoppable :size="32" label="Stop sending" @stop="phase = 'stopped'" />
            <MiText variant="footnote" tone="label2">Sending in batches of 50. Stop to cancel the rest.</MiText>
          </div>
          <div v-else class="arc__actions">
            <MiButton variant="tinted" size="small" @click="phase = 'review'">Reset the demo</MiButton>
          </div>
        </article>

        <MiCodeBlock :code="diff" filename="templates/renewal-notice.mjml" size="sm" :line-numbers="false" />
      </div>

      <aside class="arc__facts" aria-labelledby="arc-facts-title">
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
.arc { container-type: inline-size; display: grid; grid-template-rows: auto minmax(0, 1fr); min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }

.arc__bar { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-card); }
.arc__bar-text { flex: 1 1 220px; display: grid; gap: 2px; min-width: 0; }
.arc__status { font-size: 13px; color: var(--mi-label2); }
.arc__run { display: none; }
@container (min-width: 640px) { .arc__run { display: inline-flex; } }

.arc__in { display: grid; gap: 14px; align-content: start; padding: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .arc__in { grid-template-columns: 220px minmax(0, 1fr); } .arc__facts { grid-column: 2; } }
@container (min-width: 1080px) { .arc__in { grid-template-columns: 240px minmax(0, 1fr) 260px; } .arc__facts { grid-column: auto; } }

.arc__label { margin-bottom: 8px; text-transform: uppercase; letter-spacing: .06em; }
.arc__plan, .arc__facts { display: grid; gap: 6px; align-content: start; min-width: 0; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.arc__facts > :last-child { margin-top: 6px; }
.arc__main { display: grid; gap: 14px; align-content: start; min-width: 0; }

.arc__ask {
  display: grid; gap: 14px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card);
  box-shadow: var(--mi-sh1), inset 0 0 0 1.5px color-mix(in srgb, var(--mi-p) 45%, transparent);
}
.arc__ask.is-sending { box-shadow: var(--mi-sh1), inset 0 0 0 1.5px color-mix(in srgb, var(--mi-green) 45%, transparent); }
.arc__ask.is-denied, .arc__ask.is-stopped { box-shadow: var(--mi-sh1), inset 0 0 0 1px var(--mi-sep); }
.arc__ask-head { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; align-items: start; }
.arc__ask-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--mi-p-tint); color: var(--mi-p-text); }
.arc__ask.is-sending .arc__ask-icon { background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
.arc__ask.is-denied .arc__ask-icon, .arc__ask.is-stopped .arc__ask-icon { background: var(--mi-fill4); color: var(--mi-label2); }
.arc__who { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.arc__who > :last-child { flex: 1 1 200px; min-width: 0; }
.arc__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
</style>
