<template>
  <section class="srw" aria-labelledby="srw-title">
    <header class="srw__head">
      <div class="srw__title">
        <MiText id="srw-title" variant="title3" as="h2" weight="semibold">Search Halyard</MiText>
        <MiText variant="footnote" tone="label2">Docs, issues, people and code in the Platform workspace</MiText>
      </div>
      <MiSearch v-model="query" class="srw__search" placeholder="Search docs, issues, people, code" aria-label="Search the workspace" :cancelable="false" />
    </header>

    <div class="srw__layout">
      <!-- Facet rail: a scrolling pill row on phones, a ruled list with counts from tablet width. -->
      <aside class="srw__rail" aria-label="Refine results">
        <MiText variant="caption" tone="label3" weight="semibold" class="srw__rail-label">Type</MiText>
        <div class="srw__facets" role="group" aria-label="Result type">
          <button
            v-for="f in facets" :key="f.id" type="button" class="srw__facet"
            :aria-pressed="kind === f.id" @click="kind = f.id"
          >
            <span>{{ f.label }}</span>
            <span class="srw__count">{{ f.count }}</span>
          </button>
        </div>
        <MiText variant="caption" tone="label3" weight="semibold" class="srw__rail-label">Updated</MiText>
        <MiSegmented v-model="since" label="Updated within" :options="windows" />
        <MiText variant="caption" tone="label3" weight="semibold" class="srw__rail-label">Sort by</MiText>
        <MiSegmented v-model="sort" label="Sort results" :options="sorts" />
      </aside>

      <div class="srw__main">
        <p class="srw__status" role="status" aria-live="polite">
          <strong>{{ visible.length }}</strong> {{ visible.length === 1 ? 'result' : 'results' }}
          <template v-if="terms.length"> for “{{ query.trim() }}”</template>
          <span class="srw__time">· {{ 18 + visible.length * 3 }} ms</span>
        </p>

        <!-- Best match: the top document, given room to answer the question on its own. -->
        <article v-if="best" class="srw__best">
          <div class="srw__best-top">
            <MiBadge tone="primary" label="Best match" dot />
            <MiText variant="caption" tone="label2">{{ best.path }}</MiText>
          </div>
          <MiText variant="headline" as="h3">
            <template v-for="(part, i) in mark(best.title)" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
          </MiText>
          <p class="srw__best-text">
            <template v-for="(part, i) in mark(best.snippet)" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
          </p>
          <MiTextLink href="#">Open the page</MiTextLink>
        </article>

        <div v-for="g in groups" :key="g.id" class="srw__group">
          <MiText variant="subheadline" as="h3" weight="semibold" class="srw__group-title">
            {{ g.label }} <span class="srw__group-n">{{ g.items.length }}</span>
          </MiText>
          <ul class="srw__list">
            <li v-for="r in g.items" :key="r.id" class="srw__row">
              <!-- Relevance spine: the bar height is the score, read alongside the row. -->
              <span class="srw__spine" aria-hidden="true"><span :style="{ transform: `scaleY(${r.score})` }" /></span>
              <MiAvatar v-if="r.kind === 'person'" :name="r.title" size="sm" tone="auto" decorative />
              <span v-else class="srw__glyph" :data-kind="r.kind"><MiIcon :svg="glyphs[r.kind]" :size="16" /></span>
              <div class="srw__body">
                <a href="#" class="srw__link">
                  <template v-for="(part, i) in mark(r.title)" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                </a>
                <MiText variant="caption" tone="label3" :lines="1">{{ r.path }}</MiText>
                <p class="srw__snippet">
                  <template v-for="(part, i) in mark(r.snippet)" :key="i"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                </p>
              </div>
              <div class="srw__meta">
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

<style scoped>
.srw { container-type: inline-size; display: grid; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.srw__head { display: grid; gap: 14px; }
.srw__title { display: grid; gap: 2px; }
@container (min-width: 760px) { .srw__head { grid-template-columns: 1fr minmax(0, 420px); align-items: end; } }

.srw__layout { display: grid; gap: 20px; min-width: 0; }
@container (min-width: 760px) { .srw__layout { grid-template-columns: 220px minmax(0, 1fr); gap: 28px; } }

.srw__rail { display: grid; gap: 10px; align-content: start; min-width: 0; }
.srw__rail-label { text-transform: uppercase; letter-spacing: .06em; margin-top: 4px; }
.srw__facets { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.srw__facet {
  display: inline-flex; flex: none; align-items: center; justify-content: space-between; gap: 8px; min-height: 32px; padding: 0 12px;
  border: 1px solid var(--mi-sep); border-radius: 999px; background: var(--mi-card); color: var(--mi-label2);
  font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; transition: background-color var(--mi-dur-2) var(--mi-ease), color var(--mi-dur-2) var(--mi-ease);
}
.srw__facet:hover { color: var(--mi-label); }
.srw__facet:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.srw__facet[aria-pressed="true"] { background: var(--mi-p-tint); border-color: transparent; color: var(--mi-p-text); }
.srw__count { font-variant-numeric: tabular-nums; font-size: 12px; color: var(--mi-label3); }
.srw__facet[aria-pressed="true"] .srw__count { color: inherit; }
@container (min-width: 760px) {
  .srw__facets { display: grid; overflow: visible; gap: 2px; }
  .srw__facet { border: 0; border-radius: var(--mi-radius-m); background: transparent; min-height: 34px; }
}

.srw__main { display: grid; gap: 18px; align-content: start; min-width: 0; }
.srw__status { margin: 0; font-size: 13px; color: var(--mi-label2); }
.srw__status strong { color: var(--mi-label); font-variant-numeric: tabular-nums; }
.srw__time { color: var(--mi-label3); }

mark { background: color-mix(in srgb, var(--mi-p) 16%, transparent); color: inherit; border-radius: 3px; padding: 0 2px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }

.srw__best {
  position: relative; display: grid; gap: 8px; padding: 18px 20px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.srw__best::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 3px; background: linear-gradient(var(--mi-p), var(--mi-s)); }
.srw__best-top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.srw__best-text { margin: 0; font-size: 15px; line-height: 1.55; color: var(--mi-label2); }

.srw__group { display: grid; gap: 6px; }
.srw__group-title { display: flex; align-items: center; gap: 8px; }
.srw__group-n { font-size: 12px; font-weight: 500; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.srw__list { list-style: none; margin: 0; padding: 0; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.srw__row { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 12px; padding: 14px 16px 14px 18px; }
.srw__row + .srw__row { border-top: 1px solid var(--mi-sep); }
@container (min-width: 560px) { .srw__row { grid-template-columns: auto minmax(0, 1fr) auto; } }

.srw__spine { position: absolute; left: 6px; top: 16px; bottom: 16px; width: 3px; border-radius: 2px; background: var(--mi-fill4); overflow: hidden; }
.srw__spine span { display: block; height: 100%; background: var(--mi-p); transform-origin: bottom; transition: transform var(--mi-dur-4) var(--mi-spring); }

.srw__glyph { display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--mi-radius-m); background: var(--mi-fill3); color: var(--mi-label2); }
.srw__glyph[data-kind="issue"] { background: color-mix(in srgb, var(--mi-green) 14%, transparent); color: var(--mi-green-t); }
.srw__glyph[data-kind="code"] { background: var(--mi-p-tint); color: var(--mi-p-text); }

.srw__body { display: grid; gap: 2px; min-width: 0; }
.srw__link { font-size: 15px; font-weight: 600; color: var(--mi-label); text-decoration: none; overflow-wrap: anywhere; }
.srw__link:hover { color: var(--mi-p-text); }
.srw__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; border-radius: 4px; }
.srw__snippet { margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--mi-label2); overflow-wrap: anywhere; }

.srw__meta { grid-column: 2; display: flex; align-items: center; gap: 10px; }
@container (min-width: 560px) { .srw__meta { grid-column: auto; flex-direction: column; align-items: flex-end; gap: 6px; } }
</style>
