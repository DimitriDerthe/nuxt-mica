<template>
  <section class="pfi mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="pfi-title">
    <div class="pfi__toolbar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:print:hidden">
      <div class="pfi__toggles mi:flex mi:flex-wrap mi:gap-y-2 mi:gap-x-4">
        <label class="pfi__toggle mi:inline-flex mi:items-center mi:gap-2 mi:cursor-pointer">
          <MiSwitch v-model="early" size="compact" label="Apply early-payment discount" />
          <MiText as="span" variant="footnote">2% early-payment discount</MiText>
        </label>
        <label class="pfi__toggle mi:inline-flex mi:items-center mi:gap-2 mi:cursor-pointer">
          <MiSwitch v-model="paid" size="compact" tone="success" label="Mark as paid" />
          <MiText as="span" variant="footnote">Mark as paid</MiText>
        </label>
      </div>
      <div class="pfi__buttons mi:flex mi:flex-wrap mi:gap-y-2 mi:gap-x-4">
        <MiButton variant="gray" size="small" @click="print">
          <template #leading><MiIcon :svg="printer" :size="16" /></template>
          Print
        </MiButton>
        <MiButton size="small">Send to client</MiButton>
      </div>
    </div>

    <article class="pfi__paper mi:relative mi:grid mi:gap-5.5 mi:pt-5.5 mi:px-4.5 mi:pb-0 mi:overflow-hidden mi:rounded-[6px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_0_18px_40px_-24px_color-mix(in_srgb,_var(--mi-label)_40%,_transparent)] mi:@[720px]:pt-10 mi:@[720px]:px-12 mi:@[720px]:pb-0 mi:@[720px]:gap-7 mi:print:shadow-none">
      <header class="pfi__head mi:flex mi:flex-wrap mi:justify-between mi:gap-4.5 mi:pb-4.5 mi:border-b-2 mi:border-b-label">
        <div class="pfi__from mi:flex mi:gap-3 mi:max-w-90">
          <span class="pfi__logo mi:flex-[none] mi:w-9 mi:h-9 mi:rounded-[50%] mi:[background:linear-gradient(var(--mi-card),_var(--mi-card))_padding-box,_conic-gradient(from_0deg,_var(--mi-p),_var(--mi-s),_var(--mi-p))_border-box] mi:border-6 mi:border-transparent mi:box-border" aria-hidden="true" />
          <div>
            <MiText variant="headline" weight="bold">Moraine Studio</MiText>
            <MiText variant="caption" tone="label2">22 quai des Chartrons, 33000 Bordeaux · VAT FR 41 902 118 554</MiText>
          </div>
        </div>
        <div class="pfi__title mi:grid mi:justify-items-start mi:@[560px]:justify-items-end">
          <MiText id="pfi-title" as="h2" variant="title1" weight="bold">Invoice</MiText>
          <MiText variant="footnote" tone="label2" tabular>INV-2026-0147</MiText>
          <span v-if="paid" class="pfi__stamp mi:inline-block mi:mt-2.5 mi:py-[5px] mi:px-3 mi:border-3 mi:border-green mi:rounded-[10px] mi:text-[16px] mi:font-extrabold mi:tracking-[.08em] mi:uppercase mi:text-green-t mi:opacity-85 mi:transform-[rotate(-6deg)]">Paid · 4 Nov</span>
        </div>
      </header>

      <MiDetails :items="facts" label-width="96px" class="pfi__facts" />

      <div class="pfi__table-wrap mi:overflow-x-auto mi:-mx-1 mi:px-1">
        <table class="pfi__table mi:w-full mi:min-w-120 mi:border-collapse mi:text-[14px]">
          <caption class="pfi__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Line items</caption>
          <thead><tr><th class="mi:[.pfi__table_&]:text-[11px] mi:[.pfi__table_&]:font-semibold mi:[.pfi__table_&]:text-label2" scope="col">Description</th><th scope="col" class="num mi:[.pfi__table_&]:text-[11px] mi:[.pfi__table_&]:font-semibold mi:[.pfi__table_&]:text-label2 mi:[.pfi__table_&]:whitespace-nowrap mi:[.pfi__table_&]:tabular-nums">Qty</th><th scope="col" class="num mi:[.pfi__table_&]:text-[11px] mi:[.pfi__table_&]:font-semibold mi:[.pfi__table_&]:text-label2 mi:[.pfi__table_&]:whitespace-nowrap mi:[.pfi__table_&]:tabular-nums">Rate</th><th scope="col" class="num mi:[.pfi__table_&]:text-[11px] mi:[.pfi__table_&]:font-semibold mi:[.pfi__table_&]:text-label2 mi:[.pfi__table_&]:whitespace-nowrap mi:[.pfi__table_&]:tabular-nums">Amount</th></tr></thead>
          <tbody>
            <tr v-for="l in lines" :key="l.name">
              <td class="mi:[.pfi__table_&]:align-top"><span class="pfi__item mi:block mi:font-semibold">{{ l.name }}</span><span class="pfi__item-sub mi:block mi:text-[12px] mi:text-label2">{{ l.sub }}</span></td>
              <td class="num mi:[.pfi__table_&]:align-top mi:[.pfi__table_&]:whitespace-nowrap mi:[.pfi__table_&]:tabular-nums">{{ l.qty }} {{ l.unit }}</td>
              <td class="num mi:[.pfi__table_&]:align-top mi:[.pfi__table_&]:whitespace-nowrap mi:[.pfi__table_&]:tabular-nums">{{ eur(l.rate) }}</td>
              <td class="num strong mi:[.pfi__table_&]:align-top mi:[.pfi__table_&]:whitespace-nowrap mi:[.pfi__table_&]:tabular-nums mi:[.pfi__table_&]:font-semibold">{{ eur(l.qty * l.rate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pfi__bottom mi:grid mi:gap-4.5 mi:@[640px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[640px]:items-end">
        <MiText variant="caption" tone="label2" class="pfi__note mi:max-w-[46ch]">
          Thank you for a second season together. Payment by bank transfer within 30 days; please quote the reference below.
        </MiText>
        <dl class="pfi__totals mi:grid mi:m-0 mi:tabular-nums">
          <div class="mi:[.pfi__totals_&]:flex mi:[.pfi__totals_&]:justify-between mi:[.pfi__totals_&]:gap-3 mi:[.pfi__totals_&]:text-[14px]"><dt class="mi:[.pfi__totals_&]:text-label2">Subtotal</dt><dd class="mi:[.pfi__totals_&]:m-0">{{ eur(subtotal) }}</dd></div>
          <div v-if="early" class="is-discount mi:[.pfi__totals_&]:flex mi:[.pfi__totals_&]:justify-between mi:[.pfi__totals_&]:gap-3 mi:[.pfi__totals_&]:text-[14px]"><dt class="mi:[.pfi__totals_&]:text-label2">Early payment −2%</dt><dd class="mi:[.pfi__totals_&]:m-0 mi:[.pfi__totals_.is-discount_&]:text-green-t">−{{ eur(discount) }}</dd></div>
          <div class="mi:[.pfi__totals_&]:flex mi:[.pfi__totals_&]:justify-between mi:[.pfi__totals_&]:gap-3 mi:[.pfi__totals_&]:text-[14px]"><dt class="mi:[.pfi__totals_&]:text-label2">VAT 20%</dt><dd class="mi:[.pfi__totals_&]:m-0">{{ eur(vat) }}</dd></div>
          <div class="is-total mi:[.pfi__totals_&]:flex mi:[.pfi__totals_&]:justify-between mi:[.pfi__totals_&]:gap-3 mi:[.pfi__totals_&]:text-[14px] mi:[.pfi__totals_&]:mt-1.5 mi:[.pfi__totals_&]:border-t-2 mi:[.pfi__totals_&]:border-t-label mi:[.pfi__totals_&]:text-[18px] mi:[.pfi__totals_&]:font-bold"><dt class="mi:[.pfi__totals_&]:text-label2 mi:[.pfi__totals_.is-total_&]:text-label">Total due</dt><dd class="mi:[.pfi__totals_&]:m-0">{{ eur(paid ? 0 : total) }}</dd></div>
        </dl>
      </div>

      <!-- Tear-off slip: a perforated edge with punched notches, and a barcode drawn from the reference. -->
      <footer class="pfi__stub mi:relative mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-4 mi:mt-1 mi:-mx-4.5 mi:mb-0 mi:py-5.5 mi:px-4.5 mi:[border-top:2px_dashed_var(--mi-sep2,_var(--mi-sep))] mi:[background:var(--mi-fill4)] mi:@[720px]:-mx-12 mi:@[720px]:py-6 mi:@[720px]:px-12 mi:before:content-[''] mi:before:absolute mi:before:-top-3 mi:before:w-5.5 mi:before:h-5.5 mi:before:rounded-[50%] mi:before:[background:var(--mi-page)] mi:before:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:after:content-[''] mi:after:absolute mi:after:-top-3 mi:after:w-5.5 mi:after:h-5.5 mi:after:rounded-[50%] mi:after:[background:var(--mi-page)] mi:after:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:before:left-[-11px] mi:after:right-[-11px]">
        <div class="pfi__stub-text mi:grid mi:gap-0.5 mi:min-w-0">
          <MiText variant="caption" weight="semibold" tone="label2" class="pfi__stub-label">Payment slip</MiText>
          <MiText variant="subheadline" weight="semibold" tabular>IBAN FR76 3000 4000 0312 3456 7890 143</MiText>
          <MiText variant="caption" tone="label2" tabular>Reference MOR-0147-SALT · due 2 Dec 2026 · {{ eur(total) }}</MiText>
        </div>
        <div class="pfi__barcode mi:flex mi:w-42 mi:max-w-full mi:h-10" role="img" aria-label="Payment reference barcode">
          <span v-for="(w, i) in bars" :key="i" :style="{ flexGrow: w }" :class="{ 'is-gap': i % 2 === 1 }" />
        </div>
      </footer>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const printer = '<path d="M7 9V4h10v5"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6H7z"/>'

const early = ref(false)
const paid = ref(false)

const facts = [
  { key: 'to', label: 'Billed to', value: 'Saltmarsh Survey Co., 5 Harbour Row, Bristol BS1 4RN' },
  { key: 'issued', label: 'Issued', value: '2 Nov 2026' },
  { key: 'due', label: 'Due', value: '2 Dec 2026 (net 30)' },
  { key: 'po', label: 'PO number', value: 'SSC-PO-88214' }
]
const lines = [
  { name: 'Field app redesign, phase 2', sub: 'Offline sync flows, 14 screens', qty: 12, unit: 'days', rate: 720 },
  { name: 'Usability study', sub: '6 sessions with survey crews, report', qty: 1, unit: 'study', rate: 2400 },
  { name: 'Design system upkeep', sub: 'October retainer', qty: 1, unit: 'month', rate: 1150 },
  { name: 'Travel to Cardiff office', sub: 'Train and one night, at cost', qty: 1, unit: '', rate: 312.4 }
]

const subtotal = computed(() => lines.reduce((n, l) => n + l.qty * l.rate, 0))
const discount = computed(() => (early.value ? subtotal.value * 0.02 : 0))
const vat = computed(() => (subtotal.value - discount.value) * 0.2)
const total = computed(() => subtotal.value - discount.value + vat.value)
const fmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' })
const eur = (n: number) => fmt.format(n)

// Deterministic bar widths from the reference string.
const bars = Array.from('MOR0147SALT2026PAY').flatMap(ch => [1 + (ch.charCodeAt(0) % 3), 1 + ((ch.charCodeAt(0) >> 2) % 2)])

function print() { window.print() }
</script>

<style scoped>
.pfi__title h2 { letter-spacing: -.03em; }
.pfi__table th { padding: 0 0 10px; letter-spacing: .06em; text-transform: uppercase; text-align: start; border-bottom: 1px solid var(--mi-sep); }
.pfi__table td { padding: 12px 0; border-bottom: 1px solid var(--mi-sep); }
.pfi__table .num { text-align: end; padding-left: 16px; }
.pfi__totals div { padding: 6px 0; }
.pfi__totals .is-total { padding-top: 12px; }
.pfi__stub-label { text-transform: uppercase; letter-spacing: .08em; }
.pfi__barcode span { background: var(--mi-label); }
.pfi__barcode span.is-gap { background: transparent; }

.pfi__stamp { animation: pfi-stamp var(--mi-dur-4) var(--mi-spring);
}
@keyframes pfi-stamp { from { opacity: 0; transform: rotate(-6deg) scale(1.6); } }
@media (prefers-reduced-motion: reduce) { .pfi__stamp { animation: none; } }
</style>
