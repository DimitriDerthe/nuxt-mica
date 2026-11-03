<template>
  <section class="env mi:@container/env mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="env-title">
    <header class="env__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-2.5">
      <div>
        <MiText id="env-title" as="h2" variant="title3" weight="semibold">Import variables</MiText>
        <MiText variant="footnote" tone="label2">billing-worker · production · 4 variables set</MiText>
      </div>
      <MiButton variant="plain" size="small" @click="raw = ''">Clear</MiButton>
    </header>

    <MiAlert v-if="imported" tone="success" :title="imported + ' variables imported'" action-label="Redeploy now" dismissible @dismiss="imported = 0">
      They apply on the next deploy of billing-worker.
    </MiAlert>

    <form class="env__grid mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[820px]/env:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)] mi:@[820px]/env:gap-5.5" novalidate @submit.prevent="submit">
      <MiField label="Paste a .env file" :error="formError" hint="KEY=value per line. Comments and export prefixes are ignored.">
        <MiTextarea v-model="raw" class="env__area" :rows="9" :max-rows="16" spellcheck="false" autocomplete="off" />
      </MiField>

      <!-- Parsed as you type: one row per meaningful line, with its own diagnosis. -->
      <div class="env__preview mi:grid mi:gap-3 mi:min-w-0" aria-live="polite">
        <div class="env__preview-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
          <MiText as="h3" variant="subheadline" weight="semibold">Preview</MiText>
          <div class="env__counts mi:flex mi:flex-wrap mi:gap-1.5">
            <span class="env__count is-ok mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[11.5px] mi:font-semibold mi:[&.is-ok]:text-green-t mi:[&.is-ok]:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)] mi:[&.is-warn]:text-orange-t mi:[&.is-warn]:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)] mi:[&.is-err]:text-red-t mi:[&.is-err]:[background:color-mix(in_srgb,_var(--mi-red)_13%,_transparent)]">{{ valid.length }} ready</span>
            <span v-if="warnings" class="env__count is-warn mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[11.5px] mi:font-semibold mi:[&.is-ok]:text-green-t mi:[&.is-ok]:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)] mi:[&.is-warn]:text-orange-t mi:[&.is-warn]:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)] mi:[&.is-err]:text-red-t mi:[&.is-err]:[background:color-mix(in_srgb,_var(--mi-red)_13%,_transparent)]">{{ warnings }} warning{{ warnings === 1 ? '' : 's' }}</span>
            <span v-if="problems" class="env__count is-err mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[11.5px] mi:font-semibold mi:[&.is-ok]:text-green-t mi:[&.is-ok]:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)] mi:[&.is-warn]:text-orange-t mi:[&.is-warn]:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)] mi:[&.is-err]:text-red-t mi:[&.is-err]:[background:color-mix(in_srgb,_var(--mi-red)_13%,_transparent)]">{{ problems }} error{{ problems === 1 ? '' : 's' }}</span>
          </div>
        </div>
        <ol v-if="rows.length" class="env__rows mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-md mi:border mi:border-sep mi:max-h-80 mi:overflow-y-auto">
          <li v-for="r in rows" :key="r.line" class="env__row mi:grid mi:grid-cols-[26px_minmax(0,_1fr)_auto] mi:items-start mi:gap-2.5 mi:py-2 mi:px-2.5 mi:border-l-3 mi:border-l-transparent mi:[.env__row+&]:border-t mi:[.env__row+&]:border-t-sep" :class="'is-' + r.level">
            <span class="env__ln mi:pt-px mi:[font:500_11px/1.6_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-label3 mi:text-end" aria-label="line">{{ r.line }}</span>
            <div class="env__kv mi:grid mi:gap-0.5 mi:min-w-0">
              <code class="env__key mi:[font:600_12.5px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:wrap-anywhere">{{ r.key || '—' }}</code>
              <code class="env__val mi:inline-flex mi:items-center mi:gap-1 mi:min-w-0 mi:[font:12px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-label2 mi:wrap-anywhere mi:break-all">
                <MiIcon v-if="r.secret && maskSecrets" name="lock" :size="12" />{{ r.secret && maskSecrets ? '•'.repeat(Math.min(r.value.length, 12)) : (r.value || 'empty') }}
              </code>
              <span v-if="r.note" class="env__note mi:text-[12px] mi:text-label2 mi:[.is-err_&]:text-red-t mi:[.is-warn_&]:text-orange-t">{{ r.note }}</span>
            </div>
            <span v-if="r.overwrite" class="env__tag mi:py-px mi:px-1.5 mi:rounded-[5px] mi:text-[10.5px] mi:font-semibold mi:text-p-text mi:bg-p-tint">Replaces</span>
          </li>
        </ol>
        <MiText v-else variant="footnote" tone="label3">Nothing to import yet.</MiText>

        <div class="env__opts mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <label class="env__opt mi:inline-flex mi:items-center mi:gap-2 mi:text-[13px] mi:text-label2 mi:cursor-pointer">
            <MiSwitch v-model="maskSecrets" size="compact" label="Encrypt detected secrets" />
            <span aria-hidden="true">Encrypt {{ secretCount }} detected secret{{ secretCount === 1 ? '' : 's' }}</span>
          </label>
          <MiButton type="submit" :disabled="!rows.length" :loading="busy">
            Import {{ valid.length || '' }} variable{{ valid.length === 1 ? '' : 's' }}
          </MiButton>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

interface Row { line: number, key: string, value: string, level: 'ok' | 'warn' | 'err', note?: string, secret: boolean, overwrite: boolean }

const existing = ['DATABASE_URL', 'REDIS_URL', 'LOG_LEVEL', 'SENTRY_DSN']
const raw = ref(`# Copied from staging, Nov 2
export DATABASE_URL="postgres://billing:pw@db-prod.internal:5432/billing"
STRIPE_SECRET_KEY=sk_test_51NxQe2redacted
INVOICE_PDF_BUCKET=ledger-invoices-prod
LOG_LEVEL=info
retry-limit=5
WEBHOOK_SIGNING_TOKEN=whsec_7f3a91c0
LOG_LEVEL=warn
FEATURE_DUNNING_V2=`)
const maskSecrets = ref(true)
const imported = ref(0)
const busy = ref(false)
const submitted = ref(false)

const rows = computed<Row[]>(() => {
  const out: Row[] = []
  const seen = new Map<string, Row>()
  raw.value.split('\n').forEach((text, i) => {
    const line = text.trim().replace(/^export\s+/, '')
    if (!line || line.startsWith('#')) return
    const eq = line.indexOf('=')
    if (eq < 0) { out.push({ line: i + 1, key: line, value: '', level: 'err', note: 'Missing “=”', secret: false, overwrite: false }); return }
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
    const row: Row = { line: i + 1, key, value, level: 'ok', secret: /SECRET|TOKEN|PASSWORD|_KEY$|DSN/.test(key), overwrite: existing.includes(key) }
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) { row.level = 'err'; row.note = 'Use UPPER_SNAKE_CASE' }
    else if (seen.has(key)) {
      const prev = seen.get(key)!
      prev.level = 'warn'; prev.note = `Overridden on line ${row.line}`
      row.level = 'warn'; row.note = `Duplicate of line ${prev.line}, this one wins`
    } else if (!value) { row.level = 'warn'; row.note = 'Empty value' }
    if (row.level !== 'err') seen.set(key, row)
    out.push(row)
  })
  return out
})
// Last occurrence of each valid key is what gets imported.
const valid = computed(() => [...new Map(rows.value.filter(r => r.level !== 'err').map(r => [r.key, r])).values()])
const problems = computed(() => rows.value.filter(r => r.level === 'err').length)
const warnings = computed(() => rows.value.filter(r => r.level === 'warn').length)
const secretCount = computed(() => valid.value.filter(r => r.secret).length)

const formError = computed(() => {
  if (!submitted.value) return undefined
  if (!rows.value.length) return 'Paste at least one KEY=value line.'
  if (problems.value) return `Fix ${problems.value} line${problems.value === 1 ? '' : 's'} marked in red before importing.`
  return undefined
})

function submit() {
  submitted.value = true
  if (!rows.value.length || problems.value) return
  busy.value = true
  later(() => {
    imported.value = valid.value.length
    busy.value = false
    submitted.value = false
    raw.value = ''
  }, 650)
}
</script>

<style scoped>
.env__area :deep(textarea), .env__area { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 1.6; }
.env__row.is-warn { border-left-color: var(--mi-orange); background: color-mix(in srgb, var(--mi-orange) 5%, transparent); }
.env__row.is-err { border-left-color: var(--mi-red); background: color-mix(in srgb, var(--mi-red) 6%, transparent); }
</style>
