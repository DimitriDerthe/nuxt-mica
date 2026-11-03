<template>
  <section class="ad mi:@container mi:font-mi mi:text-label" aria-labelledby="ad-title">
    <h2 id="ad-title" class="ad__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Assistant answer with drafts</h2>
    <div class="ad__thread mi:flex mi:flex-col mi:gap-4.5 mi:max-w-180 mi:mx-auto">
      <MiMessage align="end" label="You" class="ad__user mi:ms-auto">
        <MiBubble align="end" variant="secondary" class="ad__bub">Why does our orders query get slow after 9am every weekday? EXPLAIN output attached.</MiBubble>
        <template #footer>
          <span class="ad__att mi:inline-flex mi:items-center mi:gap-1"><MiIcon name="document" :size="14" />explain-orders.txt · 4 KB</span>
        </template>
      </MiMessage>

      <article class="ad__answer mi:relative mi:grid mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:py-5 mi:@[560px]:px-5.5 mi:before:content-[''] mi:before:absolute mi:before:left-0 mi:before:top-5 mi:before:bottom-5 mi:before:w-[3px] mi:before:rounded-[0_3px_3px_0] mi:before:[background:linear-gradient(var(--mi-p),_var(--mi-s))]" aria-labelledby="ad-answer-label" :aria-busy="loading ? 'true' : undefined">
        <header class="ad__who mi:flex mi:items-center mi:gap-2">
          <span class="ad__mark mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[8px] mi:[background:linear-gradient(140deg,_var(--mi-p),_var(--mi-s))] mi:text-p-on" aria-hidden="true"><MiIcon :svg="icons.spark" :size="16" /></span>
          <MiText id="ad-answer-label" variant="subheadline" weight="semibold">Assistant</MiText>
          <!-- Draft pager: regenerating keeps earlier drafts instead of replacing them. -->
          <div class="ad__pager mi:flex mi:items-center mi:gap-0.5 mi:p-0.5 mi:rounded-[999px] mi:[background:var(--mi-fill4)]" role="group" aria-label="Drafts">
            <MiIconButton label="Previous draft" variant="plain" size="small" :disabled="index === 0 || loading" @click="index--"><MiIcon name="chevron-left" :size="14" /></MiIconButton>
            <span class="ad__pager-n mi:min-w-9.5 mi:text-[12px] mi:font-semibold mi:text-center mi:text-label2 mi:tabular-nums" aria-live="polite">{{ index + 1 }} / {{ drafts.length }}</span>
            <MiIconButton label="Next draft" variant="plain" size="small" :disabled="index === drafts.length - 1 || loading" @click="index++"><MiIcon name="chevron-right" :size="14" /></MiIconButton>
          </div>
        </header>

        <Transition name="ad-swap" mode="out-in">
          <div v-if="loading" key="loading" class="ad__body mi:grid mi:gap-3 mi:min-w-0">
            <MiTrace :steps="[{ title: 'Re-reading the EXPLAIN plan', status: 'running' }]" label="Progress" />
            <MiSkeleton variant="text" :lines="['92%', '84%', '60%']" label="Writing a new draft" />
          </div>
          <div v-else :key="index" class="ad__body mi:grid mi:gap-3 mi:min-w-0">
            <MiTrace :steps="draft.trace" label="How this draft was made" />
            <p v-for="(p, i) in draft.paras" :key="i" class="ad__p mi:m-0 mi:leading-[1.6] mi:wrap-anywhere">{{ p }}</p>
            <MiCodeBlock size="sm" class="ad__code mi:min-w-0">
              <MiCodeBlockHeader>
                <MiCodeBlockTitle>{{ draft.file }}</MiCodeBlockTitle>
                <MiCodeBlockActions><MiCodeBlockCopyButton :value="draft.lines.filter(l => l.v !== 'removed').map(l => l.t).join('\n')" /></MiCodeBlockActions>
              </MiCodeBlockHeader>
              <MiCodeBlockContent>
                <MiCodeBlockLine v-for="(l, i) in draft.lines" :key="i" :variant="l.v">{{ l.t }}</MiCodeBlockLine>
              </MiCodeBlockContent>
            </MiCodeBlock>
            <p class="ad__p ad__p--muted mi:m-0 mi:leading-[1.6] mi:wrap-anywhere mi:text-label2">{{ draft.note }}</p>
          </div>
        </Transition>

        <footer class="ad__actions mi:flex mi:flex-wrap mi:items-center mi:gap-1 mi:pt-2 mi:border-t mi:border-t-sep">
          <MiCopyButton :value="draft.paras.join('\n\n')" icon-only variant="ghost" label="Copy answer" />
          <MiToggle :pressed="vote === 'up'" size="sm" label="Good answer" @update:pressed="vote = $event ? 'up' : null">
            <MiIcon :svg="icons.up" :size="16" :filled="vote === 'up'" />
          </MiToggle>
          <MiToggle :pressed="vote === 'down'" size="sm" label="Bad answer" @update:pressed="vote = $event ? 'down' : null">
            <MiIcon :svg="icons.down" :size="16" :filled="vote === 'down'" />
          </MiToggle>
          <MiButton variant="plain" size="small" :disabled="loading || drafts.length >= pool.length" @click="regenerate">
            <template #leading><MiIcon :svg="icons.redo" :size="15" /></template>
            {{ drafts.length >= pool.length ? 'No more drafts' : 'Try another approach' }}
          </MiButton>
        </footer>

        <Transition name="ad-swap">
          <div v-if="vote === 'down'" class="ad__why mi:grid mi:gap-2 mi:p-3 mi:rounded-md mi:[background:var(--mi-fill4)]" role="group" aria-label="What went wrong">
            <MiText variant="caption" tone="label2">What missed the mark?</MiText>
            <div class="ad__chips mi:flex mi:flex-wrap mi:gap-1.5">
              <MiChip v-for="r in reasons" :key="r" v-model="why[r]" selectable size="small" tone="neutral" :label="r" />
            </div>
          </div>
        </Transition>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'

type LineVariant = 'default' | 'highlighted' | 'added' | 'removed'
interface Draft { trace: { title: string, description?: string, duration?: number, detail?: string }[], paras: string[], file: string, lines: { t: string, v: LineVariant }[], note: string }

const icons = {
  spark: '<path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5z"/>',
  up: '<path d="M7.5 10.5v9h-3v-9h3zm0 0 4-7a2 2 0 0 1 2.6 2.3l-.8 3.7h5.4a2 2 0 0 1 2 2.4l-1.3 6.4a2 2 0 0 1-2 1.7H7.5"/>',
  down: '<path d="M16.5 13.5v-9h3v9h-3zm0 0-4 7a2 2 0 0 1-2.6-2.3l.8-3.7H5.3a2 2 0 0 1-2-2.4l1.3-6.4a2 2 0 0 1 2-1.7h9.9"/>',
  redo: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4.5V11h-6.5"/>'
}

// Three prepared drafts stand in for the model; swap for your streaming API.
const pool: Draft[] = [
  {
    trace: [
      { title: 'Read EXPLAIN output', description: 'Seq Scan on orders, 2.1M rows', duration: 900 },
      { title: 'Compared with the 9am traffic pattern', duration: 1400, detail: 'The dashboard refresh job runs at 09:00 and filters by status and created_at.' }
    ],
    paras: [
      'The planner falls back to a sequential scan on orders because no index covers both columns in your filter. At 9am the dashboard refresh hits the same query hundreds of times, so every scan competes for I/O.',
      'A composite index on (status, created_at) turns it into an index range scan:'
    ],
    file: 'migrations/0042_orders_status_created.sql',
    lines: [
      { t: '-- before: filter on status, then sort', v: 'default' },
      { t: 'CREATE INDEX orders_status_idx ON orders (status);', v: 'removed' },
      { t: 'CREATE INDEX CONCURRENTLY orders_status_created_idx', v: 'added' },
      { t: '  ON orders (status, created_at DESC);', v: 'added' }
    ],
    note: 'CONCURRENTLY avoids locking writes; expect about 4 minutes on 2.1M rows.'
  },
  {
    trace: [{ title: 'Checked table bloat', description: 'n_dead_tup 38%', duration: 1100 }],
    paras: [
      'Another reading: autovacuum is falling behind on orders overnight, so by 9am 38% of the tuples are dead and every scan reads them anyway.',
      'Tuning autovacuum for this one table keeps it lean without touching the query:'
    ],
    file: 'migrations/0042_orders_autovacuum.sql',
    lines: [
      { t: 'ALTER TABLE orders SET (', v: 'default' },
      { t: '  autovacuum_vacuum_scale_factor = 0.02,', v: 'highlighted' },
      { t: '  autovacuum_vacuum_cost_limit = 2000', v: 'highlighted' },
      { t: ');', v: 'default' }
    ],
    note: 'Pair it with the index from draft 1 if the dashboard still drags.'
  },
  {
    trace: [{ title: 'Looked at the refresh job', description: 'cron 0 9 * * 1-5', duration: 700 }],
    paras: [
      'If the dashboard does not need live numbers, move the aggregate into a materialized view and refresh it every five minutes instead of on every page load.'
    ],
    file: 'views/orders_daily.sql',
    lines: [
      { t: 'CREATE MATERIALIZED VIEW orders_daily AS', v: 'added' },
      { t: '  SELECT status, date_trunc(\'hour\', created_at) AS h, count(*)', v: 'added' },
      { t: '  FROM orders GROUP BY 1, 2;', v: 'added' }
    ],
    note: 'Refresh with REFRESH MATERIALIZED VIEW CONCURRENTLY after adding a unique index.'
  }
]

const drafts = ref<Draft[]>([pool[0]!])
const index = ref(0)
const loading = ref(false)
const vote = ref<'up' | 'down' | null>(null)
const reasons = ['Wrong cause', 'Too long', 'Unsafe change']
const why = reactive<Record<string, boolean>>({})
let timer: ReturnType<typeof setTimeout> | undefined

const draft = computed(() => drafts.value[index.value] ?? pool[0]!)

function regenerate() {
  const next = pool[drafts.value.length]
  if (!next) return
  loading.value = true
  vote.value = null
  timer = setTimeout(() => {
    drafts.value.push(next)
    index.value = drafts.value.length - 1
    loading.value = false
  }, 1300)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.ad__user { max-width: min(88%, 30rem); }
.ad .ad__bub { max-width: 100%; }
.ad__who > :nth-child(2) { flex: 1; }
.ad__p { font-size: 15px; }
.ad__p--muted { font-size: 13.5px; }
.ad__actions > :last-child { margin-inline-start: auto; }

.ad-swap-enter-active, .ad-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ad-swap-enter-from { opacity: 0; transform: translateY(6px); }
.ad-swap-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
