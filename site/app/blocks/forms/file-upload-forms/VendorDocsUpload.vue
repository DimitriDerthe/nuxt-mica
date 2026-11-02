<template>
  <section class="vdu" aria-labelledby="vdu-title">
    <header class="vdu__head">
      <div>
        <MiText variant="caption" tone="label2" weight="medium">Supplier onboarding · step 3 of 4</MiText>
        <MiText id="vdu-title" as="h2" variant="title3" weight="semibold">Compliance documents</MiText>
        <MiText variant="footnote" tone="label2">Brightloom Textiles for Halden Retail procurement</MiText>
      </div>
      <MiProgressRing :value="doneCount" :max="required.length" :size="48" label="Required documents provided">
        <span class="vdu__ring">{{ doneCount }}/{{ required.length }}</span>
      </MiProgressRing>
    </header>

    <div v-if="sentRef" class="vdu__card vdu__sent" role="status" aria-live="polite">
      <span class="vdu__sent-mark"><MiIcon name="check" :size="24" :weight="2.4" /></span>
      <MiText as="h3" variant="title3" weight="semibold">Sent for review</MiText>
      <MiText variant="subheadline" tone="label2" align="center">
        {{ files.length }} files are with Halden procurement under reference {{ sentRef }}. Reviews usually take two business days.
      </MiText>
      <MiButton variant="gray" @click="sentRef = ''">Back to documents</MiButton>
    </div>

    <form v-else class="vdu__card vdu__grid" novalidate @submit.prevent="submit">
      <div class="vdu__drop">
        <MiFileUpload
          v-model="files" multiple accept=".pdf,image/png,image/jpeg" :max-size="maxSize" :max-files="6" :progress="progress"
          label="Drop PDFs or scans here, or browse" hint="PDF, PNG or JPG · up to 10 MB each · 6 files max" @reject="onReject"
        />
        <MiAlert v-if="rejected" tone="warning" :message="rejected" dismissible @dismiss="rejected = ''" />
      </div>

      <!-- Checklist: every required document is matched to an uploaded file (auto-guessed from its name). -->
      <div class="vdu__list">
        <MiText as="h3" variant="subheadline" weight="semibold">Required by Halden</MiText>
        <ul class="vdu__docs">
          <li v-for="d in docs" :key="d.id" class="vdu__doc" :class="{ 'is-ok': d.ok, 'is-err': err(d.id) }">
            <span class="vdu__tick" aria-hidden="true"><MiIcon v-if="d.ok" name="check" :size="12" :weight="3" /></span>
            <div class="vdu__doc-body">
              <div class="vdu__doc-top">
                <span class="vdu__doc-name">{{ d.label }}<span v-if="d.optional" class="vdu__opt"> · optional</span></span>
                <MiText variant="caption2" tone="label3">{{ d.uploading ? 'Uploading…' : d.ok ? 'Matched' : 'Missing' }}</MiText>
              </div>
              <MiSelect
                v-model="assign[d.id]" size="sm" :options="fileOptions" :placeholder="files.length ? 'Choose a file' : 'Upload a file first'"
                :disabled="!files.length" :aria-label="d.label + ' file'" :invalid="!!err(d.id)"
              />
              <MiText v-if="err(d.id)" variant="caption" tone="red">{{ err(d.id) }}</MiText>
              <MiField v-if="d.id === 'coi' && assign.coi" label="Policy expires" required :error="err('expiry')" class="vdu__expiry">
                <MiDatePicker v-model="expiry" :min="today" date-style="medium" />
              </MiField>
            </div>
          </li>
        </ul>

        <MiCheckbox v-model="attest" class="vdu__attest" label="I confirm these documents are current and belong to Brightloom Textiles Ltd." />
        <MiText v-if="err('attest')" variant="caption" tone="red" role="alert">{{ err('attest') }}</MiText>

        <div class="vdu__actions">
          <MiButton variant="gray">Save for later</MiButton>
          <MiButton type="submit" :disabled="uploading" :loading="sending">Submit for review</MiButton>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

type Val = string | number
interface Rejection { file: File, reason: 'type' | 'size' | 'count' }

const maxSize = 10 * 1024 * 1024
const required = [
  { id: 'tax', label: 'W-9 tax form', hint: /w-?9|tax/i },
  { id: 'coi', label: 'Certificate of insurance', hint: /insur|coi/i },
  { id: 'bank', label: 'Bank confirmation letter', hint: /bank|iban|rib/i }
] as const
const optional = [{ id: 'iso', label: 'ISO 9001 certificate', hint: /iso|9001/i }] as const
type DocId = typeof required[number]['id'] | typeof optional[number]['id']

const files = ref<File[]>([new File(['%PDF-1.7 sample'], 'W9_Brightloom_2026.pdf', { type: 'application/pdf' })])
const progress = reactive<Record<string, number>>({ 'W9_Brightloom_2026.pdf': 1 })
const assign = reactive<Record<DocId, Val | null>>({ tax: 'W9_Brightloom_2026.pdf', coi: null, bank: null, iso: null })
const expiry = ref<Date | null>(null)
const attest = ref(false)
const rejected = ref('')
const today = new Date()

// Simulated upload: each new file fills its bar over about a second and a half.
const timers = new Map<string, ReturnType<typeof setInterval>>()
watch(files, (list) => {
  for (const f of list) {
    if (progress[f.name] !== undefined) continue
    progress[f.name] = 0
    timers.set(f.name, setInterval(() => {
      const next = Math.min(1, (progress[f.name] ?? 0) + 0.12 + Math.random() * 0.1)
      progress[f.name] = next
      if (next >= 1) { clearInterval(timers.get(f.name)); timers.delete(f.name) }
    }, 160))
    // Auto-match by file name when the slot is still empty.
    const guess = [...required, ...optional].find(d => d.hint.test(f.name) && !assign[d.id])
    if (guess) assign[guess.id] = f.name
  }
  const names = new Set(list.map(f => f.name))
  for (const id of Object.keys(assign) as DocId[]) if (assign[id] && !names.has(String(assign[id]))) assign[id] = null
  for (const name of Object.keys(progress)) {
    if (names.has(name)) continue
    clearInterval(timers.get(name)); timers.delete(name)
    delete progress[name]
  }
})
onBeforeUnmount(() => timers.forEach(t => clearInterval(t)))

function onReject(list: Rejection[]) {
  const why = { type: 'is not a PDF, PNG or JPG', size: 'is larger than 10 MB', count: 'is over the 6-file limit' }
  rejected.value = list.map(r => `${r.file.name} ${why[r.reason]}`).join('. ') + '.'
}

const fileOptions = computed(() => files.value.map(f => ({ value: f.name, label: f.name, description: `${(f.size / 1024).toFixed(0)} KB` })))
const uploading = computed(() => Object.values(progress).some(p => p < 1))
const docs = computed(() => [
  ...required.map(d => ({ ...d, optional: false })),
  ...optional.map(d => ({ ...d, optional: true }))
].map((d) => {
  const file = assign[d.id]
  const up = file != null && (progress[String(file)] ?? 0) < 1
  return { id: d.id, label: d.label, optional: d.optional, uploading: up, ok: file != null && !up && (d.id !== 'coi' || !!expiry.value) }
}))
const doneCount = computed(() => docs.value.filter(d => !d.optional && d.ok).length)

const errors = computed(() => {
  const e: Record<string, string> = {}
  for (const d of required) if (!assign[d.id]) e[d.id] = 'Upload and match this document.'
  const used = Object.values(assign).filter(v => v != null)
  if (new Set(used).size !== used.length) e.bank = e.bank ?? 'Each document needs its own file.'
  if (assign.coi && !expiry.value) e.expiry = 'Enter the expiry date printed on the certificate.'
  if (!attest.value) e.attest = 'Please confirm before submitting.'
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

const sending = ref(false)
const sentRef = ref('')
function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length || uploading.value) return
  sending.value = true
  setTimeout(() => { sentRef.value = 'HR-VND-20931'; sending.value = false; submitted.value = false }, 700)
}
</script>

<style scoped>
.vdu { container: vdu / inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.vdu__head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.vdu__ring { font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.vdu__card { padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.vdu__grid { display: grid; gap: 22px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container vdu (min-width: 820px) { .vdu__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; } }
.vdu__drop { display: grid; gap: 12px; min-width: 0; }

.vdu__list { display: grid; gap: 14px; min-width: 0; }
.vdu__docs { display: grid; margin: 0; padding: 0; list-style: none; }
.vdu__doc { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 12px; padding: 12px 0; }
.vdu__doc + .vdu__doc { border-top: 1px solid var(--mi-sep); }
.vdu__tick { display: grid; place-items: center; width: 20px; height: 20px; margin-top: 1px; border-radius: 50%; border: 1.5px dashed var(--mi-label3); color: var(--mi-p-on); }
.vdu__doc.is-ok .vdu__tick { border: 0; background: var(--mi-green); color: var(--mi-card); }
.vdu__doc.is-err .vdu__tick { border-color: var(--mi-red); }
.vdu__doc-body { display: grid; gap: 8px; min-width: 0; }
.vdu__doc-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 10px; }
.vdu__doc-name { font-size: 14px; font-weight: 600; }
.vdu__opt { font-weight: 400; color: var(--mi-label3); }
.vdu__expiry { max-width: 280px; }
.vdu__attest { padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.vdu__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }

.vdu__sent { display: grid; justify-items: center; gap: 10px; padding: 40px 24px; text-align: center; }
.vdu__sent-mark { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; color: var(--mi-card); background: var(--mi-green); }
</style>
