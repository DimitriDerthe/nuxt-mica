<template>
  <section class="aaw mi:@container mi:grid mi:h-175 mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="aaw-title">
    <div class="aaw__in mi:grid mi:grid-rows-[minmax(0,_1fr)] mi:h-full mi:min-h-0 mi:@[860px]:grid-cols-[236px_minmax(0,_1fr)]">
    <aside class="aaw__rail mi:hidden mi:@[860px]:grid mi:@[860px]:content-start mi:@[860px]:gap-1.5 mi:@[860px]:py-4 mi:@[860px]:px-3 mi:@[860px]:border-r mi:@[860px]:border-r-sep mi:@[860px]:[background:var(--mi-card)]" aria-label="Threads">
      <MiButton variant="tinted" block size="small" @click="newThread">
        <template #leading><MiIcon name="plus" :size="16" /></template>
        New analysis
      </MiButton>
      <MiText as="h3" variant="caption" weight="semibold" tone="label3" class="aaw__rail-label">This week</MiText>
      <ul class="aaw__threads mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="t in threads" :key="t.id">
          <button type="button" class="aaw__thread mi:grid mi:gap-0.5 mi:w-full mi:py-2 mi:px-2.5 mi:[border:0] mi:rounded-[10px] mi:[background:transparent] mi:text-label mi:[font:inherit] mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-on': t.id === activeThread }" :aria-current="t.id === activeThread ? 'true' : undefined" @click="activeThread = t.id">
            <span class="aaw__thread-title mi:text-[13px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ t.title }}</span>
            <span class="aaw__thread-meta mi:text-[11px] mi:text-label2">{{ t.meta }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <div class="aaw__main mi:grid mi:grid-rows-[auto_minmax(0,_1fr)_auto] mi:min-w-0 mi:min-h-0">
      <header class="aaw__head mi:flex mi:items-center mi:justify-between mi:gap-2.5 mi:py-3 mi:px-4 mi:border-b mi:border-b-sep">
        <div class="aaw__head-text mi:min-w-0">
          <MiText id="aaw-title" as="h2" variant="headline" weight="semibold" :lines="1">Checkout drop on Tuesday</MiText>
          <MiText variant="caption" tone="label2">Relay analyst · read-only access to orders_eu</MiText>
        </div>
        <MiBadge tone="secondary" label="Sources cited" dot />
      </header>

      <MiMessageScroller class="aaw__log" label="Conversation" :busy="thinking">
        <MiMessageScrollerItem v-for="m in messages" :key="m.id" :message-id="m.id" :scroll-anchor="m.role === 'user'">
          <div v-if="m.role === 'user'" class="aaw__user mi:max-w-190 mi:mx-auto mi:box-border mi:grid mi:justify-items-end mi:gap-2 mi:pt-4 mi:px-4 mi:pb-1">
            <MiAttachmentGroup v-if="m.files.length" class="aaw__user-files mi:max-w-full">
              <MiAttachment v-for="f in m.files" :key="f.name" :name="f.name" :file-size="f.size" :type="f.type" size="sm" :removable="false" />
            </MiAttachmentGroup>
            <MiBubble align="end">{{ m.text }}</MiBubble>
          </div>
          <article v-else class="aaw__bot mi:max-w-190 mi:mx-auto mi:box-border mi:grid mi:grid-cols-[28px_minmax(0,_1fr)] mi:gap-3 mi:p-4">
            <span class="aaw__bot-mark mi:w-7 mi:h-7 mi:rounded-[9px] mi:[background:conic-gradient(from_140deg,_var(--mi-p),_var(--mi-s),_var(--mi-p))] mi:shadow-[inset_0_0_0_6px_color-mix(in_srgb,_var(--mi-page)_55%,_transparent)]" aria-hidden="true" />
            <div class="aaw__bot-body mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:min-w-0">
              <MiTrace :steps="m.trace" label="How Relay worked this out" class="aaw__trace" />
              <MiText v-if="m.text" variant="body" class="aaw__answer">{{ m.text }}</MiText>
              <ul v-if="m.findings.length" class="aaw__findings mi:grid mi:grid-cols-[repeat(auto-fit,_minmax(min(150px,_100%),_1fr))] mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
                <li class="mi:[.aaw__findings_li&]:gap-0.5 mi:[.aaw__findings_li&]:p-3 mi:[.aaw__findings_li&]:rounded-lg mi:[.aaw__findings_li&]:shadow-[0_0_0_1px_var(--mi-sep)]" v-for="f in m.findings" :key="f.label">
                  <span class="aaw__finding-val mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums mi:[.aaw__findings_li:first-child_&]:text-p-text">{{ f.value }}</span>
                  <MiText class="mi:[.aaw__findings_li&]:gap-0.5 mi:[.aaw__findings_li&]:p-3 mi:[.aaw__findings_li&]:rounded-lg mi:[.aaw__findings_li&]:shadow-[0_0_0_1px_var(--mi-sep)]" as="span" variant="footnote" tone="label2">{{ f.label }}</MiText>
                </li>
              </ul>
              <MiCodeBlock v-if="m.code" :code="m.code" filename="tuesday_dropoff.sql" size="sm" />
            </div>
          </article>
        </MiMessageScrollerItem>
      </MiMessageScroller>

      <form class="aaw__composer mi:grid mi:gap-2 mi:w-[calc(100%_-_24px)] mi:max-w-190 mi:box-border mi:mt-1 mi:mx-auto mi:mb-3 mi:p-2.5 mi:rounded-[20px] mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)]" @submit.prevent="send">
        <MiAttachmentGroup v-if="pending.length" class="aaw__pending mi:max-w-full">
          <MiAttachment
            v-for="(f, i) in pending" :key="f.name" :name="f.name" :file-size="f.size" :type="f.type" size="sm"
            :state="f.uploading ? 'uploading' : 'done'" @remove="pending.splice(i, 1)"
          />
        </MiAttachmentGroup>
        <MiTextarea v-model="draft" :rows="2" :max-rows="6" aria-label="Ask Relay" placeholder="Ask a follow-up, e.g. Which payment method failed most?" class="aaw__input" @keydown.enter.exact.prevent="send" />
        <div class="aaw__tools mi:flex mi:items-center mi:gap-2">
          <MiIconButton label="Attach a sample file" variant="gray" size="regular" @click="attach"><MiIcon :svg="clip" :size="18" /></MiIconButton>
          <MiNativeSelect v-model="model" size="sm" :options="models" aria-label="Model" class="aaw__model" />
          <div class="aaw__ctx mi:grid mi:justify-items-end mi:gap-[3px] mi:ml-auto mi:min-w-0" role="meter" aria-label="Context used" :aria-valuenow="ctxUsed" aria-valuemin="0" :aria-valuemax="ctxMax" :aria-valuetext="`${fmtK(ctxUsed)} of ${fmtK(ctxMax)} tokens`">
            <span class="aaw__ctx-track mi:block mi:w-18 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden"><span class="mi:[.aaw__ctx-track_&]:h-full mi:[.aaw__ctx-track_&]:origin-left mi:[.aaw__ctx-track_&]:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :style="{ transform: `scaleX(${Math.min(1, ctxUsed / ctxMax)})` }" :class="{ 'is-high': ctxUsed / ctxMax > 0.75 }" /></span>
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
.aaw__rail-label { margin: 14px 8px 2px; text-transform: uppercase; letter-spacing: .06em; }
.aaw__thread:hover { background: var(--mi-fill4); }
.aaw__thread.is-on { background: var(--mi-p-tint); }
.aaw__log { min-height: 0; }
.aaw__answer { line-height: 1.55; }
.aaw__findings li { display: grid; background: var(--mi-card); }
.aaw__input :deep(textarea) { background: transparent; }
.aaw__model { width: auto; max-width: 140px; }
.aaw__ctx-track span { display: block; background: var(--mi-p); }
.aaw__ctx-track span.is-high { background: var(--mi-orange); }
</style>
