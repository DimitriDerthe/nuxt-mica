<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:font-mi mi:text-label mi:@[800px]:grid-cols-[minmax(0,_1.5fr)_minmax(280px,_1fr)]" aria-labelledby="sfs-title">
      <article class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
        <MiText id="sfs-title" variant="caption" tone="label2" weight="semibold" as="h2" class="mi:uppercase! mi:tracking-[.08em]!">Receivables</MiText>
        <!-- The filter reads as a sentence; every underlined word is a compact select. -->
        <p class="mi:m-0 mi:text-[clamp(20px,_4.4cqi,_28px)] mi:leading-normal mi:font-semibold mi:tracking-[-.02em] mi:text-label2 mi:text-pretty">
          Show
          <MiMenu v-model="status" variant="popup" :items="statusItems" aria-label="Invoice status">
            <template #trigger="{ props: tp }"><button v-bind="tp" type="button" class="mi:[border:0] mi:border-b-2 mi:[border-bottom-style:dashed] mi:border-b-p/55 mi:hover:[border-bottom-style:solid] mi:aria-expanded:[border-bottom-style:solid] mi:[&_svg]:text-p-text mi:inline-flex mi:items-center mi:gap-1 mi:py-0 mi:px-0.5 mi:rounded-[4px_4px_0_0] mi:[background:none] mi:text-label mi:[font:inherit] mi:tracking-[inherit] mi:cursor-pointer mi:hover:[background:var(--mi-p-tint)] mi:aria-expanded:[background:var(--mi-p-tint)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]">{{ labelOf(statusItems, status) }}<MiIcon name="chevron-down" :size="14" /></button></template>
          </MiMenu>
          invoices from
          <MiMenu v-model="customer" variant="popup" :items="customerItems" aria-label="Customer">
            <template #trigger="{ props: tp }"><button v-bind="tp" type="button" class="mi:[border:0] mi:border-b-2 mi:[border-bottom-style:dashed] mi:border-b-p/55 mi:hover:[border-bottom-style:solid] mi:aria-expanded:[border-bottom-style:solid] mi:[&_svg]:text-p-text mi:inline-flex mi:items-center mi:gap-1 mi:py-0 mi:px-0.5 mi:rounded-[4px_4px_0_0] mi:[background:none] mi:text-label mi:[font:inherit] mi:tracking-[inherit] mi:cursor-pointer mi:hover:[background:var(--mi-p-tint)] mi:aria-expanded:[background:var(--mi-p-tint)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]">{{ labelOf(customerItems, customer) }}<MiIcon name="chevron-down" :size="14" /></button></template>
          </MiMenu>
          due
          <MiMenu v-model="dueWindow" variant="popup" :items="windowItems" aria-label="Due window">
            <template #trigger="{ props: tp }"><button v-bind="tp" type="button" class="mi:[border:0] mi:border-b-2 mi:[border-bottom-style:dashed] mi:border-b-p/55 mi:hover:[border-bottom-style:solid] mi:aria-expanded:[border-bottom-style:solid] mi:[&_svg]:text-p-text mi:inline-flex mi:items-center mi:gap-1 mi:py-0 mi:px-0.5 mi:rounded-[4px_4px_0_0] mi:[background:none] mi:text-label mi:[font:inherit] mi:tracking-[inherit] mi:cursor-pointer mi:hover:[background:var(--mi-p-tint)] mi:aria-expanded:[background:var(--mi-p-tint)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]">{{ labelOf(windowItems, dueWindow) }}<MiIcon name="chevron-down" :size="14" /></button></template>
          </MiMenu>,
          largest first.
        </p>

        <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-2.5" aria-live="polite">
          <span class="mi:text-[34px] mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ money(total, 'EUR') }}</span>
          <MiText variant="footnote" tone="label2">across {{ results.length }} {{ results.length === 1 ? 'invoice' : 'invoices' }}</MiText>
        </div>

        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Matching invoices">
          <li v-for="inv in results.slice(0, 4)" :key="inv.id" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3 mi:py-2.5 mi:px-0 mi:[border-top:.5px_solid_var(--mi-sep)]">
            <MiAvatar :name="inv.customer" size="sm" shape="square" tone="auto" decorative />
            <div class="mi:grid mi:min-w-0">
              <MiText variant="subheadline" weight="medium" :lines="1">{{ inv.customer }}</MiText>
              <MiText variant="caption" tone="label2">{{ inv.id }} · {{ dueText(inv.due) }}</MiText>
            </div>
            <span class="mi:font-semibold mi:tabular-nums">{{ money(inv.amount, 'EUR') }}</span>
          </li>
          <li v-if="!results.length" class="mi:py-2.5 mi:px-0 mi:[border-top:.5px_solid_var(--mi-sep)]"><MiText variant="footnote" tone="label2">Nothing matches this sentence. Try a wider due window.</MiText></li>
          <li v-else-if="results.length > 4" class="mi:py-2.5 mi:px-0 mi:[border-top:.5px_solid_var(--mi-sep)]"><MiText variant="caption" tone="label2">+ {{ results.length - 4 }} more</MiText></li>
        </ul>
      </article>

      <!-- A select embedded in a field, its list shown open right under it. -->
      <article class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0">
        <MiText variant="headline" as="h3">Issue a credit note</MiText>
        <MiField label="Amount" :hint="hint">
          <MiInput v-model="amount" inputmode="decimal" placeholder="0.00">
            <template #suffix>
              <button type="button" class="mi:[font:inherit] mi:font-semibold mi:inline-flex mi:items-center mi:gap-1 mi:h-full mi:py-0 mi:px-2.5 mi:[border:0] mi:[background:none] mi:text-label mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-[6px]" :aria-expanded="curOpen" aria-controls="sfs-currencies" @click="curOpen = !curOpen">
                {{ currency }}<MiIcon :name="curOpen ? 'chevron-up' : 'chevron-down'" :size="14" />
              </button>
            </template>
          </MiInput>
        </MiField>
        <div v-show="curOpen" id="sfs-currencies" class="mi:[--mi-in-y:-4px] mi:[--mi-in-s:.98] mi:animate-[in_var(--mi-dur-3)_var(--mi-spring)] mi:-mt-2 mi:origin-top">
          <MiList label="Currency">
            <MiListItem
              v-for="c in currencies" :key="c.code" button :title="c.code" :subtitle="c.name" :value="c.code === 'EUR' ? 'base' : rate(c)"
              :aria-pressed="c.code === currency" @click="currency = c.code"
            >
              <template #leading><span class="mi:grid mi:place-items-center mi:w-7.5 mi:h-7.5 mi:rounded-[8px] mi:text-[13px] mi:font-bold mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)]" :class="c.code === currency ? 'mi:[background:var(--mi-p)] mi:transform-[scale(1.06)] mi:text-p-on' : 'mi:[background:var(--mi-fill3)] mi:text-label2'">{{ c.symbol }}</span></template>
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
