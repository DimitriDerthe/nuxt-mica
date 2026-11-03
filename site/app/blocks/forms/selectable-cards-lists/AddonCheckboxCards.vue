<template>
  <section class="acc mi:@container/acc mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="acc-title">
    <header class="acc__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="acc-title" as="h2" variant="title3" weight="semibold">Add-ons for your workspace</MiText>
        <MiText variant="footnote" tone="label2">Harbor Labs · Team plan · {{ seats }} seats</MiText>
      </div>
      <MiSegmented v-model="cycle" label="Billing cycle" :options="cycles" />
    </header>

    <div class="acc__body mi:grid mi:gap-3.5 mi:@[820px]/acc:grid-cols-[minmax(0,_1fr)_280px] mi:@[820px]/acc:items-start">
      <ul class="acc__grid mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]/acc:grid-cols-2">
        <li v-for="a in addons" :key="a.id" class="acc__card mi:grid mi:content-start mi:gap-2.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1 mi:[outline:1.5px_solid_transparent] mi:outline-offset-[-1.5px] mi:[&.is-on]:[background:color-mix(in_srgb,_var(--mi-p)_5%,_var(--mi-card))]" :class="{ 'is-on': isOn(a), 'is-included': included(a) }">
          <div class="acc__top mi:flex mi:items-center mi:justify-between mi:gap-2">
            <span class="acc__icon mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:rounded-md mi:text-p-text mi:bg-p-tint" aria-hidden="true"><MiIcon :name="a.icon" :size="18" /></span>
            <MiText variant="subheadline" weight="semibold" tabular class="acc__price">
              {{ included(a) ? 'Included' : `${money(priceOf(a))}${a.perSeat ? ' / seat' : ''}` }}
            </MiText>
          </div>
          <MiCheckbox
            :model-value="isOn(a)" :disabled="included(a)" :label="a.name" :description="a.desc"
            @update:model-value="toggle(a, $event)"
          />
          <MiText v-if="a.requires" variant="caption" tone="label3" class="acc__req mi:items-center mi:gap-1">
            <MiIcon name="lock" :size="12" /> Needs {{ nameOf(a.requires) }}
          </MiText>
        </li>
      </ul>

      <!-- Running total: per-seat add-ons scale with the seat count, yearly shows the saving. -->
      <aside class="acc__sum mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" aria-labelledby="acc-sum">
        <MiText id="acc-sum" as="h3" variant="subheadline" weight="semibold">Your add-ons</MiText>
        <ul v-if="lines.length" class="acc__lines mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[14px]">
          <li class="mi:[.acc__lines_&]:justify-between mi:[.acc__lines_&]:gap-2.5" v-for="l in lines" :key="l.id"><span>{{ l.name }}</span><span>{{ money(l.total) }}</span></li>
        </ul>
        <MiText v-else variant="footnote" tone="label3">Nothing selected yet.</MiText>
        <div class="acc__total mi:flex mi:items-baseline mi:justify-between mi:gap-2 mi:pt-3 mi:border-t mi:border-t-sep mi:text-[14px] mi:text-label2">
          <span>Total per {{ cycle === 'year' ? 'year' : 'month' }}</span>
          <strong class="mi:[.acc__total_&]:text-[22px] mi:[.acc__total_&]:tracking-[-.02em] mi:[.acc__total_&]:text-label mi:[.acc__total_&]:tabular-nums">{{ money(total) }}</strong>
        </div>
        <MiText v-if="cycle === 'year' && total" variant="caption" tone="green" weight="semibold">You save {{ money(total / 10 * 2) }} with yearly billing.</MiText>
        <p class="acc__note mi:min-h-4.5 mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">{{ note }}</p>
        <MiButton block :disabled="!lines.length">Update subscription</MiButton>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type AddonId = 'sso' | 'audit' | 'storage' | 'support' | 'sandbox'
type Icon = 'lock' | 'document' | 'archive' | 'chat' | 'widgets'
interface Addon { id: AddonId, name: string, desc: string, icon: Icon, monthly: number, perSeat?: boolean, requires?: AddonId, yearlyIncluded?: boolean }

const seats = 24
const addons: Addon[] = [
  { id: 'sso', name: 'SAML single sign-on', desc: 'Okta, Entra ID and Google Workspace', icon: 'lock', monthly: 3, perSeat: true },
  { id: 'audit', name: 'Audit log', desc: '400-day history, export to your SIEM', icon: 'document', monthly: 49, requires: 'sso' },
  { id: 'storage', name: 'Extra storage', desc: '+1 TB shared, versioned for 90 days', icon: 'archive', monthly: 20 },
  { id: 'support', name: 'Priority support', desc: '1-hour first response, named contact', icon: 'chat', monthly: 99, yearlyIncluded: true },
  { id: 'sandbox', name: 'Sandbox workspace', desc: 'A copy of your setup to test changes', icon: 'widgets', monthly: 29 }
]
const cycles = [{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly · 2 months free' }]
const cycle = ref<string | number | null>('year')
const picked = ref<AddonId[]>(['storage'])
const note = ref('')

function money(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }
const nameOf = (id: AddonId) => addons.find(a => a.id === id)?.name ?? id
const included = (a: Addon) => cycle.value === 'year' && !!a.yearlyIncluded
const isOn = (a: Addon) => included(a) || picked.value.includes(a.id)
const priceOf = (a: Addon) => cycle.value === 'year' ? a.monthly * 10 : a.monthly

const lines = computed(() => addons.filter(a => picked.value.includes(a.id) && !included(a))
  .map(a => ({ id: a.id, name: a.perSeat ? `${a.name} × ${seats}` : a.name, total: priceOf(a) * (a.perSeat ? seats : 1) })))
const total = computed(() => lines.value.reduce((s, l) => s + l.total, 0))

// Dependencies: picking an add-on pulls in what it needs; dropping a requirement drops its dependants.
function toggle(a: Addon, on: boolean) {
  if (on) {
    const req = a.requires && !picked.value.includes(a.requires) ? a.requires : null
    picked.value = req ? [...picked.value, a.id, req] : [...picked.value, a.id]
    note.value = req ? `${nameOf(req)} added, ${a.name} needs it.` : ''
    return
  }
  const dependants = addons.filter(d => d.requires === a.id && picked.value.includes(d.id)).map(d => d.id)
  picked.value = picked.value.filter(id => id !== a.id && !dependants.includes(id))
  note.value = dependants.length ? `${dependants.map(nameOf).join(', ')} removed too, it needs ${a.name}.` : ''
}
</script>

<style scoped>
.acc__card.is-on { outline-color: var(--mi-p); }
.acc__card.is-included { outline-color: color-mix(in srgb, var(--mi-green) 60%, transparent); }
.is-included .acc__price { color: var(--mi-green-t); }
.acc__req { display: flex; }
.acc__lines li { display: flex; }
.acc__lines li span:last-child { font-variant-numeric: tabular-nums; }
</style>
