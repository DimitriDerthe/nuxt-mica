<template>
  <div class="sfs-cq">
    <section class="sfs" aria-labelledby="sfs-title">
      <article class="sfs__card sfs__query">
        <MiText id="sfs-title" variant="caption" tone="label2" weight="semibold" as="h2">Receivables</MiText>
        <!-- The filter reads as a sentence; every underlined word is a compact select. -->
        <p class="sfs__sentence">
          Show
          <MiMenu v-model="status" variant="popup" :items="statusItems" aria-label="Invoice status">
            <template #trigger="{ props: tp }"><button v-bind="tp" type="button" class="sfs__token">{{ labelOf(statusItems, status) }}<MiIcon name="chevron-down" :size="14" /></button></template>
          </MiMenu>
          invoices from
          <MiMenu v-model="customer" variant="popup" :items="customerItems" aria-label="Customer">
            <template #trigger="{ props: tp }"><button v-bind="tp" type="button" class="sfs__token">{{ labelOf(customerItems, customer) }}<MiIcon name="chevron-down" :size="14" /></button></template>
          </MiMenu>
          due
          <MiMenu v-model="dueWindow" variant="popup" :items="windowItems" aria-label="Due window">
            <template #trigger="{ props: tp }"><button v-bind="tp" type="button" class="sfs__token">{{ labelOf(windowItems, dueWindow) }}<MiIcon name="chevron-down" :size="14" /></button></template>
          </MiMenu>,
          largest first.
        </p>

        <div class="sfs__total" aria-live="polite">
          <span class="sfs__sum">{{ money(total, 'EUR') }}</span>
          <MiText variant="footnote" tone="label2">across {{ results.length }} {{ results.length === 1 ? 'invoice' : 'invoices' }}</MiText>
        </div>

        <ul class="sfs__list" aria-label="Matching invoices">
          <li v-for="inv in results.slice(0, 4)" :key="inv.id" class="sfs__inv">
            <MiAvatar :name="inv.customer" size="sm" shape="square" tone="auto" decorative />
            <div class="sfs__inv-text">
              <MiText variant="subheadline" weight="medium" :lines="1">{{ inv.customer }}</MiText>
              <MiText variant="caption" tone="label2">{{ inv.id }} · {{ dueText(inv.due) }}</MiText>
            </div>
            <span class="sfs__amt">{{ money(inv.amount, 'EUR') }}</span>
          </li>
          <li v-if="!results.length" class="sfs__none"><MiText variant="footnote" tone="label2">Nothing matches this sentence. Try a wider due window.</MiText></li>
          <li v-else-if="results.length > 4" class="sfs__more"><MiText variant="caption" tone="label2">+ {{ results.length - 4 }} more</MiText></li>
        </ul>
      </article>

      <!-- A select embedded in a field, its list shown open right under it. -->
      <article class="sfs__card sfs__credit">
        <MiText variant="headline" as="h3">Issue a credit note</MiText>
        <MiField label="Amount" :hint="hint">
          <MiInput v-model="amount" inputmode="decimal" placeholder="0.00">
            <template #suffix>
              <button type="button" class="sfs__cur" :aria-expanded="curOpen" aria-controls="sfs-currencies" @click="curOpen = !curOpen">
                {{ currency }}<MiIcon :name="curOpen ? 'chevron-up' : 'chevron-down'" :size="14" />
              </button>
            </template>
          </MiInput>
        </MiField>
        <div v-show="curOpen" id="sfs-currencies" class="sfs__curlist">
          <MiList label="Currency">
            <MiListItem
              v-for="c in currencies" :key="c.code" button :title="c.code" :subtitle="c.name" :value="c.code === 'EUR' ? 'base' : rate(c)"
              :aria-pressed="c.code === currency" @click="currency = c.code"
            >
              <template #leading><span class="sfs__sym" :class="{ 'is-on': c.code === currency }">{{ c.symbol }}</span></template>
            </MiListItem>
          </MiList>
        </div>
        <MiButton block :disabled="!parsed">Issue {{ parsed ? money(parsed, currency) : 'credit note' }}</MiButton>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Invoice { id: string, customer: string, amount: number, due: number, paid: boolean }
// `due` is days from today; negative means overdue.
const invoices: Invoice[] = [
  { id: 'INV-2291', customer: 'Halden Fjord Hotels', amount: 18420, due: -12, paid: false },
  { id: 'INV-2304', customer: 'Atelier Sarrazin', amount: 4260, due: 6, paid: false },
  { id: 'INV-2307', customer: 'Halden Fjord Hotels', amount: 9150, due: 21, paid: false },
  { id: 'INV-2311', customer: 'Mbeki Cold Chain', amount: 27800, due: -3, paid: false },
  { id: 'INV-2315', customer: 'Lumen Dental Group', amount: 2390, due: 44, paid: false },
  { id: 'INV-2280', customer: 'Atelier Sarrazin', amount: 6100, due: -30, paid: true },
  { id: 'INV-2318', customer: 'Mbeki Cold Chain', amount: 12650, due: 13, paid: false },
  { id: 'INV-2320', customer: 'Lumen Dental Group', amount: 1840, due: 2, paid: false }
]

const statusItems = [{ value: 'unpaid', label: 'unpaid' }, { value: 'overdue', label: 'overdue' }, { value: 'paid', label: 'paid' }, { value: 'all', label: 'all' }]
const customerItems = [
  { value: 'any', label: 'every customer' },
  { separator: true },
  ...[...new Set(invoices.map(i => i.customer))].map(c => ({ value: c, label: c }))
]
const windowItems = [{ value: 7, label: 'within 7 days' }, { value: 30, label: 'within 30 days' }, { value: 90, label: 'within 90 days' }, { value: 0, label: 'any time' }]

const status = ref<string | number | undefined>('unpaid')
const customer = ref<string | number | undefined>('any')
const dueWindow = ref<string | number | undefined>(30)

const labelOf = (items: { value?: string | number, label?: string }[], v: string | number | undefined) => items.find(i => i.value === v)?.label ?? ''

const results = computed(() => invoices
  .filter(i => status.value === 'all' || (status.value === 'paid' ? i.paid : !i.paid && (status.value !== 'overdue' || i.due < 0)))
  .filter(i => customer.value === 'any' || i.customer === customer.value)
  .filter(i => !dueWindow.value || i.due <= Number(dueWindow.value))
  .sort((a, b) => b.amount - a.amount))
const total = computed(() => results.value.reduce((s, i) => s + i.amount, 0))

const dueText = (d: number) => (d < 0 ? `${-d} days overdue` : d === 0 ? 'due today' : `due in ${d} days`)
const money = (n: number, code: string) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: code, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)

interface Currency { code: string, name: string, symbol: string, perEur: number }
const currencies: Currency[] = [
  { code: 'EUR', name: 'Euro', symbol: '€', perEur: 1 },
  { code: 'USD', name: 'US dollar', symbol: '$', perEur: 1.08 },
  { code: 'GBP', name: 'Pound sterling', symbol: '£', perEur: 0.86 },
  { code: 'CHF', name: 'Swiss franc', symbol: 'Fr', perEur: 0.95 },
  { code: 'NOK', name: 'Norwegian krone', symbol: 'kr', perEur: 11.62 }
]
const rate = (c: Currency) => `${c.perEur.toFixed(2)} / €`
const currency = ref('USD')
const curOpen = ref(true)
const amount = ref('1250')
const parsed = computed(() => { const n = Number(amount.value.replace(/[^0-9.]/g, '')); return Number.isFinite(n) && n > 0 ? n : 0 })
const hint = computed(() => {
  const c = currencies.find(x => x.code === currency.value)!
  return parsed.value && c.code !== 'EUR' ? `≈ ${money(Math.round((parsed.value / c.perEur) * 100) / 100, 'EUR')} at today's rate` : 'Booked in euros'
})
</script>

<style scoped>
.sfs-cq { container-type: inline-size; }
.sfs { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; font-family: var(--mi-font); color: var(--mi-label); }
@container (min-width: 800px) { .sfs { grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr); } }

.sfs__card { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.sfs__query h2 { text-transform: uppercase; letter-spacing: .08em; }
.sfs__sentence { margin: 0; font-size: clamp(20px, 4.4cqi, 28px); line-height: 1.5; font-weight: 600; letter-spacing: -.02em; color: var(--mi-label2); text-wrap: pretty; }
.sfs__token { display: inline-flex; align-items: center; gap: 4px; padding: 0 2px; border: 0; border-bottom: 2px dashed color-mix(in srgb, var(--mi-p) 55%, transparent); border-radius: 4px 4px 0 0; background: none; color: var(--mi-label); font: inherit; letter-spacing: inherit; cursor: pointer; }
.sfs__token:hover, .sfs__token[aria-expanded="true"] { background: var(--mi-p-tint); border-bottom-style: solid; }
.sfs__token:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.sfs__token :deep(svg) { color: var(--mi-p-text); }

.sfs__total { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; }
.sfs__sum { font-size: 34px; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.sfs__list { display: grid; margin: 0; padding: 0; list-style: none; }
.sfs__inv { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 10px 0; border-top: .5px solid var(--mi-sep); }
.sfs__inv-text { display: grid; min-width: 0; }
.sfs__amt { font-weight: 600; font-variant-numeric: tabular-nums; }
.sfs__none, .sfs__more { padding: 10px 0; border-top: .5px solid var(--mi-sep); }

.sfs__cur { display: inline-flex; align-items: center; gap: 4px; height: 100%; padding: 0 10px; border: 0; background: none; color: var(--mi-label); font: inherit; font-weight: 600; cursor: pointer; }
.sfs__cur:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; border-radius: 6px; }
.sfs__curlist { margin-top: -8px; transform-origin: top; animation: sfs-drop var(--mi-dur-3) var(--mi-spring); }
@keyframes sfs-drop { from { opacity: 0; transform: translateY(-4px) scale(.98); } }
.sfs__sym { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: var(--mi-fill3); font-size: 13px; font-weight: 700; color: var(--mi-label2); transition: transform var(--mi-dur-2) var(--mi-spring); }
.sfs__sym.is-on { background: var(--mi-p); color: var(--mi-p-on); transform: scale(1.06); }
</style>
