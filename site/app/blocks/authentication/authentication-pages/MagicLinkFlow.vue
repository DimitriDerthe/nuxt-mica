<template>
  <section class="mi:@container mi:grid mi:min-h-full mi:font-mi mi:text-label mi:[background:radial-gradient(60%_45%_at_50%_0%,_color-mix(in_srgb,_var(--mi-p)_14%,_transparent),_transparent_75%),_radial-gradient(40%_40%_at_100%_100%,_color-mix(in_srgb,_var(--mi-s)_10%,_transparent),_transparent_70%),_var(--mi-page)]" aria-labelledby="mlf-title">
    <div class="mi:relative mi:isolate mi:grid mi:content-center mi:justify-items-center mi:gap-4.5 mi:py-7 mi:px-4 mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:-z-1 mi:before:pointer-events-none mi:before:[background:radial-gradient(circle,_var(--mi-fill)_1px,_transparent_1.6px)_0_0_/_20px_20px] mi:before:[-webkit-mask-image:radial-gradient(60%_55%_at_50%_45%,_black,_transparent)] mi:before:[mask-image:radial-gradient(60%_55%_at_50%_45%,_black,_transparent)] mi:@[520px]:py-10 mi:@[520px]:px-6">
      <div class="mi:relative mi:grid mi:gap-6 mi:w-full mi:max-w-110 mi:pt-5.5 mi:px-5 mi:pb-6 mi:overflow-hidden mi:rounded-[24px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh3)] mi:@[520px]:pt-7 mi:@[520px]:px-8 mi:@[520px]:pb-8">
        <!-- Link lifetime drains along the top edge once the email is sent. -->
        <span v-if="step !== 'email' && step !== 'done'" :key="'exp-' + sends" class="mi:absolute mi:top-0 mi:right-0 mi:bottom-auto mi:left-0 mi:h-[3px] mi:origin-left mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:[--mi-grow-x:1] mi:[--mi-grow-x-to:0] mi:animate-[grow_600s_linear_forwards]" aria-hidden="true" />

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
          <div class="mi:flex mi:items-center mi:gap-2">
            <span class="mi:w-4.5 mi:h-4.5 mi:rounded-[50%] mi:[background:conic-gradient(from_140deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_35%,_var(--mi-card)),_var(--mi-p))] mi:[-webkit-mask:radial-gradient(circle,_transparent_0_4px,_black_4.5px)] mi:[mask:radial-gradient(circle,_transparent_0_4px,_black_4.5px)]" aria-hidden="true" />
            <MiText as="span" variant="subheadline" weight="semibold">Pellucid</MiText>
          </div>
          <ol class="mi:flex mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:font-medium mi:text-label3" aria-label="Sign-in progress">
            <li class="mi:flex mi:items-center mi:gap-1.5" v-for="(s, i) in railSteps" :key="s.id" :class="railIndex === i ? 'mi:text-label mi:font-semibold' : railIndex > i ? 'mi:text-label2' : ''" :aria-current="railIndex === i ? 'step' : undefined">
              <span class="mi:relative mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[50%] mi:after:[background:var(--mi-p)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)]" :class="railIndex === i ? 'mi:shadow-none mi:after:opacity-100 mi:after:transform-[scale(1)]' : railIndex > i ? 'mi:shadow-none mi:after:opacity-45 mi:after:transform-[scale(1)]' : 'mi:shadow-[inset_0_0_0_1.5px_currentColor] mi:after:opacity-0 mi:after:transform-[scale(.3)]'" aria-hidden="true" />{{ s.label }}
            </li>
          </ol>
        </div>

        <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[translateX(14px)]" leave-to-class="mi:opacity-0 mi:transform-[translateX(-14px)]">
          <!-- 1. Email -->
          <form v-if="step === 'email'" key="email" class="mi:grid mi:gap-4" novalidate @submit.prevent="send">
            <div class="mi:grid mi:gap-1.5">
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
            <div class="mi:flex mi:items-center mi:gap-2 mi:text-label3">
              <MiIcon name="lock" :size="14" />
              <MiText as="span" variant="caption" tone="label2">Links expire after 10 minutes and work once, on any device.</MiText>
            </div>
          </form>

          <!-- 2. Check your inbox -->
          <div v-else-if="step === 'sent'" key="sent" class="mi:grid mi:gap-4">
            <div class="mi:justify-self-center mi:w-28 mi:mb-0.5 mi:[--mi-in-y:10px] mi:[--mi-in-s:.94] mi:animate-[in_640ms_var(--mi-spring)_both] mi:motion-reduce:animate-none" aria-hidden="true">
              <svg class="mi:block mi:w-full mi:h-auto mi:overflow-visible" viewBox="0 0 120 84">
                <rect x="6" y="14" width="108" height="64" rx="12" class="mi:fill-[color:color-mix(in_srgb,_var(--mi-p)_12%,_var(--mi-card))]" />
                <rect x="24" y="4" width="72" height="48" rx="6" class="mi:fill-card mi:stroke-sep mi:[--mi-in-o:1] mi:[--mi-in-y:-14px] mi:animate-[in_760ms_120ms_var(--mi-spring)_both] mi:motion-reduce:animate-none" />
                <path d="M36 18h48M36 28h32" class="mi:fill-[color:none] mi:stroke-fill mi:[stroke-width:4] mi:[stroke-linecap:round] mi:[--mi-in-o:1] mi:[--mi-in-y:-14px] mi:animate-[in_760ms_120ms_var(--mi-spring)_both] mi:motion-reduce:animate-none" />
                <path d="M6 26 60 58l54-32v40a12 12 0 0 1-12 12H18A12 12 0 0 1 6 66Z" class="mi:fill-[color:color-mix(in_srgb,_var(--mi-p)_22%,_var(--mi-card))] mi:stroke-p/40 mi:[stroke-width:1]" />
              </svg>
            </div>
            <div class="mi:grid mi:gap-1.5 mi:justify-items-center">
              <MiText id="mlf-title" as="h2" variant="title2" weight="bold" align="center" balance>Check your inbox</MiText>
              <MiText variant="subheadline" tone="label2" align="center" balance>
                We sent a link to <strong class="mi:text-label mi:font-semibold mi:wrap-anywhere">{{ email }}</strong>. Open it on this device and you're in.
              </MiText>
            </div>
            <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:gap-2">
              <MiButton v-for="m in mailApps" :key="m.id" variant="bordered" :href="m.href" target="_blank" rel="noopener" class="mi:min-w-0">
                <template #leading><span class="mi:inline-grid mi:place-items-center mi:w-4.5 mi:h-4.5 mi:rounded-[5px] mi:[font:700_10px/1_var(--mi-font)]" :class="m.id === 'gmail' ? 'mi:text-[color:var(--mi-red-t,_var(--mi-red))] mi:bg-red/14' : 'mi:text-blue mi:bg-blue/14'" aria-hidden="true">{{ m.mark }}</span></template>
                Open {{ m.label }}
              </MiButton>
            </div>
            <MiButton variant="tinted" size="large" block @click="toCode">Enter the 6‑digit code instead</MiButton>
            <div class="mi:flex mi:flex-wrap mi:justify-between mi:gap-1">
              <MiButton variant="plain" size="small" @click="change">Change email</MiButton>
              <MiButton variant="plain" size="small" :disabled="cooldown > 0" @click="resend">
                <span class="mi:tabular-nums">{{ cooldown > 0 ? `Resend in 0:${String(cooldown).padStart(2, '0')}` : 'Resend link' }}</span>
              </MiButton>
            </div>
          </div>

          <!-- 3. Code -->
          <form v-else-if="step === 'code'" key="code" class="mi:grid mi:gap-4" novalidate @submit.prevent="verify(code)">
            <div class="mi:grid mi:gap-1.5 mi:justify-items-center">
              <MiText id="mlf-title" as="h2" variant="title2" weight="bold" align="center" balance>Enter your code</MiText>
              <MiText variant="subheadline" tone="label2" align="center" balance>
                It's in the same email, under the button. Paste it anywhere in the boxes.
              </MiText>
            </div>
            <div class="mi:grid mi:justify-items-center" :class="{ 'mi:animate-[shake_360ms_var(--mi-ease)] mi:motion-reduce:animate-none': shake }" @animationend="shake = false">
              <MiCodeInput v-model="code" :length="6" :invalid="!!codeError" :disabled="busy" label="Sign-in code" @complete="verify" />
            </div>
            <div class="mi:min-h-4.5" aria-live="polite">
              <MiText v-if="codeError" variant="footnote" tone="red" weight="medium" align="center">{{ codeError }}</MiText>
              <MiText v-else-if="busy" variant="footnote" tone="label2" align="center">Checking the code…</MiText>
              <MiText v-else variant="footnote" tone="label3" align="center">Code from the sample email: <span class="mi:tabular-nums">319 604</span></MiText>
            </div>
            <MiButton type="submit" size="large" block :loading="busy" :disabled="code.length < 6">Verify and sign in</MiButton>
            <div class="mi:flex mi:flex-wrap mi:justify-between mi:gap-1">
              <MiButton variant="plain" size="small" @click="step = 'sent'">
                <template #leading><MiIcon name="arrow-left" :size="14" /></template>
                Back
              </MiButton>
              <MiButton variant="plain" size="small" @click="paste">Paste from clipboard</MiButton>
            </div>
          </form>

          <!-- 4. Signed in -->
          <div v-else key="done" class="mi:grid mi:gap-2.5 mi:justify-items-center mi:pt-2.5 mi:px-0 mi:pb-1">
            <span class="mi:[--mi-in-y:10px] mi:[--mi-in-s:.94] mi:animate-[in_560ms_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:grid mi:place-items-center mi:w-15 mi:h-15 mi:mb-1.5 mi:rounded-[50%] mi:text-[color:var(--mi-green-t,_var(--mi-green))] mi:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)]" aria-hidden="true"><MiIcon name="check" :size="26" :weight="2.6" /></span>
            <MiText id="mlf-title" as="h2" variant="title2" weight="bold" align="center">You're signed in</MiText>
            <MiText variant="subheadline" tone="label2" align="center" balance>Opening the Fennel Street rebrand board for {{ email }}.</MiText>
            <MiButton variant="plain" size="small" @click="restart">Sign in as someone else</MiButton>
          </div>
        </Transition>
      </div>

      <MiText variant="caption" tone="label3" align="center" class="mi:max-w-100">
        No email after a minute? Check Promotions or ask your admin to allow <span class="mi:tabular-nums">login@pellucid.app</span>.
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

