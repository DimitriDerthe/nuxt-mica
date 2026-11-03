<template>
  <section class="scs" aria-labelledby="scs-title">
    <div class="scs__layout">
      <aside class="scs__intro">
        <MiProgressRing :value="score" :size="88" label="Security setup progress">
          <span class="scs__ring">{{ doneCount }}/{{ tasks.length }}</span>
        </MiProgressRing>
        <div>
          <MiText id="scs-title" as="h2" variant="title3" weight="bold">Secure your account</MiText>
          <MiText variant="footnote" tone="label2">Do these in any order. Two are required before your team can invite you to the finance workspace.</MiText>
        </div>
        <MiButton block :disabled="!requiredDone" @click="finished = true">{{ finished ? 'All set' : 'Finish setup' }}</MiButton>
        <MiText variant="caption" :tone="requiredDone ? 'green' : 'label3'" aria-live="polite">
          {{ requiredDone ? 'Required steps complete.' : `${requiredLeft} required ${requiredLeft === 1 ? 'step' : 'steps'} left` }}
        </MiText>
      </aside>

      <!-- Non-linear checklist: every task opens in place, no wizard order. -->
      <MiAccordion v-model="open" variant="plain" class="scs__list">
        <MiAccordionItem v-for="t in tasks" :key="t.id" :value="t.id">
          <template #title>
            <span class="scs__task">
              <span class="scs__check" :class="{ 'is-done': done[t.id] }" aria-hidden="true"><MiIcon name="check" :size="14" :weight="2.6" /></span>
              <span class="scs__task-text">
                <span class="scs__task-name">{{ t.title }}</span>
                <span class="scs__task-sub">{{ done[t.id] ? t.doneText : t.hint }}</span>
              </span>
              <MiBadge v-if="t.required && !done[t.id]" tone="warning" label="Required" />
            </span>
          </template>

          <div v-if="t.id === 'email'" class="scs__body">
            <MiText variant="footnote" tone="label2">Confirmed on 28 October from a link sent to noor.haddad@quillfield.com.</MiText>
          </div>

          <div v-else-if="t.id === 'totp'" class="scs__body">
            <MiText variant="footnote" tone="label2">Scan the key with your authenticator, then type the 6-digit code it shows. Sample code: 250731.</MiText>
            <div class="scs__key">
              <code class="scs__secret">{{ secret }}</code>
              <MiCopyButton :value="secret.replaceAll(' ', '')" label="Copy key" variant="outline" />
            </div>
            <MiCodeInput v-model="totp" :invalid="totpError" :disabled="done.totp" label="Authenticator code" @complete="checkTotp" />
            <MiText v-if="totpError" variant="caption" tone="red" role="alert">That code has expired or is wrong. Try the next one.</MiText>
          </div>

          <div v-else-if="t.id === 'codes'" class="scs__body">
            <ul class="scs__codes" aria-label="Recovery codes">
              <li v-for="c in recoveryCodes" :key="c">{{ c }}</li>
            </ul>
            <div class="scs__row">
              <MiCopyButton :value="recoveryCodes.join('\n')" label="Copy all codes" />
              <MiCheckbox v-model="done.codes" label="I stored these somewhere safe" />
            </div>
          </div>

          <form v-else class="scs__body" novalidate @submit.prevent="savePhone">
            <MiField label="Recovery phone" hint="Used only if you lose your authenticator." :error="phoneError">
              <MiInput v-model="phone" type="tel" prefix="+44" />
            </MiField>
            <MiButton type="submit" variant="tinted" size="small" :disabled="done.phone">{{ done.phone ? 'Saved' : 'Save phone' }}</MiButton>
          </form>
        </MiAccordionItem>
      </MiAccordion>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type TaskId = 'email' | 'totp' | 'codes' | 'phone'
interface Task { id: TaskId, title: string, hint: string, doneText: string, required?: boolean }

const tasks: Task[] = [
  { id: 'email', title: 'Verify your email', hint: 'Confirm the address on file', doneText: 'Verified' },
  { id: 'totp', title: 'Turn on two-step verification', hint: 'Authenticator app, about 1 minute', doneText: 'Authenticator linked', required: true },
  { id: 'codes', title: 'Save recovery codes', hint: '10 single-use codes', doneText: 'Codes stored', required: true },
  { id: 'phone', title: 'Add a recovery phone', hint: 'Optional backup by SMS', doneText: 'Phone saved' }
]
const secret = 'JBSW Y3DP EHPK 3PXP'
const recoveryCodes = ['8F2K-QW7M', 'T4XP-9LDA', 'Z6RC-H2NE', 'M3VB-7KJS', 'P9YD-4GQT', 'C5WN-8RFL', 'H7QA-2ZMX', 'L2JE-6TPV', 'X8GU-3BCK', 'D4SH-9NWR']

const done = reactive<Record<TaskId, boolean>>({ email: true, totp: false, codes: false, phone: false })
const open = ref<string | string[] | null>('totp')
const totp = ref('')
const totpError = ref(false)
const phone = ref('')
const phoneError = ref('')
const finished = ref(false)

const doneCount = computed(() => tasks.filter(t => done[t.id]).length)
const score = computed(() => Math.round(doneCount.value / tasks.length * 100))
const requiredLeft = computed(() => tasks.filter(t => t.required && !done[t.id]).length)
const requiredDone = computed(() => requiredLeft.value === 0)

function checkTotp(code: string) {
  totpError.value = code !== '250731'
  if (totpError.value) { totp.value = ''; return }
  done.totp = true
  open.value = 'codes'
}
function savePhone() {
  const digits = phone.value.replace(/\D/g, '')
  phoneError.value = digits.length >= 9 && digits.length <= 11 ? '' : 'Enter a UK mobile number, like 7700 900123.'
  if (!phoneError.value) done.phone = true
}
</script>

<style scoped>
.scs { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.scs__layout { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 720px) { .scs__layout { grid-template-columns: 240px minmax(0, 1fr); gap: 28px; padding: 28px; } }
.scs__intro { display: grid; align-content: start; justify-items: start; gap: 14px; }
.scs__ring { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }

.scs__list { min-width: 0; }
.scs__task { display: flex; align-items: center; gap: 12px; min-width: 0; text-align: start; }
.scs__check { display: grid; flex: none; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: transparent; box-shadow: inset 0 0 0 1.5px var(--mi-label3); }
.scs__check.is-done { color: var(--mi-p-on); background: var(--mi-p); box-shadow: none; }
.scs__task-text { display: grid; flex: 1; min-width: 0; }
.scs__task-name { font-size: 15px; font-weight: 600; }
.scs__task-sub { font-size: 12px; font-weight: 400; color: var(--mi-label2); }

.scs__body { display: grid; justify-items: start; gap: 12px; padding: 0 0 6px 36px; max-width: 100%; box-sizing: border-box; }
.scs__key, .scs__row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }
.scs__secret { padding: 6px 10px; border-radius: var(--mi-radius-s); background: var(--mi-fill3); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; letter-spacing: .08em; }
.scs__codes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 18px; margin: 0; padding: 12px 14px; list-style: none; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; font-variant-numeric: tabular-nums; }
@container (min-width: 520px) { .scs__codes { grid-template-columns: repeat(5, auto); } }
/* Code cells are 52px; shrink them so six fit beside the indent on phones. */
@container (max-width: 459px) {
  .scs__body { padding-left: 0; }
  .scs__body :deep(.mi-code) { gap: 6px; }
  .scs__body :deep(.mi-code__slot), .scs__body :deep(.mi-code__cell) { width: 42px; }
}
</style>
