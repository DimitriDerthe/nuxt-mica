<template>
  <section class="mi:@container/vdu mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="vdu-title">
    <header class="mi:flex mi:items-center mi:justify-between mi:gap-3.5">
      <div>
        <MiText variant="caption" tone="label2" weight="medium">Supplier onboarding · step 3 of 4</MiText>
        <MiText id="vdu-title" as="h2" variant="title3" weight="semibold">Compliance documents</MiText>
        <MiText variant="footnote" tone="label2">Brightloom Textiles for Halden Retail procurement</MiText>
      </div>
      <MiProgressRing :value="doneCount" :max="required.length" :size="48" label="Required documents provided">
        <span class="mi:text-[12px] mi:font-bold mi:tabular-nums">{{ doneCount }}/{{ required.length }}</span>
      </MiProgressRing>
    </header>

    <div v-if="sentRef" class="mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:justify-items-center mi:gap-2.5 mi:py-10 mi:px-6 mi:text-center" role="status" aria-live="polite">
      <span class="mi:grid mi:place-items-center mi:w-13 mi:h-13 mi:rounded-[50%] mi:text-card mi:bg-green"><MiIcon name="check" :size="24" :weight="2.4" /></span>
      <MiText as="h3" variant="title3" weight="semibold">Sent for review</MiText>
      <MiText variant="subheadline" tone="label2" align="center">
        {{ files.length }} files are with Halden procurement under reference {{ sentRef }}. Reviews usually take two business days.
      </MiText>
      <MiButton variant="gray" @click="sentRef = ''">Back to documents</MiButton>
    </div>

    <form v-else class="mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:gap-5.5 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[820px]/vdu:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[820px]/vdu:gap-7" novalidate @submit.prevent="submit">
      <div class="mi:grid mi:gap-3 mi:min-w-0">
        <MiFileUpload
          v-model="files" multiple accept=".pdf,image/png,image/jpeg" :max-size="maxSize" :max-files="6" :progress="progress"
          label="Drop PDFs or scans here, or browse" hint="PDF, PNG or JPG · up to 10 MB each · 6 files max" @reject="onReject"
        />
        <MiAlert v-if="rejected" tone="warning" :message="rejected" dismissible @dismiss="rejected = ''" />
      </div>

      <!-- Checklist: every required document is matched to an uploaded file (auto-guessed from its name). -->
      <div class="mi:grid mi:gap-3.5 mi:min-w-0">
        <MiText as="h3" variant="subheadline" weight="semibold">Required by Halden</MiText>
        <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="d in docs" :key="d.id" class="mi:grid mi:grid-cols-[22px_minmax(0,_1fr)] mi:gap-3 mi:py-3 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep">
            <span class="mi:grid mi:place-items-center mi:w-5 mi:h-5 mi:mt-px mi:rounded-[50%] " :class="d.ok ? 'mi:[border:0] mi:bg-green mi:text-card' : err(d.id) ? 'mi:text-p-on mi:[border:1.5px_dashed_var(--mi-label3)] mi:border-red' : 'mi:text-p-on mi:[border:1.5px_dashed_var(--mi-label3)]'" aria-hidden="true"><MiIcon v-if="d.ok" name="check" :size="12" :weight="3" /></span>
            <div class="mi:grid mi:gap-2 mi:min-w-0">
              <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-2.5">
                <span class="mi:text-[14px] mi:font-semibold">{{ d.label }}<span v-if="d.optional" class="mi:font-normal mi:text-label3"> · optional</span></span>
                <MiText variant="caption2" tone="label3">{{ d.uploading ? 'Uploading…' : d.ok ? 'Matched' : 'Missing' }}</MiText>
              </div>
              <MiSelect
                v-model="assign[d.id]" size="sm" :options="fileOptions" :placeholder="files.length ? 'Choose a file' : 'Upload a file first'"
                :disabled="!files.length" :aria-label="d.label + ' file'" :invalid="!!err(d.id)"
              />
              <MiText v-if="err(d.id)" variant="caption" tone="red">{{ err(d.id) }}</MiText>
              <MiField v-if="d.id === 'coi' && assign.coi" label="Policy expires" required :error="err('expiry')" class="mi:max-w-70">
                <MiDatePicker v-model="expiry" :min="today" date-style="medium" />
              </MiField>
            </div>
          </li>
        </ul>

        <MiCheckbox v-model="attest" class="mi:py-3! mi:px-3.5! mi:rounded-md! mi:bg-fill4!" label="I confirm these documents are current and belong to Brightloom Textiles Ltd." />
        <MiText v-if="err('attest')" variant="caption" tone="red" role="alert">{{ err('attest') }}</MiText>

        <div class="mi:flex mi:flex-wrap mi:[justify-content:flex-end] mi:gap-2">
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
