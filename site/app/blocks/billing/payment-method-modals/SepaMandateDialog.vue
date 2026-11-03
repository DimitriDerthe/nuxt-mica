<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="smd-title">
    <MiText id="smd-title" as="h2" variant="headline" class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:whitespace-nowrap mi:[clip-path:inset(50%)]">Add a bank account for direct debit</MiText>
    <div class="mi:relative mi:grid mi:min-h-150 mi:rounded-xl mi:overflow-hidden mi:bg-card mi:shadow-1">
      <!-- Faux billing page behind the dialog. -->
      <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:content-start mi:gap-3 mi:p-6" aria-hidden="true">
        <span class="mi:w-[36%] mi:col-span-full mi:h-2.5 mi:rounded-[5px] mi:bg-fill3 mi:h-4" />
        <span class="mi:w-[60%] mi:col-span-full mi:h-2.5 mi:rounded-[5px] mi:bg-fill3" />
        <span class="mi:h-24 mi:rounded-lg mi:bg-fill4" /><span class="mi:h-24 mi:rounded-lg mi:bg-fill4" />
      </div>

      <div v-if="open" class="mi:absolute mi:inset-0 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:py-4 mi:px-3 mi:overflow-auto mi:[background:color-mix(in_srgb,_var(--mi-scrim)_85%,_transparent)]">
        <MiDialog v-model="open" inline variant="dialog" icon="document" :title="step === 'details' ? 'Pay by bank account' : 'Confirm the mandate'" :close-on-action="false">
          <!-- Step 1: holder and IBAN, checked with the ISO 7064 mod-97 checksum as you type. -->
          <form v-if="step === 'details'" id="smd-form" class="mi:grid mi:gap-3 mi:mt-1 mi:text-start" novalidate @submit.prevent="review">
            <MiText variant="footnote" tone="label2">SEPA Direct Debit: lower fees than cards and no expiry dates to chase.</MiText>
            <MiField label="Account holder" :error="errs.holder">
              <MiInput v-model="holder" autocomplete="off" @update:model-value="errs.holder = ''" />
            </MiField>
            <MiField label="IBAN" :error="errs.iban" :success="ibanOk ? country + ' account, checksum valid' : ''">
              <MiInput :model-value="iban" autocomplete="off" spellcheck="false" @update:model-value="onIban">
                <template #suffix><span class="mi:px-2.5 mi:text-[12px] mi:font-bold mi:tracking-[.06em] mi:text-label2">{{ countryCode || '··' }}</span></template>
              </MiInput>
            </MiField>
            <MiText variant="caption" tone="label3">Sample: DE89 3704 0044 0532 0130 00</MiText>
          </form>

          <!-- Step 2: the mandate the customer actually agrees to. -->
          <div v-else class="mi:grid mi:gap-3 mi:mt-1 mi:text-start">
            <dl class="mi:grid mi:gap-1.5 mi:m-0 mi:py-3 mi:px-3.5 mi:rounded-md mi:bg-fill4 mi:text-[13px]">
              <div class="mi:flex mi:justify-between mi:gap-3"><dt class="mi:text-label2">Holder</dt><dd class="mi:m-0 mi:font-medium mi:text-end mi:tabular-nums mi:wrap-anywhere">{{ holder }}</dd></div>
              <div class="mi:flex mi:justify-between mi:gap-3"><dt class="mi:text-label2">Account</dt><dd class="mi:m-0 mi:font-medium mi:text-end mi:tabular-nums mi:wrap-anywhere">{{ masked }}</dd></div>
              <div class="mi:flex mi:justify-between mi:gap-3"><dt class="mi:text-label2">Creditor</dt><dd class="mi:m-0 mi:font-medium mi:text-end mi:tabular-nums mi:wrap-anywhere">Fernhouse SARL · FR72 ZZZ 884213</dd></div>
              <div class="mi:flex mi:justify-between mi:gap-3"><dt class="mi:text-label2">Mandate ref.</dt><dd class="mi:m-0 mi:font-medium mi:text-end mi:tabular-nums mi:wrap-anywhere">FH-2611-{{ last4 }}</dd></div>
            </dl>
            <p class="mi:m-0 mi:text-[12px] mi:leading-normal mi:text-label2">
              By signing this mandate, you authorise Fernhouse SARL to send instructions to your bank to debit your account, and your bank to debit it accordingly.
              You are entitled to a refund from your bank within 8 weeks of the debit date.
            </p>
            <MiCheckbox v-model="agree" label="I agree to this direct debit mandate" />
          </div>

          <template #actions>
            <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2 mi:w-full">
              <MiButton variant="gray" block @click="back">{{ step === 'details' ? 'Cancel' : 'Back' }}</MiButton>
              <MiButton v-if="step === 'details'" type="submit" form="smd-form" block>Continue</MiButton>
              <MiButton v-else block :disabled="!agree" @click="confirm">Sign mandate</MiButton>
            </div>
          </template>
        </MiDialog>
      </div>
      <div v-else class="mi:absolute mi:top-auto mi:right-4 mi:bottom-4 mi:left-4 mi:grid mi:justify-items-start mi:gap-2.5">
        <MiAlert v-if="saved" tone="success" :title="masked + ' added'" message="The first debit happens on 1 Dec; we email you 3 days before." />
        <MiButton variant="tinted" size="small" @click="reopen">Add a bank account</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const countries: Record<string, { name: string, length: number }> = {
  DE: { name: 'German', length: 22 }, FR: { name: 'French', length: 27 }, NL: { name: 'Dutch', length: 18 },
  ES: { name: 'Spanish', length: 24 }, IT: { name: 'Italian', length: 27 }, BE: { name: 'Belgian', length: 16 }
}

const open = ref(true)
const step = ref<'details' | 'review'>('details')
const holder = ref('Camille Moreau')
const iban = ref('')
const agree = ref(false)
const saved = ref(false)
const errs = reactive({ holder: '', iban: '' })

const raw = computed(() => iban.value.replace(/\s/g, ''))
const countryCode = computed(() => /^[A-Z]{2}/.test(raw.value) ? raw.value.slice(0, 2) : '')
const country = computed(() => countries[countryCode.value]?.name ?? '')
const last4 = computed(() => raw.value.slice(-4))
const masked = computed(() => countryCode.value + '•• •••• ' + last4.value)

// Move the first 4 characters to the end, map letters to 10..35, then reduce mod 97 chunk by chunk.
function mod97(value: string) {
  const digits = (value.slice(4) + value.slice(0, 4)).replace(/[A-Z]/g, ch => String(ch.charCodeAt(0) - 55))
  let rest = 0
  for (let i = 0; i < digits.length; i += 7) rest = Number(String(rest) + digits.slice(i, i + 7)) % 97
  return rest
}
const ibanOk = computed(() => {
  const info = countries[countryCode.value]
  return !!info && raw.value.length === info.length && /^[A-Z0-9]+$/.test(raw.value) && mod97(raw.value) === 1
})

function onIban(value: string) {
  iban.value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 34).replace(/(.{4})(?=.)/g, '$1 ')
  errs.iban = ''
}
function review() {
  errs.holder = holder.value.trim().length > 1 ? '' : 'Enter the name on the bank account.'
  if (!raw.value) errs.iban = 'Enter an IBAN.'
  else if (!countries[countryCode.value]) errs.iban = 'We accept IBANs from DE, FR, NL, ES, IT and BE.'
  else if (!ibanOk.value) errs.iban = 'This IBAN fails its checksum. Check for a typo.'
  if (!errs.holder && !errs.iban) step.value = 'review'
}
function back() { if (step.value === 'details') open.value = false; else step.value = 'details' }
function confirm() { saved.value = true; open.value = false }
function reopen() { iban.value = ''; agree.value = false; saved.value = false; step.value = 'details'; open.value = true }
</script>

