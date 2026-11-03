<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="ast-title">
    <div class="mi:grid mi:gap-3.5 mi:@[640px]:grid-cols-2 mi:@[980px]:grid-cols-3">
    <MiText id="ast-title" as="h2" variant="headline" weight="semibold" class="mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)] mi:overflow-hidden mi:whitespace-nowrap">Authentication snippets</MiText>

    <!-- 1. Magic link: the card turns into its own confirmation. -->
    <article class="mi:grid mi:content-start mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="ast-magic">
      <header class="mi:flex mi:items-center mi:gap-2.5">
        <span class="mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-[11px] mi:bg-p-tint mi:text-p-text" aria-hidden="true"><MiIcon :svg="sparkMail" :size="18" /></span>
        <MiText id="ast-magic" as="h3" variant="headline" weight="semibold">Email me a sign-in link</MiText>
      </header>
      <form v-if="!sent" class="mi:grid mi:gap-3" novalidate @submit.prevent="sendLink">
        <MiField label="Email" :error="mailError">
          <template #default="{ id, describedBy }">
            <MiInput :id="id" v-model="mail" type="email" placeholder="you@studio.com" :aria-describedby="describedBy" @update:model-value="mailError = ''" />
          </template>
        </MiField>
        <MiButton type="submit" block :loading="sending">Send link</MiButton>
        <MiText variant="caption" tone="label3">No password to remember. Links expire after 15 minutes.</MiText>
      </form>
      <div v-else class="mi:[--mi-in-s:.96] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:animate-none mi:grid mi:justify-items-center mi:gap-1.5 mi:pt-2 mi:px-0 mi:pb-0" role="status">
        <div class="mi:relative mi:w-16 mi:h-11.5 mi:mb-2 mi:rounded-[8px] mi:[background:linear-gradient(160deg,_var(--mi-p-tint2),_var(--mi-p-tint))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_30%,_transparent)] mi:overflow-hidden" aria-hidden="true"><span class="mi:absolute mi:left-1/2 mi:-top-6 mi:w-11 mi:h-11 mi:rounded-[6px] mi:shadow-[0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_30%,_transparent)] mi:transform-[translateX(-50%)_rotate(45deg)] mi:bg-card" /></div>
        <MiText variant="subheadline" weight="semibold" align="center">Check {{ mail }}</MiText>
        <MiText variant="caption" tone="label2" align="center">Open the link on this device to continue. It works once.</MiText>
        <MiButton variant="plain" size="small" @click="sent = false">Use a different email</MiButton>
      </div>
    </article>

    <!-- 2. Create a password: the strength meter and the match check run as you type. -->
    <article class="mi:grid mi:content-start mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="ast-pass">
      <header class="mi:flex mi:items-center mi:gap-2.5">
        <span class="mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-[11px] mi:bg-s-tint mi:text-s-text" aria-hidden="true"><MiIcon name="lock" :size="18" /></span>
        <MiText id="ast-pass" as="h3" variant="headline" weight="semibold">Choose a password</MiText>
      </header>
      <form class="mi:grid mi:gap-3" novalidate @submit.prevent="savePass">
        <MiField label="New password">
          <template #default="{ id }">
            <MiInput :id="id" v-model="pass" type="password" autocomplete="new-password" />
          </template>
        </MiField>
        <MiPasswordStrength :value="pass" :requirements="['length', 'upper', 'number', 'symbol']" :min-length="10" @score="score = $event" />
        <MiField label="Confirm password" :error="confirmError" :success="matchOk ? 'Passwords match' : ''">
          <template #default="{ id, describedBy }">
            <MiInput :id="id" v-model="confirm" type="password" autocomplete="new-password" :aria-describedby="describedBy" />
          </template>
        </MiField>
        <MiButton type="submit" block :disabled="score < 3 || !matchOk">{{ saved ? 'Password saved' : 'Save password' }}</MiButton>
      </form>
    </article>

    <!-- 3. Returning user with a passkey: one tap, with a calm scanning state. -->
    <article class="mi:@[640px]:col-[span_2] mi:@[980px]:col-[auto] mi:grid mi:content-start mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="ast-key">
      <header class="mi:flex mi:items-center mi:gap-2.5">
        <span class="mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-[11px] mi:bg-fill3 mi:text-label" aria-hidden="true"><MiIcon :svg="fingerprint" :size="18" /></span>
        <MiText id="ast-key" as="h3" variant="headline" weight="semibold">Welcome back</MiText>
      </header>
      <div class="mi:flex mi:items-center mi:gap-3 mi:p-3 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:min-w-0">
        <MiAvatar name="Théo Lambert" tone="auto" decorative />
        <div class="mi:min-w-0">
          <MiText variant="subheadline" weight="semibold">Théo Lambert</MiText>
          <MiText variant="caption" tone="label2">theo@lambert.studio · last seen on MacBook Air</MiText>
        </div>
      </div>
      <div class="mi:relative mi:grid mi:place-items-center mi:justify-self-center mi:w-21 mi:h-21 mi:rounded-[50%] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="keyState === 'ok' ? 'mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:transform-[scale(1.04)]' : 'mi:text-p-text mi:[background:var(--mi-p-tint)]'" aria-hidden="true">
        <MiIcon :svg="keyState === 'ok' ? checkGlyph : fingerprint" :size="38" :weight="1.5" />
        <span class="mi:absolute mi:inset-0 mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-p)]" :class="keyState === 'scanning' ? 'mi:opacity-70 mi:[--mi-out-s:1.35] mi:animate-[out_1.1s_var(--mi-ease)_infinite] mi:motion-reduce:animate-none mi:motion-reduce:opacity-0' : 'mi:opacity-0'" />
      </div>
      <MiText variant="caption" tone="label2" align="center" aria-live="polite">{{ keyCopy }}</MiText>
      <div class="mi:grid mi:gap-3">
        <MiButton block :loading="keyState === 'scanning'" :disabled="keyState === 'ok'" @click="usePasskey">Continue with passkey</MiButton>
        <MiButton variant="plain" size="small" @click="keyState = 'idle'">Not Théo? Switch account</MiButton>
      </div>
    </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

const sparkMail = '<rect x="3" y="6" width="14" height="12" rx="2.5"/><path d="m4 8 6 4.5L16 8"/><path d="M20 3v4M18 5h4"/>'
const fingerprint = '<path d="M12 11v3a8 8 0 0 1-1.2 4.2"/><path d="M8.5 13.5a3.5 3.5 0 0 1 7 0V15a12 12 0 0 1-.6 3.8"/><path d="M5.6 16A9 9 0 0 1 5 13a7 7 0 0 1 12.6-4.2"/><path d="M19 12.5V14a15 15 0 0 1-.4 3.4"/><path d="M8 4.3A9.5 9.5 0 0 1 20.5 9"/>'
const checkGlyph = '<path d="m6 12.5 4 4 8-9"/>'

const mail = ref('')
const mailError = ref('')
const sending = ref(false)
const sent = ref(false)
function sendLink() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value)) { mailError.value = 'That email looks incomplete.'; return }
  sending.value = true
  later(() => { sending.value = false; sent.value = true }, 700)
}

const pass = ref('')
const confirm = ref('')
const score = ref(0)
const saved = ref(false)
const matchOk = computed(() => confirm.value.length > 0 && confirm.value === pass.value)
const confirmError = computed(() => (confirm.value && confirm.value !== pass.value ? "Doesn't match yet" : ''))
function savePass() { if (score.value >= 3 && matchOk.value) saved.value = true }

const keyState = ref<'idle' | 'scanning' | 'ok'>('idle')
const keyCopy = computed(() => ({ idle: 'Use Touch ID or your phone to confirm.', scanning: 'Waiting for your device…', ok: 'Signed in. Redirecting to your boards.' })[keyState.value])
function usePasskey() {
  keyState.value = 'scanning'
  later(() => { keyState.value = 'ok' }, 1400)
}
</script>
