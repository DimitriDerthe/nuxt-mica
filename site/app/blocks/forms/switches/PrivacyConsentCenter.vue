<template>
  <section class="mi:@container/pcc mi:font-mi mi:text-label" aria-labelledby="pcc-title">
    <div class="mi:grid mi:place-items-center mi:py-5 mi:px-3 mi:rounded-xl mi:[background:color-mix(in_srgb,_var(--mi-label)_22%,_transparent)] mi:@[640px]/pcc:p-9">
      <!-- Shown open in place: a consent panel as it appears over the site. -->
      <div class="mi:grid mi:gap-4 mi:w-full mi:max-w-150 mi:p-5.5 mi:rounded-xl mi:bg-elev mi:shadow-3" role="dialog" aria-modal="false" aria-labelledby="pcc-title">
        <header class="mi:grid mi:gap-1.5">
          <MiText id="pcc-title" as="h2" variant="title3" weight="semibold">Privacy preferences</MiText>
          <MiText variant="footnote" tone="label2">Choose what Larkspur Books may store on this device. You can change this any time from the footer.</MiText>
        </header>

        <ul class="mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:bg-fill4">
          <li v-for="c in categories" :key="c.id" class="mi:grid mi:gap-1.5 mi:py-3.5 mi:px-4 mi:not-first:border-t mi:not-first:border-t-sep">
            <div class="mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-3.5">
              <div class="mi:grid mi:gap-0.5 mi:min-w-0">
                <MiText :id="`pcc-${c.id}`" as="h3" variant="subheadline" weight="semibold">{{ c.label }}</MiText>
                <MiText variant="caption" tone="label2">{{ c.desc }}</MiText>
              </div>
              <MiText v-if="c.locked" variant="caption" tone="label3" weight="semibold" class="mi:flex-[none] mi:pt-0.5">Always on</MiText>
              <MiSwitch v-else v-model="c.on" size="compact" :aria-labelledby="`pcc-${c.id}`" @update:model-value="savedAt = ''" />
            </div>
            <MiCollapsible v-model:open="c.open">
              <template #trigger="{ open }">
                <span class="mi:text-[12.5px] mi:font-semibold mi:text-p-text">{{ open ? 'Hide' : 'Show' }} {{ c.vendors.length }} {{ c.vendors.length === 1 ? 'service' : 'services' }}</span>
              </template>
              <ul class="mi:grid mi:gap-1.5 mi:mt-1.5 mi:mx-0 mi:mb-0.5 mi:p-0 mi:[list-style:none]">
                <li class="mi:grid mi:gap-px mi:py-2 mi:px-2.5 mi:rounded-sm mi:text-[13px] mi:bg-card" v-for="v in c.vendors" :key="v.name">
                  <span class="mi:font-semibold">{{ v.name }}</span>
                  <span class="mi:text-[12px] mi:text-label2">{{ v.purpose }} · kept {{ v.retention }}</span>
                </li>
              </ul>
            </MiCollapsible>
          </li>
        </ul>

        <footer class="mi:grid mi:gap-3">
          <p class="mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">{{ status }}</p>
          <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2 mi:@[560px]/pcc:flex mi:@[560px]/pcc:[justify-content:flex-end]">
            <MiButton variant="gray" @click="setAll(false)">Reject all</MiButton>
            <MiButton variant="gray" @click="setAll(true)">Accept all</MiButton>
            <MiButton class="mi:col-span-full" @click="save">Save choices</MiButton>
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

