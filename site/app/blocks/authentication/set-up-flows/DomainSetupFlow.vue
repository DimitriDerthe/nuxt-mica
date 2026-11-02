<template>
  <section class="dsf" aria-labelledby="dsf-title">
    <div class="dsf__in">
    <header class="dsf__head">
      <div>
        <MiText id="dsf-title" as="h2" variant="title3" weight="bold">Set up Tern Mail for your team</MiText>
        <MiText variant="footnote" tone="label2">About 4 minutes. Progress is saved as you go.</MiText>
      </div>
      <MiText variant="caption" tone="label2" weight="medium" tabular>{{ step + 1 }} / {{ steps.length }}</MiText>
    </header>

    <MiSteps :model-value="step" :steps="steps" orientation="horizontal" aria-label="Setup progress" @update:model-value="jump" />

    <div class="dsf__panel">
      <Transition name="dsf-swap" mode="out-in">
        <!-- 1. Workspace -->
        <div v-if="step === 0" key="0" class="dsf__pane">
          <MiText as="h3" variant="headline" weight="semibold">Name your workspace</MiText>
          <div class="dsf__grid">
            <MiField label="Company name" :error="errs.name">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="form.name" :aria-describedby="describedBy" @update:model-value="onName" />
              </template>
            </MiField>
            <MiField label="Workspace address" :error="errs.slug" hint="Lowercase letters, numbers and dashes">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="form.slug" suffix=".ternmail.app" :aria-describedby="describedBy" @update:model-value="slugTouched = true" />
              </template>
            </MiField>
          </div>
        </div>

        <!-- 2. Domain -->
        <div v-else-if="step === 1" key="1" class="dsf__pane">
          <MiText as="h3" variant="headline" weight="semibold">Connect your sending domain</MiText>
          <MiField label="Domain" :error="errs.domain">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="form.domain" :aria-describedby="describedBy" @update:model-value="dnsState = 'idle'" />
            </template>
          </MiField>
          <MiText variant="footnote" tone="label2">Add these records at your DNS provider, then check them here.</MiText>
          <div class="dsf__records" role="table" aria-label="DNS records">
            <div v-for="r in records" :key="r.host" class="dsf__record" role="row">
              <span class="dsf__type" role="cell">{{ r.type }}</span>
              <code class="dsf__host" role="cell">{{ r.host }}</code>
              <code class="dsf__value" role="cell">{{ r.value }}</code>
              <span class="dsf__rec-end" role="cell">
                <MiBadge v-if="dnsState === 'ok'" tone="success" label="Found" />
                <MiCopyButton v-else :value="r.value" :label="`Copy ${r.type} value`" variant="ghost" icon-only />
              </span>
            </div>
          </div>
          <div class="dsf__check">
            <MiButton variant="tinted" size="small" :loading="dnsState === 'checking'" @click="checkDns">
              {{ dnsState === 'ok' ? 'Records verified' : 'Check records' }}
            </MiButton>
            <MiText variant="caption" tone="label2" aria-live="polite">{{ dnsCopy }}</MiText>
          </div>
        </div>

        <!-- 3. Team -->
        <div v-else-if="step === 2" key="2" class="dsf__pane">
          <MiText as="h3" variant="headline" weight="semibold">Invite your teammates</MiText>
          <MiField label="Email addresses" :hint="`Press Return after each one · ${form.invites.length} of 10`" :error="errs.invites">
            <template #default>
              <MiTagInput v-model="form.invites" :max="10" :validate="isMail" placeholder="name@company.com" @reject="errs.invites = 'That address looks off, or it is already on the list.'" @add="errs.invites = ''" />
            </template>
          </MiField>
          <MiField label="They join as">
            <template #default="{ id }">
              <MiNativeSelect :id="id" v-model="form.role" :options="roleOptions" />
            </template>
          </MiField>
        </div>

        <!-- 4. Review -->
        <div v-else key="3" class="dsf__pane">
          <template v-if="!launched">
            <MiText as="h3" variant="headline" weight="semibold">Review and launch</MiText>
            <MiDetails :items="summary" label-width="130px" />
          </template>
          <div v-else class="dsf__done" role="status">
            <span class="dsf__done-mark" aria-hidden="true"><MiIcon name="check" :size="26" :weight="2.4" /></span>
            <MiText as="h3" variant="title3" weight="bold" align="center">{{ form.name }} is live</MiText>
            <MiText variant="subheadline" tone="label2" align="center">Invitations went to {{ form.invites.length }} people. Your inbox is at {{ form.slug }}.ternmail.app.</MiText>
          </div>
        </div>
      </Transition>
    </div>

    <footer class="dsf__foot">
      <MiButton variant="gray" :disabled="step === 0 || launched" @click="back">Back</MiButton>
      <div class="dsf__foot-end">
        <MiButton v-if="step === 1 && dnsState !== 'ok'" variant="plain" @click="advance(true)">Skip for now</MiButton>
        <MiButton v-if="step < 3" @click="advance(false)">Continue</MiButton>
        <MiButton v-else-if="!launched" :loading="launching" @click="launch">Launch workspace</MiButton>
        <MiButton v-else variant="tinted" @click="restart">Run setup again</MiButton>
      </div>
    </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const steps = [
  { label: 'Workspace', description: 'Name and address' },
  { label: 'Domain', description: 'DNS records' },
  { label: 'Team', description: 'Invitations' },
  { label: 'Launch', description: 'Review' }
]
const roleOptions = [{ value: 'member', label: 'Member: send and reply' }, { value: 'admin', label: 'Admin: manage billing and domains' }, { value: 'viewer', label: 'Viewer: read-only' }]

const step = ref(0)
const reached = ref(0)
const slugTouched = ref(false)
const dnsState = ref<'idle' | 'checking' | 'ok' | 'fail'>('idle')
const launching = ref(false)
const launched = ref(false)
const form = reactive({ name: 'Osprey Outfitters', slug: 'osprey-outfitters', domain: 'mail.ospreyoutfitters.com', invites: ['lea@ospreyoutfitters.com', 'karim@ospreyoutfitters.com'], role: 'member' as string | number | null })
const errs = reactive({ name: '', slug: '', domain: '', invites: '' })

const records = computed(() => [
  { type: 'TXT', host: form.domain || 'your-domain', value: 'v=spf1 include:send.ternmail.app ~all' },
  { type: 'CNAME', host: 'tm1._domainkey', value: 'tm1.dkim.ternmail.app' },
  { type: 'MX', host: form.domain || 'your-domain', value: '10 inbound.ternmail.app' }
])
const dnsCopy = computed(() => ({ idle: 'DNS changes can take a few minutes to show up.', checking: 'Looking up 3 records…', ok: 'All 3 records found. Mail will be signed.', fail: 'Not found yet.' })[dnsState.value])
const summary = computed(() => [
  { key: 'ws', label: 'Workspace', value: `${form.name} · ${form.slug}.ternmail.app` },
  { key: 'domain', label: 'Sending domain', value: dnsState.value === 'ok' ? `${form.domain} (verified)` : `${form.domain} (pending)` },
  { key: 'team', label: 'Invitations', value: form.invites.length ? `${form.invites.length} people as ${form.role}` : 'Nobody yet' },
  { key: 'plan', label: 'Plan', value: 'Team trial, 14 days, no card' }
])

const isMail = (t: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)
function onName(v: string) {
  errs.name = ''
  if (!slugTouched.value) form.slug = v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function validate(i: number) {
  if (i === 0) {
    errs.name = form.name.trim() ? '' : 'Add your company name.'
    errs.slug = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(form.slug) ? '' : 'Use lowercase letters, numbers and single dashes.'
    return !errs.name && !errs.slug
  }
  if (i === 1) {
    errs.domain = /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(form.domain) ? '' : 'Enter a domain like mail.example.com.'
    return !errs.domain
  }
  return true
}
function advance(skip: boolean) {
  if (!skip && !validate(step.value)) return
  if (skip) errs.domain = ''
  step.value++
  reached.value = Math.max(reached.value, step.value)
}
function back() { if (step.value > 0) step.value-- }
// Markers only jump to steps already reached, so validation can't be bypassed.
function jump(i: number) { if (i <= reached.value && !launched.value) step.value = i }
function checkDns() {
  if (!validate(1)) return
  dnsState.value = 'checking'
  setTimeout(() => { dnsState.value = 'ok' }, 1100)
}
function launch() {
  launching.value = true
  setTimeout(() => { launching.value = false; launched.value = true }, 900)
}
function restart() { launched.value = false; step.value = 0; reached.value = 0; dnsState.value = 'idle' }
</script>

<style scoped>
.dsf { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.dsf__in { display: grid; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 720px) { .dsf__in { padding: 28px 32px; } }
.dsf__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.dsf__panel { min-height: 280px; }
.dsf__pane { display: grid; align-content: start; gap: 14px; }
.dsf__grid { display: grid; gap: 14px; }
@container (min-width: 720px) { .dsf__grid { grid-template-columns: 1fr 1fr; } }

.dsf__records { display: grid; border-radius: var(--mi-radius-l); box-shadow: inset 0 0 0 1px var(--mi-sep); overflow: hidden; }
.dsf__record { display: grid; grid-template-columns: 58px minmax(0, 1fr) auto; grid-template-areas: "type host end" "value value value"; align-items: center; gap: 4px 10px; padding: 10px 12px; }
.dsf__record + .dsf__record { border-top: 1px solid var(--mi-sep); }
@container (min-width: 720px) { .dsf__record { grid-template-columns: 64px minmax(0, .9fr) minmax(0, 1.4fr) auto; grid-template-areas: "type host value end"; } }
.dsf__type { grid-area: type; justify-self: start; padding: 2px 7px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .04em; color: var(--mi-s-text); background: var(--mi-s-tint); }
.dsf__host, .dsf__value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 500 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.dsf__host { grid-area: host; color: var(--mi-label2); }
.dsf__value { grid-area: value; }
.dsf__rec-end { grid-area: end; justify-self: end; }
.dsf__check { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.dsf__done { display: grid; justify-items: center; gap: 8px; padding: 24px 0; }
.dsf__done-mark { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); animation: dsf-pop var(--mi-dur-4) var(--mi-spring); }
@keyframes dsf-pop { from { transform: scale(.6); opacity: 0; } }

.dsf__foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.dsf__foot-end { display: flex; flex-wrap: wrap; gap: 8px; }

.dsf-swap-enter-active, .dsf-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.dsf-swap-enter-from { opacity: 0; transform: translateX(12px); }
.dsf-swap-leave-to { opacity: 0; transform: translateX(-12px); }
@media (prefers-reduced-motion: reduce) { .dsf-swap-enter-active, .dsf-swap-leave-active { transition: opacity var(--mi-dur-2) linear; } .dsf-swap-enter-from, .dsf-swap-leave-to { transform: none; } .dsf__done-mark { animation: none; } }
</style>
