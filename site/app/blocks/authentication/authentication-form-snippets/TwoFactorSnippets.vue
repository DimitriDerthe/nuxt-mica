<template>
  <section class="tfs" aria-labelledby="tfs-title">
    <MiText id="tfs-title" as="h2" variant="headline" class="tfs__sr">Two-factor authentication snippets</MiText>

    <div class="tfs__grid">
      <!-- Snippet 1: the code challenge, with a recovery-code fallback and a resend cooldown. -->
      <article class="tfs__card" aria-labelledby="tfs-verify-title">
        <template v-if="!verified">
          <div class="tfs__head">
            <span class="tfs__icon" aria-hidden="true"><MiIcon name="lock" :size="18" /></span>
            <MiText id="tfs-verify-title" as="h3" variant="headline">{{ useRecovery ? 'Use a recovery code' : 'Enter your code' }}</MiText>
            <MiText variant="footnote" tone="label2">
              {{ useRecovery ? 'Each recovery code works once.' : 'Open your authenticator app for ines@fernhill.health.' }}
            </MiText>
          </div>

          <form class="tfs__form" novalidate @submit.prevent="useRecovery ? verifyRecovery() : verifyCode(code)">
            <MiField v-if="!useRecovery" label="6-digit code" :error="error">
              <MiCodeInput v-model="code" @complete="verifyCode" @update:model-value="error = ''" />
            </MiField>
            <template v-else>
              <MiField label="Recovery code" :error="error">
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="recovery" autocomplete="one-time-code" placeholder="xxxx-xxxx" :aria-describedby="describedBy" @update:model-value="error = ''" />
                </template>
              </MiField>
              <MiButton type="submit" block>Verify</MiButton>
            </template>
            <MiCheckbox v-model="trust" label="Trust this browser for 30 days" />
          </form>

          <MiText variant="caption" tone="label3">Sample code: <span class="tfs__mono">{{ useRecovery ? codes[0] : '428913' }}</span></MiText>
          <div class="tfs__links">
            <MiButton variant="plain" size="small" :disabled="cooldown > 0 || useRecovery" @click="resend">
              {{ cooldown > 0 ? `Send by SMS in ${cooldown}s` : 'Send a code by SMS' }}
            </MiButton>
            <MiButton variant="plain" size="small" @click="toggleRecovery">{{ useRecovery ? 'Use the app instead' : 'Use a recovery code' }}</MiButton>
          </div>
        </template>

        <div v-else class="tfs__done" role="status">
          <span class="tfs__icon is-ok" aria-hidden="true"><MiIcon name="check" :size="20" /></span>
          <MiText id="tfs-verify-title" as="h3" variant="headline">You’re in</MiText>
          <MiText variant="footnote" tone="label2">{{ trust ? 'This browser won’t ask again until Dec 3.' : 'We’ll ask for a code next time you sign in.' }}</MiText>
          <MiButton variant="tinted" size="small" @click="reset">Reset the demo</MiButton>
        </div>
      </article>

      <!-- Snippet 2: recovery codes shown once at setup, gated by an explicit "saved" check. -->
      <article class="tfs__card" aria-labelledby="tfs-codes-title">
        <div class="tfs__head">
          <span class="tfs__icon" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
          <MiText id="tfs-codes-title" as="h3" variant="headline">Save your recovery codes</MiText>
          <MiText variant="footnote" tone="label2">If you lose your phone, these are the only way back in. We won’t show them again.</MiText>
        </div>
        <ol class="tfs__codes" aria-label="Recovery codes">
          <li v-for="c in codes" :key="c" :class="{ 'is-used': used.includes(c) }">{{ c }}</li>
        </ol>
        <div class="tfs__row">
          <MiCopyButton :get-value="() => codes.join('\n')" label="Copy all" />
          <MiButton variant="gray" size="small" @click="regenerate">Generate new codes</MiButton>
        </div>
        <MiCheckbox v-model="stored" label="I’ve stored these somewhere safe" />
        <MiButton block :disabled="!stored || finished" @click="finished = true">{{ finished ? 'Two-factor is on' : 'Finish setup' }}</MiButton>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const SAMPLE_CODE = '428913'
const COOLDOWN = 30

const code = ref('')
const recovery = ref('')
const error = ref('')
const useRecovery = ref(false)
const trust = ref(true)
const verified = ref(false)

// Sample recovery codes; a real app gets them once from the server.
const sets = [
  ['k7q2-m9xd', 'p4rt-8vne', 'h2cw-6jzb', 'u9fa-3lpk', 'e5ny-q1ts', 'w8gd-r4oh', 'b3mx-t7vc', 'z6lu-n2qe'],
  ['r2vn-5hkw', 'c8tp-1qzm', 'y4dg-9wfa', 'm7sx-3bnl', 'f1qe-6ur8', 'j5ko-2cyt', 'n9wb-7alp', 's3hz-4evd']
]
const setIndex = ref(0)
const codes = ref<string[]>([...sets[0]!])
const used = ref<string[]>([])
const stored = ref(false)
const finished = ref(false)

const cooldown = ref(COOLDOWN)
let timer: ReturnType<typeof setInterval> | undefined
function startCooldown () {
  clearInterval(timer)
  cooldown.value = COOLDOWN
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}
onMounted(startCooldown)
onBeforeUnmount(() => clearInterval(timer))

function verifyCode (value: string) {
  if (value.length < SAMPLE_CODE.length) { error.value = 'Enter all 6 digits.'; return }
  if (value === SAMPLE_CODE) { verified.value = true; return }
  error.value = 'That code didn’t match. Codes change every 30 seconds.'
  code.value = ''
}
function verifyRecovery () {
  const value = recovery.value.trim().toLowerCase()
  if (!codes.value.includes(value) || used.value.includes(value)) { error.value = 'That recovery code isn’t valid or was already used.'; return }
  used.value = [...used.value, value]
  verified.value = true
}
function toggleRecovery () { useRecovery.value = !useRecovery.value; error.value = '' }
function resend () { startCooldown() }
function regenerate () {
  setIndex.value = (setIndex.value + 1) % sets.length
  codes.value = [...sets[setIndex.value]!]
  used.value = []
  stored.value = false
  finished.value = false
}
function reset () { verified.value = false; code.value = ''; recovery.value = ''; error.value = '' }
</script>

<style scoped>
.tfs { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.tfs__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.tfs__grid { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); max-width: 820px; margin: 0 auto; }
@container (min-width: 700px) { .tfs__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.tfs__card { display: grid; gap: 14px; align-content: start; min-width: 0; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tfs__head { display: grid; gap: 4px; justify-items: start; }
.tfs__icon { display: grid; place-items: center; width: 36px; height: 36px; margin-bottom: 6px; border-radius: 11px; background: var(--mi-p-tint); color: var(--mi-p-text); }
.tfs__icon.is-ok { background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
.tfs__form { display: grid; gap: 12px; }
.tfs__mono { padding: 1px 6px; border-radius: 6px; background: var(--mi-fill3); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.tfs__links { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px; margin: -4px -10px 0; }
.tfs__done { display: grid; gap: 6px; justify-items: center; padding: 24px 0; text-align: center; }
.tfs__done > :last-child { margin-top: 10px; }

.tfs__codes {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; margin: 0; padding: 14px 16px; list-style: none;
  border-radius: var(--mi-radius-m); background: var(--mi-fill4); counter-reset: tfs;
  font: 500 14px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums;
}
.tfs__codes li { counter-increment: tfs; min-width: 0; }
.tfs__codes li::before { content: counter(tfs) "."; display: inline-block; width: 22px; color: var(--mi-label3); font-size: 12px; }
.tfs__codes li.is-used { color: var(--mi-label3); text-decoration: line-through; }
.tfs__row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
</style>
