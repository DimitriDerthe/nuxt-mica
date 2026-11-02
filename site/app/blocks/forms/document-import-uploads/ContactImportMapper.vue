<template>
  <section class="cim" aria-labelledby="cim-title">
    <header class="cim__head">
      <div>
        <MiText id="cim-title" variant="title3" as="h2" weight="semibold">Import contacts</MiText>
        <MiText variant="footnote" tone="label2">Into the audience “Web Summit follow-ups”</MiText>
      </div>
      <MiSteps v-model="step" class="cim__steps" orientation="horizontal" :clickable="false" aria-label="Import progress" :steps="steps" />
    </header>

    <!-- 1. Upload -->
    <div v-if="step === 0" class="cim__panel">
      <MiFileUpload
        v-model="files" accept=".csv,text/csv" :max-size="5 * 1024 * 1024"
        label="Drop a CSV export or browse" hint="Up to 5 MB · first row must hold the column names"
        @reject="rejected = true"
      />
      <MiText v-if="rejected" variant="footnote" tone="red" role="alert">That file is not a CSV under 5 MB.</MiText>
      <MiText v-if="parseError" variant="footnote" tone="red" role="alert">{{ parseError }}</MiText>
      <div class="cim__sample">
        <span class="cim__file" aria-hidden="true">CSV</span>
        <div class="cim__sample-text">
          <MiText variant="subheadline" weight="medium">No file handy?</MiText>
          <MiText variant="footnote" tone="label2">Try the HubSpot export from the booth scanner: 12 rows, 7 columns.</MiText>
        </div>
        <MiButton variant="tinted" size="small" @click="useSample">Use sample file</MiButton>
      </div>
    </div>

    <!-- 2. Match columns -->
    <div v-else-if="step === 1" class="cim__panel">
      <div class="cim__bar">
        <MiText variant="subheadline" weight="semibold" as="h3">{{ source }} · {{ table.rows.length }} rows</MiText>
        <MiBadge tone="primary" :label="autoCount + ' matched automatically'" />
      </div>
      <ul class="cim__map">
        <li v-for="(col, i) in table.header" :key="col + i" class="cim__row" :class="{ 'is-skip': mapping[i] === 'skip' }">
          <div class="cim__src">
            <MiText variant="subheadline" weight="medium" :lines="1">{{ col }}</MiText>
            <MiText variant="caption" tone="label3" :lines="1">{{ examples(i) }}</MiText>
          </div>
          <span class="cim__arrow" aria-hidden="true"><MiIcon name="arrow-right" :size="16" /></span>
          <div class="cim__dst">
            <MiNativeSelect
              :model-value="mapping[i] ?? 'skip'" :options="fieldOptions" size="sm" :aria-label="'Field for column ' + col"
              :invalid="dupes.has(mapping[i] ?? '')" @update:model-value="v => setMap(i, v)"
            />
            <MiText v-if="dupes.has(mapping[i] ?? '')" variant="caption2" tone="red">Mapped twice</MiText>
          </div>
        </li>
      </ul>
      <MiAlert v-if="!emailIndex.length" tone="warning" title="Email is required" message="Pick the column that holds email addresses; it is how we match existing contacts." />
      <div class="cim__nav">
        <MiButton variant="plain" @click="step = 0">Back</MiButton>
        <MiButton :disabled="!canReview" @click="step = 2">Review {{ table.rows.length }} rows</MiButton>
      </div>
    </div>

    <!-- 3. Review -->
    <div v-else-if="!done" class="cim__panel">
      <div class="cim__health">
        <div class="cim__stat"><b>{{ health.valid }}</b><span>ready</span></div>
        <div class="cim__stat is-warn"><b>{{ health.invalid }}</b><span>bad email</span></div>
        <div class="cim__stat is-dup"><b>{{ health.dupes }}</b><span>duplicates</span></div>
      </div>
      <div class="cim__meter" role="img" :aria-label="`${health.valid} ready, ${health.invalid} with a bad email, ${health.dupes} duplicates`">
        <span class="is-ok" :style="{ transform: `scaleX(${health.valid / table.rows.length})` }" />
        <span class="is-warn" :style="{ transform: `scaleX(${(health.valid + health.invalid) / table.rows.length})` }" />
      </div>

      <div class="cim__scroll">
        <table class="cim__table">
          <caption class="cim__sr">First rows as they will be imported</caption>
          <thead><tr><th scope="col">Status</th><th v-for="f in mappedFields" :key="f.value" scope="col">{{ f.label }}</th></tr></thead>
          <tbody>
            <tr v-for="r in reviewRows.slice(0, 6)" :key="r.n">
              <td><MiBadge :tone="r.state === 'ok' ? 'success' : r.state === 'invalid' ? 'danger' : 'warning'" :label="r.state === 'ok' ? 'Ready' : r.state === 'invalid' ? 'Bad email' : 'Duplicate'" /></td>
              <td v-for="f in mappedFields" :key="f.value" :class="{ 'is-bad': f.value === 'email' && r.state === 'invalid' }">{{ r.values[f.value] || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="cim__opt">
        <MiSwitch v-model="skipBad" size="compact" aria-labelledby="cim-skip" />
        <MiText id="cim-skip" variant="subheadline">Skip rows with problems instead of stopping the import</MiText>
      </div>
      <div class="cim__nav">
        <MiButton variant="plain" @click="step = 1">Back</MiButton>
        <MiButton :disabled="!skipBad && health.valid < table.rows.length" @click="done = true">
          Import {{ skipBad ? health.valid : table.rows.length }} contacts
        </MiButton>
      </div>
    </div>

    <div v-else class="cim__panel cim__done" role="status">
      <span class="cim__tick" aria-hidden="true"><MiIcon name="check" :size="28" :weight="2.4" /></span>
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

<style scoped>
.cim { container-type: inline-size; display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }
.cim__head { display: grid; gap: 14px; }
@container (min-width: 720px) { .cim__head { grid-template-columns: auto minmax(280px, 420px); justify-content: space-between; align-items: center; } }
.cim__panel { display: grid; gap: 14px; min-width: 0; }

.cim__sample { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 14px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.cim__sample-text { flex: 1 1 200px; display: grid; gap: 2px; }
.cim__file {
  display: grid; place-items: end center; width: 38px; height: 46px; padding-bottom: 6px; border-radius: 6px 14px 6px 6px;
  background: var(--mi-green); color: var(--mi-card); font-size: 10px; font-weight: 800; letter-spacing: .04em;
}

.cim__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.cim__map { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.cim__row {
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px 12px; align-items: center; padding: 10px 12px;
  border-radius: var(--mi-radius-m); background: var(--mi-fill4); transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.cim__row.is-skip { opacity: .62; }
.cim__src { display: grid; min-width: 0; }
.cim__arrow { display: none; color: var(--mi-label3); }
.cim__dst { display: grid; gap: 2px; }
@container (min-width: 560px) {
  .cim__row { grid-template-columns: minmax(0, 1fr) 20px minmax(180px, 220px); }
  .cim__arrow { display: block; }
}
.cim__nav { display: flex; justify-content: space-between; gap: 8px; }

.cim__health { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.cim__stat { display: grid; padding: 12px; border-radius: var(--mi-radius-m); background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.cim__stat.is-warn { background: color-mix(in srgb, var(--mi-red) 11%, transparent); }
.cim__stat.is-dup { background: color-mix(in srgb, var(--mi-orange) 13%, transparent); }
.cim__stat b { font-size: 26px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.cim__stat span { font-size: 12px; color: var(--mi-label2); }
/* Two stacked fills on an orange track: green for ready, red up to ready + invalid, orange shows through for duplicates. */
.cim__meter { position: relative; height: 8px; border-radius: 4px; overflow: hidden; background: var(--mi-orange); }
.cim__meter span { position: absolute; inset: 0; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.cim__meter .is-warn { background: var(--mi-red); z-index: 0; }
.cim__meter .is-ok { background: var(--mi-green); z-index: 1; }

.cim__scroll { overflow-x: auto; border-radius: var(--mi-radius-m); box-shadow: 0 0 0 1px var(--mi-sep); }
.cim__table { width: 100%; min-width: 640px; border-collapse: collapse; font-size: 13px; }
.cim__table th { padding: 9px 12px; text-align: start; font-weight: 600; color: var(--mi-label2); background: var(--mi-fill4); white-space: nowrap; }
.cim__table td { padding: 9px 12px; border-top: 1px solid var(--mi-sep); white-space: nowrap; }
.cim__table td.is-bad { color: var(--mi-red-t); text-decoration: wavy underline; text-underline-offset: 3px; }
.cim__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.cim__opt { display: flex; align-items: center; gap: 10px; }

.cim__done { justify-items: center; padding: 28px 8px; text-align: center; }
.cim__tick { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 50%; background: var(--mi-green); color: var(--mi-card); }
</style>
