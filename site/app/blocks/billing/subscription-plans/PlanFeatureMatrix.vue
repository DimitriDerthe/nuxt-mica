<template>
  <section class="pfm mi:@container/pfm mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="pfm-title">
    <header class="pfm__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="pfm__intro mi:grid mi:gap-1.5 mi:max-w-135">
        <MiText id="pfm-title" as="h2" variant="title2" weight="bold" balance>Compare Cutline plans</MiText>
        <MiText variant="subheadline" tone="label2">Pick a feature to see where it starts. Prices per editor, billed monthly, excl. VAT.</MiText>
      </div>
      <div class="pfm__tools mi:flex mi:items-center mi:gap-2.5">
        <MiSwitch v-model="diffOnly" size="compact" aria-labelledby="pfm-diff-label" />
        <MiText id="pfm-diff-label" as="span" variant="footnote" weight="medium">Only differences</MiText>
      </div>
    </header>

    <div class="pfm__switch mi:grid mi:@[640px]/pfm:hidden">
      <MiSegmented v-model="focus" label="Plan to show" :options="plans.map(p => ({ value: p.id, label: p.name }))" />
    </div>

    <div class="pfm__scroll mi:max-h-125 mi:overflow-auto mi:overscroll-contain mi:rounded-xl mi:bg-card mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" aria-label="Feature comparison">
      <table class="pfm__table mi:w-full mi:border-separate mi:[border-spacing:0] mi:table-fixed" :class="{ 'has-pick': !!picked }">
        <thead>
          <tr>
            <th scope="col" class="pfm__corner mi:[.pfm__table_thead_&]:w-[52%] mi:@[640px]/pfm:[.pfm__table_thead_&]:w-[34%]">
              <p class="pfm__status mi:grid mi:gap-[3px] mi:m-0 mi:text-[12px] mi:font-normal mi:leading-[1.35] mi:text-label2" aria-live="polite">
                <template v-if="pickedRow">
                  <span class="pfm__status-k mi:text-[14px] mi:font-650 mi:text-label">{{ pickedRow.label }}</span>
                  <span>{{ availability(pickedRow) }}</span>
                </template>
                <template v-else>
                  <span class="pfm__status-k mi:text-[14px] mi:font-650 mi:text-label">{{ shownCount }} features</span>
                  <span>{{ diffOnly ? `${hiddenCount} shared by every plan are hidden` : 'Select one to trace it across plans' }}</span>
                </template>
              </p>
            </th>
            <th
              v-for="p in plans" :key="p.id" scope="col" class="pfm__plan"
              :class="{ 'is-other mi:[.pfm__table_&]:hidden mi:@[640px]/pfm:[.pfm__table_&]:table-cell': p.id !== focus, 'is-hit': pickedRow && has(pickedRow, p.id), 'is-miss': pickedRow && !has(pickedRow, p.id) }"
            >
              <div class="pfm__plan-card mi:grid mi:gap-2 mi:p-3 mi:rounded-lg mi:shadow-[inset_0_0_0_1px_transparent] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.pfm__plan.is-hit_&]:shadow-[inset_0_0_0_1.5px_var(--mi-p)] mi:[.pfm__plan.is-hit_&]:bg-p-tint mi:[.pfm__plan.is-miss_&]:opacity-42 mi:[.pfm__plan.is-miss_&]:transform-[scale(.98)] mi:motion-reduce:[transition:none]">
                <span class="pfm__plan-name mi:min-h-5.5 mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:text-[15px] mi:font-bold mi:tracking-[-.01em]">{{ p.name }}<MiBadge v-if="p.popular" tone="primary" label="Popular" /></span>
                <span class="pfm__price mi:flex mi:flex-wrap mi:items-baseline mi:gap-1"><span class="pfm__amount mi:text-[26px] mi:font-750 mi:leading-[1.1] mi:tracking-[-.035em] mi:tabular-nums">{{ p.price ? `€${p.price}` : 'Free' }}</span><span v-if="p.price" class="pfm__per mi:text-[11px] mi:font-medium mi:text-label2">/ editor / mo</span></span>
                <MiButton v-if="p.id === current" size="small" variant="gray" disabled block>Current plan</MiButton>
                <MiButton v-else size="small" :variant="p.popular ? 'filled' : 'tinted'" block>Choose {{ p.name }}</MiButton>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-for="g in visibleGroups" :key="g.label">
          <tr class="pfm__group">
            <th class="mi:[.pfm__group_&]:pt-4.5 mi:[.pfm__group_&]:px-4.5 mi:[.pfm__group_&]:pb-1.5 mi:[.pfm__group_&]:text-start mi:[.pfm__group_&]:text-[11px] mi:[.pfm__group_&]:font-650 mi:[.pfm__group_&]:tracking-[.07em] mi:[.pfm__group_&]:uppercase mi:[.pfm__group_&]:text-label3" scope="rowgroup">{{ g.label }}</th>
            <td v-for="p in plans" :key="p.id" :class="{ 'is-other mi:[.pfm__table_&]:hidden mi:@[640px]/pfm:[.pfm__table_&]:table-cell': p.id !== focus }" />
          </tr>
          <tr v-for="r in g.rows" :key="r.id" class="pfm__row" :class="{ 'is-picked': picked === r.id }">
            <th scope="row" class="pfm__feature mi:[.pfm__row_th&]:border-t mi:[.pfm__row_th&]:border-t-sep mi:[.pfm__group+.pfm__row_th&]:[border-top:0] mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-1.5 mi:text-start mi:[font-weight:inherit]">
              <button type="button" class="pfm__feature-btn mi:grid mi:gap-px mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-[10px] mi:text-start mi:text-label mi:bg-transparent mi:cursor-pointer mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:[.pfm__row.is-picked_&]:text-p-text mi:[.pfm__row.is-picked_&]:bg-p-tint mi:[.pfm__row.is-picked_&]:font-semibold" :aria-pressed="picked === r.id" @click="picked = picked === r.id ? null : r.id">
                <span>{{ r.label }}</span>
                <span v-if="r.note" class="pfm__note mi:text-[12px] mi:font-normal mi:text-label2">{{ r.note }}</span>
              </button>
            </th>
            <td
              v-for="(v, i) in r.values" :key="plans[i]!.id" class="pfm__cell mi:[.pfm__row_td&]:border-t mi:[.pfm__row_td&]:border-t-sep mi:[.pfm__group+.pfm__row_td&]:[border-top:0] mi:relative mi:py-2.5 mi:px-3 mi:text-start mi:text-[13px] mi:tabular-nums mi:@[640px]/pfm:pl-6 mi:before:content-[''] mi:before:absolute mi:before:inset-y-[3px] mi:before:inset-x-1.5 mi:before:z-0 mi:before:rounded-[10px] mi:before:bg-p-tint mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-hit]:before:opacity-100 mi:motion-reduce:before:[transition:none]"
              :class="{ 'is-other mi:[.pfm__table_&]:hidden mi:@[640px]/pfm:[.pfm__table_&]:table-cell': plans[i]!.id !== focus, 'is-hit': picked === r.id && v !== false }"
            >
              <span v-if="v === true" class="pfm__yes mi:[.pfm__cell>&]:relative mi:inline-grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:text-p-on mi:bg-p mi:[.has-pick_.pfm__row:not(.is-picked)_.pfm__cell>&]:opacity-50 mi:[.has-pick_.pfm__row:not(.is-picked)_.pfm__cell>&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[.has-pick_.pfm__row_.pfm__cell>&]:[transition:none]"><MiIcon class="mi:[.pfm__row_th&]:border-t mi:[.pfm__row_th&]:border-t-sep mi:[.pfm__row_td&]:border-t mi:[.pfm__row_td&]:border-t-sep mi:[.pfm__group+.pfm__row_th&]:[border-top:0] mi:[.pfm__group+.pfm__row_td&]:[border-top:0]" name="check" :size="13" :weight="2.8" label="Included" /></span>
              <span v-else-if="v === false" class="pfm__no mi:[.pfm__cell>&]:relative mi:inline-grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:text-label3 mi:[.has-pick_.pfm__row:not(.is-picked)_.pfm__cell>&]:opacity-50 mi:[.has-pick_.pfm__row:not(.is-picked)_.pfm__cell>&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[.has-pick_.pfm__row_.pfm__cell>&]:[transition:none]"><MiIcon class="mi:[.pfm__row_th&]:border-t mi:[.pfm__row_th&]:border-t-sep mi:[.pfm__row_td&]:border-t mi:[.pfm__row_td&]:border-t-sep mi:[.pfm__group+.pfm__row_th&]:[border-top:0] mi:[.pfm__group+.pfm__row_td&]:[border-top:0]" name="dash" :size="14" label="Not included" /></span>
              <span v-else class="pfm__val mi:[.pfm__cell>&]:relative mi:font-550 mi:[.has-pick_.pfm__row:not(.is-picked)_.pfm__cell>&]:opacity-50 mi:[.has-pick_.pfm__row:not(.is-picked)_.pfm__cell>&]:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[.has-pick_.pfm__row_.pfm__cell>&]:[transition:none]">{{ v }}</span>
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
/* Sticky plan headers inside the scroll area. */
.pfm__table thead th {
  position: sticky; top: 0; z-index: 2; padding: 16px 12px 14px; vertical-align: bottom; text-align: start;
  background: color-mix(in srgb, var(--mi-card) 92%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--mi-sep);
}
.pfm__table thead th.pfm__corner { padding-left: 18px; }
.pfm__feature-btn {
  font: inherit; font-size: 14px; font-weight: 500;
}
</style>
