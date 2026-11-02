<template>
  <div class="nrr-cq">
    <section class="nrr" aria-labelledby="nrr-title">
      <header class="nrr__head">
        <div class="nrr__title">
          <MiText id="nrr-title" as="h2" variant="headline" weight="semibold">Billing issues</MiText>
          <MiText variant="caption" tone="label2" tabular>214 issues · 38 open</MiText>
        </div>
        <MiSearch v-model="query" placeholder="Search issues" :cancelable="false" aria-label="Search issues" class="nrr__search" />
        <div class="nrr__chips" role="group" aria-label="Active filters">
          <MiChip
            v-for="f in activeFilters" :key="f.id" removable size="small" tone="neutral"
            :remove-label="`Remove filter ${f.label}`" @remove="drop(f.id)"
          >
            {{ f.label }}<span v-if="!results.length && regain(f.id) > 0" class="nrr__regain">+{{ regain(f.id) }}</span>
          </MiChip>
          <MiButton v-if="removed.length" variant="plain" size="mini" @click="removed = []">Restore filters</MiButton>
        </div>
      </header>

      <!-- Results come back as soon as a filter or a correction lets them through. -->
      <div v-if="results.length" class="nrr__found">
      <MiText variant="footnote" tone="label2" tabular aria-live="polite">{{ results.length }} {{ results.length === 1 ? 'issue' : 'issues' }} match “{{ query.trim() }}”</MiText>
      <ul class="nrr__results" :aria-label="`${results.length} results`">
        <li v-for="i in results" :key="i.id">
          <span class="nrr__dot" :class="'is-' + i.status" :aria-label="i.status === 'open' ? 'Open' : 'Closed'" role="img" />
          <div class="nrr__res-body">
            <MiText variant="subheadline" weight="medium" :lines="2">{{ i.title }}</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ i.id }} · {{ i.labels.join(', ') }} · updated {{ i.updated === 1 ? 'yesterday' : i.updated + ' days ago' }}</MiText>
          </div>
          <MiAvatar :name="i.assignee" size="xs" tone="auto" />
        </li>
      </ul>
      </div>

      <div v-else class="nrr__empty">
        <div class="nrr__why">
          <div class="nrr__lead" aria-live="polite">
            <MiText as="h3" variant="title3" weight="semibold" balance>No issues match “{{ query.trim() || '…' }}”</MiText>
            <MiText variant="footnote" tone="label2">
              <template v-if="culprit">
                <strong class="nrr__strong">{{ culprit.label }}</strong> removed the last {{ culprit.before }}
                {{ culprit.before === 1 ? 'issue' : 'issues' }}. Each chip above shows what removing it brings back.
              </template>
              <template v-else>None of the words matched an issue title in this project.</template>
            </MiText>
          </div>

          <div v-if="suggestion" class="nrr__fix">
            <MiIcon name="pencil" :size="16" />
            <MiText variant="footnote" class="nrr__fix-text">
              Nothing contains <s>{{ suggestion.from }}</s>, so it was ignored. Did you mean
              <button type="button" class="nrr__fix-btn" @click="applyFix">{{ suggestion.query }}</button>?
            </MiText>
          </div>

          <!-- The funnel: how many issues survive each step, so the one that empties the list is obvious. -->
          <div v-if="funnelMax" class="nrr__funnel-wrap">
          <MiText id="nrr-funnel" as="h4" variant="footnote" weight="semibold" tone="label2" class="nrr__funnel-title">Where the {{ funnelMax }} matches went</MiText>
          <ol class="nrr__funnel" aria-labelledby="nrr-funnel">
            <li v-for="s in funnel" :key="s.label" :class="{ 'is-zero': s.count === 0, 'is-culprit': culprit && s.label === culprit.label }">
              <span class="nrr__step">{{ s.label }}</span>
              <span class="nrr__bar"><i :style="{ transform: `scaleX(${funnelMax ? s.count / funnelMax : 0})` }" /></span>
              <span class="nrr__count">{{ s.count }}</span>
            </li>
          </ol>
          </div>
        </div>

        <aside class="nrr__else" aria-labelledby="nrr-else">
          <MiText id="nrr-else" as="h3" variant="footnote" weight="semibold" tone="label2" class="nrr__else-title">Nearby, outside this search</MiText>
          <ul>
            <li v-for="n in nearby" :key="n.title">
              <a href="#" class="nrr__near" @click.prevent>
                <span class="nrr__near-icon"><MiIcon :name="n.icon" :size="16" /></span>
                <span class="nrr__near-text">
                  <span class="nrr__near-scope">{{ n.scope }}</span>
                  <span class="nrr__near-title">{{ n.title }}</span>
                </span>
                <MiIcon name="chevron-right" :size="14" class="nrr__near-go" />
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Issue { id: string, title: string, status: 'open' | 'closed', labels: string[], assignee: string, updated: number }
type FilterId = 'open' | 'billing' | 'mine' | 'recent'

const ME = 'Noor Haddad'
// Sample project data; `updated` is days since the last change.
const ISSUES: Issue[] = [
  { id: 'BIL-412', title: 'Invoice PDF export times out above 500 lines', status: 'open', labels: ['billing', 'export'], assignee: 'Kai Lindgren', updated: 2 },
  { id: 'BIL-409', title: 'Invoice export to CSV drops the VAT column', status: 'open', labels: ['billing', 'export'], assignee: 'Ama Mensah', updated: 5 },
  { id: 'BIL-401', title: 'Invoice numbering resets after a fiscal year change', status: 'open', labels: ['billing'], assignee: 'Kai Lindgren', updated: 12 },
  { id: 'BIL-398', title: 'Credit note is not linked to its original invoice', status: 'open', labels: ['billing'], assignee: 'Ama Mensah', updated: 3 },
  { id: 'BIL-395', title: 'Invoice emails land in spam for Outlook tenants', status: 'open', labels: ['email'], assignee: 'Lior Ben-David', updated: 4 },
  { id: 'BIL-390', title: 'Bulk invoice export stalls at 99%', status: 'closed', labels: ['billing', 'export'], assignee: ME, updated: 6 },
  { id: 'BIL-388', title: 'Draft invoices visible in the client portal', status: 'closed', labels: ['billing', 'security'], assignee: 'Ama Mensah', updated: 20 },
  { id: 'BIL-380', title: 'Invoice due date ignores customer payment terms', status: 'open', labels: ['billing'], assignee: 'Lior Ben-David', updated: 9 },
  { id: 'BIL-377', title: 'Export invoices to DATEV format', status: 'open', labels: ['integrations', 'export'], assignee: ME, updated: 25 },
  { id: 'BIL-371', title: 'Invoice template preview misaligns the logo', status: 'closed', labels: ['ui'], assignee: 'Kai Lindgren', updated: 2 },
  { id: 'BIL-366', title: 'Currency rounding on multi-line invoices', status: 'open', labels: ['billing'], assignee: 'Kai Lindgren', updated: 40 },
  { id: 'BIL-360', title: 'Invoice export filename uses the UTC date', status: 'open', labels: ['export'], assignee: 'Lior Ben-David', updated: 1 },
  { id: 'BIL-415', title: 'Payment reminders sent twice on Mondays', status: 'open', labels: ['billing'], assignee: ME, updated: 1 },
  { id: 'BIL-405', title: 'Stripe webhook retries flood the log', status: 'open', labels: ['integrations'], assignee: 'Kai Lindgren', updated: 2 }
]

const FILTERS: { id: FilterId, label: string, test: (i: Issue) => boolean }[] = [
  { id: 'open', label: 'Status: Open', test: i => i.status === 'open' },
  { id: 'billing', label: 'Label: billing', test: i => i.labels.includes('billing') },
  { id: 'mine', label: 'Assignee: Me', test: i => i.assignee === ME },
  { id: 'recent', label: 'Updated: 7 days', test: i => i.updated <= 7 }
]

const query = ref('invoice exprot')
const removed = ref<FilterId[]>([])
const activeFilters = computed(() => FILTERS.filter(f => !removed.value.includes(f.id)))
const drop = (id: FilterId) => { removed.value = [...removed.value, id] }

// Words that appear nowhere in the project are ignored rather than emptying the search, and flagged.
const vocabulary = [...new Set(ISSUES.flatMap(i => i.title.toLowerCase().match(/[a-z]+/g) ?? []))]
const terms = computed(() => query.value.toLowerCase().match(/[a-z0-9%]+/g) ?? [])
const known = computed(() => terms.value.filter(t => vocabulary.some(w => w.includes(t))))
const unknown = computed(() => terms.value.filter(t => !known.value.includes(t)))

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]!
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]!
}
const suggestion = computed(() => {
  const from = unknown.value[0]
  if (!from) return null
  const best = vocabulary.map(w => ({ w, d: distance(from, w) })).filter(c => c.d <= 2).sort((a, b) => a.d - b.d)[0]
  return best ? { from, to: best.w, query: query.value.toLowerCase().replace(from, best.w) } : null
})
const applyFix = () => { if (suggestion.value) query.value = suggestion.value.query }

const textMatch = computed(() => ISSUES.filter(i => known.value.length > 0 && known.value.every(t => i.title.toLowerCase().includes(t))))
const pass = (list: Issue[], skip?: FilterId) => list.filter(i => activeFilters.value.every(f => f.id === skip || f.test(i)))
const results = computed(() => pass(textMatch.value))
const regain = (id: FilterId) => pass(textMatch.value, id).length

const funnel = computed(() => {
  const steps = [{ label: known.value.length ? `Matches “${known.value.join(' ')}”` : 'Matches your words', count: textMatch.value.length }]
  let list = textMatch.value
  for (const f of activeFilters.value) {
    list = list.filter(f.test)
    steps.push({ label: f.label, count: list.length })
  }
  return steps
})
const funnelMax = computed(() => funnel.value[0]?.count ?? 0)
const culprit = computed(() => {
  const i = funnel.value.findIndex(s => s.count === 0)
  return i > 0 ? { label: funnel.value[i]!.label, before: funnel.value[i - 1]!.count } : null
})

const nearby = [
  { scope: 'Help center', title: 'Exporting invoices in bulk', icon: 'document' as const },
  { scope: 'Payments API project', title: 'PAY-88 Invoice export endpoint returns 504', icon: 'folder' as const },
  { scope: 'Discussions', title: 'Which columns should the invoice CSV keep?', icon: 'chat' as const }
]
</script>

<style scoped>
.nrr-cq { container-type: inline-size; }
.nrr { display: grid; gap: 20px; max-width: 920px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); font-family: var(--mi-font); color: var(--mi-label); }

.nrr__head { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--mi-sep); }
.nrr__title { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.nrr__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.nrr__regain { margin-left: 6px; padding: 0 5px; border-radius: 5px; font-size: 11px; font-weight: 700; color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); font-variant-numeric: tabular-nums; }

.nrr__empty { display: grid; gap: 20px; }
.nrr__why { display: grid; align-content: start; gap: 16px; min-width: 0; }
.nrr__lead { display: grid; gap: 6px; }
.nrr__strong { font-weight: 600; color: var(--mi-label); }

.nrr__fix { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); color: var(--mi-p-text); background: var(--mi-p-tint); }
.nrr__fix > :first-child { flex: none; margin-top: 2px; }
.nrr__fix-text { color: var(--mi-label); }
.nrr__fix-text s { text-decoration-color: var(--mi-red); color: var(--mi-label2); }
.nrr__fix-btn { padding: 0; border: 0; background: none; font: inherit; font-weight: 650; color: var(--mi-p-text); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; cursor: pointer; border-radius: 3px; }
.nrr__fix-btn:hover { text-decoration-thickness: 2.5px; }
.nrr__fix-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.nrr__funnel-wrap { display: grid; gap: 4px; }
.nrr__funnel-title { padding-inline: 10px; }
.nrr__funnel { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.nrr__funnel li { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 2.5ch; grid-template-areas: "step count" "bar bar"; align-items: center; gap: 4px 12px; padding: 8px 10px 9px; border-radius: var(--mi-radius-m); }
.nrr__step { grid-area: step; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--mi-label2); }
.nrr__bar { grid-area: bar; height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.nrr__bar i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.nrr__count { grid-area: count; text-align: end; font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; }
.nrr__funnel li.is-zero .nrr__count { color: var(--mi-label3); }
.nrr__funnel li.is-culprit { background: color-mix(in srgb, var(--mi-red) 8%, transparent); }
.nrr__funnel li.is-culprit .nrr__step { color: var(--mi-label); font-weight: 600; }
.nrr__funnel li.is-culprit .nrr__count { color: var(--mi-red-t); }

.nrr__else { display: grid; align-content: start; gap: 8px; min-width: 0; }
.nrr__else-title { padding-inline: 4px; }
.nrr__else ul { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.nrr__near { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-l); color: inherit; text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.nrr__near:hover { background: var(--mi-fill4); }
.nrr__near:active { transform: scale(.99); }
.nrr__near:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.nrr__near-icon { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: var(--mi-radius-m); color: var(--mi-label2); background: var(--mi-fill3); }
.nrr__near-text { display: grid; gap: 1px; min-width: 0; flex: 1; }
.nrr__near-scope { font-size: 11.5px; color: var(--mi-label3); }
.nrr__near-title { font-size: 13.5px; font-weight: 550; line-height: 1.3; }
.nrr__near-go { flex: none; color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.nrr__near:hover .nrr__near-go { transform: translateX(2px); }

.nrr__found { display: grid; gap: 4px; }
.nrr__results { display: grid; margin: 0; padding: 0; list-style: none; }
.nrr__results li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 12px 4px; animation: nrr-in var(--mi-dur-4) var(--mi-spring) both; }
.nrr__results li + li { border-top: 1px solid var(--mi-sep); }
.nrr__res-body { display: grid; gap: 2px; min-width: 0; }
.nrr__dot { width: 12px; height: 12px; margin-top: 5px; border-radius: 50%; border: 2px solid var(--mi-green); }
.nrr__dot.is-closed { border-color: var(--mi-label3); background: var(--mi-label3); }
@keyframes nrr-in { from { opacity: 0; transform: translateY(6px); } }
@media (prefers-reduced-motion: reduce) { .nrr__results li { animation: none; } }

@container (min-width: 640px) {
  .nrr { padding: 24px 28px; }
  .nrr__head { grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 14px 20px; }
  .nrr__title { flex-direction: column; gap: 0; }
  .nrr__chips { grid-column: 1 / -1; }
}
@container (min-width: 780px) {
  .nrr__empty { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 32px; }
  .nrr__else { padding-left: 28px; border-left: 1px solid var(--mi-sep); }
}
</style>
