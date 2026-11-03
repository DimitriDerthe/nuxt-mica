<template>
  <section class="stb" aria-labelledby="stb-title" @keydown.esc="selected = []">
    <!-- Both bars share one grid cell: selecting rows cross-fades the title bar into a contextual action bar. -->
    <div class="stb__bars">
      <header class="stb__bar stb__bar--title" :class="{ 'is-hidden': selecting }" :inert="selecting || undefined">
        <div class="stb__heading">
          <div class="stb__title-row">
            <MiText id="stb-title" variant="title2" as="h2" weight="bold">Invoices</MiText>
            <MiBadge :label="String(invoices.length)" tone="neutral" variant="tint" shape="pill" />
          </div>
          <MiText variant="footnote" tone="label2" tabular>{{ money(outstanding) }} outstanding across {{ clients }} clients</MiText>
        </div>
        <div class="stb__tools">
          <MiSearch v-model="query" class="stb__search" size="compact" placeholder="Client or number" aria-label="Search invoices" />
          <MiSegmented v-model="view" label="Layout" :options="[{ value: 'list', icon: 'list', ariaLabel: 'List' }, { value: 'grid', icon: 'grid', ariaLabel: 'Cards' }]" />
          <MiButton size="small">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            New invoice
          </MiButton>
        </div>
      </header>

      <div class="stb__bar stb__bar--select" :class="{ 'is-hidden': !selecting }" :inert="!selecting || undefined" role="toolbar" aria-label="Selected invoices">
        <MiIconButton label="Clear selection" variant="plain" size="small" @click="selected = []"><MiIcon name="close" :size="16" /></MiIconButton>
        <div class="stb__sel-text">
          <MiText variant="headline" as="p" tabular>{{ selected.length }} selected</MiText>
          <MiText variant="caption" tabular class="stb__sel-sum">{{ money(selectedTotal) }} total</MiText>
        </div>
        <div class="stb__sel-actions">
          <MiButton variant="gray" size="small" @click="remind">Send reminder</MiButton>
          <MiButton variant="gray" size="small" @click="exportPdf">Export PDF</MiButton>
          <MiButton size="small" @click="markPaid">Mark paid</MiButton>
        </div>
      </div>
    </div>

    <div class="stb__filters" role="group" aria-label="Quick filters">
      <MiChip v-for="f in filters" :key="f.id" v-model="f.on" selectable size="small" tone="primary" :label="`${f.label} · ${count(f.id)}`" />
    </div>

    <MiText variant="footnote" tone="label2" aria-live="polite" class="stb__note">{{ note }}</MiText>

    <div class="stb__list" :class="'is-' + view">
      <div v-if="view === 'list'" class="stb__head-row">
        <MiCheckbox :model-value="allOn" :indeterminate="someOn" aria-label="Select all visible invoices" @update:model-value="toggleAll" />
        <span>Client</span><span class="stb__col-due">Due</span><span class="stb__col-amt">Amount</span>
      </div>
      <div v-for="inv in rows" :key="inv.id" class="stb__row" :class="{ 'is-on': selected.includes(inv.id) }" @click="toggle(inv.id)">
        <span class="stb__check" @click.stop><MiCheckbox :model-value="selected.includes(inv.id)" :aria-label="'Select ' + inv.id" @update:model-value="toggle(inv.id)" /></span>
        <span class="stb__client">
          <span class="stb__client-name">{{ inv.client }}</span>
          <span class="stb__client-meta">{{ inv.id }}</span>
        </span>
        <span class="stb__col-due">{{ inv.due }}</span>
        <span class="stb__col-amt">{{ money(inv.amount) }}</span>
        <MiBadge class="stb__status" :label="labels[inv.status]" :tone="tones[inv.status]" variant="tint" />
      </div>
      <MiText v-if="!rows.length" variant="footnote" tone="label2" class="stb__empty">No invoice matches these filters.</MiText>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Status = 'overdue' | 'due' | 'draft' | 'paid'
const labels: Record<Status, string> = { overdue: 'Overdue', due: 'Due soon', draft: 'Draft', paid: 'Paid' }
const tones: Record<Status, 'danger' | 'warning' | 'neutral' | 'success'> = { overdue: 'danger', due: 'warning', draft: 'neutral', paid: 'success' }

const invoices = reactive([
  { id: 'INV-2041', client: 'Halden Ferries', due: '12 days late', amount: 6240, status: 'overdue' as Status },
  { id: 'INV-2044', client: 'Okapi Coffee Roasters', due: '3 days late', amount: 1180, status: 'overdue' as Status },
  { id: 'INV-2047', client: 'Marisol Dental Group', due: 'Fri 14 Feb', amount: 5060, status: 'due' as Status },
  { id: 'INV-2049', client: 'Tidewater Rowing Club', due: 'Mon 17 Feb', amount: 840, status: 'due' as Status },
  { id: 'INV-2050', client: 'Fenwick & Daughters', due: 'Not sent', amount: 12400, status: 'draft' as Status },
  { id: 'INV-2038', client: 'Brightwell Bakery', due: 'Paid 2 Feb', amount: 2310, status: 'paid' as Status }
])

const query = ref('')
const view = ref<string | number | null>('list')
const selected = ref<string[]>(['INV-2041', 'INV-2044'])
const note = ref('')
const filters = reactive([
  { id: 'overdue' as Status, label: 'Overdue', on: false },
  { id: 'due' as Status, label: 'Due soon', on: false },
  { id: 'draft' as Status, label: 'Drafts', on: false }
])

const money = (n: number) => '€' + n.toLocaleString('en-GB')
const count = (s: Status) => invoices.filter(i => i.status === s).length
const outstanding = computed(() => invoices.filter(i => i.status !== 'paid').reduce((a, i) => a + i.amount, 0))
const clients = computed(() => new Set(invoices.filter(i => i.status !== 'paid').map(i => i.client)).size)

const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  const active = filters.filter(f => f.on).map(f => f.id)
  return invoices.filter(i => (!active.length || active.includes(i.status)) && (!q || (i.client + ' ' + i.id).toLowerCase().includes(q)))
})
const selecting = computed(() => selected.value.length > 0)
const selectedTotal = computed(() => invoices.filter(i => selected.value.includes(i.id)).reduce((a, i) => a + i.amount, 0))
const allOn = computed(() => rows.value.length > 0 && rows.value.every(r => selected.value.includes(r.id)))
const someOn = computed(() => !allOn.value && rows.value.some(r => selected.value.includes(r.id)))

function toggle(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(s => s !== id) : [...selected.value, id]
}
function toggleAll() {
  const ids = rows.value.map(r => r.id)
  selected.value = allOn.value ? selected.value.filter(s => !ids.includes(s)) : [...new Set([...selected.value, ...ids])]
}
function markPaid() {
  invoices.forEach((i) => { if (selected.value.includes(i.id)) { i.status = 'paid'; i.due = 'Paid today' } })
  note.value = `${selected.value.length} invoice${selected.value.length > 1 ? 's' : ''} marked as paid.`
  selected.value = []
}
function remind() {
  const n = new Set(invoices.filter(i => selected.value.includes(i.id)).map(i => i.client)).size
  note.value = `Reminder sent to ${n} client${n > 1 ? 's' : ''}.`
  selected.value = []
}
function exportPdf() {
  note.value = `Exported ${selected.value.length} PDF${selected.value.length > 1 ? 's' : ''} to Downloads.`
}
</script>

<style scoped>
.stb { container-type: inline-size; display: grid; align-content: start; gap: 12px; font-family: var(--mi-font); color: var(--mi-label); }

.stb__bars { display: grid; }
.stb__bar { grid-area: 1 / 1; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease), visibility 0s; }
.stb__bar.is-hidden { opacity: 0; visibility: hidden; transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-ease), visibility 0s linear var(--mi-dur-3); }
.stb__bar--title.is-hidden { transform: translateY(-8px); }
.stb__bar--select { align-self: stretch; padding: 10px 12px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 28%, transparent); }
.stb__bar--select.is-hidden { transform: translateY(8px) scale(.98); }
.stb__heading { display: grid; gap: 2px; flex: 1 1 220px; min-width: 0; }
.stb__title-row { display: flex; align-items: center; gap: 8px; }
.stb__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.stb__search { width: 100%; }
.stb__sel-text { display: grid; flex: 1 1 120px; min-width: 0; }
.stb__sel-sum { color: var(--mi-p-text); }
.stb__check { display: inline-flex; }
.stb__sel-actions { display: flex; flex-wrap: wrap; gap: 6px; }

.stb__filters { display: flex; flex-wrap: wrap; gap: 6px; }
.stb__note { min-height: 1lh; }
.stb__note:empty { display: none; }

.stb__list { display: grid; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.stb__head-row, .stb__row { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 4px 12px; padding: 12px 14px; }
.stb__head-row { font-size: 12px; font-weight: 600; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); }
.stb__row { cursor: pointer; }
.stb__row + .stb__row { border-top: 1px solid var(--mi-sep); }
.stb__row:hover { background: var(--mi-fill4); }
.stb__row.is-on { background: var(--mi-p-tint); }
.stb__client { display: grid; min-width: 0; }
.stb__client-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stb__client-meta { font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.stb__col-due { display: none; font-size: 13px; color: var(--mi-label2); }
.stb__col-amt { grid-column: 3; grid-row: 1; justify-self: end; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.stb__head-row .stb__col-amt { font-size: 12px; }
.stb__status { grid-column: 3; grid-row: 2; justify-self: end; }
.stb__head-row .stb__col-due { display: none; }
.stb__empty { padding: 16px; }

/* Card layout */
.stb__list.is-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; padding: 10px; background: none; box-shadow: none; }
.is-grid .stb__row { grid-template-columns: auto minmax(0, 1fr); border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); border: 0; }
.is-grid .stb__row.is-on { background: var(--mi-p-tint); }
.is-grid .stb__col-amt { grid-column: 2; grid-row: auto; justify-self: start; font-size: 20px; letter-spacing: -.02em; }
.is-grid .stb__status { grid-column: 2; grid-row: auto; justify-self: start; }

@container (min-width: 640px) {
  .stb__search { width: 220px; }
  .stb__head-row, .stb__row { grid-template-columns: auto minmax(0, 1fr) 120px 110px 92px; }
  .stb__col-due, .stb__head-row .stb__col-due { display: block; }
  .stb__col-amt { grid-column: auto; grid-row: auto; }
  .stb__status { grid-column: auto; grid-row: auto; }
  .stb__head-row::after { content: ""; }
}
</style>
