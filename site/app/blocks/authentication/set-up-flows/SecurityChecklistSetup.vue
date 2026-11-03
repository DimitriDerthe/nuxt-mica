<template>
  <section class="scs mi:@container mi:font-mi mi:text-label" aria-labelledby="scs-title">
    <div class="scs__layout mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[720px]:grid-cols-[240px_minmax(0,_1fr)] mi:@[720px]:gap-7 mi:@[720px]:p-7">
      <aside class="scs__intro mi:grid mi:content-start mi:justify-items-start mi:gap-3.5">
        <MiProgressRing :value="score" :size="88" label="Security setup progress">
          <span class="scs__ring mi:text-[18px] mi:font-bold mi:tabular-nums">{{ doneCount }}/{{ tasks.length }}</span>
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
            <span class="scs__task mi:flex mi:items-center mi:gap-3 mi:min-w-0 mi:text-start">
              <span class="scs__check mi:grid mi:flex-[none] mi:place-items-center mi:w-6 mi:h-6 mi:rounded-[50%] mi:text-transparent mi:shadow-[inset_0_0_0_1.5px_var(--mi-label3)] mi:[&.is-done]:text-p-on mi:[&.is-done]:bg-p mi:[&.is-done]:shadow-none" :class="{ 'is-done': done[t.id] }" aria-hidden="true"><MiIcon name="check" :size="14" :weight="2.6" /></span>
              <span class="scs__task-text mi:grid mi:flex-1 mi:min-w-0">
                <span class="scs__task-name mi:text-[15px] mi:font-semibold">{{ t.title }}</span>
                <span class="scs__task-sub mi:text-[12px] mi:font-normal mi:text-label2">{{ done[t.id] ? t.doneText : t.hint }}</span>
              </span>
              <MiBadge v-if="t.required && !done[t.id]" tone="warning" label="Required" />
            </span>
          </template>

          <div v-if="t.id === 'email'" class="scs__body mi:grid mi:justify-items-start mi:gap-3 mi:pt-0 mi:pr-0 mi:pb-1.5 mi:pl-9 mi:max-w-full mi:box-border mi:@max-[459px]:pl-0">
            <MiText variant="footnote" tone="label2">Confirmed on 28 October from a link sent to noor.haddad@quillfield.com.</MiText>
          </div>

          <div v-else-if="t.id === 'totp'" class="scs__body mi:grid mi:justify-items-start mi:gap-3 mi:pt-0 mi:pr-0 mi:pb-1.5 mi:pl-9 mi:max-w-full mi:box-border mi:@max-[459px]:pl-0">
            <MiText variant="footnote" tone="label2">Scan the key with your authenticator, then type the 6-digit code it shows. Sample code: 250731.</MiText>
            <div class="scs__key mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5">
              <code class="scs__secret mi:py-1.5 mi:px-2.5 mi:rounded-sm mi:bg-fill3 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[13px] mi:tracking-[.08em]">{{ secret }}</code>
              <MiCopyButton :value="secret.replaceAll(' ', '')" label="Copy key" variant="outline" />
            </div>
            <MiCodeInput v-model="totp" :invalid="totpError" :disabled="done.totp" label="Authenticator code" @complete="checkTotp" />
            <MiText v-if="totpError" variant="caption" tone="red" role="alert">That code has expired or is wrong. Try the next one.</MiText>
          </div>

          <div v-else-if="t.id === 'codes'" class="scs__body mi:grid mi:justify-items-start mi:gap-3 mi:pt-0 mi:pr-0 mi:pb-1.5 mi:pl-9 mi:max-w-full mi:box-border mi:@max-[459px]:pl-0">
            <ul class="scs__codes mi:grid mi:grid-cols-2 mi:gap-y-1.5 mi:gap-x-4.5 mi:m-0 mi:py-3 mi:px-3.5 mi:[list-style:none] mi:rounded-md mi:bg-fill4 mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[13px] mi:tabular-nums mi:@[520px]:grid-cols-[repeat(5,_auto)]" aria-label="Recovery codes">
              <li v-for="c in recoveryCodes" :key="c">{{ c }}</li>
            </ul>
            <div class="scs__row mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5">
              <MiCopyButton :value="recoveryCodes.join('\n')" label="Copy all codes" />
              <MiCheckbox v-model="done.codes" label="I stored these somewhere safe" />
            </div>
          </div>

          <form v-else class="scs__body mi:grid mi:justify-items-start mi:gap-3 mi:pt-0 mi:pr-0 mi:pb-1.5 mi:pl-9 mi:max-w-full mi:box-border mi:@max-[459px]:pl-0" novalidate @submit.prevent="savePhone">
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
.scs__list { min-width: 0; }
/* Code cells are 52px; shrink them so six fit beside the indent on phones. */
@container (max-width: 459px) {
  .scs__body :deep(.mi-code) { gap: 6px; }
  .scs__body :deep(.mi-code__slot), .scs__body :deep(.mi-code__cell) { width: 42px; }
}
</style>
