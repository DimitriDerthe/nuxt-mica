<template>
  <section class="mi:@container mi:grid mi:content-start mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:font-mi mi:text-label" aria-labelledby="vcr-title">
    <div class="mi:bg-card mi:[background-image:radial-gradient(80%_50%_at_50%_0%,_var(--mi-p-tint),_transparent_70%)] mi:grid mi:justify-items-center mi:gap-4.5 mi:w-full mi:max-w-115 mi:pt-7 mi:px-4.5 mi:pb-5.5 mi:box-border mi:rounded-xl mi:shadow-2 mi:@[480px]:pt-9 mi:@[480px]:px-9 mi:@[480px]:pb-6.5">
      <div class="mi:grid mi:place-items-center mi:w-15 mi:h-15 mi:rounded-[20px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_0_8px_24px_-10px_color-mix(in_srgb,_var(--mi-p)_60%,_transparent)] mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="verified ? 'mi:text-green-t mi:transform-[scale(1.08)]' : 'mi:text-p-text'" aria-hidden="true">
        <MiIcon :svg="verified ? shieldOk : (mode === 'code' ? envelope : keyGlyph)" :size="26" />
      </div>

      <template v-if="!verified">
        <div class="mi:grid mi:gap-1.5">
          <MiText id="vcr-title" as="h2" variant="title2" weight="bold" align="center" balance>
            {{ mode === 'code' ? 'Enter your verification code' : 'Use a recovery code' }}
          </MiText>
          <MiText variant="subheadline" tone="label2" align="center" balance>
            <template v-if="mode === 'code'">We sent a 6-digit code to <strong class="mi:text-label mi:font-semibold">{{ channelInfo.dest }}</strong>.</template>
            <template v-else>Each of the 10 codes you saved at setup works once. Dashes are optional.</template>
          </MiText>
        </div>

        <MiSegmented v-if="mode === 'code'" v-model="channel" label="Delivery channel" :options="channels" />

        <div class="mi:max-w-full mi:@max-[479px]:[&_.mi-code]:gap-1.5! mi:@max-[479px]:[&_.mi-code__slot]:w-11! mi:@max-[479px]:[&_.mi-code__cell]:w-11!" :class="{ 'mi:animate-[shake_.38s_var(--mi-ease)] mi:motion-reduce:animate-none': shake, 'mi:[&_.mi-code]:gap-1.5! mi:[&_.mi-code__slot]:w-10! mi:[&_.mi-code__cell]:w-10! mi:@max-[479px]:[&_.mi-code]:gap-1! mi:@max-[479px]:[&_.mi-code__slot]:w-[33px]! mi:@max-[479px]:[&_.mi-code__cell]:w-[33px]!': mode === 'recovery' }" @animationend="shake = false">
          <MiCodeInput
            v-if="mode === 'code'" :key="'c-' + channel" v-model="code" :length="6" :invalid="!!error" :disabled="attempts === 0" :label="'Code sent by ' + channelInfo.label" @complete="check"
          />
          <MiCodeInput
            v-else key="r" v-model="code" :length="8" mode="alphanumeric" :invalid="!!error" :disabled="attempts === 0" label="Recovery code" @complete="check"
          />
        </div>

        <div class="mi:min-h-5" aria-live="polite">
          <MiText v-if="error" variant="footnote" tone="red" weight="medium" align="center">{{ error }}</MiText>
          <MiText v-else variant="footnote" tone="label3" align="center">
            Sample code: <span class="mi:py-px mi:px-1.5 mi:rounded-[6px] mi:[background:var(--mi-fill3)] mi:text-label2 mi:tabular-nums mi:tracking-[.06em]">{{ mode === 'code' ? '482 913' : 'K7PD-Q2XM' }}</span>
          </MiText>
        </div>

        <div class="mi:flex mi:items-center mi:gap-1.5" role="img" :aria-label="`${attempts} of 3 attempts left`">
          <span class="mi:not-last:w-4.5 mi:not-last:h-1 mi:not-last:rounded-[2px] mi:not-last:[background:var(--mi-p)] mi:not-last:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" v-for="n in 3" :key="n" :class="{ 'mi:opacity-20': n > attempts }" />
          <MiText class="mi:ml-1.5! mi:not-last:w-4.5 mi:not-last:h-1 mi:not-last:rounded-[2px] mi:not-last:[background:var(--mi-p)] mi:not-last:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" as="span" variant="caption" tone="label2">{{ attempts }} {{ attempts === 1 ? 'attempt' : 'attempts' }} left</MiText>
        </div>

        <div class="mi:flex mi:flex-wrap mi:justify-center mi:gap-y-1 mi:gap-x-3 mi:pt-2.5 mi:border-t mi:border-t-sep mi:w-full">
          <MiButton v-if="mode === 'code'" variant="plain" size="small" :disabled="cooldown > 0" @click="resend">
            {{ cooldown > 0 ? `Resend in 0:${String(cooldown).padStart(2, '0')}` : 'Resend code' }}
          </MiButton>
          <MiButton variant="plain" size="small" @click="toggleMode">
            {{ mode === 'code' ? "Can't access it? Use a recovery code" : 'Back to the code we sent' }}
          </MiButton>
        </div>
      </template>

      <div v-else class="mi:grid mi:justify-items-center mi:gap-3 mi:w-full">
        <MiText id="vcr-title" as="h2" variant="title2" weight="bold" align="center">You're verified</MiText>
        <MiText variant="subheadline" tone="label2" align="center" balance>
          {{ mode === 'code' ? 'This device is now trusted for 30 days.' : 'Recovery code used. 9 codes remain; generate a fresh set from Security settings.' }}
        </MiText>
        <MiButton size="large" block>Continue to Ledgerline</MiButton>
        <MiButton variant="plain" size="small" @click="reset">Start over</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const envelope = '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'
const keyGlyph = '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l3 3M14 9l2 2"/>'
const shieldOk = '<path d="M12 3 5 6v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'

const channels = [{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'app', label: 'Authenticator' }]
const destinations: Record<string, { dest: string, label: string }> = {
  email: { dest: 'r.amadou@ledgerline.io', label: 'email' },
  sms: { dest: '+33 6 •• •• 41 07', label: 'SMS' },
  app: { dest: 'your authenticator app', label: 'authenticator app' }
}
const VALID = { code: '482913', recovery: 'K7PDQ2XM' }

const channel = ref<string | number | null>('email')
const mode = ref<'code' | 'recovery'>('code')
const code = ref('')
const error = ref('')
const attempts = ref(3)
const shake = ref(false)
const verified = ref(false)
const cooldown = ref(24)

const channelInfo = computed(() => destinations[String(channel.value)] ?? destinations.email!)

function check(value: string) {
  const ok = value.toUpperCase() === (mode.value === 'code' ? VALID.code : VALID.recovery)
  if (ok) { verified.value = true; error.value = ''; return }
  attempts.value = Math.max(0, attempts.value - 1)
  shake.value = true
  error.value = attempts.value
    ? "That code doesn't match. Check the latest message and try again."
    : 'Too many attempts. Request a new code to continue.'
  code.value = ''
}

let timer: ReturnType<typeof setInterval> | undefined
function startCooldown(seconds: number) {
  cooldown.value = seconds
  clearInterval(timer)
  timer = setInterval(() => { if (cooldown.value > 0) cooldown.value--; else clearInterval(timer) }, 1000)
}
function resend() { attempts.value = 3; error.value = ''; code.value = ''; startCooldown(30) }
function toggleMode() { mode.value = mode.value === 'code' ? 'recovery' : 'code'; attempts.value = 3; code.value = ''; error.value = '' }
function reset() { verified.value = false; mode.value = 'code'; attempts.value = 3; code.value = ''; error.value = '' }

watch(channel, () => { code.value = ''; error.value = '' })
watch(code, (v) => { if (v && error.value && attempts.value) error.value = '' })
onMounted(() => startCooldown(24))
onBeforeUnmount(() => clearInterval(timer))
</script>
