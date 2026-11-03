<template>
  <section class="smd" aria-labelledby="smd-title">
    <MiText id="smd-title" as="h2" variant="headline" class="smd__sr">Add a bank account for direct debit</MiText>
    <div class="smd__stage">
      <!-- Faux billing page behind the dialog. -->
      <div class="smd__page" aria-hidden="true">
        <span class="smd__line smd__line--title" />
        <span class="smd__line" />
        <span class="smd__tile" /><span class="smd__tile" />
      </div>

      <div v-if="open" class="smd__scrim">
        <MiDialog v-model="open" inline variant="dialog" icon="document" :title="step === 'details' ? 'Pay by bank account' : 'Confirm the mandate'" :close-on-action="false">
          <!-- Step 1: holder and IBAN, checked with the ISO 7064 mod-97 checksum as you type. -->
          <form v-if="step === 'details'" id="smd-form" class="smd__form" novalidate @submit.prevent="review">
            <MiText variant="footnote" tone="label2">SEPA Direct Debit: lower fees than cards and no expiry dates to chase.</MiText>
            <MiField label="Account holder" :error="errs.holder">
              <MiInput v-model="holder" autocomplete="off" @update:model-value="errs.holder = ''" />
            </MiField>
            <MiField label="IBAN" :error="errs.iban" :success="ibanOk ? country + ' account, checksum valid' : ''">
              <MiInput :model-value="iban" autocomplete="off" spellcheck="false" @update:model-value="onIban">
                <template #suffix><span class="smd__cc">{{ countryCode || '··' }}</span></template>
              </MiInput>
            </MiField>
            <MiText variant="caption" tone="label3">Sample: DE89 3704 0044 0532 0130 00</MiText>
          </form>

          <!-- Step 2: the mandate the customer actually agrees to. -->
          <div v-else class="smd__review">
            <dl class="smd__facts">
              <div><dt>Holder</dt><dd>{{ holder }}</dd></div>
              <div><dt>Account</dt><dd>{{ masked }}</dd></div>
              <div><dt>Creditor</dt><dd>Fernhouse SARL · FR72 ZZZ 884213</dd></div>
              <div><dt>Mandate ref.</dt><dd>FH-2611-{{ last4 }}</dd></div>
            </dl>
            <p class="smd__legal">
              By signing this mandate, you authorise Fernhouse SARL to send instructions to your bank to debit your account, and your bank to debit it accordingly.
              You are entitled to a refund from your bank within 8 weeks of the debit date.
            </p>
            <MiCheckbox v-model="agree" label="I agree to this direct debit mandate" />
          </div>

          <template #actions>
            <div class="smd__actions">
              <MiButton variant="gray" block @click="back">{{ step === 'details' ? 'Cancel' : 'Back' }}</MiButton>
              <MiButton v-if="step === 'details'" type="submit" form="smd-form" block>Continue</MiButton>
              <MiButton v-else block :disabled="!agree" @click="confirm">Sign mandate</MiButton>
            </div>
          </template>
        </MiDialog>
      </div>
      <div v-else class="smd__after">
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

<style scoped>
.smd { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.smd__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.smd__stage { position: relative; display: grid; min-height: 600px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.smd__page { display: grid; grid-template-columns: 1fr 1fr; align-content: start; gap: 12px; padding: 24px; }
.smd__line { grid-column: 1 / -1; height: 10px; width: 60%; border-radius: 5px; background: var(--mi-fill3); }
.smd__line--title { height: 16px; width: 36%; }
.smd__tile { height: 96px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.smd__scrim { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; padding: 16px 12px; overflow: auto; background: color-mix(in srgb, var(--mi-scrim) 85%, transparent); }

.smd__form, .smd__review { display: grid; gap: 12px; margin-top: 4px; text-align: start; }
.smd__cc { padding-inline: 10px; font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--mi-label2); }
.smd__facts { display: grid; gap: 6px; margin: 0; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-size: 13px; }
.smd__facts div { display: flex; justify-content: space-between; gap: 12px; }
.smd__facts dt { color: var(--mi-label2); }
.smd__facts dd { margin: 0; font-weight: 500; text-align: end; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.smd__legal { margin: 0; font-size: 12px; line-height: 1.5; color: var(--mi-label2); }
.smd__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
.smd__after { position: absolute; inset: auto 16px 16px; display: grid; justify-items: start; gap: 10px; }
</style>
