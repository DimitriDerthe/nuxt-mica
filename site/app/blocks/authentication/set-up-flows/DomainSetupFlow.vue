<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="dsf-title">
    <div class="mi:grid mi:gap-5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[720px]:py-7 mi:@[720px]:px-8">
    <header class="mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3">
      <div>
        <MiText id="dsf-title" as="h2" variant="title3" weight="bold">Set up Tern Mail for your team</MiText>
        <MiText variant="footnote" tone="label2">About 4 minutes. Progress is saved as you go.</MiText>
      </div>
      <MiText variant="caption" tone="label2" weight="medium" tabular>{{ step + 1 }} / {{ steps.length }}</MiText>
    </header>

    <MiSteps :model-value="step" :steps="steps" orientation="horizontal" aria-label="Setup progress" @update:model-value="jump" />

    <div class="mi:min-h-70">
      <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[transition:opacity_var(--mi-dur-2)_linear]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[transition:opacity_var(--mi-dur-2)_linear]" enter-from-class="mi:opacity-0 mi:transform-[translateX(12px)] mi:motion-reduce:transform-none" leave-to-class="mi:opacity-0 mi:transform-[translateX(-12px)] mi:motion-reduce:transform-none">
        <!-- 1. Workspace -->
        <div v-if="step === 0" key="0" class="mi:grid mi:content-start mi:gap-3.5">
          <MiText as="h3" variant="headline" weight="semibold">Name your workspace</MiText>
          <div class="mi:grid mi:gap-3.5 mi:@[720px]:grid-cols-[1fr_1fr]">
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
        <div v-else-if="step === 1" key="1" class="mi:grid mi:content-start mi:gap-3.5">
          <MiText as="h3" variant="headline" weight="semibold">Connect your sending domain</MiText>
          <MiField label="Domain" :error="errs.domain">
            <template #default="{ id, describedBy }">
              <MiInput :id="id" v-model="form.domain" :aria-describedby="describedBy" @update:model-value="dnsState = 'idle'" />
            </template>
          </MiField>
          <MiText variant="footnote" tone="label2">Add these records at your DNS provider, then check them here.</MiText>
          <div class="mi:grid mi:rounded-lg mi:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:overflow-hidden" role="table" aria-label="DNS records">
            <div v-for="r in records" :key="r.host" class="mi:grid mi:grid-cols-[58px_minmax(0,_1fr)_auto] mi:[grid-template-areas:'type_host_end'_'value_value_value'] mi:items-center mi:gap-y-1 mi:gap-x-2.5 mi:py-2.5 mi:px-3 mi:not-first:border-t mi:not-first:border-t-sep mi:@[720px]:grid-cols-[64px_minmax(0,_.9fr)_minmax(0,_1.4fr)_auto] mi:@[720px]:[grid-template-areas:'type_host_value_end']" role="row">
              <span class="mi:[grid-area:type] mi:justify-self-start mi:py-0.5 mi:px-[7px] mi:rounded-[6px] mi:text-[11px] mi:font-bold mi:tracking-[.04em] mi:text-s-text mi:[background:var(--mi-s-tint)]" role="cell">{{ r.type }}</span>
              <code class="mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:[font:500_12px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:[grid-area:host] mi:text-label2" role="cell">{{ r.host }}</code>
              <code class="mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:[font:500_12px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:[grid-area:value]" role="cell">{{ r.value }}</code>
              <span class="mi:[grid-area:end] mi:justify-self-end" role="cell">
                <MiBadge v-if="dnsState === 'ok'" tone="success" label="Found" />
                <MiCopyButton v-else :value="r.value" :label="`Copy ${r.type} value`" variant="ghost" icon-only />
              </span>
            </div>
          </div>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2.5">
            <MiButton variant="tinted" size="small" :loading="dnsState === 'checking'" @click="checkDns">
              {{ dnsState === 'ok' ? 'Records verified' : 'Check records' }}
            </MiButton>
            <MiText variant="caption" tone="label2" aria-live="polite">{{ dnsCopy }}</MiText>
          </div>
        </div>

        <!-- 3. Team -->
        <div v-else-if="step === 2" key="2" class="mi:grid mi:content-start mi:gap-3.5">
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
        <div v-else key="3" class="mi:grid mi:content-start mi:gap-3.5">
          <template v-if="!launched">
            <MiText as="h3" variant="headline" weight="semibold">Review and launch</MiText>
            <MiDetails :items="summary" label-width="130px" />
          </template>
          <div v-else class="mi:grid mi:justify-items-center mi:gap-2 mi:py-6 mi:px-0" role="status">
            <span class="mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:rounded-[50%] mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))] mi:[--mi-in-s:.6] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:animate-none" aria-hidden="true"><MiIcon name="check" :size="26" :weight="2.4" /></span>
            <MiText as="h3" variant="title3" weight="bold" align="center">{{ form.name }} is live</MiText>
            <MiText variant="subheadline" tone="label2" align="center">Invitations went to {{ form.invites.length }} people. Your inbox is at {{ form.slug }}.ternmail.app.</MiText>
          </div>
        </div>
      </Transition>
    </div>

    <footer class="mi:flex mi:flex-wrap mi:justify-between mi:gap-2.5 mi:pt-4 mi:border-t mi:border-t-sep">
      <MiButton variant="gray" :disabled="step === 0 || launched" @click="back">Back</MiButton>
      <div class="mi:flex mi:flex-wrap mi:gap-2">
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
import { computed, reactive, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

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
  later(() => { dnsState.value = 'ok' }, 1100)
}
function launch() {
  launching.value = true
  later(() => { launching.value = false; launched.value = true }, 900)
}
function restart() { launched.value = false; step.value = 0; reached.value = 0; dnsState.value = 'idle' }
</script>
