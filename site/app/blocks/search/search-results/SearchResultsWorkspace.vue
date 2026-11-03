<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="srw-title">
    <header class="mi:grid mi:gap-3.5 mi:@[760px]:grid-cols-[1fr_minmax(0,_420px)] mi:@[760px]:items-end">
      <div class="mi:grid mi:gap-0.5">
        <MiText id="srw-title" variant="title3" as="h2" weight="semibold">Search Halyard</MiText>
        <MiText variant="footnote" tone="label2">Docs, issues, people and code in the Platform workspace</MiText>
      </div>
      <MiSearch v-model="query" placeholder="Search docs, issues, people, code" aria-label="Search the workspace" :cancelable="false" />
    </header>

    <div class="mi:grid mi:gap-5 mi:min-w-0 mi:@[760px]:grid-cols-[220px_minmax(0,_1fr)] mi:@[760px]:gap-7">
      <!-- Facet rail: a scrolling pill row on phones, a ruled list with counts from tablet width. -->
      <aside class="mi:grid mi:gap-2.5 mi:content-start mi:min-w-0" aria-label="Refine results">
        <MiText variant="caption" tone="label3" weight="semibold" class="mi:uppercase mi:tracking-[.06em]! mi:mt-1!">Type</MiText>
        <div class="mi:flex mi:gap-1.5 mi:overflow-x-auto mi:pb-0.5 mi:[scrollbar-width:none] mi:@[760px]:grid mi:@[760px]:overflow-visible mi:@[760px]:gap-0.5" role="group" aria-label="Result type">
          <button
            v-for="f in facets" :key="f.id" type="button" class="mi:[font:inherit] mi:text-[13px] mi:font-medium mi:[&:hover:not([aria-pressed=true])]:text-label mi:aria-pressed:text-p-text mi:inline-flex mi:flex-[none] mi:items-center mi:justify-between mi:gap-2 mi:min-h-8 mi:py-0 mi:px-3 mi:border mi:border-sep mi:rounded-[999px] mi:[background:var(--mi-card)] mi:text-label2 mi:cursor-pointer mi:[transition:background-color_var(--mi-dur-2)_var(--mi-ease),_color_var(--mi-dur-2)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:aria-pressed:[background:var(--mi-p-tint)] mi:aria-pressed:border-transparent mi:@[760px]:[border:0] mi:@[760px]:rounded-md mi:@[760px]:[background:transparent] mi:@[760px]:min-h-8.5"
            :aria-pressed="kind === f.id" @click="kind = f.id"
          >
            <span>{{ f.label }}</span>
            <span class="mi:tabular-nums mi:text-[12px]" :class="kind === f.id ? 'mi:text-inherit' : 'mi:text-label3'">{{ f.count }}</span>
          </button>
        </div>
        <MiText variant="caption" tone="label3" weight="semibold" class="mi:uppercase mi:tracking-[.06em]! mi:mt-1!">Updated</MiText>
        <MiSegmented v-model="since" label="Updated within" :options="windows" />
        <MiText variant="caption" tone="label3" weight="semibold" class="mi:uppercase mi:tracking-[.06em]! mi:mt-1!">Sort by</MiText>
        <MiSegmented v-model="sort" label="Sort results" :options="sorts" />
      </aside>

      <div class="mi:grid mi:gap-4.5 mi:content-start mi:min-w-0">
        <p class="mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">
          <strong class="mi:text-label mi:tabular-nums">{{ visible.length }}</strong> {{ visible.length === 1 ? 'result' : 'results' }}
          <template v-if="terms.length"> for “{{ query.trim() }}”</template>
          <span class="mi:text-label3">· {{ 18 + visible.length * 3 }} ms</span>
        </p>

        <!-- Best match: the top document, given room to answer the question on its own. -->
        <article v-if="best" class="mi:relative mi:grid mi:gap-2 mi:py-4.5 mi:px-5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-auto mi:before:bottom-0 mi:before:left-0 mi:before:w-[3px] mi:before:[background:linear-gradient(var(--mi-p),_var(--mi-s))]">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3">
            <MiBadge tone="primary" label="Best match" dot />
            <MiText variant="caption" tone="label2">{{ best.path }}</MiText>
          </div>
          <MiText variant="headline" as="h3">
            <template v-for="(part, i) in mark(best.title)" :key="i"><mark v-if="part.hit" class="mi:bg-p/16 mi:text-inherit mi:rounded-[3px] mi:py-0 mi:px-0.5 mi:[-webkit-box-decoration-break:clone] mi:[box-decoration-break:clone]">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
          </MiText>
          <p class="mi:m-0 mi:text-[15px] mi:leading-[1.55] mi:text-label2">
            <template v-for="(part, i) in mark(best.snippet)" :key="i"><mark v-if="part.hit" class="mi:bg-p/16 mi:text-inherit mi:rounded-[3px] mi:py-0 mi:px-0.5 mi:[-webkit-box-decoration-break:clone] mi:[box-decoration-break:clone]">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
          </p>
          <MiTextLink href="#">Open the page</MiTextLink>
        </article>

        <div v-for="g in groups" :key="g.id" class="mi:grid mi:gap-1.5">
          <MiText variant="subheadline" as="h3" weight="semibold" class="mi:flex mi:items-center mi:gap-2">
            {{ g.label }} <span class="mi:text-[12px] mi:font-medium mi:text-label3 mi:tabular-nums">{{ g.items.length }}</span>
          </MiText>
          <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
            <li v-for="r in g.items" :key="r.id" class="mi:relative mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-y-1 mi:gap-x-3 mi:pt-3.5 mi:pr-4 mi:pb-3.5 mi:pl-4.5 mi:not-first:border-t mi:not-first:border-t-sep mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
              <!-- Relevance spine: the bar height is the score, read alongside the row. -->
              <span class="mi:absolute mi:left-1.5 mi:top-4 mi:bottom-4 mi:w-[3px] mi:rounded-[2px] mi:[background:var(--mi-fill4)] mi:overflow-hidden" aria-hidden="true"><span class="mi:block mi:bg-p mi:h-full mi:origin-bottom mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleY(${r.score})` }" /></span>
              <MiAvatar v-if="r.kind === 'person'" :name="r.title" size="sm" tone="auto" decorative />
              <span v-else class="mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-md mi:[background:var(--mi-fill3)] mi:text-label2 mi:data-[kind=issue]:bg-green/14 mi:data-[kind=issue]:text-green-t mi:data-[kind=code]:bg-p-tint mi:data-[kind=code]:text-p-text" :data-kind="r.kind"><MiIcon :svg="glyphs[r.kind]" :size="16" /></span>
              <div class="mi:grid mi:gap-0.5 mi:min-w-0">
                <a href="#" class="mi:text-[15px] mi:font-semibold mi:text-label mi:[text-decoration:none] mi:wrap-anywhere mi:hover:text-p-text mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:rounded-[4px]">
                  <template v-for="(part, i) in mark(r.title)" :key="i"><mark v-if="part.hit" class="mi:bg-p/16 mi:text-inherit mi:rounded-[3px] mi:py-0 mi:px-0.5 mi:[-webkit-box-decoration-break:clone] mi:[box-decoration-break:clone]">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                </a>
                <MiText variant="caption" tone="label3" :lines="1">{{ r.path }}</MiText>
                <p class="mi:mt-1 mi:mx-0 mi:mb-0 mi:text-[14px] mi:leading-normal mi:text-label2 mi:wrap-anywhere">
                  <template v-for="(part, i) in mark(r.snippet)" :key="i"><mark v-if="part.hit" class="mi:bg-p/16 mi:text-inherit mi:rounded-[3px] mi:py-0 mi:px-0.5 mi:[-webkit-box-decoration-break:clone] mi:[box-decoration-break:clone]">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                </p>
              </div>
              <div class="mi:col-[2] mi:flex mi:items-center mi:gap-2.5 mi:@[560px]:col-[auto] mi:@[560px]:flex-col mi:@[560px]:[align-items:flex-end] mi:@[560px]:gap-1.5">
                <MiBadge v-if="r.state" :tone="r.state === 'Open' ? 'success' : 'neutral'" :label="r.state" variant="outline" />
                <MiText variant="caption2" tone="label3">{{ ago(r.updated) }}</MiText>
              </div>
            </li>
          </ul>
        </div>

        <MiEmptyState
          v-if="!visible.length" icon="search" title="Nothing matches yet"
          description="Try a broader term, another type or a longer time window."
          primary-label="Clear filters" @primary="reset"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'doc' | 'issue' | 'person' | 'code'
interface Result { id: number, kind: Kind, title: string, path: string, snippet: string, updated: number, score: number, state?: 'Open' | 'Closed' }

// Sample index; swap for your search API.
const results: Result[] = [
  { id: 1, kind: 'doc', title: 'Rate limits and quotas', path: 'Docs › API reference › Limits', snippet: 'Every API key gets a rate limit of 600 requests per minute, measured on a sliding window. Bursts above the limit return 429 with a Retry-After header.', updated: 3, score: 0.96 },
  { id: 2, kind: 'doc', title: 'Handling 429 responses with backoff', path: 'Docs › Guides › Reliability', snippet: 'Retry with jitter when you hit the rate limit; the official SDKs do this for you from version 4.2.', updated: 12, score: 0.88 },
  { id: 3, kind: 'doc', title: 'Custom rate limits on the Scale plan', path: 'Docs › Plans › Scale', snippet: 'Scale workspaces can request a custom rate limit of up to 6,000 requests per minute per key.', updated: 41, score: 0.74 },
  { id: 4, kind: 'doc', title: 'Webhook delivery and retries', path: 'Docs › Webhooks', snippet: 'Webhook deliveries do not count against your rate limit; retries back off after five failed attempts.', updated: 64, score: 0.52 },
  { id: 5, kind: 'issue', title: '#2184 Bulk import hits the rate limit after 10k rows', path: 'Issues › Importer', snippet: 'The importer sends rows one by one and trips the rate limit; batching pages of 500 keeps it under.', updated: 1, score: 0.91, state: 'Open' },
  { id: 6, kind: 'issue', title: '#2131 Rate limit headers missing on streaming endpoints', path: 'Issues › Gateway', snippet: 'X-RateLimit-Remaining is not sent on /v2/stream, so clients cannot pace themselves.', updated: 6, score: 0.83, state: 'Open' },
  { id: 7, kind: 'issue', title: '#1979 Sandbox keys show the wrong limit', path: 'Issues › Dashboard', snippet: 'Sandbox keys displayed a rate limit of 600 instead of 60 requests per minute.', updated: 29, score: 0.61, state: 'Closed' },
  { id: 8, kind: 'person', title: 'Inès Moreau', path: 'Platform engineer · owns the gateway', snippet: 'Wrote the sliding window rate limit and answers most limit questions in #api-help.', updated: 2, score: 0.79 },
  { id: 9, kind: 'person', title: 'Kofi Asante', path: 'Developer relations', snippet: 'Maintains the backoff guide and the rate limit examples for the Node and Python SDKs.', updated: 9, score: 0.64 },
  { id: 10, kind: 'code', title: 'gateway/limiter/sliding_window.go', path: 'Code › gateway · Go', snippet: 'func (l *Limiter) Allow(key string) bool checks the rate limit against a 60 s window kept in Redis.', updated: 5, score: 0.86 },
  { id: 11, kind: 'code', title: 'sdk-node/src/retry.ts', path: 'Code › sdk-node · TypeScript', snippet: 'const delay = backoff(attempt) // honours Retry-After when the rate limit is hit', updated: 18, score: 0.7 }
]

const labels: Record<Kind, string> = { doc: 'Docs', issue: 'Issues', person: 'People', code: 'Code' }
const glyphs: Record<Exclude<Kind, 'person'>, string> = {
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  issue: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>',
  code: '<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>'
}

const query = ref('rate limit')
const kind = ref<Kind | 'all'>('all')
const since = ref<string | number | null>('any')
const sort = ref<string | number | null>('relevance')
const windows = [{ value: 'any', label: 'Any' }, { value: 7, label: '7 days' }, { value: 30, label: '30 days' }]
const sorts = [{ value: 'relevance', label: 'Relevance' }, { value: 'recent', label: 'Recent' }]

const terms = computed(() => query.value.toLowerCase().split(/\s+/).filter(Boolean))
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Results that match the query and time window, before the type filter: they feed the facet counts.
const matched = computed(() => results.filter((r) => {
  const hay = `${r.title} ${r.path} ${r.snippet}`.toLowerCase()
  const fresh = since.value === 'any' || r.updated <= Number(since.value)
  return fresh && terms.value.every(t => hay.includes(t))
}))

const facets = computed(() => [
  { id: 'all' as const, label: 'All', count: matched.value.length },
  ...(Object.keys(labels) as Kind[]).map(k => ({ id: k, label: labels[k], count: matched.value.filter(r => r.kind === k).length }))
])

const visible = computed(() => {
  const list = matched.value.filter(r => kind.value === 'all' || r.kind === kind.value)
  return [...list].sort((a, b) => sort.value === 'recent' ? a.updated - b.updated : b.score - a.score)
})

// The best match is the strongest document; it is lifted out of its group.
const best = computed(() => {
  if (kind.value !== 'all' && kind.value !== 'doc') return null
  return visible.value.filter(r => r.kind === 'doc').sort((a, b) => b.score - a.score)[0] ?? null
})

const groups = computed(() => (Object.keys(labels) as Kind[])
  .map(k => ({ id: k, label: labels[k], items: visible.value.filter(r => r.kind === k && r !== best.value) }))
  .filter(g => g.items.length))

function mark(text: string) {
  if (!terms.value.length) return [{ text, hit: false }]
  const re = new RegExp(`(${terms.value.map(escape).join('|')})`, 'gi')
  return text.split(re).filter(Boolean).map(part => ({ text: part, hit: terms.value.includes(part.toLowerCase()) }))
}

const ago = (d: number) => d === 1 ? 'Yesterday' : d < 7 ? `${d} days ago` : d < 30 ? `${Math.round(d / 7)} wk ago` : `${Math.round(d / 30)} mo ago`

function reset() {
  kind.value = 'all'
  since.value = 'any'
  query.value = 'rate limit'
}
</script>

