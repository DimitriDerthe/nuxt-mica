<template>
  <section class="acd" aria-labelledby="acd-title">
    <MiText id="acd-title" as="h2" variant="headline" class="acd__sr">Add a payment card</MiText>
    <div class="acd__stage">
      <!-- Faux billing page behind the dialog. -->
      <div class="acd__page" aria-hidden="true">
        <span class="acd__line acd__line--title" />
        <span class="acd__line" />
        <span class="acd__tile" /><span class="acd__tile" />
      </div>

      <div v-if="open" class="acd__scrim">
        <MiDialog v-model="open" inline variant="dialog" title="Add a card" :close-on-action="false">
          <!-- Live preview of the card being typed. -->
          <div class="acd__preview" :class="'is-' + brand.id" aria-hidden="true">
            <span class="acd__chip" />
            <span class="acd__brand">{{ brand.label }}</span>
            <span class="acd__num">{{ previewNumber }}</span>
            <span class="acd__meta"><span>{{ name || 'Name on card' }}</span><span>{{ expiry || 'MM / YY' }}</span></span>
          </div>

          <form id="acd-form" class="acd__form" novalidate @submit.prevent="save">
            <MiField label="Card number" :error="errs.number">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="number" inputmode="numeric" autocomplete="off" :aria-describedby="describedBy" @update:model-value="errs.number = ''">
                  <template #suffix><span class="acd__suffix">{{ brand.label }}</span></template>
                </MiInput>
              </template>
            </MiField>
            <div class="acd__pair">
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
            <label class="acd__default">
              <MiText as="span" variant="footnote">Use as default for renewals</MiText>
              <MiSwitch v-model="makeDefault" size="compact" label="Use as default for renewals" />
            </label>
          </form>

          <template #actions>
            <div class="acd__actions">
              <MiButton variant="gray" block @click="open = false">Cancel</MiButton>
              <MiButton type="submit" form="acd-form" block :loading="busy">Save card</MiButton>
            </div>
          </template>
        </MiDialog>
      </div>
      <div v-else class="acd__after">
        <MiAlert v-if="savedCard" tone="success" :title="`${savedCard} added`" :message="makeDefault ? 'It will be charged at the next renewal on 1 Dec.' : 'Kept as a backup method.'" />
        <MiButton variant="tinted" size="small" @click="reopen">Add another card</MiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

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
  setTimeout(() => {
    busy.value = false
    savedCard.value = `${brand.value.label} •••• ${digits.value.slice(-4)}`
    open.value = false
  }, 800)
}
function reopen() { number.value = ''; expiry.value = ''; cvc.value = ''; savedCard.value = ''; open.value = true }
</script>

<style scoped>
.acd { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.acd__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.acd__stage { position: relative; display: grid; min-height: 640px; border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.acd__page { display: grid; grid-template-columns: 1fr 1fr; align-content: start; gap: 12px; padding: 24px; }
.acd__line { grid-column: 1 / -1; height: 10px; width: 60%; border-radius: 5px; background: var(--mi-fill3); }
.acd__line--title { height: 16px; width: 36%; }
.acd__tile { height: 96px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }

.acd__scrim { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr); place-items: center; padding: 16px 12px; overflow: auto; background: color-mix(in srgb, var(--mi-scrim) 85%, transparent); }

.acd__preview {
  position: relative; display: grid; grid-template-rows: auto 1fr auto; gap: 6px; width: 100%; max-width: 250px; margin-inline: auto; box-sizing: border-box; aspect-ratio: 1.586; padding: 14px 16px; border-radius: 14px; overflow: hidden;
  color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 45%, var(--mi-s)));
  box-shadow: 0 14px 28px -16px color-mix(in srgb, var(--mi-p) 80%, transparent); text-align: start;
}
.acd__preview.is-mc { background: linear-gradient(135deg, var(--mi-s), color-mix(in srgb, var(--mi-s) 50%, var(--mi-orange))); color: var(--mi-s-on); }
.acd__preview.is-amex { background: linear-gradient(135deg, var(--mi-teal), color-mix(in srgb, var(--mi-teal) 50%, var(--mi-blue))); }
.acd__preview::after { content: ""; position: absolute; inset: -40% -20% auto auto; width: 70%; aspect-ratio: 1; border-radius: 50%; background: color-mix(in srgb, var(--mi-p-on) 14%, transparent); }
.acd__chip { width: 30px; height: 22px; border-radius: 5px; background: linear-gradient(135deg, color-mix(in srgb, var(--mi-yellow) 80%, var(--mi-card)), var(--mi-yellow)); }
.acd__brand { position: absolute; top: 14px; right: 16px; font-size: 12px; font-weight: 800; letter-spacing: .04em; }
.acd__num { align-self: end; font: 600 14px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; white-space: nowrap; }
.acd__meta { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; opacity: .9; }
.acd__meta span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.acd__form { display: grid; gap: 12px; margin-top: 4px; text-align: start; }
.acd__pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.acd__suffix { padding-inline: 10px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.acd__default { display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; }
.acd__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; }
.acd__after { position: absolute; inset: auto 16px 16px; display: grid; justify-items: start; gap: 10px; }
</style>
