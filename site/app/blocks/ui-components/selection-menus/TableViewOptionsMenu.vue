<template>
  <section class="tvo" aria-labelledby="tvo-title">
    <header class="tvo__head">
      <div>
        <MiText id="tvo-title" variant="title3" as="h2" weight="semibold">Q4 renewals</MiText>
        <MiText variant="footnote" tone="label2">{{ rows.length }} accounts · {{ visible.length }} of {{ columns.length }} columns shown</MiText>
      </div>
      <MiMenu :items="quickItems" aria-label="Toggle columns" placement="bottom-end" @select="onQuick">
        <template #trigger="{ props: tp }">
          <MiButton v-bind="tp" variant="gray" size="small">
            <template #leading><MiIcon name="columns" :size="16" /></template>
            Columns
          </MiButton>
        </template>
      </MiMenu>
    </header>

    <div class="tvo__body">
      <!-- Display panel, open in place: every control re-renders the table on the right. -->
      <MiPopover v-model="open" inline trigger="manual" :width="280" :arrow-offset="34" label="Display options" class="tvo__pop">
        <template #trigger="{ attrs, toggle }">
          <MiButton v-bind="attrs" variant="bordered" size="small" @click="toggle">
            <template #leading><MiIcon name="sliders" :size="16" /></template>
            Display
          </MiButton>
        </template>
        <div class="tvo__panel">
          <div class="tvo__group">
            <MiText variant="caption" tone="label2" weight="semibold">Group by</MiText>
            <MiSegmented v-model="groupBy" label="Group by" :options="groupOptions" />
          </div>
          <div class="tvo__group">
            <MiText variant="caption" tone="label2" weight="semibold">Density</MiText>
            <MiSegmented v-model="density" label="Row density" :options="densityOptions" />
          </div>
          <fieldset class="tvo__cols">
            <legend class="tvo__legend">
              <span>Columns</span>
              <button type="button" class="tvo__reset" :disabled="allShown" @click="showAll">Show all</button>
            </legend>
            <MiCheckbox
              v-for="c in columns" :key="c.key" v-model="shown[c.key]" :label="c.label"
              :disabled="c.key === 'account'" :description="c.key === 'account' ? 'Always visible' : undefined"
            />
          </fieldset>
        </div>
      </MiPopover>

      <div class="tvo__scroll" role="region" aria-label="Renewals table" tabindex="0">
        <table class="tvo__table" :class="'is-' + density">
          <thead>
            <tr><th v-for="c in visible" :key="c.key" scope="col" :class="{ 'is-num': c.num }">{{ c.label }}</th></tr>
          </thead>
          <tbody v-for="g in groups" :key="g.name">
            <tr v-if="groupBy !== 'none'" class="tvo__grow">
              <th :colspan="visible.length" scope="colgroup">{{ g.name }} <span>{{ g.rows.length }}</span></th>
            </tr>
            <tr v-for="r in g.rows" :key="r.account">
              <td v-for="c in visible" :key="c.key" :class="{ 'is-num': c.num }">
                <template v-if="c.key === 'owner'"><span class="tvo__owner"><MiAvatar :name="r.owner" size="xs" tone="auto" decorative />{{ r.owner }}</span></template>
                <template v-else-if="c.key === 'health'"><MiBadge :tone="healthTone[r.health]" :label="r.health" dot /></template>
                <template v-else-if="c.key === 'account'"><strong>{{ r.account }}</strong></template>
                <template v-else>{{ r[c.key] }}</template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Key = 'account' | 'owner' | 'stage' | 'arr' | 'close' | 'health'
type Health = 'Healthy' | 'At risk' | 'Churn signal'
interface Row { account: string, owner: string, stage: string, arr: string, close: string, health: Health }

const columns: { key: Key, label: string, num?: boolean }[] = [
  { key: 'account', label: 'Account' },
  { key: 'owner', label: 'Owner' },
  { key: 'stage', label: 'Stage' },
  { key: 'arr', label: 'ARR', num: true },
  { key: 'close', label: 'Renews' },
  { key: 'health', label: 'Health' }
]
const rows: Row[] = [
  { account: 'Brightwater Logistics', owner: 'Amara Diallo', stage: 'Negotiation', arr: '$148,000', close: 'Nov 14', health: 'Healthy' },
  { account: 'Talvik Robotics', owner: 'Jonas Weber', stage: 'Proposal', arr: '$92,400', close: 'Nov 29', health: 'At risk' },
  { account: 'Rue Lepic Bakeries', owner: 'Amara Diallo', stage: 'Proposal', arr: '$18,600', close: 'Dec 3', health: 'Healthy' },
  { account: 'Morrow Health', owner: 'Priya Natarajan', stage: 'Negotiation', arr: '$210,000', close: 'Dec 11', health: 'Churn signal' },
  { account: 'Okonkwo & Daughters', owner: 'Jonas Weber', stage: 'Discovery', arr: '$36,900', close: 'Dec 19', health: 'Healthy' }
]
const healthTone = { 'Healthy': 'success', 'At risk': 'warning', 'Churn signal': 'danger' } as const

const open = ref(true)
const shown = reactive<Record<Key, boolean>>({ account: true, owner: true, stage: true, arr: true, close: false, health: true })
const visible = computed(() => columns.filter(c => shown[c.key]))
const allShown = computed(() => columns.every(c => shown[c.key]))
function showAll() { for (const c of columns) shown[c.key] = true }

const groupOptions = [{ value: 'none', label: 'None' }, { value: 'stage', label: 'Stage' }, { value: 'owner', label: 'Owner' }]
const groupBy = ref<string | number | null>('stage')
const densityOptions = [{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]
const density = ref<string | number | null>('comfortable')

const groups = computed(() => {
  const by = groupBy.value
  if (by !== 'stage' && by !== 'owner') return [{ name: 'All', rows }]
  const map = new Map<string, Row[]>()
  for (const r of rows) map.set(r[by], [...(map.get(r[by]) ?? []), r])
  return [...map].map(([name, list]) => ({ name, rows: list }))
})

// The live pulldown mirrors the checkbox list: picking an entry flips that column.
const quickItems = computed(() => [
  { heading: 'Visible columns' },
  ...columns.filter(c => c.key !== 'account').map(c => ({ value: c.key, label: c.label, checked: shown[c.key] })),
  { separator: true },
  { value: 'all', label: 'Show all columns', disabled: allShown.value }
])
function onQuick(item: { value?: string | number }) {
  if (item.value === 'all') showAll()
  else if (item.value && item.value in shown) shown[item.value as Key] = !shown[item.value as Key]
}
</script>

<style scoped>
.tvo { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.tvo__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.tvo__body { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 820px) { .tvo__body { grid-template-columns: 296px minmax(0, 1fr); } }

.tvo__panel { display: grid; gap: 16px; }
.tvo__group { display: grid; gap: 6px; }
.tvo__cols { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; min-width: 0; }
.tvo__legend { display: flex; width: 100%; justify-content: space-between; align-items: center; padding: 14px 0 0; margin-bottom: 2px; border-top: .5px solid var(--mi-sep); font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.tvo__reset { border: 0; background: none; padding: 2px 4px; border-radius: 6px; font: inherit; color: var(--mi-p-text); cursor: pointer; }
.tvo__reset:disabled { color: var(--mi-label3); cursor: default; }
.tvo__reset:focus-visible { outline: 2px solid var(--mi-p); }

.tvo__scroll { overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overscroll-behavior-x: contain; }
.tvo__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.tvo__table { width: 100%; border-collapse: collapse; font-size: 14px; font-variant-numeric: tabular-nums; }
.tvo__table th, .tvo__table td { padding: 12px 16px; text-align: start; white-space: nowrap; border-bottom: .5px solid var(--mi-sep); }
.tvo__table.is-compact th, .tvo__table.is-compact td { padding-block: 6px; font-size: 13px; }
.tvo__table thead th { font-size: 12px; font-weight: 600; color: var(--mi-label2); background: var(--mi-fill4); }
.tvo__table .is-num { text-align: end; }
.tvo__table strong { font-weight: 600; }
.tvo__table tbody tr:last-child td { border-bottom: 0; }
.tvo__grow th { padding-top: 14px; font-size: 12px; font-weight: 600; color: var(--mi-p-text); background: var(--mi-p-tint); }
.tvo__grow span { margin-inline-start: 6px; color: var(--mi-label2); font-weight: 500; }
.tvo__owner { display: inline-flex; align-items: center; gap: 8px; }
</style>
