<template>
  <section class="cpf mi:@container mi:grid mi:content-start mi:gap-5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="cpf-title">
    <header class="cpf__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="cpf-title" variant="title3" as="h2" weight="semibold">Add a payment method</MiText>
        <MiText variant="footnote" tone="label2">Used for the Studio plan renewal on 1 December</MiText>
      </div>
      <MiSegmented v-model="method" label="Payment method" :options="[{ value: 'card', label: 'Card' }, { value: 'sepa', label: 'SEPA debit' }]" />
    </header>

    <div v-if="done" class="cpf__done mi:grid mi:justify-items-center mi:gap-1.5 mi:py-7 mi:px-0 mi:text-center" role="status">
      <span class="cpf__tick mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:mb-1.5 mi:rounded-[50%] mi:[background:var(--mi-green)] mi:text-p-on" aria-hidden="true"><MiIcon name="check" :size="26" :weight="2.4" /></span>
      <MiText variant="headline" as="h3">{{ done }}</MiText>
      <MiText variant="footnote" tone="label2">Nothing was charged. This is a demo form.</MiText>
      <MiButton variant="gray" size="small" @click="restart">Add another</MiButton>
    </div>

    <div v-else-if="method === 'card'" class="cpf__grid mi:grid mi:gap-5.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_340px)_minmax(0,_1fr)] mi:@[760px]:gap-8 mi:@[760px]:items-start">
      <!-- Card preview: flips to the back while the security code has focus. -->
      <div class="cpf__scene mi:[perspective:1200px] mi:w-full mi:max-w-85 mi:justify-self-center" aria-hidden="true">
        <div class="cpf__card mi:relative mi:aspect-[1.586] mi:[transform-style:preserve-3d] mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[--c1:var(--mi-purple)] mi:[--c2:var(--mi-indigo)] mi:[&.is-flipped]:transform-[rotateY(180deg)]" :class="[{ 'is-flipped': cvcFocus }, 'is-' + brand.id]">
          <div class="cpf__face cpf__front mi:absolute mi:inset-0 mi:flex mi:flex-col mi:justify-between mi:rounded-[16px] mi:overflow-hidden mi:backface-hidden mi:text-p-on mi:shadow-2 mi:[background:radial-gradient(120%_90%_at_100%_0%,_color-mix(in_srgb,_var(--c2)_85%,_transparent),_transparent_60%),_linear-gradient(135deg,_var(--c1),_var(--c2))] mi:after:content-[''] mi:after:absolute mi:after:top-[-40%] mi:after:right-[-10%] mi:after:bottom-auto mi:after:left-[40%] mi:after:h-[140%] mi:after:transform-[rotate(24deg)] mi:after:[background:linear-gradient(90deg,_transparent,_color-mix(in_srgb,_var(--mi-p-on)_10%,_transparent),_transparent)] mi:after:pointer-events-none">
            <div class="cpf__row mi:flex mi:justify-between mi:gap-2.5">
              <span class="cpf__chip mi:w-[15%] mi:aspect-[1.3] mi:rounded-[6px] mi:[background:linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-yellow)_80%,_var(--mi-p-on)),_var(--mi-yellow))] mi:opacity-90" />
              <span class="cpf__brand mi:font-extrabold mi:italic mi:tracking-[.04em] mi:text-[clamp(13px,_4cqi,_18px)] mi:flex mi:[&.is-unknown]:not-italic mi:[&.is-unknown]:text-[12px] mi:[&.is-unknown]:tracking-[.12em]" :class="'is-' + brand.id">
                <template v-if="brand.id === 'mastercard'"><i class="mi:[.cpf__brand.is-mastercard_&]:w-6.5 mi:[.cpf__brand.is-mastercard_&]:h-6.5 mi:[.cpf__brand.is-mastercard_&]:rounded-[50%] mi:[.cpf__brand.is-mastercard_&]:[background:var(--mi-p-on)] mi:[.cpf__brand.is-mastercard_&]:opacity-85" /><i class="mi:[.cpf__brand.is-mastercard_&]:w-6.5 mi:[.cpf__brand.is-mastercard_&]:h-6.5 mi:[.cpf__brand.is-mastercard_&]:rounded-[50%] mi:[.cpf__brand.is-mastercard_&]:[background:var(--mi-p-on)] mi:[.cpf__brand.is-mastercard_&]:opacity-85" /></template>
                <template v-else>{{ brand.mark }}</template>
              </span>
            </div>
            <p class="cpf__num mi:flex mi:gap-[4%] mi:m-0 mi:tracking-[.06em]">
              <span v-for="(g, i) in groups" :key="i">{{ g }}</span>
            </p>
            <div class="cpf__row cpf__meta mi:flex mi:justify-between mi:gap-2.5 mi:text-[12px] mi:font-semibold mi:uppercase mi:tracking-[.05em]">
              <span class="mi:[.cpf__meta_&]:grid mi:[.cpf__meta_&]:gap-0.5 mi:[.cpf__meta_&]:min-w-0 mi:[.cpf__meta_&]:overflow-hidden mi:[.cpf__meta_&]:text-ellipsis mi:[.cpf__meta_&]:whitespace-nowrap"><small class="mi:[.cpf__meta_&]:text-[9px] mi:[.cpf__meta_&]:font-medium mi:[.cpf__meta_&]:opacity-75">Card holder</small>{{ holder.trim() || 'Your name' }}</span>
              <span class="mi:[.cpf__meta_&]:grid mi:[.cpf__meta_&]:gap-0.5 mi:[.cpf__meta_&]:min-w-0 mi:[.cpf__meta_&]:overflow-hidden mi:[.cpf__meta_&]:text-ellipsis mi:[.cpf__meta_&]:whitespace-nowrap"><small class="mi:[.cpf__meta_&]:text-[9px] mi:[.cpf__meta_&]:font-medium mi:[.cpf__meta_&]:opacity-75">Expires</small>{{ expiry || 'MM / YY' }}</span>
            </div>
          </div>
          <div class="cpf__face cpf__back mi:absolute mi:inset-0 mi:flex mi:flex-col mi:justify-between mi:rounded-[16px] mi:overflow-hidden mi:backface-hidden mi:text-p-on mi:shadow-2 mi:[background:radial-gradient(120%_90%_at_100%_0%,_color-mix(in_srgb,_var(--c2)_85%,_transparent),_transparent_60%),_linear-gradient(135deg,_var(--c1),_var(--c2))] mi:after:content-[''] mi:after:absolute mi:after:top-[-40%] mi:after:right-[-10%] mi:after:bottom-auto mi:after:left-[40%] mi:after:h-[140%] mi:after:transform-[rotate(24deg)] mi:after:[background:linear-gradient(90deg,_transparent,_color-mix(in_srgb,_var(--mi-p-on)_10%,_transparent),_transparent)] mi:after:pointer-events-none mi:transform-[rotateY(180deg)] mi:justify-center mi:gap-3.5">
            <span class="cpf__stripe mi:h-[20%] mi:[background:var(--c2)] mi:[filter:brightness(.4)]" />
            <span class="cpf__cvc mi:[align-self:flex-end] mi:mr-[8%] mi:py-1.5 mi:px-3 mi:rounded-[6px] mi:[background:var(--mi-p-on)] mi:text-(--c1) mi:[font:600_15px_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:tracking-[.2em]">{{ cvc.padEnd(brand.cvc, '•') }}</span>
          </div>
        </div>
      </div>

      <form class="cpf__form mi:grid mi:gap-3.5 mi:min-w-0" novalidate @submit.prevent="submitCard">
        <MiField label="Card number" :error="shown.number">
          <MiInput
            v-model="number" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234"
            :success="numberValid"
          >
            <template #suffix><span class="cpf__tag mi:py-0 mi:px-2.5 mi:text-[12px] mi:font-semibold mi:text-label2 mi:whitespace-nowrap">{{ brand.label }}</span></template>
          </MiInput>
        </MiField>
        <MiField label="Name on card" :error="shown.holder">
          <MiInput v-model="holder" autocomplete="cc-name" placeholder="Inês Carvalho" />
        </MiField>
        <div class="cpf__pair mi:grid mi:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:gap-3 mi:items-start">
          <MiField label="Expiry" :error="shown.expiry">
            <MiInput v-model="expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" />
          </MiField>
          <MiField :label="brand.id === 'amex' ? 'CID (front)' : 'CVC'" :error="shown.cvc">
            <MiInput v-model="cvc" inputmode="numeric" autocomplete="cc-csc" :placeholder="'•'.repeat(brand.cvc)" @focus="cvcFocus = true" @blur="cvcFocus = false" />
          </MiField>
        </div>
        <div class="cpf__tests mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
          <MiText variant="caption" tone="label3">Test numbers</MiText>
          <button v-for="t in TESTS" :key="t.n" type="button" class="cpf__test mi:py-1 mi:px-[9px] mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-fill4)] mi:text-label2 mi:[font:500_12px_var(--mi-font)] mi:cursor-pointer mi:hover:text-label mi:hover:[background:var(--mi-fill3)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="fillTest(t.n)">{{ t.label }}</button>
        </div>
        <MiCheckbox v-model="makeDefault" label="Use as default for future invoices" />
        <MiButton type="submit" block>Save card</MiButton>
      </form>
    </div>

    <form v-else class="cpf__sepa mi:grid mi:gap-3.5 mi:min-w-0 mi:max-w-130" novalidate @submit.prevent="submitSepa">
      <MiField label="IBAN" :error="sepaTried ? ibanError : ''" :success="ibanCountry && !ibanError ? ibanCountry + ' account' : undefined">
        <MiInput v-model="iban" autocomplete="off" placeholder="DE89 3704 0044 0532 0130 00" />
      </MiField>
      <MiField label="Account holder" :error="sepaTried && !accountHolder.trim() ? 'Enter the name on the bank account.' : ''">
        <MiInput v-model="accountHolder" placeholder="Northwind Studio Lda." />
      </MiField>
      <div class="cpf__tests mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
        <MiText variant="caption" tone="label3">Test IBANs</MiText>
        <button type="button" class="cpf__test mi:py-1 mi:px-[9px] mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-fill4)] mi:text-label2 mi:[font:500_12px_var(--mi-font)] mi:cursor-pointer mi:hover:text-label mi:hover:[background:var(--mi-fill3)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="iban = fmtIban('DE89370400440532013000')">Germany</button>
        <button type="button" class="cpf__test mi:py-1 mi:px-[9px] mi:[border:0] mi:rounded-[999px] mi:[background:var(--mi-fill4)] mi:text-label2 mi:[font:500_12px_var(--mi-font)] mi:cursor-pointer mi:hover:text-label mi:hover:[background:var(--mi-fill3)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="iban = fmtIban('FR1420041010050500013M02606')">France</button>
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
.cpf__card.is-visa { --c1: var(--mi-p); --c2: var(--mi-indigo); }
.cpf__card.is-mastercard { --c1: var(--mi-red); --c2: var(--mi-orange); }
.cpf__card.is-amex { --c1: var(--mi-teal); --c2: var(--mi-blue); }
.cpf__card.is-discover { --c1: var(--mi-orange); --c2: var(--mi-pink); }
.cpf__face { padding: 7% 7.5%;
}
.cpf__back { padding-inline: 0; }
.cpf__row { align-items: center; }
.cpf__brand.is-amex, .cpf__brand.is-discover { font-style: normal; font-size: 12px; letter-spacing: .12em; }
.cpf__brand.is-mastercard i + i { margin-left: -10px; opacity: .55; }
.cpf__num { font: 600 clamp(14px, 4.6cqi, 20px)/1 ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
.cpf__meta { align-items: flex-end; }
</style>
