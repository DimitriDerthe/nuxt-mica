<template>
  <section class="mlf" aria-labelledby="mlf-title">
    <div class="mlf__in">
      <div class="mlf__card">
        <!-- Link lifetime drains along the top edge once the email is sent. -->
        <span v-if="step !== 'email' && step !== 'done'" :key="'exp-' + sends" class="mlf__expiry" aria-hidden="true" />

        <div class="mlf__top">
          <div class="mlf__brand">
            <span class="mlf__mark" aria-hidden="true" />
            <MiText as="span" variant="subheadline" weight="semibold">Pellucid</MiText>
          </div>
          <ol class="mlf__rail" aria-label="Sign-in progress">
            <li v-for="(s, i) in railSteps" :key="s.id" :class="{ 'is-on': railIndex === i, 'is-done': railIndex > i }" :aria-current="railIndex === i ? 'step' : undefined">
              <span class="mlf__rail-dot" aria-hidden="true" />{{ s.label }}
            </li>
          </ol>
        </div>

        <Transition name="mlf-swap" mode="out-in">
          <!-- 1. Email -->
          <form v-if="step === 'email'" key="email" class="mlf__pane" novalidate @submit.prevent="send">
            <div class="mlf__head">
              <MiText id="mlf-title" as="h2" variant="title2" weight="bold" balance>Sign in without a password</MiText>
              <MiText variant="subheadline" tone="label2">We'll email you a one-tap link and a 6‑digit code. Use whichever reaches you first.</MiText>
            </div>
            <MiField label="Email address" :error="emailError">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="email" type="email" autocomplete="email" :aria-describedby="describedBy" placeholder="you@studio.com" />
              </template>
            </MiField>
            <MiButton type="submit" size="large" block :loading="busy">
              Email me a sign-in link
              <template #trailing><MiIcon name="arrow-right" :size="16" /></template>
            </MiButton>
            <div class="mlf__fine">
              <MiIcon name="lock" :size="14" />
              <MiText as="span" variant="caption" tone="label2">Links expire after 10 minutes and work once, on any device.</MiText>
            </div>
          </form>

          <!-- 2. Check your inbox -->
          <div v-else-if="step === 'sent'" key="sent" class="mlf__pane">
            <div class="mlf__envelope" aria-hidden="true">
              <svg viewBox="0 0 120 84">
                <rect x="6" y="14" width="108" height="64" rx="12" class="mlf__env-body" />
                <rect x="24" y="4" width="72" height="48" rx="6" class="mlf__env-letter" />
                <path d="M36 18h48M36 28h32" class="mlf__env-lines" />
                <path d="M6 26 60 58l54-32v40a12 12 0 0 1-12 12H18A12 12 0 0 1 6 66Z" class="mlf__env-front" />
              </svg>
            </div>
            <div class="mlf__head mlf__head--center">
              <MiText id="mlf-title" as="h2" variant="title2" weight="bold" align="center" balance>Check your inbox</MiText>
              <MiText variant="subheadline" tone="label2" align="center" balance>
                We sent a link to <strong class="mlf__addr">{{ email }}</strong>. Open it on this device and you're in.
              </MiText>
            </div>
            <div class="mlf__mail">
              <MiButton v-for="m in mailApps" :key="m.id" variant="bordered" :href="m.href" target="_blank" rel="noopener" class="mlf__mail-btn">
                <template #leading><span class="mlf__mail-mark" :class="'mlf__mail-mark--' + m.id" aria-hidden="true">{{ m.mark }}</span></template>
                Open {{ m.label }}
              </MiButton>
            </div>
            <MiButton variant="tinted" size="large" block @click="toCode">Enter the 6‑digit code instead</MiButton>
            <div class="mlf__row">
              <MiButton variant="plain" size="small" @click="change">Change email</MiButton>
              <MiButton variant="plain" size="small" :disabled="cooldown > 0" @click="resend">
                <span class="mlf__num">{{ cooldown > 0 ? `Resend in 0:${String(cooldown).padStart(2, '0')}` : 'Resend link' }}</span>
              </MiButton>
            </div>
          </div>

          <!-- 3. Code -->
          <form v-else-if="step === 'code'" key="code" class="mlf__pane" novalidate @submit.prevent="verify(code)">
            <div class="mlf__head mlf__head--center">
              <MiText id="mlf-title" as="h2" variant="title2" weight="bold" align="center" balance>Enter your code</MiText>
              <MiText variant="subheadline" tone="label2" align="center" balance>
                It's in the same email, under the button. Paste it anywhere in the boxes.
              </MiText>
            </div>
            <div class="mlf__code" :class="{ 'is-shaking': shake }" @animationend="shake = false">
              <MiCodeInput v-model="code" :length="6" :invalid="!!codeError" :disabled="busy" label="Sign-in code" @complete="verify" />
            </div>
            <div class="mlf__status" aria-live="polite">
              <MiText v-if="codeError" variant="footnote" tone="red" weight="medium" align="center">{{ codeError }}</MiText>
              <MiText v-else-if="busy" variant="footnote" tone="label2" align="center">Checking the code…</MiText>
              <MiText v-else variant="footnote" tone="label3" align="center">Code from the sample email: <span class="mlf__num">319 604</span></MiText>
            </div>
            <MiButton type="submit" size="large" block :loading="busy" :disabled="code.length < 6">Verify and sign in</MiButton>
            <div class="mlf__row">
              <MiButton variant="plain" size="small" @click="step = 'sent'">
                <template #leading><MiIcon name="arrow-left" :size="14" /></template>
                Back
              </MiButton>
              <MiButton variant="plain" size="small" @click="paste">Paste from clipboard</MiButton>
            </div>
          </form>

          <!-- 4. Signed in -->
          <div v-else key="done" class="mlf__pane mlf__done">
            <span class="mlf__done-glyph" aria-hidden="true"><MiIcon name="check" :size="26" :weight="2.6" /></span>
            <MiText id="mlf-title" as="h2" variant="title2" weight="bold" align="center">You're signed in</MiText>
            <MiText variant="subheadline" tone="label2" align="center" balance>Opening the Fennel Street rebrand board for {{ email }}.</MiText>
            <MiButton variant="plain" size="small" @click="restart">Sign in as someone else</MiButton>
          </div>
        </Transition>
      </div>

      <MiText variant="caption" tone="label3" align="center" class="mlf__foot">
        No email after a minute? Check Promotions or ask your admin to allow <span class="mlf__num">login@pellucid.app</span>.
      </MiText>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type Step = 'email' | 'sent' | 'code' | 'done'

const railSteps = [{ id: 'email', label: 'Email' }, { id: 'sent', label: 'Inbox' }, { id: 'code', label: 'Code' }]
const mailApps = [
  { id: 'gmail', label: 'Gmail', mark: 'M', href: 'https://mail.google.com/mail/u/0/#search/from%3Alogin%40pellucid.app' },
  { id: 'outlook', label: 'Outlook', mark: 'O', href: 'https://outlook.live.com/mail/0/' }
]
const SAMPLE = '319604'

const step = ref<Step>('email')
const email = ref('noor@fennelstreet.studio')
const emailError = ref('')
const code = ref('')
const codeError = ref('')
const busy = ref(false)
const shake = ref(false)
const cooldown = ref(0)
const sends = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const railIndex = computed(() => ({ email: 0, sent: 1, code: 2, done: 3 })[step.value])

function startCooldown() {
  cooldown.value = 30
  clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value = Math.max(0, cooldown.value - 1)
    if (!cooldown.value) clearInterval(timer)
  }, 1000)
}
function send() {
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value) ? '' : 'Enter the address you use for Pellucid.'
  if (emailError.value) return
  busy.value = true
  // UI demo only: nothing is sent anywhere.
  setTimeout(() => { busy.value = false; sends.value++; step.value = 'sent'; startCooldown() }, 700)
}
function resend() { sends.value++; startCooldown() }
function change() { step.value = 'email' }
function toCode() { code.value = ''; codeError.value = ''; step.value = 'code' }
function verify(value: string) {
  if (value.length < 6 || busy.value) return
  busy.value = true
  codeError.value = ''
  setTimeout(() => {
    busy.value = false
    if (value === SAMPLE) { step.value = 'done'; clearInterval(timer); return }
    codeError.value = "That code doesn't match. Check the newest email."
    shake.value = true
  }, 650)
}
async function paste() {
  try {
    const text = (await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, 6)
    if (text) { code.value = text; verify(text) }
  }
  catch { codeError.value = 'Clipboard access was blocked. Paste with Ctrl+V or Cmd+V instead.' }
}
function restart() { code.value = ''; step.value = 'email' }

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.mlf {
  container-type: inline-size; display: grid; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label);
  background:
    radial-gradient(60% 45% at 50% 0%, color-mix(in srgb, var(--mi-p) 14%, transparent), transparent 75%),
    radial-gradient(40% 40% at 100% 100%, color-mix(in srgb, var(--mi-s) 10%, transparent), transparent 70%),
    var(--mi-page);
}
.mlf__in { position: relative; isolation: isolate; display: grid; align-content: center; justify-items: center; gap: 18px; padding: 28px 16px; }
/* Faint dot field behind the card, faded out toward the edges. */
.mlf__in::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(circle, var(--mi-fill) 1px, transparent 1.6px) 0 0 / 20px 20px;
  -webkit-mask-image: radial-gradient(60% 55% at 50% 45%, black, transparent);
  mask-image: radial-gradient(60% 55% at 50% 45%, black, transparent);
}

.mlf__card {
  position: relative; display: grid; gap: 24px; width: 100%; max-width: 440px; padding: 22px 20px 24px; overflow: hidden;
  border-radius: 24px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh3);
}
.mlf__expiry {
  position: absolute; inset: 0 0 auto 0; height: 3px; transform-origin: left;
  background: linear-gradient(90deg, var(--mi-p), var(--mi-s));
  animation: mlf-drain 600s linear forwards;
}
@keyframes mlf-drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }

.mlf__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.mlf__brand { display: flex; align-items: center; gap: 8px; }
.mlf__mark {
  width: 18px; height: 18px; border-radius: 50%; background: conic-gradient(from 140deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 35%, var(--mi-card)), var(--mi-p));
  -webkit-mask: radial-gradient(circle, transparent 0 4px, black 4.5px); mask: radial-gradient(circle, transparent 0 4px, black 4.5px);
}
.mlf__rail { display: flex; gap: 14px; margin: 0; padding: 0; list-style: none; font-size: 12px; font-weight: 500; color: var(--mi-label3); }
.mlf__rail li { display: flex; align-items: center; gap: 6px; }
.mlf__rail li.is-on { color: var(--mi-label); font-weight: 600; }
.mlf__rail li.is-done { color: var(--mi-label2); }
.mlf__rail-dot { position: relative; width: 7px; height: 7px; border-radius: 50%; box-shadow: inset 0 0 0 1.5px currentColor; }
.mlf__rail-dot::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--mi-p); opacity: 0; transform: scale(.3); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring); }
.mlf__rail li.is-on .mlf__rail-dot::after, .mlf__rail li.is-done .mlf__rail-dot::after { opacity: 1; transform: scale(1); }
.mlf__rail li.is-on .mlf__rail-dot, .mlf__rail li.is-done .mlf__rail-dot { box-shadow: none; }
.mlf__rail li.is-done .mlf__rail-dot::after { opacity: .45; }

.mlf__pane { display: grid; gap: 16px; }
.mlf__head { display: grid; gap: 6px; }
.mlf__head--center { justify-items: center; }
.mlf__fine { display: flex; align-items: center; gap: 8px; color: var(--mi-label3); }
.mlf__addr { color: var(--mi-label); font-weight: 600; overflow-wrap: anywhere; }
.mlf__num { font-variant-numeric: tabular-nums; }

.mlf__envelope { justify-self: center; width: 112px; margin-bottom: 2px; animation: mlf-land 640ms var(--mi-spring) both; }
.mlf__envelope svg { display: block; width: 100%; height: auto; overflow: visible; }
.mlf__env-body { fill: color-mix(in srgb, var(--mi-p) 12%, var(--mi-card)); }
.mlf__env-letter { fill: var(--mi-card); stroke: var(--mi-sep); animation: mlf-tuck 760ms 120ms var(--mi-spring) both; }
.mlf__env-lines { fill: none; stroke: var(--mi-fill); stroke-width: 4; stroke-linecap: round; animation: mlf-tuck 760ms 120ms var(--mi-spring) both; }
.mlf__env-front { fill: color-mix(in srgb, var(--mi-p) 22%, var(--mi-card)); stroke: color-mix(in srgb, var(--mi-p) 40%, transparent); stroke-width: 1; }
@keyframes mlf-land { from { opacity: 0; transform: translateY(10px) scale(.94); } to { opacity: 1; transform: none; } }
@keyframes mlf-tuck { from { transform: translateY(-14px); } to { transform: translateY(0); } }

.mlf__mail { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.mlf__mail-btn { min-width: 0; }
.mlf__mail-mark { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 5px; font: 700 10px/1 var(--mi-font); }
.mlf__mail-mark--gmail { color: var(--mi-red-t, var(--mi-red)); background: color-mix(in srgb, var(--mi-red) 14%, transparent); }
.mlf__mail-mark--outlook { color: var(--mi-blue); background: color-mix(in srgb, var(--mi-blue) 14%, transparent); }
.mlf__row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px; }

.mlf__code { display: grid; justify-items: center; }
.mlf__code.is-shaking { animation: mlf-shake 360ms var(--mi-ease); }
@keyframes mlf-shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
.mlf__status { min-height: 18px; }

.mlf__done { justify-items: center; gap: 10px; padding: 10px 0 4px; }
.mlf__done-glyph {
  display: grid; place-items: center; width: 60px; height: 60px; margin-bottom: 6px; border-radius: 50%;
  color: var(--mi-green-t, var(--mi-green)); background: color-mix(in srgb, var(--mi-green) 14%, transparent);
  animation: mlf-land 560ms var(--mi-spring) both;
}
.mlf__foot { max-width: 400px; }

.mlf-swap-enter-active, .mlf-swap-leave-active { transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease); }
.mlf-swap-enter-from { opacity: 0; transform: translateX(14px); }
.mlf-swap-leave-to { opacity: 0; transform: translateX(-14px); }

@container (min-width: 520px) {
  .mlf__card { padding: 28px 32px 32px; }
  .mlf__in { padding: 40px 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .mlf__envelope, .mlf__env-letter, .mlf__env-lines, .mlf__done-glyph, .mlf__code.is-shaking { animation: none; }
}
</style>
