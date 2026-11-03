<template>
  <section class="mi:@container/pfm mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="pfm-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="mi:grid mi:gap-1.5 mi:max-w-135">
        <MiText id="pfm-title" as="h2" variant="title2" weight="bold" balance>Compare Cutline plans</MiText>
        <MiText variant="subheadline" tone="label2">Pick a feature to see where it starts. Prices per editor, billed monthly, excl. VAT.</MiText>
      </div>
      <div class="mi:flex mi:items-center mi:gap-2.5">
        <MiSwitch v-model="diffOnly" size="compact" aria-labelledby="pfm-diff-label" />
        <MiText id="pfm-diff-label" as="span" variant="footnote" weight="medium">Only differences</MiText>
      </div>
    </header>

    <div class="mi:grid mi:@[640px]/pfm:hidden">
      <MiSegmented v-model="focus" label="Plan to show" :options="plans.map(p => ({ value: p.id, label: p.name }))" />
    </div>

    <div class="mi:max-h-125 mi:overflow-auto mi:overscroll-contain mi:rounded-xl mi:bg-card mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_var(--mi-sep)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" aria-label="Feature comparison">
      <table class="mi:w-full mi:border-separate mi:[border-spacing:0] mi:table-fixed">
        <thead>
          <tr>
            <th scope="col" class="mi:sticky mi:top-0 mi:z-2 mi:pt-4 mi:px-3 mi:pb-3.5 mi:pl-4.5 mi:align-bottom mi:text-start mi:bg-card/92 mi:border-b mi:border-b-sep mi:w-[52%] mi:@[640px]/pfm:w-[34%]">
              <p class="mi:grid mi:gap-[3px] mi:m-0 mi:text-[12px] mi:font-normal mi:leading-[1.35] mi:text-label2" aria-live="polite">
                <template v-if="pickedRow">
                  <span class="mi:text-[14px] mi:font-650 mi:text-label">{{ pickedRow.label }}</span>
                  <span>{{ availability(pickedRow) }}</span>
                </template>
                <template v-else>
                  <span class="mi:text-[14px] mi:font-650 mi:text-label">{{ shownCount }} features</span>
                  <span>{{ diffOnly ? `${hiddenCount} shared by every plan are hidden` : 'Select one to trace it across plans' }}</span>
                </template>
              </p>
            </th>
            <th
              v-for="p in plans" :key="p.id" scope="col" class="mi:sticky mi:top-0 mi:z-2 mi:pt-4 mi:px-3 mi:pb-3.5 mi:align-bottom mi:text-start mi:bg-card/92 mi:border-b mi:border-b-sep"
              :class="p.id !== focus ? 'mi:hidden mi:@[640px]/pfm:table-cell' : ''"
            >
              <div class="mi:grid mi:gap-2 mi:p-3 mi:rounded-lg mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="pickedRow && has(pickedRow, p.id) ? 'mi:shadow-[inset_0_0_0_1.5px_var(--mi-p)] mi:bg-p-tint' : pickedRow ? 'mi:shadow-[inset_0_0_0_1px_transparent] mi:opacity-42 mi:transform-[scale(.98)]' : 'mi:shadow-[inset_0_0_0_1px_transparent]'">
                <span class="mi:min-h-5.5 mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:text-[15px] mi:font-bold mi:tracking-[-.01em]">{{ p.name }}<MiBadge v-if="p.popular" tone="primary" label="Popular" /></span>
                <span class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-1"><span class="mi:text-[26px] mi:font-750 mi:leading-[1.1] mi:tracking-[-.035em] mi:tabular-nums">{{ p.price ? `€${p.price}` : 'Free' }}</span><span v-if="p.price" class="mi:text-[11px] mi:font-medium mi:text-label2">/ editor / mo</span></span>
                <MiButton v-if="p.id === current" size="small" variant="gray" disabled block>Current plan</MiButton>
                <MiButton v-else size="small" :variant="p.popular ? 'filled' : 'tinted'" block>Choose {{ p.name }}</MiButton>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-for="g in visibleGroups" :key="g.label">
          <tr>
            <th class="mi:pt-4.5 mi:px-4.5 mi:pb-1.5 mi:text-start mi:text-[11px] mi:font-650 mi:tracking-[.07em] mi:uppercase mi:text-label3" scope="rowgroup">{{ g.label }}</th>
            <td v-for="p in plans" :key="p.id" :class="p.id !== focus ? 'mi:hidden mi:@[640px]/pfm:table-cell' : ''" />
          </tr>
          <tr v-for="r in g.rows" :key="r.id">
            <th scope="row" class="mi:border-t mi:border-t-sep mi:[tr:nth-child(2)>&]:[border-top:0] mi:pt-0 mi:pr-1 mi:pb-0 mi:pl-1.5 mi:text-start mi:[font-weight:inherit]">
              <button type="button" class="mi:[font:inherit] mi:text-[14px] mi:grid mi:gap-px mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-[10px] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="picked === r.id ? 'mi:text-p-text mi:bg-p-tint mi:font-semibold' : 'mi:font-medium mi:text-label mi:bg-transparent mi:hover:bg-fill4'" :aria-pressed="picked === r.id" @click="picked = picked === r.id ? null : r.id">
                <span>{{ r.label }}</span>
                <span v-if="r.note" class="mi:text-[12px] mi:font-normal mi:text-label2">{{ r.note }}</span>
              </button>
            </th>
            <td
              v-for="(v, i) in r.values" :key="plans[i]!.id" class="mi:border-t mi:border-t-sep mi:[tr:nth-child(2)>&]:[border-top:0] mi:relative mi:py-2.5 mi:px-3 mi:text-start mi:text-[13px] mi:tabular-nums mi:@[640px]/pfm:pl-6 mi:before:content-[''] mi:before:absolute mi:before:inset-y-[3px] mi:before:inset-x-1.5 mi:before:z-0 mi:before:rounded-[10px] mi:before:bg-p-tint mi:before:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:before:[transition:none]"
              :class="[plans[i]!.id !== focus ? 'mi:hidden mi:@[640px]/pfm:table-cell' : '', picked === r.id && v !== false ? 'mi:before:opacity-100' : 'mi:before:opacity-0']"
            >
              <span v-if="v === true" class="mi:relative mi:inline-grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:rounded-[50%] mi:text-p-on mi:bg-p" :class="picked && picked !== r.id ? 'mi:opacity-50 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]' : ''"><MiIcon name="check" :size="13" :weight="2.8" label="Included" /></span>
              <span v-else-if="v === false" class="mi:relative mi:inline-grid mi:place-items-center mi:w-5.5 mi:h-5.5 mi:text-label3" :class="picked && picked !== r.id ? 'mi:opacity-50 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]' : ''"><MiIcon name="dash" :size="14" label="Not included" /></span>
              <span v-else class="mi:relative mi:font-550" :class="picked && picked !== r.id ? 'mi:opacity-50 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]' : ''">{{ v }}</span>
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

