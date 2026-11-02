<template>
  <section class="pfm" aria-labelledby="pfm-title">
    <header class="pfm__head">
      <div class="pfm__intro">
        <MiText id="pfm-title" as="h2" variant="title2" weight="bold" balance>Compare Cutline plans</MiText>
        <MiText variant="subheadline" tone="label2">Pick a feature to see where it starts. Prices per editor, billed monthly, excl. VAT.</MiText>
      </div>
      <div class="pfm__tools">
        <MiSwitch v-model="diffOnly" size="compact" aria-labelledby="pfm-diff-label" />
        <MiText id="pfm-diff-label" as="span" variant="footnote" weight="medium">Only differences</MiText>
      </div>
    </header>

    <div class="pfm__switch">
      <MiSegmented v-model="focus" label="Plan to show" :options="plans.map(p => ({ value: p.id, label: p.name }))" />
    </div>

    <div class="pfm__scroll" tabindex="0" aria-label="Feature comparison">
      <table class="pfm__table" :class="{ 'has-pick': !!picked }">
        <thead>
          <tr>
            <th scope="col" class="pfm__corner">
              <p class="pfm__status" aria-live="polite">
                <template v-if="pickedRow">
                  <span class="pfm__status-k">{{ pickedRow.label }}</span>
                  <span>{{ availability(pickedRow) }}</span>
                </template>
                <template v-else>
                  <span class="pfm__status-k">{{ shownCount }} features</span>
                  <span>{{ diffOnly ? `${hiddenCount} shared by every plan are hidden` : 'Select one to trace it across plans' }}</span>
                </template>
              </p>
            </th>
            <th
              v-for="p in plans" :key="p.id" scope="col" class="pfm__plan"
              :class="{ 'is-other': p.id !== focus, 'is-hit': pickedRow && has(pickedRow, p.id), 'is-miss': pickedRow && !has(pickedRow, p.id) }"
            >
              <div class="pfm__plan-card">
                <span class="pfm__plan-name">{{ p.name }}<MiBadge v-if="p.popular" tone="primary" label="Popular" /></span>
                <span class="pfm__price"><span class="pfm__amount">{{ p.price ? `€${p.price}` : 'Free' }}</span><span v-if="p.price" class="pfm__per">/ editor / mo</span></span>
                <MiButton v-if="p.id === current" size="small" variant="gray" disabled block>Current plan</MiButton>
                <MiButton v-else size="small" :variant="p.popular ? 'filled' : 'tinted'" block>Choose {{ p.name }}</MiButton>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-for="g in visibleGroups" :key="g.label">
          <tr class="pfm__group">
            <th scope="rowgroup">{{ g.label }}</th>
            <td v-for="p in plans" :key="p.id" :class="{ 'is-other': p.id !== focus }" />
          </tr>
          <tr v-for="r in g.rows" :key="r.id" class="pfm__row" :class="{ 'is-picked': picked === r.id }">
            <th scope="row" class="pfm__feature">
              <button type="button" class="pfm__feature-btn" :aria-pressed="picked === r.id" @click="picked = picked === r.id ? null : r.id">
                <span>{{ r.label }}</span>
                <span v-if="r.note" class="pfm__note">{{ r.note }}</span>
              </button>
            </th>
            <td
              v-for="(v, i) in r.values" :key="plans[i]!.id" class="pfm__cell"
              :class="{ 'is-other': plans[i]!.id !== focus, 'is-hit': picked === r.id && v !== false }"
            >
              <span v-if="v === true" class="pfm__yes"><MiIcon name="check" :size="13" :weight="2.8" label="Included" /></span>
              <span v-else-if="v === false" class="pfm__no"><MiIcon name="dash" :size="14" label="Not included" /></span>
              <span v-else class="pfm__val">{{ v }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Cell = boolean | string
interface Row { id: string, label: string, note?: string, values: [Cell, Cell, Cell] }

type PlanId = 'solo' | 'studio' | 'agency'
const plans: { id: PlanId, name: string, price: number, popular?: boolean }[] = [
  { id: 'solo', name: 'Solo', price: 0 },
  { id: 'studio', name: 'Studio', price: 15, popular: true },
  { id: 'agency', name: 'Agency', price: 29 }
]
const current = ref<PlanId>('solo')

const groups: { label: string, rows: Row[] }[] = [
  { label: 'Review', rows: [
    { id: 'projects', label: 'Active projects', values: ['2', 'Unlimited', 'Unlimited'] },
    { id: 'comments', label: 'Frame-accurate comments', values: [true, true, true] },
    { id: 'stacks', label: 'Version stacks and compare', note: 'Side by side or overlay', values: [false, true, true] },
    { id: 'approvals', label: 'Approval workflows', note: 'Named approvers per cut', values: [false, false, true] }
  ] },
  { label: 'Media', rows: [
    { id: 'storage', label: 'Storage', values: ['50 GB', '2 TB', '10 TB'] },
    { id: '4k', label: '4K playback', values: [false, true, true] },
    { id: 'hdr', label: 'HDR and camera RAW proxies', values: [false, false, true] }
  ] },
  { label: 'Collaboration', rows: [
    { id: 'guests', label: 'Guest reviewers', values: ['3 per project', 'Unlimited', 'Unlimited'] },
    { id: 'panels', label: 'Premiere Pro and Resolve panels', values: [true, true, true] },
    { id: 'links', label: 'Password and expiring links', values: [false, true, true] },
    { id: 'brand', label: 'Branded review pages', values: [false, false, true] }
  ] },
  { label: 'Security and support', rows: [
    { id: 'sso', label: 'SAML single sign-on', values: [false, false, true] },
    { id: 'watermark', label: 'Forensic watermarking', values: [false, false, true] },
    { id: 'audit', label: 'Audit log', values: [false, '30 days', '1 year'] },
    { id: 'support', label: 'Support', values: ['Community', 'Email, 1 day', 'Chat, 4 h'] }
  ] }
]

const diffOnly = ref(false)
const picked = ref<string | null>(null)
const focus = ref<string | number | null>('studio')

const same = (r: Row) => r.values.every(v => v === r.values[0])
const visibleGroups = computed(() => groups
  .map(g => ({ ...g, rows: diffOnly.value ? g.rows.filter(r => !same(r)) : g.rows }))
  .filter(g => g.rows.length))
const allRows = groups.flatMap(g => g.rows)
const shownCount = computed(() => visibleGroups.value.reduce((n, g) => n + g.rows.length, 0))
const hiddenCount = computed(() => allRows.length - shownCount.value)
const pickedRow = computed(() => {
  const r = allRows.find(x => x.id === picked.value)
  return r && (!diffOnly.value || !same(r)) ? r : undefined
})

const has = (r: Row, plan: PlanId) => r.values[plans.findIndex(p => p.id === plan)] !== false
function availability(r: Row) {
  const first = r.values.findIndex(v => v !== false)
  if (first === -1) return 'Not available yet'
  if (typeof r.values[0] === 'string' && first === 0) return 'Every plan, with more room as you go up'
  if (first === 0) return 'Included on every plan'
  if (first === plans.length - 1) return `Only on ${plans[first]!.name}`
  return `Included from ${plans[first]!.name} up`
}
</script>

<style scoped>
.pfm { container: pfm / inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.pfm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 20px; }
.pfm__intro { display: grid; gap: 6px; max-width: 540px; }
.pfm__tools { display: flex; align-items: center; gap: 10px; }

/* One plan at a time on narrow containers. */
.pfm__switch { display: grid; }
@container pfm (min-width: 640px) { .pfm__switch { display: none; } }

.pfm__scroll {
  max-height: 500px; overflow: auto; overscroll-behavior: contain; border-radius: var(--mi-radius-xl);
  background: var(--mi-card); box-shadow: var(--mi-sh1), inset 0 0 0 1px var(--mi-sep);
}
.pfm__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.pfm__table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
.pfm__table thead th.pfm__corner { width: 52%; }
.pfm__table .is-other { display: none; }
@container pfm (min-width: 640px) {
  .pfm__table thead th.pfm__corner { width: 34%; }
  .pfm__table .is-other { display: table-cell; }
}

/* Sticky plan headers inside the scroll area. */
.pfm__table thead th {
  position: sticky; top: 0; z-index: 2; padding: 16px 12px 14px; vertical-align: bottom; text-align: start;
  background: color-mix(in srgb, var(--mi-card) 92%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--mi-sep);
}
.pfm__table thead th.pfm__corner { padding-left: 18px; }
.pfm__status { display: grid; gap: 3px; margin: 0; font-size: 12px; font-weight: 400; line-height: 1.35; color: var(--mi-label2); }
.pfm__status-k { font-size: 14px; font-weight: 650; color: var(--mi-label); }
.pfm__plan-card {
  display: grid; gap: 8px; padding: 12px; border-radius: var(--mi-radius-l); box-shadow: inset 0 0 0 1px transparent;
  transition: opacity var(--mi-dur-3) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring);
}
.pfm__plan.is-hit .pfm__plan-card { box-shadow: inset 0 0 0 1.5px var(--mi-p); background: var(--mi-p-tint); }
.pfm__plan.is-miss .pfm__plan-card { opacity: .42; transform: scale(.98); }
.pfm__plan-name { min-height: 22px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
.pfm__price { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px; }
.pfm__amount { font-size: 26px; font-weight: 750; line-height: 1.1; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.pfm__per { font-size: 11px; font-weight: 500; color: var(--mi-label2); }

.pfm__group th {
  padding: 18px 18px 6px; text-align: start; font-size: 11px; font-weight: 650; letter-spacing: .07em; text-transform: uppercase; color: var(--mi-label3);
}
.pfm__row th, .pfm__row td { border-top: 1px solid var(--mi-sep); }
.pfm__group + .pfm__row th, .pfm__group + .pfm__row td { border-top: 0; }
.pfm__feature { padding: 0 4px 0 6px; text-align: start; font-weight: inherit; }
.pfm__feature-btn {
  display: grid; gap: 1px; width: 100%; padding: 10px 12px; border: 0; border-radius: 10px; text-align: start;
  font: inherit; font-size: 14px; font-weight: 500; color: var(--mi-label); background: transparent; cursor: pointer;
}
.pfm__feature-btn:hover { background: var(--mi-fill4); }
.pfm__feature-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.pfm__row.is-picked .pfm__feature-btn { color: var(--mi-p-text); background: var(--mi-p-tint); font-weight: 600; }
.pfm__note { font-size: 12px; font-weight: 400; color: var(--mi-label2); }

.pfm__cell { position: relative; padding: 10px 12px; text-align: start; font-size: 13px; font-variant-numeric: tabular-nums; }
@container pfm (min-width: 640px) { .pfm__cell { padding-left: 24px; } }
.pfm__cell::before {
  content: ""; position: absolute; inset: 3px 6px; z-index: 0; border-radius: 10px; background: var(--mi-p-tint);
  opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.pfm__cell.is-hit::before { opacity: 1; }
.pfm__cell > * { position: relative; }
.pfm__yes { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; color: var(--mi-p-on); background: var(--mi-p); }
.pfm__no { display: inline-grid; place-items: center; width: 22px; height: 22px; color: var(--mi-label3); }
.pfm__val { font-weight: 550; }
.has-pick .pfm__row:not(.is-picked) .pfm__cell > * { opacity: .5; transition: opacity var(--mi-dur-3) var(--mi-ease); }
@media (prefers-reduced-motion: reduce) { .pfm__plan-card, .pfm__cell::before, .has-pick .pfm__row .pfm__cell > * { transition: none; } }
</style>
