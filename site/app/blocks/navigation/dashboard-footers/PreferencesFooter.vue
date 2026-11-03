<template>
  <div class="pf mi:@container mi:grid mi:content-start mi:font-mi mi:text-label mi:rounded-xl mi:overflow-hidden mi:[background:var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)]">
    <!-- Faux end of a dashboard page, so the footer is seen in place. -->
    <div class="pf__page mi:grid mi:grid-cols-[2fr_1fr] mi:gap-3 mi:p-4.5 mi:@[700px]:p-6" aria-hidden="true"><span class="mi:[.pf__page_&]:h-16 mi:[.pf__page_&]:rounded-lg mi:[.pf__page_&]:[background:var(--mi-card)] mi:[.pf__page_&]:shadow-1" /><span class="mi:[.pf__page_&]:h-16 mi:[.pf__page_&]:rounded-lg mi:[.pf__page_&]:[background:var(--mi-card)] mi:[.pf__page_&]:shadow-1" /></div>

    <footer class="pf__foot mi:grid mi:gap-5 mi:py-5 mi:px-4.5 mi:[background:var(--mi-card)] mi:shadow-[inset_0_1px_0_var(--mi-sep)] mi:@[700px]:gap-6 mi:@[700px]:pt-7 mi:@[700px]:px-6 mi:@[700px]:pb-5" aria-labelledby="pf-title">
      <h2 id="pf-title" class="pf__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Links, preferences and feedback</h2>

      <!-- Page feedback: one tap, then a thank-you that offers a follow-up. -->
      <section class="pf__ask mi:grid mi:gap-2.5 mi:py-3.5 mi:px-4 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[700px]:grid-cols-[1fr_auto] mi:@[700px]:items-center" aria-labelledby="pf-ask">
        <MiText id="pf-ask" variant="subheadline" weight="semibold" as="h3">Did the invoices page have what you needed?</MiText>
        <div v-if="!vote" class="pf__votes mi:flex mi:gap-2">
          <MiButton variant="gray" size="small" @click="vote = 'yes'">Yes</MiButton>
          <MiButton variant="gray" size="small" @click="vote = 'no'">Not really</MiButton>
        </div>
        <p class="pf__thanks mi:m-0 mi:text-[14px] mi:text-label2 mi:empty:hidden mi:@[700px]:col-span-full" aria-live="polite">
          <template v-if="vote === 'yes'">Thanks, that helps us keep it that way.</template>
          <template v-else-if="vote === 'no'">Thanks. <a class="mi:[.pf__thanks_&]:text-p-text mi:[.pf__thanks_&]:font-semibold" href="#" @click.prevent>Tell us what was missing</a> and we will reply within a day.</template>
        </p>
      </section>

      <!-- Link columns: always open when wide, disclosures when narrow. -->
      <div class="pf__cols mi:grid mi:@[700px]:grid-cols-4 mi:@[700px]:gap-6">
        <section v-for="c in columns" :key="c.id" class="pf__col mi:[.pf__col+&]:shadow-[inset_0_1px_0_var(--mi-sep)] mi:@[700px]:[.pf__col+&]:shadow-none" :class="{ 'is-open': open === c.id }">
          <h3 class="pf__col-head mi:m-0">
            <button type="button" class="pf__col-btn mi:flex mi:items-center mi:justify-between mi:w-full mi:py-3 mi:px-0 mi:[border:0] mi:[background:none] mi:text-label mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[6px] mi:@[700px]:pt-0 mi:@[700px]:px-0 mi:@[700px]:pb-2.5 mi:@[700px]:pointer-events-none" :aria-expanded="open === c.id" :aria-controls="'pf-col-' + c.id" @click="toggle(c.id)">
              {{ c.title }}<MiIcon name="chevron-down" :size="14" class="pf__chev mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
            </button>
          </h3>
          <ul :id="'pf-col-' + c.id" class="pf__links mi:hidden mi:gap-0.5 mi:m-0 mi:pt-0 mi:px-0 mi:pb-3 mi:[list-style:none] mi:[.pf__col.is-open_&]:grid mi:@[700px]:grid mi:@[700px]:animate-none mi:@[700px]:[.pf__col.is-open_&]:grid">
            <li v-for="l in c.links" :key="l.label">
              <a href="#" class="pf__link mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[6px] mi:inline-flex mi:items-center mi:gap-2 mi:py-[5px] mi:px-0 mi:text-[14px] mi:text-label2 mi:[text-decoration:none] mi:hover:text-label" @click.prevent>{{ l.label }}<MiBadge v-if="l.tag" :label="l.tag" tone="primary" /></a>
            </li>
          </ul>
        </section>
      </div>

      <section class="pf__prefs mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:gap-y-3.5 mi:gap-x-5" aria-label="Preferences">
        <div class="pf__pref mi:grid mi:gap-1">
          <MiText id="pf-lang" as="span" variant="caption" tone="label2">Language</MiText>
          <MiNativeSelect v-model="lang" size="sm" :options="languages" aria-labelledby="pf-lang" />
        </div>
        <div class="pf__pref mi:grid mi:gap-1">
          <MiText id="pf-cur" as="span" variant="caption" tone="label2">Currency</MiText>
          <MiNativeSelect v-model="currency" size="sm" :options="currencies" aria-labelledby="pf-cur" />
        </div>
        <div class="pf__pref mi:grid mi:gap-1">
          <MiText as="span" variant="caption" tone="label2" aria-hidden="true">Appearance</MiText>
          <MiThemeSwitcher icon-only />
        </div>
      </section>

      <div class="pf__bottom mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-4 mi:pt-4 mi:shadow-[inset_0_1px_0_var(--mi-sep)]">
        <span class="pf__brand mi:flex mi:items-center mi:gap-2 mi:font-bold mi:text-[14px]"><span class="pf__mark mi:w-4.5 mi:h-4.5 mi:rounded-[50%_50%_50%_4px] mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true" />Ledgerbird</span>
        <MiText variant="caption" tone="label2">{{ sample }} · © 2027 Ledgerbird SAS, Lyon</MiText>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface FooterLink { label: string, tag?: string }
interface Column { id: string, title: string, links: FooterLink[] }

const columns: Column[] = [
  { id: 'product', title: 'Product', links: [{ label: 'Invoices' }, { label: 'Expenses' }, { label: 'Bank sync', tag: 'New' }, { label: 'Pricing' }] },
  { id: 'help', title: 'Help', links: [{ label: 'Guides' }, { label: 'VAT rules by country' }, { label: 'Contact support' }, { label: 'System status' }] },
  { id: 'dev', title: 'Developers', links: [{ label: 'API reference' }, { label: 'Webhooks' }, { label: 'Changelog' }] },
  { id: 'legal', title: 'Legal', links: [{ label: 'Terms' }, { label: 'Privacy' }, { label: 'Data processing' }] }
]
const languages = [{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }, { value: 'de', label: 'Deutsch' }, { value: 'es', label: 'Español' }]
const currencies = [{ value: 'EUR', label: 'EUR · €' }, { value: 'GBP', label: 'GBP · £' }, { value: 'USD', label: 'USD · $' }]
const formats: Record<string, Intl.NumberFormat> = {}

const open = ref<string | null>('product')
const vote = ref<'yes' | 'no' | null>(null)
const lang = ref<string | number | null>('en')
const currency = ref<string | number | null>('EUR')

// A live sample so the two selects visibly change how figures read across the app.
const sample = computed(() => {
  const key = `${lang.value}-${currency.value}`
  formats[key] ??= new Intl.NumberFormat(String(lang.value), { style: 'currency', currency: String(currency.value) })
  return `Amounts show as ${formats[key].format(12480.5)}`
})

function toggle(id: string) { open.value = open.value === id ? null : id }
</script>

<style scoped>
.pf__col-btn {
  font: inherit; font-size: 14px; font-weight: 600;
}
.pf__col.is-open .pf__chev { transform: rotate(180deg); }
.pf__col.is-open .pf__links { animation: pf-in var(--mi-dur-2) var(--mi-ease); }
@keyframes pf-in { from { opacity: 0; transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .pf__col.is-open .pf__links { animation: none; } }

@container (min-width: 700px) {
  .pf__chev { display: none; }
  .pf__col.is-open .pf__links { animation: none; }
}
</style>
