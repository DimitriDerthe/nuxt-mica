<template>
  <section class="ast" aria-labelledby="ast-title">
    <div class="ast__in">
    <MiText id="ast-title" as="h2" variant="headline" weight="semibold" class="ast__sr">Authentication snippets</MiText>

    <!-- 1. Magic link: the card turns into its own confirmation. -->
    <article class="ast__card" aria-labelledby="ast-magic">
      <header class="ast__head">
        <span class="ast__tile" aria-hidden="true"><MiIcon :svg="sparkMail" :size="18" /></span>
        <MiText id="ast-magic" as="h3" variant="headline" weight="semibold">Email me a sign-in link</MiText>
      </header>
      <form v-if="!sent" class="ast__stack" novalidate @submit.prevent="sendLink">
        <MiField label="Email" :error="mailError">
          <template #default="{ id, describedBy }">
            <MiInput :id="id" v-model="mail" type="email" placeholder="you@studio.com" :aria-describedby="describedBy" @update:model-value="mailError = ''" />
          </template>
        </MiField>
        <MiButton type="submit" block :loading="sending">Send link</MiButton>
        <MiText variant="caption" tone="label3">No password to remember. Links expire after 15 minutes.</MiText>
      </form>
      <div v-else class="ast__sent" role="status">
        <div class="ast__envelope" aria-hidden="true"><span /></div>
        <MiText variant="subheadline" weight="semibold" align="center">Check {{ mail }}</MiText>
        <MiText variant="caption" tone="label2" align="center">Open the link on this device to continue. It works once.</MiText>
        <MiButton variant="plain" size="small" @click="sent = false">Use a different email</MiButton>
      </div>
    </article>

    <!-- 2. Create a password: the strength meter and the match check run as you type. -->
    <article class="ast__card" aria-labelledby="ast-pass">
      <header class="ast__head">
        <span class="ast__tile ast__tile--s" aria-hidden="true"><MiIcon name="lock" :size="18" /></span>
        <MiText id="ast-pass" as="h3" variant="headline" weight="semibold">Choose a password</MiText>
      </header>
      <form class="ast__stack" novalidate @submit.prevent="savePass">
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
    <article class="ast__card ast__card--passkey" aria-labelledby="ast-key">
      <header class="ast__head">
        <span class="ast__tile ast__tile--n" aria-hidden="true"><MiIcon :svg="fingerprint" :size="18" /></span>
        <MiText id="ast-key" as="h3" variant="headline" weight="semibold">Welcome back</MiText>
      </header>
      <div class="ast__who">
        <MiAvatar name="Théo Lambert" tone="auto" decorative />
        <div>
          <MiText variant="subheadline" weight="semibold">Théo Lambert</MiText>
          <MiText variant="caption" tone="label2">theo@lambert.studio · last seen on MacBook Air</MiText>
        </div>
      </div>
      <div class="ast__scan" :class="'is-' + keyState" aria-hidden="true">
        <MiIcon :svg="keyState === 'ok' ? checkGlyph : fingerprint" :size="38" :weight="1.5" />
        <span class="ast__pulse" />
      </div>
      <MiText variant="caption" tone="label2" align="center" aria-live="polite">{{ keyCopy }}</MiText>
      <div class="ast__stack">
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

<style scoped>
.ast { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ast__in { display: grid; gap: 14px; }
@container (min-width: 640px) { .ast__in { grid-template-columns: repeat(2, minmax(0, 1fr)); } .ast__card--passkey { grid-column: span 2; } }
@container (min-width: 980px) { .ast__in { grid-template-columns: repeat(3, minmax(0, 1fr)); } .ast__card--passkey { grid-column: auto; } }
.ast__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.ast__card { display: grid; align-content: start; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ast__head { display: flex; align-items: center; gap: 10px; }
.ast__tile { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 11px; background: var(--mi-p-tint); color: var(--mi-p-text); }
.ast__tile--s { background: var(--mi-s-tint); color: var(--mi-s-text); }
.ast__tile--n { background: var(--mi-fill3); color: var(--mi-label); }
.ast__stack { display: grid; gap: 12px; }

.ast__sent { display: grid; justify-items: center; gap: 6px; padding: 8px 0 0; animation: ast-in var(--mi-dur-4) var(--mi-spring); }
@keyframes ast-in { from { opacity: 0; transform: scale(.96); } }
.ast__envelope { position: relative; width: 64px; height: 46px; margin-bottom: 8px; border-radius: 8px; background: linear-gradient(160deg, var(--mi-p-tint2), var(--mi-p-tint)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 30%, transparent); overflow: hidden; }
.ast__envelope span { position: absolute; left: 50%; top: -24px; width: 44px; height: 44px; border-radius: 6px; background: var(--mi-card); box-shadow: 0 0 0 1px color-mix(in srgb, var(--mi-p) 30%, transparent); transform: translateX(-50%) rotate(45deg); }

.ast__who { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); min-width: 0; }
.ast__who > div { min-width: 0; }
.ast__scan { position: relative; display: grid; place-items: center; justify-self: center; width: 84px; height: 84px; border-radius: 50%; color: var(--mi-p-text); background: var(--mi-p-tint); transition: transform var(--mi-dur-3) var(--mi-spring); }
.ast__scan.is-ok { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); transform: scale(1.04); }
.ast__pulse { position: absolute; inset: 0; border-radius: 50%; box-shadow: 0 0 0 2px var(--mi-p); opacity: 0; }
.ast__scan.is-scanning .ast__pulse { animation: ast-pulse 1.1s var(--mi-ease) infinite; }
@keyframes ast-pulse { from { opacity: .7; transform: scale(1); } to { opacity: 0; transform: scale(1.35); } }
@media (prefers-reduced-motion: reduce) { .ast__sent, .ast__scan.is-scanning .ast__pulse { animation: none; } }
</style>
