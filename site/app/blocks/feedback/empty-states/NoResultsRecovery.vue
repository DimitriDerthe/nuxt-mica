<template>
  <div class="mi:@container">
    <section class="mi:grid mi:gap-5 mi:max-w-230 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:font-mi mi:text-label mi:@[640px]:py-6 mi:@[640px]:px-7" aria-labelledby="nrr-title">
      <header class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:pb-4 mi:border-b mi:border-b-sep mi:@[640px]:grid-cols-[auto_minmax(0,_1fr)] mi:@[640px]:items-center mi:@[640px]:gap-y-3.5 mi:@[640px]:gap-x-5">
        <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2 mi:@[640px]:flex-col mi:@[640px]:gap-0">
          <MiText id="nrr-title" as="h2" variant="headline" weight="semibold">Billing issues</MiText>
          <MiText variant="caption" tone="label2" tabular>214 issues · 38 open</MiText>
        </div>
        <MiSearch v-model="query" placeholder="Search issues" :cancelable="false" aria-label="Search issues" />
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:@[640px]:col-span-full" role="group" aria-label="Active filters">
          <MiChip
            v-for="f in activeFilters" :key="f.id" removable size="small" tone="neutral"
            :remove-label="`Remove filter ${f.label}`" @remove="drop(f.id)"
          >
            {{ f.label }}<span v-if="!results.length && regain(f.id) > 0" class="mi:ml-1.5 mi:py-0 mi:px-[5px] mi:rounded-[5px] mi:text-[11px] mi:font-bold mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_14%,_transparent)] mi:tabular-nums">+{{ regain(f.id) }}</span>
          </MiChip>
          <MiButton v-if="removed.length" variant="plain" size="mini" @click="removed = []">Restore filters</MiButton>
        </div>
      </header>

      <!-- Results come back as soon as a filter or a correction lets them through. -->
      <div v-if="results.length" class="mi:grid mi:gap-1">
      <MiText variant="footnote" tone="label2" tabular aria-live="polite">{{ results.length }} {{ results.length === 1 ? 'issue' : 'issues' }} match “{{ query.trim() }}”</MiText>
      <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" :aria-label="`${results.length} results`">
        <li class="mi:grid mi:items-start mi:[--mi-in-y:6px] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:not-first:border-t mi:not-first:border-t-sep mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:gap-3 mi:py-3 mi:px-1" v-for="i in results" :key="i.id">
          <span class="mi:w-3 mi:h-3 mi:mt-[5px] mi:rounded-[50%] mi:border-2" :class="i.status === 'closed' ? 'mi:border-label3 mi:[background:var(--mi-label3)]' : 'mi:border-green'" :aria-label="i.status === 'open' ? 'Open' : 'Closed'" role="img" />
          <div class="mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText variant="subheadline" weight="medium" :lines="2">{{ i.title }}</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ i.id }} · {{ i.labels.join(', ') }} · updated {{ i.updated === 1 ? 'yesterday' : i.updated + ' days ago' }}</MiText>
          </div>
          <MiAvatar :name="i.assignee" size="xs" tone="auto" />
        </li>
      </ul>
      </div>

      <div v-else class="mi:grid mi:gap-5 mi:@[780px]:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)] mi:@[780px]:gap-8">
        <div class="mi:grid mi:content-start mi:gap-4 mi:min-w-0">
          <div class="mi:grid mi:gap-1.5" aria-live="polite">
            <MiText as="h3" variant="title3" weight="semibold" balance>No issues match “{{ query.trim() || '…' }}”</MiText>
            <MiText variant="footnote" tone="label2">
              <template v-if="culprit">
                <strong class="mi:font-semibold mi:text-label">{{ culprit.label }}</strong> removed the last {{ culprit.before }}
                {{ culprit.before === 1 ? 'issue' : 'issues' }}. Each chip above shows what removing it brings back.
              </template>
              <template v-else>None of the words matched an issue title in this project.</template>
            </MiText>
          </div>

          <div v-if="suggestion" class="mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:text-p-text mi:[background:var(--mi-p-tint)]">
            <MiIcon name="pencil" :size="16" class="mi:mt-0.5" />
            <MiText variant="footnote" class="mi:text-label">
              Nothing contains <s class="mi:text-label2 mi:decoration-red">{{ suggestion.from }}</s>, so it was ignored. Did you mean
              <button type="button" class="mi:[font:inherit] mi:font-650 mi:underline mi:decoration-[1.5px] mi:hover:decoration-[2.5px] mi:p-0 mi:[border:0] mi:[background:none] mi:text-p-text mi:underline-offset-[3px] mi:cursor-pointer mi:rounded-[3px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="applyFix">{{ suggestion.query }}</button>?
            </MiText>
          </div>

          <!-- The funnel: how many issues survive each step, so the one that empties the list is obvious. -->
          <div v-if="funnelMax" class="mi:grid mi:gap-1">
          <MiText id="nrr-funnel" as="h4" variant="footnote" weight="semibold" tone="label2" class="mi:px-2.5">Where the {{ funnelMax }} matches went</MiText>
          <ol class="mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-labelledby="nrr-funnel">
            <li class="mi:grid mi:rounded-md mi:relative mi:grid-cols-[minmax(0,_1fr)_2.5ch] mi:[grid-template-areas:'step_count'_'bar_bar'] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:pt-2 mi:px-2.5 mi:pb-[9px]" v-for="s in funnel" :key="s.label" :class="culprit && s.label === culprit.label ? 'mi:bg-red/8' : ''">
              <span class="mi:[grid-area:step] mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[13px]" :class="culprit && s.label === culprit.label ? 'mi:text-label mi:font-semibold' : 'mi:text-label2'">{{ s.label }}</span>
              <span class="mi:[grid-area:bar] mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><i class="mi:block mi:rounded-[inherit] mi:h-full mi:[background:var(--mi-p)] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :style="{ transform: `scaleX(${funnelMax ? s.count / funnelMax : 0})` }" /></span>
              <span class="mi:[grid-area:count] mi:text-end mi:text-[13px] mi:font-650 mi:tabular-nums" :class="culprit && s.label === culprit.label ? 'mi:text-red-t' : s.count === 0 ? 'mi:text-label3' : ''">{{ s.count }}</span>
            </li>
          </ol>
          </div>
        </div>

        <aside class="mi:grid mi:content-start mi:gap-2 mi:min-w-0 mi:@[780px]:pl-7 mi:@[780px]:border-l mi:@[780px]:border-l-sep" aria-labelledby="nrr-else">
          <MiText id="nrr-else" as="h3" variant="footnote" weight="semibold" tone="label2" class="mi:px-1">Nearby, outside this search</MiText>
          <ul class="mi:grid mi:m-0 mi:gap-1.5 mi:p-0 mi:[list-style:none]">
            <li v-for="n in nearby" :key="n.title">
              <a href="#" class="mi:group mi:flex mi:items-center mi:gap-3 mi:py-[11px] mi:px-3 mi:border mi:border-sep mi:rounded-lg mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:[background:var(--mi-fill4)] mi:active:transform-[scale(.99)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click.prevent>
                <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-8 mi:h-8 mi:rounded-md mi:text-label2 mi:[background:var(--mi-fill3)]"><MiIcon :name="n.icon" :size="16" /></span>
                <span class="mi:grid mi:gap-px mi:min-w-0 mi:flex-1">
                  <span class="mi:text-[11.5px] mi:text-label3">{{ n.scope }}</span>
                  <span class="mi:text-[13.5px] mi:font-550 mi:leading-[1.3]">{{ n.title }}</span>
                </span>
                <MiIcon name="chevron-right" :size="14" class="mi:group-hover:transform-[translateX(2px)] mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" />
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
