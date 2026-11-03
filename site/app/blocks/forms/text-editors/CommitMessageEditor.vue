<template>
  <section class="mi:@container/cme mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="cme-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="cme-title" as="h2" variant="title3" weight="semibold">Commit message</MiText>
        <MiText variant="footnote" tone="label2">quayside/web · 4 files staged on fix/invoice-rounding</MiText>
      </div>
      <MiBadge :tone="errors.length ? 'danger' : warnings.length ? 'warning' : 'success'" :label="verdict" dot />
    </header>

    <div class="mi:grid mi:gap-3.5 mi:@[860px]/cme:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:@[860px]/cme:items-start">
      <div class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <div class="mi:grid mi:grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)] mi:gap-2.5">
          <MiField label="Type"><MiSelect v-model="type" :options="types" size="sm" /></MiField>
          <MiField label="Scope" hint="Optional"><MiInput v-model="scope" size="sm" placeholder="billing" /></MiField>
        </div>

        <MiField label="Summary" :error="subjectError">
          <template #default="{ id, describedBy }">
            <MiInput :id="id" v-model="subject" class="mi:[&_input]:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]! mi:[&_input]:text-[13.5px]!" :aria-describedby="describedBy" placeholder="round invoice totals per line" />
          </template>
          <template #label-end>
            <MiText variant="caption" tabular :tone="header.length > 72 ? 'red' : header.length > 50 ? 'orange' : 'label3'">{{ header.length }} / 72</MiText>
          </template>
        </MiField>
        <!-- 50/72 ruler: soft target at 50 characters, hard limit at 72. -->
        <div class="mi:relative mi:h-1 mi:-mt-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden" aria-hidden="true">
          <span class="mi:absolute mi:inset-0 mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="header.length > 50 ? 'mi:bg-orange' : 'mi:bg-green'" :style="{ transform: `scaleX(${Math.min(header.length, 72) / 72})` }" />
          <span class="mi:absolute mi:top-0 mi:right-auto mi:bottom-0 mi:left-[calc(50_/_72_*_100%)] mi:w-0.5 mi:bg-card" />
        </div>

        <MiField label="Body" hint="Why the change, not how. Wrap at 72 columns.">
          <template #default="{ id, describedBy }">
            <MiTextarea :id="id" v-model="body" class="mi:[&_textarea]:font-[ui-monospace,_SFMono-Regular,_Menlo,_monospace]! mi:[&_textarea]:text-[13.5px]!" :rows="4" :max-rows="9" :aria-describedby="describedBy" />
          </template>
        </MiField>

        <MiCheckbox v-model="breaking" label="Breaking change" description="Adds a ! to the header and a BREAKING CHANGE footer" />
        <MiField label="Closes issue">
          <MiInput v-model="issue" size="sm" prefix="#" inputmode="numeric" placeholder="1482" />
        </MiField>
      </div>

      <div class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:min-w-0">
        <MiCodeBlock :code="message" filename="COMMIT_EDITMSG" size="sm" />
        <ul class="mi:grid mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[13px]" aria-label="Message checks">
          <li class="mi:flex mi:[align-items:flex-start] mi:gap-2" v-for="l in lints" :key="l.text" :class="l.level === 'error' ? 'mi:text-red-t' : 'mi:text-label2'">
            <MiIcon class="mi:flex-none mi:mt-px" :class="l.level === 'ok' ? 'mi:text-green' : l.level === 'warn' ? 'mi:text-orange' : ''" :name="l.level === 'ok' ? 'check-circle' : l.level === 'error' ? 'x-circle-fill' : 'warning'" :size="15" />{{ l.text }}
          </li>
        </ul>
        <MiButton block :disabled="errors.length > 0" @click="committed = true">Commit 4 files</MiButton>
        <p class="mi:min-h-4.5 mi:m-0 mi:text-[13px] mi:text-label2 mi:wrap-anywhere" role="status" aria-live="polite">{{ committed ? `Committed as 3f9c2e1: ${header}` : '' }}</p>
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
