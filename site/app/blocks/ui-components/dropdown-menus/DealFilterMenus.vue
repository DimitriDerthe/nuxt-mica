<template>
  <section class="dfm" aria-labelledby="dfm-title">
    <header class="dfm__head">
      <div>
        <MiText id="dfm-title" variant="title3" as="h2" weight="semibold">Open deals</MiText>
        <MiText variant="footnote" tone="label2">{{ shown.length }} of {{ deals.length }} deals · {{ money(pipeline) }} in view</MiText>
      </div>
      <MiMenu v-model="close" variant="popup" :items="closeItems" aria-label="Close date" placement="bottom-end" />
    </header>

    <!-- Multi-select filter menus: checked entries toggle, the trigger counts them. -->
    <div class="dfm__bar" role="group" aria-label="Filters">
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

    <div class="dfm__grid">
      <ul class="dfm__list" aria-label="Deals" aria-live="polite">
        <li v-for="d in shown" :key="d.id" class="dfm__deal">
          <MiAvatar :name="d.owner" size="xs" tone="auto" decorative />
          <div class="dfm__deal-main">
            <MiText variant="subheadline" weight="semibold" :lines="1">{{ d.company }}</MiText>
            <MiText variant="caption" tone="label2">{{ d.owner }} · closes {{ d.closes }}</MiText>
          </div>
          <span class="dfm__stage" :data-stage="d.stage">{{ d.stage }}</span>
          <span class="dfm__amount">{{ money(d.amount) }}</span>
        </li>
        <li v-if="!shown.length" class="dfm__empty"><MiText variant="footnote" tone="label2">No deal matches these filters.</MiText></li>
      </ul>

      <!-- The Stage menu shown pinned open beside its trigger; it drives the same filter. -->
      <aside class="dfm__shown" aria-label="Stage filter, shown open">
        <span class="dfm__fake" aria-hidden="true">Stage<template v-if="picked.stage.length"> · {{ picked.stage.length }}</template><MiIcon name="chevron-down" :size="14" /></span>
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
.dfm { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.dfm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.dfm__bar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.dfm__grid { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 760px) { .dfm__grid { grid-template-columns: minmax(0, 1fr) 260px; } }

.dfm__list { display: grid; margin: 0; padding: 6px; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.dfm__list > li + li { border-top: 1px solid var(--mi-sep); }
.dfm__deal { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 4px 12px; padding: 10px; }
.dfm__deal-main { display: grid; min-width: 0; }
.dfm__stage { display: none; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; background: var(--mi-fill3); color: var(--mi-label2); }
.dfm__stage[data-stage="Negotiation"] { background: var(--mi-p-tint); color: var(--mi-p-text); }
.dfm__stage[data-stage="Verbal yes"] { background: color-mix(in srgb, var(--mi-green) 16%, transparent); color: var(--mi-green-t); }
.dfm__amount { font-weight: 700; font-variant-numeric: tabular-nums; }
@container (min-width: 520px) { .dfm__deal { grid-template-columns: auto minmax(0, 1fr) auto 72px; } .dfm__stage { display: inline-block; } .dfm__amount { text-align: end; } }
.dfm__empty { padding: 24px 12px; text-align: center; }

.dfm__shown { display: grid; justify-items: start; gap: 8px; padding: 16px; border-radius: var(--mi-radius-xl); background: radial-gradient(120% 80% at 0% 0%, var(--mi-p-tint), transparent 60%), var(--mi-fill4); overflow: hidden; }
.dfm__shown > * { max-width: 100%; }
.dfm__fake { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; background: var(--mi-p-tint); color: var(--mi-p-text); box-shadow: 0 0 0 3px var(--mi-card); }
</style>
