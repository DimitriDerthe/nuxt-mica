<template>
  <div class="pf">
    <!-- Faux end of a dashboard page, so the footer is seen in place. -->
    <div class="pf__page" aria-hidden="true"><span /><span /></div>

    <footer class="pf__foot" aria-labelledby="pf-title">
      <h2 id="pf-title" class="pf__sr">Links, preferences and feedback</h2>

      <!-- Page feedback: one tap, then a thank-you that offers a follow-up. -->
      <section class="pf__ask" aria-labelledby="pf-ask">
        <MiText id="pf-ask" variant="subheadline" weight="semibold" as="h3">Did the invoices page have what you needed?</MiText>
        <div v-if="!vote" class="pf__votes">
          <MiButton variant="gray" size="small" @click="vote = 'yes'">Yes</MiButton>
          <MiButton variant="gray" size="small" @click="vote = 'no'">Not really</MiButton>
        </div>
        <p class="pf__thanks" aria-live="polite">
          <template v-if="vote === 'yes'">Thanks, that helps us keep it that way.</template>
          <template v-else-if="vote === 'no'">Thanks. <a href="#" @click.prevent>Tell us what was missing</a> and we will reply within a day.</template>
        </p>
      </section>

      <!-- Link columns: always open when wide, disclosures when narrow. -->
      <div class="pf__cols">
        <section v-for="c in columns" :key="c.id" class="pf__col" :class="{ 'is-open': open === c.id }">
          <h3 class="pf__col-head">
            <button type="button" class="pf__col-btn" :aria-expanded="open === c.id" :aria-controls="'pf-col-' + c.id" @click="toggle(c.id)">
              {{ c.title }}<MiIcon name="chevron-down" :size="14" class="pf__chev" />
            </button>
          </h3>
          <ul :id="'pf-col-' + c.id" class="pf__links">
            <li v-for="l in c.links" :key="l.label">
              <a href="#" class="pf__link" @click.prevent>{{ l.label }}<MiBadge v-if="l.tag" :label="l.tag" tone="primary" /></a>
            </li>
          </ul>
        </section>
      </div>

      <section class="pf__prefs" aria-label="Preferences">
        <div class="pf__pref">
          <MiText id="pf-lang" as="span" variant="caption" tone="label2">Language</MiText>
          <MiNativeSelect v-model="lang" size="sm" :options="languages" aria-labelledby="pf-lang" />
        </div>
        <div class="pf__pref">
          <MiText id="pf-cur" as="span" variant="caption" tone="label2">Currency</MiText>
          <MiNativeSelect v-model="currency" size="sm" :options="currencies" aria-labelledby="pf-cur" />
        </div>
        <div class="pf__pref">
          <MiText as="span" variant="caption" tone="label2" aria-hidden="true">Appearance</MiText>
          <MiThemeSwitcher icon-only />
        </div>
      </section>

      <div class="pf__bottom">
        <span class="pf__brand"><span class="pf__mark" aria-hidden="true" />Ledgerbird</span>
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
.pf { container-type: inline-size; display: grid; font-family: var(--mi-font); color: var(--mi-label); border-radius: var(--mi-radius-xl); overflow: hidden; background: var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); }
.pf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.pf__page { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; padding: 18px; }
.pf__page span { height: 64px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.pf__foot { display: grid; gap: 20px; padding: 20px 18px; background: var(--mi-card); box-shadow: inset 0 1px 0 var(--mi-sep); }

.pf__ask { display: grid; gap: 10px; padding: 14px 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.pf__votes { display: flex; gap: 8px; }
.pf__thanks { margin: 0; font-size: 14px; color: var(--mi-label2); }
.pf__thanks:empty { display: none; }
.pf__thanks a { color: var(--mi-p-text); font-weight: 600; }

.pf__cols { display: grid; }
.pf__col + .pf__col { box-shadow: inset 0 1px 0 var(--mi-sep); }
.pf__col-head { margin: 0; }
.pf__col-btn {
  display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 0; border: 0; background: none;
  font: inherit; font-size: 14px; font-weight: 600; color: var(--mi-label); cursor: pointer;
}
.pf__col-btn:focus-visible, .pf__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 6px; }
.pf__chev { color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.pf__col.is-open .pf__chev { transform: rotate(180deg); }
.pf__links { display: none; gap: 2px; margin: 0; padding: 0 0 12px; list-style: none; }
.pf__col.is-open .pf__links { display: grid; animation: pf-in var(--mi-dur-2) var(--mi-ease); }
.pf__link { display: inline-flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 14px; color: var(--mi-label2); text-decoration: none; }
.pf__link:hover { color: var(--mi-label); }
@keyframes pf-in { from { opacity: 0; transform: translateY(-4px); } }
@media (prefers-reduced-motion: reduce) { .pf__col.is-open .pf__links { animation: none; } }

.pf__prefs { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px 20px; }
.pf__pref { display: grid; gap: 4px; }

.pf__bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; padding-top: 16px; box-shadow: inset 0 1px 0 var(--mi-sep); }
.pf__brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; }
.pf__mark { width: 18px; height: 18px; border-radius: 50% 50% 50% 4px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }

@container (min-width: 700px) {
  .pf__page { padding: 24px; }
  .pf__foot { gap: 24px; padding: 28px 24px 20px; }
  .pf__ask { grid-template-columns: 1fr auto; align-items: center; }
  .pf__thanks { grid-column: 1 / -1; }
  .pf__cols { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
  .pf__col + .pf__col { box-shadow: none; }
  .pf__col-btn { padding: 0 0 10px; pointer-events: none; }
  .pf__chev { display: none; }
  .pf__links, .pf__col.is-open .pf__links { display: grid; animation: none; }
}
</style>
