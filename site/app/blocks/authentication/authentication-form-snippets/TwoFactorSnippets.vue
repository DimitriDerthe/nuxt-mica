<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="tfs-title">
    <MiText id="tfs-title" as="h2" variant="headline" class="mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)] mi:overflow-hidden mi:whitespace-nowrap">Two-factor authentication snippets</MiText>

    <div class="mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:max-w-205 mi:my-0 mi:mx-auto mi:@[700px]:grid-cols-2">
      <!-- Snippet 1: the code challenge, with a recovery-code fallback and a resend cooldown. -->
      <article class="mi:grid mi:gap-3.5 mi:content-start mi:min-w-0 mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="tfs-verify-title">
        <template v-if="!verified">
          <div class="mi:grid mi:gap-1 mi:justify-items-start">
            <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:mb-1.5 mi:rounded-[11px] mi:bg-p-tint mi:text-p-text" aria-hidden="true"><MiIcon name="lock" :size="18" /></span>
            <MiText id="tfs-verify-title" as="h3" variant="headline">{{ useRecovery ? 'Use a recovery code' : 'Enter your code' }}</MiText>
            <MiText variant="footnote" tone="label2">
              {{ useRecovery ? 'Each recovery code works once.' : 'Open your authenticator app for ines@fernhill.health.' }}
            </MiText>
          </div>

          <form class="mi:grid mi:gap-3" novalidate @submit.prevent="useRecovery ? verifyRecovery() : verifyCode(code)">
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

          <MiText variant="caption" tone="label3">Sample code: <span class="mi:py-px mi:px-1.5 mi:rounded-[6px] mi:bg-fill3 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]">{{ useRecovery ? codes[0] : '428913' }}</span></MiText>
          <div class="mi:flex mi:flex-wrap mi:justify-between mi:gap-1 mi:-mt-1 mi:-mx-2.5 mi:mb-0">
            <MiButton variant="plain" size="small" :disabled="cooldown > 0 || useRecovery" @click="resend">
              {{ cooldown > 0 ? `Send by SMS in ${cooldown}s` : 'Send a code by SMS' }}
            </MiButton>
            <MiButton variant="plain" size="small" @click="toggleRecovery">{{ useRecovery ? 'Use the app instead' : 'Use a recovery code' }}</MiButton>
          </div>
        </template>

        <div v-else class="mi:grid mi:gap-1.5 mi:justify-items-center mi:py-6 mi:px-0 mi:text-center" role="status">
          <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:mb-1.5 mi:rounded-[11px] mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:text-green-t" aria-hidden="true"><MiIcon name="check" :size="20" /></span>
          <MiText id="tfs-verify-title" as="h3" variant="headline">You’re in</MiText>
          <MiText variant="footnote" tone="label2">{{ trust ? 'This browser won’t ask again until Dec 3.' : 'We’ll ask for a code next time you sign in.' }}</MiText>
          <MiButton variant="tinted" size="small" class="mi:mt-2.5!" @click="reset">Reset the demo</MiButton>
        </div>
      </article>

      <!-- Snippet 2: recovery codes shown once at setup, gated by an explicit "saved" check. -->
      <article class="mi:grid mi:gap-3.5 mi:content-start mi:min-w-0 mi:p-5.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="tfs-codes-title">
        <div class="mi:grid mi:gap-1 mi:justify-items-start">
          <span class="mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:mb-1.5 mi:rounded-[11px] mi:bg-p-tint mi:text-p-text" aria-hidden="true"><MiIcon name="document" :size="18" /></span>
          <MiText id="tfs-codes-title" as="h3" variant="headline">Save your recovery codes</MiText>
          <MiText variant="footnote" tone="label2">If you lose your phone, these are the only way back in. We won’t show them again.</MiText>
        </div>
        <ol class="mi:font-[ui-monospace,SFMono-Regular,Menlo,monospace] mi:font-medium mi:text-[14px] mi:leading-[1.4] mi:grid mi:grid-cols-2 mi:gap-y-2 mi:gap-x-4 mi:m-0 mi:py-3.5 mi:px-4 mi:[list-style:none] mi:rounded-md mi:bg-fill4 mi:[counter-reset:tfs]" aria-label="Recovery codes">
          <li class="mi:[counter-increment:tfs] mi:min-w-0 mi:before:content-[counter(tfs)_'.'] mi:before:inline-block mi:before:w-5.5 mi:before:text-label3 mi:before:text-[12px]" v-for="c in codes" :key="c" :class="{ 'mi:text-label3 mi:[text-decoration:line-through]': used.includes(c) }">{{ c }}</li>
        </ol>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
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
