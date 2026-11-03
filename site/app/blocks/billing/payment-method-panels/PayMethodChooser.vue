<template>
  <section class="pmc" aria-labelledby="pmc-title">
    <header class="pmc__head">
      <MiText id="pmc-title" as="h2" variant="title3" weight="bold">How should Quarry &amp; Co. pay?</MiText>
      <MiText variant="footnote" tone="label2">Business plan, 24 seats · €4,608 billed yearly on 1 January.</MiText>
    </header>

    <div class="pmc__body">
      <MiRadioGroup v-model="method" label="Payment method" :options="options" class="pmc__options" />

      <!-- Detail pane: what this method needs, shown beside the choice. -->
      <div class="pmc__detail" aria-live="polite">
        <template v-if="method === 'card'">
          <MiText as="h3" variant="headline">Card on file</MiText>
          <div class="pmc__card">
            <span class="pmc__brand" aria-hidden="true">VISA</span>
            <div>
              <MiText variant="subheadline" weight="semibold">Visa •••• 4242</MiText>
              <MiText variant="caption" tone="label2">Expires 08/28 · Rafael Quarry</MiText>
            </div>
          </div>
          <MiText variant="footnote" tone="label2">Charged automatically on renewal. A 3-D Secure check may be asked for amounts above €3,000.</MiText>
          <MiButton variant="plain" size="small">Use a different card</MiButton>
        </template>

        <template v-else-if="method === 'transfer'">
          <MiText as="h3" variant="headline">Bank transfer details</MiText>
          <MiText variant="footnote" tone="label2">Send the amount within 14 days of each invoice. Always include the reference.</MiText>
          <dl class="pmc__copy">
            <div v-for="f in transferFields" :key="f.label">
              <dt>{{ f.label }}</dt>
              <dd>
                <span>{{ f.value }}</span>
                <MiCopyButton :value="f.value.replaceAll(' ', '')" icon-only variant="ghost" :label="'Copy ' + f.label" />
              </dd>
            </div>
          </dl>
        </template>

        <template v-else>
          <MiText as="h3" variant="headline">Invoice with payment terms</MiText>
          <MiSegmented v-model="terms" label="Payment terms" :options="termOptions" />
          <MiField label="Purchase order number" hint="Printed on every invoice; leave empty if you don't use POs.">
            <MiInput v-model="po" placeholder="PO-" />
          </MiField>
          <MiAlert v-if="terms !== 30" tone="info" :message="`Net ${terms} needs a quick credit check. We reply within one business day.`" />
        </template>
      </div>
    </div>

    <footer class="pmc__foot">
      <MiText variant="footnote" tone="label2" aria-live="polite">{{ summary }}</MiText>
      <MiButton :disabled="savedAs === method && savedTerms === terms" @click="save">
        {{ savedAs === method && savedTerms === terms ? 'Saved' : 'Save payment method' }}
      </MiButton>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Method = 'card' | 'transfer' | 'invoice'

const options: { value: Method, label: string, description: string }[] = [
  { value: 'card', label: 'Card', description: 'Automatic, no paperwork' },
  { value: 'transfer', label: 'Bank transfer', description: 'Pay each invoice from your bank' },
  { value: 'invoice', label: 'Invoice terms', description: 'Net 30 to 60, with a PO number' }
]
const termOptions = [{ value: 30, label: 'Net 30' }, { value: 45, label: 'Net 45' }, { value: 60, label: 'Net 60' }]
const transferFields = [
  { label: 'IBAN', value: 'FR76 3000 4012 3400 0109 8765 432' },
  { label: 'BIC', value: 'BNPAFRPPXXX' },
  { label: 'Reference', value: 'QRY-24-0117' }
]

const method = ref<string | number | boolean | null>('card')
const terms = ref<string | number | null>(30)
const po = ref('')
const savedAs = ref<string | number | boolean | null>('card')
const savedTerms = ref<string | number | null>(30)

const summary = computed(() => {
  if (method.value === 'card') return 'Next charge: €4,608.00 to Visa •••• 4242 on 1 January.'
  if (method.value === 'transfer') return 'Next invoice: €4,608.00 on 1 January, due by 15 January.'
  return `Next invoice: €4,608.00 on 1 January, due Net ${terms.value}${po.value.trim() ? ' · ' + po.value.trim() : ''}.`
})

function save() { savedAs.value = method.value; savedTerms.value = terms.value }
</script>

<style scoped>
.pmc { container-type: inline-size; display: flex; flex-direction: column; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.pmc__head { display: grid; gap: 4px; }
.pmc__body { display: grid; gap: 16px; }
@container (min-width: 680px) { .pmc__body { grid-template-columns: 240px minmax(0, 1fr); gap: 24px; } }
.pmc__options { align-self: start; }
.pmc__detail { display: grid; align-content: start; justify-items: start; gap: 12px; min-width: 0; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.pmc__detail > * { max-width: 100%; }

.pmc__card { display: flex; align-items: center; gap: 12px; }
.pmc__brand { display: grid; place-items: center; width: 52px; height: 34px; border-radius: 7px; font-size: 11px; font-weight: 800; letter-spacing: .04em; color: var(--mi-p-on); background: linear-gradient(135deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 50%, var(--mi-s))); }

.pmc__copy { display: grid; gap: 2px; width: 100%; margin: 0; }
.pmc__copy div { display: grid; grid-template-columns: minmax(0, 1fr); padding: 8px 0; border-bottom: 1px solid var(--mi-sep); }
.pmc__copy div:last-child { border-bottom: 0; }
.pmc__copy dt { font-size: 12px; color: var(--mi-label2); }
.pmc__copy dd { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0; font: 500 14px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; }
.pmc__copy dd span { min-width: 0; overflow-wrap: anywhere; }

.pmc__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
</style>
