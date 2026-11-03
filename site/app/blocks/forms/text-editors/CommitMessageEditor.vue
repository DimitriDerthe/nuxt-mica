<template>
  <section class="cme" aria-labelledby="cme-title">
    <header class="cme__head">
      <div>
        <MiText id="cme-title" as="h2" variant="title3" weight="semibold">Commit message</MiText>
        <MiText variant="footnote" tone="label2">quayside/web · 4 files staged on fix/invoice-rounding</MiText>
      </div>
      <MiBadge :tone="errors.length ? 'danger' : warnings.length ? 'warning' : 'success'" :label="verdict" dot />
    </header>

    <div class="cme__body">
      <div class="cme__form">
        <div class="cme__prefix">
          <MiField label="Type"><MiSelect v-model="type" :options="types" size="sm" /></MiField>
          <MiField label="Scope" hint="Optional"><MiInput v-model="scope" size="sm" placeholder="billing" /></MiField>
        </div>

        <MiField label="Summary" :error="subjectError">
          <template #default="{ id, describedBy }">
            <MiInput :id="id" v-model="subject" class="cme__mono" :aria-describedby="describedBy" placeholder="round invoice totals per line" />
          </template>
          <template #label-end>
            <MiText variant="caption" tabular :tone="header.length > 72 ? 'red' : header.length > 50 ? 'orange' : 'label3'">{{ header.length }} / 72</MiText>
          </template>
        </MiField>
        <!-- 50/72 ruler: soft target at 50 characters, hard limit at 72. -->
        <div class="cme__ruler" aria-hidden="true">
          <span class="cme__fill" :class="{ 'is-long': header.length > 50 }" :style="{ transform: `scaleX(${Math.min(header.length, 72) / 72})` }" />
          <span class="cme__tick" />
        </div>

        <MiField label="Body" hint="Why the change, not how. Wrap at 72 columns.">
          <template #default="{ id, describedBy }">
            <MiTextarea :id="id" v-model="body" class="cme__mono" :rows="4" :max-rows="9" :aria-describedby="describedBy" />
          </template>
        </MiField>

        <MiCheckbox v-model="breaking" label="Breaking change" description="Adds a ! to the header and a BREAKING CHANGE footer" />
        <MiField label="Closes issue">
          <MiInput v-model="issue" size="sm" prefix="#" inputmode="numeric" placeholder="1482" />
        </MiField>
      </div>

      <div class="cme__side">
        <MiCodeBlock :code="message" filename="COMMIT_EDITMSG" size="sm" />
        <ul class="cme__lint" aria-label="Message checks">
          <li v-for="l in lints" :key="l.text" :class="`is-${l.level}`">
            <MiIcon :name="l.level === 'ok' ? 'check-circle' : l.level === 'error' ? 'x-circle-fill' : 'warning'" :size="15" />{{ l.text }}
          </li>
        </ul>
        <MiButton block :disabled="errors.length > 0" @click="committed = true">Commit 4 files</MiButton>
        <p class="cme__status" role="status" aria-live="polite">{{ committed ? `Committed as 3f9c2e1: ${header}` : '' }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Lint { level: 'ok' | 'warn' | 'error', text: string, subject?: boolean }

const types = ['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'chore'].map(t => ({ value: t, label: t }))
const type = ref<string | number | null>('fix')
const scope = ref('billing')
const subject = ref('Rounded invoice totals per line instead of per invoice.')
const body = ref('Totals were rounded once at the end, so a 3-line invoice could be off by a cent against the PDF our customers reconcile with. Round each line to 2 decimals, then sum.')
const breaking = ref(false)
const issue = ref('1482')
const committed = ref(false)

const header = computed(() => `${type.value}${scope.value.trim() ? `(${scope.value.trim()})` : ''}${breaking.value ? '!' : ''}: ${subject.value.trim()}`)
const bodyLines = computed(() => body.value.split('\n'))
// Long body lines are rewrapped for the preview so the user sees the 72-column result.
const wrapped = computed(() => bodyLines.value.flatMap(line => line.match(/.{1,72}(\s|$)|\S+/g)?.map(s => s.trimEnd()) ?? ['']))
const message = computed(() => [
  header.value,
  ...(body.value.trim() ? ['', ...wrapped.value] : []),
  ...(breaking.value || issue.value ? [''] : []),
  ...(breaking.value ? ['BREAKING CHANGE: describe the migration here'] : []),
  ...(issue.value ? [`Closes #${issue.value}`] : [])
].join('\n'))

const imperative: Record<string, string> = { added: 'add', fixed: 'fix', removed: 'remove', updated: 'update', changed: 'change', rounded: 'round', made: 'make', moved: 'move' }
const lints = computed<Lint[]>(() => {
  const s = subject.value.trim()
  const out: Lint[] = []
  if (!s) out.push({ level: 'error', text: 'Write a summary.' })
  else {
    const first = s.split(' ')[0] ?? ''
    const verb = imperative[first.toLowerCase()]
    if (header.value.length > 72) out.push({ level: 'error', text: `Header is ${header.value.length} characters, 72 at most.`, subject: true })
    else if (header.value.length > 50) out.push({ level: 'warn', text: 'Header is over 50 characters; aim shorter.' })
    if (verb) out.push({ level: 'warn', text: `Use the imperative: “${verb}”, not “${first}”.` })
    if (/^[A-Z]/.test(s)) out.push({ level: 'warn', text: 'Start the summary in lowercase.' })
    if (s.endsWith('.')) out.push({ level: 'error', text: 'Drop the trailing period.', subject: true })
  }
  if (bodyLines.value.some(l => l.length > 72)) out.push({ level: 'warn', text: 'Body lines over 72 columns are rewrapped.' })
  return out.length ? out : [{ level: 'ok', text: 'Follows Conventional Commits.' }]
})
const errors = computed(() => lints.value.filter(l => l.level === 'error'))
const warnings = computed(() => lints.value.filter(l => l.level === 'warn'))
const verdict = computed(() => errors.value.length ? `${errors.value.length} to fix` : warnings.value.length ? `${warnings.value.length} suggestion${warnings.value.length > 1 ? 's' : ''}` : 'Ready')
const subjectError = computed(() => errors.value.find(l => l.subject)?.text)
</script>

<style scoped>
.cme { container: cme / inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.cme__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.cme__body { display: grid; gap: 14px; }
@container cme (min-width: 860px) { .cme__body { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; } }
.cme__form, .cme__side { display: grid; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.cme__prefix { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.cme__mono :deep(input), .cme__mono :deep(textarea) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13.5px; }

.cme__ruler { position: relative; height: 4px; margin-top: -4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.cme__fill { position: absolute; inset: 0; border-radius: inherit; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-2) var(--mi-ease); }
.cme__fill.is-long { background: var(--mi-orange); }
.cme__tick { position: absolute; inset: 0 auto 0 calc(50 / 72 * 100%); width: 2px; background: var(--mi-card); }

.cme__lint { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: 13px; }
.cme__lint li { display: flex; align-items: flex-start; gap: 8px; color: var(--mi-label2); }
.cme__lint li :deep(svg) { flex: none; margin-top: 1px; }
.cme__lint .is-ok :deep(svg) { color: var(--mi-green); }
.cme__lint .is-warn :deep(svg) { color: var(--mi-orange); }
.cme__lint .is-error { color: var(--mi-red-t); }
.cme__status { min-height: 18px; margin: 0; font-size: 13px; color: var(--mi-label2); overflow-wrap: anywhere; }
</style>
