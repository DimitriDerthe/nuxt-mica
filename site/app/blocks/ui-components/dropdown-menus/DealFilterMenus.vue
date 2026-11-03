<template>
  <section class="dfm mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="dfm-title">
    <header class="dfm__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="dfm-title" variant="title3" as="h2" weight="semibold">Open deals</MiText>
        <MiText variant="footnote" tone="label2">{{ shown.length }} of {{ deals.length }} deals · {{ money(pipeline) }} in view</MiText>
      </div>
      <MiMenu v-model="close" variant="popup" :items="closeItems" aria-label="Close date" placement="bottom-end" />
    </header>

    <!-- Multi-select filter menus: checked entries toggle, the trigger counts them. -->
    <div class="dfm__bar mi:flex mi:flex-wrap mi:items-center mi:gap-2" role="group" aria-label="Filters">
      <MiMenu v-for="f in filterDefs" :key="f.key" :items="menuItems(f.key)" :aria-label="'Filter by ' + f.label" @select="(item) => toggle(f.key, item.value)">
        <template #trigger="{ props: tp }">
          <MiButton v-bind="tp" size="small" :variant="picked[f.key].length ? 'tinted' : 'bordered'">
            {{ f.label }}<template v-if="picked[f.key].length"> · {{ picked[f.key].length }}</template>
            <template #trailing><MiIcon name="chevron-down" :size="14" /></template>
          </MiButton>
        </template>
      </MiMenu>
      <MiChip
        v-for="c in chips" :key="c.key + c.value" :label="c.value" size="small" tone="neutral" removable
        :remove-label="'Remove filter ' + c.value" @remove="toggle(c.key, c.value)"
      />
      <MiButton v-if="chips.length" size="small" variant="plain" @click="clear">Clear all</MiButton>
    </div>

    <div class="dfm__grid mi:grid mi:gap-3.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]:grid-cols-[minmax(0,_1fr)_260px]">
      <ul class="dfm__list mi:grid mi:m-0 mi:p-1.5 mi:[list-style:none] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-label="Deals" aria-live="polite">
        <li v-for="d in shown" :key="d.id" class="dfm__deal mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:p-2.5 mi:@[520px]:grid-cols-[auto_minmax(0,_1fr)_auto_72px]">
          <MiAvatar :name="d.owner" size="xs" tone="auto" decorative />
          <div class="dfm__deal-main mi:grid mi:min-w-0">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ d.company }}</MiText>
            <MiText variant="caption" tone="label2">{{ d.owner }} · closes {{ d.closes }}</MiText>
          </div>
          <span class="dfm__stage mi:hidden mi:py-[3px] mi:px-2 mi:rounded-[6px] mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:[background:var(--mi-fill3)] mi:text-label2 mi:[&[data-stage='Negotiation']]:[background:var(--mi-p-tint)] mi:[&[data-stage='Negotiation']]:text-p-text mi:[&[data-stage='Verbal_yes']]:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)] mi:[&[data-stage='Verbal_yes']]:text-green-t mi:@[520px]:inline-block" :data-stage="d.stage">{{ d.stage }}</span>
          <span class="dfm__amount mi:font-bold mi:tabular-nums mi:@[520px]:text-end">{{ money(d.amount) }}</span>
        </li>
        <li v-if="!shown.length" class="dfm__empty mi:py-6 mi:px-3 mi:text-center"><MiText variant="footnote" tone="label2">No deal matches these filters.</MiText></li>
      </ul>

      <!-- The Stage menu shown pinned open beside its trigger; it drives the same filter. -->
      <aside class="dfm__shown mi:grid mi:justify-items-start mi:gap-2 mi:p-4 mi:rounded-xl mi:[background:radial-gradient(120%_80%_at_0%_0%,_var(--mi-p-tint),_transparent_60%),_var(--mi-fill4)] mi:overflow-hidden" aria-label="Stage filter, shown open">
        <span class="dfm__fake mi:inline-flex mi:items-center mi:gap-1.5 mi:py-[5px] mi:px-3 mi:rounded-[999px] mi:text-[13px] mi:font-semibold mi:[background:var(--mi-p-tint)] mi:text-p-text mi:shadow-[0_0_0_3px_var(--mi-card)]" aria-hidden="true">Stage<template v-if="picked.stage.length"> · {{ picked.stage.length }}</template><MiIcon name="chevron-down" :size="14" /></span>
        <MiContextMenu inline :items="pinned" label="Stage filter" :width="220" @select="(id) => toggle('stage', id)" />
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Key = 'stage' | 'owner' | 'size'
type Stage = 'Discovery' | 'Proposal' | 'Negotiation' | 'Verbal yes'
interface Deal { id: number, company: string, owner: string, stage: Stage, amount: number, closes: string, month: 'nov' | 'dec' | 'q1' }

const deals: Deal[] = [
  { id: 1, company: 'Brightwater Utilities', owner: 'Sana Iqbal', stage: 'Negotiation', amount: 84_000, closes: 'Nov 18', month: 'nov' },
  { id: 2, company: 'Kestrel Aviation', owner: 'Owen Gallagher', stage: 'Proposal', amount: 46_500, closes: 'Nov 27', month: 'nov' },
  { id: 3, company: 'Marlow & Pike Legal', owner: 'Sana Iqbal', stage: 'Verbal yes', amount: 22_800, closes: 'Nov 9', month: 'nov' },
  { id: 4, company: 'Northgate Schools Trust', owner: 'Ava Lindgren', stage: 'Discovery', amount: 61_000, closes: 'Dec 15', month: 'dec' },
  { id: 5, company: 'Coralline Biotech', owner: 'Owen Gallagher', stage: 'Negotiation', amount: 128_000, closes: 'Dec 4', month: 'dec' },
  { id: 6, company: 'Fenwick Freight', owner: 'Ava Lindgren', stage: 'Proposal', amount: 18_400, closes: 'Jan 22', month: 'q1' }
]

const filterDefs: { key: Key, label: string, options: string[] }[] = [
  { key: 'stage', label: 'Stage', options: ['Discovery', 'Proposal', 'Negotiation', 'Verbal yes'] },
  { key: 'owner', label: 'Owner', options: ['Sana Iqbal', 'Owen Gallagher', 'Ava Lindgren'] },
  { key: 'size', label: 'Deal size', options: ['Under $25k', '$25k–$75k', 'Over $75k'] }
]
const closeItems = [{ heading: 'Closing' }, { value: 'all', label: 'Any time' }, { value: 'nov', label: 'This month' }, { value: 'dec', label: 'Next month' }, { value: 'q1', label: 'Next quarter' }]

const picked = ref<Record<Key, string[]>>({ stage: ['Proposal', 'Negotiation'], owner: [], size: [] })
const close = ref<string | number | undefined>('all')

const menuItems = (key: Key) => {
  const def = filterDefs.find(f => f.key === key)!
  return [...def.options.map(o => ({ value: o, label: o, checked: picked.value[key].includes(o) })), { separator: true }, { value: '__clear', label: 'Clear ' + def.label.toLowerCase(), disabled: !picked.value[key].length }]
}
const pinned = computed(() => filterDefs[0]!.options.map(o => ({ id: o, label: o, type: 'checkbox' as const, checked: picked.value.stage.includes(o) })))
const chips = computed(() => filterDefs.flatMap(f => picked.value[f.key].map(value => ({ key: f.key, value }))))

const sizeOf = (n: number) => (n < 25_000 ? 'Under $25k' : n <= 75_000 ? '$25k–$75k' : 'Over $75k')
const shown = computed(() => deals.filter(d => {
  const p = picked.value
  return (!p.stage.length || p.stage.includes(d.stage)) && (!p.owner.length || p.owner.includes(d.owner))
    && (!p.size.length || p.size.includes(sizeOf(d.amount))) && (close.value === 'all' || close.value === d.month)
}))
const pipeline = computed(() => shown.value.reduce((t, d) => t + d.amount, 0))

function toggle(key: Key, value: string | number | undefined) {
  if (value === undefined) return
  const list = picked.value[key]
  const v = String(value)
  picked.value[key] = v === '__clear' ? [] : list.includes(v) ? list.filter(x => x !== v) : [...list, v]
}
function clear() { picked.value = { stage: [], owner: [], size: [] } }

const money = (n: number) => '$' + (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'k'
</script>

<style scoped>
.dfm__list > li + li { border-top: 1px solid var(--mi-sep); }
.dfm__shown > * { max-width: 100%; }
</style>
