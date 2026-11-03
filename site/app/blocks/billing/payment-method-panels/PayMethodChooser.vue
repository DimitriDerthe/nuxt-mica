<template>
  <section class="mi:@container mi:flex mi:flex-col mi:gap-4.5 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="pmc-title">
    <header class="mi:grid mi:gap-1">
      <MiText id="pmc-title" as="h2" variant="title3" weight="bold">How should Quarry &amp; Co. pay?</MiText>
      <MiText variant="footnote" tone="label2">Business plan, 24 seats · €4,608 billed yearly on 1 January.</MiText>
    </header>

    <div class="mi:grid mi:gap-4 mi:@[680px]:grid-cols-[240px_minmax(0,_1fr)] mi:@[680px]:gap-6">
      <MiRadioGroup v-model="method" label="Payment method" :options="options" class="mi:self-start" />

      <!-- Detail pane: what this method needs, shown beside the choice. -->
      <div class="mi:grid mi:content-start mi:justify-items-start mi:gap-3 mi:min-w-0 mi:p-4 mi:rounded-lg mi:[background:var(--mi-fill4)]" aria-live="polite">
        <template v-if="method === 'card'">
          <MiText class="mi:max-w-full" as="h3" variant="headline">Card on file</MiText>
          <div class="mi:max-w-full mi:flex mi:items-center mi:gap-3">
            <span class="mi:grid mi:place-items-center mi:w-13 mi:h-8.5 mi:rounded-[7px] mi:text-[11px] mi:font-extrabold mi:tracking-[.04em] mi:text-p-on mi:[background:linear-gradient(135deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_50%,_var(--mi-s)))]" aria-hidden="true">VISA</span>
            <div>
              <MiText variant="subheadline" weight="semibold">Visa •••• 4242</MiText>
              <MiText variant="caption" tone="label2">Expires 08/28 · Rafael Quarry</MiText>
            </div>
          </div>
          <MiText class="mi:max-w-full" variant="footnote" tone="label2">Charged automatically on renewal. A 3-D Secure check may be asked for amounts above €3,000.</MiText>
          <MiButton class="mi:max-w-full" variant="plain" size="small">Use a different card</MiButton>
        </template>

        <template v-else-if="method === 'transfer'">
          <MiText class="mi:max-w-full" as="h3" variant="headline">Bank transfer details</MiText>
          <MiText class="mi:max-w-full" variant="footnote" tone="label2">Send the amount within 14 days of each invoice. Always include the reference.</MiText>
          <dl class="mi:max-w-full mi:grid mi:gap-0.5 mi:w-full mi:m-0">
            <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:py-2 mi:border-b mi:border-b-sep mi:last:[border-bottom:0]" v-for="f in transferFields" :key="f.label">
              <dt class="mi:text-[12px] mi:text-label2">{{ f.label }}</dt>
              <dd class="mi:flex mi:items-center mi:justify-between mi:gap-2 mi:[font:500_14px/1.4_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:m-0">
                <span class="mi:min-w-0 mi:[overflow-wrap:anywhere]">{{ f.value }}</span>
                <MiCopyButton class="mi:grid-cols-[minmax(0,_1fr)] mi:m-0" :value="f.value.replaceAll(' ', '')" icon-only variant="ghost" :label="'Copy ' + f.label" />
              </dd>
            </div>
          </dl>
        </template>

        <template v-else>
          <MiText class="mi:max-w-full" as="h3" variant="headline">Invoice with payment terms</MiText>
          <MiSegmented class="mi:max-w-full" v-model="terms" label="Payment terms" :options="termOptions" />
          <MiField class="mi:max-w-full" label="Purchase order number" hint="Printed on every invoice; leave empty if you don't use POs.">
            <MiInput v-model="po" placeholder="PO-" />
          </MiField>
          <MiAlert class="mi:max-w-full" v-if="terms !== 30" tone="info" :message="`Net ${terms} needs a quick credit check. We reply within one business day.`" />
        </template>
      </div>
    </div>

    <footer class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:pt-4 mi:border-t mi:border-t-sep">
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
