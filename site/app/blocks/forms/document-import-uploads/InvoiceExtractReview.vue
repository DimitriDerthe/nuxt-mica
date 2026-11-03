<template>
  <section class="ier" aria-labelledby="ier-title">
    <div class="ier__wrap">
      <header class="ier__head">
        <div>
          <MiText id="ier-title" variant="title3" as="h2" weight="semibold">Read a supplier invoice</MiText>
          <MiText variant="footnote" tone="label2">We pull the fields out; you confirm the ones we are unsure about.</MiText>
        </div>
        <MiButton v-if="state === 'ready'" variant="plain" size="small" @click="restart">Upload another</MiButton>
      </header>

      <div v-if="state !== 'ready'" class="ier__drop">
        <MiFileUpload :model-value="files" accept=".pdf,.png,.jpg" :max-size="10000000" label="Drop an invoice or browse" hint="PDF, PNG or JPG, up to 10 MB" :disabled="state === 'reading'" @update:model-value="read" />
        <div class="ier__drop-foot" aria-live="polite">
          <span v-if="state === 'reading'" class="ier__reading"><MiSpinner size="sm" label="" /> Reading {{ fileName }}…</span>
          <MiButton v-else variant="tinted" size="small" @click="read([])">Use the sample invoice</MiButton>
        </div>
      </div>

      <div v-else class="ier__grid">
        <!-- Faux page: blocks stand in for the scanned text; the focused field lights its region. -->
        <figure class="ier__doc" :aria-label="`Preview of ${fileName}`">
          <div class="ier__doc-top">
            <span class="ier__logo" aria-hidden="true" />
            <div class="ier__region" :class="{ 'is-on': active === 'supplier' }">Kobalt Print GmbH<br><small>Hafenstraße 12, Hamburg</small></div>
          </div>
          <div class="ier__doc-meta">
            <div class="ier__region" :class="{ 'is-on': active === 'number' }"><small>Invoice</small>KP-24-0981</div>
            <div class="ier__region" :class="{ 'is-on': active === 'due' }"><small>Due</small>02.12.2026</div>
          </div>
          <div class="ier__doc-lines" aria-hidden="true"><i v-for="n in 4" :key="n" /></div>
          <div class="ier__doc-sum">
            <div class="ier__region" :class="{ 'is-on': active === 'vat' }"><small>MwSt 19%</small>€612.37</div>
            <div class="ier__region" :class="{ 'is-on': active === 'total' }"><small>Gesamt</small>€3,835.37</div>
          </div>
        </figure>

        <form class="ier__fields" novalidate @submit.prevent="post">
          <MiProgress :value="confirmed" :max="FIELDS.length" label="Fields confirmed" :value-text="`${confirmed} of ${FIELDS.length}`" size="sm" />
          <div v-for="f in FIELDS" :key="f.key" class="ier__field" :data-sure="sure(f.key)" @focusin="active = f.key" @focusout="active = ''">
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
.ier { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ier__wrap { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ier__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ier__drop { display: grid; gap: 12px; }
.ier__drop-foot { display: flex; justify-content: center; }
.ier__reading { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--mi-label2); }

.ier__grid { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 760px) { .ier__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; } }

.ier__doc {
  display: grid; gap: 18px; margin: 0; padding: 22px; aspect-ratio: 1 / 1.2; align-content: start; border-radius: var(--mi-radius-m);
  background: var(--mi-elev); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); font-size: 12px; color: var(--mi-label2);
}
.ier__doc-top, .ier__doc-meta, .ier__doc-sum { display: flex; justify-content: space-between; gap: 10px; }
.ier__doc-sum { justify-content: flex-end; }
.ier__logo { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, var(--mi-p), var(--mi-s)); }
.ier__region { position: relative; padding: 4px 6px; border-radius: 4px; line-height: 1.4; color: var(--mi-label); }
.ier__region small { display: block; font-size: 10px; color: var(--mi-label3); }
.ier__region::after {
  content: ""; position: absolute; inset: -2px; border-radius: 6px; box-shadow: 0 0 0 2px var(--mi-p); background: color-mix(in srgb, var(--mi-p) 10%, transparent);
  opacity: 0; transform: scale(1.06); transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); pointer-events: none;
}
.ier__region.is-on::after { opacity: 1; transform: none; }
.ier__doc-lines { display: grid; gap: 10px; padding-block: 8px; border-block: 1px solid var(--mi-sep); }
.ier__doc-lines i { height: 8px; border-radius: 4px; background: var(--mi-fill3); }
.ier__doc-lines i:nth-child(even) { margin-inline-end: 30%; }

.ier__fields { display: grid; gap: 12px; min-width: 0; }
.ier__field { display: grid; gap: 6px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.ier__field[data-sure="false"] { background: color-mix(in srgb, var(--mi-orange) 10%, transparent); }
.ier__field > :last-child:not(:first-child) { justify-self: start; }
</style>
