<template>
  <section class="acd mi:@container mi:font-mi mi:text-label" aria-labelledby="acd-title">
    <MiText id="acd-title" as="h2" variant="headline" class="acd__sr mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Add a payment card</MiText>
    <div class="acd__stage mi:relative mi:grid mi:min-h-160 mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-card)] mi:shadow-1">
      <!-- Faux billing page behind the dialog. -->
      <div class="acd__page mi:grid mi:grid-cols-[1fr_1fr] mi:content-start mi:gap-3 mi:p-6" aria-hidden="true">
        <span class="acd__line acd__line--title mi:col-span-full mi:h-2.5 mi:rounded-[5px] mi:[background:var(--mi-fill3)] mi:h-4" />
        <span class="acd__line mi:col-span-full mi:h-2.5 mi:rounded-[5px] mi:[background:var(--mi-fill3)]" />
        <span class="acd__tile mi:h-24 mi:rounded-lg mi:[background:var(--mi-fill4)]" /><span class="acd__tile mi:h-24 mi:rounded-lg mi:[background:var(--mi-fill4)]" />
      </div>

      <div v-if="open" class="acd__scrim mi:absolute mi:inset-0 mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:place-items-center mi:py-4 mi:px-3 mi:overflow-auto mi:[background:color-mix(in_srgb,_var(--mi-scrim)_85%,_transparent)]">
        <MiDialog v-model="open" inline variant="dialog" title="Add a card" :close-on-action="false">
          <!-- Live preview of the card being typed. -->
          <div class="acd__preview mi:relative mi:grid mi:grid-rows-[auto_1fr_auto] mi:gap-1.5 mi:w-full mi:max-w-62.5 mi:mx-auto mi:box-border mi:aspect-[1.586] mi:py-3.5 mi:px-4 mi:rounded-[14px] mi:overflow-hidden mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_45%,_var(--mi-s)))] mi:shadow-[0_14px_28px_-16px_color-mix(in_srgb,_var(--mi-p)_80%,_transparent)] mi:text-start mi:[&.is-mc]:text-s-on mi:after:content-[''] mi:after:absolute mi:after:top-[-40%] mi:after:right-[-20%] mi:after:bottom-auto mi:after:left-auto mi:after:w-[70%] mi:after:aspect-[1] mi:after:rounded-[50%] mi:after:[background:color-mix(in_srgb,_var(--mi-p-on)_14%,_transparent)]" :class="'is-' + brand.id" aria-hidden="true">
            <span class="acd__chip mi:w-7.5 mi:h-5.5 mi:rounded-[5px] mi:[background:linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-yellow)_80%,_var(--mi-card)),_var(--mi-yellow))]" />
            <span class="acd__brand mi:absolute mi:top-3.5 mi:right-4 mi:text-[12px] mi:font-extrabold mi:tracking-[.04em]">{{ brand.label }}</span>
            <span class="acd__num mi:self-end mi:[font:600_14px/1_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:tracking-[.08em] mi:whitespace-nowrap">{{ previewNumber }}</span>
            <span class="acd__meta mi:flex mi:justify-between mi:gap-2 mi:text-[11px] mi:uppercase mi:tracking-[.06em] mi:opacity-90"><span class="mi:[.acd__meta_&:first-child]:overflow-hidden mi:[.acd__meta_&:first-child]:text-ellipsis mi:[.acd__meta_&:first-child]:whitespace-nowrap">{{ name || 'Name on card' }}</span><span class="mi:[.acd__meta_&:first-child]:overflow-hidden mi:[.acd__meta_&:first-child]:text-ellipsis mi:[.acd__meta_&:first-child]:whitespace-nowrap">{{ expiry || 'MM / YY' }}</span></span>
          </div>

          <form id="acd-form" class="acd__form mi:grid mi:gap-3 mi:mt-1 mi:text-start" novalidate @submit.prevent="save">
            <MiField label="Card number" :error="errs.number">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="number" inputmode="numeric" autocomplete="off" :aria-describedby="describedBy" @update:model-value="errs.number = ''">
                  <template #suffix><span class="acd__suffix mi:px-2.5 mi:text-[12px] mi:font-semibold mi:text-label2">{{ brand.label }}</span></template>
                </MiInput>
              </template>
            </MiField>
            <div class="acd__pair mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2.5">
              <MiField label="Expiry" :error="errs.expiry">
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="expiry" inputmode="numeric" placeholder="MM / YY" autocomplete="off" :aria-describedby="describedBy" @update:model-value="errs.expiry = ''" />
                </template>
              </MiField>
              <MiField label="CVC" :error="errs.cvc">
                <template #default="{ id, describedBy }">
                  <MiInput :id="id" v-model="cvc" inputmode="numeric" :placeholder="brand.id === 'amex' ? '4 digits' : '3 digits'" autocomplete="off" :aria-describedby="describedBy" @update:model-value="errs.cvc = ''" />
                </template>
              </MiField>
            </div>
            <MiField label="Name on card" :error="errs.name">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="name" autocomplete="off" :aria-describedby="describedBy" @update:model-value="errs.name = ''" />
              </template>
            </MiField>
            <label class="acd__default mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:cursor-pointer">
              <MiText as="span" variant="footnote">Use as default for renewals</MiText>
              <MiSwitch v-model="makeDefault" size="compact" label="Use as default for renewals" />
            </label>
          </form>

          <template #actions>
            <div class="acd__actions mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2 mi:w-full">
              <MiButton variant="gray" block @click="open = false">Cancel</MiButton>
              <MiButton type="submit" form="acd-form" block :loading="busy">Save card</MiButton>
            </div>
          </template>
        </MiDialog>
      </div>
      <div v-else class="acd__after mi:absolute mi:top-auto mi:right-4 mi:bottom-4 mi:left-4 mi:grid mi:justify-items-start mi:gap-2.5">
        <MiAlert v-if="savedCard" tone="success" :title="`${savedCard} added`" :message="makeDefault ? 'It will be charged at the next renewal on 1 Dec.' : 'Kept as a backup method.'" />
        <MiButton variant="tinted" size="small" @click="reopen">Add another card</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

const open = ref(true)
const number = ref('4242 4242 4242 4242') // published test number, UI demo only
const expiry = ref('08 / 28')
const cvc = ref('')
const name = ref('Camille Moreau')
const makeDefault = ref(true)
const busy = ref(false)
const savedCard = ref('')
const errs = reactive({ number: '', expiry: '', cvc: '', name: '' })

const digits = computed(() => number.value.replace(/\D/g, ''))
const brand = computed(() => {
  const d = digits.value
  if (/^3[47]/.test(d)) return { id: 'amex', label: 'Amex', len: 15 }
  if (/^(5[1-5]|2[2-7])/.test(d)) return { id: 'mc', label: 'Mastercard', len: 16 }
  if (/^4/.test(d)) return { id: 'visa', label: 'Visa', len: 16 }
  return { id: 'none', label: 'Card', len: 16 }
})
const previewNumber = computed(() => {
  const d = digits.value.padEnd(brand.value.len, '•')
  return brand.value.id === 'amex' ? `${d.slice(0, 4)} ${d.slice(4, 10)} ${d.slice(10, 15)}` : d.replace(/(.{4})(?=.)/g, '$1 ')
})

// Keep the fields formatted as people type.
watch(number, (v) => {
  const d = v.replace(/\D/g, '').slice(0, brand.value.len)
  const f = brand.value.id === 'amex' ? [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(' ') : d.replace(/(\d{4})(?=\d)/g, '$1 ')
  if (f !== v) number.value = f
})
watch(expiry, (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  const f = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
  if (f !== v) expiry.value = f
})
watch(cvc, (v) => { const d = v.replace(/\D/g, '').slice(0, 4); if (d !== v) cvc.value = d })

function luhn(d: string) {
  let sum = 0
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i])
    if (i % 2) { n *= 2; if (n > 9) n -= 9 }
    sum += n
  }
  return sum % 10 === 0
}
function validate() {
  const d = digits.value
  errs.number = d.length === brand.value.len && luhn(d) ? '' : 'Check the card number.'
  const [mm, yy] = expiry.value.split('/').map(s => Number(s.trim()))
  // Sample "today" is November 2026.
  const valid = mm && yy !== undefined && mm >= 1 && mm <= 12 && (yy > 26 || (yy === 26 && mm >= 11))
  errs.expiry = valid ? '' : 'Use a future date, MM / YY.'
  errs.cvc = cvc.value.length === (brand.value.id === 'amex' ? 4 : 3) ? '' : `Enter the ${brand.value.id === 'amex' ? 4 : 3}-digit code.`
  errs.name = name.value.trim().length > 1 ? '' : 'Add the name printed on the card.'
  return !errs.number && !errs.expiry && !errs.cvc && !errs.name
}
function save() {
  if (!validate()) return
  busy.value = true
  later(() => {
    busy.value = false
    savedCard.value = `${brand.value.label} •••• ${digits.value.slice(-4)}`
    open.value = false
  }, 800)
}
function reopen() { number.value = ''; expiry.value = ''; cvc.value = ''; savedCard.value = ''; open.value = true }
</script>

<style scoped>
.acd__sr { overflow: hidden; white-space: nowrap; }
.acd__line { width: 60%; }
.acd__line--title { width: 36%; }
.acd__preview.is-mc { background: linear-gradient(135deg, var(--mi-s), color-mix(in srgb, var(--mi-s) 50%, var(--mi-orange))); }
.acd__preview.is-amex { background: linear-gradient(135deg, var(--mi-teal), color-mix(in srgb, var(--mi-teal) 50%, var(--mi-blue))); }
</style>
