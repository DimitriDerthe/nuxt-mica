<template>
  <section class="ctr" aria-labelledby="ctr-title">
    <header class="ctr__head">
      <MiAvatar name="Ledgerline GmbH" shape="square" tone="indigo" size="md" decorative />
      <div class="ctr__title">
        <MiText id="ctr-title" variant="title3" as="h2" weight="semibold">Ledgerline GmbH</MiText>
        <MiText variant="footnote" tone="label2">Enterprise contract · renews in 58 days</MiText>
      </div>
      <MiBadge tone="success" label="Active" dot />
    </header>

    <div class="ctr__cols">
      <section v-for="group in groups" :key="group.title" class="ctr__card" :aria-labelledby="'ctr-' + group.id">
        <MiText :id="'ctr-' + group.id" as="h3" variant="footnote" weight="semibold" tone="label2" class="ctr__card-title">{{ group.title }}</MiText>
        <MiDetails :items="group.items.map(f => ({ key: f.key, label: f.label, value: shown(f.key) }))" label-width="128px">
          <template #value="{ item }">
            <!-- Inline edit: the row turns into a field; Enter saves, Escape cancels. -->
            <form v-if="editing === item.key" class="ctr__edit" @submit.prevent="commit" @keydown.esc="editing = null">
              <MiInput v-model="draft" size="sm" :aria-label="item.label" :type="item.key === 'seats' ? 'number' : 'text'" />
              <MiIconButton type="submit" size="small" variant="tinted" :label="'Save ' + item.label"><MiIcon name="check" :size="15" /></MiIconButton>
              <MiIconButton size="small" variant="gray" :label="'Cancel editing ' + item.label" @click="editing = null"><MiIcon name="close" :size="15" /></MiIconButton>
            </form>
            <div v-else class="ctr__value">
              <span :class="{ 'ctr__mono': fields[item.key]?.mono, 'is-changed': changed(item.key) }">{{ item.value }}</span>
              <span v-if="changed(item.key)" class="ctr__was">was {{ was(item.key) }}</span>
              <MiCopyButton v-if="fields[item.key]?.copy" :value="String(item.value)" icon-only variant="ghost" :label="'Copy ' + item.label" />
              <MiIconButton v-if="fields[item.key]?.edit" size="small" variant="plain" class="ctr__pen" :label="'Edit ' + item.label" @click="start(item.key)">
                <MiIcon name="pencil" :size="15" />
              </MiIconButton>
            </div>
          </template>
        </MiDetails>
      </section>
    </div>

    <!-- Change tray: every pending edit, with its before and after, until saved or discarded. -->
    <Transition name="ctr-tray">
      <div v-if="pending.length" class="ctr__tray" role="region" aria-label="Unsaved changes">
        <div>
          <MiText as="p" variant="subheadline" weight="semibold">{{ pending.length }} unsaved {{ pending.length === 1 ? 'change' : 'changes' }}</MiText>
          <MiText v-for="p in pending" :key="p.key" variant="caption" tone="label2" :lines="1">{{ p.label }}: {{ base[p.key] }} → {{ values[p.key] }}</MiText>
        </div>
        <div class="ctr__tray-actions">
          <MiButton size="small" variant="gray" @click="discard">Discard</MiButton>
          <MiButton size="small" @click="save">Save to contract</MiButton>
        </div>
      </div>
    </Transition>
    <MiText variant="caption" tone="label2" aria-live="polite" class="ctr__status">{{ status }}</MiText>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Field { key: string, label: string, edit?: boolean, copy?: boolean, mono?: boolean }
const PRICE_PER_SEAT = 720

const groups: { id: string, title: string, items: Field[] }[] = [
  {
    id: 'agreement', title: 'Agreement', items: [
      { key: 'id', label: 'Contract ID', copy: true, mono: true },
      { key: 'plan', label: 'Plan' },
      { key: 'seats', label: 'Seats', edit: true },
      { key: 'value', label: 'Annual value' },
      { key: 'term', label: 'Term' },
      { key: 'renewal', label: 'Renewal' }
    ]
  },
  {
    id: 'billing', title: 'Billing', items: [
      { key: 'entity', label: 'Legal entity', edit: true },
      { key: 'vat', label: 'VAT ID', copy: true, mono: true },
      { key: 'po', label: 'PO number', edit: true, mono: true },
      { key: 'contact', label: 'Billing contact', edit: true },
      { key: 'address', label: 'Address', edit: true }
    ]
  }
]
const fields: Record<string, Field> = Object.fromEntries(groups.flatMap(g => g.items).map(f => [f.key, f]))

// Saved values; `values` holds the working copy shown on screen.
const base = reactive<Record<string, string>>({
  id: 'CTR-2026-0187', plan: 'Enterprise, billed yearly', seats: '120', term: 'Jan 1 to Dec 31, 2026', renewal: 'Automatic, 60-day notice',
  entity: 'Ledgerline GmbH', vat: 'DE318442907', po: 'PO-77120', contact: 'Marta Kowalska, finance team', address: 'Kastanienallee 32, 10435 Berlin'
})
// One edit is pre-filled so the preview shows the change tray.
const values = reactive<Record<string, string>>({ ...base, seats: '140' })

const money = (n: number) => '$' + n.toLocaleString('en-US')
// Annual value is derived from seats, so a seat edit recalculates it on the spot.
const shown = (key: string) => (key === 'value' ? money(Number(values.seats) * PRICE_PER_SEAT) : values[key])
const changed = (key: string): boolean => (key === 'value' ? changed('seats') : values[key] !== undefined && values[key] !== base[key])
const was = (key: string) => (key === 'value' ? money(Number(base.seats) * PRICE_PER_SEAT) : base[key])

const editing = ref<string | null>(null)
const draft = ref('')
const status = ref('')
const start = (key: string) => { editing.value = key; draft.value = values[key] ?? ''; status.value = '' }
const commit = () => {
  const key = editing.value
  if (!key) return
  const next = draft.value.trim()
  if (next && !(key === 'seats' && !(Number(next) > 0))) values[key] = next
  editing.value = null
}

const pending = computed(() => Object.keys(values).filter(changed).map(key => ({ key, label: fields[key]?.label ?? key })))
const discard = () => { Object.assign(values, base); status.value = 'Changes discarded.' }
const save = () => { const n = pending.value.length; Object.assign(base, values); status.value = `${n} ${n === 1 ? 'change' : 'changes'} saved to the contract.` }
</script>

<style scoped>
.ctr { container-type: inline-size; position: relative; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.ctr__head { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.ctr__title { min-width: 0; }
.ctr__cols { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@container (min-width: 860px) { .ctr__cols { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
.ctr__card { display: grid; gap: 8px; padding: 14px 16px 8px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.ctr__card-title { text-transform: uppercase; letter-spacing: .06em; }

.ctr__value { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; min-height: 30px; min-width: 0; }
.ctr__value > span:first-child { min-width: 0; overflow-wrap: anywhere; }
.ctr__mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .92em; }
.is-changed { padding: 0 4px; border-radius: 4px; background: color-mix(in srgb, var(--mi-yellow) 28%, transparent); }
.ctr__was { font-size: 11px; color: var(--mi-label3); text-decoration: line-through; }
.ctr__pen { opacity: .55; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.ctr__value:hover .ctr__pen, .ctr__pen:focus-visible { opacity: 1; }
@media (hover: none) { .ctr__pen { opacity: 1; } }
.ctr__edit { display: flex; align-items: center; gap: 6px; min-width: 0; }
.ctr__edit > :first-child { flex: 1; min-width: 0; }

.ctr__tray {
  position: sticky; bottom: 12px; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px;
  padding: 12px 14px 12px 16px; border-radius: var(--mi-radius-l); background: var(--mi-elev); box-shadow: var(--mi-sh3);
}
.ctr__tray > div:first-child { display: grid; gap: 2px; min-width: 0; }
.ctr__tray-actions { display: flex; gap: 6px; }
.ctr-tray-enter-active, .ctr-tray-leave-active { transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-2) var(--mi-ease); }
.ctr-tray-enter-from, .ctr-tray-leave-to { transform: translateY(10px); opacity: 0; }
.ctr__status:empty { display: none; }
</style>
