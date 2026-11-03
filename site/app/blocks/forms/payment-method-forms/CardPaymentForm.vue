<template>
  <section class="cpf" aria-labelledby="cpf-title">
    <header class="cpf__head">
      <div>
        <MiText id="cpf-title" variant="title3" as="h2" weight="semibold">Add a payment method</MiText>
        <MiText variant="footnote" tone="label2">Used for the Studio plan renewal on 1 December</MiText>
      </div>
      <MiSegmented v-model="method" label="Payment method" :options="[{ value: 'card', label: 'Card' }, { value: 'sepa', label: 'SEPA debit' }]" />
    </header>

    <div v-if="done" class="cpf__done" role="status">
      <span class="cpf__tick" aria-hidden="true"><MiIcon name="check" :size="26" :weight="2.4" /></span>
      <MiText variant="headline" as="h3">{{ done }}</MiText>
      <MiText variant="footnote" tone="label2">Nothing was charged. This is a demo form.</MiText>
      <MiButton variant="gray" size="small" @click="restart">Add another</MiButton>
    </div>

    <div v-else-if="method === 'card'" class="cpf__grid">
      <!-- Card preview: flips to the back while the security code has focus. -->
      <div class="cpf__scene" aria-hidden="true">
        <div class="cpf__card" :class="[{ 'is-flipped': cvcFocus }, 'is-' + brand.id]">
          <div class="cpf__face cpf__front">
            <div class="cpf__row">
              <span class="cpf__chip" />
              <span class="cpf__brand" :class="'is-' + brand.id">
                <template v-if="brand.id === 'mastercard'"><i /><i /></template>
                <template v-else>{{ brand.mark }}</template>
              </span>
            </div>
            <p class="cpf__num">
              <span v-for="(g, i) in groups" :key="i">{{ g }}</span>
            </p>
            <div class="cpf__row cpf__meta">
              <span><small>Card holder</small>{{ holder.trim() || 'Your name' }}</span>
              <span><small>Expires</small>{{ expiry || 'MM / YY' }}</span>
            </div>
          </div>
          <div class="cpf__face cpf__back">
            <span class="cpf__stripe" />
            <span class="cpf__cvc">{{ cvc.padEnd(brand.cvc, '•') }}</span>
          </div>
        </div>
      </div>

      <form class="cpf__form" novalidate @submit.prevent="submitCard">
        <MiField label="Card number" :error="shown.number">
          <MiInput
            v-model="number" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234"
            :success="numberValid"
          >
            <template #suffix><span class="cpf__tag">{{ brand.label }}</span></template>
          </MiInput>
        </MiField>
        <MiField label="Name on card" :error="shown.holder">
          <MiInput v-model="holder" autocomplete="cc-name" placeholder="Inês Carvalho" />
        </MiField>
        <div class="cpf__pair">
          <MiField label="Expiry" :error="shown.expiry">
            <MiInput v-model="expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" />
          </MiField>
          <MiField :label="brand.id === 'amex' ? 'CID (front)' : 'CVC'" :error="shown.cvc">
            <MiInput v-model="cvc" inputmode="numeric" autocomplete="cc-csc" :placeholder="'•'.repeat(brand.cvc)" @focus="cvcFocus = true" @blur="cvcFocus = false" />
          </MiField>
        </div>
        <div class="cpf__tests">
          <MiText variant="caption" tone="label3">Test numbers</MiText>
          <button v-for="t in TESTS" :key="t.n" type="button" class="cpf__test" @click="fillTest(t.n)">{{ t.label }}</button>
        </div>
        <MiCheckbox v-model="makeDefault" label="Use as default for future invoices" />
        <MiButton type="submit" block>Save card</MiButton>
      </form>
    </div>

    <form v-else class="cpf__sepa" novalidate @submit.prevent="submitSepa">
      <MiField label="IBAN" :error="sepaTried ? ibanError : ''" :success="ibanCountry && !ibanError ? ibanCountry + ' account' : undefined">
        <MiInput v-model="iban" autocomplete="off" placeholder="DE89 3704 0044 0532 0130 00" />
      </MiField>
      <MiField label="Account holder" :error="sepaTried && !accountHolder.trim() ? 'Enter the name on the bank account.' : ''">
        <MiInput v-model="accountHolder" placeholder="Northwind Studio Lda." />
      </MiField>
      <div class="cpf__tests">
        <MiText variant="caption" tone="label3">Test IBANs</MiText>
        <button type="button" class="cpf__test" @click="iban = fmtIban('DE89370400440532013000')">Germany</button>
        <button type="button" class="cpf__test" @click="iban = fmtIban('FR1420041010050500013M02606')">France</button>
      </div>
      <MiCheckbox v-model="mandate" description="You can revoke it within 8 weeks of any debit through your bank.">
        I authorise Northwind Studio to debit this account under a SEPA Direct Debit mandate.
      </MiCheckbox>
      <MiText v-if="sepaTried && !mandate" variant="caption" tone="red" role="alert">Accept the mandate to continue.</MiText>
      <MiButton type="submit" block>Save bank account</MiButton>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Brand { id: string, label: string, mark: string, test: RegExp, groups: number[], cvc: number }
const BRANDS: Brand[] = [
  { id: 'amex', label: 'Amex', mark: 'AMEX', test: /^3[47]/, groups: [4, 6, 5], cvc: 4 },
  { id: 'visa', label: 'Visa', mark: 'VISA', test: /^4/, groups: [4, 4, 4, 4], cvc: 3 },
  { id: 'mastercard', label: 'Mastercard', mark: '', test: /^(5[1-5]|2[2-7])/, groups: [4, 4, 4, 4], cvc: 3 },
  { id: 'discover', label: 'Discover', mark: 'DISCOVER', test: /^(6011|65|64[4-9])/, groups: [4, 4, 4, 4], cvc: 3 }
]
const UNKNOWN: Brand = { id: 'unknown', label: 'Card', mark: 'CARD', test: /$^/, groups: [4, 4, 4, 4], cvc: 3 }
// Public test numbers from card network sandboxes; they cannot move money.
const TESTS = [
  { label: 'Visa', n: '4242424242424242' },
  { label: 'Mastercard', n: '5555555555554444' },
  { label: 'Amex', n: '378282246310005' },
  { label: 'Fails Luhn', n: '4242424242424241' }
]

const method = ref<string | number | null>('card')
const done = ref('')

// Card number: digits only, capped and grouped by brand.
const digits = ref('4242424242')
const brand = computed(() => BRANDS.find(b => b.test.test(digits.value)) ?? UNKNOWN)
const maxLen = computed(() => brand.value.groups.reduce((a, b) => a + b, 0))
function group(d: string, sizes: number[]) {
  const out: string[] = []
  let i = 0
  for (const s of sizes) {
    if (i >= d.length) break
    out.push(d.slice(i, i + s))
    i += s
  }
  return out.join(' ')
}
const number = computed({
  get: () => group(digits.value, brand.value.groups),
  set: (v: string) => {
    const d = v.replace(/\D/g, '')
    const b = BRANDS.find(x => x.test.test(d)) ?? UNKNOWN
    digits.value = d.slice(0, b.groups.reduce((a, c) => a + c, 0))
  }
})
/** Preview groups: typed digits, then dots for what is left. */
const groups = computed(() => {
  const padded = digits.value.padEnd(maxLen.value, '•')
  let i = 0
  return brand.value.groups.map((s) => {
    const g = padded.slice(i, i + s)
    i += s
    return g
  })
})
function luhn(d: string) {
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i])
    if (i % 2) n = n * 2 > 9 ? n * 2 - 9 : n * 2
    sum += n
  }
  return d.length > 11 && sum % 10 === 0
}
const numberValid = computed(() => digits.value.length === maxLen.value && luhn(digits.value))

const holder = ref('')
const expiryRaw = ref('')
const expiry = computed({
  get: () => (expiryRaw.value.length > 2 ? expiryRaw.value.slice(0, 2) + ' / ' + expiryRaw.value.slice(2) : expiryRaw.value),
  set: (v: string) => {
    let d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length === 1 && Number(d) > 1) d = '0' + d
    expiryRaw.value = d
  }
})
const cvcRaw = ref('')
const cvc = computed({ get: () => cvcRaw.value, set: (v: string) => { cvcRaw.value = v.replace(/\D/g, '').slice(0, brand.value.cvc) } })
const cvcFocus = ref(false)
const makeDefault = ref(true)

const errors = computed(() => {
  const now = new Date()
  const mm = Number(expiryRaw.value.slice(0, 2))
  const yy = Number(expiryRaw.value.slice(2))
  const end = new Date(2000 + yy, mm, 1)
  return {
    number: !digits.value ? 'Enter your card number.' : digits.value.length < maxLen.value ? 'This number is too short.' : !luhn(digits.value) ? 'This number is not valid. Check for a typo.' : '',
    holder: holder.value.trim().length < 2 ? 'Enter the name as it appears on the card.' : '',
    expiry: expiryRaw.value.length < 4 || mm < 1 || mm > 12 ? 'Use the MM / YY format.' : end <= now ? 'This card has expired.' : '',
    cvc: cvcRaw.value.length !== brand.value.cvc ? `Enter the ${brand.value.cvc}-digit code.` : ''
  }
})
const tried = ref(false)
/** Errors stay hidden until the first submit, then update live. */
const shown = computed(() => (tried.value ? errors.value : { number: '', holder: '', expiry: '', cvc: '' }))
function fillTest(n: string) {
  number.value = n
  if (!expiryRaw.value) expiryRaw.value = '0429'
}
function submitCard() {
  tried.value = true
  if (Object.values(errors.value).some(Boolean)) return
  done.value = `${brand.value.label} ending ${digits.value.slice(-4)} saved${makeDefault.value ? ' as default' : ''}`
}

// SEPA: IBAN grouped by four, country length check and the ISO 13616 mod-97 checksum.
const IBAN_LEN: Record<string, [string, number]> = { DE: ['German', 22], FR: ['French', 27], NL: ['Dutch', 18], ES: ['Spanish', 24], IT: ['Italian', 27], PT: ['Portuguese', 25], BE: ['Belgian', 16], AT: ['Austrian', 20] }
const ibanRaw = ref('')
const fmtIban = (s: string) => s.replace(/[^a-z0-9]/gi, '').toUpperCase().replace(/(.{4})(?=.)/g, '$1 ')
const iban = computed({ get: () => fmtIban(ibanRaw.value), set: (v: string) => { ibanRaw.value = v.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 34) } })
const ibanCountry = computed(() => IBAN_LEN[ibanRaw.value.slice(0, 2)]?.[0] ?? '')
function mod97(s: string) {
  const moved = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, c => String(c.charCodeAt(0) - 55))
  let r = 0
  for (const ch of moved) r = (r * 10 + Number(ch)) % 97
  return r === 1
}
const ibanError = computed(() => {
  const s = ibanRaw.value
  const spec = IBAN_LEN[s.slice(0, 2)]
  if (!s) return 'Enter the IBAN of the account to debit.'
  if (!spec) return 'We support IBANs from the euro area countries listed in Help.'
  if (s.length !== spec[1]) return `${spec[0]} IBANs have ${spec[1]} characters; this one has ${s.length}.`
  return mod97(s) ? '' : 'The check digits do not match. Look for a swapped character.'
})
const accountHolder = ref('')
const mandate = ref(false)
const sepaTried = ref(false)
function submitSepa() {
  sepaTried.value = true
  if (ibanError.value || !accountHolder.value.trim() || !mandate.value) return
  done.value = `Account ending ${ibanRaw.value.slice(-4)} saved for direct debit`
}

function restart() {
  done.value = ''
  tried.value = false
  sepaTried.value = false
  digits.value = ''
  holder.value = ''
  expiryRaw.value = ''
  cvcRaw.value = ''
  ibanRaw.value = ''
  mandate.value = false
}
</script>

<style scoped>
.cpf { container-type: inline-size; display: grid; align-content: start; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.cpf__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.cpf__grid { display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .cpf__grid { grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 32px; align-items: start; } }

.cpf__scene { perspective: 1200px; width: 100%; max-width: 340px; justify-self: center; }
.cpf__card { position: relative; aspect-ratio: 1.586; transform-style: preserve-3d; transition: transform var(--mi-dur-4) var(--mi-spring); --c1: var(--mi-purple); --c2: var(--mi-indigo); }
.cpf__card.is-flipped { transform: rotateY(180deg); }
.cpf__card.is-visa { --c1: var(--mi-p); --c2: var(--mi-indigo); }
.cpf__card.is-mastercard { --c1: var(--mi-red); --c2: var(--mi-orange); }
.cpf__card.is-amex { --c1: var(--mi-teal); --c2: var(--mi-blue); }
.cpf__card.is-discover { --c1: var(--mi-orange); --c2: var(--mi-pink); }
.cpf__face {
  position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 7% 7.5%; border-radius: 16px; overflow: hidden;
  backface-visibility: hidden; color: var(--mi-p-on); box-shadow: var(--mi-sh2);
  background: radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--c2) 85%, transparent), transparent 60%), linear-gradient(135deg, var(--c1), var(--c2));
}
/* Static sheen line across the plastic. */
.cpf__face::after { content: ""; position: absolute; inset: -40% -10% auto 40%; height: 140%; transform: rotate(24deg); background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--mi-p-on) 10%, transparent), transparent); pointer-events: none; }
.cpf__back { transform: rotateY(180deg); justify-content: center; gap: 14px; padding-inline: 0; }
.cpf__row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cpf__chip { width: 15%; aspect-ratio: 1.3; border-radius: 6px; background: linear-gradient(135deg, color-mix(in srgb, var(--mi-yellow) 80%, var(--mi-p-on)), var(--mi-yellow)); opacity: .9; }
.cpf__brand { font-weight: 800; font-style: italic; letter-spacing: .04em; font-size: clamp(13px, 4cqi, 18px); display: flex; }
.cpf__brand.is-amex, .cpf__brand.is-discover, .cpf__brand.is-unknown { font-style: normal; font-size: 12px; letter-spacing: .12em; }
.cpf__brand.is-mastercard i { width: 26px; height: 26px; border-radius: 50%; background: var(--mi-p-on); opacity: .85; }
.cpf__brand.is-mastercard i + i { margin-left: -10px; opacity: .55; }
.cpf__num { display: flex; gap: 4%; margin: 0; font: 600 clamp(14px, 4.6cqi, 20px)/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .06em; font-variant-numeric: tabular-nums; }
.cpf__meta { align-items: flex-end; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; }
.cpf__meta span { display: grid; gap: 2px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cpf__meta small { font-size: 9px; font-weight: 500; opacity: .75; }
.cpf__stripe { height: 20%; background: var(--c2); filter: brightness(.4); }
.cpf__cvc { align-self: flex-end; margin-right: 8%; padding: 6px 12px; border-radius: 6px; background: var(--mi-p-on); color: var(--c1); font: 600 15px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .2em; }

.cpf__form, .cpf__sepa { display: grid; gap: 14px; min-width: 0; }
.cpf__sepa { max-width: 520px; }
.cpf__pair { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; align-items: start; }
.cpf__tag { padding: 0 10px; font-size: 12px; font-weight: 600; color: var(--mi-label2); white-space: nowrap; }
.cpf__tests { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.cpf__test { padding: 4px 9px; border: 0; border-radius: 999px; background: var(--mi-fill4); color: var(--mi-label2); font: 500 12px var(--mi-font); cursor: pointer; }
.cpf__test:hover { color: var(--mi-label); background: var(--mi-fill3); }
.cpf__test:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.cpf__done { display: grid; justify-items: center; gap: 6px; padding: 28px 0; text-align: center; }
.cpf__tick { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 6px; border-radius: 50%; background: var(--mi-green); color: var(--mi-p-on); }
</style>
