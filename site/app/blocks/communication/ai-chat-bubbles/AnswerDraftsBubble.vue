<template>
  <section class="ad" aria-labelledby="ad-title">
    <h2 id="ad-title" class="ad__sr">Assistant answer with drafts</h2>
    <div class="ad__thread">
      <MiMessage align="end" label="You" class="ad__user">
        <MiBubble align="end" variant="secondary" class="ad__bub">Why does our orders query get slow after 9am every weekday? EXPLAIN output attached.</MiBubble>
        <template #footer>
          <span class="ad__att"><MiIcon name="document" :size="14" />explain-orders.txt · 4 KB</span>
        </template>
      </MiMessage>

      <article class="ad__answer" aria-labelledby="ad-answer-label" :aria-busy="loading ? 'true' : undefined">
        <header class="ad__who">
          <span class="ad__mark" aria-hidden="true"><MiIcon :svg="icons.spark" :size="16" /></span>
          <MiText id="ad-answer-label" variant="subheadline" weight="semibold">Assistant</MiText>
          <!-- Draft pager: regenerating keeps earlier drafts instead of replacing them. -->
          <div class="ad__pager" role="group" aria-label="Drafts">
            <MiIconButton label="Previous draft" variant="plain" size="small" :disabled="index === 0 || loading" @click="index--"><MiIcon name="chevron-left" :size="14" /></MiIconButton>
            <span class="ad__pager-n" aria-live="polite">{{ index + 1 }} / {{ drafts.length }}</span>
            <MiIconButton label="Next draft" variant="plain" size="small" :disabled="index === drafts.length - 1 || loading" @click="index++"><MiIcon name="chevron-right" :size="14" /></MiIconButton>
          </div>
        </header>

        <Transition name="ad-swap" mode="out-in">
          <div v-if="loading" key="loading" class="ad__body">
            <MiTrace :steps="[{ title: 'Re-reading the EXPLAIN plan', status: 'running' }]" label="Progress" />
            <MiSkeleton variant="text" :lines="['92%', '84%', '60%']" label="Writing a new draft" />
          </div>
          <div v-else :key="index" class="ad__body">
            <MiTrace :steps="draft.trace" label="How this draft was made" />
            <p v-for="(p, i) in draft.paras" :key="i" class="ad__p">{{ p }}</p>
            <MiCodeBlock size="sm" class="ad__code">
              <MiCodeBlockHeader>
                <MiCodeBlockTitle>{{ draft.file }}</MiCodeBlockTitle>
                <MiCodeBlockActions><MiCodeBlockCopyButton :value="draft.lines.filter(l => l.v !== 'removed').map(l => l.t).join('\n')" /></MiCodeBlockActions>
              </MiCodeBlockHeader>
              <MiCodeBlockContent>
                <MiCodeBlockLine v-for="(l, i) in draft.lines" :key="i" :variant="l.v">{{ l.t }}</MiCodeBlockLine>
              </MiCodeBlockContent>
            </MiCodeBlock>
            <p class="ad__p ad__p--muted">{{ draft.note }}</p>
          </div>
        </Transition>

        <footer class="ad__actions">
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
          <div v-if="vote === 'down'" class="ad__why" role="group" aria-label="What went wrong">
            <MiText variant="caption" tone="label2">What missed the mark?</MiText>
            <div class="ad__chips">
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
.ad { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.ad__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.ad__thread { display: flex; flex-direction: column; gap: 18px; max-width: 720px; margin-inline: auto; }
.ad__user { max-width: min(88%, 30rem); margin-inline-start: auto; }
.ad .ad__bub { max-width: 100%; }
.ad__att { display: inline-flex; align-items: center; gap: 4px; }

.ad__answer { position: relative; display: grid; gap: 12px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 560px) { .ad__answer { padding: 20px 22px; } }
/* Brand hairline down the left edge marks the assistant voice. */
.ad__answer::before { content: ""; position: absolute; left: 0; top: 20px; bottom: 20px; width: 3px; border-radius: 0 3px 3px 0; background: linear-gradient(var(--mi-p), var(--mi-s)); }
.ad__who { display: flex; align-items: center; gap: 8px; }
.ad__who > :nth-child(2) { flex: 1; }
.ad__mark { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(140deg, var(--mi-p), var(--mi-s)); color: var(--mi-p-on); }
.ad__pager { display: flex; align-items: center; gap: 2px; padding: 2px; border-radius: 999px; background: var(--mi-fill4); }
.ad__pager-n { min-width: 38px; font-size: 12px; font-weight: 600; text-align: center; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

.ad__body { display: grid; gap: 12px; min-width: 0; }
.ad__p { margin: 0; font-size: 15px; line-height: 1.6; overflow-wrap: anywhere; }
.ad__p--muted { font-size: 13.5px; color: var(--mi-label2); }
.ad__code { min-width: 0; }

.ad__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding-top: 8px; border-top: 1px solid var(--mi-sep); }
.ad__actions > :last-child { margin-inline-start: auto; }
.ad__why { display: grid; gap: 8px; padding: 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.ad__chips { display: flex; flex-wrap: wrap; gap: 6px; }

.ad-swap-enter-active, .ad-swap-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.ad-swap-enter-from { opacity: 0; transform: translateY(6px); }
.ad-swap-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
