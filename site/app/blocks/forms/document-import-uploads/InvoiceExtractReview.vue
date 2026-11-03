<template>
  <section class="ier mi:@container mi:font-mi mi:text-label" aria-labelledby="ier-title">
    <div class="ier__wrap mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <header class="ier__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
        <div>
          <MiText id="ier-title" variant="title3" as="h2" weight="semibold">Read a supplier invoice</MiText>
          <MiText variant="footnote" tone="label2">We pull the fields out; you confirm the ones we are unsure about.</MiText>
        </div>
        <MiButton v-if="state === 'ready'" variant="plain" size="small" @click="restart">Upload another</MiButton>
      </header>

      <div v-if="state !== 'ready'" class="ier__drop mi:grid mi:gap-3">
        <MiFileUpload :model-value="files" accept=".pdf,.png,.jpg" :max-size="10000000" label="Drop an invoice or browse" hint="PDF, PNG or JPG, up to 10 MB" :disabled="state === 'reading'" @update:model-value="read" />
        <div class="ier__drop-foot mi:flex mi:justify-center" aria-live="polite">
          <span v-if="state === 'reading'" class="ier__reading mi:flex mi:items-center mi:gap-2 mi:text-[13px] mi:text-label2"><MiSpinner size="sm" label="" /> Reading {{ fileName }}…</span>
          <MiButton v-else variant="tinted" size="small" @click="read([])">Use the sample invoice</MiButton>
        </div>
      </div>

      <div v-else class="ier__grid mi:grid mi:gap-4.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[760px]:items-start">
        <!-- Faux page: blocks stand in for the scanned text; the focused field lights its region. -->
        <figure class="ier__doc mi:grid mi:gap-4.5 mi:m-0 mi:p-5.5 mi:aspect-[1_/_1.2] mi:content-start mi:rounded-md mi:[background:var(--mi-elev)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:text-[12px] mi:text-label2" :aria-label="`Preview of ${fileName}`">
          <div class="ier__doc-top mi:flex mi:justify-between mi:gap-2.5">
            <span class="ier__logo mi:w-9 mi:h-9 mi:rounded-[8px] mi:[background:linear-gradient(135deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true" />
            <div class="ier__region mi:relative mi:py-1 mi:px-1.5 mi:rounded-[4px] mi:leading-[1.4] mi:text-label mi:after:content-[''] mi:after:absolute mi:after:-inset-0.5 mi:after:rounded-[6px] mi:after:shadow-[0_0_0_2px_var(--mi-p)] mi:after:[background:color-mix(in_srgb,_var(--mi-p)_10%,_transparent)] mi:after:opacity-0 mi:after:transform-[scale(1.06)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-none" :class="{ 'is-on': active === 'supplier' }">Kobalt Print GmbH<br><small class="mi:[.ier__region_&]:block mi:[.ier__region_&]:text-[10px] mi:[.ier__region_&]:text-label3">Hafenstraße 12, Hamburg</small></div>
          </div>
          <div class="ier__doc-meta mi:flex mi:justify-between mi:gap-2.5">
            <div class="ier__region mi:relative mi:py-1 mi:px-1.5 mi:rounded-[4px] mi:leading-[1.4] mi:text-label mi:after:content-[''] mi:after:absolute mi:after:-inset-0.5 mi:after:rounded-[6px] mi:after:shadow-[0_0_0_2px_var(--mi-p)] mi:after:[background:color-mix(in_srgb,_var(--mi-p)_10%,_transparent)] mi:after:opacity-0 mi:after:transform-[scale(1.06)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-none" :class="{ 'is-on': active === 'number' }"><small class="mi:[.ier__region_&]:block mi:[.ier__region_&]:text-[10px] mi:[.ier__region_&]:text-label3">Invoice</small>KP-24-0981</div>
            <div class="ier__region mi:relative mi:py-1 mi:px-1.5 mi:rounded-[4px] mi:leading-[1.4] mi:text-label mi:after:content-[''] mi:after:absolute mi:after:-inset-0.5 mi:after:rounded-[6px] mi:after:shadow-[0_0_0_2px_var(--mi-p)] mi:after:[background:color-mix(in_srgb,_var(--mi-p)_10%,_transparent)] mi:after:opacity-0 mi:after:transform-[scale(1.06)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-none" :class="{ 'is-on': active === 'due' }"><small class="mi:[.ier__region_&]:block mi:[.ier__region_&]:text-[10px] mi:[.ier__region_&]:text-label3">Due</small>02.12.2026</div>
          </div>
          <div class="ier__doc-lines mi:grid mi:gap-2.5 mi:py-2 mi:[border-block:1px_solid_var(--mi-sep)]" aria-hidden="true"><i class="mi:[.ier__doc-lines_&]:h-2 mi:[.ier__doc-lines_&]:rounded-[4px] mi:[.ier__doc-lines_&]:[background:var(--mi-fill3)] mi:[.ier__doc-lines_&:nth-child(even)]:me-[30%]" v-for="n in 4" :key="n" /></div>
          <div class="ier__doc-sum mi:flex mi:gap-2.5">
            <div class="ier__region mi:relative mi:py-1 mi:px-1.5 mi:rounded-[4px] mi:leading-[1.4] mi:text-label mi:after:content-[''] mi:after:absolute mi:after:-inset-0.5 mi:after:rounded-[6px] mi:after:shadow-[0_0_0_2px_var(--mi-p)] mi:after:[background:color-mix(in_srgb,_var(--mi-p)_10%,_transparent)] mi:after:opacity-0 mi:after:transform-[scale(1.06)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-none" :class="{ 'is-on': active === 'vat' }"><small class="mi:[.ier__region_&]:block mi:[.ier__region_&]:text-[10px] mi:[.ier__region_&]:text-label3">MwSt 19%</small>€612.37</div>
            <div class="ier__region mi:relative mi:py-1 mi:px-1.5 mi:rounded-[4px] mi:leading-[1.4] mi:text-label mi:after:content-[''] mi:after:absolute mi:after:-inset-0.5 mi:after:rounded-[6px] mi:after:shadow-[0_0_0_2px_var(--mi-p)] mi:after:[background:color-mix(in_srgb,_var(--mi-p)_10%,_transparent)] mi:after:opacity-0 mi:after:transform-[scale(1.06)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)] mi:after:pointer-events-none mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-none" :class="{ 'is-on': active === 'total' }"><small class="mi:[.ier__region_&]:block mi:[.ier__region_&]:text-[10px] mi:[.ier__region_&]:text-label3">Gesamt</small>€3,835.37</div>
          </div>
        </figure>

        <form class="ier__fields mi:grid mi:gap-3 mi:min-w-0" novalidate @submit.prevent="post">
          <MiProgress :value="confirmed" :max="FIELDS.length" label="Fields confirmed" :value-text="`${confirmed} of ${FIELDS.length}`" size="sm" />
          <div v-for="f in FIELDS" :key="f.key" class="ier__field mi:grid mi:gap-1.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)] mi:[&[data-sure='false']]:[background:color-mix(in_srgb,_var(--mi-orange)_10%,_transparent)]" :data-sure="sure(f.key)" @focusin="active = f.key" @focusout="active = ''">
            <MiField :label="f.label">
              <template #label-end>
                <MiBadge v-if="sure(f.key)" tone="success" :label="edited[f.key] ? 'Edited' : `${Math.round(f.conf * 100)}%`" />
                <MiBadge v-else tone="warning" :label="`Check · ${Math.round(f.conf * 100)}%`" />
              </template>
              <MiInput v-model="values[f.key]" size="sm" @update:model-value="edited[f.key] = true" />
            </MiField>
            <MiButton v-if="!sure(f.key)" size="small" variant="tinted" @click="edited[f.key] = true">Looks right</MiButton>
          </div>
          <MiField label="Book to account">
            <MiNativeSelect v-model="account" size="sm" :options="ACCOUNTS" />
          </MiField>
          <MiAlert v-if="posted" tone="success" title="Posted to the ledger" :message="`${values.supplier} · ${values.total} · due ${values.due}`" />
          <MiButton v-else type="submit" block :disabled="confirmed < FIELDS.length">{{ confirmed < FIELDS.length ? `Confirm ${FIELDS.length - confirmed} more` : 'Post to ledger' }}</MiButton>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'

type Key = 'supplier' | 'number' | 'due' | 'vat' | 'total'
// Extraction result with model confidence; swap for your OCR service response.
// The due date is ambiguous on the page (02.12 read as 12 February), hence its low score.
const FIELDS: { key: Key, label: string, conf: number }[] = [
  { key: 'supplier', label: 'Supplier', conf: 0.98 },
  { key: 'number', label: 'Invoice number', conf: 0.95 },
  { key: 'due', label: 'Due date', conf: 0.61 },
  { key: 'vat', label: 'VAT', conf: 0.88 },
  { key: 'total', label: 'Total', conf: 0.72 }
]
const extracted = (): Record<Key, string> => ({ supplier: 'Kobalt Print GmbH', number: 'KP-24-0981', due: '2026-02-12', vat: '€612.37', total: '€3,835.37' })
const ACCOUNTS = [{ value: '6400', label: '6400 · Printing and stationery' }, { value: '6600', label: '6600 · Marketing materials' }]

const state = ref<'empty' | 'reading' | 'ready'>('ready')
const files = ref<File[]>([])
const fileName = ref('kobalt-invoice-0981.pdf')
const values = reactive(extracted())
const edited = reactive<Partial<Record<Key, boolean>>>({})
const active = ref<Key | ''>('')
const account = ref<string | number | null>('6400')
const posted = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const sure = (k: Key) => !!edited[k] || (FIELDS.find(f => f.key === k)?.conf ?? 0) >= 0.85
const confirmed = computed(() => FIELDS.filter(f => sure(f.key)).length)

function read(list: File[]) {
  files.value = list
  fileName.value = list[0]?.name ?? 'kobalt-invoice-0981.pdf'
  state.value = 'reading'
  timer = setTimeout(() => { state.value = 'ready' }, 1200)
}
function restart() {
  Object.assign(values, extracted())
  for (const f of FIELDS) delete edited[f.key]
  files.value = []
  posted.value = false
  state.value = 'empty'
}
function post() { if (confirmed.value === FIELDS.length) posted.value = true }
onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.ier__doc-sum { justify-content: space-between; }
.ier__doc-sum { justify-content: flex-end; }
.ier__field > :last-child:not(:first-child) { justify-self: start; }
</style>
