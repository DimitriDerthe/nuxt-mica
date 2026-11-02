<template>
  <section class="env" aria-labelledby="env-title">
    <header class="env__head">
      <div>
        <MiText id="env-title" as="h2" variant="title3" weight="semibold">Import variables</MiText>
        <MiText variant="footnote" tone="label2">billing-worker · production · 4 variables set</MiText>
      </div>
      <MiButton variant="plain" size="small" @click="raw = ''">Clear</MiButton>
    </header>

    <MiAlert v-if="imported" tone="success" :title="imported + ' variables imported'" action-label="Redeploy now" dismissible @dismiss="imported = 0">
      They apply on the next deploy of billing-worker.
    </MiAlert>

    <form class="env__grid" novalidate @submit.prevent="submit">
      <MiField label="Paste a .env file" :error="formError" hint="KEY=value per line. Comments and export prefixes are ignored.">
        <MiTextarea v-model="raw" class="env__area" :rows="9" :max-rows="16" spellcheck="false" autocomplete="off" />
      </MiField>

      <!-- Parsed as you type: one row per meaningful line, with its own diagnosis. -->
      <div class="env__preview" aria-live="polite">
        <div class="env__preview-head">
          <MiText as="h3" variant="subheadline" weight="semibold">Preview</MiText>
          <div class="env__counts">
            <span class="env__count is-ok">{{ valid.length }} ready</span>
            <span v-if="warnings" class="env__count is-warn">{{ warnings }} warning{{ warnings === 1 ? '' : 's' }}</span>
            <span v-if="problems" class="env__count is-err">{{ problems }} error{{ problems === 1 ? '' : 's' }}</span>
          </div>
        </div>
        <ol v-if="rows.length" class="env__rows">
          <li v-for="r in rows" :key="r.line" class="env__row" :class="'is-' + r.level">
            <span class="env__ln" aria-label="line">{{ r.line }}</span>
            <div class="env__kv">
              <code class="env__key">{{ r.key || '—' }}</code>
              <code class="env__val">
                <MiIcon v-if="r.secret && maskSecrets" name="lock" :size="12" />{{ r.secret && maskSecrets ? '•'.repeat(Math.min(r.value.length, 12)) : (r.value || 'empty') }}
              </code>
              <span v-if="r.note" class="env__note">{{ r.note }}</span>
            </div>
            <span v-if="r.overwrite" class="env__tag">Replaces</span>
          </li>
        </ol>
        <MiText v-else variant="footnote" tone="label3">Nothing to import yet.</MiText>

        <div class="env__opts">
          <label class="env__opt">
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
import { computed, ref } from 'vue'

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
  setTimeout(() => {
    imported.value = valid.value.length
    busy.value = false
    submitted.value = false
    raw.value = ''
  }, 650)
}
</script>

<style scoped>
.env { container: env / inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.env__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 10px; }
.env__grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container env (min-width: 820px) { .env__grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 22px; } }
.env__area :deep(textarea), .env__area { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; line-height: 1.6; }

.env__preview { display: grid; gap: 12px; min-width: 0; }
.env__preview-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.env__counts { display: flex; flex-wrap: wrap; gap: 6px; }
.env__count { padding: 2px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600; }
.env__count.is-ok { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.env__count.is-warn { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.env__count.is-err { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 13%, transparent); }

.env__rows { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-m); border: 1px solid var(--mi-sep); max-height: 320px; overflow-y: auto; }
.env__row { display: grid; grid-template-columns: 26px minmax(0, 1fr) auto; align-items: start; gap: 10px; padding: 8px 10px; border-left: 3px solid transparent; }
.env__row + .env__row { border-top: 1px solid var(--mi-sep); }
.env__row.is-warn { border-left-color: var(--mi-orange); background: color-mix(in srgb, var(--mi-orange) 5%, transparent); }
.env__row.is-err { border-left-color: var(--mi-red); background: color-mix(in srgb, var(--mi-red) 6%, transparent); }
.env__ln { padding-top: 1px; font: 500 11px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label3); text-align: end; }
.env__kv { display: grid; gap: 2px; min-width: 0; }
.env__key { font: 600 12.5px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
.env__val { display: inline-flex; align-items: center; gap: 4px; min-width: 0; font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label2); overflow-wrap: anywhere; word-break: break-all; }
.env__note { font-size: 12px; color: var(--mi-label2); }
.is-err .env__note { color: var(--mi-red-t); }
.is-warn .env__note { color: var(--mi-orange-t); }
.env__tag { padding: 1px 6px; border-radius: 5px; font-size: 10.5px; font-weight: 600; color: var(--mi-p-text); background: var(--mi-p-tint); }

.env__opts { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.env__opt { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--mi-label2); cursor: pointer; }
</style>
