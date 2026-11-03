<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:font-mi mi:text-label" aria-labelledby="cim-title">
    <header class="mi:grid mi:gap-3.5 mi:@[720px]:grid-cols-[auto_minmax(280px,_420px)] mi:@[720px]:justify-between mi:@[720px]:items-center">
      <div>
        <MiText id="cim-title" variant="title3" as="h2" weight="semibold">Import contacts</MiText>
        <MiText variant="footnote" tone="label2">Into the audience “Web Summit follow-ups”</MiText>
      </div>
      <MiSteps v-model="step" orientation="horizontal" :clickable="false" aria-label="Import progress" :steps="steps" />
    </header>

    <!-- 1. Upload -->
    <div v-if="step === 0" class="mi:grid mi:gap-3.5 mi:min-w-0">
      <MiFileUpload
        v-model="files" accept=".csv,text/csv" :max-size="5 * 1024 * 1024"
        label="Drop a CSV export or browse" hint="Up to 5 MB · first row must hold the column names"
        @reject="rejected = true"
      />
      <MiText v-if="rejected" variant="footnote" tone="red" role="alert">That file is not a CSV under 5 MB.</MiText>
      <MiText v-if="parseError" variant="footnote" tone="red" role="alert">{{ parseError }}</MiText>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-3 mi:gap-x-3.5 mi:p-3.5 mi:rounded-lg mi:bg-fill4">
        <span class="mi:grid mi:[place-items:end_center] mi:w-9.5 mi:h-11.5 mi:pb-1.5 mi:rounded-[6px_14px_6px_6px] mi:bg-green mi:text-card mi:text-[10px] mi:font-extrabold mi:tracking-[.04em]" aria-hidden="true">CSV</span>
        <div class="mi:flex-[1_1_200px] mi:grid mi:gap-0.5">
          <MiText variant="subheadline" weight="medium">No file handy?</MiText>
          <MiText variant="footnote" tone="label2">Try the HubSpot export from the booth scanner: 12 rows, 7 columns.</MiText>
        </div>
        <MiButton variant="tinted" size="small" @click="useSample">Use sample file</MiButton>
      </div>
    </div>

    <!-- 2. Match columns -->
    <div v-else-if="step === 1" class="mi:grid mi:gap-3.5 mi:min-w-0">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
        <MiText variant="subheadline" weight="semibold" as="h3">{{ source }} · {{ table.rows.length }} rows</MiText>
        <MiBadge tone="primary" :label="autoCount + ' matched automatically'" />
      </div>
      <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="(col, i) in table.header" :key="col + i" class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-y-1.5 mi:gap-x-3 mi:items-center mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-fill4 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:@[560px]:grid-cols-[minmax(0,_1fr)_20px_minmax(180px,_220px)]" :class="mapping[i] === 'skip' ? 'mi:opacity-62' : ''">
          <div class="mi:grid mi:min-w-0">
            <MiText variant="subheadline" weight="medium" :lines="1">{{ col }}</MiText>
            <MiText variant="caption" tone="label3" :lines="1">{{ examples(i) }}</MiText>
          </div>
          <span class="mi:hidden mi:text-label3 mi:@[560px]:block" aria-hidden="true"><MiIcon name="arrow-right" :size="16" /></span>
          <div class="mi:grid mi:gap-0.5">
            <MiNativeSelect
              :model-value="mapping[i] ?? 'skip'" :options="fieldOptions" size="sm" :aria-label="'Field for column ' + col"
              :invalid="dupes.has(mapping[i] ?? '')" @update:model-value="v => setMap(i, v)"
            />
            <MiText v-if="dupes.has(mapping[i] ?? '')" variant="caption2" tone="red">Mapped twice</MiText>
          </div>
        </li>
      </ul>
      <MiAlert v-if="!emailIndex.length" tone="warning" title="Email is required" message="Pick the column that holds email addresses; it is how we match existing contacts." />
      <div class="mi:flex mi:justify-between mi:gap-2">
        <MiButton variant="plain" @click="step = 0">Back</MiButton>
        <MiButton :disabled="!canReview" @click="step = 2">Review {{ table.rows.length }} rows</MiButton>
      </div>
    </div>

    <!-- 3. Review -->
    <div v-else-if="!done" class="mi:grid mi:gap-3.5 mi:min-w-0">
      <div class="mi:grid mi:grid-cols-3 mi:gap-2">
        <div class="mi:grid mi:p-3 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)]"><b class="mi:text-[26px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ health.valid }}</b><span class="mi:text-[12px] mi:text-label2">ready</span></div>
        <div class="mi:grid mi:p-3 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-red)_11%,_transparent)]"><b class="mi:text-[26px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ health.invalid }}</b><span class="mi:text-[12px] mi:text-label2">bad email</span></div>
        <div class="mi:grid mi:p-3 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-orange)_13%,_transparent)]"><b class="mi:text-[26px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ health.dupes }}</b><span class="mi:text-[12px] mi:text-label2">duplicates</span></div>
      </div>
      <div class="mi:relative mi:h-2 mi:rounded-[4px] mi:overflow-hidden mi:bg-orange" role="img" :aria-label="`${health.valid} ready, ${health.invalid} with a bad email, ${health.dupes} duplicates`">
        <span class="mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:bg-green mi:z-1" :style="{ transform: `scaleX(${health.valid / table.rows.length})` }" />
        <span class="mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:bg-red mi:z-0" :style="{ transform: `scaleX(${(health.valid + health.invalid) / table.rows.length})` }" />
      </div>

      <div class="mi:overflow-x-auto mi:rounded-md mi:shadow-[0_0_0_1px_var(--mi-sep)]">
        <table class="mi:w-full mi:min-w-160 mi:border-collapse mi:text-[13px]">
          <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)]">First rows as they will be imported</caption>
          <thead><tr><th scope="col" class="mi:py-[9px] mi:px-3 mi:text-start mi:font-semibold mi:text-label2 mi:bg-fill4 mi:whitespace-nowrap">Status</th><th v-for="f in mappedFields" :key="f.value" scope="col" class="mi:py-[9px] mi:px-3 mi:text-start mi:font-semibold mi:text-label2 mi:bg-fill4 mi:whitespace-nowrap">{{ f.label }}</th></tr></thead>
          <tbody>
            <tr v-for="r in reviewRows.slice(0, 6)" :key="r.n">
              <td class="mi:py-[9px] mi:px-3 mi:border-t mi:border-t-sep mi:whitespace-nowrap"><MiBadge :tone="r.state === 'ok' ? 'success' : r.state === 'invalid' ? 'danger' : 'warning'" :label="r.state === 'ok' ? 'Ready' : r.state === 'invalid' ? 'Bad email' : 'Duplicate'" /></td>
              <td v-for="f in mappedFields" :key="f.value" class="mi:py-[9px] mi:px-3 mi:border-t mi:border-t-sep mi:whitespace-nowrap" :class="{ 'mi:text-red-t mi:[text-decoration:wavy_underline] mi:underline-offset-[3px]': f.value === 'email' && r.state === 'invalid' }">{{ r.values[f.value] || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mi:flex mi:items-center mi:gap-2.5">
        <MiSwitch v-model="skipBad" size="compact" aria-labelledby="cim-skip" />
        <MiText id="cim-skip" variant="subheadline">Skip rows with problems instead of stopping the import</MiText>
      </div>
      <div class="mi:flex mi:justify-between mi:gap-2">
        <MiButton variant="plain" @click="step = 1">Back</MiButton>
        <MiButton :disabled="!skipBad && health.valid < table.rows.length" @click="done = true">
          Import {{ skipBad ? health.valid : table.rows.length }} contacts
        </MiButton>
      </div>
    </div>

    <div v-else class="mi:grid mi:gap-3.5 mi:min-w-0 mi:justify-items-center mi:py-7 mi:px-2 mi:text-center" role="status">
      <span class="mi:grid mi:place-items-center mi:w-14 mi:h-14 mi:rounded-[50%] mi:bg-green mi:text-card" aria-hidden="true"><MiIcon name="check" :size="28" :weight="2.4" /></span>
      <MiText variant="title3" as="h3" weight="semibold">{{ health.valid }} contacts imported</MiText>
      <MiText variant="footnote" tone="label2" align="center">
        {{ health.invalid + health.dupes }} rows were skipped. A report with the reasons was sent to your inbox.
      </MiText>
      <MiButton variant="gray" @click="restart">Import another file</MiButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const steps = [{ label: 'Upload' }, { label: 'Match columns' }, { label: 'Review' }]
const step = ref(0)
const done = ref(false)

const fields = [
  { value: 'email', label: 'Email', alias: ['email', 'e-mail', 'mail', 'e-mail address'] },
  { value: 'first', label: 'First name', alias: ['first name', 'given name', 'firstname', 'prénom'] },
  { value: 'last', label: 'Last name', alias: ['last name', 'surname', 'family name', 'lastname'] },
  { value: 'company', label: 'Company', alias: ['company', 'organisation', 'organization', 'account'] },
  { value: 'phone', label: 'Phone', alias: ['phone', 'tel', 'mobile', 'telephone'] },
  { value: 'country', label: 'Country', alias: ['country', 'country/region', 'region'] }
]
const fieldOptions = [...fields.map(f => ({ value: f.value, label: f.label })), { value: 'skip', label: 'Don’t import' }]

const SAMPLE = `E-mail Address,Given name,Surname,Organisation,Tel,Country/Region,Booth notes
ines.carvalho@farfetch.com,Inês,Carvalho,Farfetch,+351 912 448 102,Portugal,Wants API demo
k.okafor@paystack.co,Kelechi,Okafor,Paystack,+234 803 555 0192,Nigeria,
mlindqvist@klarna,Maja,Lindqvist,Klarna,+46 70 123 45 67,Sweden,Typo in badge scan
tomas.reyes@cabify.com,Tomás,Reyes,Cabify,+34 611 20 44 90,Spain,Follow up in January
ines.carvalho@farfetch.com,Inês,Carvalho,Farfetch,,Portugal,Scanned twice
priya.nair@freshworks.com,Priya,Nair,Freshworks,+91 98450 11223,India,
lea.schmitt@personio.de,Léa,Schmitt,Personio,+49 151 2345 6789,Germany,Pricing question
d.mensah@hubtel.com,Daniel,Mensah,Hubtel,+233 24 412 0099,Ghana,
sofia.bianchi@satispay.com,Sofia,Bianchi,Satispay,,Italy,
noah.vermeer(at)mollie.com,Noah,Vermeer,Mollie,+31 6 1234 5678,Netherlands,
aiko.tanaka@mercari.com,Aiko,Tanaka,Mercari,+81 90 1234 5678,Japan,Wants case study
oscar.dupont@qonto.com,Oscar,Dupont,Qonto,+33 6 12 34 56 78,France,`

interface Table { header: string[], rows: string[][] }
const files = ref<File[]>([])
const source = ref('')
const table = ref<Table>({ header: [], rows: [] })
const mapping = ref<string[]>([])
const autoCount = ref(0)
const rejected = ref(false)
const parseError = ref('')
const skipBad = ref(true)

/** Minimal CSV reader: commas, double-quoted cells and escaped quotes. Enough for exports from common CRMs. */
function parse(text: string): Table {
  const rows: string[][] = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
    const cells: string[] = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"' && quoted && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') quoted = !quoted
      else if (ch === ',' && !quoted) { cells.push(cur.trim()); cur = '' }
      else cur += ch
    }
    cells.push(cur.trim())
    rows.push(cells)
  }
  const [header = [], ...body] = rows
  return { header, rows: body }
}

function load(name: string, text: string) {
  const t = parse(text)
  if (t.header.length < 2 || !t.rows.length) {
    parseError.value = `${name} has no rows we can read. Check that it is comma separated.`
    return
  }
  parseError.value = ''
  source.value = name
  table.value = t
  // Guess each column from its header; anything unknown is skipped.
  const used = new Set<string>()
  mapping.value = t.header.map((h) => {
    const f = fields.find(x => x.alias.includes(h.toLowerCase()) && !used.has(x.value))
    if (f) used.add(f.value)
    return f ? f.value : 'skip'
  })
  autoCount.value = used.size
  step.value = 1
}

const useSample = () => load('booth-scans-websummit.csv', SAMPLE)
watch(files, async (list) => {
  rejected.value = false
  const f = list[0]
  if (f) load(f.name, await f.text())
})

function setMap(i: number, v: string | number | null) {
  const next = [...mapping.value]
  next[i] = String(v ?? 'skip')
  mapping.value = next
}
const examples = (i: number) => table.value.rows.slice(0, 2).map(r => r[i] || '—').join(' · ')

const dupes = computed(() => {
  const seen = new Map<string, number>()
  for (const m of mapping.value) if (m !== 'skip') seen.set(m, (seen.get(m) ?? 0) + 1)
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k))
})
const emailIndex = computed(() => mapping.value.flatMap((m, i) => (m === 'email' ? [i] : [])))
const canReview = computed(() => emailIndex.value.length === 1 && dupes.value.size === 0)
const mappedFields = computed(() => fields.filter(f => mapping.value.includes(f.value)))

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const reviewRows = computed(() => {
  const seen = new Set<string>()
  return table.value.rows.map((row, n) => {
    const values: Record<string, string> = {}
    mapping.value.forEach((m, i) => { if (m !== 'skip') values[m] = row[i] ?? '' })
    const email = (values.email ?? '').toLowerCase()
    const state = !EMAIL.test(email) ? 'invalid' : seen.has(email) ? 'dupe' : 'ok'
    seen.add(email)
    return { n, values, state }
  })
})
const health = computed(() => ({
  valid: reviewRows.value.filter(r => r.state === 'ok').length,
  invalid: reviewRows.value.filter(r => r.state === 'invalid').length,
  dupes: reviewRows.value.filter(r => r.state === 'dupe').length
}))

function restart() {
  files.value = []
  done.value = false
  step.value = 0
}
</script>
