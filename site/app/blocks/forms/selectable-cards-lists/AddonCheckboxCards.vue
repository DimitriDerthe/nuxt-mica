<template>
  <section class="acc" aria-labelledby="acc-title">
    <header class="acc__head">
      <div>
        <MiText id="acc-title" as="h2" variant="title3" weight="semibold">Add-ons for your workspace</MiText>
        <MiText variant="footnote" tone="label2">Harbor Labs · Team plan · {{ seats }} seats</MiText>
      </div>
      <MiSegmented v-model="cycle" label="Billing cycle" :options="cycles" />
    </header>

    <div class="acc__body">
      <ul class="acc__grid">
        <li v-for="a in addons" :key="a.id" class="acc__card" :class="{ 'is-on': isOn(a), 'is-included': included(a) }">
          <div class="acc__top">
            <span class="acc__icon" aria-hidden="true"><MiIcon :name="a.icon" :size="18" /></span>
            <MiText variant="subheadline" weight="semibold" tabular class="acc__price">
              {{ included(a) ? 'Included' : `${money(priceOf(a))}${a.perSeat ? ' / seat' : ''}` }}
            </MiText>
          </div>
          <MiCheckbox
            :model-value="isOn(a)" :disabled="included(a)" :label="a.name" :description="a.desc"
            @update:model-value="toggle(a, $event)"
          />
          <MiText v-if="a.requires" variant="caption" tone="label3" class="acc__req">
            <MiIcon name="lock" :size="12" /> Needs {{ nameOf(a.requires) }}
          </MiText>
        </li>
      </ul>

      <!-- Running total: per-seat add-ons scale with the seat count, yearly shows the saving. -->
      <aside class="acc__sum" aria-labelledby="acc-sum">
        <MiText id="acc-sum" as="h3" variant="subheadline" weight="semibold">Your add-ons</MiText>
        <ul v-if="lines.length" class="acc__lines">
          <li v-for="l in lines" :key="l.id"><span>{{ l.name }}</span><span>{{ money(l.total) }}</span></li>
        </ul>
        <MiText v-else variant="footnote" tone="label3">Nothing selected yet.</MiText>
        <div class="acc__total">
          <span>Total per {{ cycle === 'year' ? 'year' : 'month' }}</span>
          <strong>{{ money(total) }}</strong>
        </div>
        <MiText v-if="cycle === 'year' && total" variant="caption" tone="green" weight="semibold">You save {{ money(total / 10 * 2) }} with yearly billing.</MiText>
        <p class="acc__note" role="status" aria-live="polite">{{ note }}</p>
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
.acc { container: acc / inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.acc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.acc__body { display: grid; gap: 14px; }
@container acc (min-width: 820px) { .acc__body { grid-template-columns: minmax(0, 1fr) 280px; align-items: start; } }
.acc__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin: 0; padding: 0; list-style: none; }
@container acc (min-width: 520px) { .acc__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.acc__card { display: grid; align-content: start; gap: 10px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); outline: 1.5px solid transparent; outline-offset: -1.5px; }
.acc__card.is-on { outline-color: var(--mi-p); background: color-mix(in srgb, var(--mi-p) 5%, var(--mi-card)); }
.acc__card.is-included { outline-color: color-mix(in srgb, var(--mi-green) 60%, transparent); }
.acc__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.acc__icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: var(--mi-radius-m); color: var(--mi-p-text); background: var(--mi-p-tint); }
.is-included .acc__price { color: var(--mi-green-t); }
.acc__req { display: flex; align-items: center; gap: 4px; }

.acc__sum { display: grid; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.acc__lines { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; font-size: 14px; }
.acc__lines li { display: flex; justify-content: space-between; gap: 10px; }
.acc__lines li span:last-child { font-variant-numeric: tabular-nums; }
.acc__total { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px solid var(--mi-sep); font-size: 14px; color: var(--mi-label2); }
.acc__total strong { font-size: 22px; letter-spacing: -.02em; color: var(--mi-label); font-variant-numeric: tabular-nums; }
.acc__note { min-height: 18px; margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>
