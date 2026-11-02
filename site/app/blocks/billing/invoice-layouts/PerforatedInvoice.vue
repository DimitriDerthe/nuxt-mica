<template>
  <section class="pfi" aria-labelledby="pfi-title">
    <div class="pfi__toolbar">
      <div class="pfi__toggles">
        <label class="pfi__toggle">
          <MiSwitch v-model="early" size="compact" label="Apply early-payment discount" />
          <MiText as="span" variant="footnote">2% early-payment discount</MiText>
        </label>
        <label class="pfi__toggle">
          <MiSwitch v-model="paid" size="compact" tone="success" label="Mark as paid" />
          <MiText as="span" variant="footnote">Mark as paid</MiText>
        </label>
      </div>
      <div class="pfi__buttons">
        <MiButton variant="gray" size="small" @click="print">
          <template #leading><MiIcon :svg="printer" :size="16" /></template>
          Print
        </MiButton>
        <MiButton size="small">Send to client</MiButton>
      </div>
    </div>

    <article class="pfi__paper">
      <header class="pfi__head">
        <div class="pfi__from">
          <span class="pfi__logo" aria-hidden="true" />
          <div>
            <MiText variant="headline" weight="bold">Moraine Studio</MiText>
            <MiText variant="caption" tone="label2">22 quai des Chartrons, 33000 Bordeaux · VAT FR 41 902 118 554</MiText>
          </div>
        </div>
        <div class="pfi__title">
          <MiText id="pfi-title" as="h2" variant="title1" weight="bold">Invoice</MiText>
          <MiText variant="footnote" tone="label2" tabular>INV-2026-0147</MiText>
          <span v-if="paid" class="pfi__stamp">Paid · 4 Nov</span>
        </div>
      </header>

      <MiDetails :items="facts" label-width="96px" class="pfi__facts" />

      <div class="pfi__table-wrap">
        <table class="pfi__table">
          <caption class="pfi__sr">Line items</caption>
          <thead><tr><th scope="col">Description</th><th scope="col" class="num">Qty</th><th scope="col" class="num">Rate</th><th scope="col" class="num">Amount</th></tr></thead>
          <tbody>
            <tr v-for="l in lines" :key="l.name">
              <td><span class="pfi__item">{{ l.name }}</span><span class="pfi__item-sub">{{ l.sub }}</span></td>
              <td class="num">{{ l.qty }} {{ l.unit }}</td>
              <td class="num">{{ eur(l.rate) }}</td>
              <td class="num strong">{{ eur(l.qty * l.rate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pfi__bottom">
        <MiText variant="caption" tone="label2" class="pfi__note">
          Thank you for a second season together. Payment by bank transfer within 30 days; please quote the reference below.
        </MiText>
        <dl class="pfi__totals">
          <div><dt>Subtotal</dt><dd>{{ eur(subtotal) }}</dd></div>
          <div v-if="early" class="is-discount"><dt>Early payment −2%</dt><dd>−{{ eur(discount) }}</dd></div>
          <div><dt>VAT 20%</dt><dd>{{ eur(vat) }}</dd></div>
          <div class="is-total"><dt>Total due</dt><dd>{{ eur(paid ? 0 : total) }}</dd></div>
        </dl>
      </div>

      <!-- Tear-off slip: a perforated edge with punched notches, and a barcode drawn from the reference. -->
      <footer class="pfi__stub">
        <div class="pfi__stub-text">
          <MiText variant="caption" weight="semibold" tone="label2" class="pfi__stub-label">Payment slip</MiText>
          <MiText variant="subheadline" weight="semibold" tabular>IBAN FR76 3000 4000 0312 3456 7890 143</MiText>
          <MiText variant="caption" tone="label2" tabular>Reference MOR-0147-SALT · due 2 Dec 2026 · {{ eur(total) }}</MiText>
        </div>
        <div class="pfi__barcode" role="img" aria-label="Payment reference barcode">
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
.pfi { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.pfi__toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.pfi__toggles, .pfi__buttons { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.pfi__toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.pfi__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.pfi__paper {
  position: relative; display: grid; gap: 22px; padding: 22px 18px 0; overflow: hidden;
  border-radius: 6px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), 0 18px 40px -24px color-mix(in srgb, var(--mi-label) 40%, transparent);
}
@container (min-width: 720px) { .pfi__paper { padding: 40px 48px 0; gap: 28px; } }
.pfi__head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; padding-bottom: 18px; border-bottom: 2px solid var(--mi-label); }
.pfi__from { display: flex; gap: 12px; max-width: 360px; }
.pfi__logo { flex: none; width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(var(--mi-card), var(--mi-card)) padding-box, conic-gradient(from 0deg, var(--mi-p), var(--mi-s), var(--mi-p)) border-box; border: 6px solid transparent; box-sizing: border-box; }
.pfi__title { display: grid; justify-items: start; }
@container (min-width: 560px) { .pfi__title { justify-items: end; } }
.pfi__title h2 { letter-spacing: -.03em; }

.pfi__table-wrap { overflow-x: auto; margin-inline: -4px; padding-inline: 4px; }
.pfi__table { width: 100%; min-width: 480px; border-collapse: collapse; font-size: 14px; }
.pfi__table th { padding: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; text-align: start; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); }
.pfi__table td { padding: 12px 0; vertical-align: top; border-bottom: 1px solid var(--mi-sep); }
.pfi__table .num { text-align: end; padding-left: 16px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.pfi__table .strong { font-weight: 600; }
.pfi__item { display: block; font-weight: 600; }
.pfi__item-sub { display: block; font-size: 12px; color: var(--mi-label2); }

.pfi__bottom { display: grid; gap: 18px; }
@container (min-width: 640px) { .pfi__bottom { grid-template-columns: minmax(0, 1fr) 280px; align-items: end; } }
.pfi__note { max-width: 46ch; }
.pfi__totals { display: grid; margin: 0; font-variant-numeric: tabular-nums; }
.pfi__totals div { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; font-size: 14px; }
.pfi__totals dt { color: var(--mi-label2); }
.pfi__totals dd { margin: 0; }
.pfi__totals .is-discount dd { color: var(--mi-green-t); }
.pfi__totals .is-total { margin-top: 6px; padding-top: 12px; border-top: 2px solid var(--mi-label); font-size: 18px; font-weight: 700; }
.pfi__totals .is-total dt { color: var(--mi-label); }

.pfi__stub { position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin: 4px -18px 0; padding: 22px 18px; border-top: 2px dashed var(--mi-sep2, var(--mi-sep)); background: var(--mi-fill4); }
@container (min-width: 720px) { .pfi__stub { margin-inline: -48px; padding: 24px 48px; } }
.pfi__stub::before, .pfi__stub::after { content: ""; position: absolute; top: -12px; width: 22px; height: 22px; border-radius: 50%; background: var(--mi-page); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.pfi__stub::before { left: -11px; }
.pfi__stub::after { right: -11px; }
.pfi__stub-text { display: grid; gap: 2px; min-width: 0; }
.pfi__stub-label { text-transform: uppercase; letter-spacing: .08em; }
.pfi__barcode { display: flex; width: 168px; max-width: 100%; height: 40px; }
.pfi__barcode span { background: var(--mi-label); }
.pfi__barcode span.is-gap { background: transparent; }

.pfi__stamp {
  display: inline-block; margin-top: 10px; padding: 5px 12px; border: 3px solid var(--mi-green); border-radius: 10px;
  font-size: 16px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--mi-green-t);
  opacity: .85; transform: rotate(-6deg); animation: pfi-stamp var(--mi-dur-4) var(--mi-spring);
}
@keyframes pfi-stamp { from { opacity: 0; transform: rotate(-6deg) scale(1.6); } }
@media (prefers-reduced-motion: reduce) { .pfi__stamp { animation: none; } }
@media print { .pfi__toolbar { display: none; } .pfi__paper { box-shadow: none; } }
</style>
