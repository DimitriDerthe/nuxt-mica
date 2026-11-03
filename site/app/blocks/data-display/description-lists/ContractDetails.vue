<template>
  <section class="mi:@container mi:relative mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ctr-title">
    <header class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
      <MiAvatar name="Ledgerline GmbH" shape="square" tone="indigo" size="md" decorative />
      <div class="mi:min-w-0">
        <MiText id="ctr-title" variant="title3" as="h2" weight="semibold">Ledgerline GmbH</MiText>
        <MiText variant="footnote" tone="label2">Enterprise contract · renews in 58 days</MiText>
      </div>
      <MiBadge tone="success" label="Active" dot />
    </header>

    <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:@[860px]:grid-cols-2 mi:@[860px]:items-start">
      <section v-for="group in groups" :key="group.title" class="mi:grid mi:gap-2 mi:pt-3.5 mi:px-4 mi:pb-2 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0" :aria-labelledby="'ctr-' + group.id">
        <MiText :id="'ctr-' + group.id" as="h3" variant="footnote" weight="semibold" tone="label2" class="mi:uppercase mi:tracking-[.06em]!">{{ group.title }}</MiText>
        <MiDetails :items="group.items.map(f => ({ key: f.key, label: f.label, value: shown(f.key) }))" label-width="128px">
          <template #value="{ item }">
            <!-- Inline edit: the row turns into a field; Enter saves, Escape cancels. -->
            <form v-if="editing === item.key" class="mi:flex mi:items-center mi:gap-1.5 mi:min-w-0" @submit.prevent="commit" @keydown.esc="editing = null">
              <MiInput v-model="draft" class="mi:flex-1! mi:min-w-0!" size="sm" :aria-label="item.label" :type="item.key === 'seats' ? 'number' : 'text'" />
              <MiIconButton type="submit" size="small" variant="tinted" :label="'Save ' + item.label"><MiIcon name="check" :size="15" /></MiIconButton>
              <MiIconButton size="small" variant="gray" :label="'Cancel editing ' + item.label" @click="editing = null"><MiIcon name="close" :size="15" /></MiIconButton>
            </form>
            <div v-else class="mi:group mi:flex mi:flex-wrap mi:items-center mi:gap-y-0.5 mi:gap-x-2 mi:min-h-7.5 mi:min-w-0">
              <span class="mi:min-w-0 mi:wrap-anywhere" :class="{ 'mi:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-[.92em]': fields[item.key]?.mono, 'mi:py-0 mi:px-1 mi:rounded-[4px] mi:[background:color-mix(in_srgb,_var(--mi-yellow)_28%,_transparent)]': changed(item.key) }">{{ item.value }}</span>
              <span v-if="changed(item.key)" class="mi:text-[11px] mi:text-label3 mi:[text-decoration:line-through]">was {{ was(item.key) }}</span>
              <MiCopyButton v-if="fields[item.key]?.copy" :value="String(item.value)" icon-only variant="ghost" :label="'Copy ' + item.label" />
              <MiIconButton v-if="fields[item.key]?.edit" size="small" variant="plain" class="mi:opacity-55 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]! mi:group-hover:opacity-100 mi:focus-visible:opacity-100 mi:[@media(hover:none)]:opacity-100" :label="'Edit ' + item.label" @click="start(item.key)">
                <MiIcon name="pencil" :size="15" />
              </MiIconButton>
            </div>
          </template>
        </MiDetails>
      </section>
    </div>

    <!-- Change tray: every pending edit, with its before and after, until saved or discarded. -->
    <Transition enter-active-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:transform-[translateY(10px)] mi:opacity-0" leave-to-class="mi:transform-[translateY(10px)] mi:opacity-0">
      <div v-if="pending.length" class="mi:sticky mi:bottom-3 mi:z-2 mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:pt-3 mi:pr-3.5 mi:pb-3 mi:pl-4 mi:rounded-lg mi:bg-elev mi:shadow-3" role="region" aria-label="Unsaved changes">
        <div class="mi:grid mi:min-w-0 mi:gap-0.5">
          <MiText as="p" variant="subheadline" weight="semibold">{{ pending.length }} unsaved {{ pending.length === 1 ? 'change' : 'changes' }}</MiText>
          <MiText v-for="p in pending" :key="p.key" variant="caption" tone="label2" :lines="1">{{ p.label }}: {{ base[p.key] }} → {{ values[p.key] }}</MiText>
        </div>
        <div class="mi:flex mi:gap-1.5">
          <MiButton size="small" variant="gray" @click="discard">Discard</MiButton>
          <MiButton size="small" @click="save">Save to contract</MiButton>
        </div>
      </div>
    </Transition>
    <MiText variant="caption" tone="label2" aria-live="polite" class="mi:empty:hidden">{{ status }}</MiText>
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
