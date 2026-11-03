<template>
  <section class="aaw" aria-labelledby="aaw-title">
    <div class="aaw__in">
    <aside class="aaw__rail" aria-label="Threads">
      <MiButton variant="tinted" block size="small" @click="newThread">
        <template #leading><MiIcon name="plus" :size="16" /></template>
        New analysis
      </MiButton>
      <MiText as="h3" variant="caption" weight="semibold" tone="label3" class="aaw__rail-label">This week</MiText>
      <ul class="aaw__threads">
        <li v-for="t in threads" :key="t.id">
          <button type="button" class="aaw__thread" :class="{ 'is-on': t.id === activeThread }" :aria-current="t.id === activeThread ? 'true' : undefined" @click="activeThread = t.id">
            <span class="aaw__thread-title">{{ t.title }}</span>
            <span class="aaw__thread-meta">{{ t.meta }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <div class="aaw__main">
      <header class="aaw__head">
        <div class="aaw__head-text">
          <MiText id="aaw-title" as="h2" variant="headline" weight="semibold" :lines="1">Checkout drop on Tuesday</MiText>
          <MiText variant="caption" tone="label2">Relay analyst · read-only access to orders_eu</MiText>
        </div>
        <MiBadge tone="secondary" label="Sources cited" dot />
      </header>

      <MiMessageScroller class="aaw__log" label="Conversation" :busy="thinking">
        <MiMessageScrollerItem v-for="m in messages" :key="m.id" :message-id="m.id" :scroll-anchor="m.role === 'user'">
          <div v-if="m.role === 'user'" class="aaw__user">
            <MiAttachmentGroup v-if="m.files.length" class="aaw__user-files">
              <MiAttachment v-for="f in m.files" :key="f.name" :name="f.name" :file-size="f.size" :type="f.type" size="sm" :removable="false" />
            </MiAttachmentGroup>
            <MiBubble align="end">{{ m.text }}</MiBubble>
          </div>
          <article v-else class="aaw__bot">
            <span class="aaw__bot-mark" aria-hidden="true" />
            <div class="aaw__bot-body">
              <MiTrace :steps="m.trace" label="How Relay worked this out" class="aaw__trace" />
              <MiText v-if="m.text" variant="body" class="aaw__answer">{{ m.text }}</MiText>
              <ul v-if="m.findings.length" class="aaw__findings">
                <li v-for="f in m.findings" :key="f.label">
                  <span class="aaw__finding-val">{{ f.value }}</span>
                  <MiText as="span" variant="footnote" tone="label2">{{ f.label }}</MiText>
                </li>
              </ul>
              <MiCodeBlock v-if="m.code" :code="m.code" filename="tuesday_dropoff.sql" size="sm" />
            </div>
          </article>
        </MiMessageScrollerItem>
      </MiMessageScroller>

      <form class="aaw__composer" @submit.prevent="send">
        <MiAttachmentGroup v-if="pending.length" class="aaw__pending">
          <MiAttachment
            v-for="(f, i) in pending" :key="f.name" :name="f.name" :file-size="f.size" :type="f.type" size="sm"
            :state="f.uploading ? 'uploading' : 'done'" @remove="pending.splice(i, 1)"
          />
        </MiAttachmentGroup>
        <MiTextarea v-model="draft" :rows="2" :max-rows="6" aria-label="Ask Relay" placeholder="Ask a follow-up, e.g. Which payment method failed most?" class="aaw__input" @keydown.enter.exact.prevent="send" />
        <div class="aaw__tools">
          <MiIconButton label="Attach a sample file" variant="gray" size="regular" @click="attach"><MiIcon :svg="clip" :size="18" /></MiIconButton>
          <MiNativeSelect v-model="model" size="sm" :options="models" aria-label="Model" class="aaw__model" />
          <div class="aaw__ctx" role="meter" aria-label="Context used" :aria-valuenow="ctxUsed" aria-valuemin="0" :aria-valuemax="ctxMax" :aria-valuetext="`${fmtK(ctxUsed)} of ${fmtK(ctxMax)} tokens`">
            <span class="aaw__ctx-track"><span :style="{ transform: `scaleX(${Math.min(1, ctxUsed / ctxMax)})` }" :class="{ 'is-high': ctxUsed / ctxMax > 0.75 }" /></span>
            <MiText as="span" variant="caption2" tone="label2" tabular>{{ fmtK(ctxUsed) }} / {{ fmtK(ctxMax) }}</MiText>
          </div>
          <MiIconButton type="submit" label="Send" :disabled="!draft.trim() || thinking" size="regular"><MiIcon name="arrow-up" :size="18" :weight="2.4" /></MiIconButton>
        </div>
      </form>
    </div>
    </div>
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

interface Doc { name: string, size: number, type: string, tokens: number, uploading?: boolean }
interface Step { id?: string, title: string, description?: string, status?: 'done' | 'running' | 'error' | 'pending', duration?: number, detail?: string }
interface Msg { id: string, role: 'user' | 'assistant', text: string, files: Doc[], trace: Step[], findings: { label: string, value: string }[], code?: string }

const clip = '<path d="m20 11.5-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/>'
const models = [{ value: 'deep', label: 'Relay Deep' }, { value: 'fast', label: 'Relay Fast' }]
const threads = [
  { id: 't1', title: 'Checkout drop on Tuesday', meta: 'Now · 2 files' },
  { id: 't2', title: 'Refund rate by carrier', meta: 'Mon · 5 queries' },
  { id: 't3', title: 'Q4 promo cannibalisation', meta: 'Sun · draft' }
]
const activeThread = ref('t1')

const sql = `SELECT payment_method,
       count(*) FILTER (WHERE status = 'failed') AS failed,
       round(100.0 * count(*) FILTER (WHERE status = 'failed') / count(*), 1) AS fail_pct
FROM checkout_attempts
WHERE created_at::date = '2024-11-05'
GROUP BY 1
ORDER BY fail_pct DESC;`

const messages = ref<Msg[]>([
  {
    id: 'm1', role: 'user', text: 'Conversion fell on Tuesday the 5th. Use the export and tell me why.', trace: [], findings: [],
    files: [{ name: 'checkout_attempts_nov.csv', size: 4_812_000, type: 'text/csv', tokens: 0 }]
  },
  {
    id: 'm2', role: 'assistant', files: [],
    trace: [
      { title: 'Read checkout_attempts_nov.csv', description: '48,214 rows', duration: 1300 },
      { title: 'Compared Tue 5 with the four previous Tuesdays', description: 'SQL', duration: 2100, detail: 'Baseline conversion 3.42%, Tue 5 conversion 2.61%.' },
      { title: 'Split failures by payment method', description: '3 methods', duration: 900 }
    ],
    text: 'The drop is almost entirely card payments between 14:00 and 17:30. 3-D Secure challenges timed out after the issuer update, while wallet payments held steady.',
    findings: [{ label: 'card failure rate, vs 2.1% usual', value: '11.8%' }, { label: 'orders lost in the window', value: '≈ 214' }, { label: 'wallets, unchanged', value: '1.9%' }],
    code: sql
  }
])

const draft = ref('')
const model = ref<string | number | null>('deep')
const thinking = ref(false)
const pending = ref<Doc[]>([{ name: 'issuer_status_log.txt', size: 38_400, type: 'text/plain', tokens: 9_600 }])
const extras = [
  { name: 'support_tickets_tue.csv', size: 220_000, type: 'text/csv', tokens: 31_000 },
  { name: 'checkout_screenshot.png', size: 640_000, type: 'image/png', tokens: 1_600 }
]

// Context budget: thread history + attachments waiting to send + the draft itself.
const ctxMax = computed(() => (model.value === 'fast' ? 64_000 : 200_000))
const ctxUsed = computed(() => 41_200 + messages.value.length * 900 + pending.value.reduce((n, f) => n + f.tokens, 0) + Math.round(draft.value.length / 4))
const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k` : String(n))

let seq = 3
function attach() {
  const next = extras.find(e => !pending.value.some(p => p.name === e.name))
  if (!next) return
  const file = { ...next, uploading: true }
  pending.value.push(file)
  later(() => { const f = pending.value.find(p => p.name === file.name); if (f) f.uploading = false }, 900)
}
function send() {
  const text = draft.value.trim()
  if (!text || thinking.value) return
  messages.value.push({ id: 'm' + seq++, role: 'user', text, files: pending.value.map(f => ({ ...f, uploading: false })), trace: [], findings: [] })
  draft.value = ''
  pending.value = []
  const id = 'm' + seq++
  messages.value.push({ id, role: 'assistant', text: '', files: [], findings: [], trace: [{ title: 'Planning the query', status: 'running' }] })
  thinking.value = true
  later(() => {
    const m = messages.value.find(x => x.id === id)
    if (m) {
      m.trace = [{ title: 'Planned the query', duration: 600 }, { title: 'Grouped failures by issuer and hour', description: 'SQL', duration: 1400 }]
      m.text = 'Two issuers account for 83% of the failed card attempts, both from 14:05 onward. I drafted an incident note for the payments channel; want me to include the hourly chart?'
    }
    thinking.value = false
  }, 1500)
}
function newThread() { activeThread.value = 't1'; draft.value = '' }
</script>

<style scoped>
.aaw { container-type: inline-size; display: grid; height: 700px; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.aaw__in { display: grid; grid-template-rows: minmax(0, 1fr); height: 100%; min-height: 0; }
.aaw__rail { display: none; }
@container (min-width: 860px) {
  .aaw__in { grid-template-columns: 236px minmax(0, 1fr); }
  .aaw__rail { display: grid; align-content: start; gap: 6px; padding: 16px 12px; border-right: 1px solid var(--mi-sep); background: var(--mi-card); }
}
.aaw__rail-label { margin: 14px 8px 2px; text-transform: uppercase; letter-spacing: .06em; }
.aaw__threads { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.aaw__thread { display: grid; gap: 2px; width: 100%; padding: 8px 10px; border: 0; border-radius: 10px; background: transparent; color: var(--mi-label); font: inherit; text-align: start; cursor: pointer; }
.aaw__thread:hover { background: var(--mi-fill4); }
.aaw__thread:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.aaw__thread.is-on { background: var(--mi-p-tint); }
.aaw__thread-title { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.aaw__thread-meta { font-size: 11px; color: var(--mi-label2); }

.aaw__main { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; min-width: 0; min-height: 0; }
.aaw__head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--mi-sep); }
.aaw__head-text { min-width: 0; }
.aaw__log { min-height: 0; }

.aaw__user, .aaw__bot { max-width: 760px; margin-inline: auto; box-sizing: border-box; }
.aaw__user { display: grid; justify-items: end; gap: 8px; padding: 16px 16px 4px; }
.aaw__user-files { max-width: 100%; }
.aaw__bot { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; padding: 16px; }
.aaw__bot-mark { width: 28px; height: 28px; border-radius: 9px; background: conic-gradient(from 140deg, var(--mi-p), var(--mi-s), var(--mi-p)); box-shadow: inset 0 0 0 6px color-mix(in srgb, var(--mi-page) 55%, transparent); }
/* Explicit flexible column: an implicit one grows to the code block's min-content and pushes the cards out. */
.aaw__bot-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; min-width: 0; }
.aaw__answer { line-height: 1.55; }
.aaw__findings { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr)); gap: 8px; margin: 0; padding: 0; list-style: none; }
.aaw__findings li { display: grid; gap: 2px; padding: 12px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.aaw__finding-val { font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.aaw__findings li:first-child .aaw__finding-val { color: var(--mi-p-text); }

.aaw__composer { display: grid; gap: 8px; width: calc(100% - 24px); max-width: 760px; box-sizing: border-box; margin: 4px auto 12px; padding: 10px; border-radius: 20px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); }
.aaw__pending { max-width: 100%; }
.aaw__input :deep(textarea) { background: transparent; }
.aaw__tools { display: flex; align-items: center; gap: 8px; }
.aaw__model { width: auto; max-width: 140px; }
.aaw__ctx { display: grid; justify-items: end; gap: 3px; margin-left: auto; min-width: 0; }
.aaw__ctx-track { display: block; width: 72px; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.aaw__ctx-track span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.aaw__ctx-track span.is-high { background: var(--mi-orange); }
</style>
