<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3 mi:font-mi mi:text-label" aria-labelledby="stb-title" @keydown.esc="selected = []">
    <!-- Both bars share one grid cell: selecting rows cross-fades the title bar into a contextual action bar. -->
    <div class="mi:grid">
      <header class="mi:[grid-area:1_/_1] mi:flex mi:flex-wrap mi:items-center mi:gap-y-3 mi:gap-x-4" :class="selecting ? 'mi:opacity-0 mi:invisible mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)] mi:transform-[translateY(-8px)]' : 'mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s]'" :inert="selecting || undefined">
        <div class="mi:grid mi:gap-0.5 mi:flex-[1_1_220px] mi:min-w-0">
          <div class="mi:flex mi:items-center mi:gap-2">
            <MiText id="stb-title" variant="title2" as="h2" weight="bold">Invoices</MiText>
            <MiBadge :label="String(invoices.length)" tone="neutral" variant="tint" shape="pill" />
          </div>
          <MiText variant="footnote" tone="label2" tabular>{{ money(outstanding) }} outstanding across {{ clients }} clients</MiText>
        </div>
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2">
          <MiSearch v-model="query" size="compact" placeholder="Client or number" aria-label="Search invoices" />
          <MiSegmented v-model="view" label="Layout" :options="[{ value: 'list', icon: 'list', ariaLabel: 'List' }, { value: 'grid', icon: 'grid', ariaLabel: 'Cards' }]" />
          <MiButton size="small">
            <template #leading><MiIcon name="plus" :size="15" /></template>
            New invoice
          </MiButton>
        </div>
      </header>

      <div class="mi:[grid-area:1_/_1] mi:flex mi:flex-wrap mi:items-center mi:gap-y-3 mi:gap-x-4 mi:self-stretch mi:py-2.5 mi:px-3 mi:rounded-lg mi:[background:var(--mi-p-tint)] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_28%,_transparent)]" :class="!selecting ? 'mi:opacity-0 mi:invisible mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s_linear_var(--mi-dur-3)] mi:transform-[translateY(8px)_scale(.98)]' : 'mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-3)_var(--mi-ease),_visibility_0s]'" :inert="!selecting || undefined" role="toolbar" aria-label="Selected invoices">
        <MiIconButton label="Clear selection" variant="plain" size="small" @click="selected = []"><MiIcon name="close" :size="16" /></MiIconButton>
        <div class="mi:grid mi:flex-[1_1_120px] mi:min-w-0">
          <MiText variant="headline" as="p" tabular>{{ selected.length }} selected</MiText>
          <MiText variant="caption" tabular class="mi:text-p-text!">{{ money(selectedTotal) }} total</MiText>
        </div>
        <div class="mi:flex mi:flex-wrap mi:gap-1.5">
          <MiButton variant="gray" size="small" @click="remind">Send reminder</MiButton>
          <MiButton variant="gray" size="small" @click="exportPdf">Export PDF</MiButton>
          <MiButton size="small" @click="markPaid">Mark paid</MiButton>
        </div>
      </div>
    </div>

    <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Quick filters">
      <MiChip v-for="f in filters" :key="f.id" v-model="f.on" selectable size="small" tone="primary" :label="`${f.label} · ${count(f.id)}`" />
    </div>

    <MiText variant="footnote" tone="label2" aria-live="polite" class="mi:empty:hidden mi:min-h-[1lh]">{{ note }}</MiText>

    <div class="mi:grid mi:rounded-lg mi:overflow-hidden" :class="view === 'grid' ? 'mi:grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] mi:gap-2.5 mi:p-2.5 mi:[background:none] mi:shadow-none' : 'mi:[background:var(--mi-card)] mi:shadow-1'">
      <div v-if="view === 'list'" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:py-3 mi:px-3.5 mi:text-[12px] mi:font-semibold mi:text-label2 mi:border-b mi:border-b-sep mi:@[640px]:grid-cols-[auto_minmax(0,_1fr)_120px_110px_92px] mi:@[640px]:after:content-['']">
        <MiCheckbox :model-value="allOn" :indeterminate="someOn" aria-label="Select all visible invoices" @update:model-value="toggleAll" />
        <span>Client</span><span class="mi:hidden mi:text-[13px] mi:text-label2 mi:@[640px]:block">Due</span><span class="mi:col-[3] mi:row-[1] mi:justify-self-end mi:text-[12px] mi:font-semibold mi:tabular-nums mi:@[640px]:col-[auto] mi:@[640px]:row-[auto]">Amount</span>
      </div>
      <div v-for="inv in rows" :key="inv.id" class="mi:grid mi:items-center mi:gap-y-1 mi:gap-x-3 mi:py-3 mi:px-3.5 mi:cursor-pointer" :class="[selected.includes(inv.id) ? 'mi:bg-p-tint' : view === 'grid' ? 'mi:bg-card' : 'mi:hover:bg-fill4', view === 'grid' ? 'mi:grid-cols-[auto_minmax(0,_1fr)] mi:rounded-lg mi:shadow-1' : 'mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:@[640px]:grid-cols-[auto_minmax(0,_1fr)_120px_110px_92px] mi:[&:nth-child(n+3)]:border-t mi:[&:nth-child(n+3)]:border-t-sep']" @click="toggle(inv.id)">
        <span class="mi:inline-flex" @click.stop><MiCheckbox :model-value="selected.includes(inv.id)" :aria-label="'Select ' + inv.id" @update:model-value="toggle(inv.id)" /></span>
        <span class="mi:grid mi:min-w-0">
          <span class="mi:text-[14px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ inv.client }}</span>
          <span class="mi:text-[12px] mi:text-label2 mi:tabular-nums">{{ inv.id }}</span>
        </span>
        <span class="mi:hidden mi:text-[13px] mi:text-label2 mi:@[640px]:block">{{ inv.due }}</span>
        <span class="mi:font-semibold mi:tabular-nums" :class="view === 'grid' ? 'mi:col-[2] mi:row-[auto] mi:justify-self-start mi:tracking-[-.02em] mi:text-[20px]' : 'mi:col-[3] mi:row-[1] mi:justify-self-end mi:text-[14px] mi:@[640px]:col-[auto] mi:@[640px]:row-[auto]'">{{ money(inv.amount) }}</span>
        <MiBadge :class="view === 'grid' ? 'mi:col-[2] mi:row-[auto] mi:justify-self-start' : 'mi:col-[3] mi:row-[2] mi:justify-self-end mi:@[640px]:col-[auto] mi:@[640px]:row-[auto]'" :label="labels[inv.status]" :tone="tones[inv.status]" variant="tint" />
      </div>
      <MiText v-if="!rows.length" variant="footnote" tone="label2" class="mi:p-4">No invoice matches these filters.</MiText>
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
