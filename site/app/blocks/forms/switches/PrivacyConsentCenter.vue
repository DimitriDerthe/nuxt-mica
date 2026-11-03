<template>
  <section class="pcc" aria-labelledby="pcc-title">
    <div class="pcc__backdrop">
      <!-- Shown open in place: a consent panel as it appears over the site. -->
      <div class="pcc__panel" role="dialog" aria-modal="false" aria-labelledby="pcc-title">
        <header class="pcc__head">
          <MiText id="pcc-title" as="h2" variant="title3" weight="semibold">Privacy preferences</MiText>
          <MiText variant="footnote" tone="label2">Choose what Larkspur Books may store on this device. You can change this any time from the footer.</MiText>
        </header>

        <ul class="pcc__list">
          <li v-for="c in categories" :key="c.id" class="pcc__item">
            <div class="pcc__row">
              <div class="pcc__text">
                <MiText :id="`pcc-${c.id}`" as="h3" variant="subheadline" weight="semibold">{{ c.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ c.desc }}</MiText>
              </div>
              <MiText v-if="c.locked" variant="caption" tone="label3" weight="semibold" class="pcc__always">Always on</MiText>
              <MiSwitch v-else v-model="c.on" size="compact" :aria-labelledby="`pcc-${c.id}`" @update:model-value="savedAt = ''" />
            </div>
            <MiCollapsible v-model:open="c.open" class="pcc__more">
              <template #trigger="{ open }">
                <span class="pcc__toggle">{{ open ? 'Hide' : 'Show' }} {{ c.vendors.length }} {{ c.vendors.length === 1 ? 'service' : 'services' }}</span>
              </template>
              <ul class="pcc__vendors">
                <li v-for="v in c.vendors" :key="v.name">
                  <span>{{ v.name }}</span>
                  <span>{{ v.purpose }} · kept {{ v.retention }}</span>
                </li>
              </ul>
            </MiCollapsible>
          </li>
        </ul>

        <footer class="pcc__foot">
          <p class="pcc__status" role="status" aria-live="polite">{{ status }}</p>
          <div class="pcc__actions">
            <MiButton variant="gray" @click="setAll(false)">Reject all</MiButton>
            <MiButton variant="gray" @click="setAll(true)">Accept all</MiButton>
            <MiButton @click="save">Save choices</MiButton>
          </div>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Vendor { name: string, purpose: string, retention: string }
interface Category { id: string, label: string, desc: string, locked?: boolean, on: boolean, open: boolean, vendors: Vendor[] }

const categories = reactive<Category[]>([
  { id: 'essential', label: 'Strictly necessary', desc: 'Sign-in, basket and checkout. The site does not work without these.', locked: true, on: true, open: false, vendors: [
    { name: 'Larkspur session', purpose: 'Keeps you signed in', retention: '30 days' },
    { name: 'Stripe', purpose: 'Fraud prevention at checkout', retention: '2 years' }
  ] },
  { id: 'prefs', label: 'Preferences', desc: 'Remembers your currency, shipping country and reading list layout.', on: true, open: false, vendors: [
    { name: 'Larkspur settings', purpose: 'Display choices', retention: '1 year' }
  ] },
  { id: 'analytics', label: 'Analytics', desc: 'Anonymous counts of visits and searches that help us stock better.', on: false, open: true, vendors: [
    { name: 'Plausible', purpose: 'Page views, no personal data', retention: '24 months' },
    { name: 'Hotjar', purpose: 'Heatmaps of the checkout', retention: '365 days' }
  ] },
  { id: 'ads', label: 'Marketing', desc: 'Shows you our new releases on other sites and measures those campaigns.', on: false, open: false, vendors: [
    { name: 'Meta Pixel', purpose: 'Ad measurement', retention: '90 days' },
    { name: 'Google Ads', purpose: 'Remarketing lists', retention: '540 days' }
  ] }
])
const savedAt = ref('')

const optional = computed(() => categories.filter(c => !c.locked))
const status = computed(() => {
  const on = optional.value.filter(c => c.on).length
  const base = `${on} of ${optional.value.length} optional categories on.`
  return savedAt.value ? `${base} Saved, ${savedAt.value}.` : base
})

function setAll(on: boolean) {
  for (const c of optional.value) c.on = on
  save()
}
function save() { savedAt.value = 'applies on your next page view' }
</script>

<style scoped>
.pcc { container: pcc / inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.pcc__backdrop { display: grid; place-items: center; padding: 20px 12px; border-radius: var(--mi-radius-xl); background: color-mix(in srgb, var(--mi-label) 22%, transparent); }
@container pcc (min-width: 640px) { .pcc__backdrop { padding: 36px; } }
.pcc__panel { display: grid; gap: 16px; width: 100%; max-width: 600px; padding: 22px; border-radius: var(--mi-radius-xl); background: var(--mi-elev); box-shadow: var(--mi-sh3); }
.pcc__head { display: grid; gap: 6px; }

.pcc__list { margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.pcc__item { display: grid; gap: 6px; padding: 14px 16px; }
.pcc__item + .pcc__item { border-top: 1px solid var(--mi-sep); }
.pcc__row { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.pcc__text { display: grid; gap: 2px; min-width: 0; }
.pcc__always { flex: none; padding-top: 2px; }
.pcc__toggle { font-size: 12.5px; font-weight: 600; color: var(--mi-p-text); }
.pcc__vendors { display: grid; gap: 6px; margin: 6px 0 2px; padding: 0; list-style: none; }
.pcc__vendors li { display: grid; gap: 1px; padding: 8px 10px; border-radius: var(--mi-radius-s); font-size: 13px; background: var(--mi-card); }
.pcc__vendors li span:first-child { font-weight: 600; }
.pcc__vendors li span:last-child { font-size: 12px; color: var(--mi-label2); }

.pcc__foot { display: grid; gap: 12px; }
.pcc__status { margin: 0; font-size: 13px; color: var(--mi-label2); }
.pcc__actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pcc__actions > :last-child { grid-column: 1 / -1; }
@container pcc (min-width: 560px) { .pcc__actions { display: flex; justify-content: flex-end; } }
</style>
