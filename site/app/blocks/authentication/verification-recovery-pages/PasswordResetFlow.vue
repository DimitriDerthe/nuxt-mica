<template>
  <section class="prf" aria-labelledby="prf-title">
    <div class="prf__card">
      <div class="prf__glyph" :class="'is-' + stage" aria-hidden="true">
        <MiIcon :name="glyph" :size="26" />
      </div>

      <!-- 1. Ask for the email. The answer is the same whether or not an account exists. -->
      <form v-if="stage === 'request'" class="prf__body" novalidate @submit.prevent="request">
        <div class="prf__head">
          <MiText id="prf-title" as="h2" variant="title2" weight="bold" align="center">Forgot your password?</MiText>
          <MiText variant="subheadline" tone="label2" align="center" balance>Enter your work email and we'll send a link that works for 30 minutes.</MiText>
        </div>
        <MiField label="Work email" :error="emailError">
          <MiInput v-model="email" type="email" />
        </MiField>
        <MiButton type="submit" size="large" block>Send reset link</MiButton>
        <MiButton class="prf__link" variant="plain" size="small">Back to sign in</MiButton>
      </form>

      <!-- 2. Check the inbox. The preview stands in for the email client. -->
      <div v-else-if="stage === 'sent'" class="prf__body">
        <div class="prf__head">
          <MiText id="prf-title" as="h2" variant="title2" weight="bold" align="center">Check your inbox</MiText>
          <MiText variant="subheadline" tone="label2" align="center" balance>If <strong class="prf__em">{{ email }}</strong> has an account, a reset link is on its way.</MiText>
        </div>
        <article class="prf__mail" aria-label="Email preview">
          <div class="prf__mail-from">
            <MiAvatar name="Tallyhall" initials="T" size="sm" tone="primary" decorative />
            <div>
              <MiText variant="footnote" weight="semibold">Tallyhall Security</MiText>
              <MiText variant="caption" tone="label2">Reset your password · just now</MiText>
            </div>
          </div>
          <MiText variant="footnote" tone="label2">Someone asked to reset the password for this account. If it was you, use the button below.</MiText>
          <MiButton variant="tinted" size="small" @click="stage = 'reset'">Choose a new password</MiButton>
        </article>
        <MiButton class="prf__link" variant="plain" size="small" @click="stage = 'request'">Use a different email</MiButton>
      </div>

      <!-- 3. Pick a new password with live strength and match feedback. -->
      <form v-else-if="stage === 'reset'" class="prf__body" novalidate @submit.prevent="save">
        <div class="prf__head">
          <MiText id="prf-title" as="h2" variant="title2" weight="bold" align="center">Choose a new password</MiText>
          <MiText variant="subheadline" tone="label2" align="center">For {{ email }}</MiText>
        </div>
        <MiField label="New password">
          <MiInput v-model="password" type="password" />
        </MiField>
        <MiPasswordStrength :value="password" :min-length="10" :requirements="['length', 'upper', 'number', 'symbol']" @score="score = $event" />
        <MiField label="Confirm password" :error="mismatch ? 'The passwords don\'t match yet.' : ''" :success="matches ? 'Passwords match' : ''">
          <MiInput v-model="confirm" type="password" />
        </MiField>
        <MiCheckbox v-model="signOutAll" label="Sign out of other devices" description="Recommended if you think someone else knows your old password." />
        <MiButton type="submit" size="large" block :disabled="!canSave">Update password</MiButton>
      </form>

      <!-- 4. Done. -->
      <div v-else class="prf__body" role="status">
        <div class="prf__head">
          <MiText id="prf-title" as="h2" variant="title2" weight="bold" align="center">Password updated</MiText>
          <MiText variant="subheadline" tone="label2" align="center" balance>
            {{ signOutAll ? 'Your other 3 sessions were signed out. ' : '' }}We sent a confirmation to {{ email }}.
          </MiText>
        </div>
        <MiButton size="large" block>Continue to Tallyhall</MiButton>
        <MiButton class="prf__link" variant="plain" size="small" @click="restart">Start over</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Stage = 'request' | 'sent' | 'reset' | 'done'
type IconName = 'lock' | 'tray' | 'pencil' | 'check-circle'

const stage = ref<Stage>('request')
const email = ref('ines.marchetti@tallyhall.co')
const emailError = ref('')
const password = ref('')
const confirm = ref('')
const score = ref(0)
const signOutAll = ref(true)

const glyphs: Record<Stage, IconName> = { request: 'lock', sent: 'tray', reset: 'pencil', done: 'check-circle' }
const glyph = computed(() => glyphs[stage.value])
const matches = computed(() => confirm.value.length > 0 && confirm.value === password.value)
const mismatch = computed(() => confirm.value.length >= password.value.length && confirm.value.length > 0 && !matches.value)
const canSave = computed(() => score.value >= 3 && matches.value)

function request() {
  emailError.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'Enter a valid email address.'
  if (!emailError.value) stage.value = 'sent'
}
function save() { if (canSave.value) stage.value = 'done' }
function restart() { password.value = ''; confirm.value = ''; stage.value = 'request' }
</script>

<style scoped>
.prf { container-type: inline-size; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; font-family: var(--mi-font); color: var(--mi-label); }
.prf__card {
  display: grid; justify-items: center; gap: 18px; width: 100%; max-width: 440px; padding: 28px 18px 22px; box-sizing: border-box;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2);
}
@container (min-width: 480px) { .prf__card { padding: 34px 34px 26px; } }
.prf__glyph {
  display: grid; place-items: center; width: 60px; height: 60px; border-radius: 50%; color: var(--mi-p-text); background: var(--mi-p-tint);
  transition: transform var(--mi-dur-4) var(--mi-spring);
}
.prf__glyph.is-done { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); transform: scale(1.08); }
.prf__body { display: grid; justify-items: stretch; gap: 14px; width: 100%; }
.prf__link { justify-self: center; }
.prf__head { display: grid; gap: 6px; }
.prf__em { color: var(--mi-label); font-weight: 600; overflow-wrap: anywhere; }

/* A stylised email card with a brand stripe on top, so the "check your inbox" step has something to act on. */
.prf__mail {
  display: grid; justify-items: start; gap: 10px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-page);
  box-shadow: inset 0 0 0 1px var(--mi-sep); background-image: linear-gradient(90deg, var(--mi-p) 0 33%, var(--mi-s) 33% 66%, var(--mi-p) 66%);
  background-size: 100% 3px; background-repeat: no-repeat;
}
.prf__mail-from { display: flex; align-items: center; gap: 10px; }
</style>
